import 'server-only';

import { notFound } from 'next/navigation';
import { z } from 'zod';

import { isLocale, type Locale } from '@/lib/i18n/locale';
import { segmentsFor } from '@/lib/platform/routes';

import { AuthError } from './errors';
import { currentProfile, type Role, type SessionProfile } from './session';

/**
 * Décision d'accès aux espaces protégés (P3.2).
 *
 * Le rôle n'est jamais lu dans un cookie, un jeton ou une métadonnée : il est
 * relu dans `public.users` par `currentProfile()`. Les contrôles sont
 * rejoués côté page ET côté handler, conformément au contrat Next 16 (le
 * proxy ne fait que des vérifications optimistes).
 */
export const ROLE_SPACES = ['actorSpace', 'adminSpace'] as const;
export type RoleSpace = (typeof ROLE_SPACES)[number];

/** Jetons de l'API : stables, courts et indépendants des segments localisés. */
export const ROLE_SPACE_TOKENS = { actor: 'actorSpace', admin: 'adminSpace' } as const;
export const roleSpaceTokenSchema = z.enum(['actor', 'admin']);
export type RoleSpaceToken = z.infer<typeof roleSpaceTokenSchema>;

export function roleSpaceFromToken(token: RoleSpaceToken): RoleSpace {
  return ROLE_SPACE_TOKENS[token];
}

/**
 * Matrice explicite : pas de rang numérique global. L'éditeurisé a les droits
 * éditoriaux de l'équipe Cultura et peut entrer dans l'espace acteur, mais
 * l'espace d'administration reste réservé à l'administrateur.
 */
const ALLOWED_ROLES: Readonly<Record<RoleSpace, readonly Role[]>> = {
  actorSpace: ['acteur', 'editeur', 'admin'],
  adminSpace: ['admin'],
};

export function canAccessSpace(role: Role | null, space: RoleSpace): boolean {
  return role !== null && ALLOWED_ROLES[space].includes(role);
}

/** Réponse publique générique : ni le rôle, ni l'email, ni le motif exact. */
export function spaceAccessError(role: Role | null): AuthError {
  return new AuthError(role ? 403 : 401, 'auth.error.generic');
}

/** Vérification d'un handler : le jeton est validé avant toute lecture. */
export async function assertApiSpaceAccess(token: RoleSpaceToken): Promise<void> {
  const profile = await currentProfile();
  const role = profile?.role ?? null;
  if (!canAccessSpace(role, roleSpaceFromToken(token))) {
    throw spaceAccessError(role);
  }
}

/** Valide la langue et le segment exact d'une page protégée. */
export function guardSpaceLocale(rawLocale: string, rawSegment: string, space: RoleSpace): Locale {
  if (!isLocale(rawLocale) || segmentsFor(rawLocale)[space] !== rawSegment) notFound();
  return rawLocale;
}

export type SpaceDecision =
  | { readonly kind: 'allowed'; readonly locale: Locale; readonly profile: SessionProfile }
  | { readonly kind: 'forbidden'; readonly locale: Locale }
  | { readonly kind: 'anonymous'; readonly locale: Locale };

export async function decideSpaceAccess(locale: Locale, space: RoleSpace): Promise<SpaceDecision> {
  const profile = await currentProfile();
  if (!profile) return { kind: 'anonymous', locale };
  if (!canAccessSpace(profile.role, space)) return { kind: 'forbidden', locale };
  return { kind: 'allowed', locale, profile };
}
