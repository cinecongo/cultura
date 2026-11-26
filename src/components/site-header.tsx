import Link from 'next/link';

import { t, type Locale } from '@/lib/i18n';
import { routePath, type Route } from '@/lib/platform';
import { brandName } from '@/lib/site';

import { LanguageSwitcher } from './language-switcher';

/**
 * En-tête commun (DESIGN.md §7.1).
 *
 * Le logotype est **une image**, jamais recomposé en HTML (DESIGN.md §7.1.1).
 * `public/brand/logo.svg` est un recadrage du fichier fourni : mêmes tracés,
 * boîte englobante mesurée, fond crème retiré. Le master nettoyé (couleurs
 * normalisées, bruit retiré) reste attendu — voir DESIGN.md §15.
 *
 * Les entrées absentes (recherche, compte, Atores, Cidades) ne sont pas
 * affichées : un lien vers une page qui n'existe pas serait un faux bouton.
 */
export type SiteHeaderProps = {
  readonly locale: Locale;
  /** Route courante, pour que le sélecteur reste sur la même page. */
  readonly route: Route;
};

const NAV_ITEMS = [
  { route: { name: 'today' }, key: 'nav.today' },
  { route: { name: 'week' }, key: 'nav.week' },
] as const;

export function SiteHeader({ locale, route }: SiteHeaderProps) {
  const targets = {
    pt: routePath('pt', route),
    fr: routePath('fr', route),
    en: routePath('en', route),
  } satisfies Record<Locale, string>;

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-14 w-full max-w-[1120px] items-center justify-between gap-6 px-4 md:h-16 md:px-6">
        <Link
          href={routePath(locale, { name: 'today' })}
          className="flex min-h-11 shrink-0 items-center"
        >
          {/* SVG maîtrisé et versionné : aucune optimisation d'image nécessaire,
              et `dangerouslyAllowSVG` reste inutile. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo.svg"
            alt={brandName}
            width={92}
            height={28}
            className="h-6 w-auto md:h-7"
          />
        </Link>

        <div className="flex items-center gap-6 md:gap-8">
          <nav aria-label={t(locale, 'nav.label')} className="hidden md:block">
            <ul className="flex items-center gap-6">
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  <Link
                    href={routePath(locale, item.route)}
                    aria-current={route.name === item.route.name ? 'page' : undefined}
                    className="nav-link"
                  >
                    {t(locale, item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <LanguageSwitcher locale={locale} label={t(locale, 'language.label')} targets={targets} />
        </div>
      </div>
    </header>
  );
}
