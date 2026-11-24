import Link from 'next/link';

import { t, type Locale } from '@/lib/i18n';
import { routePath, type Route } from '@/lib/platform/routes';

import { LanguageSwitcher } from './language-switcher';

/**
 * En-tête commun (structure seulement : la mise en forme définitive est
 * l'objet de P1.5). Le logotype n'y figure pas encore : il doit être une image
 * propre, pas un texte recomposé (DESIGN.md §7.1.1).
 */
export type SiteHeaderProps = {
  readonly locale: Locale;
  /** Route courante, pour que le sélecteur reste sur la même page. */
  readonly route: Route;
};

export function SiteHeader({ locale, route }: SiteHeaderProps) {
  const targets = {
    pt: routePath('pt', route),
    fr: routePath('fr', route),
    en: routePath('en', route),
  } satisfies Record<Locale, string>;

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line py-4">
      <nav aria-label={t(locale, 'nav.label')}>
        <ul className="flex items-center gap-6">
          <li>
            <Link
              href={routePath(locale, { name: 'today' })}
              aria-current={route.name === 'today' ? 'page' : undefined}
              className="text-sm font-medium text-ink underline decoration-line decoration-1 underline-offset-4 hover:decoration-terracotta aria-[current=page]:decoration-terracotta aria-[current=page]:decoration-2"
            >
              {t(locale, 'nav.today')}
            </Link>
          </li>
          <li>
            <Link
              href={routePath(locale, { name: 'week' })}
              aria-current={route.name === 'week' ? 'page' : undefined}
              className="text-sm font-medium text-ink underline decoration-line decoration-1 underline-offset-4 hover:decoration-terracotta aria-[current=page]:decoration-terracotta aria-[current=page]:decoration-2"
            >
              {t(locale, 'nav.week')}
            </Link>
          </li>
        </ul>
      </nav>

      <LanguageSwitcher locale={locale} label={t(locale, 'language.label')} targets={targets} />
    </header>
  );
}
