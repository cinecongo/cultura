# ADR-008 — Session mobile et stockage sécurisé (P3.3)

- **Statut :** Accepté — revue `architect` favorable du 2026-11-28, arbitrage propriétaire confirmé
- **Date :** 2026-11-28
- **Décideurs :** propriétaire du projet (arbitrages explicites du 2026-11-28) + agent
- **Concerne :** P3.3, Gate G3
- **Documents liés :** cahier v1.3 §5 et §12, guide IA §4 (P3.3), §7.3, §8.8, ADR-001, ADR-003, ADR-004, `AGENTS.md` §7

## Contexte

ADR-001 retient un seul dépôt Next.js avec deux cibles : le web en SSR et l'APK Capacitor embarquant l'export statique `out/`. ADR-004 impose, côté mobile, le client `@supabase/supabase-js` avec la clé `anon`, une session en stockage sécurisé et aucune règle de sécurité côté client (RLS + contraintes SQL font autorité). Le guide IA §7.3 interdit `localStorage` pour les jetons et exige HTTPS seul, `debuggable=false` en release, `allowBackup` maîtrisé et R8.

À l'ouverture de P3.3, le dépôt ne contient ni dépendance Capacitor, ni répertoire `android/`, ni page d'authentification mobile (toutes les pages d'auth sont en `*.web.tsx`, donc absentes de l'export statique). L'émulateur est installé mais `emulator -list-avds` est vide et aucune image système n'est présente.

## Options étudiées

| Option | Avantages | Inconvénients | Verdict |
|---|---|---|---|
| `@aparajita/capacitor-secure-storage` 8.0.1 | Capacitor 8+, Android Keystore + AES-GCM, API typée JSON, entretenu (2026-09) ; web explicitement non sécurisé donc importable seulement côté natif | Dépendance communautaire ; le repli web `localStorage` doit être rendu inatteignable par la structure des modules | **Retenue** (arbitrage propriétaire) |
| `capacitor-secure-storage-plugin` 0.14.2 | Capacitor 8+, AndroidKeyStore + SharedPreferences, API chaîne, entretenu (2026-11) | API moins typée ; avertissement `allowBackup` documenté par le plugin lui-même ; base64 côté web | Écartée |
| `@capacitor/preferences` 8.0.1 | Plugin officiel, simple | Stockage **non chiffré** (SharedPreferences/UserDefaults) : ne satisfait pas le guide §7.3 | Écartée |
| Session en mémoire uniquement | Aucun jeton persisté | Déconnexion à chaque redémarrage, contraire au critère « session sur mobile » | Écartée |

## Décision

1. Les dépendances `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` (8.x, alignées) et `@aparajita/capacitor-secure-storage` 8.0.1 sont ajoutées au lockfile. Aucun autre plugin n'est introduit en P3.3.
2. `capacitor.config.ts` embarque les fichiers statiques de `out/` : **aucun `server.url`**, `webDir: 'out'`, `android.allowMixedContent: false`. `allowNavigation` n'est pas élargi : il filtre les navigations WebView, pas les `fetch` vers Supabase. La configuration Android générée est durcie : `android:debuggable="false"` en release, `android:allowBackup="false"`, R8/ProGuard actifs en release.
3. Le plugin sécurisé n'est importé que depuis `src/lib/platform/session-storage.native.ts`, reachable uniquement depuis une page `*.mobile.tsx` via un import explicite (le suffixe `.native` n'est **pas** une extension Next ; il garantit le chemin, pas l'exclusion). Il n'est jamais réexporté par `src/lib/platform/index.ts`. Le bundle web ne contient ni import `@capacitor/*`, ni code de session mobile, ni secret. Le contrat `getItem`/`setItem`/`removeItem` attendu par `@supabase/supabase-js` est un passage direct de chaînes (le client fait déjà `JSON.stringify`/`JSON.parse`), avec un préfixe non vide `cultura.session.` ; `localStorage` n'est jamais utilisé pour la session.
4. Le client mobile dédié `src/lib/auth/mobile-client.native.ts` utilise la clé `anon` seule avec `persistSession: true`, `autoRefreshToken: true` et **`detectSessionInUrl: false`** (aucun callback serveur dans l'APK). La session restaurée est validée par `getUser()`, jamais déduite du seul jeton local. La page de connexion mobile réutilise les clés i18n PT/FR/EN existantes et appelle directement Supabase Auth (pas de route API, absente de l'export statique). Les erreurs affichées sont génériques et traduites.
5. La limitation de débit de la connexion mobile repose sur celle de Supabase Auth (par adresse IP et par email) : l'interface traduit un `429` en `auth.error.tooManyRequests`, applique un délai de 30 s et n'affiche jamais le message technique. La vérification Turnstile et l'inscription restent sur le web en P3.3 : l'APK n'expose aucun parcours d'inscription. Une série de tentatives infructueuses aboutissant à `429` fait partie des preuves de l'étape (arbitrage propriétaire du 2026-11-28, retenu face au proxy Edge Function hors périmètre).
6. La preuve sur émulateur est produite par une connexion réelle dans la WebView, avec vérification via `adb` et/ou CDP que la session persiste dans le stockage sécurisé et qu'aucun jeton n'apparaît dans `localStorage`.

## Conséquences

- Positives : session mobile conforme au guide §7.3 et à ADR-004 ; une seule base de code ; aucun secret dans l'APK.
- Négatives / coûts : ajout de quatre dépendances et d'un projet Android natif versionné ; l'export statique impose une page d'auth dédiée ; le test sur émulateur dépend d'un AVD et d'une image système locaux.
- Dette acceptée : le partage natif, les App Links, le splash, la barre d'état et la signature restent en P9 (agent `mobile-android`) ; P3.3 se limite à la session. La rotation des clés Supabase exposées (O12) reste ouverte.

## Vérification

- `npm run build:web` puis analyse du bundle : aucun `@capacitor/*`, aucun module natif, aucun secret.
- `npm run build:mobile` puis `npx cap sync android` sans erreur ; `out/` complet.
- Tests unitaires du contrat de stockage (get/set/remove, erreurs, absence de `localStorage`) et test de garde de séparation des cibles.
- Sur émulateur : connexion réelle, session persistée après redémarrage de l'application, jeton absent de `localStorage`, limitation confirmée par un `429`.
- `npm run lint`, `typecheck`, `test`, `secrets`, `audit` ; revue `security-reviewer` puis verdict `verifier`.

## Références

- `PROGRESS.md` — section `[P3.3] Session sur mobile`
- `DECISIONS/ADR-001-deux-cibles-build.md`, `DECISIONS/ADR-004-acces-donnees.md`
- `.claude/agents/mobile-android.md`, `CULTURA_GUIDE_IA.md` §7.3
