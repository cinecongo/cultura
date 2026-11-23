# PROGRESS — Cultura

> Journal d'avancement. **Une entrée par étape.** Le statut `DONE` est posé par l'agent `verifier`, jamais par celui qui a produit.
> Statuts : `TODO` · `IN_PROGRESS` · `VERIFYING` · `BLOCKED` · `DONE`.
> Une preuve est une sortie réelle de commande, pas une affirmation.

---

## Vue d'ensemble

| Étape | Objet | Statut | Preuve / blocage |
|---|---|---|---|
| P0.1 | Lire, reformuler, lister les ambiguïtés | `IN_PROGRESS` | `QUESTIONS.md` rédigé ; réponses humaines attendues |
| P0.2 | Spike Next.js × Capacitor + ADR | `IN_PROGRESS` | `DECISIONS/ADR-001` rédigé ; spike non exécuté (G0) |
| P0.3 | Plan de design + revue anti-IA | `IN_PROGRESS` | `DESIGN.md` rédigé ; validation humaine attendue |
| P0.4 | `.env.example` + glossaire | `VERIFYING` | Fichiers créés ; revue `i18n-auditor` à faire |
| P1.1 | Dépôt et fichiers de pilotage | `IN_PROGRESS` | Dépôt Git initialisé, fichiers créés ; commit initial à faire |
| P2 → P10 | — | `TODO` | Gate G0 non franchie |

**Gate G0 : NON FRANCHIE.** Aucun code applicatif n'est autorisé avant validation de `DESIGN.md`, des ADR-001/002 et des questions Q1–Q7.

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
| `engineering:code-review`, `verifier` | Agents définis dans `.claude/agents/` ; verdict à obtenir |

La revue indépendante par l'agent `verifier` reste **à faire** pour chaque étape.

### Outils disponibles sur la machine (vérifié le 2026-11-23)

| Outil | Version | État |
|---|---|---|
| Node.js | 24.22.1 | OK |
| npm | 11.19.1 | OK |
| Git | 2.55.0 | OK (identité non configurée) |
| Supabase CLI | 3.1.0 | OK (3.3.0 disponible) |
| Java Temurin | 17.0.20.1 | OK |
| GitHub CLI (`gh`) | — | **absent** |
| gitleaks | — | **absent** |
| adb / Android Studio | — | **absent** |

Préparation détaillée : `docs/OUTILS-CONNEXION.md`.

---

## [P0.1] Cadrage, reformulation, ambiguïtés

- **Statut :** `IN_PROGRESS`
- **Skills/agents appelés :** `architect` (substitut : lecture intégrale du cahier v1.3, du guide IA et du guide média, puis rédaction). Date : 2026-11-23.
- **Plan :**
  1. Lire les trois documents de référence.
  2. Reformuler le produit, le périmètre et les rôles.
  3. Relever les ambiguïtés produit et les incohérences techniques du modèle.
  4. Poser les questions bloquantes, avec recommandation.
- **Livrables :**
  - `QUESTIONS.md` : reformulation, 7 questions de Gate G0, 11 questions d'outils, 12 règles métier, 17 corrections techniques.
- **Preuves :**
  - Fichiers lus : `CULTURA_CAHIER_DES_CHARGES_v1.3.md` (939 lignes), `CULTURA_GUIDE_IA.md` (522 lignes), `CULTURA_MEDIA_GUIDE_v1.0.docx` (extrait texte).
  - `QUESTIONS.md` créé.
- **Verdict verifier :** en attente.
- **Blocage :** réponses humaines à Q1–Q7 et arbitrages M1–M12 / T1–T17.

---

## [P0.2] Spike Next.js × Capacitor et ADR

- **Statut :** `IN_PROGRESS`
- **Skills/agents appelés :** `architect`, `engineering:architecture` (indisponible — substitut ADR). Date : 2026-11-23.
- **Plan :**
  1. Comparer les quatre options (deux builds, `server.url`, SPA séparée, Flutter).
  2. Décrire la couche `platform`, les routes, les clients Supabase, les images, l'auth.
  3. Définir les critères de preuve du spike.
- **Livrable :** `DECISIONS/ADR-001-deux-cibles-build.md`.
- **Preuves :** ADR rédigé ; aucun prototype exécuté.
- **Verdict verifier :** en attente.
- **Blocage :** nécessite Node.js, un projet Supabase de test et un SDK Android pour le spike. Non lancé avant G0.

---

## [P0.3] Plan de design et revue anti-« look IA »

- **Statut :** `IN_PROGRESS`
- **Skills/agents appelés :** `frontend-design`, `web-design-system`, `designer-critic` (indisponibles — substitut : `DESIGN.md` + checklist §10.3). Date : 2026-11-23.
- **Plan :**
  1. Extraire la palette et la typographie des fichiers de marque fournis.
  2. Définir un concept propre au sujet (« programme affiché », réglette horaire).
  3. Spécifier tokens, composants et wireframes des 4 écrans clés.
  4. Confronter le plan aux clichés listés par le guide et documenter les changements.
