'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type FormEvent } from 'react';

import { parseAuthCallbackFragment } from '@/lib/auth/callback-url';
import { t, tp, type Locale, type PluralKey, type StringKey } from '@/lib/i18n';
import { routePath } from '@/lib/platform';

import { TurnstileField } from './turnstile-field';

export type AuthMode = 'signup' | 'signin' | 'reset' | 'password' | 'verify';

type ApiError = { readonly errorKey?: unknown; readonly count?: unknown };
type ApiResult = {
  readonly status?: string;
  readonly kind?: string;
  readonly redirectTo?: string;
} & ApiError;

const ENDPOINTS: Record<Exclude<AuthMode, 'verify'>, string> = {
  signup: '/api/auth/signup',
  signin: '/api/auth/signin',
  reset: '/api/auth/reset',
  password: '/api/auth/password',
};

const SIGNUP_EMAIL_KEY = 'cultura:signup-email';

function messageFor(error: ApiError, locale: Locale): string {
  if (typeof error.errorKey !== 'string') return t(locale, 'auth.error.generic');
  if (typeof error.count === 'number') {
    return tp(locale, error.errorKey as PluralKey, error.count);
  }
  if (error.errorKey === 'validation.required') {
    return t(locale, 'validation.required', { field: t(locale, 'auth.field.name') });
  }
  return t(locale, error.errorKey as StringKey);
}

