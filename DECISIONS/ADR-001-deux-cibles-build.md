# ADR-001 — Deux cibles de build pour un seul code Next.js + Capacitor

- **Statut :** Proposé — validation humaine requise (Gate G0)
- **Date :** 2026-11-23
- **Décideurs :** architecte + porteur de projet
- **Concerne :** P0.2, P1.3, P6.6, P9
- **Documents liés :** cahier §9.1–9.2 ; guide §9 (P0.2), §8.3, §8.5

## Contexte

Le cahier exige deux propriétés contradictoires à première vue :

1. **Web** : rendu côté serveur et SEO fort (pages événements et acteurs indexables).
2. **Android** : un APK Capacitor, qui embarque des fichiers **statiques** dans la WebView.

Par ailleurs : budget de performance sévère (3G, data coûteuse), base de code unique, équipe réduite, et un besoin de partage natif WhatsApp.

## Options étudiées

### A. Un seul code, deux cibles de build (retenue)

`BUILD_TARGET=web` → `next build` classique, SSR/ISR sur Vercel.
`BUILD_TARGET=mobile` → `next build && next export` (`output: 'export'`), copié dans `android/app/src/main/assets/public`.

| Avantages | Inconvénients |
|---|---|
| Zéro duplication de code | Deux modes d'exécution à tester en CI |
| SEO complet sur le web | Les pages de détail dynamiques ne peuvent pas être pré-rendues |
| Même UI, mêmes tokens, mêmes tests | `next/image` doit être désactivé en export |
| Isolation claire des différences via `platform/` | Auth et stockage diffèrent (cookie vs stockage sécurisé) |

### B. Capacitor charge le site hébergé (`server.url`)

| Avantages | Inconvénients |
|---|---|
| Un seul déploiement | Dépendance réseau permanente, hors-ligne nul |
| Mise à jour instantanée | Risque de refus Play Store (app « wrapper ») |
| Pas de couche plateforme | Deep links et partage natif fragiles |

**Rejetée.** Contredit l'exigence « application Android » et le contexte data coûteuse.

### C. SPA (Vite + React Router) + site SEO séparé

| Avantages | Inconvénients |
|---|---|
| Export statique trivial | Deux bases de code, deux designs, double maintenance |
| Développement mobile simple | SEO à reconstruire, CMS éditorial dupliqué |

**Rejetée.** Budget d'équipe insuffisant, risque de divergence.

### D. Flutter

Écartée par le cahier v1.3 (A2). Ne pas rouvrir.

## Décision

**Option A.** Un seul dépôt Next.js (App Router), TypeScript strict, deux cibles de build.

### 1. Couche `platform`

`src/lib/platform/` est le **seul** endroit qui connaît la cible. Elle expose :

```ts
export const target: 'web' | 'mobile'
export const routes = { home(l), today(l), week(l), event(l, slug), annonce(l, slug), acteur(l, slug), city(l, slug), search(l) }
export async function share(data: { title: string; text: string; url: string }): Promise<void>
export const storage: { get(key): Promise<string|null>; set(key, value): Promise<void> }
export const network: { isOnline(): boolean; subscribe(cb): () => void }
```

Aucun composant ne teste `process.env` ni n'importe `@capacitor/*` directement.
`@capacitor/*` n'est importé que dans des modules `*.native.ts`, résolus par la cible mobile.

### 2. Routes

Les URLs publiques sont identiques sur les deux cibles pour le partage : `/pt/evento/{slug}`.

- **Web** : route dynamique `app/[locale]/evento/[slug]/page.tsx` (SSR + `generateMetadata`).
- **Mobile** : la même route est impossible en export statique. On utilise une **coquille cliente** `app/[locale]/evento/page.tsx` qui lit `?slug=`.
- Tous les liens internes passent par `routes.event(locale, slug)`. **Interdiction d'écrire une URL à la main dans un composant.**
- Les liens de partage utilisent toujours l'URL **web** (canonique), même depuis l'application.
- Les App Links Android (P9.2) capturent `/pt/evento/*` et redirigent la WebView vers la coquille `?slug=`.

