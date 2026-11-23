# ADR-003 — Sécurité : rôles, RLS, mode éditorial et journal immuable

- **Statut :** Accepté — validé en Gate G0 le 2026-11-23
- **Date :** 2026-11-23
- **Décideurs :** architecte + security-reviewer + porteur de projet
- **Concerne :** P2, P3, P5, P7
- **Documents liés :** cahier §4, §10.3, §7 ; guide §7, §9 P2–P3 ; A3, A13–A19

## Contexte

Cinq profils coexistent : visiteur (non connecté), membre, acteur culturel, éditeur, admin. Le mode lancement éditorial permet à l'équipe de publier sans file de modération, mais chaque action doit être journalisée. Une fiche peut être créée par l'équipe puis revendiquée. Les statistiques ne doivent être lisibles que par leur propriétaire ou l'équipe.

La clé `anon` de Supabase est publique : **la RLS est la seule barrière** entre un utilisateur et les données d'un autre. Le `service_role` contourne la RLS et ne doit jamais atteindre le client.

## Décisions

### 1. Table `users` et authentification

- `public.users.id` est une clé étrangère vers `auth.users(id)` avec `ON DELETE CASCADE`.
- `email` et `email_confirmed_at` sont synchronisés depuis `auth.users` par un trigger ; ils ne sont pas modifiables par le client.
- L'inscription publique crée toujours un `membre`. Aucun champ de formulaire, aucun `raw_user_meta_data` ne peut influencer `role`.
- `role` : `CHECK (role IN ('membre','acteur','editeur','admin'))`.
- Le passage à `acteur` se fait par une action explicite (création de fiche ou revendication approuvée), jamais par une simple mise à jour client.

### 2. Protection de la colonne `role`

Trigger `BEFORE UPDATE` sur `public.users` :

- si `NEW.role <> OLD.role` et que l'appelant n'est ni `admin` ni `service_role` → `RAISE EXCEPTION` ;
- un éditeur ne peut pas changer un rôle, ne peut pas vérifier une fiche, ne peut pas supprimer un compte ;
- policies `UPDATE` sur `users` limitées au propriétaire, et uniquement sur `nom`, `photo`, `langue_preferee`.

> Le rôle n'est **jamais** lu depuis une donnée que l'utilisateur peut écrire (cookie, JWT modifiable, champ de profil).

### 3. Fonctions d'aide RLS

```sql
public.current_role()        -- rôle de auth.uid(), SECURITY DEFINER, STABLE
public.is_admin()            -- current_role() = 'admin'
public.is_staff()            -- current_role() IN ('editeur','admin')
public.owns_acteur(uuid)     -- la fiche appartient à auth.uid()
public.can_read_content(...) -- valide ou propriétaire ou staff
```

Règles d'implémentation :

- `SECURITY DEFINER`, `SET search_path = public, pg_temp`, propriétaire `postgres`.
- `STABLE` pour permettre au planificateur d'optimiser.
- `GRANT EXECUTE` à `authenticated` uniquement ; `anon` n'en a pas besoin (lecture publique par politiques dédiées).
- Ne jamais exposer ces fonctions en RPC publique.
- Dans les politiques, écrire `(select auth.uid())` et `(select public.current_role())` pour éviter la réévaluation ligne par ligne.

