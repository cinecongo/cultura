import 'server-only';

import { createHash } from 'node:crypto';

import { getServerEnv } from '@/lib/env.server';
import { siteUrl } from '@/lib/seo';
import type { TurnstileAction } from './validation';

export type { TurnstileAction } from './validation';

const MAX_AGE_MS = 5 * 60 * 1000;
const seen = new Map<string, number>();

export class TurnstileError extends Error {
  constructor() {
    super('La vérification de sécurité n’a pas abouti.');
    this.name = 'TurnstileError';
  }
}

/**
 * Familles de clés secrètes de test Cloudflare (1x = succès, 2x = échec,
 * 3x = jeton déjà utilisé). Elles ne sont jamais autorisées en production.
 */
export function isTestSecret(secret: string): boolean {
  return /^[0-3]x0{4}/.test(secret);
}

function isReplay(token: string, now: () => number, memory: Map<string, number>): boolean {
  const key = createHash('sha256').update(token).digest('hex');
  const current = now();
  for (const [hash, at] of memory) {
    if (current - at > MAX_AGE_MS) memory.delete(hash);
  }
  if (memory.has(key)) return true;
  memory.set(key, current);
  return false;
}

type SiteVerifyResponse = {
  readonly success?: unknown;
  readonly hostname?: unknown;
  readonly challenge_ts?: unknown;
  readonly action?: unknown;
  readonly 'error-codes'?: unknown;
};

export type VerifyTurnstileOptions = {
  /** Injection de test : la vérification réelle utilise `fetch`. */
  readonly fetchImpl?: typeof fetch;
  readonly now?: () => number;
  readonly memory?: Map<string, number>;
};

/**
 * Vérification exclusivement serveur. Les clés de test publiques autorisent
 * l'e2e en développement ; en production elles sont refusées (échec fermé).
 */
export async function verifyTurnstile(
  token: string,
  action: TurnstileAction,
  options: VerifyTurnstileOptions = {},
): Promise<void> {
  const secret = getServerEnv().TURNSTILE_SECRET_KEY;
  if (!secret) throw new TurnstileError();

  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = isTestSecret(secret);
  if (isProduction && isTest) throw new TurnstileError();

  if (typeof token !== 'string' || token.length < 10 || token.length > 2048) {
    throw new TurnstileError();
  }
  // Le jeton fictif est identique à chaque soumission en e2e : la protection
  // contre le rejeu est assurée par Cloudflare (famille 3x) et par la mémoire
  // locale uniquement avec une vraie clé.
  if (!isTest && isReplay(token, options.now ?? Date.now, options.memory ?? seen)) {
    throw new TurnstileError();
  }

  const doFetch = options.fetchImpl ?? fetch;
  let response: Response;
  try {
    response = await doFetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new TurnstileError();
  }

  if (!response.ok) throw new TurnstileError();

  let payload: SiteVerifyResponse;
  try {
    payload = (await response.json()) as SiteVerifyResponse;
  } catch {
    throw new TurnstileError();
  }

  if (payload.success !== true) throw new TurnstileError();

  const codes = Array.isArray(payload['error-codes']) ? payload['error-codes'] : [];
  if (codes.includes('timeout-or-duplicate')) throw new TurnstileError();

  // Documentation Cloudflare : avec une clé secrète de test, `siteverify`
  // n'inclut ni `action` ni `hostname` (il renvoie toujours `example.com`).
  // Ces contrôles restent obligatoires avec une vraie clé, en production.
  if (!isTest) {
    if (payload.action !== action) throw new TurnstileError();
    if (isProduction && payload.hostname !== siteUrl().hostname) throw new TurnstileError();
  }

  if (typeof payload.challenge_ts !== 'string') throw new TurnstileError();
  const at = Date.parse(payload.challenge_ts);
  const current = (options.now ?? Date.now)();
  if (!Number.isFinite(at) || Math.abs(current - at) > MAX_AGE_MS) {
    throw new TurnstileError();
  }
}
