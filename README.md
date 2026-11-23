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
| État | **Fondations (P0/P1) — aucun code applicatif, Gate G0 en attente** |

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

Cette étape livre **les fondations**, pas l'application :

- cadrage P0.1 : reformulation, périmètre, ambiguïtés et questions ouvertes (`QUESTIONS.md`) ;
- architecture des deux cibles de build Next.js/Capacitor (`DECISIONS/ADR-001`) ;
- choix i18n proposé (`DECISIONS/ADR-002`) ;
- modèle de sécurité, rôles et RLS (`DECISIONS/ADR-003`) ;
- accès aux données, validation et pagination (`DECISIONS/ADR-004`) ;
- plan de design complet et revue anti-« look IA » (`DESIGN.md`) ;
- fichiers de pilotage : `AGENTS.md`, `PROGRESS.md`, `BACKLOG.md`, `.env.example`, `.gitignore` ;
- définitions des 10 agents (`.claude/agents/`) ;
- glossaire produit PT/FR/EN (`i18n/GLOSSAIRE.md`).

**Aucun code applicatif, aucune migration, aucun composant** avant validation humaine de la Gate G0 (cahier + guide IA §9).

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
├─ docs/                      Notes transverses
├─ public/                    Logo SVG, favicons, images fixes
├─ src/
│  ├─ app/[locale]/           Routes localisées (web + shell mobile)
│  ├─ components/             UI sans logique métier
│  ├─ features/               annonces, events, acteurs, agenda, admin, compte
│  ├─ lib/
│  │  ├─ data/                Accès Supabase (jamais dans un composant)
│  │  ├─ i18n/                Catalogues et formatage
│  │  ├─ platform/            Différences web / mobile
│  │  ├─ supabase/            Clients serveur et navigateur
│  │  └─ validation/          Schémas zod partagés
│  └─ styles/                 Tokens CSS issus de DESIGN.md
├─ supabase/
│  ├─ migrations/             SQL versionné
│  ├─ seed.sql                Données fictives
│  └─ tests/                  Tests RLS
├─ tests/                     unit, e2e (Playwright)
├─ android/                   Généré en P9
└─ capacitor.config.ts
```

---

## 5. Démarrage local (à compléter en P1)

> Ces commandes seront disponibles à la fin de P1.5. Elles sont documentées ici pour cadrer l'objectif « installation en moins de 10 minutes ».

```bash
git clone <repo>
cd cultura
cp .env.example .env.local     # renseigner les clés Supabase de dev
npm ci
npm run dev                    # http://localhost:3000/pt
```

Commandes cibles : `dev`, `build:web`, `build:mobile`, `lint`, `typecheck`, `test`, `test:e2e`, `db:push`, `db:types`.

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
