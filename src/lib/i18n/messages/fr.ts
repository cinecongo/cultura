/**
 * Catalogue français. Doit satisfaire exactement `Messages` (clés de `pt.ts`) :
 * une clé oubliée casse `npm run typecheck` (ADR-002 §1).
 */

import type { Messages } from './pt';

export const fr = {
  'nav.label': 'Sections',
  'nav.today': "Aujourd'hui",
  'nav.week': 'Cette semaine',

  'language.label': 'Langue',

  'home.eyebrow': "Agenda culturel de l'Angola",
  'home.title': "Aujourd'hui",
  'home.lead': "Ce qui se passe aujourd'hui, au même endroit.",
  'home.empty.title': "Aucun événement aujourd'hui à {city}.",
  'home.empty.action': 'Voir la semaine complète',

  'week.eyebrow': "Agenda culturel de l'Angola",
  'week.title': 'Cette semaine',
  'week.lead': 'Les sept prochains jours, ville par ville.',
  'week.empty.title': 'Aucun événement cette semaine.',
  'week.action': "Revenir à aujourd'hui",
  'week.count': {
    one: '{count} événement',
    other: '{count} événements',
  },

  'notfound.title': 'Page introuvable',

  'meta.home.title': "Aujourd'hui — Cultura",
  'meta.home.description':
    "L'agenda culturel de l'Angola : ce qui se passe aujourd'hui, ville par ville.",
  'meta.week.title': 'Cette semaine — Cultura',
  'meta.week.description': 'Les événements culturels des sept prochains jours en Angola.',
} satisfies Messages;
