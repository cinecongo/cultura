import { randomBytes, randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test, type Page } from '@playwright/test';

import { t, type Locale } from '../../src/lib/i18n';
import { deleteTestUser, forgeMetadataRole, setTestRole } from './support/role-fixtures';

/**
 * Garde des espaces protégés (P3.2). Les comptes sont créés par le parcours
 * public, puis promus via un client service_role dans le processus Node :
 * aucune route de test n'existe dans l'application et aucun secret n'est
 * affiché. Les liens email viennent du bac à sable du mailer PHP.
 */
const OUTBOX = join(process.cwd(), 'test-results', 'mail-outbox.jsonl');
const PASSWORD = 'PalavraPass12';

type Space = 'actorSpace' | 'adminSpace';
type OutboxEntry = { readonly to: string; readonly template: string; readonly body: string };

const SPACE_SEGMENTS: Record<Locale, Record<Space, string>> = {
  pt: { actorSpace: 'espacoagente', adminSpace: 'espacoadmin' },
  fr: { actorSpace: 'espaceacteur', adminSpace: 'espaceadmin' },
  en: { actorSpace: 'actorspace', adminSpace: 'adminspace' },
};

const SPACE_TITLES: Record<Space, 'auth.actor.title' | 'auth.admin.title'> = {
  actorSpace: 'auth.actor.title',
  adminSpace: 'auth.admin.title',
};

const SIGNIN_SEGMENTS: Record<Locale, string> = {
  pt: 'entrar',
  fr: 'connexion',
  en: 'signin',
};

const createdIds: string[] = [];

test.afterEach(async () => {
  for (const id of createdIds.splice(0)) {
    try {
      await deleteTestUser(id);
    } catch {
      // Nettoyage best effort : ne jamais imprimer d'erreur contenant un jeton.
    }
  }
});

function newEmail(): string {
  return `roles-${Date.now()}-${randomUUID().slice(0, 8)}@example.test`;
}

/** IP distincte par test : les fenêtres de limitation ne se contaminent pas. */
async function isolate(page: Page): Promise<void> {
  const [a, b, c] = randomBytes(3);
  await page.context().setExtraHTTPHeaders({ 'x-forwarded-for': `10.${a}.${b}.${c}` });
}

/** Un seul rechargement absorbe l'overlay du premier compile `next dev` (P3.4). */
async function hydratedForm(page: Page): Promise<void> {
  try {
    await page
      .locator('form[data-hydrated="true"]')
      .waitFor({ state: 'attached', timeout: 15_000 });
  } catch {
    await page.reload();
    await page.locator('form[data-hydrated="true"]').waitFor({ state: 'attached' });
  }
}

async function lastLink(email: string, template: string): Promise<string> {
  const raw = existsSync(OUTBOX) ? readFileSync(OUTBOX, 'utf8') : '';
  const entries = raw
    .split(/\r?\n/)
    .filter((line) => line.length > 0)
    .flatMap((line): OutboxEntry[] => {
      try {
        return [JSON.parse(line) as OutboxEntry];
      } catch {
        return [];
      }
    })
    .reverse();
  const message = entries.find((entry) => entry.to === email && entry.template === template);
  expect(message, `email « ${template} » pour le compte de test`).toBeTruthy();
  const link = /https?:\/\/\S+/.exec(message?.body ?? '')?.[0];
  expect(link, 'lien présent dans le corps du message').toBeTruthy();
  return link as string;
}

async function signupAndConfirm(page: Page, email: string): Promise<void> {
  await page.goto('/fr/creercompte');
  await hydratedForm(page);
  await page.getByLabel('Nom').fill('Maria Silva');
  await page.getByLabel('Adresse email').fill(email);
  await page.getByLabel('Mot de passe').fill(PASSWORD);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Créer un compte' }).click();
  await expect(page.locator('p[role="status"], p[role="alert"]')).toContainText(
    'Nous avons envoyé un lien',
  );

  await page.goto(await lastLink(email, 'verify'));
  await hydratedForm(page);
  await expect(page.locator('p[role="status"], p[role="alert"]')).toContainText(
    'Adresse email confirmée',
  );
}

async function signin(page: Page, email: string): Promise<void> {
  await page.goto('/fr/connexion');
  await hydratedForm(page);
  await page.getByLabel('Adresse email').fill(email);
  await page.getByLabel('Mot de passe').fill(PASSWORD);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL(/\/fr\/compte\/?$/, { timeout: 10000 });
}

async function expectRefused(page: Page, locale: Locale, space: Space): Promise<void> {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    t(locale, 'auth.guard.forbidden.title'),
  );
  await expect(page.locator(`[data-space-content="${space}"]`)).toHaveCount(0);
}

