import type { Metadata } from 'next';
import Link from 'next/link';

import { defaultLocale, htmlLangFor, locales, t } from '@/lib/i18n';
import { routePath } from '@/lib/platform/routes';
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
 * Aucune langue n'est résolue ici : la page affiche les trois, dans l'ordre de
 * priorité du produit, avec un lien vers « Aujourd'hui » dans chacune.
 */
export const metadata: Metadata = {
  title: brandName,
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <html lang={htmlLangFor(defaultLocale)}>
      <body className="bg-paper text-ink">
        <main className="mx-auto flex max-w-[720px] flex-col gap-8 px-6 py-16">
          <p className="text-xs font-medium tracking-[0.08em] text-stone">404</p>

          <ul className="flex flex-col gap-6">
            {locales.map((locale) => (
              <li key={locale} className="border-t border-line pt-4">
                <p lang={htmlLangFor(locale)} className="text-lg font-semibold text-ink">
                  {t(locale, 'notfound.title')}
                </p>
                <Link
                  href={routePath(locale, { name: 'today' })}
                  hrefLang={htmlLangFor(locale)}
                  lang={htmlLangFor(locale)}
                  className="text-sm text-stone underline decoration-line decoration-1 underline-offset-4 hover:text-terracotta-text"
                >
                  {t(locale, 'nav.today')}
                </Link>
              </li>
            ))}
          </ul>
        </main>
      </body>
    </html>
  );
}
