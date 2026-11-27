# ADR-007 — Suppression de compte et export des données (P3.4)

- **Statut :** Accepté
- **Date :** 2026-11-27
- **Décideurs :** propriétaire du projet (arbitrages explicites du 2026-11-27) + agent
- **Concerne :** P3.4, Gate G3
- **Documents liés :** cahier v1.3 §5.1 et §10, guide IA §7.4 et §4 (P3.4), ADR-003, ADR-005, ADR-006, `QUESTIONS.md` M2

## Contexte

Le guide IA impose en P3.4 : « Compte et données supprimés ; test vérifiant l'absence de reliquats », ainsi qu'une suppression en libre-service **et** un export des données personnelles (§7.4, exigence Play). Le cahier range la suppression de compte dans le périmètre système.

Le schéma P2 contient dix-huit tables. Une seule FK vers `auth.users` porte `ON DELETE CASCADE` (`users.id`) ; toutes les autres FK vers `users` et vers `acteurs_culturels` sont en `NO ACTION`. Une suppression directe du compte échoue donc tant que des lignes dépendantes existent. `moderation_log` est immuable (insertion seule) mais référence `admin_id`, et `storage.objects` contient des chemins d'images sans policy d'accès utilisateur.

La recommandation M2 de `QUESTIONS.md` (fiche conservée en `geree_par_equipe`) n'avait jamais été validée ; l'arbitrage du propriétaire la remplace.

## Options étudiées

| Sujet | Option | Verdict |
|---|---|---|
| Contenus de l'acteur | Anonymiser (`user_id = NULL`) et conserver la fiche, les annonces et les événements | **Rejetée** : reliquats d'identité, contraire au critère P3.4 |
| Contenus de l'acteur | Supprimer la fiche, les annonces, les événements et leurs dépendances avec le compte | **Retenue** |
| Export | Profil seul (`users`) | **Rejetée** : incomplet au regard du guide §7.4 |
| Export | Toutes les données rattachées au compte, au format JSON | **Retenue** |
| Confirmation | Phrase explicite seule | **Rejetée** : insuffisante pour une action irréversible |
| Confirmation | Mot de passe courant revérifié côté serveur **et** phrase explicite traduite | **Retenue** |
| Journal de modération | Anonymiser `moderation_log.admin_id` en `NULL` | **Rejetée** : modifierait un journal immuable et exigerait une migration destructrice |
| Journal de modération | Refuser la suppression d'un compte référencé, avec message i18n | **Retenue** |

## Décision

