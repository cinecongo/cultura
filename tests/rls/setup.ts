import { Client } from 'pg';

/**
 * Client de test pour la politique RLS (P2.3).
 *
 * Construit une connexion au pooler Supabase `cultura-dev` (pas de Docker :
 * voir DECISIONS/ADR-006). Les politiques RLS lisent l'utilisateur via
 * `auth.uid()`, qui dérive de la GUC `request.jwt.claims` : on y injecte le
 * `sub` du compte testé avant chaque requête.
 */

export const RLS_TEST_HOST = process.env.SUPABASE_DB_HOST ?? 'aws-1-eu-west-1.pooler.supabase.com';
export const RLS_TEST_PORT = Number(process.env.SUPABASE_DB_PORT ?? 5432);
export const RLS_TEST_DATABASE = process.env.SUPABASE_DB_NAME ?? 'postgres';
export const RLS_TEST_USER = `postgres.${process.env.SUPABASE_PROJECT_ID ?? 'exsemqskhkgfsogdtvpz'}`;
export const RLS_TEST_PASSWORD = process.env.SUPABASE_DB_PASSWORD ?? '';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export async function createRlsClient(): Promise<Client> {
  const client = new Client({
    host: RLS_TEST_HOST,
    port: RLS_TEST_PORT,
    database: RLS_TEST_DATABASE,
    user: RLS_TEST_USER,
    password: RLS_TEST_PASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15_000,
  });
  await client.connect();
  return client;
}

export async function setJwtUser(client: Client, uid: string): Promise<void> {
  if (!isUuid(uid)) {
    throw new Error('uid invalide pour le JWT de test');
  }
  await client.query("select set_config('request.jwt.claims', $1::jsonb, false)", [
    JSON.stringify({ sub: uid }),
  ]);
}

export async function closeRlsClient(client: Client): Promise<void> {
  await client.end();
}
