import { z } from 'zod';

import type { StringKey } from '@/lib/i18n';

import { mobileSupabase } from './mobile-client.native';

/**
 * Opérations de session mobile — ADR-008 §4.
 *
 * Aucun message technique de Supabase n'est exposé : l'interface reçoit
 * uniquement une clé i18n. La session n'est jamais tenue pour valide d'après
 * le seul jeton local : `getUser()` interroge Supabase à chaque vérification.
 */

export type MobileAuthIssue = 'credentials' | 'unverified' | 'rate_limited' | 'offline' | 'generic';

export type MobileAuthResult =
  { readonly ok: true } | { readonly ok: false; readonly issue: MobileAuthIssue };

export type MobileUser = { readonly email: string };

const emailSchema = z.email().max(254);

function issueFor(error: unknown): MobileAuthIssue {
  if (typeof error !== 'object' || error === null) return 'generic';

  const code = 'code' in error && typeof error.code === 'string' ? error.code : '';
  const status = 'status' in error && typeof error.status === 'number' ? error.status : 0;
  const name = 'name' in error && typeof error.name === 'string' ? error.name : '';

  if (status === 429 || code === 'too_many_requests') return 'rate_limited';
  if (code === 'email_not_confirmed') return 'unverified';
  if (code === 'invalid_credentials' || status === 401) return 'credentials';
  if (status === 0 || name.includes('Fetch')) return 'offline';
  return 'generic';
}

export async function mobileSignIn(email: string, password: string): Promise<MobileAuthResult> {
  try {
    const { error } = await mobileSupabase().auth.signInWithPassword({ email, password });
    if (error) return { ok: false, issue: issueFor(error) };
    return { ok: true };
  } catch (error) {
    return { ok: false, issue: issueFor(error) };
  }
}

/** Utilisateur vérifié auprès de Supabase ; `null` si la session est absente ou invalide. */
export async function mobileCurrentUser(): Promise<MobileUser | null> {
  try {
    const { data, error } = await mobileSupabase().auth.getUser();
    if (error || !data.user) return null;
    const email = emailSchema.safeParse(data.user.email);
    return email.success ? { email: email.data } : null;
  } catch {
    return null;
  }
}

export async function mobileSignOut(): Promise<void> {
  try {
    await mobileSupabase().auth.signOut({ scope: 'local' });
  } catch {
    // La déconnexion locale reste effective même si le réseau est absent :
    // le jeton est retiré du stockage sécurisé par le client Supabase.
  }
}

export const MOBILE_ISSUE_KEYS: Record<Exclude<MobileAuthIssue, 'rate_limited'>, StringKey> = {
  credentials: 'auth.signin.error.credentials',
  unverified: 'auth.signin.error.unverified',
  offline: 'auth.error.offline',
  generic: 'auth.error.generic',
};
