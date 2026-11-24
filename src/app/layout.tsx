import type { Metadata, Viewport } from 'next';

import './globals.css';

/*
 * Les métadonnées définitives passeront par l'i18n (P1.4).
 * Ici : uniquement le nom de marque et le titre, qui ne sont pas des chaînes
 * d'interface traduisibles.
 */
export const metadata: Metadata = {
  title: 'Cultura — Agenda cultural de Angola',
  applicationName: 'Cultura',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fbf9f5',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-AO">
      <body>{children}</body>
    </html>
  );
}
