import Link from 'next/link';
import type { ReactNode } from 'react';

import { MobileNav } from '@/components/mobile-nav';
import { SiteHeader } from '@/components/site-header';
import { t, type Locale } from '@/lib/i18n';
import { routePath, type Route } from '@/lib/platform';

export type AuthShellProps = {
  readonly locale: Locale;
  readonly title: string;
  readonly lead?: string;
  readonly route: Route;
  readonly children: ReactNode;
};

/** Cadre commun des écrans d'authentification (DESIGN.md §7 et §8.8). */
export function AuthShell({ locale, title, lead, route, children }: AuthShellProps) {
  return (
    <>
      <SiteHeader locale={locale} route={route} />

      <main
        id="conteudo"
        className="page-mobile-nav mx-auto w-full max-w-[680px] px-4 pt-10 pb-16 md:px-6"
      >
        <h1 className="type-h1 text-ink">{title}</h1>
        {lead ? <p className="type-body-lg mt-3 max-w-[64ch] text-stone">{lead}</p> : null}
        {children}
        <Link href={routePath(locale, { name: 'today' })} className="text-link mt-8 inline-block">
          {t(locale, 'action.back')}
        </Link>
      </main>

      <MobileNav locale={locale} route={route} />
    </>
  );
}
