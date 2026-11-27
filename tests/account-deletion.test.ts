import { describe, expect, it } from 'vitest';

import { normalizeStoragePath } from '@/lib/account/data';
import { confirmPhraseMatches, DELETE_CONFIRM_PHRASE } from '@/lib/account/delete-phrase';
import { t, locales } from '@/lib/i18n';
import { accountDeleteSchema } from '@/lib/auth/validation';

describe('suppression de compte (P3.4)', () => {
  it('ignore tout identifiant, rôle ou phrase attendus envoyés par le client', () => {
    const parsed = accountDeleteSchema.safeParse({
      password: 'PalavraPass12',
      confirmPhrase: 'EFFACER MON COMPTE',
      uid: '00000000-0000-0000-0000-000000000000',
      role: 'admin',
      expectedPhrase: 'AUTRE PHRASE',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(Object.keys(parsed.data).sort()).toEqual(['confirmPhrase', 'password']);
    }
  });

  it('refuse une phrase vide ou trop longue', () => {
    expect(
      accountDeleteSchema.safeParse({ password: 'PalavraPass12', confirmPhrase: '' }).success,
    ).toBe(false);
    expect(
      accountDeleteSchema.safeParse({ password: 'PalavraPass12', confirmPhrase: 'x'.repeat(65) })
        .success,
    ).toBe(false);
  });

  it('compare la phrase exacte, sans correspondance partielle', () => {
    for (const locale of locales) {
      const phrase = DELETE_CONFIRM_PHRASE[locale];
      expect(confirmPhraseMatches(locale, phrase)).toBe(true);
      expect(confirmPhraseMatches(locale, `  ${phrase.toLowerCase()}  `)).toBe(true);
      expect(confirmPhraseMatches(locale, phrase.slice(0, -1))).toBe(false);
      expect(confirmPhraseMatches(locale, `X${phrase}`)).toBe(false);
    }
  });

  it('garde la constante serveur et le catalogue i18n identiques', () => {
    for (const locale of locales) {
      expect(t(locale, 'auth.account.delete.confirmPhrase.value')).toBe(
        DELETE_CONFIRM_PHRASE[locale],
      );
    }
  });

  it('extrait uniquement les chemins du bucket privé et du projet autorisé', () => {
    const uid = '11111111-1111-1111-1111-111111111111';
    const origin = 'https://project.supabase.co';
    expect(normalizeStoragePath(`users/${uid}/photo.webp`, origin)).toBe(`users/${uid}/photo.webp`);
    expect(
      normalizeStoragePath(
        `${origin}/storage/v1/object/public/cultura-media/acteurs/x/photo.webp`,
        origin,
      ),
    ).toBe('acteurs/x/photo.webp');
    expect(
      normalizeStoragePath(
        `${origin}/storage/v1/object/sign/cultura-media/events/y/image.webp?token=abc`,
        origin,
      ),
    ).toBe('events/y/image.webp');
    expect(normalizeStoragePath('cultura-media/annonces/z/image.webp', origin)).toBe(
      'annonces/z/image.webp',
    );

    // Un hôte tiers ne peut pas faire supprimer un objet du bucket du projet.
    expect(
      normalizeStoragePath(
        `https://hote-tier.test/storage/v1/object/public/cultura-media/users/${uid}/photo.webp`,
        origin,
      ),
    ).toBeNull();
    expect(
      normalizeStoragePath(
        `${origin}/storage/v1/object/public/cultura-media/users/${uid}/photo.webp`,
      ),
    ).toBeNull();
    expect(normalizeStoragePath('https://exemple.test/image.webp', origin)).toBeNull();
    expect(normalizeStoragePath('users/../../secret.webp', origin)).toBeNull();
    expect(normalizeStoragePath('/etc/passwd', origin)).toBeNull();
  });
});
