import { describe, expect, it } from 'vitest';

import { parsePublicEnv, publicEnvSchema } from '@/lib/env';

const valid = {
  NEXT_PUBLIC_SITE_URL: 'https://cultura.ao',
  NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'a'.repeat(40),
};

describe('parsePublicEnv', () => {
  it('accepte un jeu minimal valide', () => {
    const env = parsePublicEnv(valid);
    expect(env.NEXT_PUBLIC_SITE_URL).toBe('https://cultura.ao');
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toHaveLength(40);
  });

  it('applique les valeurs par défaut', () => {
    const env = parsePublicEnv(valid);
    expect(env.NEXT_PUBLIC_APP_TARGET).toBe('web');
    expect(env.NEXT_PUBLIC_DEFAULT_LOCALE).toBe('pt');
  });

  it('refuse une cible de build inconnue', () => {
    expect(() => parsePublicEnv({ ...valid, NEXT_PUBLIC_APP_TARGET: 'desktop' })).toThrow(
      /NEXT_PUBLIC_APP_TARGET/,
    );
  });

  it('refuse une locale non supportée', () => {
    expect(() => parsePublicEnv({ ...valid, NEXT_PUBLIC_DEFAULT_LOCALE: 'es' })).toThrow(
      /NEXT_PUBLIC_DEFAULT_LOCALE/,
    );
  });

  it('refuse une URL relative', () => {
    expect(() => parsePublicEnv({ ...valid, NEXT_PUBLIC_SITE_URL: '/accueil' })).toThrow(
      /NEXT_PUBLIC_SITE_URL/,
    );
  });

  it('refuse un protocole non http', () => {
    expect(() => parsePublicEnv({ ...valid, NEXT_PUBLIC_SITE_URL: 'javascript:alert(1)' })).toThrow(
      /NEXT_PUBLIC_SITE_URL/,
    );
  });

  it('refuse une clé anon trop courte', () => {
    expect(() => parsePublicEnv({ ...valid, NEXT_PUBLIC_SUPABASE_ANON_KEY: 'court' })).toThrow(
      /NEXT_PUBLIC_SUPABASE_ANON_KEY/,
    );
  });

  it("ne divulgue jamais la valeur d'une variable dans le message d'erreur", () => {
    const secretLooking = 'sk-secret-court';
    let message = '';
    try {
      parsePublicEnv({ ...valid, NEXT_PUBLIC_SUPABASE_ANON_KEY: secretLooking });
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    expect(message).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    expect(message).not.toContain(secretLooking);
  });

  it('signale plusieurs variables manquantes en une fois', () => {
    expect(() => parsePublicEnv({})).toThrow(/NEXT_PUBLIC_SITE_URL.*NEXT_PUBLIC_SUPABASE_URL/s);
  });

  it('accepte http en local', () => {
    const env = parsePublicEnv({ ...valid, NEXT_PUBLIC_SITE_URL: 'http://localhost:3000' });
    expect(env.NEXT_PUBLIC_SITE_URL).toBe('http://localhost:3000');
  });

  it("expose le schéma pour la validation d'outillage", () => {
    expect(publicEnvSchema.safeParse(valid).success).toBe(true);
  });
});
