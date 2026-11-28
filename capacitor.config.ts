import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Coquille Capacitor — ADR-001 / guide IA §7.3.
 *
 * L'APK embarque l'export statique de `out/` : aucun `server.url`, aucun
 * live-reload, aucun `cleartext`. Les échanges avec Supabase se font en HTTPS
 * depuis la WebView ; `allowNavigation` n'est donc pas élargi (il ne filtre
 * pas les appels réseau, seulement les navigations de la WebView).
 *
 * L'inspection WebView n'est pas activée ici : Capacitor l'active déjà dans
 * les builds debuggables, et elle reste désactivée en release.
 */
const config: CapacitorConfig = {
  appId: 'ao.cd.cultura',
  appName: 'Cultura',
  webDir: 'out',
  android: {
    allowMixedContent: false,
  },
};

export default config;
