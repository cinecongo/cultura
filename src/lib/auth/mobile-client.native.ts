import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { getPublicEnv } from '@/lib/env';
import { secureSessionStorage } from '@/lib/platform/session-storage.native';
import type { Database } from '@/lib/supabase/types';

/**
 * Client mobile — ADR-004 §2 et ADR-008.
 *
 * Un seul client, clé `anon` uniquement, session dans le stockage sécurisé.
 * `detectSessionInUrl` est désactivé : l'APK n'a ni callback serveur ni
 * historique de navigation web où faire transiter un jeton.
 */

function mobileEnv(): { readonly url: string; readonly anonKey: string } {
  const { NEXT_PUBLIC_SUPABASE_URL: url, NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey } = getPublicEnv();

  // Le schéma public autorise http: pour le développement web. Sur mobile,
  // les identifiants circuleraient en clair : refus explicite avant création.
  if (new URL(url).protocol !== 'https:') {
    throw new Error('La cible mobile exige une URL Supabase en HTTPS');
  }
  // Une clé de service collée ici serait embarquée dans l'APK : seuls les
  // formats publishable et anon historique sont acceptés.
  const publishable = /^sb_publishable_[A-Za-z0-9_-]{20,}$/u.test(anonKey);
  const legacyAnon = /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/u.test(anonKey);
  if (!publishable && !legacyAnon) {
    throw new Error('La cible mobile exige une clé publique Supabase');
  }

  return { url, anonKey };
}

let client: SupabaseClient<Database> | undefined;

/**
 * Création différée : l'export statique évalue les modules côté serveur au
 * build, où aucun stockage natif n'existe. Le client n'est instancié qu'au
 * premier usage dans la WebView.
 */
export function mobileSupabase(): SupabaseClient<Database> {
  if (!client) {
    const { url, anonKey } = mobileEnv();
    client = createClient<Database>(url, anonKey, {
      auth: {
        storage: secureSessionStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}
