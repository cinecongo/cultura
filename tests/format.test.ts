import { describe, expect, it } from 'vitest';

import { formatDate, formatDateRange, formatKz, formatNumber, formatTime } from '@/lib/i18n/format';

/** 24 novembre 2026, 17:00 UTC = 18:00 à Luanda (UTC+1). */
const EVENING = new Date(Date.UTC(2026, 10, 24, 17, 0, 0));
const WEEK_END = new Date(Date.UTC(2026, 10, 30, 17, 0, 0));

describe('formatDate', () => {
  it('écrit la date longue du glossaire dans les trois langues', () => {
    expect(formatDate('pt', EVENING)).toBe('24 de novembro de 2026');
    expect(formatDate('fr', EVENING)).toBe('24 novembre 2026');
    expect(formatDate('en', EVENING)).toBe('24 November 2026');
  });

  it('affiche à Africa/Luanda, jamais en UTC', () => {
    // 23:30 UTC le 24 = 00:30 le 25 à Luanda.
    const lateNight = new Date(Date.UTC(2026, 10, 24, 23, 30, 0));
    expect(formatDate('pt', lateNight)).toBe('25 de novembro de 2026');
    expect(formatDate('fr', lateNight)).toBe('25 novembre 2026');
    expect(formatDate('en', lateNight)).toBe('25 November 2026');
  });

  it('ignore le fuseau de la machine', () => {
    const winter = new Date(Date.UTC(2026, 0, 15, 23, 30, 0));
    const summer = new Date(Date.UTC(2026, 6, 15, 23, 30, 0));
    expect(formatDate('en', winter)).toBe('16 January 2026');
    expect(formatDate('en', summer)).toBe('16 July 2026');
  });
});

describe('formatDateRange', () => {
  it('écrit la plage de la semaine', () => {
    expect(formatDateRange('pt', EVENING, WEEK_END)).toBe('24–30 de novembro de 2026');
    expect(formatDateRange('fr', EVENING, WEEK_END)).toBe('24–30 novembre 2026');
    expect(formatDateRange('en', EVENING, WEEK_END)).toBe('24\u2009–\u200930 November 2026');
  });
});

describe('formatTime', () => {
  it('écrit l’heure du glossaire dans les trois langues', () => {
    expect(formatTime('pt', EVENING)).toBe('18h00');
    expect(formatTime('fr', EVENING)).toBe('18 h 00');
    expect(formatTime('en', EVENING)).toBe('18:00');
  });

  it('garde une heure sans zéro initial', () => {
    // 08:05 UTC = 09:05 à Luanda.
    const morning = new Date(Date.UTC(2026, 10, 24, 8, 5, 0));
    expect(formatTime('pt', morning)).toBe('9h05');
    expect(formatTime('fr', morning)).toBe('9 h 05');
    expect(formatTime('en', morning)).toBe('9:05');
  });

  it('passe au jour suivant à minuit local', () => {
    expect(formatTime('pt', new Date(Date.UTC(2026, 10, 24, 23, 30, 0)))).toBe('0h30');
  });
});

describe('formatNumber', () => {
  it('suit les séparateurs de chaque langue', () => {
    expect(formatNumber('pt', 1500)).toBe('1\u00A0500');
    expect(formatNumber('fr', 1500)).toBe('1\u202F500');
    expect(formatNumber('en', 1500)).toBe('1,500');
  });

  it('ne groupe pas en dessous de mille', () => {
    expect(formatNumber('pt', 999)).toBe('999');
    expect(formatNumber('en', 999)).toBe('999');
  });
});

describe('formatKz', () => {
  it('écrit le montant avec une espace insécable avant le symbole', () => {
    expect(formatKz('pt', 1500)).toBe('1\u00A0500\u00A0Kz');
    expect(formatKz('fr', 1500)).toBe('1\u202F500\u00A0Kz');
    expect(formatKz('en', 1500)).toBe('1,500\u00A0Kz');
  });

  it('refuse une monnaie décimale', () => {
    expect(() => formatKz('pt', 1500.5)).toThrow(/entier/);
  });

  it('accepte zéro', () => {
    expect(formatKz('pt', 0)).toBe('0\u00A0Kz');
  });
});
