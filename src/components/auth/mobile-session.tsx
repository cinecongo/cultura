'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

import { mobileCurrentUser } from '@/lib/auth/mobile-session.native';
import { isLocale, t, type Locale, type StringKey } from '@/lib/i18n';

import { AuthShell } from './auth-shell';
import { MobileAccount } from './mobile-account';
import { MobileSignInForm } from './mobile-signin-form';

type Screen = 'signin' | 'account';

/**
 * Écran d'entrée de l'APK (ADR-001 §1, ADR-008).
 *
 * Capacitor sert `index.html` pour tout chemin sans extension (`html5mode`) :
 * la racine doit donc être l'écran de session lui-même, pas le résolveur de
 * langue du site public. Aucun lien ni navigation n'est nécessaire : la session
 * est vérifiée auprès de Supabase, puis l'un des deux écrans est affiché.
 */
const COPY: Record<Screen, { readonly label: StringKey; readonly lead?: StringKey }> = {
  signin: { label: 'auth.signin.title', lead: 'auth.signin.lead' },
  account: { label: 'auth.account.title' },
};

function subscribe(): () => void {
  return () => undefined;
}

function browserLocale(): Locale {
  const detected = navigator.language.slice(0, 2).toLowerCase();
  return isLocale(detected) ? detected : 'pt';
}

export function MobileSession() {
  // `useSyncExternalStore` garde le même rendu côté serveur (build statique)
  // et côté WebView, sans setState dans un effet.
  const locale = useSyncExternalStore<Locale>(subscribe, browserLocale, () => 'pt');
  const [screen, setScreen] = useState<Screen | null>(null);

  useEffect(() => {
    void mobileCurrentUser().then((user) => setScreen(user ? 'account' : 'signin'));
  }, []);

  const copy = screen ? COPY[screen] : null;

  return (
    <AuthShell
      locale={locale}
      route={{ name: screen ?? 'signin' }}
      title={t(locale, copy?.label ?? 'auth.guard.checking')}
      lead={copy?.lead ? t(locale, copy.lead) : undefined}
    >
      {screen === null ? null : screen === 'signin' ? (
        <MobileSignInForm locale={locale} onSuccess={() => setScreen('account')} />
      ) : (
        <MobileAccount locale={locale} onSignedOut={() => setScreen('signin')} />
      )}
    </AuthShell>
  );
}
