'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { t, type Locale } from '@/lib/i18n';

/** Déconnexion serveur : révocation du refresh token, pas seulement du cookie. */
export function SignoutButton({ locale }: { readonly locale: Locale }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function signout(): Promise<void> {
    if (busy) return;
    setBusy(true);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('logout_failed');
      setFeedback(t(locale, 'auth.signout.success'));
      router.replace('/');
    } catch {
      setFeedback(t(locale, 'auth.error.retry'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={() => void signout()}
        disabled={busy}
        aria-disabled={busy}
        className="type-body min-h-11 rounded-control border border-line bg-paper px-5 py-3 text-ink disabled:opacity-40"
      >
        {t(locale, 'auth.signout.label')}
      </button>
      {feedback ? (
        <p role="status" aria-live="polite" className="type-body mt-3 text-stone">
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
