import 'server-only';

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { AUTH_LEAD, AUTH_META, type AuthScreenName } from '@/lib/auth/page-copy';
import { currentProfile, type Role } from '@/lib/auth/session';
import { isLocale, t, type Locale, type StringKey } from '@/lib/i18n';
import { routePath, segmentsFor } from '@/lib/platform';
import { pageMetadata } from '@/lib/seo';

import { AccountData } from './account-data';
import { AuthForm } from './auth-form';
import { AuthShell } from './auth-shell';
import { SignoutButton } from './signout-button';

type PageProps = { params: Promise<{ locale: string }> };

const ALLOWED_ROLES: readonly Role[] = ['membre', 'acteur', 'editeur', 'admin'];

function guard(locale: string, name: AuthScreenName, segment: string): Locale {
  if (!isLocale(locale) || segmentsFor(locale)[name] !== segment) notFound();
  return locale;
}

/** Fabrique de `generateMetadata` pour un écran d'authentification localisé. */
export function authPageMetadata(name: AuthScreenName, segment: string) {
  return async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale } = await params;
    if (!isLocale(locale) || segmentsFor(locale)[name] !== segment) return {};
    return pageMetadata(
      locale,
      { name },
      t(locale, AUTH_META[name].title),
      t(locale, AUTH_META[name].description),
    );
  };
}

function screen(locale: Locale, name: AuthScreenName, content: ReactNode) {
  return (
    <AuthShell
      locale={locale}
      route={{ name }}
      title={t(locale, `auth.${name}.title` as StringKey)}
      lead={AUTH_LEAD[name] ? t(locale, AUTH_LEAD[name] as StringKey) : undefined}
    >
      {content}
    </AuthShell>
  );
}

/** Fabrique de page serveur. Le rôle est relu en base sur l'écran « compte ». */
export function authPage(name: AuthScreenName, segment: string) {
  return async function Page({ params }: PageProps) {
    const { locale: rawLocale } = await params;
    const locale = guard(rawLocale, name, segment);

    if (name !== 'account') {
      return screen(locale, name, <AuthForm locale={locale} mode={name} />);
    }

    const profile = await currentProfile();
    if (!profile) {
      return (
        <AuthShell
          locale={locale}
          route={{ name: 'account' }}
          title={t(locale, 'auth.guard.signInRequired.title')}
          lead={t(locale, 'auth.guard.signInRequired.lead')}
        >
          <Link
            href={routePath(locale, { name: 'signin' })}
            className="text-link mt-8 inline-block"
          >
            {t(locale, 'auth.signin.submit')}
          </Link>
        </AuthShell>
      );
    }

    if (!ALLOWED_ROLES.includes(profile.role)) {
      return (
        <AuthShell
          locale={locale}
          route={{ name: 'account' }}
          title={t(locale, 'auth.guard.forbidden.title')}
          lead={t(locale, 'auth.guard.forbidden.lead')}
        >
          <Link href={routePath(locale, { name: 'today' })} className="text-link mt-8 inline-block">
            {t(locale, 'auth.guard.backHome')}
          </Link>
        </AuthShell>
      );
    }

    return (
      <AuthShell
        locale={locale}
        route={{ name: 'account' }}
        title={t(locale, 'auth.account.title')}
      >
        <p className="type-body mt-8 text-ink">{profile.email}</p>
        <AccountData locale={locale} />
        <SignoutButton locale={locale} />
      </AuthShell>
    );
  };
}