async function expectAllowed(page: Page, locale: Locale, space: Space): Promise<void> {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(t(locale, SPACE_TITLES[space]));
  await expect(page.locator('[data-space-content]')).toHaveAttribute('data-space-content', space);
}

async function probe(
  page: Page,
  space: string,
  status: number,
  body: Record<string, unknown>,
): Promise<void> {
  const response = await page.request.get(`/api/roles/${space}`);
  expect(response.status(), `sonde ${space}`).toBe(status);
  expect(response.headers()['cache-control']).toBe('no-store');
  expect(response.headers()['referrer-policy']).toBe('no-referrer');
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  expect(await response.json()).toEqual(body);
}

const GENERIC = { errorKey: 'auth.error.generic' };

test.describe('garde des espaces', () => {
  test.describe.configure({ timeout: 90_000 });

  test('un visiteur est redirigé vers la connexion dans sa langue', async ({ page }) => {
    await isolate(page);

    for (const locale of ['pt', 'fr', 'en'] as const) {
      for (const space of ['actorSpace', 'adminSpace'] as const) {
        const response = await page.goto(`/${locale}/${SPACE_SEGMENTS[locale][space]}`);
        expect(response?.status(), `${locale}.${space}`).toBe(200);
        await expect(page).toHaveURL(new RegExp(`/${locale}/${SIGNIN_SEGMENTS[locale]}/?$`));
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(
          t(locale, 'auth.signin.title'),
        );
      }
    }

    await probe(page, 'actor', 401, GENERIC);
    await probe(page, 'admin', 401, GENERIC);
    await probe(page, 'admin%2Fx', 400, GENERIC);
  });

  test('un membre est refusé sur les six pages et par l’API', async ({ page }) => {
    await isolate(page);
    const email = newEmail();
    await signupAndConfirm(page, email);
    createdIds.push(await setTestRole(email, 'membre'));
    await signin(page, email);

    for (const locale of ['pt', 'fr', 'en'] as const) {
      for (const space of ['actorSpace', 'adminSpace'] as const) {
        const response = await page.goto(`/${locale}/${SPACE_SEGMENTS[locale][space]}`);
        expect(response?.status(), `${locale}.${space}`).toBe(200);
        await expectRefused(page, locale, space);

        // Le HTML initial, avant hydratation, ne contient aucun contenu protégé.
        const html = await response!.text();
        expect(html, `${locale}.${space} HTML`).not.toContain('data-space-content');
        expect(html, `${locale}.${space} HTML`).not.toContain(t(locale, SPACE_TITLES[space]));
        expect(html, `${locale}.${space} HTML`).toContain(t(locale, 'auth.guard.forbidden.title'));
      }
    }

    await probe(page, 'actor', 403, GENERIC);
    await probe(page, 'admin', 403, GENERIC);
  });

  test('la matrice est relue en base, même en session ouverte', async ({ page }) => {
    await isolate(page);
    const email = newEmail();
    await signupAndConfirm(page, email);
    createdIds.push(await setTestRole(email, 'acteur'));
    await signin(page, email);

    await page.goto('/fr/espaceacteur');
    await expectAllowed(page, 'fr', 'actorSpace');
    await page.goto('/fr/espaceadmin');
    await expectRefused(page, 'fr', 'adminSpace');
    await probe(page, 'actor', 200, { allowed: true });
    await probe(page, 'admin', 403, GENERIC);

    await setTestRole(email, 'editeur');
    await page.goto('/fr/espaceacteur');
    await expectAllowed(page, 'fr', 'actorSpace');
    await page.goto('/fr/espaceadmin');
    await expectRefused(page, 'fr', 'adminSpace');

    const id = await setTestRole(email, 'admin');
    await page.goto('/fr/espaceacteur');
    await expectAllowed(page, 'fr', 'actorSpace');
    await page.goto('/fr/espaceadmin');
    await expectAllowed(page, 'fr', 'adminSpace');
    await probe(page, 'actor', 200, { allowed: true });
    await probe(page, 'admin', 200, { allowed: true });

    // Faux rôle dans les métadonnées + dégradation en base, sans déconnexion.
    await forgeMetadataRole(id);
    await setTestRole(email, 'membre');
    await page.goto('/fr/espaceadmin');
    await expectRefused(page, 'fr', 'adminSpace');
    await probe(page, 'admin', 403, GENERIC);

    await setTestRole(email, 'admin');
    await page.goto('/fr/espaceadmin');
    await expectAllowed(page, 'fr', 'adminSpace');
    await probe(page, 'admin', 200, { allowed: true });
  });
});
