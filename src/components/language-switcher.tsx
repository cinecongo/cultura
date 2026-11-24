'use client';

import Link from 'next/link';

import { serializeLocaleCookie } from '@/lib/i18n/cookie';
import { htmlLangFor, localeLabels, locales, type Locale } from '@/lib/i18n/locale';

/**
 * Sélecteur de langue (ADR-002 §3).
 *
 * Composant client volontairement minuscule : il ne reçoit que des chemins
 * déjà calculés côté serveur et le libellé traduit. Il ne connaît ni les
 * catalogues, ni les routes, ni l'environnement.
 */
export type LanguageSwitcherProps = {
  readonly locale: Locale;
  /** Libellé accessible du groupe de liens, déjà traduit. */
  readonly label: string;
  /** Chemin de la page courante dans chaque langue. */
  readonly targets: Record<Locale, string>;
};

/**
 * Mémorise le choix de langue. Seul effet de bord du sélecteur, isolé hors du
 * corps du composant : la navigation reste confiée au lien.
 */
function rememberLocale(next: Locale): void {
  document.cookie = serializeLocaleCookie(next);
}

export function LanguageSwitcher({ locale, label, targets }: LanguageSwitcherProps) {
  return (
    <nav aria-label={label} className="flex items-center gap-3">
      <ul className="flex items-center gap-3">
        {locales.map((item) => (
          <li key={item}>
            <Link
              href={targets[item]}
              hrefLang={htmlLangFor(item)}
              lang={htmlLangFor(item)}
              aria-current={item === locale ? 'true' : undefined}
              onClick={() => rememberLocale(item)}
              className="text-xs font-medium tracking-[0.08em] text-stone uppercase underline decoration-line decoration-1 underline-offset-4 hover:text-terracotta-text aria-[current]:text-ink aria-[current]:decoration-terracotta aria-[current]:decoration-2"
            >
              {localeLabels[item]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
