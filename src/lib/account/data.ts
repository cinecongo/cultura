import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import { AuthError } from '@/lib/auth/errors';
import { getPublicEnv } from '@/lib/env';
import { rateLimitKey } from '@/lib/auth/rate-limit';
import type { Database } from '@/lib/supabase/types';

type AccountAdmin = SupabaseClient<Database, 'public'>;
type Row = Record<string, unknown>;

const BUCKET = 'cultura-media';
const EMAIL_SCOPES = ['signup', 'signin', 'reset', 'resend'] as const;

function unwrap<T>(result: { data: T | null; error: unknown }): T {
  if (result.error || result.data === null) {
    throw new AuthError(400, 'auth.error.generic');
  }
  return result.data;
}

function dedupeById<T extends { id: string }>(rows: readonly T[]): T[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    if (seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  });
}

function idsOf(rows: readonly { id: string }[]): string[] {
  return rows.map((row) => row.id);
}

/**
 * Chemins d'objets capturés dans les colonnes, jamais par listing du bucket.
 *
 * `allowedOrigin` est obligatoire : une URL absolue n'est acceptée que si son
 * hôte est celui du projet Supabase. Sans lui, aucune URL absolue n'est traitée.
 */
export function normalizeStoragePath(value: string, allowedOrigin?: string): string | null {
  let raw = value.trim();
  if (!raw || raw.startsWith('/') || raw.startsWith('\\')) return null;

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      if (!allowedOrigin || url.origin !== allowedOrigin) return null;
      const marker = '/object/';
      const index = url.pathname.indexOf(marker);
      if (index === -1) return null;
      const parts = url.pathname
        .slice(index + marker.length)
        .split('/')
        .filter(Boolean);
      if (parts[0] === 'public' || parts[0] === 'sign') {
        if (parts[1] !== BUCKET) return null;
        raw = parts.slice(2).join('/');
      } else if (parts[0] === BUCKET) {
        raw = parts.slice(1).join('/');
      } else {
        return null;
      }
    } catch {
      return null;
    }
  } else if (raw.startsWith(`${BUCKET}/`)) {
    raw = raw.slice(BUCKET.length + 1);
  }

  try {
    raw = decodeURIComponent(raw);
  } catch {
    return null;
  }
  raw = raw.replace(/^\/+/, '');
  if (!raw || raw.length > 500 || raw.includes('..') || raw.includes('\\') || raw.includes('?')) {
    return null;
  }
  return raw;
}

function stringsFromJson(value: unknown, into: string[], depth = 0): void {
  if (depth > 4 || value === null) return;
  if (typeof value === 'string') {
    into.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) stringsFromJson(item, into, depth + 1);
    return;
  }
  if (typeof value === 'object') {
    for (const item of Object.values(value as Record<string, unknown>)) {
      stringsFromJson(item, into, depth + 1);
    }
  }
}

function pathsFromCandidates(candidates: readonly unknown[], allowedOrigin: string): string[] {
  const values: string[] = [];
  for (const candidate of candidates) stringsFromJson(candidate, values);
  const paths = values
    .map((value) => normalizeStoragePath(value, allowedOrigin))
    .filter((path): path is string => path !== null);
  return [...new Set(paths)];
}

/**
 * Export complet du compte : profil, fiches possédées ou créées, contenus,
 * interactions, villes suivies, revendications, signalements et demandes de
 * retrait. Aucun secret, jeton ou mot de passe n'est inclus.
 */
