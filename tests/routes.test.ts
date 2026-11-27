import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { isValidSlug, localeFromPath, routePath, segmentsFor } from '@/lib/platform/routes';
import { locales } from '@/lib/i18n/locale';

describe('routePath', () => {
  it('préfixe toujours la langue', () => {
    expect(routePath('pt', { name: 'today' })).toBe('/pt');
    expect(routePath('fr', { name: 'today' })).toBe('/fr');
    expect(routePath('en', { name: 'week' })).toBe('/en/week');
  });

  it('place « Aujourd’hui » à la racine de la langue', () => {
    for (const locale of locales) {
      expect(routePath(locale, { name: 'today' })).toBe(`/${locale}`);
    }
  });

  it('localise les segments', () => {
    expect(routePath('pt', { name: 'actors' })).toBe('/pt/atores');
    expect(routePath('fr', { name: 'actors' })).toBe('/fr/acteurs');
    expect(routePath('en', { name: 'cities' })).toBe('/en/cities');
  });

  it('construit les fiches et les événements', () => {
    expect(routePath('pt', { name: 'event', slug: 'noite-de-jazz' })).toBe(
      '/pt/evento/noite-de-jazz',
    );
    expect(routePath('fr', { name: 'actor', slug: 'telma-lee' })).toBe('/fr/acteur/telma-lee');
    expect(routePath('en', { name: 'event', slug: 'jazz-night' })).toBe('/en/event/jazz-night');
  });

  it('ne produit jamais de slash final', () => {
    for (const locale of locales) {
      for (const name of ['today', 'week', 'actors', 'cities', 'search'] as const) {
        expect(routePath(locale, { name }).endsWith('/')).toBe(false);
      }
    }
  });

  it('refuse un slug dangereux', () => {
    expect(() => routePath('pt', { name: 'event', slug: '../admin' })).toThrow(/Slug invalide/);
    expect(() => routePath('pt', { name: 'event', slug: 'Nom Avec Espaces' })).toThrow();
    expect(() => routePath('pt', { name: 'event', slug: 'a'.repeat(121) })).toThrow();
  });

  it('accepte les slugs légitimes', () => {
    expect(isValidSlug('noite-de-jazz-2026')).toBe(true);
    expect(isValidSlug('x')).toBe(true);
    expect(isValidSlug('-debut')).toBe(false);
    expect(isValidSlug('fin-')).toBe(false);
    expect(isValidSlug('double--tiret')).toBe(false);
  });
});

describe('segmentsFor', () => {
  it('fournit tous les segments pour chaque langue', () => {
    for (const locale of locales) {
      const table = segmentsFor(locale);
      for (const key of [
        'today',
        'week',
        'actors',
        'cities',
        'search',
        'event',
        'actor',
      ] as const) {
        expect(table[key], `${locale}.${key}`).toBeTypeOf('string');
      }
    }
  });

  it("n'utilise que des caractères sûrs dans les URLs", () => {
    for (const locale of locales) {
      for (const value of Object.values(segmentsFor(locale))) {
        expect(value).toMatch(/^[a-z]*$/);
      }
    }
  });

  it('fournit un fichier de page pour chaque écran d’authentification localisé', () => {
    const screens = ['signup', 'signin', 'verify', 'reset', 'password', 'account'] as const;
    for (const locale of locales) {
      for (const screen of screens) {
        const segment = segmentsFor(locale)[screen];
        const file = join(
          process.cwd(),
          'src',
          'app',
          '(localized)',
          '[locale]',
          '(auth)',
          segment,
          'page.web.tsx',
        );
        expect(existsSync(file), `${locale}.${screen} → /${locale}/${segment}`).toBe(true);
      }
    }
  });

  it('localise les deux espaces protégés sans chemin en dur', () => {
    expect(routePath('pt', { name: 'actorSpace' })).toBe('/pt/espacoagente');
    expect(routePath('pt', { name: 'adminSpace' })).toBe('/pt/espacoadmin');
    expect(routePath('fr', { name: 'actorSpace' })).toBe('/fr/espaceacteur');
    expect(routePath('fr', { name: 'adminSpace' })).toBe('/fr/espaceadmin');
    expect(routePath('en', { name: 'actorSpace' })).toBe('/en/actorspace');
    expect(routePath('en', { name: 'adminSpace' })).toBe('/en/adminspace');
  });

  it('fournit une page serveur pour chaque espace protégé localisé', () => {
    const spaces = ['actorSpace', 'adminSpace'] as const;
    for (const locale of locales) {
      for (const space of spaces) {
        const segment = segmentsFor(locale)[space];
        const file = join(
          process.cwd(),
          'src',
          'app',
          '(localized)',
          '[locale]',
          '(spaces)',
          segment,
          'page.web.tsx',
        );
        expect(existsSync(file), `${locale}.${space} → /${locale}/${segment}`).toBe(true);
      }
    }
  });
});

describe('handlers du compte (P3.4)', () => {
  it('fournit les deux handlers web, sans handler mobile', () => {
    for (const name of ['export', 'delete'] as const) {
      const web = join(process.cwd(), 'src', 'app', 'api', 'account', name, 'route.web.ts');
      const mobile = join(process.cwd(), 'src', 'app', 'api', 'account', name, 'route.mobile.ts');
      expect(existsSync(web), `api/account/${name}/route.web.ts`).toBe(true);
      expect(existsSync(mobile), `api/account/${name}/route.mobile.ts`).toBe(false);
    }
  });
});

describe('localeFromPath', () => {
  it('extrait la langue du premier segment', () => {
    expect(localeFromPath('/pt/hoje')).toBe('pt');
    expect(localeFromPath('/fr/evenement/x')).toBe('fr');
    expect(localeFromPath('/en')).toBe('en');
    expect(localeFromPath('/en/')).toBe('en');
  });

  it('ignore la requête', () => {
    expect(localeFromPath('/fr/semaine?ville=luanda')).toBe('fr');
  });

  it('renvoie null si la langue est absente ou inconnue', () => {
    expect(localeFromPath('/')).toBeNull();
    expect(localeFromPath('/es/hoje')).toBeNull();
    expect(localeFromPath('')).toBeNull();
  });
});
