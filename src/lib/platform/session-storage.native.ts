import { Capacitor } from '@capacitor/core';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import type { SupportedStorage } from '@supabase/supabase-js';

/**
 * Stockage de session mobile — guide IA §7.3, ADR-004 et ADR-008.
 *
 * Ce module est le **seul** endroit du dépôt qui importe le plugin sécurisé.
 * Il n'est jamais réexporté par `platform/index.ts` et n'est reachable que
 * depuis une page `*.mobile.tsx` par un import explicite. Le repli web du
 * plugin (`localStorage`) reste ainsi hors du bundle web et de l'APK :
 * sur une plateforme non native, toute opération échoue explicitement.
 *
 * Supabase sérialise déjà la session en JSON : `getItem`/`setItem` doivent
 * donc transmettre la chaîne telle quelle, sans second encodage.
 */

export const SESSION_STORAGE_PREFIX = 'cultura.session.';

let prefixReady: Promise<void> | undefined;

function nativeStorage(): void {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Stockage de session mobile indisponible hors coquille native');
  }
}

function ready(): Promise<void> {
  prefixReady ??= SecureStorage.setKeyPrefix(SESSION_STORAGE_PREFIX);
  return prefixReady;
}

export const secureSessionStorage: SupportedStorage = {
  async getItem(key: string): Promise<string | null> {
    nativeStorage();
    await ready();
    return SecureStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    nativeStorage();
    await ready();
    await SecureStorage.setItem(key, value);
  },

  async removeItem(key: string): Promise<void> {
    nativeStorage();
    await ready();
    await SecureStorage.removeItem(key);
  },
};