### 4. Matrice RLS (résumé)

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `users` | soi-même ; staff : tous | trigger auth uniquement | soi-même (nom, photo, langue) ; admin : tout | admin (via Edge Function) |
| `acteurs_culturels` | public | staff ; acteur pour lui-même | propriétaire ; staff | admin |
| `revendications_fiches` | demandeur ; staff | acteur authentifié | — (RPC d'approbation) | admin |
| `demandes_retrait` | staff | anon + authentifié (RPC limitée) | staff (statut) | admin |
| `categories` | public | admin | admin | admin |
| `annonces` | `valide` ; propriétaire ; staff | acteur propriétaire (`origine='acteur'`) ; staff (`origine='equipe'`) | propriétaire si `brouillon|rejete` ; staff | admin |
| `events` | idem annonces | idem | idem | admin |
| `events_acteurs` | public si l'événement est lisible | propriétaire de l'événement | idem | idem |
| `likes` / `favorites` | soi-même ; staff (agrégats) | soi-même | — | soi-même |
| `views` | staff ; propriétaire du contenu (agrégats) | interdit en direct → RPC `record_view` | interdit | interdit |
| `shares` | staff ; propriétaire | RPC `record_share` (anon autorisé) | interdit | interdit |
| `clicks` | staff ; propriétaire | RPC `record_click` (anon autorisé) | interdit | interdit |
| `villes_suivies` | soi-même | soi-même | — | soi-même |
| `moderation_log` | staff | staff | **interdit** | **interdit** |
| `signalements` | staff | anon + authentifié (RPC limitée) | staff | admin |
| `vues_quotidiennes` | staff ; propriétaire | job `pg_cron` uniquement | job | job |
| `app_config` | staff | admin | admin | admin |

Toute table créée sans politique est un défaut bloquant : `get_advisors` doit renvoyer 0 alerte liée à la RLS après chaque migration.

### 5. Contenu éditorial (A13–A15)

- `CHECK (origine <> 'equipe' OR (source_url IS NOT NULL AND length(trim(source_url)) > 0))` sur `annonces` et `events`.
- Un acteur ne peut pas insérer de contenu `origine='equipe'` (politique `WITH CHECK`).
- Staff : insertion directe avec `statut='valide'`, `published_at = now()`, et **obligation** d'écrire une ligne dans `moderation_log` (`cree_editorial`). Cette obligation est portée par une fonction `create_editorial_content()` `SECURITY DEFINER`, pas par la bonne volonté du client.
- L'édition d'un contenu `equipe` par un acteur est refusée tant que la fiche n'est pas revendiquée.
- Une fiche `geree_par_equipe` ne peut pas avoir `verified = true` (contrainte + trigger).

### 6. Journal de modération immuable

- Policies : `INSERT` pour le staff uniquement.
- `REVOKE UPDATE, DELETE` sur la table pour `anon` et `authenticated`.
- Trigger `BEFORE UPDATE OR DELETE` → exception.
- Champs : `admin_id`, `content_type`, `content_id`, `action`, `raison`, `created_at`. Actions : `valide`, `rejete`, `cree_editorial`, `modifie_editorial`, `supprime` (ajout proposé, voir `QUESTIONS.md`).

### 7. Revendication de fiche (A16)

- Index unique partiel : une seule demande `en_attente` par `(acteur_id, user_id)`.
- Fonction `approve_claim(claim_id, admin_note)` `SECURITY DEFINER` :
  1. vérifie `is_admin()` ;
  2. refuse si la fiche a déjà un `user_id` ;
  3. rattache `user_id`, passe `statut_fiche='revendiquee'`, `role='acteur'` si nécessaire ;
  4. **conserve** tous les contenus existants (aucune suppression, aucun changement d'`origine`) ;
  5. journalise `content_type='revendication'`, `action='valide'`.
- L'approbation est atomique (transaction).
- Test d'usurpation obligatoire : B ne peut pas modifier la fiche de A après approbation.

### 8. Vérification des acteurs

- `verified`, `verified_at`, `verified_by` : modifiables par `admin` uniquement (policy + trigger).
- L'éditeur peut créer et corriger une fiche, jamais la vérifier.

### 9. Statistiques et interactions

- Les écritures `views`, `shares`, `clicks` passent par des fonctions `SECURITY DEFINER` :
  - `record_view(content_type, content_id, session_id)` → déduplication `(session, contenu, heure)` puis insertion ;
  - `record_share(...)`, `record_click(...)` → insertion + limitation simple.
- Aucune insertion directe dans ces tables depuis le client.
- Lecture : propriétaire de la fiche, staff. Un acteur ne lit **que** ses agrégats.
- Agrégation horaire → `vues_quotidiennes` via `pg_cron` ; la table brute est purgée au-delà de 90 jours.

### 10. Signalements et demandes de retrait

- Création ouverte à tous, via fonction `SECURITY DEFINER` avec :
  - Turnstile vérifié côté serveur (Edge Function) ou, à défaut, limitation par IP + fenêtre ;
  - longueur maximale des messages ;
  - statut forcé à `ouvert` / `ouverte`.
- Lecture réservée au staff. Traitement journalisé (`traite_par`, `traite_at` — champs à ajouter, voir `QUESTIONS.md`).

### 11. Stockage

- Buckets : `acteurs` (photos), `annonces` (images), `events` (images). Lecture publique, écriture serveur uniquement.
- Chemin imposé : `{bucket}/{acteur_id}/{uuid}.webp` — `acteur_id` est le **propriétaire de la fiche**, pas l'uploadeur (l'équipe peut téléverser pour une fiche non revendiquée).
- Aucune écriture directe depuis le client. L'upload passe par une route serveur / Edge Function qui vérifie les droits (propriétaire de la fiche ou staff), valide le fichier, puis écrit avec le rôle serveur.
- Lecture publique ; politique de bucket : `SELECT` public, `INSERT/UPDATE/DELETE` réservés au rôle serveur. Aucun accès anonyme en écriture.
- MIME réel, taille (≤ 2 Mo), conversion WebP, nom généré. Aucun SVG utilisateur (risque XSS), aucun fichier exécutable.

### 12. Configuration et seuil de lancement

- Table `app_config (cle TEXT PRIMARY KEY, valeur JSONB, updated_by, updated_at)`.
- `launch_threshold` (défaut 50), `active_actor_days` (défaut 90).
- Lecture staff ; écriture admin. Jamais de seuil en dur dans le code (A17).

## Conséquences

- La RLS est testée comme du code : un test par case de la matrice, y compris les cas **qui doivent échouer**.
- Les fonctions `SECURITY DEFINER` deviennent la surface d'attaque principale : elles sont courtes, typées, sans SQL dynamique, et revues par `security-reviewer`.
- Les performances des politiques sont surveillées (index sur `user_id`, `acteur_id`, `statut`, `date_event`).

## Vérification

1. `get_advisors` (sécurité) : 0 alerte après chaque migration.
2. Matrice de tests RLS : anonyme / membre / acteur A / acteur B / éditeur / admin × lecture / création / modification / suppression.
3. Cas interdits qui doivent échouer : acteur B modifie la fiche de A ; éditeur change un rôle ; éditeur vérifie une fiche ; membre insère `origine='equipe'` ; quiconque met à jour `moderation_log`.
4. Test d'approbation de revendication : contenus conservés, double approbation refusée.
5. Test : une annonce `en_attente` n'est jamais visible en anonyme.
6. Scan des policies : aucune table sans RLS (`pg_tables.rowsecurity = false` → 0 ligne).

## Références

- Cahier §4.3–4.8, §10.3
- Guide IA §7, §9 P2–P3, A13–A19
- `QUESTIONS.md` — corrections de schéma proposées (A22+)
