import type { Metadata } from 'next';
import Link from 'next/link';

import { defaultLocale, htmlLangFor, locales, t, type Locale, type StringKey } from '@/lib/i18n';
import { routePath } from '@/lib/platform';
import { brandName } from '@/lib/site';

import './globals.css';

/**
 * Page introuvable globale.
 *
 * Avec deux layouts racines (`(default)` et `(localized)`), Next ne peut pas
 * choisir lequel envelopper : cette page est donc un document complet, déclaré
 * via `experimental.globalNotFound`. Vérifié dans `out/404.html` : `<html>`,
 * `<body>` et `lang` sont présents.
 *
 * Le document est en portugais (langue de repli) : un seul `h1`, puis les trois
 * langues proposées en clair. Aucune langue n'est devinée pour une adresse qui
 * n'existe pas.
 */
export const metadata: Metadata = {
  title: brandName,
  robots: { index: false, follow: true },
};

const LANGUAGE_NAME_KEYS = {
  pt: 'language.pt',
  fr: 'language.fr',
  en: 'language.en',
} as const satisfies Record<Locale, StringKey>;

export default function GlobalNotFound() {
  return (
    <html lang={htmlLangFor(defaultLocale)}>
      <body>
        <link
          rel="preload"
          href="/fonts/archivo-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <a href="#conteudo" className="skip-link">
          {t(defaultLocale, 'a11y.skip')}
        </a>

        <main id="conteudo" className="mx-auto flex max-w-[680px] flex-col gap-6 px-6 py-16">
          <p className="type-meta text-stone">404</p>
          <h1 className="type-h1 text-ink">{t(defaultLocale, 'notfound.title')}</h1>
          <p className="type-body text-stone">{t(defaultLocale, 'notfound.lead')}</p>

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
