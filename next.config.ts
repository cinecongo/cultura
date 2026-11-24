import type { NextConfig } from 'next';

/**
 * Une seule base de code, deux cibles (ADR-001).
 *
 * - `BUILD_TARGET=web`    : SSR/ISR pour Vercel. Dossier `.next`.
 * - `BUILD_TARGET=mobile` : export statique pour Capacitor. Dossier `out/`.
 *
 * Toute différence de comportement entre les cibles doit vivre dans
 * `src/lib/platform/`, jamais dans un composant.
 */
const target = process.env.BUILD_TARGET === 'mobile' ? 'mobile' : 'web';

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /*
   * Pas de `distDir` personnalisé : avec `output: 'export'`, Next écrit le site
   * statique dans `out/`, que Capacitor attend. Conséquence assumée : `.next`
   * est partagé, donc les deux builds ne doivent pas tourner en parallèle.
   */
  ...(target === 'mobile'
    ? {
        output: 'export' as const,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default config;
