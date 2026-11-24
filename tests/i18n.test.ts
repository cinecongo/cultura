import { describe, expect, it } from 'vitest';

import {
  interpolate,
  messages,
  t,
  tp,
  type MessageKey,
  type PluralKey,
  type StringKey,
} from '@/lib/i18n';
import { en } from '@/lib/i18n/messages/en';
import { fr } from '@/lib/i18n/messages/fr';
import { pt } from '@/lib/i18n/messages/pt';
import type { MessageValue } from '@/lib/i18n/messages/types';
import { locales } from '@/lib/i18n/locale';

const catalogs = { pt, fr, en } as const;

const placeholdersOf = (value: MessageValue): string[] => {
  const texts = typeof value === 'string' ? [value] : [value.one, value.other];
  return texts.flatMap((text) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1] ?? ''));
};

describe('catalogues', () => {
  it('expose exactement les mêmes clés dans les trois langues', () => {
    const reference = Object.keys(pt).sort();

    for (const locale of locales) {
      expect(Object.keys(catalogs[locale]).sort(), locale).toEqual(reference);
    }
  });

  it('garde le même type de valeur par clé', () => {
    for (const key of Object.keys(pt) as MessageKey[]) {
      const expected = typeof pt[key];
      for (const locale of locales) {
        expect(typeof catalogs[locale][key], `${locale}.${key}`).toBe(expected);
      }
    }
  });

  it('garde les mêmes variables dans les trois langues', () => {
    for (const key of Object.keys(pt) as MessageKey[]) {
      const expected = placeholdersOf(pt[key]).sort();
      for (const locale of locales) {
        expect(placeholdersOf(catalogs[locale][key]).sort(), `${locale}.${key}`).toEqual(expected);
      }
    }
  });

  it('ne contient ni chaîne vide ni espace superflu', () => {
    for (const locale of locales) {
      for (const [key, value] of Object.entries(catalogs[locale])) {
        const texts = typeof value === 'string' ? [value] : [value.one, value.other];
        for (const text of texts) {
          expect(text.trim(), `${locale}.${key}`).not.toBe('');
          expect(text, `${locale}.${key}`).toBe(text.trim());
        }
      }
    }
  });

  it('déclare les pluriels avec « one » et « other »', () => {
    for (const locale of locales) {
      const plurals = Object.entries(catalogs[locale]).filter(
        ([, value]) => typeof value !== 'string',
      );
      expect(plurals.length, locale).toBeGreaterThan(0);
      for (const [key, value] of plurals) {
        expect(Object.keys(value).sort(), `${locale}.${key}`).toEqual(['one', 'other']);
      }
    }
  });
});

describe('t', () => {
  it('renvoie le texte de chaque langue', () => {
    expect(t('pt', 'nav.today')).toBe('Hoje');
    expect(t('fr', 'nav.today')).toBe("Aujourd'hui");
    expect(t('en', 'nav.today')).toBe('Today');
  });

  it('interpole les variables', () => {
    expect(t('pt', 'home.empty.title', { city: 'Luanda' })).toBe(
      'Ainda não há eventos hoje em Luanda.',
    );
    expect(t('fr', 'home.empty.title', { city: 'Luanda' })).toBe(
      "Aucun événement aujourd'hui à Luanda.",
    );
    expect(t('en', 'home.empty.title', { city: 'Luanda' })).toBe('No events today in Luanda.');
  });

  it('échoue si une variable attendue manque', () => {
    expect(() => t('pt', 'home.empty.title')).toThrow(/city/);
  });

  it('refuse une clé au pluriel', () => {
    const pluralUsedAsString = 'week.count' as unknown as StringKey;
    expect(() => t('pt', pluralUsedAsString)).toThrow(/pluriel/);
  });

  it('ne renvoie jamais de variable non remplacée', () => {
    for (const key of Object.keys(pt) as MessageKey[]) {
      if (typeof pt[key] !== 'string') continue;
      if (placeholdersOf(pt[key]).length > 0) continue;
      expect(t('pt', key as StringKey), key).not.toMatch(/\{\w+\}/);
    }
  });
});

describe('tp', () => {
  it('gère le singulier et le pluriel dans les trois langues', () => {
    expect(tp('pt', 'week.count', 1)).toBe('1 evento');
    expect(tp('pt', 'week.count', 8)).toBe('8 eventos');

    expect(tp('fr', 'week.count', 1)).toBe('1 événement');
    expect(tp('fr', 'week.count', 8)).toBe('8 événements');

    expect(tp('en', 'week.count', 1)).toBe('1 event');
    expect(tp('en', 'week.count', 8)).toBe('8 events');
  });

  it('formate le nombre selon la langue', () => {
    expect(tp('en', 'week.count', 1500)).toBe('1,500 events');
    expect(tp('pt', 'week.count', 1500)).toBe('1\u00A0500 eventos');
  });

  it('refuse une clé simple', () => {
    const stringUsedAsPlural = 'nav.today' as unknown as PluralKey;
    expect(() => tp('pt', stringUsedAsPlural, 1)).toThrow(/pluriel/);
  });
});

describe('interpolate', () => {
  it('remplace toutes les occurrences', () => {
    expect(interpolate('{a} et {a}', { a: 'x' })).toBe('x et x');
  });

  it('laisse le texte intact sans variable', () => {
    expect(interpolate('rien à remplacer')).toBe('rien à remplacer');
  });

  it('échoue sur une variable inconnue', () => {
    expect(() => interpolate('{inconnue}', {})).toThrow(/inconnue/);
  });
});

describe('messages', () => {
  it('expose un catalogue par langue', () => {
    expect(Object.keys(messages).sort()).toEqual(['en', 'fr', 'pt']);
  });
});
