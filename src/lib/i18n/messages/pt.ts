/**
 * Catalogue portugais (pt-AO) — **source de vérité du type `Messages`**.
 *
 * Règles (ADR-002 §1) :
 * - clés en anglais, un seul niveau ;
 * - aucune clé construite dynamiquement ;
 * - toute variable est écrite `{nom}`, sans expression ;
 * - toute nouvelle clé est ajoutée dans les trois langues dans le même commit.
 *
 * Vocabulaire : `i18n/GLOSSAIRE.md`. Les textes PT seront relus par un
 * locuteur angolais avant le lancement (Q7, P8.4).
 */

import type { PluralMessage } from './types';

export const pt = {
  'nav.label': 'Secções',
  'nav.today': 'Hoje',
  'nav.week': 'Esta semana',

  'language.label': 'Idioma',

  'home.eyebrow': 'Agenda cultural de Angola',
  'home.title': 'Hoje',
  'home.lead': 'O que acontece hoje, num só lugar.',
  'home.empty.title': 'Ainda não há eventos hoje em {city}.',
  'home.empty.action': 'Ver a semana completa',

  'week.eyebrow': 'Agenda cultural de Angola',
  'week.title': 'Esta semana',
  'week.lead': 'Os próximos sete dias, cidade a cidade.',
  'week.empty.title': 'Ainda não há eventos esta semana.',
  'week.action': 'Voltar a hoje',
  'week.count': {
    one: '{count} evento',
    other: '{count} eventos',
  } satisfies PluralMessage,

  'notfound.title': 'Página não encontrada',

  'meta.home.title': 'Hoje — Cultura',
  'meta.home.description': 'A agenda cultural de Angola: o que acontece hoje, cidade a cidade.',
  'meta.week.title': 'Esta semana — Cultura',
  'meta.week.description': 'Os eventos culturais dos próximos sete dias em Angola.',
};

export type Messages = typeof pt;
