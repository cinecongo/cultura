/**
 * Langues, résolution et correspondances techniques (ADR-002 §3 et §4).
 *
 * Ce module ne contient **aucune chaîne d'interface** : uniquement des
 * identifiants et des règles. Les textes vivent dans `messages/`.
 */

export const locales = ['pt', 'fr', 'en'] as const;

export type Locale = (typeof locales)[number];

/** Langue de repli : dernier niveau de l'ordre de résolution. */
export const defaultLocale: Locale = 'pt';

/** Cookie qui mémorise un choix explicite de langue. */
export const localeCookieName = 'cultura_locale';

/**
 * Étiquettes du sélecteur de langue. Ce sont des codes de langue, pas des
 * traductions : elles s'écrivent pareil dans les trois catalogues.
 */
export const localeLabels: Record<Locale, string> = {
  pt: 'PT',
  fr: 'FR',
  en: 'EN',
};

/** Attribut `lang` du document. `pt-AO` est la forme complète exigée. */
const htmlLanguages: Record<Locale, string> = {
  pt: 'pt-AO',
  fr: 'fr',
  en: 'en',
};

/**
 * Candidats passés à `Intl`. `pt-AO` n'est pas garanti dans tous les moteurs :
 * le repli sur `pt` est prévu et choisi par `intlLocaleFor()`.
 * L'anglais utilise `en-GB` (24 h), jamais `en-US`.
 */
const intlCandidates: Record<Locale, readonly string[]> = {
  pt: ['pt-AO', 'pt'],
  fr: ['fr'],
  en: ['en-GB'],
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function htmlLangFor(locale: Locale): string {
  return htmlLanguages[locale];
}

/** Réduit une étiquette BCP 47 à une langue supportée : `fr-CA` → `fr`. */
export function matchLocale(tag: string): Locale | null {
  const base = tag.trim().toLowerCase().split(/[-_]/)[0];
  if (!base) return null;
  return isLocale(base) ? base : null;
}

const resolvedIntl = new Map<Locale, string>();

/**
 * Locale réellement utilisée par `Intl` pour une langue de l'interface.
 * Le repli est mesuré, pas supposé : on interroge le moteur.
 */
export function intlLocaleFor(locale: Locale): string {
  const cached = resolvedIntl.get(locale);
  if (cached) return cached;

  const candidates = intlCandidates[locale];
  const supported = Intl.DateTimeFormat.supportedLocalesOf([...candidates]);
  const chosen = supported[0] ?? locale;
  resolvedIntl.set(locale, chosen);
  return chosen;
}

export type LocaleHints = {
  /** Segment d'URL (`/fr/…`) : priorité absolue. */
  readonly url?: string | null;
  /** Valeur du cookie `cultura_locale`. */
  readonly cookie?: string | null;
  /** `navigator.languages` ou un en-tête `Accept-Language` déjà découpé. */
  readonly languages?: readonly string[] | null;
};

/**
 * Ordre de résolution (ADR-002 §3) : URL → cookie → langues du navigateur →
 * portugais. Une valeur inconnue est ignorée, jamais devinée.
 */
export function resolveLocale(hints: LocaleHints): Locale {
  const fromUrl = hints.url ? matchLocale(hints.url) : null;
  if (fromUrl) return fromUrl;

  const fromCookie = hints.cookie ? matchLocale(hints.cookie) : null;
  if (fromCookie) return fromCookie;

  for (const tag of hints.languages ?? []) {
    const match = matchLocale(tag);
    if (match) return match;
  }

  return defaultLocale;
}
