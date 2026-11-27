import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { parseAuthCallbackFragment, authCallbackFragment } from '@/lib/auth/callback-url';
import { isAllowedPostOrigin } from '@/lib/auth/origin';
import { rateLimitKey } from '@/lib/auth/rate-limit';
import { isTestSecret, verifyTurnstile } from '@/lib/auth/turnstile';
import { callbackSchema, passwordSchema, signupSchema } from '@/lib/auth/validation';
import { resetPublicEnvCache } from '@/lib/env';
import { resetServerEnvCache } from '@/lib/env.server';
import { locales, t } from '@/lib/i18n';
import { resetMail, verifyMail, welcomeMail } from '@/lib/mail/templates';

// Clé secrète de test publique documentée par Cloudflare (jamais un secret réel).
const TEST_SECRET = '1x0000000000000000000000000000000AA';
const REAL_SECRET = 'turnstile-secret-not-a-test-key';

function jsonResponse(payload: Record<string, unknown>): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

function fetchReturning(payload: Record<string, unknown>): typeof fetch {
  return vi.fn(async () => jsonResponse(payload)) as unknown as typeof fetch;
}

const validSignup = {
  nom: 'Maria Silva',
  email: 'maria@example.test',
  password: 'PalavraPass12',
  locale: 'pt',
  turnstileToken: 'e2e-turnstile-token',
  terms: true,
};

describe('validation des parcours auth', () => {
  it('ignore un rôle envoyé par le client', () => {
    const parsed = signupSchema.safeParse({ ...validSignup, role: 'admin', verified: true });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).not.toHaveProperty('role');
      expect(parsed.data).not.toHaveProperty('verified');
    }
  });

  it('refuse un mot de passe faible et une confirmation différente', () => {
    expect(signupSchema.safeParse({ ...validSignup, password: 'curto' }).success).toBe(false);
    expect(
      passwordSchema.safeParse({
        password: 'PalavraPass12',
        passwordConfirm: 'OutraPass12',
        locale: 'pt',
      }).success,
    ).toBe(false);
  });

  it(' borne le type du lien de vérification', () => {
    expect(
      callbackSchema.safeParse({
        token_hash: 'abc123def456', // gitleaks:allow
        type: 'signup',
        locale: 'pt',
      }) // gitleaks:allow
      .success,
    ).toBe(true);
    expect(
      callbackSchema.safeParse({
        token_hash: 'abc123def456', // gitleaks:allow
        type: 'magiclink',
        locale: 'pt',
      }).success,
    ).toBe(false);
  });
});

describe('fragment du lien de vérification', () => {
  it('transporte le jeton sans le mettre dans le chemin', () => {
    const fragment = authCallbackFragment('abc123def456', 'recovery');
    const parsed = parseAuthCallbackFragment(`#${fragment}`);
    expect(parsed).toEqual({ tokenHash: 'abc123def456', type: 'recovery' }); // gitleaks:allow
    expect(fragment).not.toContain('/');
  });

  it('rejette un type inconnu ou un jeton court', () => {
    expect(parseAuthCallbackFragment('#token_hash=abc&type=signup')).toBeNull();
    expect(parseAuthCallbackFragment('#token_hash=abcdefghijk&type=magiclink')).toBeNull();
  });
});

describe('limitation de débit', () => {
  beforeEach(() => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key-de-test');
    vi.stubEnv('AUTH_RATE_LIMIT_SECRET', 'hmac-secret-de-test');
    resetServerEnvCache();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetServerEnvCache();
  });

  it('opacifie les identifiants et reste déterministe', () => {
    const first = rateLimitKey('signup', '1.2.3.4');
    expect(first).toBe(rateLimitKey('signup', '1.2.3.4'));
    expect(first).not.toContain('1.2.3.4');
    expect(rateLimitKey('signup', 'maria@example.test')).not.toContain('maria');
    expect(rateLimitKey('signup', '1.2.3.4')).not.toBe(rateLimitKey('reset', '1.2.3.4'));
  });
});

describe('origine des POST', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('refuse une origine absente ou étrangère', () => {
    const url = 'http://localhost:4319/api/auth/signin';
    expect(isAllowedPostOrigin(new Request(url, { method: 'POST' }))).toBe(false);
    expect(
      isAllowedPostOrigin(
        new Request(url, { method: 'POST', headers: { Origin: 'https://externe.example' } }),
      ),
    ).toBe(false);
  });

  it('accepte la même origine en développement', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(
      isAllowedPostOrigin(
        new Request('http://localhost:4319/api/auth/signin', {
          method: 'POST',
          headers: { Origin: 'http://localhost:4319' },
        }),
      ),
    ).toBe(true);
  });
});

