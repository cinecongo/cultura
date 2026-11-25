# PROGRESS — Cultura

> Journal d'avancement. **Une entrée par étape.** Le statut `DONE` est posé par l'agent `verifier`, jamais par celui qui a produit.
> Statuts : `TODO` · `IN_PROGRESS` · `VERIFYING` · `BLOCKED` · `DONE`.
> Une preuve est une sortie réelle de commande, pas une affirmation.

---

## Vue d'ensemble

| Étape | Objet | Statut | Preuve / blocage |
|---|---|---|---|
| P0.1 | Lire, reformuler, lister les ambiguïtés | `VERIFYING` | `QUESTIONS.md` rédigé + §0 réponses reçues |
| P0.2 | Spike Next.js × Capacitor + ADR | `VERIFYING` | `ADR-001` accepté ; spike exécuté en P1.3 (deux builds réels) |
| P0.3 | Plan de design + revue anti-IA | `VERIFYING` | `DESIGN.md` v0.2 validé ; logos reçus |
| P0.4 | `.env.example` + glossaire | `VERIFYING` | Fichiers créés + `.env.local` réel |
| P1.1 | Dépôt et fichiers de pilotage | `VERIFYING` | Commit `9fba525` poussé sur `origin/main` |
| P1.2 | Outillage (ESLint, TS, Vitest, scripts) | `IN_PROGRESS` | **REFUSÉ le 2026-11-24** (hook + Playwright absents) → corrections faites, re-vérification à demander |
| P1.3 | Squelette App Router + couche `platform` + deux builds | `DONE` | **VALIDÉ par le `verifier` le 2026-11-24** |
| P1.4 | i18n typé PT-AO/FR/EN + 2 écrans + résolveur | `DONE` | **VALIDÉ par le `verifier` le 2026-11-24** ; corrections N1–N3, N8, N12, N18, N19 appliquées |
| P1.5 | Design system : tokens, Archivo, en-tête, réglette | `VERIFYING` | 95 tests · 15 e2e · 2 builds · 8 pages mesurées à 360 et 1120 px |
| P2 → P10 | — | `TODO` | — |

**Gate G0 : FRANCHIE le 2026-11-23** par validation humaine (« tu as le go »), avec **réserves** :
Q7 (relecteur PT-AO non nommé), O4–O11 (Vercel, domaine, email, Turnstile, Sentry, package Android, CI), M12 (validation juridique).
Ces réserves bloquent la **mise en production**, pas le squelette technique.

---

## Verdict indépendant du 2026-11-24 (`verifier`)

| Étape | Verdict | Suite donnée |
|---|---|---|
| P1.3 | **VALIDÉ** | Statut passé à `DONE` |
| P1.4 | **VALIDÉ** | Statut passé à `DONE` ; corrections non bloquantes appliquées |
| P1.2 | **REFUSÉ** | Deux manques bloquants : **aucun hook pré-commit** et **aucun test Playwright / script `test:e2e`** |

