import { defineConfig, devices } from '@playwright/test';

/**
 * Tests de bout en bout (CULTURA_GUIDE_IA.md §P1.2).
 *
 * Le serveur est lancé par Playwright sur un port dédié pour ne pas gêner un
 * `next dev` déjà ouvert. Le navigateur utilisé est **Edge installé sur la
 * machine** : aucun téléchargement de Chromium n'est nécessaire en local.
 * En CI (O11, encore ouvert), installer Chromium et retirer le `channel`.
 *
 * Ces tests tournent sur le code source (`next dev`), pas sur l'export
 * statique : ils vérifient le comportement, pas l'artefact. L'artefact est
 * vérifié séparément par le crawl de `out/`.
 */

const PORT = Number(process.env.E2E_PORT ?? 4319);
// `localhost` et non `127.0.0.1` : Next 16 bloque les ressources de dev
// demandées depuis une autre origine, ce qui empêche l'hydratation du résolveur.
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    // `fr-FR` par défaut : la résolution de langue doit être prévisible.
    locale: 'fr-FR',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'edge',
      use: {
        ...devices['Desktop Chrome'],
        ...(process.env.CI ? {} : { channel: 'msedge' }),
      },
    },
  ],
  webServer: {
    command: `npx next dev --port ${PORT}`,
    url: `${baseURL}/pt`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
