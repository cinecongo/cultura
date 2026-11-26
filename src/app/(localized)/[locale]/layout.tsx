import type { Viewport } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { preload } from 'react-dom';

import { htmlLangFor, isLocale, locales, t } from '@/lib/i18n';

import '../../globals.css';

/**
 * Document localisé : `<html lang>` dépend du segment d'URL, ce qui interdit
 * un `layout.tsx` racine unique (d'où les deux groupes de routes).
 *
 * `dynamicParams = false` : seules les trois langues générées existent.
 * L'export statique ne produit rien d'autre, et toute autre valeur tombe en 404.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fbf9f5',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  preload('/fonts/archivo-latin.woff2', {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  });

  return (
    <html lang={htmlLangFor(locale)}>
      <body>
        <a href="#conteudo" className="skip-link">
          {t(locale, 'a11y.skip')}
        </a>
        {children}
      </body>
    </html>
  );
}
