/**
 * Métadonnées et SEO de base (ADR-002 §5).
 *
 * Le préfixe de langue est obligatoire, y compris pour la langue par défaut :
 * chaque page déclare sa canonique et ses équivalents `hreflang`.
 */

import type { Metadata } from 'next';

import { getPublicEnv } from './env';
import { defaultLocale, locales, type Locale } from './i18n/locale';
import { routePath, type Route } from './platform/routes';

/** URL absolue du site, issue d'une variable validée (jamais devinée). */
export function siteUrl(): URL {
  return new URL(getPublicEnv().NEXT_PUBLIC_SITE_URL);
}

/** Une entrée `hreflang` par langue, plus `x-default`. */
export function languageAlternates(route: Route): Record<string, string> {
  const languages: Record<string, string> = {};
  // `hreflang` reste `pt` (ADR-002 §5) : la précision régionale vit dans
  // `<html lang="pt-AO">`, pas dans le lien alternatif, qui cible la même page.
  for (const locale of locales) {
    languages[locale] = routePath(locale, route);
  }
  languages['x-default'] = routePath(defaultLocale, route);
  return languages;
}

export function pageMetadata(
  locale: Locale,
  route: Route,
  title: string,
  description: string,
): Metadata {
  return {
    metadataBase: siteUrl(),
    title,
    description,
    alternates: {
      canonical: routePath(locale, route),
      languages: languageAlternates(route),
    },
  };
}
