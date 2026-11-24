/**
 * Formes d'un message i18n.
 *
 * - `string` : message simple, éventuellement avec des variables `{nom}`.
 * - `PluralMessage` : message au pluriel, résolu par `Intl.PluralRules`.
 *
 * Un seul niveau d'imbrication, jamais de clé construite dynamiquement.
 */

export type PluralMessage = {
  readonly one: string;
  readonly other: string;
};

export type MessageValue = string | PluralMessage;

/** Catalogue aplati : clés en anglais, valeurs typées. */
export type Catalog = Readonly<Record<string, MessageValue>>;
