/**
 * API d'internationalisation (ADR-002 §2). Interface volontairement étroite :
 * `t`, `tp`, les formateurs et la résolution de langue. Elle isole le reste du
 * code d'une éventuelle migration vers `next-intl`.
 */

import { formatNumber, pluralRulesFor } from './format';
import type { Locale } from './locale';
import { en } from './messages/en';
import { fr } from './messages/fr';
import { pt, type Messages } from './messages/pt';
import type { MessageValue, PluralMessage } from './messages/types';

export const messages: Record<Locale, Messages> = { pt, fr, en };

export type MessageKey = keyof Messages;

/** Clés dont la valeur est une chaîne simple : utilisables avec `t()`. */
export type StringKey = {
  [K in MessageKey]: Messages[K] extends string ? K : never;
}[MessageKey];

/** Clés dont la valeur est un message au pluriel : utilisables avec `tp()`. */
export type PluralKey = {
  [K in MessageKey]: Messages[K] extends PluralMessage ? K : never;
}[MessageKey];

/**
 * Remplace `{nom}` par sa valeur. Une variable manquante lève une erreur :
 * mieux vaut un échec de test qu'un `{city}` affiché à un visiteur.
 */
export function interpolate(
  template: string,
  vars?: Readonly<Record<string, string | number>>,
): string {
  return template.replace(/\{(\w+)\}/g, (_placeholder, name: string) => {
    const value = vars?.[name];
    if (value === undefined) {
      throw new Error(`Variable « ${name} » absente du message i18n.`);
    }
    return String(value);
  });
}

function catalogFor(locale: Locale): Readonly<Record<string, MessageValue>> {
  return messages[locale];
}

/** Message simple dans une langue donnée. */
export function t(
  locale: Locale,
  key: StringKey,
  vars?: Readonly<Record<string, string | number>>,
): string {
  const value = catalogFor(locale)[key];
  if (value === undefined) {
    throw new Error(`Clé i18n absente du catalogue « ${locale} » : ${key}.`);
  }
  if (typeof value !== 'string') {
    throw new Error(`La clé « ${key} » est un message au pluriel : utiliser tp().`);
  }
  return interpolate(value, vars);
}

/**
 * Message au pluriel résolu par `Intl.PluralRules`.
 *
 * Note : en portugais, CLDR classe 0 dans la catégorie « one ». On suit la
 * règle du moteur, pas une intuition : « 0 evento » est la forme attendue par
 * `Intl`. Les écrans n'affichent un compteur que lorsqu'il y a des éléments.
 */
export function tp(
  locale: Locale,
  key: PluralKey,
  count: number,
  vars?: Readonly<Record<string, string | number>>,
): string {
  const value = catalogFor(locale)[key];
  if (value === undefined) {
    throw new Error(`Clé i18n absente du catalogue « ${locale} » : ${key}.`);
  }
  if (typeof value === 'string') {
    throw new Error(`La clé « ${key} » n'est pas un message au pluriel : utiliser t().`);
  }

  const category = pluralRulesFor(locale).select(count);
  const template = category === 'one' ? value.one : value.other;
  return interpolate(template, { count: formatNumber(locale, count), ...vars });
}

export { formatDate, formatDateRange, formatKz, formatNumber, formatTime } from './format';
export {
  defaultLocale,
  htmlLangFor,
  intlLocaleFor,
  isLocale,
  localeCookieName,
  localeLabels,
  locales,
  matchLocale,
  resolveLocale,
} from './locale';
export type { Locale, LocaleHints } from './locale';
export type { Messages } from './messages/pt';
export type { MessageValue, PluralMessage } from './messages/types';
