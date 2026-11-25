'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { readLocaleCookie } from '@/lib/i18n/cookie';
import {
  defaultLocale,
  htmlLangFor,
  locales,
  resolveLocale,
  t,
  type Locale,
  type StringKey,
} from '@/lib/i18n';
import { routePath } from '@/lib/platform';

const LANGUAGE_NAME_KEYS = {
  pt: 'language.pt',
  fr: 'language.fr',
  en: 'language.en',
} as const satisfies Record<Locale, StringKey>;

/**
 * Résolveur de langue à la racine.
 *
 * Ordre appliqué (ADR-002 §3) : cookie → langues du navigateur → portugais.
 * Le segment d'URL est absent ici par définition : `/` est le point d'entrée.
 *
 * La résolution est faite dans le navigateur, et non par un middleware :
 * l'export statique de l'APK n'exécute aucun serveur. Une seule règle, deux
 * cibles. La page n'est jamais blanche : le choix des trois langues est
 * affiché immédiatement, la redirection ne fait que l'anticiper.
 */
export default function LocaleResolverPage() {
  const router = useRouter();

  useEffect(() => {
    const locale = resolveLocale({
      cookie: readLocaleCookie(document.cookie),
      languages: navigator.languages ?? [navigator.language],
    });
    router.replace(routePath(locale, { name: 'today' }));
  }, [router]);

  return (
    <main id="conteudo" className="mx-auto flex max-w-[680px] flex-col gap-8 px-6 py-16">
      <h1 className="type-h1 font-extrabold text-ink">{t(defaultLocale, 'language.choose')}</h1>

      <ul className="flex flex-col gap-3">
        {locales.map((locale) => (
          <li key={locale}>
            <Link
              href={routePath(locale, { name: 'today' })}
              hrefLang={locale}
              lang={htmlLangFor(locale)}
              className="type-body-lg text-ink underline decoration-line decoration-1 underline-offset-4 hover:decoration-terracotta"
            >
              {t(defaultLocale, LANGUAGE_NAME_KEYS[locale])}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
