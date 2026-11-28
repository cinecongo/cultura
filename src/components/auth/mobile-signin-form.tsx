'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

import { MOBILE_ISSUE_KEYS, mobileSignIn } from '@/lib/auth/mobile-session.native';
import { t, tp, type Locale } from '@/lib/i18n';
import { routePath } from '@/lib/platform';

/** Empreinte de la fenêtre de limitation de Supabase Auth (guide §7.2). */
const RETRY_SECONDS = 30;

type FieldProps = {
  readonly id: string;
  readonly label: string;
  readonly type: 'email' | 'password';
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly autoComplete: string;
};

function Field({ id, label, type, value, onChange, autoComplete }: FieldProps) {
  return (
    <div className="mt-5">
      <label htmlFor={id} className="type-body block text-ink">
        {label} <span aria-hidden="true">*</span>
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required
        aria-required="true"
        className="type-body mt-2 min-h-12 w-full rounded-control border border-line bg-paper px-3 text-ink"
      />
    </div>
  );
}

/**
 * Connexion dans la WebView Capacitor — ADR-001 §1 et ADR-008.
 *
 * Aucune route API n'existe dans l'export statique : l'appel Supabase est
 * direct, avec la clé `anon` et la session en stockage sécurisé. Les seuls
 * textes affichés viennent des catalogues PT/FR/EN.
 */
export function MobileSignInForm({
  locale,
  onSuccess,
}: {
  readonly locale: Locale;
  /** Écran unique de l'APK : aucun changement d'URL n'est alors nécessaire. */
  readonly onSuccess?: () => void;
}) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [retryIn, setRetryIn] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (retryIn <= 0) return;
    const timer = setTimeout(
      () =>
        setRetryIn((value) => {
          const next = Math.max(0, value - 1);
          if (next === 0) setFeedback(null);
          return next;
        }),
      1000,
    );
    return () => clearTimeout(timer);
  }, [retryIn]);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (busy || retryIn > 0) return;

    setBusy(true);
    setFeedback(null);
    const result = await mobileSignIn(email, password);

    if (result.ok) {
      if (onSuccess) onSuccess();
      else router.replace(routePath(locale, { name: 'account' }));
      return;
    }

    if (result.issue === 'rate_limited') {
      setRetryIn(RETRY_SECONDS);
      setFeedback(tp(locale, 'auth.error.tooManyRequests', RETRY_SECONDS));
    } else {
      setFeedback(t(locale, MOBILE_ISSUE_KEYS[result.issue]));
    }
    setBusy(false);
  }

  const disabled = busy || retryIn > 0;

  return (
    <form
      onSubmit={(event) => void submit(event)}
      data-hydrated={hydrated ? 'true' : undefined}
      className="mt-8"
    >
      <p className="type-meta text-stone">{t(locale, 'auth.form.requiredLegend')}</p>

      <Field
        id="email"
        label={t(locale, 'auth.field.email')}
        type="email"
        value={email}
        onChange={setEmail}
        autoComplete="email"
      />
      <Field
        id="password"
        label={t(locale, 'auth.field.password')}
        type="password"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
      />

      {feedback ? (
        <p
          role="alert"
          aria-live="assertive"
          className="type-body mt-5 border-l-2 border-terracotta pl-3 text-terracotta-text"
        >
          {feedback}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={disabled}
        aria-disabled={disabled}
        className="type-body mt-6 min-h-11 w-full rounded-control bg-ink px-5 py-3 text-paper disabled:opacity-40 md:w-auto"
      >
        {busy ? t(locale, 'auth.signin.submitting') : t(locale, 'auth.signin.submit')}
      </button>
    </form>
  );
}
