import { expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

import { testAdmin } from './test-env';

export type TestRole = 'membre' | 'acteur' | 'editeur' | 'admin';

/** Ref public du projet : garde-fou de cible, aucune clé n'est affichée. */
const EXPECTED_PROJECT_REF = 'exsemqskhkgfsogdtvpz';

/** Client de provisionnement des comptes de test, côté Node uniquement. */
export function testAdminClient() {
  expect(testAdmin.url, 'URL Supabase de test disponible').toMatch(/^https:\/\//);
  expect(testAdmin.key.length, 'clé de service de test disponible').toBeGreaterThan(20);
  expect(new URL(testAdmin.url).hostname, 'le joueur de tests vise le projet attendu').toContain(
    EXPECTED_PROJECT_REF,
  );

  return createClient(testAdmin.url, testAdmin.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function setTestRole(email: string, role: TestRole): Promise<string> {
  const admin = testAdminClient();
  const { data: found, error: lookupError } = await admin
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  expect(lookupError, 'recherche du compte de test').toBeNull();
  expect(found?.id, 'compte de test présent en base').toBeTruthy();

  const id = found!.id as string;
  const { error: updateError } = await admin.from('users').update({ role }).eq('id', id);
  expect(updateError, 'changement de rôle du compte de test').toBeNull();
  return id;
}

/** Faux rôle dans les métadonnées : la garde doit l'ignorer. */
export async function forgeMetadataRole(id: string): Promise<void> {
  const { error } = await testAdminClient().auth.admin.updateUserById(id, {
    app_metadata: { role: 'admin' },
  });
  expect(error, 'métadonnées de test modifiées').toBeNull();
}

export async function deleteTestUser(id: string): Promise<void> {
  const { error } = await testAdminClient().auth.admin.deleteUser(id);
  expect(error, 'suppression du compte de test').toBeNull();
}