**Traitement des constats (le rapport complet n'est pas archivé dans le dépôt) :**

| Réf. | Constat | Traitement |
|---|---|---|
| N1–N3 | Garde-fous de copie contournables | Corrigé : placeholders malformés rejetés, expression JSX et `metadata.title`/`description` analysés, termes interdits complétés ; test de contrôle négatif ajouté |
| N4 | Écarts au `DESIGN.md` (marque, hiérarchie, états vides) | Traité en P1.5 : en-tête, logotype, échelle typographique, réglette, états vides en `h2` |
| N8 | État vide sans `h2` | Corrigé sur « Hoje » et « Semana » |
| N11 | Routes web `/fr` vs export `/fr/` | **Ouvert** → `QUESTIONS.md` §9 (N11), à trancher en P8 |
| N12 | Imports qui contournaient `@/lib/platform` | Corrigé (en-tête, pages, résolveur) |
| N14 | Deux images IA versionnées sans mention | Documentées dans `DESIGN.md` §15 comme références de travail, jamais servies |
| N15 | `README.md` obsolète | Corrigé : état réel, structure, commandes, dépendance à `.env.local` |
| N16 | Le build dépend de variables d'environnement | Assumé et documenté (`README.md` §5) : URL publique + clés publiques Supabase, aucun secret |
| N17 | Budget JS non prouvé | Mesuré : **136,2 Ko gzip** de JavaScript moderne (limite 150 Ko), CSS 3,6 Ko |
| N18 | `aria-current` absent | Corrigé : `page` sur la navigation, `true` sur la langue active |
| N19 | Cookie de langue sans `Secure` en HTTPS | Corrigé : attribut ajouté quand `location.protocol === 'https:'` |

Les corrections de P1.2 et P1.5 sont dans le même lot de commits que ce journal ; la **re-vérification indépendante** reste à demander avant de clore P1.2 et P1.5.

---

## Environnement et skills

**Date :** 2026-11-23

Les skills nommés dans `CULTURA_GUIDE_IA.md` §6 (`engineering:architecture`, `frontend-design`, `web-design-system`, `engineering:documentation`, `design:ux-copy`, `design:accessibility-review`, `searchfit-seo:*`, `engineering:deploy-checklist`, etc.) ne sont **pas disponibles** dans l'environnement courant. Conformément à la règle 2 du guide, la substitution est consignée ici :

| Skill requis | Substitution appliquée |
|---|---|
| `engineering:architecture`, `engineering:system-design` | ADR-001 à ADR-004, rédigés selon `DECISIONS/_MODELE.md` |
| `frontend-design`, `web-design-system` | `DESIGN.md` + revue anti-IA du guide §10.3 (tableau §14) |
| `engineering:documentation` | `README.md`, `AGENTS.md`, `CLAUDE.md`, ce journal |
| `design:ux-copy` | `i18n/GLOSSAIRE.md` (ton, messages, états vides) |
| `design:accessibility-review` | Checklist WCAG 2.1 AA intégrée à `DESIGN.md` §12 |
| `searchfit-seo:*` | Exigences SEO consignées dans ADR-001 §6 et ADR-004 §9 ; audit à refaire en P8.1 |
| `engineering:testing-strategy` | Critères de vérification dans chaque ADR |
| `engineering:code-review`, `verifier` | Agents définis dans `.claude/agents/` ; verdict indépendant à obtenir |

La revue indépendante par l'agent `verifier` reste **à faire** pour chaque étape.

### Outils disponibles sur la machine (vérifié le 2026-11-23)

| Outil | Version | État |
|---|---|---|
| Node.js | 24.22.1 | OK |
| npm | 11.19.1 | OK |
| Git | 2.55.0 | OK (identité locale : `cinecongo`) |
| Supabase CLI | 3.1.0 | OK (3.3.0 disponible) |
| Docker | 29.9.3 | OK (base locale possible) |
| Java Temurin | 17.0.20.1 | OK |
| Edge headless | — | OK (rendu PNG des SVG) |
| gitleaks | 8.30.1 | OK (`~/.cultura/bin`, PATH utilisateur) |
| GitHub CLI (`gh`) | — | **absent** (winget indisponible sur cette machine) |
| adb / Android Studio | — | **absent** |

Préparation détaillée : `docs/OUTILS-CONNEXION.md`.

---

## Connexion aux outils (2026-11-23)

### GitHub — fait

| Élément | Valeur |
|---|---|
| Dépôt | `https://github.com/cinecongo/cultura` (privé) |
| Branche | `main`, suit `origin/main` |
| Commit initial | `9fba525` — `docs: fondations P0 et fichiers de pilotage` (36 fichiers, 5 849 lignes) |
| Transport | **HTTPS** + Git Credential Manager |
| SSH | **non disponible sur ce PC** : la clé `SHA256:HdHc…cso` est sur le Mac. `ssh -T git@github.com` → `Permission denied (publickey)` |

**À faire par l'humain :** ajouter une clé SSH sur ce PC Windows, ou continuer en HTTPS ; activer la protection de `main` (PR + CI verte).

### Supabase — fait (dev uniquement)

| Élément | Valeur |
|---|---|
| Organisation | `Cultura` — `hhwqgrjtriyimllqwhrp` (plan gratuit) |
| Projet dev | `cultura-dev` — `rfjoxvlgejcvknowvztj` |
| Région | `eu-west-1` (aucune région africaine dans l'offre gratuite) |
| État | `ACTIVE_HEALTHY`, PostgreSQL 17 |
| Liaison CLI | `supabase link` → OK, `config.toml` créé |
| Clés | écrites dans `.env.local` (ignoré par Git), longueurs vérifiées (anon 208, service 219) |

**Points d'attention :**
- Le plan gratuit refuse `--size` : erreur `entitlement_required`. Création réussie sans ce paramètre.
- La CLI étiquette `cultura-dev` comme `environment: production` dans la réponse de `link` — c'est un **libellé CLI**, pas un projet de production. Ne pas confondre lors des `db push`.
- Le mot de passe de la base est stocké dans `%USERPROFILE%\.cultura\` : **à déplacer dans un gestionnaire de mots de passe**.
- `staging` et `prod` **non créés** (volontairement, ADR-003 / guide §8.6).

### Vercel — non fait

Bloqué par l'absence de compte/équipe (O4) et de domaine (O5). Aucun déploiement possible pour l'instant.

### Identité visuelle — reçue et versionnée

| Fichier | Taille | État |
|---|---|---|
| `logo.svg` | 188 760 o | Versionné le 2026-11-24 — vectorisation automatique |
| `Icone.svg` | 145 513 o | Versionné le 2026-11-24 — vectorisation automatique |
| `logo.jpg` | 355 646 o | Conservé |
| `Icone.jpg` | 393 415 o | Conservé |
| `brand/logo-apercu.png` | 125 733 o | Aperçu de contrôle (rendu Edge 1344 × 756) |
| `brand/icone-apercu.png` | 69 951 o | Aperçu de contrôle (rendu Edge 1024 × 1024) |

Rendu vérifié : « C » brossé + flèche terracotta/ocre + `CULTURA` + `AGENDA CULTURAL DE ANGOLA`. Contrôles de sûreté passés : aucun `<script>`, aucune référence externe, aucune entité XML. **Nettoyage requis avant P1.5** (`DESIGN.md` §15).

---

## [P0.1] Cadrage, reformulation, ambiguïtés

- **Statut :** `VERIFYING`
- **Skills/agents appelés :** `architect` (substitut : lecture intégrale du cahier v1.3, du guide IA et du guide média, puis rédaction). Date : 2026-11-23.
- **Plan :**
  1. Lire les trois documents de référence.
  2. Reformuler le produit, le périmètre et les rôles.
  3. Relever les ambiguïtés produit et les incohérences techniques du modèle.
  4. Poser les questions bloquantes, avec recommandation.
- **Livrables :**
  - `QUESTIONS.md` : reformulation, 7 questions de Gate G0, 11 questions d'outils, 12 règles métier, 17 corrections techniques, + §0 « réponses reçues ».
- **Preuves :**
  - Fichiers lus : `CULTURA_CAHIER_DES_CHARGES_v1.3.md` (939 lignes), `CULTURA_GUIDE_IA.md` (522 lignes), `CULTURA_MEDIA_GUIDE_v1.0.docx` (extrait texte).
  - Réponses : Q1–Q6 validées, T1–T17 acceptées en bloc, Q7 ouvert.
- **Verdict verifier :** en attente.
- **Blocage restant :** Q7 (relecteur PT-AO) — ne bloque pas le squelette.

---

## [P0.2] Spike Next.js × Capacitor et ADR

- **Statut :** `IN_PROGRESS`
- **Skills/agents appelés :** `architect`, `engineering:architecture` (indisponible — substitut ADR). Date : 2026-11-23.
- **Plan :**
  1. Comparer les quatre options (deux builds, `server.url`, SPA séparée, Flutter).
  2. Décrire la couche `platform`, les routes, les clients Supabase, les images, l'auth.
  3. Définir les critères de preuve du spike.
  4. **Exécuter** le spike : `BUILD_TARGET=web` et `BUILD_TARGET=mobile`, mêmes routes.
- **Livrable :** `DECISIONS/ADR-001-deux-cibles-build.md` — **accepté**.
- **Preuves :** ADR accepté ; prototype **non encore exécuté** (prévu en P1.3, dès que le squelette existe).
- **Verdict verifier :** en attente.
- **Blocage :** aucun côté Node/Supabase ; SDK Android absent pour la partie native (P9).

---

## [P0.3] Plan de design et revue anti-« look IA »

- **Statut :** `VERIFYING`
- **Skills/agents appelés :** `frontend-design`, `web-design-system`, `designer-critic` (indisponibles — substitut : `DESIGN.md` + checklist §10.3). Date : 2026-11-23.
- **Plan :**
  1. Extraire la palette et la typographie des fichiers de marque fournis.
  2. Définir un concept propre au sujet (« programme affiché », réglette horaire).
  3. Spécifier tokens, composants et wireframes des 4 écrans clés.
  4. Confronter le plan aux clichés listés par le guide et documenter les changements.
- **Livrable :** `DESIGN.md` **v0.2**, statut « validé ».
- **Contrôles réalisés :**
  - Contrastes calculés pour 12 paires de couleurs (`DESIGN.md` §3.1).
  - Revue des 13 clichés du guide §10.3 : tableau §14.
  - Palette limitée à 10 tokens, une seule famille typographique.
  - Logos rendus en PNG via Edge headless pour vérification visuelle.
- **Preuves :** `DESIGN.md` v0.2 ; ratios mesurés ; rendus `logo-full.png` / `icone-full.png` (hors dépôt).
- **Verdict verifier :** en attente ; `designer-critic` à repasser sur les premières captures.
- **Points manquants :** master logo nettoyé, favicons, gabarit OG.

---

## [P0.4] Variables d'environnement et glossaire

- **Statut :** `VERIFYING`
- **Skills/agents appelés :** `i18n-auditor` (substitut : relecture interne). Date : 2026-11-23.
- **Plan :**
  1. Lister les variables nécessaires, sans aucune valeur secrète.
  2. Marquer explicitement ce qui est public et ce qui est secret.
  3. Établir le vocabulaire PT/FR/EN, les termes interdits, les formats de date et monnaie.
- **Livrables :**
  - `.env.example` — **16 variables**, 2 valeurs par défaut non sensibles (`web`, `pt`), **0 secret**
  - `i18n/GLOSSAIRE.md` (11 sections)
  - `.env.local` (réel, **ignoré par Git**, vérifié via `git check-ignore`)
- **Preuves :**
  - `git check-ignore -v .env.local` → `.gitignore:25:*.local`
  - `git grep` sur `eyJhbGciOi`, `sk-…`, `SUPABASE_SERVICE_ROLE_KEY=…` → aucun résultat
  - Aucun `.env`, `.jks`, `.keystore`, `google-services.json`, `.pem` suivi par Git
  - Longueurs des clés vérifiées sans les afficher.
- **Verdict verifier :** en attente.
- **Points à valider :** « agente cultural » vs « ator cultural » (Q7).

---

## [P1.1] Dépôt et fichiers de pilotage

- **Statut :** `VERIFYING`
- **Skills/agents appelés :** `engineering:documentation` (indisponible — substitut direct). Date : 2026-11-23.
- **Plan :**
  1. Initialiser le dépôt Git.
  2. Créer les fichiers de pilotage et les définitions d'agents.
  3. Poser `.gitignore` et la structure cible documentée.
  4. Publier sur GitHub.
- **Livrables :**
  - `README.md`, `AGENTS.md`, `CLAUDE.md`, `PROGRESS.md`, `BACKLOG.md`, `QUESTIONS.md`
  - `.gitignore`, `.env.example`
  - `DECISIONS/_MODELE.md` + ADR-001 à ADR-004 (acceptés)
  - `.claude/agents/*.md` (10 agents + README)
  - `docs/OUTILS-CONNEXION.md`
  - `logo.svg`, `Icone.svg`, `logo.jpg`, `Icone.jpg`
- **Preuves :**
  - `git init` exécuté.
  - Commit `9fba525` : 36 fichiers, 5 849 insertions.
  - `git push -u origin main` → `* [new branch] main -> main`, `PUSH_EXIT=0`.
  - `git status -sb` → `## main...origin/main`.
- **Verdict verifier :** en attente.
- **Dette :** aucun outillage installé (ESLint, TypeScript, Vitest, Playwright) — prévu en P1.2.

---

## [P1.2] Outillage

- **Statut :** `IN_PROGRESS` — refusé le 2026-11-24, corrections faites, re-vérification à demander
- **Skills/agents appelés :** `qa-tester` (substitut : écriture des tests par le constructeur, à revalider), `security-reviewer` (substitut : gitleaks + audit npm). Date : 2026-11-24.
- **Plan :**
  1. `package.json` avec scripts reproductibles, sans dépendance superflue.
  2. TypeScript strict, ESLint plat, Prettier, Vitest.
  3. Validation typée des variables d'environnement (public / serveur séparés).
  4. Scan de secrets et audit de dépendances réellement exécutables.
- **Versions installées (résolues par npm, non devinées) :**

| Paquet | Version |
|---|---|
| `next` | 16.4.6 |
| `react` / `react-dom` | 19.3.1 |
| `@supabase/supabase-js` | 2.119.2 |
| `zod` | 4.6.7 |
| `typescript` | 6.0.3 |
| `eslint` | 10.15.0 |
| `eslint-config-next` | 16.4.6 |
| `typescript-eslint` | 8.74.0 |
| `vitest` | 5.1.1 |
| `tailwindcss` / `@tailwindcss/postcss` | 4.3.5 |
| `prettier` | 3.10.1 |
| `cross-env` | 10.1.0 |

- **Livrables :**
  - `package.json` (scripts `dev`, `build:web`, `build:mobile`, `lint`, `typecheck`, `test`, `format:check`, `secrets`, `audit`)
  - `tsconfig.json` (strict + `noUncheckedIndexedAccess` + `noUnusedLocals` + alias `@/*`)
  - `eslint.config.mjs` (config plate Next 16 + typescript-eslint, `any` interdit)
  - `.prettierrc.json`, `.prettierignore`, `.editorconfig`
  - `vitest.config.mts` (alias `@`, couverture v8)
  - `postcss.config.mjs` (Tailwind 4)
  - `.gitleaks.toml`, `.gitattributes`
  - `src/lib/env.ts` — validation des variables **publiques**, sans fuite de valeur dans les erreurs
  - `src/lib/env.server.ts` — secrets serveur, lève une erreur si importé côté navigateur
  - `tests/env.test.ts` — 11 tests
- **Preuves (exécutées le 2026-11-24) :**

| Commande | Résultat |
|---|---|
| `npm run lint` | **0 erreur, 0 avertissement** |
| `npm run typecheck` | **0 erreur** |
| `npm run test` | **11/11 tests passés** (1 fichier, 704 ms) |
| `npm run format:check` | **tous les fichiers conformes** |
| `npm run audit` | **0 vulnérabilité** |
| `npm run secrets` | **0 fuite**, 2 commits scannés, 302 Ko |

- **Écarts corrigés en cours de route :**
  1. TypeScript 6 refuse `baseUrl` (déprécié) → suppression, `paths` relatifs au `tsconfig.json`.
  2. Vitest chargeait `vitest.config.ts` en CommonJS → renommé `vitest.config.mts`.
  3. ESLint signalait `no-html-link-for-pages` sans dossier `pages` → règle désactivée (App Router uniquement) et export nommé pour supprimer l'avertissement.
  4. Un test « ne divulgue pas la valeur » passait pour une mauvaise raison (valeur assez longue pour être valide) → valeur raccourcie pour déclencher réellement l'erreur.
  5. `gitleaks` déclenchait `docx2txt.exe: command not found` via le textconv Git sur le `.docx` → `.gitattributes` marque les binaires.
- **Verdict verifier (2026-11-24) :** **REFUSÉ** — deux manques bloquants : aucun hook pré-commit, aucun test Playwright ni script `test:e2e`.
- **Corrections apportées après le refus (2026-11-25) :**
  - `.githooks/pre-commit` : ESLint puis `gitleaks git --staged --no-banner --redact` ; `core.hooksPath=.githooks` posé par `scripts/install-hooks.cjs` et le script `prepare`.
  - `playwright.config.ts` + `tests/e2e/smoke.e2e.ts` : 15 tests (langues, résolution, cookie, 404, débordement 360 px, lien d'évitement, en-tête, réglette, police).
  - `.gitattributes` : `.githooks/*` et `*.sh` en LF ; `next-env.d.ts` exclu de Prettier (fichier généré).
  - `scripts/measure-render.cjs` : ignore les enfants d'une zone qui défile horizontalement (la réglette mobile), pour ne mesurer que les débordements de page.
- **Preuve du hook (2026-11-25) :** fichier temporaire `preuve-hook-secret.txt` contenant une clé AWS factice, `git add` puis `git commit` →
  ```
  [pre-commit] ESLint
  [pre-commit] gitleaks (index seulement)
  WRN leaks found: 1
  COMMIT_EXIT=1
  ```
  Le dernier commit est resté `2d0d99a` : **le secret n'est pas entré dans l'historique**. Fichier supprimé et désindexé ensuite.
- **Preuves P1.2 après corrections (2026-11-25) :**
  - `npm run test` → **95/95 tests** (8 fichiers) ; `npm run test:e2e` → **15/15** ; `npm run lint` → 0 ; `npm run typecheck` → 0 ; `npm run format:check` → conforme.
  - `npm run secrets` → **no leaks found** (5 commits, 1,02 Mo) ; `npm run audit` → **0 vulnérabilité**.
- **Dette assumée :**
  - Les deux builds, alors inexistants, sont **opérationnels depuis P1.3** (`build:web` et `build:mobile` exit 0).
  - Aucune CI GitHub Actions (O11) : le workflow viendra quand `gh` ou l'interface web sera disponible.
  - `typescript-eslint` 8.74 et `eslint` 10 ont produit des avertissements de pair-dépendance à l'installation ; le lint fonctionne (0 erreur), mais la combinaison est à surveiller à la prochaine montée de version.

---

## [P1.3] Squelette App Router, couche `platform`, deux builds

- **Statut :** `VERIFYING`
- **Skills/agents appelés :** `engineering:system-design` (substitut : ADR-001, déjà accepté) ; `frontend-design` (substitut : `DESIGN.md` §3 pour les tokens, revue `designer-critic` reportée à P1.5 car cette page n'a pas de design à juger). Date : 2026-11-24.
- **Plan :**
  1. `next.config.ts` lit `BUILD_TARGET` et bascule entre SSR (web) et export statique (mobile) — sans dupliquer le code applicatif.
  2. Toute différence de cible vit dans `src/lib/platform/` (`target.ts`, `routes.ts`).
  3. Une page minimale qui prouve le rendu, les tokens et la cible de build ; **aucun lien mort**.
  4. Les deux builds doivent produire chacun leur artefact, et on le vérifie dans le HTML produit.
- **Livrables :**
  - `next.config.ts` — `output: 'export'` + `trailingSlash` + `images.unoptimized` **uniquement** si `BUILD_TARGET=mobile`
  - `src/app/layout.tsx` — `lang="pt-AO"`, viewport, `themeColor` Papel
  - `src/app/page.tsx` — squelette (marque, promesse, cible de build)
  - `src/app/globals.css` — tokens `DESIGN.md` §3 via `@theme` Tailwind 4, focus visible, `prefers-reduced-motion`
  - `src/lib/platform/target.ts` — `buildTarget`, `capabilities` (rendu serveur, coquille native, optimisation d'image, partage natif)
  - `src/lib/platform/routes.ts` — routes localisées PT/FR/EN, slugs validés (anti-`../`)
  - `src/lib/platform/index.ts` — surface publique unique
  - `tests/routes.test.ts`, `tests/target.test.ts` — 17 tests
  - `scripts/measure-render.cjs` — outil de preuve reproductible : sert `out/`, force le viewport via le protocole DevTools, mesure `scrollWidth` et la liste des éléments débordants, capture l'écran. **Échoue (exit 1) en cas de débordement horizontal.**
- **Preuves (exécutées le 2026-11-24, état propre : `.next` et `out/` supprimés avant) :**

| Commande | Résultat |
|---|---|
| `npm run build:web` | **exit 0**, 3 pages générées, HTML prerendu contient `web` |
| `npm run build:mobile` | **exit 0**, export statique dans `out/` (`index.html`, `404.html`, `_next/`), HTML contient `mobile` |
| `npm run lint` | **0 erreur, 0 avertissement** |
| `npm run typecheck` | **0 erreur** |
| `npm run test` | **28/28 tests passés** (3 fichiers) |
| `npm run format:check` | **conforme** |
| `npm run audit` | **0 vulnérabilité** |
| `npm run secrets` | **0 fuite** (3 commits, 926 Ko) |
| Contrôle d'encodage | **0 mojibake** sur 56 fichiers |
| `node scripts/measure-render.cjs 360 720` | `scrollWidth = 360`, `overflowing = []`, `lang = "pt-AO"`, **exit 0** |

- **Écarts corrigés en cours de route :**
  1. **Isolation des builds.** Premier essai : `distDir` par cible. Mesure faite, puis découverte que **avec `output: 'export'`, Next écrit le site statique dans `distDir`** — donc `out/` disparaissait et Capacitor n'aurait plus de cible. Configuration annulée : `distDir` par défaut, `out/` respecté. Conséquence assumée et documentée dans `next.config.ts` : `.next` est partagé, **les deux builds ne doivent pas tourner en parallèle**.
  2. **Faux positif de débordement.** Un premier capture d'écran (`--window-size=360,720`) montrait le texte coupé à droite. Mesure réelle via le protocole DevTools avec un viewport forcé à 360 px : `scrollWidth = 360`, `paragraph.right = 336`, liste des éléments débordants vide. C'était l'écart entre la taille de fenêtre et le viewport, pas un bug CSS. Le script de mesure sert désormais de preuve.
  3. **`next-env.d.ts` était ignoré par Git.** Un clone neuf n'aurait pas pu passer `typecheck` avant un premier build (types CSS et JSX absents). Le fichier est désormais versionné.
  4. Next a réécrit `tsconfig.json` pendant le build (`jsx: react-jsx`, ajout de `.next/types`). Changement accepté et versionné.
  5. Liens de navigation retirés de la page de démarrage : ils pointaient vers des routes inexistantes. Un squelette ne doit pas prouver par un lien mort ; la navigation arrive avec l'i18n (P1.4).
- **Verdict verifier (2026-11-24) :** **VALIDÉ**. Les constats non bloquants qui touchaient cette étape (N12 notamment) ont été corrigés avec P1.5.
- **Dette assumée :**
  - **Archivo n'est pas embarquée** : la page rend avec la pile de repli. Les fichiers de police (licence OFL) arrivent en P1.5 avec la charte complète. `document.fonts.check('16px Archivo')` renvoie `true` même sans fichier : **ce n'est pas une preuve**, ne pas s'y fier. **Levée en P1.5** : WOFF2 auto-hébergés, preuve e2e `document.fonts.ready` + `check`. 
  - Les tokens non utilisés (`--color-terracotta`, `--color-ochre`, `--color-sand`, `--color-terra`) sont éliminés du CSS par Tailwind 4 : normal, ils reviendront avec les composants.
  - Aucune route localisée n'existe encore (`/pt`, `/fr`, `/en`) : `routePath()` est prêt et testé, mais aucune page ne l'utilise. C'est P1.4.
  - `out/` n'est pas encore consommé par Capacitor (P9), et le build web n'est pas encore déployé (O4, Vercel non connecté).
  - Les screenshots ne couvrent que 360 px et 1280 px ; les états vides/erreur n'ont pas encore de sens sans données.

---

## [P1.4] i18n typé PT-AO / FR / EN

- **Statut :** `VERIFYING`
- **Skills/agents appelés :** `engineering:system-design` (substitut : ADR-002, déjà accepté) ; `design:ux-copy` (substitut : `i18n/GLOSSAIRE.md` §2, §6, §9 — les textes PT restent à relire par un locuteur angolais, Q7). Date : 2026-11-24.
- **Plan :**
  1. Catalogues typés, `pt.ts` source de vérité du type : une clé manquante casse le typecheck.
  2. `Intl` pour les dates, heures, nombres et kwanzas, fuseau `Africa/Luanda`.
  3. Segments d'URL localisés, `<html lang>`, canonique et `hreflang`.
  4. Sélecteur de langue mémorisé par cookie, résolveur à la racine.
  5. Deux garde-fous automatiques : zéro texte en dur, zéro terme interdit.
- **Livrables :**
  - `src/lib/i18n/locale.ts` — langues, résolution (URL → cookie → navigateur → pt), `pt-AO`, `en-GB`
  - `src/lib/i18n/messages/{pt,fr,en,types}.ts` — catalogues ; `fr` et `en` annotés `satisfies Messages`
  - `src/lib/i18n/format.ts` — `formatDate`, `formatDateRange`, `formatTime`, `formatNumber`, `formatKz`
  - `src/lib/i18n/index.ts` — `t`, `tp`, `interpolate`, types `StringKey` / `PluralKey`
  - `src/lib/i18n/cookie.ts` — cookie pur (sérialisation + lecture), sans effet de bord
  - `src/lib/seo.ts` — canonique + `hreflang` (pt-AO, fr, en, x-default)
  - `src/lib/site.ts` — noms propres non traduisibles (`Cultura`, `Luanda`)
  - `src/components/site-header.tsx`, `language-switcher.tsx`
  - `src/app/(default)/layout.tsx`, `page.tsx` (résolveur), `src/app/global-not-found.tsx`
  - `src/app/(localized)/[locale]/layout.tsx`, `page.tsx`, `[locale]/[section]/page.tsx`
  - `tests/i18n.test.ts`, `format.test.ts`, `locale.test.ts`, `copy-rules.test.ts`
- **Preuves (exécutées le 2026-11-24) :**

| Commande | Résultat |
|---|---|
| `npm run build:web` | **exit 0** — 7 pages générées (`/pt`, `/fr`, `/en`, `/pt/semana`, `/fr/semaine`, `/en/week`, 404) |
| `npm run build:mobile` | **exit 0** — export statique complet dans `out/` |
| `npm run typecheck` | **0 erreur** |
| `npm run test` | **82/82 tests** (7 fichiers) |
| `npm run lint` | **0 erreur, 0 avertissement** |
| `npm run format:check` | **conforme** |
| `npm run audit` | **0 vulnérabilité** |
| `npm run secrets` | **0 fuite** (4 commits, 955 Ko) |
| Contrôle d'encodage | **0 mojibake** sur 77 fichiers |
| Crawl du site exporté | **10 pages, 48 liens internes, 0 lien mort** |
| `node scripts/measure-render.cjs` | `scrollWidth = 360`, `overflowing = []` sur `/fr` et `/fr/semaine` |

- **Preuves ciblées de l'ADR-002 (vérification §1 à §5) :**
  1. **Une clé retirée casse le typecheck.** Retrait de `'nav.week'` dans `fr.ts` → `TS2741` + `TS1360`, code de sortie 2 ; fichier restauré à l'identique, typecheck de nouveau à 0.
  2. **`t()` et `tp()`** : 3 langues testées ; `tp` rend « 1 evento / 8 eventos », « 1 événement / 8 événements », « 1 event / 8 events », et « 1,500 events » / « 1 500 eventos » pour les milliers.
  3. **Cohérence URL / cookie / `lang`** mesurée dans un vrai navigateur : `/` avec navigateur en français → `/fr/` et `lang="fr"` ; `/` avec cookie `cultura_locale=pt` → `/pt/` et `lang="pt-AO"` (le cookie l'emporte, comme prévu).
  4. **Aucun texte visible en dur** : parcours d'AST TypeScript des 9 composants (`ts.isJsxText` + attributs `aria-label`/`title`/`alt`/`placeholder`), 0 violation ; un test de contrôle vérifie que le détecteur détecte réellement. Aucun `href="/…"` écrit à la main.
  5. **Formats** : « 24 de novembro de 2026 » / « 24 novembre 2026 » / « 24 November 2026 » ; « 18h00 » / « 18 h 00 » / « 18:00 » ; « 1 500 Kz » ; passage de minuit UTC 23:30 → 25 novembre à Luanda (preuve du fuseau).
- **Écarts corrigés en cours de route :**
  1. **`/pt/hoje` n'existait pas.** Le premier modèle de routes donnait à « Aujourd'hui » un segment `hoje`, alors que la page vit à la racine de la langue. Résultat mesuré dans le HTML : canonique `…/pt/hoje/`, `x-default` identique, et **4 liens morts** par page. `home` a été supprimé et `today` pointe sur `''` : `/pt`, `/fr`, `/en`. Crawl après correction : 0 lien mort.
  2. **404 sans document.** Avec deux layouts racines, Next produisait `404.html` sans `lang` et avec le texte anglais par défaut. Corrigé par `src/app/global-not-found.tsx` + `experimental.globalNotFound` : `404.html` a maintenant `lang="pt-AO"` et affiche les trois langues.
  3. **Faux positif du détecteur de texte en dur.** Une expression régulière sur le fichier confondait un type générique suivi d'un `return (` avec du JSX. Remplacée par un parcours d'AST TypeScript.
  4. **`Intl` et l'heure angolaise.** `Intl` rend « 18:00 » dans les trois langues ; le glossaire exige « 18h00 » (PT) et « 18 h 00 » (FR). L'heure est donc composée à partir de `formatToParts` (chiffres fournis par `Intl`), jamais par concaténation de chaînes formatées à la main.
  5. **Plage de dates anglaise.** `en-GB` insère une espace fine (U+2009) autour du tiret : « 24 – 30 November 2026 ». Le test attend la sortie réelle du moteur, pas une approximation.
  6. **`react-hooks/immutability`** refusait l'écriture de `document.cookie` dans le corps du composant : l'effet de bord est sorti dans une fonction de module.
- **Verdict verifier (2026-11-24) :** **VALIDÉ**, avec constats non bloquants. N1–N3 (garde-fous), N8 (`h2` des états vides), N12 (imports `platform`), N18 (`aria-current`), N19 (cookie `Secure`) corrigés le 2026-11-25.
- **Dette assumée :**
  - **Archivo toujours non embarquée** : le rendu utilise la pile de repli. P1.5. **Levée en P1.5.**
  - **`canonical` et `hreflang` pointent sur `http://localhost:3000`** (valeur de `NEXT_PUBLIC_SITE_URL` en local). À corriger dès que le domaine existe (O5).
  - **`tp()` n'est encore appelé par aucun écran** : sans données, un compteur n'aurait rien à compter. Testé, il entrera en service en P3 avec les événements.
  - **Les formateurs de date, heure et Kz ne sont pas encore affichés** : les écrans n'ont ni date ni prix tant qu'il n'y a pas de données. Prouvés par tests, ils seront utilisés par la réglette (P1.5) et les fiches (P3).
  - **Le cookie est écrit côté navigateur**, pas par un serveur : l'export statique n'a pas de serveur. Conséquence assumée et documentée dans le résolveur.
  - **Les textes PT attendent la relecture PT-AO (Q7)** ; les choix « agente cultural », « Gosto », « Favorito » restent ouverts.
  - La 404 affiche les trois langues au lieu d'une seule : une 404 localisée suppose un segment de langue connu, ce qui n'est pas le cas d'une adresse inexistante.

---

## [P1.5] Design system : tokens, Archivo, en-tête, réglette

- **Statut :** `VERIFYING`
- **Skills/agents appelés :** `frontend-design`, `web-design-system` (indisponibles — substitut : `DESIGN.md` §3–§7) ; `designer-critic` (substitut : revue anti-« look IA » §14 + captures 360/1120 px). Date : 2026-11-25.
- **Plan :**
  1. Poser l'échelle typographique (`.type-*`), les filets et les états de focus comme tokens uniques.
  2. Embarquer Archivo (WOFF2 variables, OFL) au lieu de la pile de repli.
  3. Construire l'en-tête : logotype image, navigation desktop, item actif, sélecteur de langue.
  4. Construire la réglette horaire sur l'aplat charbon, avec `prefers-reduced-motion`.
  5. Prouver le rendu réel à 360 px et 1120 px, sans débordement.
- **Livrables :**
  - `public/fonts/archivo-latin.woff2` (94 988 o), `archivo-latin-ext.woff2` (88 964 o), `OFL.txt` (4 388 o) ; `@font-face` + préchargement dans les layouts.
  - `public/brand/logo.svg` — recadrage dérivé du fichier fourni (viewBox `232 243 878 268`, 6 tracés, 34 868 o, 0 référence crème).
  - `src/app/globals.css` — `.type-display` → `.type-micro`, `.tabular`, `.skip-link`, `.nav-link`, `.language-link`, `.ruler-*`, `prefers-reduced-motion`.
  - `src/components/site-header.tsx` — logotype 24/28 px, navigation `Hoje · Semana`, filet terracotta 3 px sous l'item actif.
  - `src/components/language-switcher.tsx` — trois liens, `aria-current`, cookie `Secure` en HTTPS.
  - `src/components/time-ruler.tsx` — axe 12h–02h, graduation par heure, libellé toutes les 2 h, points ocre 4 px, trait au-delà de 3 événements par heure, fenêtre élargie si besoin.
  - `src/app/(localized)/[locale]/page.tsx` — aplat charbon (eyebrow, `h1`, chapeau, réglette), état vide sur papier.
  - `tests/time-ruler.test.tsx` — 6 tests de géométrie réelle.
  - `tests/e2e/smoke.e2e.ts` — 3 tests design en plus (en-tête, réglette, police).
- **Preuves (exécutées le 2026-11-25, `.next` et `out/` supprimés avant) :**

| Commande | Résultat |
|---|---|
| `npm run build:web` | **exit 0** — 9 pages générées (`/`, 404, 3 langues, 3 semaines) |
| `npm run build:mobile` | **exit 0** — 10 fichiers HTML dans `out/` |
| `npm run lint` | **0 erreur, 0 avertissement** |
| `npm run typecheck` | **0 erreur** |
| `npm run test` | **95/95 tests** (8 fichiers) |
| `npm run test:e2e` | **15/15 tests** (Edge, 41 s) |
| `npm run format:check` | **conforme** |
| `npm run audit` | **0 vulnérabilité** |
| `npm run secrets` | **no leaks found** (5 commits, 1,02 Mo) |
| Crawl de `out/` | **10 pages, 54 liens internes, 0 lien mort** |
| Mesure 360 px | **8 URL**, `scrollWidth = 360`, `overflowing = []` |
| Mesure 1120 px | **8 URL**, `scrollWidth = 1120`, `overflowing = []` |
| Budget JS | **136,2 Ko gzip** moderne (limite 150), + 38,7 Ko `nomodule` ; CSS 3,6 Ko |
| Police | `document.fonts.check('16px Archivo')` = `true` après `document.fonts.ready` (e2e) |
| Encodage | **0 mojibake** sur 73 fichiers texte |

- **Écarts corrigés en cours de route :**
  1. **SVG mal formé.** Le premier recadrage laissait le `</svg>` d'origine et en ajoutait un second. Détecté par validation XML (`svg-close = 2`) : corrigé, fichier valide à 6 tracés.
  2. **Faux positif de débordement sur mobile.** La réglette défile volontairement dans un conteneur `overflow-x: auto` ; le script de mesure signalait ses enfants comme débordants. Il ignore désormais les descendants d'une zone défilante, tout en continuant à mesurer `document.scrollWidth`.
  3. **Prettier contre `next-env.d.ts`.** Next réécrit ce fichier à chaque build ; il est exclu de Prettier au lieu d'être reformaté en boucle.
  4. **Libellés français larges.** « 12 h 00 » prend plus de place que « 12h00 » ; la réglette garde `min-width: 560px` et défile sur mobile plutôt que de comprimer les heures.
  5. **Réglette visible sans événement.** L'axe est affiché (fenêtre 12h–02h) mais entièrement `aria-hidden` tant qu'il n'y a aucun point : il n'annonce rien d'utile aux lecteurs d'écran.
- **Dette assumée :**
  - **Barre de navigation mobile absente** : les sections « Atores » et « Cidades » n'existent pas encore ; afficher quatre items dont deux morts serait un faux bouton. Elle arrive avec les sections (P3/P4).
  - **Recherche et compte absents** de l'en-tête, pour la même raison.
  - **Date du jour non affichée** : elle serait figée au build dans l'export mobile → question N20 (`QUESTIONS.md` §9), à traiter avec les données.
  - **Logotype provisoire** : recadrage dérivé, couleurs d'origine non normalisées (`DESIGN.md` §15) ; le master nettoyé reste attendu.
  - **Points de la réglette non visibles en production** faute d'événements : la géométrie est prouvée par 6 tests unitaires et une planche de contrôle rendue en navigateur.
- **Verdict verifier :** en attente.

---

## Décisions validées

| Réf. | Décision | Statut | Date |
|---|---|---|---|
| ADR-001 | Deux cibles de build + couche `platform` | **Accepté** | 2026-11-23 |
| ADR-002 | i18n catalogues typés + `Intl` | **Accepté** | 2026-11-23 |
| ADR-003 | RLS, rôles, journal immuable | **Accepté** (revue `security-reviewer` à faire en P2) | 2026-11-23 |
| ADR-004 | Données, mutations, pagination, score | **Accepté** (revue `db-security` à faire en P2) | 2026-11-23 |
| DESIGN.md | Identité et composants | **Validé** (v0.2) | 2026-11-23 |

---

## Auto-contrôle P0.1 → P1.1 (2026-11-24)

> **Substitution obligatoire.** L'agent `verifier` devait rendre un verdict indépendant. Le sous-agent a échoué dès son lancement (limite d'usage du fournisseur). Conformément à `AGENTS.md` §5, la substitution est consignée ici : **cet auto-contrôle n'est pas un verdict indépendant**. Il ne vaut pas `DONE` ; les étapes restent `VERIFYING` jusqu'à relecture humaine.

### Commandes exécutées et résultats

| Contrôle | Commande | Résultat |
|---|---|---|
| Historique Git | `git log --oneline -3` | `4563332`, `9fba525` |
| Synchronisation | `git status -sb` | `## main...origin/main` |
| Secrets (motifs connus) | `git grep -n -I -E "eyJhbGciOi|sk-[A-Za-z0-9]{20,}|SUPABASE_SERVICE_ROLE_KEY=…"` | **0 résultat** |
| `.env.local` ignoré | `git check-ignore -v .env.local` | `.gitignore:25:*.local` |
| Fichiers sensibles suivis | `git ls-files` filtré | **0** (aucun `.env`, `.jks`, `.keystore`, `google-services.json`, `.pem`) |
| `.env.example` | script Node | 16 variables, 2 valeurs par défaut non sensibles, **0 secret** |
| Contrastes WCAG | script Node, formule officielle | **10/10 paires exactes**, delta max **0,005** |
| Seuils WCAG | 9 assertions | **0 échec** |
| Agents définis | comptage | **10** + README |
| Liens Markdown | script de résolution | **0 lien cassé** |
| Encodage | script Node (séquences de mojibake, U+FFFD) | **0 mojibake** |
| SVG fournis | inspection | aucun `<script>`, aucune référence externe, aucune entité XML |

### Écarts constatés et corrigés

1. `PROGRESS.md` annonçait « 17 variables, 0 valeur » : c'est **16 variables**, dont 2 ont une valeur par défaut **non sensible** (`web`, `pt`). Corrigé.
2. Les ADR ont été corrompus en cours de route par un `Set-Content` PowerShell (mojibake sur les tirets cadratins), puis restaurés depuis Git et réécrits en UTF-8 strict via Node. Vérifié : 0 mojibake.
3. `logo.svg` et `Icone.svg` ont brièvement disparu du disque ; ils sont rétablis et versionnés.

### Réserve principale

`DESIGN.md` §15 : les SVG sont des vectorisations automatiques d'un JPEG. Ils contiennent du bruit de compression et des couleurs non alignées sur les tokens. **Le logotype n'est pas utilisable tel quel en production** ; le repli typographique est prévu.

### Verdict de l'auto-contrôle

```
Étape : P0.1 → P1.1
Verdict : VALIDÉ SOUS RÉSERVE — non indépendant
Bloquants : 0
Réserves :
  - verdict indépendant à obtenir (humain ou `verifier`)
  - master logo nettoyé avant P1.5
  - Q7 (PT-AO), O4–O11, M12 toujours ouverts
```

---

## Risques ouverts

| Risque | Impact | Mitigation |
|---|---|---|
| Logo vectorisé avec bruit et couleurs non normalisées | Moyen | Recadré et détouré en P1.5 ; couleurs et bruit restants à corriger sur le master avant production (`DESIGN.md` §15) |
| Deux modes de routage web/mobile | Élevé | Couche `routes`, test e2e, spike P1.3 |
| Ambiguïté `events` vs `annonces.format='evenement'` | Élevé | Q6 tranché ; correction T2 en P2.1 |
| Doublons de likes sur événements (NULL) | Moyen | Correction T1 en P2.1 |
| Absence de locuteur PT-AO | Moyen | Q7 ; ne pas figer les textes définitifs |
| Projet Supabase unique (pas de staging) | Moyen | Ne jamais tester une migration destructive sur `cultura-dev` sans sauvegarde |
| `cultura-dev` étiqueté « production » par la CLI | Moyen | Toujours vérifier le `project-ref` avant `db push` |
| Secrets locaux en clair (`~/.cultura/`) | Moyen | Déplacer vers un gestionnaire de mots de passe |
| Quotas Supabase/Vercel | Faible | ADR-004 : agrégats, purge, budgets |

---

## Prochaine action

1. **Re-vérification indépendante** de P1.2 (corrections du refus) et de P1.5, par l'agent `verifier` — aucun `DONE` sans son verdict.
2. **P2** : schéma Supabase en **local d'abord** (Docker), migrations et tests RLS ; **rien n'est poussé sur `cultura-dev` avant validation explicite du schéma**. Revue `db-security` / `security-reviewer`.
3. Côté humain : clé SSH Windows, protection de `main`, comptes Vercel/domaine/email (O4–O8), relecteur PT-AO (Q7), master logo nettoyé, validation juridique (M12).
4. Décisions à prendre : N11 (URL web/mobile, P8), N20 (date du jour sur l'export mobile, P3).

---

*Dernière mise à jour : 2026-11-25.*