> Ce point est le principal risque de divergence : il sera couvert par un test e2e et par un test unitaire de `routes`.

### 3. Accès aux données

- Une couche unique `src/lib/data/<domaine>.ts`, jamais Supabase dans un composant.
- Deux implémentations de client : serveur (cookies, `@supabase/ssr`) et navigateur (`@supabase/supabase-js`), même clé `anon`, mêmes politiques RLS.
- La clé `service_role` est confinée aux modules serveur marqués `server-only` et aux Edge Functions.
- Les lectures web sont faites en composants serveur ; les lectures mobiles en composants clients avec pagination par curseur.

### 4. Images

- Web : `next/image`, WebP/AVIF, `srcset`, dimensions réservées.
- Mobile : `unoptimized: true` + images servies par Supabase Storage (conversion/redimensionnement côté Storage ou pré-génération à l'upload).
- Budget : aucune image > 200 Ko sur une carte de flux ; placeholder de ratio fixe pour éviter le décalage.

### 5. Authentification

- Web : session en cookies `HttpOnly` via `@supabase/ssr`.
- Mobile : session via plugin de stockage sécurisé (P3.3), jamais `localStorage`.
- Même fournisseur Supabase Auth dans les deux cas ; aucun mot de passe géré maison.

### 6. i18n et SEO

- Préfixe de locale obligatoire : `/pt`, `/fr`, `/en` sur les deux cibles.
- `hreflang`, sitemap et JSON-LD générés uniquement dans le build web.
- Dans le build mobile, les pages de détail sont `noindex` (pas d'indexation d'un shell vide).

### 7. Configuration

`next.config.ts` lit `BUILD_TARGET` (défaut `web`) :

```ts
const mobile = process.env.BUILD_TARGET === 'mobile'
export default {
  output: mobile ? 'export' : undefined,
  images: { unoptimized: mobile },
  trailingSlash: mobile,
}
```

La CI construit **les deux** cibles à chaque étape à partir de P1.3.

## Conséquences

**Positives**

- Une seule base de code, un seul design system, un seul jeu de tests métier.
- SEO complet côté web sans sacrifier l'application Android.
- Les différences sont localisées et testables.

**Négatives / coûts**

- Deux stratégies de routage pour les pages de détail ; discipline obligatoire sur `routes`.
- Auth et stockage à traiter deux fois.
- La CI est plus lente (deux builds).
- Certaines optimisations Next.js (ISR, Server Actions) n'existent pas côté mobile.

**Dette acceptée**

- Les mutations mobiles s'appuient sur les contraintes SQL + RLS + validation partagée, faute de serveur Node embarqué (voir ADR-004).

## Vérification (spike P0.2)

1. Une page de test liste 5 événements lus depuis Supabase.
2. `BUILD_TARGET=web npm run build` → page rendue côté serveur (HTML contient les titres).
3. `BUILD_TARGET=mobile npm run build` → dossier `out/` complet, aucune route dynamique non générée.
4. `npx cap sync android && npx cap run android` → l'application s'ouvre sur l'émulateur et affiche la même liste.
5. Le partage natif ouvre WhatsApp avec le bon message ; sur le web, `wa.me` est utilisé.
6. Le build mobile ne contient aucun secret : recherche de `service_role`, `SUPABASE_SERVICE_ROLE_KEY` dans `out/` → 0 résultat.
7. Mesure : JS initial de la page d'accueil ≤ 150 Ko gzip.

Preuves consignées dans `PROGRESS.md` (sorties de commandes, pas d'affirmations).

## Références

- Cahier §9.1, §9.2, §7.7
- Guide IA §8.3, §8.5, §9 P0.2, P6.6, P9
- ADR-002 (i18n), ADR-004 (données)
