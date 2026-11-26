'use client';

import Link from 'next/link';

import { defaultLocale, htmlLangFor, locales, t, type Locale, type StringKey } from '@/lib/i18n';
import { routePath } from '@/lib/platform';

import './globals.css';

/**
 * Erreur fatale (guide IA §4, DoD : les états d'erreur existent).
 *
 * `global-error` remplace le layout racine : il doit donc produire un document
 * complet (`<html>`, `<body>`). Il s'exécute côté navigateur — d'où
 * `'use client'` — et ne peut pas dépendre du segment de langue de l'URL. Le
 * document reste en portugais (langue de repli) et propose les trois accueils :
 * une erreur ne doit jamais enfermer l'utilisateur.
 *
 * L'export statique n'a pas de 500 serveur : cette page couvre les erreurs de
 * rendu côté client, pas les erreurs d'infrastructure.
 */
const LANGUAGE_NAME_KEYS = {
  pt: 'language.pt',
  fr: 'language.fr',
  en: 'language.en',
} as const satisfies Record<Locale, StringKey>;

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang={htmlLangFor(defaultLocale)}>
      <body>
        <main id="conteudo" className="mx-auto flex max-w-[680px] flex-col gap-6 px-6 py-16">
          <p className="type-meta text-stone">500</p>
          <h1 className="type-h1 text-ink">{t(defaultLocale, 'error.title')}</h1>
          <p className="type-body text-stone">{t(defaultLocale, 'error.lead')}</p>

          <button type="button" onClick={reset} className="text-link self-start">
            {t(defaultLocale, 'error.reload')}
          </button>

          <nav aria-label={t(defaultLocale, 'language.choose')} className="mt-4">
            <ul className="flex flex-col gap-3 border-t border-line pt-6">
              {locales.map((locale) => (
                <li key={locale}>
                  <Link
                    href={routePath(locale, { name: 'today' })}
                    hrefLang={locale}
                    lang={htmlLangFor(locale)}
                    className="type-body text-ink underline decoration-line decoration-1 underline-offset-4 hover:decoration-terracotta"
                  >
                    {t(defaultLocale, LANGUAGE_NAME_KEYS[locale])} · {t(locale, 'nav.today')}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </main>
      </body>
    </html>
  );
}
