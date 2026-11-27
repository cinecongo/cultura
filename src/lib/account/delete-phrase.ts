import 'server-only';

import type { Locale } from '@/lib/i18n';

/**
 * Phrase de confirmation de la suppression de compte (P3.4).
 *
 * Source de vérité pour la comparaison serveur. Le catalogue i18n affiche la
 * même valeur via `auth.account.delete.confirmPhrase.value` ; un test d'égalité
 * dans `tests/i18n.test.ts` empêche toute dérive. Le client n'envoie jamais la
 * phrase attendue, seulement sa saisie.
 */
export const DELETE_CONFIRM_PHRASE: Readonly<Record<Locale, string>> = {
  pt: 'APAGAR A CONTA',
  fr: 'EFFACER MON COMPTE',
  en: 'DELETE MY ACCOUNT',
} as const;

/** Normalisation NFKC/casse/espaces, sans correspondance partielle. */
export function confirmPhraseMatches(locale: Locale, saisie: string): boolean {
  return (
    saisie.normalize('NFKC').trim().toUpperCase() ===
    DELETE_CONFIRM_PHRASE[locale].normalize('NFKC').toUpperCase()
  );
}
