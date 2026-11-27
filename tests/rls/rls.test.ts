import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Client } from 'pg';
import {
  createRlsClient,
  enableRlsSession,
  setJwtUser,
  setAnonSession,
  resetRlsSession,
  closeRlsClient,
} from './setup';

// Comptes de test, distincts du seed fictif (P2.4).
const ACTEUR_A = '33333333-3333-3333-3333-333333333333';
const ACTEUR_B = '44444444-4444-4444-4444-444444444444';
const MEMBRE = '55555555-5555-5555-5555-555555555555';
const EDITEUR = '66666666-6666-6666-6666-666666666666';
const ADMIN = '11111111-1111-1111-1111-111111111111';
const TEST_UIDS = [ACTEUR_A, ACTEUR_B, MEMBRE, EDITEUR, ADMIN];

const FICHE_A = '77777777-7777-7777-7777-777777777777';
const ANNONCE_A = '88888888-8888-8888-8888-888888888888';
const ANNONCE_PUBLIC = '99999999-9999-9999-9999-999999999999';
const EVENT_A = 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1';
const EVENT_B = 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2';
const ANNONCES_TEST = [ANNONCE_A, ANNONCE_PUBLIC];
const EVENTS_TEST = [EVENT_A, EVENT_B];
const LIKE_A = 'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1';
const LIKE_MEMBRE = 'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2';
const LIKE_FAUX = 'bbbbbbb3-bbbb-bbbb-bbbb-bbbbbbbbbbb3';
const LOG_A = 'ccccccc1-cccc-cccc-cccc-ccccccccccc1';

/**
 * Nettoyage strictement ciblé sur les identifiants de test : le seed fictif
 * (P2.4) doit rester intact après la suite RLS.
 */
async function cleanupTestData(client: Client): Promise<void> {
  await client.query(
    `delete from public.likes
     where user_id = any($1::uuid[]) or annonce_id = any($2::uuid[]) or event_id = any($3::uuid[])`,
    [TEST_UIDS, ANNONCES_TEST, EVENTS_TEST],
  );
  await client.query(
    `delete from public.favorites
     where user_id = any($1::uuid[]) or annonce_id = any($2::uuid[]) or event_id = any($3::uuid[])`,
    [TEST_UIDS, ANNONCES_TEST, EVENTS_TEST],
  );
  await client.query(
    `delete from public.views
     where user_id = any($1::uuid[]) or annonce_id = any($2::uuid[]) or event_id = any($3::uuid[])`,
    [TEST_UIDS, ANNONCES_TEST, EVENTS_TEST],
  );
  await client.query(`delete from public.villes_suivies where user_id = any($1::uuid[])`, [
    TEST_UIDS,
  ]);
  await client.query(
    `delete from public.shares
     where user_id = any($1::uuid[]) or annonce_id = any($2::uuid[]) or event_id = any($3::uuid[])`,
    [TEST_UIDS, ANNONCES_TEST, EVENTS_TEST],
  );
  await client.query(
    `delete from public.clicks
     where annonce_id = any($1::uuid[]) or event_id = any($2::uuid[])`,
    [ANNONCES_TEST, EVENTS_TEST],
  );
  await client.query(
    `delete from public.signalements
     where user_id = any($1::uuid[]) or annonce_id = any($2::uuid[]) or event_id = any($3::uuid[])`,
    [TEST_UIDS, ANNONCES_TEST, EVENTS_TEST],
  );
  await client.query(
    `delete from public.moderation_log where admin_id = any($1::uuid[]) or id = $2::uuid`,
    [TEST_UIDS, LOG_A],
  );
  await client.query(`delete from public.revendications_fiches where user_id = any($1::uuid[])`, [
    TEST_UIDS,
  ]);
  await client.query(`delete from public.events_acteurs where event_id = any($1::uuid[])`, [
    EVENTS_TEST,
  ]);
  await client.query(`delete from public.events where id = any($1::uuid[])`, [EVENTS_TEST]);
  await client.query(`delete from public.annonces where id = any($1::uuid[])`, [ANNONCES_TEST]);
  await client.query(`delete from public.acteurs_culturels where id = $1::uuid`, [FICHE_A]);
  await client.query(`delete from auth.users where id = any($1::uuid[])`, [TEST_UIDS]);
}

