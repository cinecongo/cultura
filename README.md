# CULTURA

**A agenda cultural de Angola.** Réseau d'information culturelle structurée — pas un réseau social.

> « Chaque acteur culturel devient sa propre source officielle. »

| | |
|---|---|
| Marché | Angola (Luanda, Benguela, Huambo, Cabinda, Lubango en priorité) |
| Langues | Portugais d'Angola (principal), français, anglais — dès la V1 |
| Web | Next.js (App Router), TypeScript strict, Tailwind + tokens design |
| Données | Supabase (PostgreSQL, Auth, Storage, RLS) |
| Hébergement | Vercel (web) |
| Android | Capacitor — même base de code que le web |
| État | **P1 — fondations techniques** (P1.1 → P1.5). Gate G0 franchie le 2026-11-23 ; aucune donnée métier, aucune migration |

---

## 1. Carte des documents

Lire dans cet ordre. En cas de conflit, la priorité est celle du tableau.

| Priorité | Document | Rôle |
|---|---|---|
| 1 | [`CULTURA_CAHIER_DES_CHARGES_v1.3.md`](CULTURA_CAHIER_DES_CHARGES_v1.3.md) | **Source de vérité produit.** Périmètre, rôles, modèle de données, roadmap. Ne pas modifier sans amendement validé. |
| 2 | [`CULTURA_GUIDE_IA.md`](CULTURA_GUIDE_IA.md) | Méthode d'exécution : phases, gates, sécurité, qualité, design, agents. |
| 3 | [`CULTURA_MEDIA_GUIDE_v1.0.docx`](CULTURA_MEDIA_GUIDE_v1.0.docx) | Référence éditoriale et réseaux sociaux (contenu, pas code). |
| 4 | [`AGENTS.md`](AGENTS.md) | Règles de travail du dépôt (à lire avant toute action). |
| 5 | [`PROGRESS.md`](PROGRESS.md) | Journal d'avancement, preuves, verdicts. |
| 6 | [`DESIGN.md`](DESIGN.md) | Identité visuelle, tokens, composants, wireframes. |
| 7 | [`DECISIONS/`](DECISIONS/) | ADR — décisions d'architecture. |
| 8 | [`QUESTIONS.md`](QUESTIONS.md) | Questions ouvertes et ambiguïtés à arbitrer. |
| 9 | [`BACKLOG.md`](BACKLOG.md) | Idées hors périmètre MVP. |
| 10 | [`i18n/GLOSSAIRE.md`](i18n/GLOSSAIRE.md) | Vocabulaire PT/FR/EN imposé. |
| 11 | [`docs/OUTILS-CONNEXION.md`](docs/OUTILS-CONNEXION.md) | Préparation GitHub / Supabase / Vercel. |

---

## 2. Ce qui est construit à ce stade

Gate G0 franchie le 2026-11-23. Les étapes P0 et P1 sont livrées :

- cadrage P0.1 et arbitrages (`QUESTIONS.md`) ;
- architecture des deux cibles de build Next.js/Capacitor (`DECISIONS/ADR-001`) ;
- i18n typé PT-AO/FR/EN (`DECISIONS/ADR-002`) ;
- modèle de sécurité, rôles et RLS (`DECISIONS/ADR-003`) ;
- accès aux données, validation et pagination (`DECISIONS/ADR-004`) ;
- plan de design complet et revue anti-« look IA » (`DESIGN.md`) ;
- outillage P1.2 : ESLint, TypeScript strict, Prettier, Vitest, Playwright, gitleaks, hook pré-commit ;
- squelette P1.3 : App Router, couche `platform`, `build:web` et `build:mobile` réels ;
- i18n P1.4 : catalogues typés, `Intl` (fuseau `Africa/Luanda`), routes localisées, cookie de langue ;
- design P1.5 : tokens, échelle typographique, Archivo auto-hébergée, en-tête, barre basse mobile, réglette horaire, favicon, volet 500.

**Aucune migration, aucune table, aucune donnée réelle** : la base arrive en P2/P3.

---

## 3. Stack et contraintes

