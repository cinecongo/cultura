import 'server-only';

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { decideSpaceAccess, guardSpaceLocale, type RoleSpace } from '@/lib/auth/guard';
import { isLocale, t, type Locale } from '@/lib/i18n';
import { routePath, segmentsFor } from '@/lib/platform';
import { pageMetadata } from '@/lib/seo';

import { AuthShell } from './auth-shell';

type PageProps = { params: Promise<{ locale: string }> };

const SPACE_COPY = {
  actorSpace: {
    titleKey: 'auth.actor.title',
    leadKey: 'auth.actor.lead',
    metaTitleKey: 'meta.actor.title',
    metaDescriptionKey: 'meta.actor.description',
  },
  adminSpace: {
    titleKey: 'auth.admin.title',
    leadKey: 'auth.admin.lead',
    metaTitleKey: 'meta.admin.title',
    metaDescriptionKey: 'meta.admin.description',
  },
} as const;

/** Fabrique de `generateMetadata` : aucune lecture de session ici. */
export function spacePageMetadata(space: RoleSpace, segment: string) {
  return async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale: rawLocale } = await params;
    if (!isLocale(rawLocale) || segmentsFor(rawLocale)[space] !== segment) return {};

    // Un refus ne doit pas exposer le titre de l'espace protégé, même dans le
    // `<title>` : les métadonnées suivent la même décision que la page.
    const decision = await decideSpaceAccess(rawLocale, space);
    if (decision.kind !== 'allowed') {
      return pageMetadata(
        rawLocale,
        { name: space },
        t(rawLocale, 'meta.guard.title'),
        t(rawLocale, 'meta.guard.description'),
      );
    }

    const copy = SPACE_COPY[space];
    return pageMetadata(
      rawLocale,
      { name: space },
      t(rawLocale, copy.metaTitleKey),
      t(rawLocale, copy.metaDescriptionKey),
    );
  };
}

function refused(locale: Locale, space: RoleSpace) {
  return (
    <AuthShell
      locale={locale}
      route={{ name: space }}
      title={t(locale, 'auth.guard.forbidden.title')}
      lead={t(locale, 'auth.guard.forbidden.roleLead')}
    >
      <Link href={routePath(locale, { name: 'account' })} className="text-link mt-8 inline-block">
        {t(locale, 'auth.account.title')}
      </Link>
    </AuthShell>
  );
}

/** Fabrique de page protégée : la décision est prise côté serveur avant tout rendu. */
export function spacePage(space: RoleSpace, segment: string) {
  return async function Page({ params }: PageProps) {
    const { locale: rawLocale } = await params;
    const locale = guardSpaceLocale(rawLocale, segment, space);
    const decision = await decideSpaceAccess(locale, space);

    if (decision.kind === 'anonymous') {
      redirect(routePath(locale, { name: 'signin' }));
    }

    if (decision.kind === 'forbidden') {
      return refused(locale, space);
    }

    const copy = SPACE_COPY[space];
    return (
      <AuthShell
        locale={locale}
        route={{ name: space }}
        title={t(locale, copy.titleKey)}
        lead={t(locale, copy.leadKey)}
      >
        <div data-space-content={space} aria-hidden="true" className="hidden" />
      </AuthShell>
    );
  };
}
