import { randomBytes, randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test, type Page } from '@playwright/test';

import { deleteTestUser, forgeMetadataRole, testAdminClient } from './support/role-fixtures';

/**
 * Données du compte (P3.4) : export complet et suppression sans reliquat.
 *
 * Les comptes sont créés par le parcours public, puis les contenus de test sont
 * insérés avec un client service_role dans le processus Node. Aucun secret
 * n'atteint le navigateur et aucune route de test n'existe dans l'application.
 */
const OUTBOX = join(process.cwd(), 'test-results', 'mail-outbox.jsonl');
const PASSWORD = 'PalavraPass12';
const WRONG_PASSWORD = `${PASSWORD}-errone`;
const GENERIC = { errorKey: 'auth.error.generic' };

type OutboxEntry = { readonly to: string; readonly template: string; readonly body: string };

const createdIds: string[] = [];

test.afterEach(async () => {
  for (const id of createdIds.splice(0)) {
    try {
      await deleteTestUser(id);
    } catch {
      // Nettoyage best effort : le compte peut déjà avoir été supprimé par l'UI.
    }
  }
});

function newEmail(prefix = 'compte'): string {
  return `${prefix}-${Date.now()}-${randomUUID().slice(0, 8)}@example.test`;
}

/** IP distincte par test : les fenêtres de limitation ne se contaminent pas. */
async function isolate(page: Page): Promise<void> {
  const [a, b, c] = randomBytes(3);
  await page.context().setExtraHTTPHeaders({ 'x-forwarded-for': `10.${a}.${b}.${c}` });
}

/**
 * Au premier compile Turbopack de `next dev`, l'overlay de développement peut
 * interrompre une hydratation. Un seul rechargement absorbe cette phase sans
 * masquer un échec applicatif répété.
 */
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
  await expect(page).toHaveURL(/\/fr\/compte\/?$/, { timeout: 10_000 });
}

async function idOf(email: string): Promise<string> {
  const admin = testAdminClient();
  const { data, error } = await admin.from('users').select('id').eq('email', email).maybeSingle();
  expect(error, 'recherche du compte de test').toBeNull();
  expect(data?.id, 'compte de test présent en base').toBeTruthy();
  const id = data!.id as string;
  createdIds.push(id);
  return id;
}

/** Contenus possédés + interactions d'un autre compte, comme dans la revue SQL. */
async function seedOwnedData(
  id: string,
  email: string,
): Promise<{
  ficheId: string;
  annonceId: string;
  villeId: string;
  likeId: string;
  demandeId: string;
}> {
  const admin = testAdminClient();
  const ficheId = randomUUID();
  const annonceId = randomUUID();
  const villeId = randomUUID();
  const likeId = randomUUID();
  const demandeId = randomUUID();

  for (const [table, row] of [
    [
      'acteurs_culturels',
      {
        id: ficheId,
        nom: 'Fiche suppression',
        type: 'artiste',
        statut_fiche: 'revendiquee',
        user_id: id,
        cree_par: id,
      },
    ],
    [
      'annonces',
      {
        id: annonceId,
        titre: 'Annonce suppression',
        acteur_id: ficheId,
        langue: 'fr',
        origine: 'acteur',
        statut: 'valide',
      },
    ],
    ['villes_suivies', { id: villeId, user_id: id, ville: 'Luanda' }],
    ['likes', { id: likeId, user_id: id, annonce_id: annonceId }],
    [
      'demandes_retrait',
      {
        id: demandeId,
        content_type: 'annonce',
        content_id: annonceId,
        contact: email,
      },
    ],
  ] as const) {
    const { error } = await admin.from(table).insert(row);
    expect(error, `insertion de test dans ${table}`).toBeNull();
  }
  return { ficheId, annonceId, villeId, likeId, demandeId };
}

async function assertNoRemainder(
  id: string,
  ids: { ficheId: string; annonceId: string; villeId: string; likeId: string; demandeId: string },
): Promise<void> {
  const admin = testAdminClient();
  const { data: authUser } = await admin.auth.admin.getUserById(id);
  expect(authUser.user, 'auth.users supprimé').toBeNull();

  const checks: [string, PromiseLike<{ count: number | null; error: unknown }>][] = [
    ['users', admin.from('users').select('id', { count: 'exact', head: true }).eq('id', id)],
    [
      'acteurs_culturels',
      admin
        .from('acteurs_culturels')
        .select('id', { count: 'exact', head: true })
        .eq('id', ids.ficheId),
    ],
    [
      'annonces',
      admin.from('annonces').select('id', { count: 'exact', head: true }).eq('id', ids.annonceId),
    ],
    [
      'likes',
      admin.from('likes').select('id', { count: 'exact', head: true }).eq('id', ids.likeId),
    ],
    [
      'villes_suivies',
      admin
        .from('villes_suivies')
        .select('id', { count: 'exact', head: true })
        .eq('id', ids.villeId),
    ],
    [
      'demandes_retrait',
      admin
        .from('demandes_retrait')
        .select('id', { count: 'exact', head: true })
        .eq('id', ids.demandeId),
    ],
  ];

  for (const [table, query] of checks) {
    const { count, error } = await query;
    expect(error, `vérification ${table}`).toBeNull();
    expect(count, `aucun reliquat dans ${table}`).toBe(0);
  }

  // Le seed P2 reste intact : la suppression ne touche que le compte courant.
  for (const [table, minimum] of [
    ['categories', 6],
    ['acteurs_culturels', 5],
    ['annonces', 6],
    ['events', 5],
  ] as const) {
    const { count, error } = await admin.from(table).select('id', { count: 'exact', head: true });
    expect(error, `seed ${table}`).toBeNull();
    expect(count ?? 0, `seed ${table} intact`).toBeGreaterThanOrEqual(minimum);
  }
}

