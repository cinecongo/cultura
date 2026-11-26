/**
 * Cookie de langue : sérialisation et lecture, sans effet de bord.
 *
 * Module volontairement pur (aucun accès à `document`) : il est appelé côté
 * navigateur par le sélecteur de langue et testé directement.
 */

import { isLocale, localeCookieName, type Locale } from './locale';

/** Un an : un choix de langue ne doit pas être redemandé à chaque visite. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type LocaleCookieOptions = {
  /** Durée de vie en secondes. */
  readonly maxAge?: number;
  /** Ajoute `Secure` : obligatoire dès que la page est servie en HTTPS. */
  readonly secure?: boolean;
};

export function serializeLocaleCookie(
  locale: Locale,
  { maxAge = LOCALE_COOKIE_MAX_AGE, secure = false }: LocaleCookieOptions = {},
): string {
  const secureFlag = secure ? '; Secure' : '';
  return `${localeCookieName}=${locale}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secureFlag}`;
}

export function readLocaleCookie(cookieHeader: string | null | undefined): Locale | null {
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;

    const name = part.slice(0, separator).trim();
    if (name !== localeCookieName) continue;

    const raw = part.slice(separator + 1).trim();
    let value: string;
    try {
      value = decodeURIComponent(raw);
    } catch {
      return null;
    }
    return isLocale(value) ? value : null;
  }

  return null;
}
