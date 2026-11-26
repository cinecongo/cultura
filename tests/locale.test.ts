import { describe, expect, it } from 'vitest';

import { LOCALE_COOKIE_MAX_AGE, readLocaleCookie, serializeLocaleCookie } from '@/lib/i18n/cookie';
import {
  defaultLocale,
  htmlLangFor,
  intlLocaleFor,
  isLocale,
  localeLabels,
  matchLocale,
  resolveLocale,
} from '@/lib/i18n/locale';

describe('isLocale', () => {
  it('reconnaît les trois langues', () => {
    expect(isLocale('pt')).toBe(true);
    expect(isLocale('fr')).toBe(true);
    expect(isLocale('en')).toBe(true);
  });

  it('refuse tout le reste', () => {
    expect(isLocale('es')).toBe(false);
    expect(isLocale('PT')).toBe(false);
    expect(isLocale('pt-AO')).toBe(false);
    expect(isLocale('')).toBe(false);
  });
});

describe('matchLocale', () => {
  it('réduit une étiquette régionale', () => {
    expect(matchLocale('fr-CA')).toBe('fr');
    expect(matchLocale('pt-PT')).toBe('pt');
    expect(matchLocale('en-US')).toBe('en');
    expect(matchLocale('EN_gb')).toBe('en');
    expect(matchLocale('  fr  ')).toBe('fr');
  });

  it('renvoie null pour une langue non supportée', () => {
    expect(matchLocale('de-DE')).toBeNull();
    expect(matchLocale('')).toBeNull();
    expect(matchLocale('*')).toBeNull();
  });
});

describe('resolveLocale', () => {
  it('donne la priorité au segment d’URL', () => {
    expect(resolveLocale({ url: 'en', cookie: 'fr', languages: ['pt-BR'] })).toBe('en');
  });

  it('utilise le cookie quand l’URL ne dit rien', () => {
    expect(resolveLocale({ cookie: 'fr', languages: ['en-US'] })).toBe('fr');
  });

  it('utilise les langues du navigateur en dernier recours', () => {
    expect(resolveLocale({ languages: ['de-DE', 'en-GB', 'fr'] })).toBe('en');
  });

  it('retombe sur le portugais', () => {
    expect(resolveLocale({})).toBe('pt');
    expect(resolveLocale({ languages: [] })).toBe('pt');
    expect(resolveLocale({ languages: ['de-DE'] })).toBe('pt');
    expect(resolveLocale({ cookie: 'xx', url: 'yy' })).toBe('pt');
  });

  it('ignore une valeur inconnue au lieu de deviner', () => {
    expect(resolveLocale({ url: 'es', cookie: 'fr' })).toBe('fr');
  });

  it('a le portugais pour langue par défaut', () => {
    expect(defaultLocale).toBe('pt');
  });
});

describe('correspondances techniques', () => {
  it('déclare pt-AO comme attribut lang', () => {
    expect(htmlLangFor('pt')).toBe('pt-AO');
    expect(htmlLangFor('fr')).toBe('fr');
    expect(htmlLangFor('en')).toBe('en');
  });

  it('utilise pt-AO pour Intl, avec repli possible sur pt', () => {
    expect(intlLocaleFor('pt')).toMatch(/^pt/);
    expect(intlLocaleFor('fr')).toMatch(/^fr/);
    expect(intlLocaleFor('en')).toBe('en-GB');
  });

  it('n’expose que des codes de langue dans le sélecteur', () => {
    expect(localeLabels).toEqual({ pt: 'PT', fr: 'FR', en: 'EN' });
  });
});

describe('cookie de langue', () => {
  it('sérialise un cookie lisible par le navigateur', () => {
    expect(serializeLocaleCookie('fr')).toBe(
      `cultura_locale=fr; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`,
    );
  });

  it('ajoute Secure en HTTPS, et seulement là', () => {
    expect(serializeLocaleCookie('fr', { secure: true })).toBe(
      `cultura_locale=fr; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax; Secure`,
    );
    expect(serializeLocaleCookie('fr', { secure: false })).not.toContain('Secure');
  });

  it('accepte une durée de vie personnalisée', () => {
    expect(serializeLocaleCookie('en', { maxAge: 60 })).toContain('Max-Age=60');
  });

  it('relit sa propre valeur', () => {
    expect(readLocaleCookie(serializeLocaleCookie('en'))).toBe('en');
  });

  it('trouve le cookie au milieu d’autres', () => {
    expect(readLocaleCookie('a=1; cultura_locale=fr; b=2')).toBe('fr');
  });

  it('ignore une valeur inconnue ou un cookie absent', () => {
    expect(readLocaleCookie('cultura_locale=es')).toBeNull();
    expect(readLocaleCookie('a=1')).toBeNull();
    expect(readLocaleCookie('')).toBeNull();
    expect(readLocaleCookie(null)).toBeNull();
    expect(readLocaleCookie(undefined)).toBeNull();
  });

  it('résiste à un encodage invalide', () => {
    expect(readLocaleCookie('cultura_locale=%E0%A4%A')).toBeNull();
  });

  it('ne confond pas un cookie au nom proche', () => {
    expect(readLocaleCookie('cultura_locale_backup=fr')).toBeNull();
  });
});
