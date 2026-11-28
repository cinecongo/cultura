import { beforeEach, describe, expect, it, vi } from 'vitest';

import { en } from '@/lib/i18n/messages/en';
import { fr } from '@/lib/i18n/messages/fr';
import { pt } from '@/lib/i18n/messages/pt';

const auth = vi.hoisted(() => ({
  signInWithPassword: vi.fn(async () => ({ error: null as unknown })),
  getUser: vi.fn(async () => ({ data: { user: null as unknown }, error: null as unknown })),
  signOut: vi.fn(async () => ({ error: null as unknown })),
}));

vi.mock('@/lib/auth/mobile-client.native', () => ({
  mobileSupabase: () => ({ auth }),
}));

import {
  MOBILE_ISSUE_KEYS,
  mobileCurrentUser,
  mobileSignIn,
  mobileSignOut,
} from '@/lib/auth/mobile-session.native';

describe('session mobile — traduction des erreurs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('convertit un 429 en limitation traduite, sans exposer le message technique', async () => {
    auth.signInWithPassword.mockResolvedValueOnce({
      error: {
        status: 429,
        code: 'over_request_rate_limit',
        message: 'jeton-technique-ne-pas-afficher',
      },
    });
    await expect(mobileSignIn('compte@example.test', 'mot-de-passe')).resolves.toEqual({
      ok: false,
      issue: 'rate_limited',
    });
    expect(MOBILE_ISSUE_KEYS).not.toHaveProperty('rate_limited');
  });

  it('distingue identifiants, compte non confirmé, hors ligne et erreur générique', async () => {
    auth.signInWithPassword
      .mockResolvedValueOnce({ error: { status: 400, code: 'invalid_credentials' } })
      .mockResolvedValueOnce({ error: { status: 400, code: 'email_not_confirmed' } })
      .mockRejectedValueOnce({ name: 'FetchError' })
      .mockResolvedValueOnce({ error: { status: 500, code: 'unexpected_failure' } });

    await expect(mobileSignIn('a@example.test', 'x')).resolves.toEqual({
      ok: false,
      issue: 'credentials',
    });
    await expect(mobileSignIn('a@example.test', 'x')).resolves.toEqual({
      ok: false,
      issue: 'unverified',
    });
    await expect(mobileSignIn('a@example.test', 'x')).resolves.toEqual({
      ok: false,
      issue: 'offline',
    });
    await expect(mobileSignIn('a@example.test', 'x')).resolves.toEqual({
      ok: false,
      issue: 'generic',
    });
  });

  it('ne valide la session qu’après getUser() et déconnecte localement', async () => {
    auth.getUser.mockResolvedValueOnce({
      data: { user: { email: 'compte@example.test' } },
      error: null,
    });
    await expect(mobileCurrentUser()).resolves.toEqual({ email: 'compte@example.test' });
    expect(auth.getUser).toHaveBeenCalledOnce();

    auth.getUser.mockResolvedValueOnce({
      data: { user: { email: 'compte@example.test' } },
      error: { status: 401 },
    });
    await expect(mobileCurrentUser()).resolves.toBeNull();

    await mobileSignOut();
    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
  });

  it('fournit une clé i18n existante dans les trois langues pour chaque erreur', () => {
    for (const key of Object.values(MOBILE_ISSUE_KEYS)) {
      expect(pt).toHaveProperty(key);
      expect(fr).toHaveProperty(key);
      expect(en).toHaveProperty(key);
    }
  });
});
