import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

import { getPublicEnv } from '@/lib/env';
import { getServerEnv } from '@/lib/env.server';
import type { Database } from '@/lib/supabase/types';

/**
 * Client de session : cookies `HttpOnly`, `SameSite=Lax`, `Secure` en
 * production. Aucun jeton dans `localStorage`, aucun secret côté navigateur.
 * Un client par requête : les cookies sont relus à chaque appel.
 */
export function authServerClient() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getPublicEnv();

  return createServerClient<Database>(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    },
    cookies: {
      async getAll() {
        const store = await cookies();
        return store.getAll();
      },
      async setAll(items) {
        const store = await cookies();
        for (const { name, value, options } of items) {
          store.set(name, value, options);
        }
      },
    },
  });
}

/**
 * Client d'administration : `service_role` serveur uniquement. Jamais importé
 * depuis un composant client (`server-only` + garde dans `env.server.ts`).
 */
export function authAdminClient() {
  const { NEXT_PUBLIC_SUPABASE_URL } = getPublicEnv();
  return createClient<Database>(
    NEXT_PUBLIC_SUPABASE_URL,
    getServerEnv().SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}

/**
 * Vérifie le mot de passe courant sans toucher à la session de l'utilisateur :
 * ce client ne persiste aucun jeton et n'écrit aucun cookie.
 */
export async function verifyAccountPassword(email: string, password: string): Promise<boolean> {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getPublicEnv();
  const client = createClient<Database>(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  return error === null;
}

/** Utilisateur courant vérifié auprès de Supabase (jamais le JWT seul). */
export async function currentUser() {
  const { data, error } = await authServerClient().auth.getUser();
  if (error) return null;
  return data.user;
}
