import 'server-only';

import { isLocale, type Locale } from '@/lib/i18n';
import { routePath, type Route } from '@/lib/platform';
import { siteUrl } from '@/lib/seo';

import { authCallbackFragment, type AuthCallbackType } from './callback-url';

export type { AuthCallbackType } from './callback-url';

/** Construit une cible interne seulement : aucun paramètre de redirection libre. */
export function internalUrl(locale: Locale, route: Route): URL {
  return new URL(routePath(locale, route), siteUrl());
}

/**
 * Lien de vérification / réinitialisation : la page de destination est la page
 * « Confirmar email », le jeton voyage dans le fragment et est échangé par
 * `POST /api/auth/callback`. Aucun jeton dans le chemin ni dans les logs.
 */
export function authCallbackUrl(tokenHash: string, type: AuthCallbackType, locale: Locale): URL {
  const url = internalUrl(locale, { name: 'verify' });
  url.hash = authCallbackFragment(tokenHash, type);
  return url;
}

export function isSafeLocale(value: string | null): value is Locale {
  return value !== null && isLocale(value);
}
