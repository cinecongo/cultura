import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Client } from 'pg';

import {
  closeRlsClient,
  createRlsClient,
  resetRlsSession,
  setAnonSession,
  setJwtUser,
} from './setup';

const MEMBRE = '55555555-5555-5555-5555-555555555555';
const EMAIL = 'rls-suppression@example.test';

describe('RLS — suppression de compte (P3.4)', () => {
  let client: Client;

  beforeAll(async () => {
    client = await createRlsClient();
  });

  afterAll(async () => {
    await resetRlsSession(client);
    await closeRlsClient(client);
  });

  it('réserve EXECUTE à service_role et garde search_path vide', async () => {
    await resetRlsSession(client);
    const { rows } = await client.query(
      `select p.prosecdef, p.proconfig, pg_get_userbyid(p.proowner) as owner
         from pg_proc p
        where p.oid = 'public.cultura_delete_account_data(uuid, text)'::regprocedure`,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].prosecdef).toBe(true);
    expect(
      (rows[0].proconfig as string[]).some((entry) => /^search_path=(''|\"\")$/.test(entry)),
    ).toBe(true);

    const privileges = await client.query(
      `select grantee, privilege_type
         from information_schema.routine_privileges
        where routine_schema = 'public' and routine_name = 'cultura_delete_account_data'`,
    );
    const executees = privileges.rows
      .filter((row) => row.privilege_type === 'EXECUTE')
      .map((row) => row.grantee as string);
    expect(executees).toContain('service_role');
    expect(executees).not.toContain('PUBLIC');
    expect(executees).not.toContain('anon');
    expect(executees).not.toContain('authenticated');
  });

  it('correspond exactement au contact, sans correspondance par sous-chaîne', async () => {
    await resetRlsSession(client);
    const { rows } = await client.query(
      `select pg_get_functiondef('public.cultura_delete_account_data(uuid, text)'::regprocedure) as def`,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].def).toContain('lower(trim(contact)) = lower(trim(p_email))');
    expect(rows[0].def).not.toContain('position(lower(trim(p_email)) in lower(contact))');
  });

  it('refuse l’appel direct en anonyme et en authentifié', async () => {
    await setAnonSession(client);
    await expect(
      client.query('select public.cultura_delete_account_data($1, $2)', [MEMBRE, EMAIL]),
    ).rejects.toThrow(/permission denied/i);

    await setJwtUser(client, MEMBRE);
    await expect(
      client.query('select public.cultura_delete_account_data($1, $2)', [MEMBRE, EMAIL]),
    ).rejects.toThrow(/permission denied/i);
    await resetRlsSession(client);
  });

  it('conserve la policy de gestion des comptes par l’administrateur', async () => {
    await resetRlsSession(client);
    const { rows } = await client.query(
      `select policyname from pg_policies where schemaname = 'public' and tablename = 'users'`,
    );
    const names = rows.map((row) => row.policyname as string);
    expect(names).toContain('users_delete_admin');
  });

  it('couvre toutes les tables filles des clés étrangères sensibles', async () => {
    await resetRlsSession(client);
    const { rows } = await client.query(
      `select distinct conrelid::regclass::text as child
         from pg_constraint
        where contype = 'f'
          and connamespace = 'public'::regnamespace
          and confrelid in (
            'public.users'::regclass,
            'public.acteurs_culturels'::regclass,
            'public.annonces'::regclass,
            'public.events'::regclass
          )`,
    );
    expect(rows.map((row) => row.child as string).sort()).toEqual(
      [
        'acteurs_culturels',
        'annonces',
        'clicks',
        'events',
        'events_acteurs',
        'favorites',
        'likes',
        'moderation_log',
        'revendications_fiches',
        'shares',
        'signalements',
        'vues_quotidiennes',
        'views',
        'villes_suivies',
      ].sort(),
    );
  });
});
