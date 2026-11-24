import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { defaultLocale, htmlLangFor } from '@/lib/i18n/locale';
import { brandName } from '@/lib/site';

import '../globals.css';

/**
 * Document par défaut, pour les adresses qui n'ont pas encore de langue :
 * le résolveur `/` et la page introuvable. La langue du document est celle du
 * repli (portugais), et ces pages ne sont pas indexées.
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
  return (
    <html lang={htmlLangFor(defaultLocale)}>
      <body>{children}</body>
    </html>
  );
}
