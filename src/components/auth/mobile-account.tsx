'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import {
  mobileCurrentUser,
  mobileSignOut,
  type MobileUser,
} from '@/lib/auth/mobile-session.native';
import { t, type Locale } from '@/lib/i18n';
import { routePath } from '@/lib/platform';

/** Écran « compte » de l'APK : preuve que la session a été vérifiée en ligne. */
export function MobileAccount({
  locale,
  onSignedOut,
}: {
  readonly locale: Locale;
  /** Retour à l'écran de connexion quand l'APK n'utilise qu'une seule page. */
  readonly onSignedOut?: () => void;
}) {
  const [user, setUser] = useState<MobileUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    let active = true;
    void mobileCurrentUser().then((current) => {
      if (!active) return;
      setUser(current);
      setChecking(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const signOut = useCallback(async () => {
    await mobileSignOut();
    setUser(null);
    setSignedOut(true);
    onSignedOut?.();
  }, [onSignedOut]);

  if (checking) {
    return <p className="type-body mt-8 text-stone">{t(locale, 'auth.guard.checking')}</p>;
  }

  if (!user) {
    return (
      <>
        <p className="type-body mt-8 text-ink" role="status">
          {signedOut
            ? t(locale, 'auth.signout.success')
            : t(locale, 'auth.guard.signInRequired.lead')}
        </p>
        <Link href={routePath(locale, { name: 'signin' })} className="text-link mt-8 inline-block">
          {t(locale, 'auth.signin.submit')}
        </Link>
      </>
    );
  }

  return (
    <>
      <p data-session-email className="type-body mt-8 text-ink">
        {user.email}
      </p>
      <button
        type="button"
        onClick={() => void signOut()}
        className="type-body mt-8 min-h-11 rounded-control border border-line bg-paper px-5 py-3 text-ink"
      >
        {t(locale, 'auth.signout.label')}
      </button>
      <Link href={routePath(locale, { name: 'today' })} className="text-link mt-8 block">
        {t(locale, 'auth.guard.backHome')}
      </Link>
    </>
  );
}