- **Mobile-first, léger** : objectif < 3 s sur 3G, JS initial ≤ 150 Ko gzip par page publique.
- **SEO** : pages événement et acteur rendues côté serveur ; sitemap, `hreflang`, JSON-LD `Event`.
- **Un seul code, deux cibles** : `web` (SSR/ISR sur Vercel) et `mobile` (`output: 'export'` pour Capacitor). Les différences sont isolées dans `src/lib/platform/`.
- **Sécurité** : RLS sur 100 % des tables, aucun secret dans le dépôt, clé `service_role` jamais côté client.
- **Données** : stockage UTC, affichage `Africa/Luanda` (UTC+1, sans heure d'été). Montants en Kz.
- **Accessibilité** : WCAG 2.1 AA, cibles ≥ 44 px, `prefers-reduced-motion` respecté.

---

## 4. Structure cible du dépôt

```
/
├─ AGENTS.md                  Règles de travail
├─ CLAUDE.md                  Pointeur vers AGENTS.md
├─ PROGRESS.md                Journal + preuves
├─ BACKLOG.md                 Hors périmètre
├─ QUESTIONS.md               Arbitrages en attente
├─ DESIGN.md                  Système de design
├─ DECISIONS/                 ADR
├─ i18n/GLOSSAIRE.md          Vocabulaire PT/FR/EN
├─ docs/                      Notes transverses + captures de contrôle
├─ public/
│  ├─ brand/logo.svg          Logotype utilisé par l'en-tête
│  └─ fonts/                  Archivo (WOFF2) + licence OFL
├─ src/
│  ├─ app/
│  │  ├─ (default)/           Document par défaut : résolveur de langue, 404
│  │  └─ (localized)/[locale] Pages PT/FR/EN (deux layouts racines)
│  ├─ components/             UI sans logique métier
│  ├─ lib/
│  │  ├─ i18n/                Catalogues, résolution, formatage
│  │  ├─ platform/            Différences web / mobile
│  │  └─ seo.ts, site.ts      Canonique, hreflang, noms propres
│  └─ styles/                 (à venir : les tokens vivent dans globals.css)
├─ supabase/                  (P2) migrations, seed, tests RLS
├─ tests/
│  ├─ e2e/                    Playwright
│  └─ *.test.ts(x)            Vitest
├─ scripts/                   Hook, mesure de rendu
├─ .githooks/pre-commit       ESLint + gitleaks sur l'index
├─ android/                   Généré en P9
└─ capacitor.config.ts
```

---

## 5. Démarrage local

```bash
git clone https://github.com/cinecongo/cultura.git
cd cultura
cp .env.example .env.local     # renseigner NEXT_PUBLIC_SITE_URL et les clés publiques Supabase
npm ci                         # installe les dépendances et le hook pré-commit
npm run dev                    # http://localhost:3000
```

**Le build exige `.env.local`.** `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL` et
`NEXT_PUBLIC_SUPABASE_ANON_KEY` sont validées au premier rendu : sans elles, `build:web`
et `build:mobile` s'arrêtent avec un message qui ne cite que les noms manquants. Aucun
secret (`service_role`) n'est nécessaire pour construire le site.

Commandes disponibles :

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build:web` | Build SSR/ISR pour Vercel (`.next`) |
| `npm run build:mobile` | Export statique pour Capacitor (`out/`) |
| `npm run lint` / `typecheck` | ESLint / TypeScript strict |
| `npm run test` | Vitest (unitaires) |
| `npm run test:e2e` | Playwright (serveur de dev sur le port 4319) |
| `npm run format:check` | Prettier |
| `npm run measure` | Mesure le rendu de `out/` (360 px par défaut) |
| `npm run secrets` | gitleaks sur l'historique Git |
| `npm run audit` | `npm audit --audit-level=high` |
| `npm run hooks:install` | Réinstalle `core.hooksPath=.githooks` |

Notes :

- Playwright utilise **Microsoft Edge installé** en local (`channel: 'msedge'`) ; en CI,
  installer Chromium et retirer le canal.
- Les deux builds partagent `.next` : ne jamais les lancer en parallèle.
- `npm run secrets` suppose `gitleaks` dans le `PATH` (le hook le cherche aussi dans
  `~/.cultura/bin`).

---

## 6. Feuille de route

| Version | Contenu |
|---|---|
| 0.1 | Fondations : actualités, événements, acteurs, PT/FR/EN, admin, back-office éditorial, revendication de fiche |
| 0.2 | Page « Aujourd'hui », filtres ville/commune/catégorie, partage WhatsApp, suivre une ville |
| 0.3 | Likes, favoris, recherche, compteur de vues |
| 0.4 | Vérification, badge, statistiques acteur, Android Capacitor |
| 1.0 | Publicité locale, mise en avant, tableau de bord complet |

Phases d'exécution détaillées : `CULTURA_GUIDE_IA.md` §9.

---

## 7. Contribuer

1. Lire `AGENTS.md` et `PROGRESS.md`.
2. Une étape à la fois ; ne pas ouvrir l'étape suivante sans verdict `VALIDÉ`.
3. Toute preuve va dans `PROGRESS.md` ; toute idée hors périmètre va dans `BACKLOG.md`.
4. Aucun secret, jamais.
5. Commits conventionnels (`feat:`, `fix:`, `chore:`, `docs:`…).

---

*Projet Cultura — Angola. Document de travail interne.*
