import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AUTH_LEAD, AUTH_META } from '@/lib/auth/page-copy';
import { isLocale, t, type Locale, type StringKey } from '@/lib/i18n';

/** Clés explicites : aucun cast dynamique ne contourne le typage i18n. */
const VISIBLE_TITLE: Record<'signin' | 'account', StringKey> = {
  signin: 'auth.signin.title',
  account: 'auth.account.title',
};
import { segmentsFor } from '@/lib/platform';
import { pageMetadata } from '@/lib/seo';

import { AuthShell } from './auth-shell';
import { MobileAccount } from './mobile-account';
import { MobileSignInForm } from './mobile-signin-form';

type PageProps = { params: Promise<{ locale: string }> };

/** Pages de session de l'APK : mêmes clés i18n et même coquille que le web. */
export function mobileAuthPage(name: 'signin' | 'account', segment: string) {
  function guard(rawLocale: string): Locale {
    if (!isLocale(rawLocale) || segmentsFor(rawLocale)[name] !== segment) notFound();
    return rawLocale;
  }

  return {
    async generateMetadata({ params }: PageProps): Promise<Metadata> {
      const { locale: rawLocale } = await params;
      if (!isLocale(rawLocale) || segmentsFor(rawLocale)[name] !== segment) return {};
      return pageMetadata(
        rawLocale,
        { name },
        t(rawLocale, AUTH_META[name].title),
        t(rawLocale, AUTH_META[name].description),
      );
    },
    async Page({ params }: PageProps) {
      const locale = guard((await params).locale);
      const lead = AUTH_LEAD[name] as StringKey | undefined;

      return (
        <AuthShell
          locale={locale}
          route={{ name }}
          title={t(locale, VISIBLE_TITLE[name])}
          lead={lead ? t(locale, lead) : undefined}
        >
          {name === 'signin' ? (
            <MobileSignInForm locale={locale} />
          ) : (
            <MobileAccount locale={locale} />
          )}
        </AuthShell>
      );
    },
  };
}