async function postAccount(
  page: Page,
  baseURL: string,
  path: string,
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
) {
  return page.request.post(`${baseURL}${path}`, {
    headers: { Origin: baseURL, ...headers },
    data: body,
  });
}

test.describe('données du compte (P3.4)', () => {
  test.describe.configure({ timeout: 120_000 });

  test('exporte toutes les données du compte, sans cache et au seul propriétaire', async ({
    page,
    baseURL,
    request,
  }) => {
    await isolate(page);
    const email = newEmail('export');
    await signupAndConfirm(page, email);
    await idOf(email);
    await signin(page, email);

    const direct = await postAccount(page, baseURL!, '/api/account/export', {});
    expect(direct.status()).toBe(200);
    expect(direct.headers()['cache-control']).toBe('no-store');
    expect(direct.headers()['referrer-policy']).toBe('no-referrer');
    expect(direct.headers()['x-content-type-options']).toBe('nosniff');
    const exported = (await direct.json()) as {
      profile: { email: string };
      fiches: unknown[];
      annoncesCulturelles: unknown[];
      evenements: unknown[];
      interactions: Record<string, unknown[]>;
      villesSuivies: unknown[];
    };
    expect(exported.profile.email).toBe(email);
    expect(Array.isArray(exported.fiches)).toBe(true);
    expect(exported.annoncesCulturelles).toEqual([]);
    expect(exported.evenements).toEqual([]);
    expect(exported.villesSuivies).toEqual([]);
    expect(Object.keys(exported.interactions).sort()).toEqual([
      'favorites',
      'likes',
      'shares',
      'signalements',
      'views',
    ]);

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Exporter mes données' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^cultura-fr\.json$/);
    const saved = JSON.parse(readFileSync((await download.path())!, 'utf8')) as {
      profile: { email: string };
    };
    expect(saved.profile.email).toBe(email);
    await expect(page.getByRole('status')).toContainText('Vos données sont prêtes');

    const anonymous = await request.post(`${baseURL}/api/account/export`, {
      headers: { Origin: baseURL! },
      data: {},
    });
    expect(anonymous.status()).toBe(401);
    expect(await anonymous.json()).toEqual(GENERIC);
  });

  test('n’exporte ni ne supprime une demande appartenant à un tiers', async ({ page, baseURL }) => {
    await isolate(page);
    const email = newEmail('tiers');
    await signupAndConfirm(page, email);
    await signin(page, email);

    const admin = testAdminClient();
    const tiersId = randomUUID();
    const { error } = await admin.from('demandes_retrait').insert({
      id: tiersId,
      content_type: 'annonce',
      content_id: randomUUID(),
      contact: `prefix.${email}`,
    });
    expect(error, 'demande tiers insérée').toBeNull();

    try {
      const direct = await postAccount(page, baseURL!, '/api/account/export', {});
      expect(direct.status()).toBe(200);
      const exported = (await direct.json()) as { demandesRetrait: { id: string }[] };
      expect(exported.demandesRetrait.map((row) => row.id)).not.toContain(tiersId);

      const deleted = await postAccount(page, baseURL!, '/api/account/delete', {
        password: PASSWORD,
        confirmPhrase: 'EFFACER MON COMPTE',
      });
      expect(deleted.status()).toBe(200);

      const { data, error: readError } = await admin
        .from('demandes_retrait')
        .select('id')
        .eq('id', tiersId);
      expect(readError).toBeNull();
      expect(data).toHaveLength(1);
    } finally {
      await admin.from('demandes_retrait').delete().eq('id', tiersId);
    }
  });

  test('supprime le compte avec ses contenus, sans reliquat', async ({ page }) => {
    await isolate(page);
    const email = newEmail('suppression');
    await signupAndConfirm(page, email);
    const id = await idOf(email);
    const owned = await seedOwnedData(id, email);
    await signin(page, email);

    await page.getByRole('button', { name: 'Supprimer mon compte' }).click();
    await expect(page.locator('#account-delete-form')).toBeVisible();
    await page.getByLabel('Saisissez la phrase ci-dessous pour confirmer.').fill('MAUVAISE PHRASE');
    await page.getByLabel('Mot de passe').fill(PASSWORD);
    await page.getByRole('button', { name: 'Supprimer définitivement le compte' }).click();
    await expect(page.locator('#account-delete-form [role="alert"]')).toContainText(
      'La phrase ne correspond pas',
    );

    await page
      .getByLabel('Saisissez la phrase ci-dessous pour confirmer.')
      .fill('EFFACER MON COMPTE');
    await page.getByRole('button', { name: 'Supprimer définitivement le compte' }).click();
    await expect(page).toHaveURL(/\/fr\/?$/, { timeout: 15_000 });

    await assertNoRemainder(id, owned);

    await page.goto('/fr/compte');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Se connecter pour continuer');
  });

  test('refuse mot de passe, phrase, origine, journal et sixième tentative', async ({
    page,
    baseURL,
  }) => {
    await isolate(page);
    const email = newEmail('refus');
    await signupAndConfirm(page, email);
    const id = await idOf(email);
    await signin(page, email);

    const badPassword = await postAccount(page, baseURL!, '/api/account/delete', {
      password: WRONG_PASSWORD,
      confirmPhrase: 'EFFACER MON COMPTE',
    });
    expect(badPassword.status()).toBe(400);
    expect(await badPassword.json()).toEqual({ errorKey: 'auth.account.delete.error.password' });

    const badPhrase = await postAccount(page, baseURL!, '/api/account/delete', {
      password: PASSWORD,
      confirmPhrase: 'EFFACER MON COMPTE.',
    });
    expect(badPhrase.status()).toBe(400);
    expect(await badPhrase.json()).toEqual({ errorKey: 'auth.account.delete.error.phrase' });

    const foreignOrigin = await page.request.post(`${baseURL}/api/account/delete`, {
      headers: { Origin: 'https://exemple.test' },
      data: { password: PASSWORD, confirmPhrase: 'EFFACER MON COMPTE' },
    });
    expect(foreignOrigin.status()).toBe(403);
    expect(await foreignOrigin.json()).toEqual(GENERIC);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const retry = await postAccount(page, baseURL!, '/api/account/delete', {
        password: WRONG_PASSWORD,
        confirmPhrase: 'EFFACER MON COMPTE',
      });
      expect(retry.status()).toBe(400);
    }
    const limited = await postAccount(page, baseURL!, '/api/account/delete', {
      password: PASSWORD,
      confirmPhrase: 'EFFACER MON COMPTE',
    });
    expect(limited.status()).toBe(429);
    expect(await limited.json()).toEqual({
      errorKey: 'auth.error.tooManyRequests',
      count: 3600,
    });

    // Le garde-fou journal passe avant la limitation épuisée : même à la 7ᵉ
    // tentative, le refus reste « journalisé » et aucune écriture n'est faite.
    const admin = testAdminClient();
    const { error: journalError } = await admin.from('moderation_log').insert({
      id: randomUUID(),
      admin_id: id,
      content_id: randomUUID(),
      content_type: 'annonce',
      action: 'cree_editorial',
    });
    expect(journalError, 'journal de test inséré').toBeNull();

    const journaled = await postAccount(page, baseURL!, '/api/account/delete', {
      password: PASSWORD,
      confirmPhrase: 'EFFACER MON COMPTE',
    });
    expect(journaled.status()).toBe(409);
    expect(await journaled.json()).toEqual({
      errorKey: 'auth.account.delete.error.journaled',
    });

    const { data: stillThere } = await admin.auth.admin.getUserById(id);
    expect(stillThere.user, 'compte journalisé non supprimé').toBeTruthy();
  });

  test('ignore uid, rôle et métadonnées forgés envoyés par le client', async ({
    page,
    baseURL,
  }) => {
    await isolate(page);
    const email = newEmail('forge');
    const otherEmail = newEmail('autre');
    await signupAndConfirm(page, email);
    await signupAndConfirm(page, otherEmail);
    const id = await idOf(email);
    const otherId = await idOf(otherEmail);
    await forgeMetadataRole(id);
    await signin(page, email);

    const response = await postAccount(page, baseURL!, '/api/account/delete', {
      password: PASSWORD,
      confirmPhrase: 'EFFACER MON COMPTE',
      uid: otherId,
      role: 'admin',
      expectedPhrase: 'AUTRE PHRASE',
    });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ status: 'deleted' });

    const admin = testAdminClient();
    const { data: gone } = await admin.auth.admin.getUserById(id);
    expect(gone.user, 'seul le compte de session est supprimé').toBeNull();
    const { data: untouched } = await admin.auth.admin.getUserById(otherId);
    expect(untouched.user, 'compte tiers intact').toBeTruthy();
  });
});
