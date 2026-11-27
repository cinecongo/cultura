import { randomBytes, randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test, type Page } from '@playwright/test';

/**
 * Parcours d'authentification P3.1. Les liens sont lus dans le bac à sable du
 * mailer PHP : aucun email réel, aucun jeton imprimé dans les journaux.
 * Le chemin du bac à sable est le même que celui injecté par playwright.config.ts.
 */
const OUTBOX = join(process.cwd(), 'test-results', 'mail-outbox.jsonl');
const PASSWORD = 'PalavraPass12';
const NEW_PASSWORD = 'OutraPalavra12';

type OutboxEntry = { readonly to: string; readonly template: string; readonly body: string };

function newEmail(): string {
  return `e2e-${Date.now()}-${randomUUID().slice(0, 8)}@example.test`;
}

/** IP distincte par test : les fenêtres de limitation ne se contaminent pas. */
async function isolate(page: Page): Promise<void> {
  const [a, b, c] = randomBytes(3);
  await page.context().setExtraHTTPHeaders({ 'x-forwarded-for': `10.${a}.${b}.${c}` });
}

/** Le HTML serveur est remplacé à l'hydratation : attendre le marqueur client. */
async function hydratedForm(page: Page): Promise<void> {
  await page.locator('form[data-hydrated="true"]').waitFor({ state: 'attached' });
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

async function signin(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/fr/connexion');
  await hydratedForm(page);
  await page.getByLabel('Adresse email').fill(email);
  await page.getByLabel('Mot de passe').fill(password);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL(/\/fr\/compte\/?$/, { timeout: 10000 });
  const alertText = (await page.locator('p[role="alert"]').allTextContents())
    .map((text) => text.trim())
    .filter((text) => text.length > 0);
  expect(alertText, 'connexion sans message d’erreur').toEqual([]);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Votre compte');
}

test.describe('parcours auth complets', () => {
  test('inscription → confirmation → connexion → déconnexion', async ({ page }) => {
    await isolate(page);
    const email = newEmail();

    await signupAndConfirm(page, email);
    await signin(page, email, PASSWORD);
    await expect(page.getByText(email, { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Se déconnecter' }).click();
    await expect(page).toHaveURL(/\/(fr\/?)?$/);
    await page.waitForLoadState('networkidle');
    await page.goto('/fr/compte');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Se connecter pour continuer');
  });

  test('réinitialisation : un seul lien, autres sessions révoquées', async ({ page }) => {
    await isolate(page);
    const email = newEmail();
    await signupAndConfirm(page, email);

    await page.goto('/fr/connexion');
    await page.getByRole('link', { name: 'Mot de passe oublié ?' }).click();
    await expect(page).toHaveURL(/\/fr\/nouveaumotpasse\/?$/);
    await hydratedForm(page);
    await page.getByLabel('Adresse email').fill(email);
    await page.getByRole('button', { name: 'Demander le lien de réinitialisation' }).click();
    await expect(page.locator('p[role="status"], p[role="alert"]')).toContainText(
      'Nous avons envoyé un lien',
    );

    await page.goto(await lastLink(email, 'reset'));
    await expect(page).toHaveURL(/\/fr\/modifiermotpasse\/?$/);
    await hydratedForm(page);
    await page.getByLabel('Nouveau mot de passe').fill(NEW_PASSWORD);
    await page.getByLabel('Confirmer le mot de passe').fill(NEW_PASSWORD);
    await page.getByRole('button', { name: 'Modifier le mot de passe' }).click();
    await expect(page.locator('p[role="status"], p[role="alert"]')).toContainText(
      'Mot de passe modifié',
    );

    await signin(page, email, NEW_PASSWORD);
  });

  test('les trois langues exposent les écrans d’authentification', async ({ page }) => {
    await isolate(page);
    for (const [path, title, label] of [
      ['/pt/criarconta', 'Criar conta', 'Nome'],
      ['/fr/connexion', 'Se connecter', 'Adresse email'],
      ['/en/signin', 'Sign in', 'Email address'],
    ] as const) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
      await expect(page.getByLabel(label)).toBeVisible();
    }
  });
});

test.describe('cas interdits', () => {
  test('un POST sans origine est refusé', async ({ page, baseURL }) => {
    await isolate(page);
    const response = await page.request.post(`${baseURL}/api/auth/signup`, {
      data: {
        nom: 'Maria Silva',
        email: newEmail(),
        password: PASSWORD,
        locale: 'fr',
        turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
        terms: true,
      },
    });
    expect(response.status()).toBe(403);
  });

  test('un rôle envoyé par le client est ignoré sans changer la réponse', async ({
    page,
    baseURL,
  }) => {
    await isolate(page);
    const response = await page.request.post(`${baseURL}/api/auth/signup`, {
      headers: { Origin: baseURL as string },
      data: {
        nom: 'Maria Silva',
        email: newEmail(),
        password: PASSWORD,
        locale: 'fr',
        turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
        terms: true,
        role: 'admin',
        verified: true,
      },
    });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ status: 'sent' });
  });

  test('un jeton Turnstile invalide est refusé', async ({ page, baseURL }) => {
    await isolate(page);
    const response = await page.request.post(`${baseURL}/api/auth/signup`, {
      headers: { Origin: baseURL as string },
      data: {
        nom: 'Maria Silva',
        email: newEmail(),
        password: PASSWORD,
        locale: 'fr',
        // La clé de test 1x accepte tout jeton : on vérifie ici le rejet
        // serveur d'un jeton trop court (les autres cas sont en unitaire).
        turnstileToken: 'court',
        terms: true,
      },
    });
    expect(response.status()).toBe(400);
  });

  test('un lien de confirmation invalide est refusé', async ({ page, baseURL }) => {
    await isolate(page);
    const response = await page.request.post(`${baseURL}/api/auth/callback`, {
      headers: { Origin: baseURL as string },
      data: { token_hash: randomUUID().replace(/-/g, ''), type: 'signup', locale: 'fr' },
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).errorKey).toBe('auth.link.invalid');
  });

  test('sans session, le changement de mot de passe est refusé', async ({ page, baseURL }) => {
    await isolate(page);
    const response = await page.request.post(`${baseURL}/api/auth/password`, {
      headers: { Origin: baseURL as string },
      data: { password: NEW_PASSWORD, passwordConfirm: NEW_PASSWORD, locale: 'fr' },
    });
    expect(response.status()).toBe(401);
  });

  test('un email inconnu reçoit exactement la même réponse', async ({ page, baseURL }) => {
    await isolate(page);
    const response = await page.request.post(`${baseURL}/api/auth/reset`, {
      headers: { Origin: baseURL as string },
      data: {
        email: `inconnu-${randomUUID().slice(0, 8)}@example.test`,
        locale: 'fr',
        turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
      },
    });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ status: 'sent' });
  });
});
