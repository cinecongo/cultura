import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SiteHeader } from '@/components/site-header';
import { isLocale, locales, t } from '@/lib/i18n';
import { routePath, segmentsFor } from '@/lib/platform';
import { pageMetadata } from '@/lib/seo';

type PageProps = { params: Promise<{ locale: string; section: string }> };

/**
 * Segments localisés (`/pt/semana`, `/fr/semaine`, `/en/week`).
 *
 * Seule « la semaine » existe ici : les autres sections auront leur propre
 * route, car chacune a sa propre page. Ce segment générique évite de dupliquer
 * trois fichiers pour une même page.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale, section: segmentsFor(locale).week }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, section } = await params;
  if (!isLocale(locale) || section !== segmentsFor(locale).week) return {};

  return pageMetadata(
    locale,
    { name: 'week' },
    t(locale, 'meta.week.title'),
    t(locale, 'meta.week.description'),
  );
}

export default async function WeekPage({ params }: PageProps) {
  const { locale, section } = await params;
  if (!isLocale(locale) || section !== segmentsFor(locale).week) notFound();

  return (
    <>
      <SiteHeader locale={locale} route={{ name: 'week' }} />

      <main
        id="conteudo"
        className="mx-auto flex w-full max-w-[680px] flex-col gap-8 px-4 pt-8 pb-16 md:px-6 md:pt-12"
      >
        <section className="flex flex-col gap-3">
          <p className="type-meta text-stone">{t(locale, 'week.eyebrow')}</p>
          <h1 className="type-h1 text-ink">{t(locale, 'week.title')}</h1>
          <p className="type-body-lg max-w-[64ch] text-stone">{t(locale, 'week.lead')}</p>
        </section>

        <section className="flex flex-col gap-4 border-t border-line pt-6">
          <h2 className="type-h2 max-w-[64ch] text-ink">{t(locale, 'week.empty.title')}</h2>
          <Link
            href={routePath(locale, { name: 'today' })}
            className="type-body self-start font-medium text-ink underline decoration-terracotta decoration-2 underline-offset-4 hover:text-terracotta-text"
          >
            {t(locale, 'week.action')}
          </Link>
        </section>
      </main>
    </>
  );
}
