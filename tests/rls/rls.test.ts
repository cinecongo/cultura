import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Client } from 'pg';
import { createRlsClient, setJwtUser, closeRlsClient } from './setup';

const ACTEUR_A = '33333333-3333-3333-3333-333333333333';
const ACTEUR_B = '44444444-4444-4444-4444-444444444444';
const MEMBRE = '55555555-5555-5555-5555-555555555555';
const ADMIN = '66666666-6666-6666-6666-666666666666';

const FICHE_A = '77777777-7777-7777-7777-777777777777';

describe('RLS — contenu et isolation (P2.3)', () => {
  let client: Client;

  beforeAll(async () => {
    client = await createRlsClient();
  });

  afterAll(async () => {
    await closeRlsClient(client);
  });

  beforeAll(async () => {
    // Seeding minimal : auth.users (géré par Supabase) + public.users + fiches.
    const seedAuth = async (uid: string, email: string): Promise<void> => {
      await client.query(
        `insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, last_sign_in_at)
         values ($1, 'authenticated', 'authenticated', $2, 'x', now(), now(), now(), now())`,
        [uid, email],
      );
      await client.query(
        `insert into public.users (id, nom, email, role, langue_preferee)
         values ($1, $2, $3, $4, 'pt')`,
        [uid, email, email, uid === MEMBRE ? 'membre' : uid === ADMIN ? 'admin' : 'acteur'],
      );
    };

    await seedAuth(ACTEUR_A, 'acteur.a@acteur.cultura');
    await seedAuth(ACTEUR_B, 'acteur.b@acteur.cultura');
    await seedAuth(MEMBRE, 'membre@personne.cultura');
    await seedAuth(ADMIN, 'admin@cultura.ao');

    const ficheRes = await client.query(
      `insert into public.acteurs_culturels (id, user_id, statut_fiche, nom, type, ville, verified)
       values ($1, $2, 'geree_par_equipe', 'Acteur Test A', 'artiste', 'Luanda', false)`,
      [FICHE_A, ACTEUR_A],
    );
    expect(ficheRes.rowCount).toBe(1);
  });

  it('lectures : anonyme ne lit pas une annonce en attente ; acteur A ne lit que la sienne', async () => {
    await setJwtUser(client, ACTEUR_A);
    const insert = await client.query(
      `insert into public.annonces (id, acteur_id, titre, contenu, langue, format, origine, statut, published_at)
       values ('77777777-7777-7777-7777-777777777777', $1, 'Concert Test', 'Leary', 'pt', 'concert', 'acteur', 'en_attente', null)`,
      [FICHE_A],
    );
    expect(insert.rowCount).toBe(1);

    await setJwtUser(client, MEMBRE);
    const membreAnnonce = await client.query(`select count(*)::int as n from public.annonces`);
    expect(membreAnnonce.rows[0].n).toBe(0);

    await setJwtUser(client, ACTEUR_A);
    const aAnnonce = await client.query(`select count(*)::int as n from public.annonces`);
    expect(aAnnonce.rows[0].n).toBe(1);
  });

  it("lectures : l'admin voit les annonces valides publiques et refuse les autres", async () => {
    await setJwtUser(client, ADMIN);
    const ok = await client.query(
      `update public.annonces set statut = 'valide' where id = '77777777-7777-7777-7777-777777777777'`,
    );
    expect(ok.rowCount).toBe(1);

    const admin = await client.query(`select count(*)::int as n from public.annonces`);
    expect(admin.rows[0].n).toBe(1);
  });
});
