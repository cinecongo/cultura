/**
 * Formatage par `Intl` (ADR-002 §4). Aucune chaîne d'interface ici.
 *
 * Règles tenues par ce module :
 * - fuseau d'affichage **Africa/Luanda** (UTC+1, sans heure d'été), jamais
 *   l'heure du serveur ni celle du navigateur ;
 * - monnaie en entiers de kwanzas, jamais de flottant ;
 * - les formateurs sont mis en cache : leur construction coûte cher.
 */

import { intlLocaleFor, type Locale } from './locale';

export const DISPLAY_TIME_ZONE = 'Africa/Luanda';

const dateFormatters = new Map<Locale, Intl.DateTimeFormat>();
const timeFormatters = new Map<Locale, Intl.DateTimeFormat>();
const numberFormatters = new Map<Locale, Intl.NumberFormat>();
const pluralRules = new Map<Locale, Intl.PluralRules>();

function dateFormatter(locale: Locale): Intl.DateTimeFormat {
  let formatter = dateFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(intlLocaleFor(locale), {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: DISPLAY_TIME_ZONE,
    });
    dateFormatters.set(locale, formatter);
  }
  return formatter;
}

function timeFormatter(locale: Locale): Intl.DateTimeFormat {
  let formatter = timeFormatters.get(locale);
  if (!formatter) {
    // `h23` + `numeric` : « 9:05 », pas « 09:05 ». La ponctuation est composée
    // plus bas, car `Intl` ne connaît pas le « 18h00 » angolais.
    formatter = new Intl.DateTimeFormat(intlLocaleFor(locale), {
      hour: 'numeric',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: DISPLAY_TIME_ZONE,
    });
    timeFormatters.set(locale, formatter);
  }
  return formatter;
}

export function numberFormatter(locale: Locale): Intl.NumberFormat {
  let formatter = numberFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(intlLocaleFor(locale));
    numberFormatters.set(locale, formatter);
  }
  return formatter;
}

export function pluralRulesFor(locale: Locale): Intl.PluralRules {
  let rules = pluralRules.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(intlLocaleFor(locale));
    pluralRules.set(locale, rules);
  }
  return rules;
}

/** « 24 de novembro de 2026 » · « 24 novembre 2026 » · « 24 November 2026 » */
export function formatDate(locale: Locale, date: Date): string {
  return dateFormatter(locale).format(date);
}

/** Plage de dates, ponctuation fournie par `Intl` pour chaque langue. */
export function formatDateRange(locale: Locale, start: Date, end: Date): string {
  const formatter = dateFormatter(locale);
  if (typeof formatter.formatRange === 'function') {
    return formatter.formatRange(start, end);
  }
  // Repli documenté si le moteur n'implémente pas `formatRange`.
  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

function timeParts(locale: Locale, date: Date): { hour: string; minute: string } {
  const parts = timeFormatter(locale).formatToParts(date);
  const hour = parts.find((part) => part.type === 'hour')?.value ?? '0';
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '00';
  return { hour, minute };
}

/** « 18h00 » · « 18 h 00 » · « 18:00 » */
export function formatTime(locale: Locale, date: Date): string {
  const { hour, minute } = timeParts(locale, date);

  switch (locale) {
    case 'pt':
      return `${hour}h${minute}`;
    case 'fr':
      return `${hour} h ${minute}`;
    case 'en':
      return `${hour}:${minute}`;
  }
}

/** « 1 500 » · « 1 500 » (espace fine) · « 1,500 » */
export function formatNumber(locale: Locale, value: number): string {
  return numberFormatter(locale).format(value);
}

/** « 1 500 Kz ». Le montant est un entier de kwanzas. */
export function formatKz(locale: Locale, amount: number): string {
  if (!Number.isInteger(amount)) {
    throw new Error('Un montant en kwanzas est un entier : pas de décimales.');
  }
  // Espace insécable avant le symbole, comme dans le glossaire §6.
  return `${formatNumber(locale, amount)}\u00A0Kz`;
}
