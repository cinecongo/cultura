import { buildTarget } from '@/lib/platform';

/**
 * Page de démarrage du squelette (P1.3).
 *
 * Elle prouve trois choses et rien de plus :
 * 1. le rendu fonctionne avec les tokens de `DESIGN.md` ;
 * 2. la cible de build est lisible à l'exécution (`BUILD_TARGET`) ;
 * 3. les deux cibles produisent la même page.
 *
 * La navigation, les routes localisées et le contenu réel de « Hoje »
 * arrivent en P1.4 (i18n) puis P1.5 (design). Aucun lien mort ici.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[720px] flex-col justify-center gap-8 px-6 py-16">
      <p className="text-[11px] font-medium tracking-[0.02em] text-stone">
        Agenda cultural de Angola
      </p>

      <h1 className="text-4xl leading-[1.05] font-extrabold text-ink sm:text-5xl">Cultura</h1>

      <p className="max-w-[52ch] text-base leading-relaxed text-stone">
        O que acontece hoje, num só lugar. O programa do dia, cidade a cidade.
      </p>

      <p className="border-t border-line pt-6 text-xs text-stone">
        Cible de build : <code className="font-mono text-ink">{buildTarget}</code>
      </p>
    </main>
  );
}
