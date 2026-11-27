# QUESTIONS — Arbitrages ouverts (P0.1)

- **Date :** 2026-11-23
- **Statut :** **réponses partielles reçues le 2026-11-23** — voir §0 ci-dessous
- **Règle :** aucune réponse = aucune validation. Ne pas deviner une règle métier (guide §0.7).

---

## 0. Réponses reçues (2026-11-23)

L'humain a répondu « **tu as le go** » et fourni le dépôt GitHub ainsi que les logos vectoriels.

| Réf. | Réponse | Conséquence |
|---|---|---|
| Q1 | **Validé** (le « go » couvre `DESIGN.md`) | Composants autorisés ; voir `DESIGN.md` v0.2 |
| Q2 | **Option A** — catalogues typés maison + `Intl` | ADR-002 accepté |
| Q3 | **Validé** — deux cibles de build | ADR-001 accepté |
| Q4 | **Fourni** : `logo.svg`, `Icone.svg` (+ JPG) | Vectoriel reçu, mais vectorisation automatique bruitée : nettoyage requis avant P1.5 (§15 de `DESIGN.md`) |
| Q5 | **Oui** — 6 catégories, « Concert » = format | Seed P2.4 figé |
| Q6 | **Oui** — `events` canonique, `format='evenement'` interdit | Correction T2 applicable |
| Q7 | **Ouvert** — relecteur PT-AO non nommé | Bloque uniquement la validation finale des textes (P8.4), pas le squelette |
| T1–T17 | **Accepté en bloc** | Corrections appliquées en P2.1 + ADR de schéma |
| O1 | **`cinecongo/cultura`**, HTTPS, branche `main` poussée | `origin` configuré ; commit `9fba525` |
| O2 | **Nouveau projet `cultura-dev`** (`exsemqskhkgfsogdtvpz`, 2026-11-27) — remplace `rfjoxvlgejcvknowvztj` | Clés au format `sb_publishable_…` / `sb_secret_…` dans `.env.local` ; `supabase link` à refaire (token manquant) ; `staging`/`prod` plus tard |
| O3 | **`eu-west-1`** (aucune région africaine proposée par le plan gratuit) | Région de l'ancien projet ; **à confirmer** pour `exsemqskhkgfsogdtvpz` |
| O4–O11 | **Ouverts** | Vercel, domaine, email, Turnstile, Sentry, package Android, CI |
| O12 | **Rotation des clés Supabase** | Secret `sb_secret_…` et secret JWT legacy exposés dans un message le 2026-11-27 → rotation avant P10, puis mise à jour de `.env.local` et des secrets d'hébergement |

**Réserves maintenues :** Q7 (PT-AO), O4–O12 (Vercel, domaine, email, Android, rotation des clés), M12 (validation juridique). Elles ne bloquent pas le squelette technique mais bloquent la mise en production.

---

## 1. Reformulation du projet

Cultura est un **réseau d'information culturelle structurée** pour l'Angola, pas un réseau social. Les acteurs culturels (artistes, promoteurs, salles, festivals, organisations) publient des **annonces culturelles** dans des formats normés ; le public consulte un **agenda fiable**, d'abord sur la page **« Hoje »**, qui répond en quelques secondes à « qu'est-ce qui se passe aujourd'hui ? ».

