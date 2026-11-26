import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { MobileNav } from '@/components/mobile-nav';
import { SiteHeader } from '@/components/site-header';
import { TimeRuler, type RulerEvent } from '@/components/time-ruler';
import { isLocale, t } from '@/lib/i18n';
import { routePath } from '@/lib/platform';
import { pageMetadata } from '@/lib/seo';
import { defaultCity } from '@/lib/site';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return pageMetadata(
    locale,
    { name: 'today' },
    t(locale, 'meta.home.title'),
    t(locale, 'meta.home.description'),
  );
}

/** Programme du jour. La base arrive en P2/P3 : la liste est vide, pas simulée. */
const TODAY_EVENTS: readonly RulerEvent[] = [];

/**
 * Page « Aujourd'hui » (P1.4, mise en forme P1.5).
 *
 * L'aplat charbon porte le titre et la réglette — le seul moment
 * « spectaculaire » du produit (DESIGN.md §6 et §9.1). Aucune date n'est
 * affichée : elle serait figée au build dans l'export mobile, et une date
 * fausse est pire qu'une date absente. Elle revient avec les données (P3).
 */
export default async function TodayPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <>
      <SiteHeader locale={locale} route={{ name: 'today' }} />

      <main id="conteudo" className="page-mobile-nav flex flex-col">
        <section className="surface-ink bg-ink text-paper">
          <div className="mx-auto w-full max-w-[680px] px-4 pt-8 pb-10 md:px-6 md:pt-12 md:pb-14">
            <p className="type-meta text-stone-light">{t(locale, 'home.eyebrow')}</p>
            <h1 className="type-h1 mt-2 text-paper">{t(locale, 'home.title')}</h1>
            <p className="type-body-lg mt-3 max-w-[64ch] text-stone-light">
              {t(locale, 'home.lead')}
            </p>

            <TimeRuler locale={locale} label={t(locale, 'ruler.label')} events={TODAY_EVENTS} />
          </div>
        </section>

        <section className="mx-auto w-full max-w-[680px] px-4 pt-10 pb-16 md:px-6 md:pt-14">
          <div className="flex flex-col gap-4 border-t border-line pt-6">
            <h2 className="type-h2 max-w-[64ch] text-ink">
              {t(locale, 'home.empty.title', { city: defaultCity })}
            </h2>
            <Link href={routePath(locale, { name: 'week' })} className="text-link self-start">
              {t(locale, 'home.empty.action')}
            </Link>
          </div>
        </section>
      </main>

      <MobileNav locale={locale} route={{ name: 'today' }} />
    </>
  );
}
