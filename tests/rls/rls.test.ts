import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Client } from 'pg';
import { createRlsClient, enableRlsSession, setJwtUser, closeRlsClient } from './setup';

const ACTEUR_A = '33333333-3333-3333-3333-333333333333';
const ACTEUR_B = '44444444-4444-4444-4444-444444444444';
const MEMBRE = '55555555-5555-5555-5555-555555555555';

const FICHE_A = '77777777-7777-7777-7777-777777777777';
const ANNONCE_A = '88888888-8888-8888-8888-888888888888';

describe('RLS — contenu et isolation (P2.3)', () => {
  let client: Client;

  beforeAll(async () => {
    client = await createRlsClient();

    // Nettoyage : le client est encore rattaché au rôle postgres (bypass RLS),
    // les deletes de setup passent donc sans contrainte.
    await client.query('delete from public.likes');
    await client.query('delete from public.revendications_fiches');
    await client.query('delete from public.demandes_retrait');
    await client.query('delete from public.villes_suivies');
    await client.query('delete from public.shares');
    await client.query('delete from public.clicks');
    await client.query('delete from public.signalements');
    await client.query('delete from public.moderation_log');
    await client.query('delete from public.events');
    await client.query('delete from public.annonces');
    await client.query('delete from public.acteurs_culturels');
    await client.query(
      `delete from public.users
       where email in ('acteur.a@acteur.cultura', 'acteur.b@acteur.cultura', 'membre@personne.cultura', 'admin@cultura.ao')`,
    );

    // Seed minimal : auth.users (Supabase gère la validité) + public.users + fiches.
    const seedAuth = async (uid: string, email: string): Promise<void> => {
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
        [uid, email, email, uid === MEMBRE ? 'membre' : 'acteur'],
      );
    };

    await seedAuth(ACTEUR_A, 'acteur.a@acteur.cultura');
    await seedAuth(ACTEUR_B, 'acteur.b@acteur.cultura');
    await seedAuth(MEMBRE, 'membre@personne.cultura');

    await client.query(
      `insert into public.acteurs_culturels (id, user_id, statut_fiche, nom, type, ville, verified)
       values ($1, $2, 'geree_par_equipe', 'Acteur Test A', 'artiste', 'Luanda', false)
       on conflict (id) do nothing`,
      [FICHE_A, ACTEUR_A],
    );

    await client.query(
      `insert into public.annonces (id, acteur_id, titre, contenu, langue, format, origine, statut, published_at)
       values ($1, $2, 'Concert Test', 'Leary', 'pt', 'evenement', 'acteur', 'en_attente', null)
       on conflict (id) do nothing`,
      [ANNONCE_A, FICHE_A],
    );

    // Bascule sur le rôle `authenticated` : les policies RLS doivent maintenant
    // être évaluées (le role postgres.<ref> est en bypassrls).
    await enableRlsSession(client);
  });

  afterAll(async () => {
    await closeRlsClient(client);
  });

  it('lectures : anonyme/membre ne lisent pas une annonce en attente ; l’acteur propriétaire oui', async () => {
    await setJwtUser(client, MEMBRE);
    const membreAnnonce = await client.query(`select count(*)::int as n from public.annonces`);
    expect(membreAnnonce.rows[0].n).toBe(0);

    await setJwtUser(client, ACTEUR_A);
    const aAnnonce = await client.query(`select count(*)::int as n from public.annonces`);
    expect(aAnnonce.rows[0].n).toBe(1);
  });

  it('lectures : l’acteur B ne lit pas celle de l’acteur A', async () => {
    await setJwtUser(client, ACTEUR_B);
    const bAnnonce = await client.query(
      `select count(*)::int as n from public.annonces where id = $1`,
      [ANNONCE_A],
    );
    expect(bAnnonce.rows[0].n).toBe(0);

    await setJwtUser(client, ACTEUR_A);
    const aAnnonce = await client.query(
      `select count(*)::int as n from public.annonces where id = $1`,
      [ANNONCE_A],
    );
    expect(aAnnonce.rows[0].n).toBe(1);
  });

  it('ecritures : un membre non autorisé ne peut pas creer une annonce pour un acteur existant', async () => {
    await setJwtUser(client, MEMBRE);
    await expect(
      client.query(
        `insert into public.annonces (id, acteur_id, titre, contenu, langue, format, origine, statut, published_at)
         values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', $1, 'Concert Interdit', 'Leary', 'pt', 'evenement', 'acteur', 'en_attente', null)`,
        [FICHE_A],
      ),
    ).rejects.toThrow();
  });

  it('modifications : un acteur ne modifie pas une annonce dont il n’est pas le proprietaire', async () => {
    await setJwtUser(client, ACTEUR_B);
    const bUpdate = await client.query(
      `update public.annonces set titre = 'Hamecon Test' where id = $1`,
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

  it('suppressions : aucune policy delete n’est ouverte aux acteurs (deny par defaut)', async () => {
    await setJwtUser(client, ACTEUR_A);
    const del = await client.query(`delete from public.annonces where id = $1`, [ANNONCE_A]);
    expect(del.rowCount).toBe(0);
  });
});
