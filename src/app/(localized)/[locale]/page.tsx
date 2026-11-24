import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SiteHeader } from '@/components/site-header';
import { isLocale, t } from '@/lib/i18n';
import { routePath } from '@/lib/platform/routes';
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

/**
 * Page « Aujourd'hui » (P1.4).
 *
 * Aucune donnée : la base arrive en P2. L'état vide est donc l'état réel, et
 * il est écrit comme tel — pas de faux événement pour « faire joli ».
 * La date et la réglette horaire viennent en P1.5, avec la mise en forme.
 */
export default async function TodayPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[720px] flex-col gap-10 px-6 pb-16">
      <SiteHeader locale={locale} route={{ name: 'today' }} />

      <section className="flex flex-col gap-4">
        <p className="text-[11px] font-medium tracking-[0.02em] text-stone">
          {t(locale, 'home.eyebrow')}
        </p>
        <h1 className="text-4xl leading-[1.05] font-extrabold text-ink sm:text-5xl">
          {t(locale, 'home.title')}
        </h1>
        <p className="max-w-[52ch] text-base leading-relaxed text-stone">
          {t(locale, 'home.lead')}
        </p>
      </section>

      <section className="flex flex-col gap-4 border border-line p-6">
        <p className="max-w-[52ch] text-base leading-relaxed text-ink">
          {t(locale, 'home.empty.title', { city: defaultCity })}
        </p>
        <Link
          href={routePath(locale, { name: 'week' })}
          className="self-start text-sm font-medium text-ink underline decoration-terracotta decoration-2 underline-offset-4 hover:text-terracotta-text"
        >
          {t(locale, 'home.empty.action')}
        </Link>
      </section>
    </main>
  );
}
