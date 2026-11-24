'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { readLocaleCookie } from '@/lib/i18n/cookie';
import { htmlLangFor, localeLabels, locales, resolveLocale } from '@/lib/i18n/locale';
import { routePath } from '@/lib/platform/routes';

/**
 * Résolveur de langue à la racine.
 *
 * Ordre appliqué (ADR-002 §3) : cookie → langues du navigateur → portugais.
 * Le segment d'URL est absent ici par définition : `/` est le point d'entrée.
 *
 * La résolution est faite dans le navigateur, et non par un middleware :
 * l'export statique de l'APK n'exécute aucun serveur. Une seule règle, deux
 * cibles. Sans JavaScript, la page propose les trois langues en clair.
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
    <main className="mx-auto max-w-[720px] px-6 py-16">
      <noscript>
        <ul className="flex flex-col gap-2">
          {locales.map((locale) => (
            <li key={locale}>
              <a
                href={routePath(locale, { name: 'today' })}
                hrefLang={htmlLangFor(locale)}
                lang={htmlLangFor(locale)}
                className="text-sm text-ink underline decoration-line underline-offset-4"
              >
                {localeLabels[locale]}
              </a>
            </li>
          ))}
        </ul>
      </noscript>
    </main>
  );
}