export async function collectAccountData(
  admin: AccountAdmin,
  userId: string,
  email: string,
): Promise<Record<string, unknown>> {
  const profile = unwrap(
    await admin
      .from('users')
      .select('id, nom, email, role, langue_preferee, photo, created_at')
      .eq('id', userId)
      .maybeSingle(),
  );

  const owned = unwrap(await admin.from('acteurs_culturels').select('*').eq('user_id', userId));
  const created = unwrap(await admin.from('acteurs_culturels').select('*').eq('cree_par', userId));
  const fiches = dedupeById([...owned, ...created] as { id: string }[]);
  const ficheIds = idsOf(fiches);

  const annonces = ficheIds.length
    ? unwrap(await admin.from('annonces').select('*').in('acteur_id', ficheIds))
    : [];
  const events = ficheIds.length
    ? unwrap(await admin.from('events').select('*').in('acteur_id', ficheIds))
    : [];
  const annonceIds = idsOf(annonces as { id: string }[]);
  const eventIds = idsOf(events as { id: string }[]);

  const interactions: Record<string, Row[]> = {};
  for (const table of ['likes', 'favorites', 'views', 'shares', 'signalements'] as const) {
    const byUser = unwrap(await admin.from(table).select('*').eq('user_id', userId));
    const byAnnonce = annonceIds.length
      ? unwrap(await admin.from(table).select('*').in('annonce_id', annonceIds))
      : [];
    const byEvent = eventIds.length
      ? unwrap(await admin.from(table).select('*').in('event_id', eventIds))
      : [];
    interactions[table] = dedupeById([...byUser, ...byAnnonce, ...byEvent] as {
      id: string;
    }[]) as Row[];
  }

  const villes = unwrap(await admin.from('villes_suivies').select('*').eq('user_id', userId));
  const revendications = [
    ...unwrap(await admin.from('revendications_fiches').select('*').eq('user_id', userId)),
    ...unwrap(await admin.from('revendications_fiches').select('*').eq('traite_par', userId)),
  ];
  // Égalité stricte du contact : une sous-chaîne exporterait les données d'un
  // tiers dont l'adresse contient celle du compte. Les IDs polymorphes sont
  // toujours filtrés par leur type, sinon un tiers pourrait être inclus.
  const demandes = [
    ...unwrap(await admin.from('demandes_retrait').select('*').eq('contact', email)),
    ...(ficheIds.length
      ? unwrap(
          await admin
            .from('demandes_retrait')
            .select('*')
            .eq('content_type', 'acteur')
            .in('content_id', ficheIds),
        )
      : []),
    ...(annonceIds.length
      ? unwrap(
          await admin
            .from('demandes_retrait')
            .select('*')
            .eq('content_type', 'annonce')
            .in('content_id', annonceIds),
        )
      : []),
    ...(eventIds.length
      ? unwrap(
          await admin
            .from('demandes_retrait')
            .select('*')
            .eq('content_type', 'event')
            .in('content_id', eventIds),
        )
      : []),
  ];

  return {
    exportedAt: new Date().toISOString(),
    profile,
    fiches,
    annoncesCulturelles: annonces,
    evenements: events,
    interactions,
    villesSuivies: villes,
    revendications: dedupeById(revendications as { id: string }[]),
    demandesRetrait: dedupeById(demandes as { id: string }[]),
  };
}

/** Chemins exacts à supprimer du bucket privé avant la suppression SQL. */
export async function collectStoragePaths(
  admin: AccountAdmin,
  userId: string,
  email: string,
): Promise<string[]> {
  const data = await collectAccountData(admin, userId, email);
  const { NEXT_PUBLIC_SUPABASE_URL } = getPublicEnv();
  const allowedOrigin = new URL(NEXT_PUBLIC_SUPABASE_URL).origin;
  return pathsFromCandidates(
    [
      (data.profile as Row).photo,
      ...(data.fiches as Row[]).flatMap((fiche) => [fiche.photo, fiche.liens]),
      ...(data.annoncesCulturelles as Row[]).flatMap((annonce) => [annonce.image, annonce.donnees]),
      ...(data.evenements as Row[]).map((event) => event.image),
    ],
    allowedOrigin,
  );
}

export async function removeStorageObjects(admin: AccountAdmin, paths: readonly string[]) {
  if (paths.length === 0) return;
  const { error } = await admin.storage.from(BUCKET).remove([...paths]);
  if (error) throw new AuthError(400, 'auth.error.generic');
}

/** Clés HMAC dérivées du compte : jamais d'IP ni d'email en clair dans la table. */
export async function purgeAccountRateLimits(
  admin: AccountAdmin,
  profile: { readonly id: string; readonly email: string },
) {
  const keys = [
    ...EMAIL_SCOPES.map((scope) => rateLimitKey(scope, profile.email)),
    rateLimitKey('password', profile.id),
    rateLimitKey('accountExport', profile.id),
    rateLimitKey('accountDelete', profile.id),
  ];
  const { error } = await admin.from('auth_rate_limits').delete().in('key', keys);
  if (error) throw new AuthError(400, 'auth.error.generic');
}
