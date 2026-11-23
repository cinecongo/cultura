# ADR-004 — Accès aux données, validation, pagination et score

- **Statut :** Accepté — validé en Gate G0 le 2026-11-23
- **Date :** 2026-11-23
- **Décideurs :** architecte + db-security + porteur de projet
- **Concerne :** P2, P4, P6, P7
- **Documents liés :** cahier §8, §10 ; guide §8.1, §8.7, §9 P2–P7 ; A4, A11, A12

## Contexte

Le même code sert deux cibles : le web (SSR, cookies, Server Actions) et l'application Android (export statique, aucun serveur Node embarqué). Les mutations doivent donc être sûres dans les deux cas, sans dupliquer les règles métier. Le cahier impose un score calculé côté base, des vues dédupliquées, une pagination et des statistiques par acteur.

## Décisions

### 1. Couche d'accès unique

```
src/lib/data/
├─ annonces.ts   events.ts   acteurs.ts   agenda.ts   stats.ts   admin.ts
```

- Aucun composant n'importe `@supabase/*`. Revue de code : un import Supabase hors `src/lib/{data,supabase}` est un défaut.
- Chaque fonction retourne un type explicite, jamais `any`. Les types de la base sont générés (`supabase gen types typescript`).
- Les erreurs Supabase sont traduites en `Result<T, AppError>` : `not_found`, `forbidden`, `validation`, `rate_limited`, `unavailable`. Les détails techniques restent dans les logs serveur.

### 2. Deux clients, une seule clé publique

- **Serveur (web)** : `@supabase/ssr`, session en cookies `HttpOnly`.
- **Navigateur (mobile)** : `@supabase/supabase-js`, session en stockage sécurisé.
- Les deux utilisent la clé `anon` et sont soumis à la RLS.
- `service_role` : exclusivement dans des modules `server-only` et des Edge Functions ; un test de build échoue si la chaîne apparaît dans `out/` ou `.next/static/`.

### 3. Mutations : un contrat, deux exécuteurs

Un serveur Node n'existe pas dans l'APK. La stratégie est donc :

| Cible | Exécution | Autorité |
|---|---|---|
| Web | Server Action / route serveur | zod + RLS + contraintes SQL |
| Mobile | appel direct Supabase (RPC ou table) | RLS + contraintes SQL + validation zod partagée pour l'UX |

Conséquences :

- **Toute règle qui doit être vraie passe en base** (CHECK, trigger, fonction, index unique partiel). Le zod partagé (`src/lib/validation/`) améliore les messages, il ne protège pas.
- Les flux complexes (approbation de revendication, publication éditoriale, agrégation) sont des fonctions SQL `SECURITY DEFINER` testées, appelées par les deux cibles.
- Aucun `INSERT` direct dans `moderation_log` depuis le client : il est écrit par la fonction de publication.

### 4. Lectures et pagination

- Pagination **par curseur**, jamais `offset`, jamais de chargement intégral.
- Curseur opaque (base64 de `published_at|id` ou `date_event|id`), limite par défaut 20, maximum 50.
- Index de support :
  - `annonces (statut, published_at DESC, id DESC)` ;
  - `events (statut, date_event, id)` ;
  - `events (statut, ville, date_event)` ;
  - `annonces (statut, categorie_id, published_at DESC)`.
- Les cartes de flux sont servies par une vue/RPC `feed_annonces(...)` qui renvoie déjà l'acteur, la catégorie, les compteurs et l'image — pas de N+1.
- « Aujourd'hui » : une seule requête par ville, bornée à la journée `Africa/Luanda`, triée par heure.

### 5. Vues : déduplication et agrégation (A12)

- `record_view(content_type, content_id, session_id)` :
  - refuse si `session_id` absent (généré côté client, stocké en session) ;
  - clé de déduplication : `(contenu, session_id, date_trunc('hour', now()))` ;
  - insertion `ON CONFLICT DO NOTHING` ;
  - aucune donnée personnelle (pas d'IP en clair, pas d'UA).
