import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { preload } from 'react-dom';

import { defaultLocale, htmlLangFor, t } from '@/lib/i18n';
import { brandName } from '@/lib/site';

import '../globals.css';

/**
 * Document par défaut, pour les adresses qui n'ont pas encore de langue :
 * le résolveur `/` et la page introuvable globale. La langue du document est
 * celle du repli (portugais), et ces pages ne sont pas indexées.
 */
export const metadata: Metadata = {
  title: brandName,
  robots: { index: false, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fbf9f5',
};

export default function DefaultLayout({ children }: { children: ReactNode }) {
  /* React 19 place la ressource dans `<head>` : un `<link>` écrit dans le corps
     du document serait du contenu de métadonnées au mauvais endroit. */
  preload('/fonts/archivo-latin.woff2', {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  });

  return (
    <html lang={htmlLangFor(defaultLocale)}>
      <body>
        <a href="#conteudo" className="skip-link">
          {t(defaultLocale, 'a11y.skip')}
        </a>
        {children}
      </body>
    </html>
  );
}
