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
   * Séparation des capacités (ADR-001 §5) : les handlers d'authentification
   * vivent dans `*.web.ts` et les pages qui lisent une session dans
   * `*.web.tsx`. L'export statique mobile ne les voit donc pas : il ne peut
   *ni exécuter de cookie serveur ni offrir des routes POST.
   */
  pageExtensions:
    target === 'mobile'
      ? ['mobile.ts', 'mobile.tsx', 'ts', 'tsx']
      : ['web.ts', 'web.tsx', 'ts', 'tsx'],
  experimental: {
    // Deux layouts racines (document par défaut / document localisé) : Next a
    // besoin d'une 404 globale pour produire un document complet.
    globalNotFound: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        source: '/api/auth/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
  },
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
