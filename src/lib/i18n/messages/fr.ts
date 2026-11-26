/**
 * Catalogue français. Doit satisfaire exactement `Messages` (clés de `pt.ts`) :
 * une clé oubliée casse `npm run typecheck` (ADR-002 §1).
 */

import type { Messages } from './pt';

export const fr = {
  'nav.label': 'Sections',
  'nav.mobile': 'Navigation principale',
  'nav.today': "Aujourd'hui",
  'nav.week': 'Cette semaine',

  'language.label': 'Langue',
  'language.choose': 'Choisir la langue',
  'language.pt': 'Português',
  'language.fr': 'Français',
  'language.en': 'English',

  'a11y.skip': 'Aller au contenu',

  'ruler.label': 'Programme du jour',

  'home.eyebrow': "Agenda culturel de l'Angola",
  'home.title': "Aujourd'hui",
  'home.lead': "Ce qui se passe aujourd'hui, au même endroit.",
  'home.empty.title': "Aucun événement aujourd'hui à {city}.",
  'home.empty.action': 'Voir la semaine complète',

  'week.eyebrow': "Agenda culturel de l'Angola",
  'week.title': 'Cette semaine',
  'week.lead': 'Les sept prochains jours, ville par ville.',
  'week.empty.title': 'Aucun événement dans les sept prochains jours.',
  'week.action': "Revenir à aujourd'hui",
  'week.count': {
    one: '{count} événement',
    other: '{count} événements',
  },

  'notfound.title': 'Page introuvable',
  'notfound.lead': "Cette page n'existe pas ou a changé d'adresse.",

  'error.title': 'Un problème est survenu',
  'error.lead': "La page n'a pas pu être chargée. Réessayez.",
  'error.reload': 'Recharger la page',

  'meta.home.title': "Aujourd'hui — Cultura",
  'meta.home.description':
    "L'agenda culturel de l'Angola : ce qui se passe aujourd'hui, ville par ville.",
  'meta.week.title': 'Cette semaine — Cultura',
  'meta.week.description': 'Les événements culturels des sept prochains jours en Angola.',
} satisfies Messages;
