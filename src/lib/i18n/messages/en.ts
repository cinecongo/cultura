/**
 * Catalogue anglais. Doit satisfaire exactement `Messages` (clés de `pt.ts`).
 * Registre : anglais britannique, 24 h (`en-GB`).
 */

import type { Messages } from './pt';

export const en = {
  'nav.label': 'Sections',
  'nav.today': 'Today',
  'nav.week': 'This week',

  'language.label': 'Language',
  'language.choose': 'Choose a language',
  'language.pt': 'Português',
  'language.fr': 'Français',
  'language.en': 'English',

  'a11y.skip': 'Skip to content',

  'ruler.label': "Today's programme",

  'home.eyebrow': "Angola's cultural agenda",
  'home.title': 'Today',
  'home.lead': "What's on today, all in one place.",
  'home.empty.title': 'No events today in {city}.',
  'home.empty.action': 'See the full week',

  'week.eyebrow': "Angola's cultural agenda",
  'week.title': 'This week',
  'week.lead': 'The next seven days, city by city.',
  'week.empty.title': 'No events this week.',
  'week.action': 'Back to today',
  'week.count': {
    one: '{count} event',
    other: '{count} events',
  },

  'notfound.title': 'Page not found',
  'notfound.lead': 'This page does not exist or has moved.',

  'meta.home.title': 'Today — Cultura',
  'meta.home.description': "Angola's cultural agenda: what's on today, city by city.",
  'meta.week.title': 'This week — Cultura',
  'meta.week.description': 'Cultural events in Angola over the next seven days.',
} satisfies Messages;
