import './tests/e2e/support/test-env';

import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

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

/**
 * Le serveur e2e parle au port dédié : les liens envoyés par le mailer PHP
 * doivent donc pointer vers ce port, pas vers le `NEXT_PUBLIC_SITE_URL` local.
 * Le bac à sable email est isolé dans `test-results/` (ignoré par Git).
 */
const OUTBOX_FILE = join(process.cwd(), 'test-results', 'mail-outbox.jsonl');
mkdirSync(dirname(OUTBOX_FILE), { recursive: true });

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: false,
  // Deux workers maximum : le serveur `next dev` unique sature au-delà et
  // l'hydratation des formulaires dépasse alors le délai des tests (P3.4).
  workers: 2,
  forbidOnly: Boolean(process.env.CI),
  // Le premier test arrive pendant le premier compile Turbopack de `next dev` :
  // l'overlay de développement peut alors lever un faux « Unexpected end of
  // JSON input ». Un retry local absorbe cette phase de démarrage, sans masquer
  // un échec applicatif répété.
  retries: 1,
  // Sous `next dev` à deux workers, l'envoi de mail et la compilation peuvent
  // dépasser les 5 s par défaut ; 15 s couvre la latence observée sans masquer
  // un échec applicatif (P3.4).
  expect: { timeout: 15_000 },
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
    env: {
      ...process.env,
      NEXT_PUBLIC_SITE_URL: baseURL,
      MAIL_OUTBOX_FILE: OUTBOX_FILE,
    },
    url: `${baseURL}/pt`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