type FieldProps = {
  readonly id: string;
  readonly label: string;
  readonly type: 'text' | 'email' | 'password';
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

export function AuthForm({ locale, mode }: { readonly locale: Locale; readonly mode: AuthMode }) {
  const router = useRouter();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [terms, setTerms] = useState(false);
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<'ok' | 'error'>('ok');
  const [hydrated, setHydrated] = useState(false);

  const onToken = useCallback((value: string) => setToken(value), []);

  // Marqueur de montage : les formulaires deviennent pilotables seulement
  // après hydratation. Les parcours e2e attendent ce marqueur avant de remplir.
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
    if (mode !== 'verify' || typeof window === 'undefined') return;

    let cancelled = false;
    // Différé d'un microtask : aucun setState synchrone dans le corps de
    // l'effet (React 19), tout en gardant le fragment hors des requêtes HTTP.
    void Promise.resolve().then(() => {
      if (cancelled) return;

      const parsed = parseAuthCallbackFragment(window.location.hash);
      if (!parsed) {
        const saved = window.sessionStorage.getItem(SIGNUP_EMAIL_KEY);
        if (saved) {
          setFeedback(t(locale, 'auth.verify.sent', { email: saved }));
          setFeedbackTone('ok');
        }
        return;
      }

      setBusy(true);
      setFeedback(t(locale, 'auth.verify.checking'));
      setFeedbackTone('ok');

      fetch('/api/auth/callback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          token_hash: parsed.tokenHash,
          type: parsed.type,
          locale,
        }),
      })
        .then(async (response) => {
          const payload = (await response.json()) as ApiResult;
          if (!response.ok) throw payload;
          return payload;
        })
        .then((payload) => {
          if (cancelled) return;
          window.history.replaceState(null, '', window.location.pathname);
          if (payload.kind === 'password' && payload.redirectTo) {
            router.replace(payload.redirectTo);
            return;
          }
          window.sessionStorage.removeItem(SIGNUP_EMAIL_KEY);
          setFeedback(t(locale, 'auth.verify.success'));
          setFeedbackTone('ok');
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          window.history.replaceState(null, '', window.location.pathname);
          setFeedback(messageFor((error ?? {}) as ApiError, locale));
          setFeedbackTone('error');
        })
        .finally(() => {
          if (!cancelled) setBusy(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [locale, mode, router]);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (busy) return;
    if (mode !== 'password' && token.length === 0) {
      setFeedback(t(locale, 'auth.captcha.error'));
      setFeedbackTone('error');
      return;
    }
    setBusy(true);
    setFeedback(null);

    const body: Record<string, unknown> = { locale };
    if (mode === 'signup') {
      Object.assign(body, { nom, email, password, terms, turnstileToken: token });
    } else if (mode === 'signin') {
      Object.assign(body, { email, password, turnstileToken: token });
    } else if (mode === 'reset' || mode === 'verify') {
      Object.assign(body, { email, turnstileToken: token });
    } else {
      Object.assign(body, { password, passwordConfirm });
    }

    try {
      const endpoint = mode === 'verify' ? '/api/auth/resend' : ENDPOINTS[mode];
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as ApiResult;
      if (!response.ok) throw payload;

      if (mode === 'signup') {
        window.sessionStorage.setItem(SIGNUP_EMAIL_KEY, email);
        setFeedback(t(locale, 'auth.verify.sent', { email }));
      } else if (mode === 'reset') {
        setFeedback(t(locale, 'auth.reset.sent', { email }));
      } else if (mode === 'password') {
        setFeedback(t(locale, 'auth.password.success'));
      } else if (mode === 'verify') {
        setFeedback(t(locale, 'auth.verify.resend.sent'));
      } else {
        router.replace(routePath(locale, { name: 'account' }));
      }
      setFeedbackTone('ok');
    } catch (error) {
      setFeedback(messageFor((error ?? {}) as ApiError, locale));
      setFeedbackTone('error');
    } finally {
      setBusy(false);
    }
  }

  const submitLabel =
    mode === 'signup'
      ? t(locale, 'auth.signup.submitting')
      : mode === 'signin'
        ? t(locale, 'auth.signin.submitting')
        : mode === 'reset'
          ? t(locale, 'auth.reset.submitting')
          : mode === 'password'
            ? t(locale, 'auth.password.submitting')
            : t(locale, 'auth.verify.resend.submit');

  const actionLabel =
    mode === 'signup'
      ? t(locale, 'auth.signup.submit')
      : mode === 'signin'
        ? t(locale, 'auth.signin.submit')
        : mode === 'reset'
          ? t(locale, 'auth.reset.submit')
          : mode === 'password'
            ? t(locale, 'auth.password.submit')
            : t(locale, 'auth.verify.resend.submit');

  return (
    <>
      <form
        onSubmit={(event) => void submit(event)}
        data-hydrated={hydrated ? 'true' : undefined}
        className="mt-8"
      >
        <p className="type-meta text-stone">{t(locale, 'auth.form.requiredLegend')}</p>

        {mode === 'signup' ? (
          <Field
            id="nom"
            label={t(locale, 'auth.field.name')}
            type="text"
            value={nom}
            onChange={setNom}
            autoComplete="name"
          />
        ) : null}

        {mode === 'signup' || mode === 'signin' || mode === 'reset' || mode === 'verify' ? (
          <Field
            id="email"
            label={t(locale, 'auth.field.email')}
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
          />
        ) : null}

        {mode === 'signin' || mode === 'signup' ? (
          <Field
            id="password"
            label={t(locale, 'auth.field.password')}
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          />
        ) : null}

        {mode === 'password' ? (
          <>
            <Field
              id="password"
              label={t(locale, 'auth.field.passwordNew')}
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
            />
            <Field
              id="passwordConfirm"
              label={t(locale, 'auth.field.passwordConfirm')}
              type="password"
              value={passwordConfirm}
              onChange={setPasswordConfirm}
              autoComplete="new-password"
            />
            <p className="type-meta mt-2 text-stone">{t(locale, 'auth.password.hint')}</p>
          </>
        ) : null}

        {mode === 'signup' ? (
          <>
            <div className="mt-5 flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                checked={terms}
                onChange={(event) => setTerms(event.target.checked)}
                required
                aria-required="true"
                className="mt-1 min-h-6 min-w-6"
              />
              <label htmlFor="terms" className="type-body text-ink">
                {t(locale, 'auth.signup.terms')}
              </label>
            </div>
            <p className="type-meta mt-2 text-stone">
              <span>{t(locale, 'auth.signup.termsLink')}</span>
              <span> · </span>
              <span>{t(locale, 'auth.signup.privacyLink')}</span>
            </p>
            <p className="type-meta mt-2 text-stone">{t(locale, 'auth.signup.roleNote')}</p>
          </>
        ) : null}

        {mode === 'signin' ? (
          <Link href={routePath(locale, { name: 'reset' })} className="text-link mt-4 inline-block">
            {t(locale, 'auth.signin.forgot')}
          </Link>
        ) : null}

        {mode !== 'password' ? (
          <TurnstileField
            locale={locale}
            action={mode === 'signup' ? 'signup' : mode === 'signin' ? 'signin' : 'reset'}
            onToken={onToken}
          />
        ) : null}

        {feedback ? (
          <p
            role={feedbackTone === 'error' ? 'alert' : 'status'}
            aria-live={feedbackTone === 'error' ? 'assertive' : 'polite'}
            className={`type-body mt-5 border-l-2 pl-3 ${
              feedbackTone === 'error'
                ? 'border-terracotta text-terracotta-text'
                : 'border-ink text-ink'
            }`}
          >
            {feedback}
          </p>
        ) : null}

        {mode === 'verify' ? (
          <p className="type-meta mt-5 text-stone">{t(locale, 'auth.verify.resend.label')}</p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          aria-disabled={busy}
          className="type-body mt-6 min-h-11 w-full rounded-control bg-ink px-5 py-3 text-paper disabled:opacity-40 md:w-auto"
        >
          {busy ? submitLabel : actionLabel}
        </button>

        {mode === 'signin' ? (
          <p className="type-body mt-6 text-stone">
            {t(locale, 'auth.signin.noAccount')}{' '}
            <Link href={routePath(locale, { name: 'signup' })} className="text-link">
              {t(locale, 'auth.signup.submit')}
            </Link>
          </p>
        ) : null}
      </form>

      {mode === 'signup' ? (
        <section className="mt-12 border-t border-line pt-6">
          <h2 className="type-h2 max-w-[64ch] text-ink">
            {t(locale, 'auth.signup.benefitsTitle')}
          </h2>
          <ul className="type-body mt-4 list-disc space-y-2 pl-5 text-stone">
            <li>{t(locale, 'auth.signup.benefit1')}</li>
            <li>{t(locale, 'auth.signup.benefit2')}</li>
            <li>{t(locale, 'auth.signup.benefit3')}</li>
            <li>{t(locale, 'auth.signup.benefit4')}</li>
          </ul>
        </section>
      ) : null}
    </>
  );
}
