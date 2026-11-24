import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SiteHeader } from '@/components/site-header';
import { isLocale, locales, t } from '@/lib/i18n';
import { routePath, segmentsFor } from '@/lib/platform/routes';
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
    <main className="mx-auto flex min-h-dvh w-full max-w-[720px] flex-col gap-10 px-6 pb-16">
      <SiteHeader locale={locale} route={{ name: 'week' }} />

      <section className="flex flex-col gap-4">
        <p className="text-[11px] font-medium tracking-[0.02em] text-stone">
          {t(locale, 'week.eyebrow')}
        </p>
        <h1 className="text-4xl leading-[1.05] font-extrabold text-ink sm:text-5xl">
          {t(locale, 'week.title')}
        </h1>
        <p className="max-w-[52ch] text-base leading-relaxed text-stone">
          {t(locale, 'week.lead')}
        </p>
      </section>

      <section className="flex flex-col gap-4 border border-line p-6">
        <p className="max-w-[52ch] text-base leading-relaxed text-ink">
          {t(locale, 'week.empty.title')}
        </p>
        <Link
          href={routePath(locale, { name: 'today' })}
          className="self-start text-sm font-medium text-ink underline decoration-terracotta decoration-2 underline-offset-4 hover:text-terracotta-text"
        >
          {t(locale, 'week.action')}
        </Link>
      </section>
    </main>
  );
}
