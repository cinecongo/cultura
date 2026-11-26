import Link from 'next/link';

import { t, type Locale } from '@/lib/i18n';
import { routePath, type Route } from '@/lib/platform';

/**
 * Barre basse mobile (DESIGN.md §7.2).
 *
 * Deux entrées seulement : « Aujourd'hui » et « Cette semaine » existent.
 * « Acteurs culturels » et « Villes » n'ont pas encore de page ; les afficher
 * serait un faux bouton. La barre complète arrive avec les sections (P3/P4).
 *
 * `env(safe-area-inset-bottom)` garde les cibles au-dessus de la zone gestuelle
 * des téléphones à encoche. Chaque item fait 56 px de haut et la moitié de la
 * largeur : bien au-delà des 48 px exigés.
 */
export type MobileNavProps = {
  readonly locale: Locale;
  /** Route courante, pour marquer l'item actif. */
  readonly route: Route;
};

const ITEMS = [
  { route: { name: 'today' }, key: 'nav.today' },
  { route: { name: 'week' }, key: 'nav.week' },
] as const;

/** Calendrier avec le jour marqué. */
function TodayIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2.75" y="4.25" width="14.5" height="13" rx="1" />
      <path d="M2.75 8.25h14.5M6.5 2.75v3M13.5 2.75v3" strokeLinecap="round" />
      <circle cx="10" cy="12.5" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Calendrier avec une plage de sept jours. */
function WeekIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2.75" y="4.25" width="14.5" height="13" rx="1" />
      <path d="M2.75 8.25h14.5M6.5 2.75v3M13.5 2.75v3" strokeLinecap="round" />
      <path d="M6.5 12.5h7" strokeLinecap="round" />
    </svg>
  );
}

export function MobileNav({ locale, route }: MobileNavProps) {
  return (
    <nav
      aria-label={t(locale, 'nav.mobile')}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto flex max-w-[680px]">
        {ITEMS.map((item) => (
          <li key={item.key} className="flex-1">
            <Link
              href={routePath(locale, item.route)}
              aria-current={route.name === item.route.name ? 'page' : undefined}
              className="mobile-nav-link"
            >
              {item.route.name === 'today' ? <TodayIcon /> : <WeekIcon />}
              <span>{t(locale, item.key)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
