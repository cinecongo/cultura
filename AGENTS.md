# AGENTS.md — Règles de travail du dépôt Cultura

Tout agent (humain ou IA) lit ce fichier **avant** d'agir. Il ne remplace pas les documents de référence : il dit comment travailler.

## 1. Ordre de lecture

1. `CULTURA_CAHIER_DES_CHARGES_v1.3.md` — le produit (source de vérité)
2. `CULTURA_GUIDE_IA.md` — méthode, sécurité, design, qualité
3. `CULTURA_MEDIA_GUIDE_v1.0.docx` — contenu éditorial (hors code)
4. `AGENTS.md` (ce fichier)
5. `PROGRESS.md` — état réel du projet
6. `DESIGN.md`, `DECISIONS/*.md`, `QUESTIONS.md`

**Priorité en cas de conflit :** cahier v1.3 > guide IA > ce fichier > ADR > initiative de l'agent.

## 2. État du projet

- Phase courante : **P0 — cadrage et décisions**. Gate G0 **non franchie**.
- **Aucun code applicatif, aucune migration, aucun composant** avant validation humaine de G0.
- Les seules productions autorisées en P0 : ADR, `DESIGN.md`, `.env.example`, glossaire, fichiers de pilotage, définitions d'agents.

## 3. Règles d'or (non négociables)

1. **Une étape à la fois.** Pas d'étape N+1 avant que N soit `DONE` avec preuves dans `PROGRESS.md`.
2. **Jamais seul.** Chaque étape appelle les skills/agents listés au guide §6. Skill absent → le noter dans `PROGRESS.md` et exécuter la checklist équivalente. Jamais de saut silencieux.
3. **Celui qui construit ne valide pas.** Seul l'agent `verifier` écrit `DONE`.
4. **Pas de preuve, pas de DONE.** Une preuve est une sortie réelle de commande.
5. **Aucun secret** dans le code, Git, logs, captures ou messages d'erreur.
6. **Pas d'initiative hors périmètre.** Le MVP du cahier §5 est fermé. Toute idée → `BACKLOG.md`.
7. **En cas de doute, s'arrêter et demander.** Ne jamais deviner une règle métier.
8. **Échec de vérification** : corriger puis relancer **toutes** les vérifications de l'étape. Trois échecs sur la même cause → `BLOCKED` + rapport.

## 4. Boucle obligatoire d'une étape

```
Lire l'étape + PROGRESS.md
→ appeler skills/agents requis
→ plan court dans PROGRESS.md
→ implémenter (petits commits)
→ auto-vérifier : lint, types, tests, build web, build mobile, secrets, audit
→ faire relire par l'agent de revue (code-review)
→ passer en VERIFYING
→ verdict indépendant du `verifier`
→ DONE + preuves, ou retour en implémentation
```

## 5. Skills indisponibles — procédure de repli

Les skills nommés dans le guide (`engineering:architecture`, `frontend-design`, `searchfit-seo:*`, `design:*`, etc.) ne sont pas tous installés dans cet environnement. Dans ce cas :

| Skill requis | Repli obligatoire |
|---|---|
| `engineering:architecture`, `engineering:system-design` | ADR rédigé selon le modèle `DECISIONS/_MODELE.md`, relu par `architect` |
| `frontend-design`, `web-design-system` | `DESIGN.md` complet + revue anti-IA §10.3 du guide + `designer-critic` |
| `engineering:testing-strategy`, `engineering:code-review` | Checklist de tests et de revue des agents `qa-tester` et `verifier` |
| `design:ux-copy`, `design:accessibility-review` | Glossaire PT/FR/EN + checklist WCAG 2.1 AA de `perf-a11y-auditor` |
| `searchfit-seo:*` | Checklist SEO de `perf-a11y-auditor` (sitemap, hreflang, JSON-LD, OG) |
| `engineering:debug` | Reproduction minimale, hypothèses écrites, une correction à la fois |
| `engineering:deploy-checklist` | Checklist de `verifier` + section 8 du guide IA |

Toute substitution est écrite dans `PROGRESS.md`, avec la date.

## 6. Vocabulaire imposé

- **« annonce culturelle »** — jamais « publication », « post ».
- **« acteur culturel »** — jamais « compte artiste », « artiste » comme catégorie de compte.
- **« fiche »**, **« revendiquer une fiche »**, **« page Aujourd'hui »**, **« équipe Cultura »**.
- Côté public : parler de la culture et de l'agenda, pas de « plateforme » ni d'« application ».
- Toute chaîne d'interface passe par une clé i18n, en **PT, FR et EN**. Zéro texte en dur.
- Source : `i18n/GLOSSAIRE.md`.

## 7. Sécurité — interdits absolus

- `service_role` : jamais dans le client, jamais préfixée `NEXT_PUBLIC_`, jamais dans l'APK.
- RLS activée sur **toutes** les tables ; aucune table sans politique.
- Le rôle n'est jamais dérivé d'une donnée modifiable par l'utilisateur.
- Validation serveur obligatoire (zod) ; les contraintes SQL sont la dernière barrière.
- Pas de `dangerouslySetInnerHTML` sans sanitisation (DOMPurify).
- Embeds YouTube/Spotify : liste blanche de domaines + identifiant extrait côté serveur. Jamais d'iframe depuis une URL libre.
- Uploads : MIME vérifié, taille limitée, WebP, nom généré.
- Journaux : jamais de donnée personnelle ni de jeton.
- `moderation_log` : insertion seule.

## 8. Commandes (cibles, disponibles à partir de P1)

```bash
npm run lint          # ESLint, 0 erreur
npm run typecheck     # tsc --noEmit, strict
npm run test          # Vitest
npm run test:rls      # tests RLS
npm run test:e2e      # Playwright
npm run build:web
npm run build:mobile
npm run secrets       # gitleaks
npm run audit         # npm audit --audit-level=high
```

## 9. Commits et branches

- Commits conventionnels : `feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`.
- Un commit = un changement cohérent. Pas de commit fourre-tout.
- Branche principale protégée ; CI obligatoire.
- Ne jamais committer `.env*` (sauf `.env.example`), keystore, `google-services.json`.

## 10. Où écrire quoi

| Besoin | Fichier |
|---|---|
| Avancement, preuves, verdicts | `PROGRESS.md` |
| Décision structurante | `DECISIONS/ADR-xxx-*.md` |
| Idée hors périmètre | `BACKLOG.md` |
| Question bloquante | `QUESTIONS.md` |
| Règle visuelle | `DESIGN.md` |
| Terme PT/FR/EN | `i18n/GLOSSAIRE.md` |
| Définition d'un agent | `.claude/agents/*.md` |

## 11. Interdits de périmètre (V1)

Commentaires, messagerie privée, followers, stories, notifications push, scraping, billetterie, recommandations IA, upload de vidéo. Les emails transactionnels sont autorisés.

## 12. Définition de terminé (rappel)

Tous les points du guide §4, plus : états vides/chargement/erreur gérés, i18n complète, a11y de base, aucune donnée sensible dans les logs, `PROGRESS.md` à jour, verdict `VALIDÉ` du `verifier`.
