'use client';

import { useEffect, useRef } from 'react';

import { t, type Locale } from '@/lib/i18n';
import { getPublicEnv } from '@/lib/env';
import { SITE_KEY_TEST_PATTERN, type TurnstileAction } from '@/lib/auth/validation';

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: { sitekey: string; action: string; callback: (token: string) => void },
  ) => string | undefined;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    onCulturaTurnstileLoad?: () => void;
  }
}

export type TurnstileFieldProps = {
  readonly locale: Locale;
  readonly action: TurnstileAction;
  readonly onToken: (token: string) => void;
};

// Jeton fictif officiel accepté par la clé secrète de test de Cloudflare.
const TEST_TOKEN = 'XXXX.DUMMY.TOKEN.XXXX';

/**
 * Le jeton n'est jamais lu depuis le DOM par le serveur : il est envoyé dans
 * le corps JSON à une route qui appelle `siteverify` côté serveur.
 *
 * Avec une clé de site de test (O7), le jeton est fourni localement : le e2e
 * prouve le câblage de `siteverify`, PAS le filtrage d'un vrai bot. En
 * production, seul le widget Cloudflare alimente le champ.
 */
export function TurnstileField({ locale, action, onToken }: TurnstileFieldProps) {
  const siteKey = getPublicEnv().NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (SITE_KEY_TEST_PATTERN.test(siteKey)) {
      onToken(TEST_TOKEN);
      return;
    }
    if (!siteKey || !host.current) return;

    const container = host.current;
    const render = () => {
      if (!window.turnstile) return;
      window.turnstile.render(container, {
        sitekey: siteKey,
        action,
        callback: (token) => onToken(token),
      });
    };

    window.onCulturaTurnstileLoad = render;
    if (window.turnstile) {
      render();
      return;
    }

    const script = document.createElement('script');
    script.src =
      'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onCulturaTurnstileLoad';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      window.onCulturaTurnstileLoad = undefined;
      script.remove();
    };
  }, [siteKey, action, onToken]);

  return (
    <fieldset className="mt-5 border-t border-line pt-5">
      <legend className="type-meta text-stone">{t(locale, 'auth.captcha.label')}</legend>
      {SITE_KEY_TEST_PATTERN.test(siteKey) ? null : <div ref={host} className="mt-2 min-h-12" />}
    </fieldset>
  );
}