1. Une fonction SQL `cultura_delete_account_data(p_user_id uuid, p_email text)`, `security definer` avec `search_path = ''`, appelable **uniquement par `service_role`**, supprime de façon atomique toutes les lignes rattachées au compte : interactions par utilisateur **ou** par contenu possédé, villes suivies, signalements, revendications, liaisons événements–acteurs, annonces et événements des fiches possédées ou créées, fiches, demandes de retrait au contact du compte ou à un contenu supprimé. Un `pg_advisory_xact_lock`, des `FOR UPDATE` et un contrôle final « zéro reliquat » rendent l'opération sérialisée et réversible par exception. Le `service_role` n'étant jamais exposé au navigateur, l'identité est établie par `currentProfile()` dans le handler, jamais par un champ du corps JSON.
2. La fonction **ne supprime pas `public.users`** : c'est la cascade de `auth.admin.deleteUser()` qui le fait, afin d'éviter un `auth.users` zombie si l'appel GoTrue échoue. Le handler vérifie l'origine POST, la session relue en base, la limitation dédiée, le mot de passe courant via un client sans cookies persistants, la phrase exacte issue du catalogue i18n ; il supprime ensuite les objets `storage.objects` aux chemins capturés, les clés de limitation opacifiées, appelle la RPC, révoque les sessions (`signOut({ scope: 'global' })`) puis supprime l'utilisateur Auth.
3. Un compte dont l'identifiant figure dans `moderation_log.admin_id` est refusé **avant** toute suppression, avec un message i18n dédié. Les `content_id` du journal sont des références historiques sans donnée personnelle : ils ne bloquent pas la suppression (arbitrage du propriétaire du 2026-11-27). Aucun `update`/`delete` n'est accordé sur ce journal.
4. La policy RLS préexistante `users_delete_admin` est **conservée** (arbitrage du propriétaire du 2026-11-27) : elle fait partie de la gestion des comptes par l'équipe Cultura. Aucune politique n'est modifiée en P3.4 ; le libre-service passe exclusivement par le handler.
5. L'export `POST /api/account/export` retourne un JSON `no-store` avec le profil, les fiches, annonces, événements, interactions, villes suivies, revendications, signalements et demandes de retrait liés. Aucun secret, jeton ni mot de passe (même haché) n'y figure. Le POST avec contrôle d'origine évite toute exposition par URL ou cache CDN.
6. Les trois catalogues i18n reçoivent les nouvelles chaînes en PT-AO, FR et EN ; la phrase de confirmation possède une constante serveur distincte (`src/lib/account/delete-phrase.ts`) comparée en NFKC/casse, avec un test d'égalité contre la clé i18n pour empêcher toute dérive. Aucune phrase attendue n'est acceptée du client.
7. Aucune politique RLS existante n'est élargie : le client authentifié ne gagne aucun nouveau `select`/`delete`. Les seules opérations privilégiées passent par `service_role` côté serveur.
8. **Durcissement post-revue (2026-11-27) :** le rapprochement des `demandes_retrait` se fait par égalité normalisée du contact et par `content_type` pour les IDs polymorphes, jamais par sous-chaîne : un tiers dont l'adresse contient celle du compte ne doit être ni exporté ni supprimé. Toute URL absolue stockée dans une colonne n'est acceptée comme chemin Storage que si son origine est celle du projet Supabase ; sans origine autorisée, aucune URL absolue n'est traitée. Ces règles sont portées par la migration corrective `20261127150000_account_deletion_hardening.sql` (approuvée et appliquée après la migration initiale, aucune donnée modifiée) et par `src/lib/account/data.ts`.

## Conséquences

- Positives : suppression réellement sans reliquat relationnel, export complet et journal préservé ; le client ne peut pas supprimer un compte tiers ni contourner la confirmation.
- Négatives / coûts : la suppression d'un acteur retire aussi ses contenus publics (décision assumée) ; les comptes staff journalisés doivent contacter l'équipe Cultura.
- Dette acceptée : les clés de limitation liées à une adresse IP (connexion, callback, sonde de rôle) ne sont pas rattachées à une personne et ne sont pas purgées ; seules les clés dérivées de l'email et de l'identifiant du compte le sont. `clientIp()` accepte `x-forwarded-for` : la limitation peut être contournée par rotation de cet en-tête (réserve déjà consignée dans `BACKLOG.md` depuis P3.2 ; les scopes `accountExport`/`accountDelete` sont keyés par identifiant de profil, pas par IP). Le bac à sable mail de test reste un artefact local, jamais créé en production.

## Vérification

- `npm run test:rls` : la fonction est refusée à `anon` et `authenticated`, `pg_get_functiondef` prouve l'égalité stricte du contact, aucune politique de suppression n'est ajoutée, `moderation_log` reste insertion seule.
- `npm test` : zod rejette une phrase ou un mot de passe invalides et ignore tout champ supplémentaire.
- E2E : compte créé, données insérées (fiche, annonce, like, ville suivie, demande de retrait), export complet entre les mains du compte, suppression confirmée, puis requêtes directes en `service_role` prouvant l'absence de lignes dans chaque table et l'intégrité du seed. Une demande au contact `prefix.<email>` et à un `content_id` tiers n'est ni exportée ni supprimée. Les refus (mot de passe, phrase, origine, journal, sixième tentative) et l'ignorance des champs forgés sont couverts.
- `npm run secrets` et `npm run build:*` : aucun secret dans le diff, aucun handler de suppression dans l'export mobile.
- `playwright.config.ts` : deux workers et un retry local ; l'attente d'hydratation recharge une fois au premier compile Turbopack de `next dev` (artefact de développement, mesuré puis corrigé pendant P3.4).

## Références

- `PROGRESS.md` — section `[P3.4] Suppression de compte et export`
- `QUESTIONS.md` M2 (tranchée)
- `DECISIONS/ADR-003-securite-roles-rls.md`, `DECISIONS/ADR-005-migrations-en-ligne.md`, `DECISIONS/ADR-006-connexion-base-sans-docker.md`
