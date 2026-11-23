# PROGRESS — Cultura

> Journal d'avancement. **Une entrée par étape.** Le statut `DONE` est posé par l'agent `verifier`, jamais par celui qui a produit.
> Statuts : `TODO` · `IN_PROGRESS` · `VERIFYING` · `BLOCKED` · `DONE`.
> Une preuve est une sortie réelle de commande, pas une affirmation.

---

## Vue d'ensemble

| Étape | Objet | Statut | Preuve / blocage |
|---|---|---|---|
| P0.1 | Lire, reformuler, lister les ambiguïtés | `VERIFYING` | `QUESTIONS.md` rédigé + §0 réponses reçues |
| P0.2 | Spike Next.js × Capacitor + ADR | `IN_PROGRESS` | `ADR-001` accepté ; spike à exécuter en P1.3 |
| P0.3 | Plan de design + revue anti-IA | `VERIFYING` | `DESIGN.md` v0.2 validé ; logos reçus |
| P0.4 | `.env.example` + glossaire | `VERIFYING` | Fichiers créés + `.env.local` réel |
| P1.1 | Dépôt et fichiers de pilotage | `VERIFYING` | Commit `9fba525` poussé sur `origin/main` |
| P1.2 | Outillage (ESLint, TS, Vitest, scripts) | `TODO` | Démarre après verdict P1.1 |
| P2 → P10 | — | `TODO` | — |

**Gate G0 : FRANCHIE le 2026-11-23** par validation humaine (« tu as le go »), avec **réserves** :
Q7 (relecteur PT-AO non nommé), O4–O11 (Vercel, domaine, email, Turnstile, Sentry, package Android, CI), M12 (validation juridique).
Ces réserves bloquent la **mise en production**, pas le squelette technique.

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
| GitHub CLI (`gh`) | — | **absent** |
| gitleaks | — | **absent** |
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

### Identité visuelle — reçue puis perdue

| Fichier | Taille | État |
|---|---|---|
| `logo.svg` | 188 760 o | Reçu, rendu vérifié, **disparu du disque** avant le commit |
| `Icone.svg` | 145 513 o | Idem |
| `logo.jpg` | 355 646 o | Conservé |
| `Icone.jpg` | 393 415 o | Conservé |
| `brand/logo-apercu.png` | 125 733 o | Aperçu conservé (rendu Edge 1344 × 756) |
| `brand/icone-apercu.png` | 69 951 o | Aperçu conservé (rendu Edge 1024 × 1024) |

Rendu vérifié : « C » brossé + flèche terracotta/ocre + `CULTURA` + `AGENDA CULTURAL DE ANGOLA`. La vectorisation était automatique, avec bruit de JPEG et marges vides. **Les SVG sont à re-fournir** ; les aperçus servent de référence. Voir `brand/README.md` et `DESIGN.md` §15.

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
  1. Lister les variables nécessaires, sans aucune valeur.
  2. Marquer explicitement ce qui est public et ce qui est secret.
  3. Établir le vocabulaire PT/FR/EN, les termes interdits, les formats de date et monnaie.
- **Livrables :**
  - `.env.example` (17 variables nommées, 0 valeur)
  - `i18n/GLOSSAIRE.md` (11 sections)
  - `.env.local` (réel, **ignoré par Git**, vérifié via `git check-ignore`)
- **Preuves :**
  - `git check-ignore -v .env.local` → `.gitignore:25:*.local`
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

## Décisions validées

| Réf. | Décision | Statut | Date |
|---|---|---|---|
| ADR-001 | Deux cibles de build + couche `platform` | **Accepté** | 2026-11-23 |
| ADR-002 | i18n catalogues typés + `Intl` | **Accepté** | 2026-11-23 |
| ADR-003 | RLS, rôles, journal immuable | **Accepté** (revue `security-reviewer` à faire en P2) | 2026-11-23 |
| ADR-004 | Données, mutations, pagination, score | **Accepté** (revue `db-security` à faire en P2) | 2026-11-23 |
| DESIGN.md | Identité et composants | **Validé** (v0.2) | 2026-11-23 |

---

## Risques ouverts

| Risque | Impact | Mitigation |
|---|---|---|
| Logo vectorisé avec bruit et couleurs non normalisées | Moyen | Nettoyage avant P1.5 ; repli typographique en attendant |
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

1. Verdict indépendant `verifier` sur P0.1 → P1.1.
2. **P1.2** : outillage — `package.json`, TypeScript strict, ESLint, Prettier, Vitest, scripts npm, `.editorconfig`.
3. **P1.3** : squelette Next.js App Router + couche `platform` + deux builds.
4. **P1.4** : i18n typé PT/FR/EN (ADR-002) sur 3 écrans.
5. **P1.5** : tokens de design + en-tête + réglette horaire.
6. En parallèle, côté humain : clé SSH Windows, protection de `main`, comptes Vercel/domaine/email.

---

*Dernière mise à jour : 2026-11-23.*