describe('Turnstile (vérification serveur)', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('TURNSTILE_SECRET_KEY', TEST_SECRET);
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'a'.repeat(40));
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key-de-test');
    resetPublicEnvCache();
    resetServerEnvCache();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetPublicEnvCache();
    resetServerEnvCache();
  });

  const ok = {
    success: true,
    hostname: 'example.com',
    action: 'signup',
    challenge_ts: new Date().toISOString(),
  };
  // Réponse type des clés de test : ni `action` ni `hostname` (docs Cloudflare).
  const okTest = { success: true, challenge_ts: new Date().toISOString() };

  it('rejette success:false et un jeton expiré', async () => {
    await expect(
      verifyTurnstile('token-abcdefghijkl', 'signup', {
        fetchImpl: fetchReturning({ ...ok, success: false }),
        memory: new Map(),
      }),
    ).rejects.toThrow();
    await expect(
      verifyTurnstile('token-abcdefghijkl', 'signup', {
        fetchImpl: fetchReturning({
          ...ok,
          challenge_ts: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        }),
        memory: new Map(),
      }),
    ).rejects.toThrow();
  });

  it('accepte la réponse simplifiée d’une clé de test, mais refuse un jeton déjà utilisé', async () => {
    await expect(
      verifyTurnstile('XXXX.DUMMY.TOKEN.XXXX', 'signup', {
        fetchImpl: fetchReturning(okTest),
        memory: new Map(),
      }),
    ).resolves.toBeUndefined();
    await expect(
      verifyTurnstile('XXXX.DUMMY.TOKEN.XXXX', 'signup', {
        fetchImpl: fetchReturning({
          ...okTest,
          success: false,
          'error-codes': ['timeout-or-duplicate'],
        }),
        memory: new Map(),
      }),
    ).rejects.toThrow();
  });

  it('rejette une action différente avec une vraie clé', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', REAL_SECRET);
    resetServerEnvCache();
    await expect(
      verifyTurnstile('token-abcdefghijkl', 'signup', {
        fetchImpl: fetchReturning({ ...ok, action: 'reset' }),
        memory: new Map(),
      }),
    ).rejects.toThrow();
  });

  it('rejette le rejeu du même jeton avec une vraie clé', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', REAL_SECRET);
    resetServerEnvCache();
    const memory = new Map<string, number>();
    const options = { fetchImpl: fetchReturning(ok), memory };
    await expect(verifyTurnstile('token-abcdefghijkl', 'signup', options)).resolves.toBeUndefined();
    await expect(verifyTurnstile('token-abcdefghijkl', 'signup', options)).rejects.toThrow();
  });

  it('refuse une famille de test en production', async () => {
    expect(isTestSecret(TEST_SECRET)).toBe(true);
    vi.stubEnv('NODE_ENV', 'production');
    resetServerEnvCache();
    await expect(
      verifyTurnstile('token-abcdefghijkl', 'signup', {
        fetchImpl: fetchReturning(ok),
        memory: new Map(),
      }),
    ).rejects.toThrow();
  });

  it('exige le hostname canonique et un secret en production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('TURNSTILE_SECRET_KEY', REAL_SECRET);
    resetServerEnvCache();
    await expect(
      verifyTurnstile('token-abcdefghijkl', 'signup', {
        fetchImpl: fetchReturning({ ...ok, hostname: 'externe.example' }),
        memory: new Map(),
      }),
    ).rejects.toThrow();
    await expect(
      verifyTurnstile('token-abcdefghijkl', 'signup', {
        fetchImpl: fetchReturning(ok),
        memory: new Map(),
      }),
    ).resolves.toBeUndefined();
  });
});

describe('gabarits d’emails', () => {
  it('fournit lien, durée et signature dans les trois langues', () => {
    for (const locale of locales) {
      const verify = verifyMail(locale, 'https://example.com/lien');
      const reset = resetMail(locale, 'https://example.com/lien');
      const welcome = welcomeMail(locale);
      expect(verify.body).toContain('https://example.com/lien');
      expect(verify.body).toContain('30');
      expect(reset.body).toContain('https://example.com/lien');
      expect(welcome.body).toContain(t(locale, 'auth.signup.benefit1'));
      expect(welcome.body).toContain(t(locale, 'email.signature'));
    }
  });
});