- Agrégation horaire par `pg_cron` vers `vues_quotidiennes (jour, contenu, total)`.
- Purge des vues brutes > 90 jours.
- Le total affiché au tableau de bord admin lit l'agrégat, pas la table brute.

### 6. Score de popularité (cahier §8)

```
Score = (Likes + 2 × Favoris + 3 × Partages + 0,1 × Vues) / (Âge_en_heures + 2)^1.5
```

- Implémentation en SQL : fonction `popularity_score(...)` `IMMUTABLE` + vue `annonces_classee`.
- Les compteurs proviennent des agrégats (`vues_quotidiennes` + compteurs temps réel pour likes/favoris/partages) sur une fenêtre de 30 jours.
- Les cas de test sont fournis en dur (cahier + exemples chiffrés) : une annonce récente peu populaire peut battre une ancienne très populaire, mais pas une récente virale.
- Pas de calcul côté client : le tri est serveur/base, reproductible.

### 7. Cache et fraîcheur (web)

| Page | Stratégie |
|---|---|
| Détail annonce / événement / acteur | ISR `revalidate = 300`, `revalidateTag('annonce:{id}')` à la validation |
| « Aujourd'hui » | Rendu dynamique ou `revalidate = 60` (heure locale) |
| Flux | `revalidate = 120` + invalidation à la publication |
| Admin | Jamais mis en cache |

- Mobile : cache mémoire + dernier « Aujourd'hui » conservé dans le stockage local, avec bandeau « hors-ligne » et date du cache.
- Les mutations invalident le tag concerné ; pas de cache « à la main » dans les composants.

### 8. Détection de doublons d'événements (A11)

- À la création, RPC `find_similar_events(titre, date, lieu)` : similarité `pg_trgm` sur le titre + même jour (± 2 h) + même ville.
- Résultat : avertissement côté formulaire. **Ce n'est pas un blocage** ; l'acteur peut confirmer.
- Le doublon confirmé est signalé dans la file admin, pas supprimé automatiquement.

### 9. Recherche (P6.5)

- `unaccent` + `pg_trgm` sur `annonces.titre`, `events.titre`, `acteurs_culturels.nom`, `villes`.
- Index GIN sur les colonnes trigram.
- Tolérance accents : « cinema » trouve « cinéma ». Test unitaire dédié.
- Pas de moteur externe au MVP.

### 10. Emails transactionnels

- Envoi depuis une route serveur / Edge Function (jamais depuis le client).
- Gabarits i18n dans la langue `langue_preferee` de l'utilisateur.
- Aucun contenu sensible dans l'email ; lien de réinitialisation à usage unique.

### 11. Observabilité

- Journaux structurés (`level`, `route`, `code`, `request_id`), sans email, sans jeton, sans contenu utilisateur.
- Sentry : erreurs uniquement, `sendDefaultPii: false`.
- Alerte sur les quotas Supabase (500 Mo) et Vercel (100 Go).

## Conséquences

- La logique critique vit en SQL, ce qui la rend identique sur les deux cibles mais exige des tests SQL sérieux.
- Les Server Actions ne sont pas un lieu de vérité unique : la base l'est.
- La pagination par curseur complique légèrement l'UI (bouton « charger plus »), mais protège les quotas et la data mobile.

## Vérification

1. Test de pagination : 25 annonces → 20 puis 5, aucun doublon, aucun trou.
2. Test de la vue `feed_annonces` : une requête, pas de N+1 (compteur de requêtes).
3. Test du score : 5 cas chiffrés du cahier, ordre attendu.
4. Test de déduplication des vues : 10 rechargements dans l'heure = 1 vue.
5. Test d'agrégation : `vues_quotidiennes` cohérent avec la table brute après le job.
6. Test de recherche : « cinema » → « cinéma ».
7. Test de build : `service_role` absent du bundle web et du dossier `out/`.
8. Test de doublon : deux événements proches déclenchent l'avertissement, la création reste possible.

## Références

- Cahier §8, §10, A4, A11, A12
- Guide IA §8.1, §8.7, §9 P2–P7
- ADR-001, ADR-003
