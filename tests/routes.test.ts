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
