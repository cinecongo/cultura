# ADR-005 — Migrations Supabase en ligne, sans Docker

- **Statut :** Accepté
- **Date :** 2026-11-27
- **Décideurs :** propriétaire du projet (validation humaine explicite : « je ne veux pas du Docker, je veux que ce soit en ligne ») + agent
- **Concerne :** P2 (schéma, RLS, seeds), puis P10
- **Documents liés :** ADR-003, ADR-004, `docs/OUTILS-CONNEXION.md` §4, guide IA §8

## Contexte

Le plan initial de P2 prévoyait une base Supabase **locale** (`supabase start`, conteneurs Docker) pour écrire et tester les migrations avant tout envoi vers le projet distant. Deux faits rendent ce plan inapplicable :

1. Le propriétaire du projet **refuse Docker** et veut travailler exclusivement avec les services en ligne.
2. Sur cette machine, le démon Docker est inactif (`docker ps` → erreur de connexion au named pipe). Aucun conteneur n'a jamais été lancé pour ce dépôt.

Contraintes à conserver malgré l'absence de bac à sable local :

- migrations SQL versionnées, relues avant application ;
- RLS active sur toutes les tables, testée ;
- aucun secret dans Git, les journaux ou le client ;
- un seul projet distant (`cultura-dev`), plan gratuit : pas de branching, pas de PITR.

## Options étudiées

| Option | Avantages | Inconvénients | Verdict |
|---|---|---|---|
| A — Base locale Docker (`supabase start`) | Bac à sable jetable, tests destructifs sans risque, `supabase db reset` | Démon Docker requis ; refus explicite du propriétaire ; machine non configurée | **Rejetée** |
| B — Projet distant unique `cultura-dev`, garde-fous procéduraux | Aucune dépendance locale ; environnement identique à la production (même version PostgreSQL) ; CLI déjà liée | Toute migration touche directement l'environnement de dev ; pas de `db reset` ; erreur = restauration par dump | **Retenue** |
| C — Deux projets distants gratuits (`cultura-dev` + `cultura-staging`) | Isole les essais destructifs | Second projet à maintenir, quotas gratuits consommés, secrets et liaison supplémentaires ; non demandé | **Différée** (voir `BACKLOG.md`) |

## Décision

1. **Aucun conteneur local.** Aucune commande `supabase start`, `supabase db reset` ou `supabase stop` n'est utilisée dans ce dépôt.
2. **Toutes les migrations vivent dans `supabase/migrations/`**, numérotées séquentiellement, en SQL explicite. Une migration déjà appliquée n'est **jamais** modifiée : une correction est une nouvelle migration.
3. **Séquence obligatoire avant chaque application** sur `cultura-dev` :
   1. vérification du `project-ref` cible (`supabase/.temp/project-ref`) ;
   2. `supabase db push --dry-run` : la liste des instructions doit correspondre exactement à l'intention ;
   3. `supabase db dump` archivé hors du dépôt (sauvegarde restaurable) ;
   4. revue du SQL par `db-security` / `security-reviewer` ;
   5. `supabase db push` uniquement après validation humaine explicite du schéma.
4. **Tests RLS sur la base distante**, dans une transaction annulée (`begin … rollback`) ou via pgTAP (`supabase test db --db-url`), avec des comptes de test créés puis supprimés. Aucune donnée de test ne reste en base.
5. **Toute opération destructive** (`drop`, `truncate`, changement de type, suppression de colonne) exige en plus une sauvegarde vérifiée et une validation humaine écrite dans `PROGRESS.md`.
6. **Secrets** : `service_role` / clé secrète uniquement côté serveur ; jamais dans un fichier versionné, un journal, le client ou l'APK.

## Conséquences

- **Positives :** aucune dépendance à Docker ; l'environnement de dev est le vrai PostgreSQL de Supabase (mêmes extensions, mêmes politiques) ; le workflow reste versionné et relu ; rien à installer sur une autre machine.
- **Négatives / coûts :** une migration fautive atteint directement l'environnement de dev ; la restauration passe par un dump, pas par un `reset` ; les essais destructifs sont lents (dump + restauration).
- **Dette acceptée :** pas de vérification « à blanc » complète d'un schéma avant application. Compensée par le dry-run, la revue SQL, la sauvegarde et le faible enjeu de `cultura-dev` (aucune donnée réelle avant P10).

## Vérification

| Preuve | Commande | Attendu |
|---|---|---|
| Aucun conteneur | `docker ps` (jamais exécuté dans le workflow) + absence de `supabase start` dans les scripts | 0 occurrence |
| Cible correcte | `Get-Content supabase/.temp/project-ref` | `exsemqskhkgfsogdtvpz` |
| Migrations alignées | `supabase migration list` | local = distant |
| Aperçu avant application | `supabase db push --dry-run` | instructions attendues uniquement |
| RLS testée | `npm run test:rls` | 0 échec |
| Secrets | `npm run secrets` | 0 fuite |

## Références

- `DECISIONS/ADR-003-securite-roles-rls.md`
- `DECISIONS/ADR-004-acces-donnees.md`
- `docs/OUTILS-CONNEXION.md` §4 et §6
- `PROGRESS.md` — bloc « Changement de projet Supabase (2026-11-27) »
