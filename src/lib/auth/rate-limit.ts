import 'server-only';

import { createHmac } from 'node:crypto';

import type { SupabaseClient } from '@supabase/supabase-js';

import { getServerEnv } from '@/lib/env.server';
import type { Database } from '@/lib/supabase/types';
import { authAdminClient } from './clients';
import { AuthError } from './errors';

export type RateLimitScope = 'signup' | 'signin' | 'reset' | 'resend' | 'password' | 'callback';

/**
 * Clé de fenêtre opacifiée par HMAC : ni IP ni email en clair dans la table.
 * La clé de service_role sert de repli au secret dédié, sans jamais être
 * journalisée ni sérialisée.
 */
export function rateLimitKey(scope: RateLimitScope, identifier: string): string {
  const env = getServerEnv();
  const secret = env.AUTH_RATE_LIMIT_SECRET ?? env.SUPABASE_SERVICE_ROLE_KEY;
  return createHmac('sha256', secret)
    .update(`${scope}:${identifier.trim().toLowerCase()}`)
    .digest('hex');
}

/** Adresse IP d'origine : le proxy la fournit, jamais le client de navigation. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const first = forwarded?.split(',')[0]?.trim();
  return first && first.length <= 64 ? first : 'unknown';
}

type RateClient = SupabaseClient<Database, 'public'>;

/**
 * Consomme une tentative. Retourne `false` si la fenêtre est pleine ; une
 * erreur RPC fait échouer la requête (échec fermé, aucun contournement).
 */
export async function consumeRateLimit(
  scope: RateLimitScope,
  identifier: string,
  max: number,
  windowSeconds: number,
  client: RateClient = authAdminClient(),
): Promise<boolean> {
  const { data, error } = await client.rpc('cultura_auth_rate_limit', {
    p_key: rateLimitKey(scope, identifier),
    p_max: max,
    p_window_seconds: windowSeconds,
  });
  if (error) throw new AuthError(400, 'auth.error.generic');
  return data === true;
}
