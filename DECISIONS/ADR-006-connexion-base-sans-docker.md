# ADR-006 — Connexion base et sauvegardes sans Docker

- **Statut :** Accepté
- **Date :** 2026-11-27
- **Décideurs :** propriétaire du projet + agent
- **Concerne :** P2, P10
- **Documents liés :** ADR-005, `docs/OUTILS-CONNEXION.md` §4

## Contexte

ADR-005 retient un travail en ligne, sans Docker. La mise en œuvre réelle sur le projet `exsemqskhkgfsogdtvpz` (mesures du 2026-11-27) révèle trois contraintes non anticipées :

1. **Connexion directe inutilisable sur cette machine.** `db.exsemqskhkgfsogdtvpz.supabase.co` ne publie qu'un enregistrement **AAAA** (IPv6). La machine n'a **aucune adresse IPv6 globale** ; `dns.lookup` renvoie `ENOTFOUND` et `supabase db push` échoue.
2. **Le pooler est joignable.** Sonde du protocole PostgreSQL sur 34 hôtes de pooler : un seul répond avec un tenant valide — `aws-1-eu-west-1.pooler.supabase.com` (port 5432). La région du projet est donc **`eu-west-1`**.
3. **`supabase db dump` exige Docker.** La commande lance `pg_dump` dans une image (`DockerRunError: … check if the daemon is running`). Elle est donc **inutilisable** dans ce dépôt. En revanche `supabase db push` et `migration list` se connectent directement, sans conteneur.

## Options étudiées

| Option | Avantages | Inconvénients | Verdict |
|---|---|---|---|
| A — Connexion directe IPv6 | Aucun pooler | Machine sans IPv6 ; DNS en échec | **Rejetée** |
| B — Pooler `aws-1-eu-west-1.pooler.supabase.com:5432` (mode session) | IPv4, compatible DDL, migrations et tests | Latence pooler ; identifiant `postgres.<ref>` | **Retenue** |
| C — Sauvegarde par `supabase db dump` | Commande unique | Dépend de Docker → refusée | **Rejetée** |
| D — Sauvegarde par `pg_dump` natif (binaires PostgreSQL 17) | Aucun conteneur, dump complet, restauration possible | Installation locale (~200 Mo) à faire une fois | **Retenue**, à installer avant P10 |
| E — Sauvegarde par le tableau de bord | Aucune installation | Fonction de sauvegarde payante sur Supabase ; non disponible sur le plan gratuit | **Repli temporaire** |

## Décision

1. **Toute connexion base passe par le pooler** `aws-1-eu-west-1.pooler.supabase.com`, port **5432** (mode session), utilisateur `postgres.exsemqskhkgfsogdtvpz`. La connexion directe IPv6 n'est jamais utilisée.
2. **`supabase db dump` est proscrit** dans ce dépôt : il exige Docker.
3. **Sauvegarde obligatoire avant toute migration destructive**, assurée par `pg_dump` **natif** (option D), installé hors du dépôt. Tant que la base ne contient aucune donnée réelle (avant P10), le schéma est reconstructible à l'identique depuis `supabase/migrations/` : la sauvegarde n'est alors pas bloquante, mais reste exigée dès la première donnée.
4. **`db push` et `migration list`** s'exécutent avec `--db-url` (ou `--remote` sur les versions suivantes de la CLI), jamais avec `--linked` tant que la liaison Management API n'est pas rétablie.
5. Le **mot de passe de la base** vit dans `.env.local` (`SUPABASE_DB_PASSWORD`) et dans `%USERPROFILE%\.cultura\` ; jamais dans le dépôt.

## Conséquences

- **Positives :** chaîne de migration fonctionnelle sans Docker ; région et hôte connus et vérifiés ; pas de dépendance à l'API Management pour appliquer des migrations.
- **Négatives / coûts :** installation de `pg_dump` à prévoir ; le pooler en mode session a des limites de connexions simultanées ; `supabase link` et `gen types --linked` restent indisponibles sans jeton correctement porté.
- **Dette acceptée :** sauvegardes différées tant qu'il n'y a pas de données (aucune perte possible).

## Vérification

| Preuve | Commande | Attendu |
|---|---|---|
| Pooler joignable | sonde PostgreSQL sur `aws-1-eu-west-1.pooler.supabase.com:5432` | `Authentication…` (tenant trouvé) |
| Autres régions | 33 autres hôtes | `tenant/user … not found` |
| Connexion authentifiée | `supabase db push --dry-run --db-url …` | connexion OK, 0 migration |
| Aucun Docker | `supabase db dump` interdit dans les scripts | 0 occurrence |
| Sauvegarde | `pg_dump --version` | ≥ 17 |

## Amendement du 2026-11-27 (exécution)

Trois faits découverts en appliquant la décision, consignés sans modifier les décisions ci-dessus :

1. **Restrictions réseau.** La liste d'autorisation du projet était **vide**, ce qui fait refuser *toute* adresse par le pooler (`EADDRNOTALLOWED`), y compris celle de la machine. Correction appliquée via l'API Management : `PATCH /v1/projects/{ref}/network-restrictions` avec `add.dbAllowedCidrs = ["154.71.185.107/32"]`. **Conséquence :** si l'IP publique change (connexion résidentielle), la base refusera la connexion ; il faut alors mettre à jour la liste. Suivi dans `QUESTIONS.md` (O13).
2. **Syntaxe CLI 3.x.** `--db-url` est **déprécié** au profit de `--remote` (projet lié) ou `--remote=<db-url>`. La forme retenue est `--remote`, avec `SUPABASE_DB_PASSWORD` dans l'environnement.
3. **`gen types` ne dépend pas de Docker.** `supabase gen types typescript --linked` fonctionne directement, contrairement à `db dump`.

## Références

- `DECISIONS/ADR-005-migrations-en-ligne.md`
- `PROGRESS.md` — bloc « Connexion base : mesures du 2026-11-27 »
