import 'server-only';

import { siteUrl } from '@/lib/seo';

/**
 * Origines acceptées pour les POST d'authentification.
 *
 * Le serveur n'accepte que l'origine de la requête elle-même (l'« Host » vu
 * par Next) et, en production, exige en plus l'origine canonique du site.
 * Sans en-tête `Origin`, un POST est refusé : un formulaire cross-origin ne
 * peut donc pas déclencher d'action d'authentification.
 */
export function isAllowedPostOrigin(request: Request): boolean {
  const originHeader = request.headers.get('origin');
  if (!originHeader) return false;

  let origin: string;
  let requestOrigin: string;
  try {
    origin = new URL(originHeader).origin;
    requestOrigin = new URL(request.url).origin;
  } catch {
    return false;
  }

  if (origin !== requestOrigin) return false;
  return process.env.NODE_ENV !== 'production' || origin === siteUrl().origin;
}