Cinq profils : visiteur (non connecté), membre, acteur culturel (vérifié par l'admin), éditeur (équipe), administrateur. Avant 50 acteurs actifs, l'équipe peut créer et maintenir fiches, événements et annonces à partir de sources publiques : c'est le **mode lancement éditorial**, transitoire, manuel, journalisé, avec mention publique et possibilité de **revendication de fiche**.

Le MVP inclut : flux, page « Hoje », agenda filtrable (ville / commune / quartier / catégorie / gratuit), recherche, partage WhatsApp, likes, favoris, suivre une ville, compteur de vues, statistiques acteur, back-office éditorial, modération, signalements et demandes de retrait, PT/FR/EN, Android via Capacitor.

Exclus en V1 : commentaires, messagerie, followers, stories, notifications push, scraping, billetterie, recommandations IA.

**KPI principal :** nombre d'événements publiés cette semaine (objectif 20), en mesurant séparément `origine = equipe` et `origine = acteur`.

---

## 2. Bloquant pour la Gate G0

| # | Question | Recommandation | Impact si non tranché |
|---|---|---|---|
| Q1 | Validez-vous `DESIGN.md` : palette de marque, Archivo seule, concept « programme affiché », réglette horaire, wireframes des 4 écrans ? | Valider après lecture de la revue anti-IA (§14) | Aucun composant ne peut être construit |
| Q2 | i18n : catalogues typés maison (ADR-002, option A) ou `next-intl` ? | Option A, pour l'export statique et le budget JS | P1.4 et tous les écrans bloqués |
| Q3 | Architecture deux cibles de build (ADR-001) : `web` SSR + `mobile` export statique, avec couche `platform` ? | Valider ; le spike P0.2 doit le prouver avant P1 | P1.3, P3.3, P6.6, P9 bloqués |
| Q4 | Pouvez-vous fournir le **logo vectoriel** (SVG/AI/EPS) : symbole, horizontal, vertical, versions claire/sombre, favicon, icône 512 ? | Indispensable ; les JPG fournis ne sont pas exploitables en production | P1.5 (squelette) ne peut pas être finalisé |
| Q5 | Taxonomie : les catégories sont-elles **Musique, Cinéma, Théâtre, Danse, Littérature, Exposition**, et « Concert » est-il un **format** d'événement, pas une catégorie ? | Oui : 6 catégories + formats ; évite le doublon « Musique » / « Concerts » | Seed P2.4, filtres P6.3, badges P6.2 |
| Q6 | Un événement daté et géolocalisé vit-il **toujours** dans `events`, et `annonces.format = 'evenement'` est-il interdit ? | Oui. Sinon deux sources de vérité pour l'agenda | Modèle P2.1, formulaires P4.2/P4.3, page « Hoje » |
| Q7 | Qui est le locuteur angolais qui validera le PT-AO et les choix « agente cultural », « Gosto », « Favorito » ? | Nommer une personne avant P1.4 | i18n non validable, P8.4 bloqué |

---

## 3. Outils et comptes (prochaine étape)

| # | Élément | Question | Recommandation |
|---|---|---|---|
| O1 | GitHub | Organisation et nom du dépôt ? Privé ? | `cultura-ao/cultura`, privé, branche `main` protégée |
| O2 | Supabase | Un projet existe-t-il déjà ? Faut-il créer `dev`, `staging`, `prod` séparés ? | 3 projets séparés dès le départ (guide §8.6) |
| O3 | Région Supabase | Quelle région ? | La plus proche de Luanda (ex. Afrique du Sud / `af-south-1`) ; sinon Europe de l'Ouest. À vérifier selon l'offre |
| O4 | Vercel | Compte personnel ou équipe ? | Équipe, avec accès restreint |
| O5 | Domaine | `cultura.ao` est-il disponible / réservé ? | Un domaine principal + `www` redirigé |
| O6 | Emails | Fournisseur (Resend proposé) et domaine d'envoi vérifié ? | `no-reply@cultura.ao` |
| O7 | Anti-abus | Compte Cloudflare Turnstile ? | Oui, dès P3.1 |
| O8 | Observabilité | Compte Sentry (plan gratuit) ? | Oui, sans données personnelles |
| O9 | Android | Nom de package définitif ? Compte Play Console ? | `ao.cultura.app` (à confirmer — non modifiable après publication) |
| O10 | Secrets | Où sont stockés les secrets d'équipe ? | Gestionnaire de mots de passe + GitHub Secrets ; keystore hors ligne |
| O11 | CI | GitHub Actions autorisé sur le dépôt ? | Oui, obligatoire (lint, types, tests, 2 builds, secrets, audit) |

> Sans O1–O3, je ne peux pas initialiser les migrations ni générer les types. Sans O5, les URLs canoniques, OG et `hreflang` restent provisoires.

---

## 4. Règles métier à confirmer

| # | Sujet | Question | Recommandation |
|---|---|---|---|
| M1 | Seuil de lancement | Confirmez 50 acteurs, et « actif = au moins un contenu publié dans les 90 derniers jours » (A17 dit « à confirmer ») | 50 / 90 jours, configurables en base |
| M2 | Suppression de compte | Que deviennent les contenus d'un acteur qui supprime son compte ? | Fiche repasse `geree_par_equipe`, contenus conservés avec `origine` inchangée, identité de contact supprimée. À valider juridiquement |
| M3 | Propriété | Un utilisateur peut-il posséder **plusieurs fiches** (ex. un promoteur avec deux salles) ? | Une seule fiche par compte en V1 (`UNIQUE(user_id)`), plusieurs comptes sinon |
| M4 | Modération | Qui traite les signalements et retraits, avec quel délai ? | Équipe éditoriale, objectif 48 h (cahier §4.8) |
| M5 | Images | Qui fournit les visuels des 100 événements de lancement, et sous quel accord écrit ? | Acteurs/promoteurs uniquement, accord archivé ; jamais d'image IA représentant un événement réel |
| M6 | Villes / communes | Fournissez-vous la liste officielle des villes et communes, ou j'utilise la liste administrative angolaise ? | Liste officielle validée, seedée ; quartier en saisie libre normalisée |
| M7 | Formats | Les 7 formats du cahier sont-ils tous ouverts dès la V1, ou priorise-t-on actualité / événement / sortie musicale / vidéo ? | Tous, avec validation zod par format |
| M8 | Prix | `prix` texte + `prix_kz` entier + `gratuit` : confirmez l'affichage « 5 000 Kz » et le filtre gratuit | Oui |
| M9 | Emails | Langue d'envoi = `langue_preferee` de l'utilisateur ? | Oui, avec repli `pt` |
| M10 | Rôles internes | Qui sont les premiers comptes `admin` et `editeur` ? | 1 admin + 1 éditeur minimum, création manuelle |
| M11 | Recrutement | Qui pilote la liste des 50 acteurs et le pipeline de contact ? | Responsable acteurs, hors code (guide média §13) |
| M12 | Légal | Un juriste local valide-t-il CGU, confidentialité et mentions (Lei n.º 22/11) ? | Oui, avant lancement ; bloquant Play Store |

---

## 5. Incohérences techniques relevées dans le cahier

Ces points ne changent pas le produit ; ils rendent le modèle de données inexact ou ambigu. Ils nécessitent un **amendement technique** (A22+) validé avant P2.1. Recommandations prêtes à appliquer.

| # | Problème | Où | Correction proposée |
|---|---|---|---|
| T1 | `UNIQUE (user_id, annonce_id)` et `UNIQUE (user_id, event_id)` **n'empêchent pas les doublons** quand la colonne est `NULL` (PostgreSQL traite les NULL comme distincts). Un utilisateur peut aimer 10 fois le même événement. | `likes`, `favorites` | Remplacer par deux index uniques partiels : `(user_id, annonce_id) WHERE annonce_id IS NOT NULL` et `(user_id, event_id) WHERE event_id IS NOT NULL`. Idem pour `favorites`. |
| T2 | `annonces.format` contient `evenement` **et** il existe une table `events`. Deux sources de vérité pour l'agenda. | §6, §10.1 | `events` est canonique pour tout contenu daté/géolocalisé. Interdire `format='evenement'` (CHECK) ou le réserver à un lien vers un `event_id`. Décision Q6. |
| T3 | `moderation_log.action` ne couvre pas la suppression ni le traitement d'un signalement. | §10.1 | Ajouter `supprime`, `signale_traite`, `retrait_traite` ; `content_type` : ajouter `signalement`, `demande_retrait`. |
| T4 | `users.email` duplique `auth.users.email` sans mécanisme de synchronisation. | §10.1 | Soit supprimer la colonne et lire `auth.users`, soit trigger de synchronisation + interdiction d'écriture client. |
| T5 | Aucune colonne `updated_at` sur les contenus. | §10.1 | Ajouter `updated_at TIMESTAMPTZ DEFAULT NOW()` + trigger sur `annonces`, `events`, `acteurs_culturels`. Nécessaire pour le cache et l'audit. |
| T6 | `events` n'a pas `published_at`, alors que le tri et le SEO en ont besoin. | §10.1 | Ajouter `published_at TIMESTAMPTZ`, renseigné à la validation. |
| T7 | `vues_quotidiennes` n'a **aucune clé primaire** ni contrainte d'unicité. | §10.1 | `PRIMARY KEY (jour, annonce_id, event_id)` impossible avec NULL : utiliser `PRIMARY KEY (jour, content_type, content_id)` ou deux index uniques partiels. |
| T8 | `demandes_retrait` et `signalements` n'ont pas de traçabilité de traitement. | §10.1 | Ajouter `traite_par UUID REFERENCES users(id)`, `traite_at TIMESTAMPTZ`, `note_traitement TEXT`. |
| T9 | `annonces.acteur_id` et `events.acteur_id` sont nullables alors que tout contenu a un acteur (même éditorial). | §10.1 | `NOT NULL` (l'équipe crée la fiche d'abord). |
| T10 | `categories.nom` n'est ni unique ni pourvue d'un slug stable. | §10.1 | `nom TEXT UNIQUE NOT NULL`, `slug TEXT UNIQUE NOT NULL`, `ordre SMALLINT`. |
| T11 | `acteurs_culturels.user_id` n'est pas unique : plusieurs comptes pourraient revendiquer la même fiche. | §10.1 | `UNIQUE(user_id)` en V1 (décision M3), plus index unique partiel sur `revendications_fiches(acteur_id) WHERE statut='en_attente'`. |
| T12 | La déduplication des vues n'a pas d'index adapté. | §8, §10.1 | Index unique sur `(content_type, content_id, session_id, date_trunc('hour', viewed_at))` ou colonne générée `vue_heure`. |
| T13 | Aucune clé primaire n'a de valeur par défaut (`gen_random_uuid()`). | §10.1 | `DEFAULT gen_random_uuid()` sur tous les `id UUID PRIMARY KEY`. |
| T14 | `shares.canal` inclut `natif` mais le modèle ne distingue pas partage web/mobile. | §10.1 | Garder `natif` ; documenter que `natif` = feuille de partage Android. |
| T15 | Limitation de débit mentionnée mais aucun mécanisme défini. | §7.2 | Turnstile sur inscription/signalement + fonctions SQL avec fenêtre temporelle ; pas de Redis au MVP. |
| T16 | `clicks.cible` inclut `billet` alors que la billetterie est exclue. | §10.1 | Conserver la valeur pour l'avenir, mais ne pas l'exposer en V1. |
| T17 | `events_acteurs` permet des doublons avec `events.acteur_id`. | §10.1 | `acteur_id` = organisateur principal ; `events_acteurs` = co-affiche uniquement, avec `CHECK` d'exclusion de l'organisateur. |

**Si ces corrections sont acceptées**, elles seront appliquées en P2.1 et consignées dans un ADR de schéma + `PROGRESS.md`. Le cahier reste la référence produit ; ces points sont des corrections d'intégrité, pas des changements de périmètre.

---

## 6. Décisions déjà proposées (à valider)

| Réf. | Décision | Statut |
|---|---|---|
| ADR-001 | Deux cibles de build, couche `platform`, routes canoniques | Proposé |
| ADR-002 | i18n : catalogues typés maison + `Intl` | Proposé |
| ADR-003 | RLS, rôles, journal immuable, revendication atomique | Proposé |
| ADR-004 | Accès données, mutations, pagination, vues, score | Proposé |
| DESIGN.md | « Programme affiché », palette, Archivo, réglette | À valider |
| `.env.example` | Noms de variables, aucun secret | Créé |

---

## 7. Ce que je ne ferai pas sans réponse

1. Aucun `npm create next-app`, aucune dépendance, aucune migration avant Q1–Q3.
2. Aucun composant UI avant validation de `DESIGN.md` (Q1).
3. Aucune connexion à un projet Supabase réel avant O1–O3 (démonstration sur projet de test uniquement si autorisé).
4. Aucune donnée réelle, aucun nom d'artiste réel dans le seed (P2.4) : uniquement des données fictives.
5. Aucun texte PT définitif avant la relecture humaine (Q7).

---

## 8. Comment répondre

Le plus simple : répondre par numéro, en une ligne par question.

```
Q1 : validé / à modifier (préciser)
Q2 : option A / option B
Q3 : validé / à revoir
Q4 : fichier fourni : <chemin> / à produire
Q5 : oui / non (préciser la liste)
Q6 : oui / non
Q7 : <nom>
O1–O11 : ...
M1–M12 : ...
T1–T17 : accepté en bloc / discuter T<n>
```

Dès réception, je mets à jour `PROGRESS.md`, je fige les ADR acceptés, puis je passe à la **connexion aux outils** (GitHub, Supabase, Vercel) avant toute ligne de code applicatif.

---

## 9. Questions ouvertes après la vérification (2026-11-25)

| Réf. | Question | Recommandation | Impact |
|---|---|---|---|
| N11 | **URL web et mobile.** Le build web sert `/fr` et `/fr/semaine` ; l'export mobile (`trailingSlash: true`) sert `/fr/` et `/fr/semaine/`. ADR-001 promet « mêmes routes ». | Passer `trailingSlash: true` sur **les deux** cibles, ou assumer l'écart et le documenter dans ADR-001. À trancher en P8, quand les URL publiques seront gelées (O5). | Canonique, `hreflang`, partage WhatsApp |
| N20 | **Date du jour sur l'export mobile.** L'export statique fige tout ce qui est calculé au build : afficher « Segunda, 24 de novembro » dans `out/` donnerait une date fausse dès le lendemain. | Calculer la date côté client (`Africa/Luanda`) après hydratation, avec un emplacement réservé stable ; ne rien afficher dans le HTML statique. À implémenter avec les données (P3). | Exactitude de la page « Hoje » dans l'APK |

---

*Questions ouvertes au 25 novembre 2026.*
