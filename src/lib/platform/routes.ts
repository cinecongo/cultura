import { isLocale, type Locale } from '@/lib/i18n/locale';

/**
 * Routes canoniques, une seule source de vérité (ADR-001 §5).
 *
 * Aucune URL ne doit être écrite à la main dans un composant : on appelle
 * `routePath()`. Les segments sont localisés, le préfixe de langue est toujours
 * présent (`/pt/…`, `/fr/…`, `/en/…`) pour que le web et l'export statique
 * produisent exactement les mêmes chemins.
 */

export type RouteName = 'today' | 'week' | 'actors' | 'cities' | 'search' | 'event' | 'actor';

export type Route =
  | { readonly name: 'today' | 'week' | 'actors' | 'cities' | 'search' }
  | { readonly name: 'event'; readonly slug: string }
  | { readonly name: 'actor'; readonly slug: string };

type SegmentTable = Record<RouteName, string>;

const segments: Record<Locale, SegmentTable> = {
  pt: {
    // « Aujourd'hui » est la page d'accueil : elle vit à la racine de la langue.
    today: '',
    week: 'semana',
    actors: 'atores',
    cities: 'cidades',
    search: 'busca',
    event: 'evento',
    actor: 'ator',
  },
  fr: {
    today: '',
    week: 'semaine',
    actors: 'acteurs',
    cities: 'villes',
    search: 'recherche',
    event: 'evenement',
    actor: 'acteur',
  },
  en: {
    today: '',
    week: 'week',
    actors: 'actors',
    cities: 'cities',
    search: 'search',
    event: 'event',
    actor: 'actor',
  },
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Un slug ne contient que a-z, 0-9 et des tirets simples. Sinon, on refuse. */
export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug) && slug.length <= 120;
}

function assertSlug(slug: string): string {
  if (!isValidSlug(slug)) {
    throw new Error(`Slug invalide : « ${slug} ». Attendu : a-z, 0-9, tirets simples.`);
  }
  return slug;
}

export function segmentsFor(locale: Locale): SegmentTable {
  return segments[locale];
}

/** Construit un chemin absolu depuis la racine du site, sans slash final. */
export function routePath(locale: Locale, route: Route): string {
  const table = segments[locale];
  const base = `/${locale}`;

  switch (route.name) {
    case 'today':
      return base;
    case 'event':
      return `${base}/${table.event}/${assertSlug(route.slug)}`;
    case 'actor':
      return `${base}/${table.actor}/${assertSlug(route.slug)}`;
    default:
      return `${base}/${table[route.name]}`;
  }
}

/** Extrait la langue du premier segment d'un chemin, ou `null`. */
export function localeFromPath(pathname: string): Locale | null {
  const first = pathname.split('?')[0]?.split('/').filter(Boolean)[0];
  return first && isLocale(first) ? first : null;
}