- **Livrable :** `DESIGN.md` v0.1.
- **Contrôles réalisés :**
  - Contrastes calculés pour 12 paires de couleurs (voir `DESIGN.md` §3.1).
  - Revue des 13 clichés du guide §10.3 : tableau §14.
  - Palette limitée à 10 tokens, une seule famille typographique.
- **Preuves :** `DESIGN.md` créé ; ratios de contraste mesurés.
- **Verdict verifier :** en attente ; validation humaine Q1 requise.
- **Points manquants :** logo vectoriel, favicons, gabarit OG (Q4).

---

## [P0.4] Variables d'environnement et glossaire

- **Statut :** `VERIFYING`
- **Skills/agents appelés :** `i18n-auditor` (substitut : relecture interne). Date : 2026-11-23.
- **Plan :**
  1. Lister les variables nécessaires, sans aucune valeur.
  2. Marquer explicitement ce qui est public et ce qui est secret.
  3. Établir le vocabulaire PT/FR/EN, les termes interdits, les formats de date et monnaie.
- **Livrables :**
  - `.env.example`
  - `i18n/GLOSSAIRE.md`
- **Preuves :**
  - `.env.example` : 17 variables nommées, 0 valeur, avertissements `service_role`.
  - Glossaire : 11 sections, termes interdits + modèles d'états vides et d'erreurs.
- **Verdict verifier :** en attente.
- **Points à valider :** « agente cultural » vs « ator cultural » (Q7).

---

## [P1.1] Dépôt et fichiers de pilotage

- **Statut :** `IN_PROGRESS`
- **Skills/agents appelés :** `engineering:documentation` (indisponible — substitut direct). Date : 2026-11-23.
- **Plan :**
  1. Initialiser le dépôt Git.
  2. Créer les fichiers de pilotage et les définitions d'agents.
  3. Poser `.gitignore` et la structure cible documentée.
- **Livrables :**
  - `README.md`, `AGENTS.md`, `CLAUDE.md`, `PROGRESS.md`, `BACKLOG.md`, `QUESTIONS.md`
  - `.gitignore`, `.env.example`
  - `DECISIONS/_MODELE.md` + ADR-001 à ADR-004
  - `.claude/agents/*.md` (10 agents)
  - `docs/OUTILS-CONNEXION.md` (préparation GitHub / Supabase / Vercel)
- **Preuves :**
  - `git init` exécuté : dépôt initialisé.
  - Fichiers créés (voir liste ci-dessus).
  - **Commit initial non créé** : l'identité Git (`user.name` / `user.email`) n'est pas configurée sur la machine. À faire par l'humain.
- **Verdict verifier :** en attente.
- **Dette :** aucun outillage installé (ESLint, TypeScript, Vitest, Playwright) — prévu en P1.2, après G0.

---

## Décisions en attente de validation

| Réf. | Décision | Validateur |
|---|---|---|
| ADR-001 | Deux cibles de build + couche `platform` | Humain (Q3) |
| ADR-002 | i18n catalogues typés | Humain (Q2) |
| ADR-003 | RLS, rôles, journal immuable | Humain + `security-reviewer` |
| ADR-004 | Données, mutations, pagination, score | Humain + `db-security` |
| DESIGN.md | Identité et composants | Humain (Q1) + `designer-critic` |

---

## Risques ouverts

| Risque | Impact | Mitigation |
|---|---|---|
| Gate G0 non franchie, tentation de coder | Élevé | Règle 1 rappelée dans `AGENTS.md` ; aucun code produit |
| Logo non vectoriel | Moyen | Q4 ; utiliser un placeholder typographique en attendant, jamais un JPG |
| Deux modes de routage web/mobile | Élevé | Couche `routes`, test e2e, spike P0.2 |
| Ambiguïté `events` vs `annonces.format='evenement'` | Élevé | Q6 + correction T2 avant P2.1 |
| Doublons de likes sur événements (NULL) | Moyen | Correction T1 avant P2.1 |
| Absence de locuteur PT-AO | Moyen | Q7 ; ne pas figer les textes |
| Quotas Supabase/Vercel | Faible | ADR-004 : agrégats, purge, budgets |

---

## Prochaine action

1. Recevoir les réponses à `QUESTIONS.md` §2 (Q1–Q7) et §3 (O1–O11).
2. Mettre à jour les ADR et `DESIGN.md` en conséquence.
3. Passer à la **connexion aux outils** : GitHub, Supabase (dev), Vercel — sans code applicatif.
4. Implémenter le spike P0.2 et consigner ses preuves.
5. Soumettre la Gate G0 au `verifier`, puis démarrer P1.2.

---

*Dernière mise à jour : 2026-11-23.*