describe('RLS — matrice anonyme / membre / acteur A / acteur B / éditeur / admin (P2.3)', () => {
  let client: Client;

  beforeAll(async () => {
    client = await createRlsClient();

    // Le rôle de connexion porte `rolbypassrls=true` : nettoyage et seed sans RLS.
    await cleanupTestData(client);

    const seedAuth = async (uid: string, email: string, role: string): Promise<void> => {
      await client.query(
        `insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, last_sign_in_at)
         values ($1, 'authenticated', 'authenticated', $2, 'x', now(), now(), now(), now())
         on conflict (id) do nothing`,
        [uid, email],
      );
      await client.query(
        `insert into public.users (id, nom, email, role, langue_preferee)
         values ($1, $2, $3, $4, 'pt')
         on conflict (id) do nothing`,
        [uid, email, email, role],
      );
    };

    await seedAuth(ACTEUR_A, 'acteur.a@acteur.cultura', 'acteur');
    await seedAuth(ACTEUR_B, 'acteur.b@acteur.cultura', 'acteur');
    await seedAuth(MEMBRE, 'membre@personne.cultura', 'membre');
    await seedAuth(EDITEUR, 'editeur@cultura.ao', 'editeur');
    await seedAuth(ADMIN, 'admin@cultura.ao', 'admin');

    await client.query(
      `insert into public.acteurs_culturels (id, user_id, statut_fiche, nom, type, ville, verified)
       values ($1, $2, 'geree_par_equipe', 'Acteur Test A', 'artiste', 'Luanda', false)
       on conflict (id) do nothing`,
      [FICHE_A, ACTEUR_A],
    );

    await client.query(
      `insert into public.annonces (id, acteur_id, titre, contenu, langue, format, origine, statut, published_at)
       values ($1, $2, 'Concert Test', 'Contenu fictif de test.', 'pt', 'evenement', 'acteur', 'en_attente', null)
       on conflict (id) do nothing`,
      [ANNONCE_A, FICHE_A],
    );

    await client.query(
      `insert into public.annonces (id, acteur_id, titre, contenu, langue, format, origine, statut, published_at)
       values ($1, $2, 'Annonce Publique Test', 'Contenu fictif de test.', 'pt', 'actualite', 'acteur', 'valide', now())
       on conflict (id) do nothing`,
      [ANNONCE_PUBLIC, FICHE_A],
    );

    await client.query(
      `insert into public.likes (id, user_id, annonce_id)
       values ($1, $2, $3)
       on conflict (id) do nothing`,
      [LIKE_A, ACTEUR_A, ANNONCE_PUBLIC],
    );

    // Bascule sur `authenticated` : les policies RLS sont maintenant évaluées.
    await enableRlsSession(client);
  });

  afterAll(async () => {
    await resetRlsSession(client);
    await cleanupTestData(client);
    await closeRlsClient(client);
  });

  const countAnnonce = async (id: string): Promise<number> => {
    const result = await client.query(
      `select count(*)::int as n from public.annonces where id = $1`,
      [id],
    );
    return Number(result.rows[0].n);
  };

  it('lecture anonyme : une annonce validée est visible, une annonce en attente ne l’est pas', async () => {
    await setAnonSession(client);
    expect(await countAnnonce(ANNONCE_PUBLIC)).toBe(1);
    expect(await countAnnonce(ANNONCE_A)).toBe(0);
  });

  it('lecture membre : aucune annonce en attente visible', async () => {
    await setJwtUser(client, MEMBRE);
    expect(await countAnnonce(ANNONCE_A)).toBe(0);
  });

  it('lecture acteur : le propriétaire voit son annonce en attente, l’acteur B non', async () => {
    await setJwtUser(client, ACTEUR_A);
    expect(await countAnnonce(ANNONCE_A)).toBe(1);

    await setJwtUser(client, ACTEUR_B);
    expect(await countAnnonce(ANNONCE_A)).toBe(0);
  });

  it('lecture équipe : éditeur et admin voient l’annonce en attente', async () => {
    await setJwtUser(client, EDITEUR);
    expect(await countAnnonce(ANNONCE_A)).toBe(1);

    await setJwtUser(client, ADMIN);
    expect(await countAnnonce(ANNONCE_A)).toBe(1);
  });

  it('création : un membre ne peut pas créer d’annonce pour une fiche d’acteur', async () => {
    await setJwtUser(client, MEMBRE);
    await expect(
      client.query(
        `insert into public.annonces (id, acteur_id, titre, contenu, langue, format, origine, statut)
         values ($1, $2, 'Interdite', 'Contenu fictif de test.', 'pt', 'evenement', 'acteur', 'en_attente')`,
        ['ddddddd1-dddd-dddd-dddd-ddddddddddd1', FICHE_A],
      ),
    ).rejects.toThrow();
  });

  it('création d’événement : acteur A réussit, acteur B est refusé sur la fiche de A', async () => {
    await setJwtUser(client, ACTEUR_A);
    const cree = await client.query(
      `insert into public.events (id, acteur_id, titre, ville, date_event)
       values ($1, $2, 'Événement Test A', 'Luanda', now())`,
      [EVENT_A, FICHE_A],
    );
    expect(cree.rowCount).toBe(1);

    await setJwtUser(client, ACTEUR_B);
    await expect(
      client.query(
        `insert into public.events (id, acteur_id, titre, ville, date_event)
         values ($1, $2, 'Événement Test B', 'Luanda', now())`,
        [EVENT_B, FICHE_A],
      ),
    ).rejects.toThrow();
  });

  it('modification : un acteur ne modifie pas une annonce dont il n’est pas propriétaire', async () => {
    await setJwtUser(client, ACTEUR_B);
    const bUpdate = await client.query(
      `update public.annonces set titre = 'Hameçon Test' where id = $1`,
      [ANNONCE_A],
    );
    expect(bUpdate.rowCount).toBe(0);

    await setJwtUser(client, ACTEUR_A);
    const aUpdate = await client.query(
      `update public.annonces set titre = 'Concert Test' where id = $1`,
      [ANNONCE_A],
    );
    expect(aUpdate.rowCount).toBe(1);
  });

  it('suppression : aucune policy delete n’est ouverte aux acteurs sur les annonces', async () => {
    await setJwtUser(client, ACTEUR_A);
    const del = await client.query(`delete from public.annonces where id = $1`, [ANNONCE_A]);
    expect(del.rowCount).toBe(0);
  });

  it('rôle : un éditeur ne peut pas modifier users.role, un admin le peut', async () => {
    await setJwtUser(client, EDITEUR);
    const editeurUpdate = await client.query(
      `update public.users set role = 'admin' where id = $1`,
      [MEMBRE],
    );
    expect(editeurUpdate.rowCount).toBe(0);

    await setJwtUser(client, ADMIN);
    const adminUpdate = await client.query(
      `update public.users set role = 'editeur' where id = $1`,
      [MEMBRE],
    );
    expect(adminUpdate.rowCount).toBe(1);

    const revert = await client.query(`update public.users set role = 'membre' where id = $1`, [
      MEMBRE,
    ]);
    expect(revert.rowCount).toBe(1);
  });

  it('likes : un membre agit seulement avec son propre compte', async () => {
    await setJwtUser(client, MEMBRE);
    const insert = await client.query(
      `insert into public.likes (id, user_id, annonce_id) values ($1, $2, $3)`,
      [LIKE_MEMBRE, MEMBRE, ANNONCE_PUBLIC],
    );
    expect(insert.rowCount).toBe(1);

    await expect(
      client.query(`insert into public.likes (id, user_id, annonce_id) values ($1, $2, $3)`, [
        LIKE_FAUX,
        ACTEUR_A,
        ANNONCE_PUBLIC,
      ]),
    ).rejects.toThrow();

    const delOwn = await client.query(`delete from public.likes where id = $1`, [LIKE_MEMBRE]);
    expect(delOwn.rowCount).toBe(1);

    const delOther = await client.query(`delete from public.likes where id = $1`, [LIKE_A]);
    expect(delOther.rowCount).toBe(0);
  });

  it('moderation_log : insertion admin autorisée, modification et suppression interdites', async () => {
    await setJwtUser(client, MEMBRE);
    await expect(
      client.query(
        `insert into public.moderation_log (id, admin_id, content_type, content_id, action)
         values ($1, $2, 'annonce', $3, 'valide')`,
        ['ddddddd2-dddd-dddd-dddd-ddddddddddd2', MEMBRE, ANNONCE_A],
      ),
    ).rejects.toThrow();

    await setJwtUser(client, ADMIN);
    const insert = await client.query(
      `insert into public.moderation_log (id, admin_id, content_type, content_id, action)
       values ($1, $2, 'annonce', $3, 'valide')`,
      [LOG_A, ADMIN, ANNONCE_A],
    );
    expect(insert.rowCount).toBe(1);

    const update = await client.query(
      `update public.moderation_log set raison = 'modifié' where id = $1`,
      [LOG_A],
    );
    expect(update.rowCount).toBe(0);

    const del = await client.query(`delete from public.moderation_log where id = $1`, [LOG_A]);
    expect(del.rowCount).toBe(0);
  });
});
