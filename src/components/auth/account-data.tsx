'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import { t, tp, type Locale, type PluralKey, type StringKey } from '@/lib/i18n';
import { routePath } from '@/lib/platform';

type Feedback = { readonly key: StringKey | PluralKey; readonly count?: number };

const ERROR_KEYS: readonly (StringKey | PluralKey)[] = [
  'auth.error.generic',
  'auth.error.retry',
  'auth.error.tooManyRequests',
  'auth.account.export.error',
  'auth.account.delete.error.password',
  'auth.account.delete.error.phrase',
  'auth.account.delete.error.journaled',
];

function feedbackFrom(payload: unknown): Feedback {
  const raw =
    typeof payload === 'object' && payload !== null && 'errorKey' in payload
      ? (payload as { errorKey: unknown }).errorKey
      : null;
  const key = ERROR_KEYS.find((candidate) => candidate === raw);
  if (!key) return { key: 'auth.error.generic' };
  if (key === 'auth.error.tooManyRequests') {
    const count =
      typeof payload === 'object' && payload !== null && 'count' in payload
        ? (payload as { count: unknown }).count
        : null;
    return { key, count: typeof count === 'number' ? count : 3600 };
  }
  return { key };
}

function feedbackText(locale: Locale, feedback: Feedback): string {
  return feedback.key === 'auth.error.tooManyRequests'
    ? tp(locale, feedback.key as PluralKey, feedback.count ?? 3600)
    : t(locale, feedback.key as StringKey);
}

/** Bloc « données du compte » : export complet et suppression irréversible. */
export function AccountData({ locale }: { readonly locale: Locale }) {
  const router = useRouter();
  const [busy, setBusy] = useState<'export' | 'delete' | null>(null);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [status, setStatus] = useState<StringKey | null>(null);
  const [error, setError] = useState<Feedback | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const phraseRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) phraseRef.current?.focus();
  }, [open]);

  async function post(path: string, body: string): Promise<Response> {
    return fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    });
  }

  async function exportData(): Promise<void> {
    if (busy) return;
    setBusy('export');
    setError(null);
    setStatus(null);
    try {
      const response = await post('/api/account/export', '{}');
      if (!response.ok) {
        setError(feedbackFrom(await response.json().catch(() => null)));
        return;
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = `cultura-${locale}.json`;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatus('auth.account.export.success');
    } catch {
      setError({ key: 'auth.account.export.error' });
    } finally {
      setBusy(null);
    }
  }

  function closeForm(): void {
    setOpen(false);
    setPassword('');
    setConfirmPhrase('');
    setError(null);
    triggerRef.current?.focus();
  }

  async function deleteAccount(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (busy) return;
    setBusy('delete');
    setError(null);
    try {
      const response = await post(
        '/api/account/delete',
        JSON.stringify({ password, confirmPhrase }),
      );
      if (!response.ok) {
        setError(feedbackFrom(await response.json().catch(() => null)));
        return;
      }
      router.replace(routePath(locale, { name: 'today' }));
    } catch {
      setError({ key: 'auth.error.generic' });
    } finally {
      setBusy(null);
    }
  }

  const errorText = error ? feedbackText(locale, error) : null;

  return (
    <section aria-labelledby="account-data-title" className="mt-12 border-t border-line pt-8">
      <h2 id="account-data-title" className="type-h2 text-ink">
        {t(locale, 'auth.account.data.title')}
      </h2>
      <p className="type-body-lg mt-3 max-w-[64ch] text-stone">
        {t(locale, 'auth.account.data.lead')}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void exportData()}
          disabled={busy !== null}
          aria-disabled={busy !== null}
          aria-busy={busy === 'export'}
          className="type-body min-h-11 rounded-control border border-line bg-paper px-5 py-3 text-ink disabled:opacity-40"
        >
          {busy === 'export'
            ? t(locale, 'auth.account.export.submitting')
            : t(locale, 'auth.account.export.submit')}
        </button>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          disabled={busy !== null}
          aria-disabled={busy !== null}
          aria-expanded={open}
          aria-controls="account-delete-form"
          className="type-body min-h-11 rounded-control border border-terracotta-text bg-paper px-5 py-3 text-terracotta-text disabled:opacity-40"
        >
          {t(locale, 'auth.account.delete.open')}
        </button>
      </div>

      {status ? (
        <p role="status" aria-live="polite" className="type-body mt-4 text-ink">
          {t(locale, status)}
        </p>
      ) : null}

      {open ? (
        <form
          id="account-delete-form"
          onSubmit={(event) => void deleteAccount(event)}
          className="mt-8 border-t border-line pt-8"
        >
          <fieldset disabled={busy !== null}>
            <legend className="type-h3 text-ink">{t(locale, 'auth.account.delete.open')}</legend>
            {errorText ? (
              <p role="alert" aria-live="assertive" className="type-body mt-4 text-terracotta-text">
                {errorText}
              </p>
            ) : null}
            <p className="type-body mt-4 max-w-[64ch] text-ink">
              {t(locale, 'auth.account.delete.warning')}
            </p>

            <div className="mt-6">
              <label htmlFor="account-delete-phrase" className="type-body block text-ink">
                {t(locale, 'auth.account.delete.confirmPhrase.label')}
              </label>
              <output className="type-h3 mt-2 block text-ink">
                {t(locale, 'auth.account.delete.confirmPhrase.value')}
              </output>
              <input
                ref={phraseRef}
                id="account-delete-phrase"
                name="confirmPhrase"
                type="text"
                required
                autoComplete="off"
                value={confirmPhrase}
                onChange={(event) => setConfirmPhrase(event.target.value)}
                aria-invalid={error?.key === 'auth.account.delete.error.phrase' ? true : undefined}
                aria-describedby={
                  error?.key === 'auth.account.delete.error.phrase'
                    ? 'account-delete-phrase-error'
                    : undefined
                }
                className="type-body mt-2 min-h-12 w-full rounded-control border border-line bg-paper px-3 text-ink"
              />
              {error?.key === 'auth.account.delete.error.phrase' && errorText ? (
                <p id="account-delete-phrase-error" className="type-body mt-2 text-terracotta-text">
                  {errorText}
                </p>
              ) : null}
            </div>

            <div className="mt-6">
              <label htmlFor="account-delete-password" className="type-body block text-ink">
                {t(locale, 'auth.field.password')}
              </label>
              <input
                id="account-delete-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={
                  error?.key === 'auth.account.delete.error.password' ? true : undefined
                }
                aria-describedby={
                  error?.key === 'auth.account.delete.error.password'
                    ? 'account-delete-password-error'
                    : undefined
                }
                className="type-body mt-2 min-h-12 w-full rounded-control border border-line bg-paper px-3 text-ink"
              />
              {error?.key === 'auth.account.delete.error.password' && errorText ? (
                <p
                  id="account-delete-password-error"
                  className="type-body mt-2 text-terracotta-text"
                >
                  {errorText}
                </p>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={busy !== null}
                aria-disabled={busy !== null}
                aria-busy={busy === 'delete'}
                className="type-body min-h-11 rounded-control border border-terracotta-text bg-paper px-5 py-3 text-terracotta-text disabled:opacity-40"
              >
                {busy === 'delete'
                  ? t(locale, 'auth.account.delete.submitting')
                  : t(locale, 'auth.account.delete.submit')}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="type-body min-h-11 rounded-control border border-line bg-paper px-5 py-3 text-ink"
              >
                {t(locale, 'auth.account.delete.cancel')}
              </button>
            </div>
          </fieldset>
        </form>
      ) : null}
    </section>
  );
}
