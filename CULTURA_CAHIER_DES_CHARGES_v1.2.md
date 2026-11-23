# CAHIER DES CHARGES — CULTURA

**Version 1.2 — Document de référence produit**

*v1.2 : ajout du rôle Éditeur, du mode lancement éditorial et de la revendication de fiche (sections 4.7, 4.8, 5.1, 10, 14, 17.2).*

---

## 1. Présentation du projet

### 1.1 Identité

| Élément | Définition |
|---|---|
| **Nom** | Cultura |
| **Type** | Plateforme web responsive (navigateur) + application mobile Android (phase ultérieure) |
| **Nature** | Réseau d'information culturelle — et non réseau social généraliste |
| **Marché** | Angola |
| **Langue** | Portugais (principal), français/anglais (secondaire, phase ultérieure) |

### 1.2 Mission

Centraliser, structurer et diffuser en temps réel les informations culturelles angolaises, en permettant à chaque acteur culturel de devenir sa propre source officielle.

### 1.3 Vision

Devenir la principale porte d'entrée vers la culture angolaise et la référence nationale pour savoir ce qui se passe culturellement en Angola aujourd'hui et cette semaine.

### 1.4 Manifeste fondateur

> **« Chaque acteur culturel devient sa propre source officielle. »**

Ce principe remplace toute logique de scraping ou d'agrégation automatique des réseaux sociaux. Cultura ne vole pas le contenu : elle fournit l'infrastructure aux acteurs culturels pour publier leur information de manière structurée, fiable et vérifiée.

### 1.5 Slogans

| Usage | Slogan |
|---|---|
| Grand public (marketing, réseaux sociaux) | *Toute la culture angolaise en un seul endroit* |
| B2B (artistes, partenaires, presse) | *La plateforme officielle de la scène culturelle angolaise* |

---

## 2. Positionnement stratégique

### 2.1 Ce que Cultura n'est pas

Cultura **n'est pas** un réseau social généraliste. Elle ne cherche pas à concurrencer Facebook, Instagram, TikTok ou WhatsApp sur le terrain de la conversation sociale infinie.

### 2.2 Ce que Cultura est

Cultura est un **réseau d'information culturelle structurée**. Les acteurs culturels y publient, mais dans des formats précis et normés. L'objectif n'est pas de créer une conversation, mais d'alimenter une base d'informations culturelles fiable et consultable.

### 2.3 Références analogiques

| Plateforme | Domaine | Ce que Cultura en retient |
|---|---|---|
| Allociné | Cinéma | La base de données structurée |
| Songkick | Concerts | L'agenda personnalisé |
| Eventbrite | Événements | La publication d'événements |
| Spotify News | Sorties musicales | L'actualité artistique |

### 2.4 Distinction fondamentale : publication sociale vs annonce culturelle

| ❌ Publication sociale (interdite sur Cultura) | ✅ Annonce culturelle (autorisée sur Cultura) |
|---|---|
| « Je suis en studio aujourd'hui » | « Nouveau clip disponible — Titre : Minha Vida — Date de sortie : 15 décembre — Lien YouTube » |
| « Regardez ma nouvelle coupe » | « Concert — Artiste : Telma Lee — Date : 24 décembre — Lieu : Stade XYZ — Ville : Luanda » |
| « Qui aime cette photo ? » | « Exposition — Titre : ... — Lieu : ... — Dates : ... » |

**Décision produit :** le mot **« publication »** est remplacé partout dans l'application par **« annonce culturelle »**. Psychologiquement, l'utilisateur comprend que Cultura n'est pas Facebook, mais une plateforme d'annonces culturelles.

---

## 3. Problématique et réponse produit

### 3.1 Le problème

Aujourd'hui, en Angola :

- les événements culturels sont dispersés sur Facebook, Instagram, TikTok, YouTube, WhatsApp et les sites d'actualité ;
- chaque acteur culturel communique sur ses propres réseaux, sans standardisation ;
- le public ne sait pas où trouver l'information fiable ;
- de nombreux concerts et événements passent inaperçus ;
- les internautes consomment des données mobiles coûteuses pour chercher l'information ;
- aucune plateforme ne répond simplement à la question : *« Qu'est-ce qu'il y a à faire ce soir en Angola ? »*

### 3.2 La réponse de Cultura

Cultura centralise l'information culturelle dans un format structuré, fiable et léger.

### 3.3 La question du démarrage : pourquoi un acteur culturel publierait-il sur Cultura ?

C'est **la question critique** du projet. Un acteur culturel consacre déjà du temps à Facebook, Instagram, TikTok et WhatsApp. Pourquoi ajouter Cultura ?

La réponse doit être **visible dans le produit** dès la première minute d'utilisation. Quatre avantages concrets :

| Avantage | Bénéfice pour l'acteur culturel |
|---|---|
| **1. Agenda centralisé** | Son événement apparaît dans l'agenda national, aux côtés de tous les autres. Il bénéficie de l'effet de réseau sans effort. |
| **2. Référencement Google** | Sa page est indexée et trouvable par des personnes qui ne le connaissent pas encore. |
| **3. Page officielle** | Il dispose d'un profil vérifié, structuré, professionnel — ce qu'aucun réseau social ne lui offre. |
| **4. Découverte** | Il est visible par des utilisateurs qui ne le suivent pas déjà sur ses réseaux. |

**Règle produit :** ces quatre avantages doivent être rappelés à l'acteur culturel au moment de l'inscription et de la publication (onboarding, emails, page « pourquoi publier sur Cultura »).

---

## 4. Utilisateurs et rôles

### 4.1 Principe : « acteur culturel » plutôt que « artiste »

Le modèle ne tourne pas uniquement autour des artistes. De nombreux événements sont publiés par des promoteurs, agences, salles, festivals, municipalités et centres culturels.

**Décision produit :** le terme **« compte acteur culturel »** remplace **« compte artiste »** dans toute l'application.

### 4.2 Types d'acteurs culturels

| Type | Exemples |
|---|---|
| **Artiste** | Chanteur, musicien, acteur, danseur, écrivain |
| **Promoteur** | Producteur de spectacles, agence événementielle |
| **Salle** | Salle de concert, théâtre, cinéma, centre culturel |
| **Festival** | Organisation de festival |
| **Organisation culturelle** | Association, ONG, institution publique, municipalité |

Cette distinction élargit considérablement le marché adressable de Cultura.

### 4.3 Visiteur (non connecté)

Peut :
- consulter le flux d'annonces culturelles ;
- consulter la page « Aujourd'hui » et l'agenda culturel ;
- consulter les profils d'acteurs culturels ;
- rechercher du contenu (acteur, ville, catégorie) ;
- partager une annonce via WhatsApp.

### 4.4 Membre (connecté, non acteur)

Peut :
- aimer une annonce ;
- ajouter une annonce aux favoris ;
- suivre une ville ;
- partager une annonce (WhatsApp en priorité) ;
- *(phase ultérieure)* commenter.

### 4.5 Acteur culturel (compte vérifié)

Peut :
- créer et gérer son profil d'acteur culturel ;
- publier des **annonces culturelles** dans les formats autorisés ;
- publier des événements ;
- ajouter des vidéos YouTube / liens Spotify ;
- consulter ses statistiques (vues, clics, partages).

### 4.6 Administrateur

Peut :
- valider ou refuser les annonces et événements ;
- supprimer les contenus non conformes ;
- mettre en avant certains contenus (mise en avant sponsorisée) ;
- gérer les comptes d'acteurs culturels (vérification) ;
- consulter le tableau de bord et les statistiques ;
- créer et modifier des fiches d'acteurs culturels, des événements et des annonces culturelles (mêmes droits éditoriaux que l'éditeur, voir 4.7).

### 4.7 Éditeur (équipe Cultura)

Compte interne de l'équipe. Peut :
- créer et corriger des fiches d'acteurs culturels, des événements et des annonces culturelles à partir d'informations publiques ;
- publier directement, sans file de modération (chaque action est journalisée) ;
- renseigner la source (URL) de chaque information.

Ne peut pas : vérifier un compte, modifier les rôles, supprimer un compte (réservé à l'administrateur).

### 4.8 Mode lancement éditorial

**Règle de lancement :** avant d'avoir 50 acteurs culturels actifs, l'équipe Cultura est autorisée à créer et maintenir manuellement les fiches, événements et annonces culturelles à partir d'informations publiques.

**C'est une fonctionnalité V1 obligatoire, pas une option.** Une plateforme vide paraît morte, même si elle est techniquement réussie.

Cette règle ne contredit pas le manifeste : l'objectif reste que chaque acteur devienne sa propre source officielle. Le mode éditorial est un **amorçage transitoire**, pas du scraping : la saisie est manuelle.

**Revendication de fiche :** un acteur inscrit peut revendiquer sa fiche, puis modifier ses informations et publier ses propres annonces. Les contenus déjà créés par l'équipe sont conservés.

**Garde-fous :**
- toute fiche gérée par l'équipe affiche la mention « Information publiée par l'équipe Cultura d'après une source publique » ;
- pas de badge « vérifié » tant que la fiche n'est pas revendiquée et validée ;
- la source publique est obligatoire pour chaque contenu éditorial ;
- images : uniquement fournies par l'acteur, libres de droits ou autorisées ; jamais copiées sans autorisation ;
- chaque fiche propose « Demander une correction ou un retrait », traité rapidement (objectif : 48 h) ;
- le seuil de 50 acteurs actifs est configurable ; au-delà, l'équipe réduit son rôle aux corrections et à l'amorçage de nouvelles villes.

---

## 5. Périmètre du MVP

### 5.1 Fonctionnalités incluses (v0.1 → v1.0)

| Module | Fonctionnalités |
|---|---|
| **Visiteur** | Consulter les annonces, page « Aujourd'hui », agenda, recherche, partage WhatsApp |
| **Membre** | Like, favori, suivre une ville, partage WhatsApp |
| **Acteur culturel** | Créer un compte, publier une annonce, publier un événement, ajouter une vidéo YouTube, consulter ses statistiques |
| **Admin** | Valider ou refuser un contenu, gérer les comptes d'acteurs culturels, créer et maintenir fiches/événements/annonces |
| **Éditeur** | Créer et maintenir fiches, événements et annonces à partir de sources publiques (mode lancement éditorial) |
| **Système** | Flux unique, page « Aujourd'hui », géolocalisation (ville/commune/quartier), score de popularité, compteur de vues |

### 5.2 Fonctionnalités explicitement exclues du MVP

- ❌ Commentaires
- ❌ Messagerie privée
- ❌ Système de followers / abonnements (remplacé par « suivre une ville »)
- ❌ Stories
- ❌ Notifications push
- ❌ Agrégation automatique des réseaux sociaux (scraping)
- ❌ Billetterie en ligne
- ❌ Recommandations par IA

---

## 6. Formats d'annonces culturelles autorisés

| Format | Champs obligatoires |
|---|---|
| **Actualité** | Titre, contenu, catégorie, date |
| **Événement** | Titre, date, ville, commune, quartier, lieu, heure, catégorie, organisateur, prix, contact |
| **Sortie musicale** | Titre, acteur, date de sortie, lien YouTube/Spotify |
| **Vidéo** | Titre, URL YouTube, description courte |
| **Film / Cinéma** | Titre, réalisateur, date de sortie, lieu de projection |
| **Exposition** | Titre, lieu, dates, description |
| **Annonce officielle** | Titre, contenu, date |

**Règle de modération :** toute annonce ne correspondant pas à un format autorisé est refusée par l'administrateur.

---

## 7. Modules fonctionnels

### 7.1 Page « Aujourd'hui » (killer feature, écran d'accueil par défaut)

**C'est l'écran d'accueil par défaut de Cultura.** Il répond immédiatement à la question : *« Qu'est-ce qui se passe aujourd'hui ? »*

```
┌─────────────────────────────┐
│  CULTURA                    │
│  Aujourd'hui                │
│                             │
│  8 événements actuellement  │
│                             │
│  📍 Luanda                  │
│  18h00 — Concert            │
│  20h00 — Projection         │
│  22h00 — Show               │
│                             │
│  📍 Benguela                │
│  19h00 — Exposition         │
│                             │
│  [Cette semaine →]          │
└─────────────────────────────┘
```

**Menu de navigation principal :**
- Aujourd'hui
- Cette semaine
- Acteurs culturels
- Villes

**Justification :** c'est la proposition de valeur la plus forte du produit. Elle transforme un site consulté occasionnellement en réflexe quotidien.

**Exigence :** la page « Aujourd'hui » doit être partageable via WhatsApp (lien pré-rempli).

### 7.2 Module Flux d'annonces

Flux unique, type TikTok/Facebook mais spécialisé culture. Chaque carte affiche :

- badge de catégorie (🎵 Musique, 🎤 Concert, 🎬 Cinéma, 🎭 Théâtre, 🖼️ Expo, 📚 Littérature) ;
- titre ;
- acteur culturel ;
- date / lieu (si événement) ;
- image ;
- boutons like / favori / partage WhatsApp.

### 7.3 Module Événements et géolocalisation

Affichage sous forme de calendrier et de liste.

**Filtres géographiques à trois niveaux :**

| Niveau | Exemples |
|---|---|
| **Ville** | Luanda, Benguela, Huambo, Cabinda, Lubango |
| **Commune** | Cazenga, Viana, Talatona, Cacuaco, Kilamba |
| **Quartier** | (saisie libre, normalisée par l'admin) |

**Filtres temporels :** Aujourd'hui / Cette semaine / Ce mois.

**Filtres par catégorie :** Concerts, Cinéma, Théâtre, Expositions, Danse, Littérature.

**Informations par événement :** titre, date, heure, lieu, ville, commune, quartier, organisateur, prix, contact, image.

**Justification de la géolocalisation :** la question *« Qu'est-ce qui se passe près de moi ? »* est centrale. Cette donnée deviendra précieuse pour la personnalisation et la monétisation future.

### 7.4 Module Acteurs culturels

Chaque acteur culturel possède :
- photo ;
- nom (ou nom artistique) ;
- type (artiste, promoteur, salle, festival, organisation) ;
- biographie ;
- catégorie / genre artistique ;
- ville, commune ;
- liens réseaux sociaux ;
- événements à venir ;
- dernières annonces ;
- badge « vérifié » (compte validé par admin).

### 7.5 Module Médias

Contenu intégré depuis :
- **YouTube** (iframe embed — priorité MVP) ;
- **Spotify** (embed — priorité MVP) ;
- TikTok, Instagram, Facebook (embeds possibles, phase ultérieure).

**Règle :** le contenu n'est pas hébergé sur Cultura ; il est intégré via les mécanismes officiels d'embed.

### 7.6 Module Recherche

Recherche par :
- acteur culturel ;
- ville / commune ;
- événement ;
- catégorie.

Exemples : « Concerts Luanda », « Kuduro », « Cinema », « Yola Semedo ».

### 7.7 Module Interaction

| Action | Description |
|---|---|
| 👍 J'aime | Like sur une annonce |
| ⭐ Favori | Sauvegarde dans le profil |
| 📍 Suivre une ville | Priorise les contenus de la ville choisie |
| 📤 Partage | Vers WhatsApp (prioritaire), Facebook, Telegram, Messenger |

**Note technique :** le partage WhatsApp utilise un lien `wa.me` pré-rempli (titre + URL). C'est le canal dominant en Angola.

### 7.8 Module Statistiques (pour les acteurs culturels)

Chaque acteur culturel peut consulter :
- nombre de vues de ses annonces ;
- nombre de clics ;
- nombre de partages ;
- nombre de likes et favoris.

**Justification :** les acteurs culturels veulent des preuves d'impact. C'est un argument clé de rétention et de conversion vers l'offre payante.

### 7.9 Module Administration

Tableau de bord avec :
- file de modération (annonces et événements en attente) ;
- validation / refus avec motif ;
- gestion des comptes d'acteurs culturels (vérification) ;
- statistiques : utilisateurs, contenus, événements, acteurs, vues ;
- mise en avant de contenus (sponsorisés).

---

## 8. Intelligence de classement

Chaque annonce reçoit un score de popularité.

**Formule retenue (avec décroissance temporelle) :**

```
Score = (Likes + 2 × Favoris + 3 × Partages + 0,1 × Vues) / (Âge_en_heures + 2)^1.5
```

**Justification :** cette formule favorise la fraîcheur sans ignorer la popularité, et limite la manipulation par like en boucle. Elle intègre les vues comme signal complémentaire. Elle est inspirée de la formule Hacker News, éprouvée à grande échelle.

---

## 9. Architecture technique

### 9.1 Choix technologiques

| Couche | Technologie | Justification |
|---|---|---|
| **Frontend** | Next.js (App Router) | SEO excellent, SSR/SSG, déploiement Vercel gratuit, rapide |
| **Backend / BDD** | Supabase (PostgreSQL) | Auth, Storage, API REST/Realtime, plan gratuit suffisant |
| **Hébergement** | Vercel | CDN mondial, plan gratuit (100 Go/mois) |
| **Images** | `next/image` (WebP, lazy loading) | Optimisation data mobile — crucial en Angola |
| **Mobile (phase ultérieure)** | Flutter | Une seule base de code Android + iOS |

### 9.2 Contraintes techniques

- **Site léger** : optimiser les images, limiter les dépendances JS, viser un chargement < 3 s sur 3G.
- **Responsive mobile-first** : la majorité du trafic angolais est mobile.
- **SEO** : pages événements et acteurs indexables (SSR/SSG).
- **Accessibilité** : contrastes, tailles de police, navigation simple.

### 9.3 Limites du plan gratuit à surveiller

| Service | Limite | Mitigation |
|---|---|---|
| Supabase BDD | 500 Mo | Nettoyage régulier, archivage |
| Supabase Storage | 1 Go | Compression images, stockage externe si besoin |
| Vercel bande passante | 100 Go/mois | Optimisation images, cache CDN |

---

## 10. Modèle de données

### 10.1 Tables principales

```sql
-- Utilisateurs
users (
  id UUID PRIMARY KEY,
  nom TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('membre','acteur','editeur','admin')),
  photo TEXT,
  ville_suivie TEXT,  -- ville suivie par le membre
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Acteurs culturels (remplace "artists")
acteurs_culturels (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) NULL,  -- NULL tant que la fiche n'est pas revendiquée
  statut_fiche TEXT NOT NULL DEFAULT 'geree_par_equipe' CHECK (statut_fiche IN ('geree_par_equipe','revendiquee')),
  cree_par UUID REFERENCES users(id),      -- éditeur/admin à l'origine de la fiche
  source_url TEXT,                         -- source publique (obligatoire si geree_par_equipe)
  nom TEXT NOT NULL,           -- nom artistique ou nom de l'organisation
  type TEXT NOT NULL CHECK (type IN ('artiste','promoteur','salle','festival','organisation')),
  bio TEXT,
  ville TEXT,
  commune TEXT,
  photo TEXT,
  telephone TEXT,
  email_contact TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Demandes de revendication de fiche
revendications_fiches (
  id UUID PRIMARY KEY,
  acteur_id UUID REFERENCES acteurs_culturels(id),
  user_id UUID REFERENCES users(id),
  preuve TEXT,                 -- email officiel, code publié sur un réseau officiel, etc.
  statut TEXT DEFAULT 'en_attente' CHECK (statut IN ('en_attente','approuvee','refusee')),
  traite_par UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Demandes de correction / retrait
demandes_retrait (
  id UUID PRIMARY KEY,
  content_type TEXT CHECK (content_type IN ('acteur','annonce','event')),
  content_id UUID NOT NULL,
  message TEXT,
  contact TEXT,
  statut TEXT DEFAULT 'ouverte' CHECK (statut IN ('ouverte','traitee')),
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Catégories
categories (
  id UUID PRIMARY KEY,
  nom TEXT NOT NULL
)
-- Exemples : Musique, Cinéma, Danse, Théâtre, Littérature, Exposition

-- Annonces culturelles
annonces (
  id UUID PRIMARY KEY,
  acteur_id UUID REFERENCES acteurs_culturels(id),
  titre TEXT NOT NULL,
  contenu TEXT,
  image TEXT,
  youtube_url TEXT,
  categorie_id UUID REFERENCES categories(id),
  format TEXT CHECK (format IN ('actualite','evenement','sortie_musicale','video','film','exposition','annonce_officielle')),
  slug TEXT UNIQUE,
  origine TEXT NOT NULL DEFAULT 'acteur' CHECK (origine IN ('acteur','equipe')),
  source_url TEXT,             -- obligatoire si origine = 'equipe'
  statut TEXT DEFAULT 'en_attente' CHECK (statut IN ('brouillon','en_attente','valide','rejete')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Événements
events (
  id UUID PRIMARY KEY,
  acteur_id UUID REFERENCES acteurs_culturels(id),
  titre TEXT NOT NULL,
  description TEXT,
  ville TEXT NOT NULL,
  commune TEXT,
  quartier TEXT,
  lieu TEXT,
  date_event TIMESTAMPTZ NOT NULL,
  date_fin TIMESTAMPTZ,
  prix TEXT,
  contact TEXT,
  image TEXT,
  categorie_id UUID REFERENCES categories(id),
  slug TEXT UNIQUE,
  origine TEXT NOT NULL DEFAULT 'acteur' CHECK (origine IN ('acteur','equipe')),
  source_url TEXT,             -- obligatoire si origine = 'equipe'
  statut TEXT DEFAULT 'en_attente' CHECK (statut IN ('brouillon','en_attente','valide','rejete')),
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Liaison many-to-many événements ↔ acteurs culturels
events_acteurs (
  event_id UUID REFERENCES events(id),
  acteur_id UUID REFERENCES acteurs_culturels(id),
  PRIMARY KEY (event_id, acteur_id)
)

-- Likes
likes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  annonce_id UUID REFERENCES annonces(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, annonce_id)
)

-- Favoris
favorites (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  annonce_id UUID REFERENCES annonces(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, annonce_id)
)

-- Vues (statistiques)
views (
  id UUID PRIMARY KEY,
  annonce_id UUID REFERENCES annonces(id),
  user_id UUID REFERENCES users(id) NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
)

-- Villes suivies (pour la personnalisation)
villes_suivies (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  ville TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, ville)
)

-- Journal de modération
moderation_log (
  id UUID PRIMARY KEY,
  admin_id UUID REFERENCES users(id),
  content_type TEXT CHECK (content_type IN ('annonce','event')),
  content_id UUID NOT NULL,
  action TEXT CHECK (action IN ('valide','rejete','cree_editorial','modifie_editorial')),
  raison TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

### 10.2 Index recommandés

```sql
CREATE INDEX idx_events_date ON events(date_event);
CREATE INDEX idx_events_ville ON events(ville);
CREATE INDEX idx_events_commune ON events(commune);
CREATE INDEX idx_events_statut ON events(statut);
CREATE INDEX idx_annonces_created ON annonces(created_at DESC);
CREATE INDEX idx_annonces_statut ON annonces(statut);
CREATE INDEX idx_annonces_categorie ON annonces(categorie_id);
CREATE INDEX idx_views_annonce ON views(annonce_id);
```

### 10.3 Règles de sécurité (RLS Supabase)

- Lecture publique : annonces et événements avec `statut = 'valide'`.
- Écriture : un acteur culturel ne peut créer/modifier que ses propres annonces/événements.
- Éditeur : peut créer/modifier fiches, événements et annonces d'origine `equipe` ; aucun accès aux rôles ni à la vérification.
- Admin : accès complet.
- Likes/favoris/vues : un user ne peut agir qu'avec son propre compte.

---

## 11. Modèle économique

### 11.1 Phase 1 — Gratuité totale

Objectif : créer l'audience et valider l'usage. Aucune monétisation.

### 11.2 Phase 2 — Publicité locale et mise en avant

- Annonces sponsorisées (restaurants, bars, salles, événements).
- Mise en avant d'événements (« Post sponsorisé »).
- **Tarification progressive à tester :**
  - 3 annonceurs pilotes gratuits (1 mois, contre témoignage) ;
  - puis 2 000 Kz/mois ;
  - puis 5 000 Kz/mois ;
  - puis 10 000 Kz/mois selon durée et emplacement.
- **Paiement :** manuel au début (virement, Mobile Money — Unitel Money, AFrimoney), validation admin.

### 11.3 Phase 3 — Billetterie en ligne *(phase ultérieure)*

Commission de 5 à 10 %. **À n'envisager qu'après validation de la phase 2** et disponibilité de solutions de paiement en ligne fiables en Angola.

### 11.4 Principe directeur

Ne pas investir dans la phase 3 avant d'avoir validé la phase 2. La publicité locale est le levier réaliste à court terme.

---

## 12. Expérience utilisateur et écrans

### 12.1 Écran d'accueil — « Aujourd'hui »

```
┌─────────────────────────────┐
│  CULTURA                    │
│  Aujourd'hui                │
│                             │
│  8 événements actuellement  │
│                             │
│  📍 Luanda                  │
│  18h00 — Concert            │
│  20h00 — Projection         │
│  22h00 — Show               │
│                             │
│  📍 Benguela                │
│  19h00 — Exposition         │
│                             │
│  [Cette semaine →]          │
├─────────────────────────────┤
│  FLUX D'ANNONCES            │
│  🎵 Nouvelle chanson        │
│  Yuri da Cunha              │
│  ─────────────────────      │
│  🎤 Concert                 │
│  Telma Lee                  │
│  24 décembre - Luanda       │
└─────────────────────────────┘
```

**Principe :** « Aujourd'hui » en haut, le flux en dessous.

### 12.2 Écran Événements

- Liste + calendrier.
- Filtres : Aujourd'hui / Cette semaine / Ce mois / Ville / Commune / Catégorie.
- Chaque carte : titre, date, heure, lieu, ville, commune, prix, bouton partage WhatsApp.

### 12.3 Écran Profil Acteur culturel

- Photo, nom, badge vérifié.
- Type (artiste, promoteur, salle, festival, organisation).
- Biographie.
- Ville, commune, genre artistique.
- Liens réseaux sociaux.
- Événements à venir.
- Dernières annonces.
- Vidéos YouTube intégrées.
- *(si propriétaire du compte)* Statistiques : vues, clics, partages.

### 12.4 Écran Admin

- File de modération (annonces + événements en attente).
- Boutons Valider / Refuser (avec motif).
- Gestion des comptes d'acteurs culturels.
- Statistiques : utilisateurs, contenus, événements, acteurs, vues.
- Mise en avant de contenus.

---

## 13. Contraintes et risques

| Risque | Impact | Mitigation |
|---|---|---|
| **Démarrage à froid** (personne ne publie) | Élevé | Recruter 50 acteurs culturels pilotes manuellement avant lancement |
| **Scraping juridiquement risqué** | Élevé | Ne pas le faire en V1 ; repoussé en V3+ |
| **Manque de monétisation rapide** | Moyen | Phase 2 (pub locale) dès 3-6 mois |
| **Concurrence WhatsApp** | Moyen | Se positionner comme source vérifiée, pas comme canal de partage |
| **Fracture numérique / coût data** | Moyen | Site léger, images optimisées, mode économe |
| **Modération insuffisante** | Moyen | Workflow admin strict, refus des formats non autorisés |
| **Dépendance aux plans gratuits** | Faible | Surveiller les limites, prévoir migration |

---

## 14. Feuille de route

### Version 0.1 — Fondations
- Annonces (actualités)
- Événements
- Acteurs culturels
- Admin (validation)
- Back-office éditorial (création de fiches, événements et annonces par l'équipe)
- Revendication de fiche

### Version 0.2 — Page « Aujourd'hui »
- Écran d'accueil « Aujourd'hui »
- Filtres par ville, commune, catégorie
- Partage WhatsApp
- Suivre une ville

### Version 0.3 — Interaction
- Likes
- Favoris
- Recherche
- Compteur de vues

### Version 0.4 — Comptes vérifiés et statistiques
- Vérification des acteurs culturels
- Badge vérifié
- Statistiques de base pour les acteurs

### Version 1.0 — Monétisation
- Publicité locale
- Mise en avant sponsorisée
- Tableau de bord statistiques complet

### Versions ultérieures (après validation marché)
- Agrégation automatique (avec validation admin)
- Commentaires
- Notifications
- Recommandations / IA
- Billetterie en ligne
- Application mobile Flutter

**Règle :** ne pas toucher au cahier des charges pendant les 3 premiers mois. Coder, tester, parler aux acteurs culturels, itérer.

---

## 15. Plan de lancement (MVP 3 mois)

| Période | Objectifs |
|---|---|
| **Semaine 1-2** | Fondations : Supabase, schéma BDD, maquettes 4 écrans |
| **Semaine 3-6** | Développement cœur : auth, CRUD annonces/événements, page « Aujourd'hui », filtres, partage WhatsApp |
| **Semaine 7-10** | Admin, recherche, intégration YouTube/Spotify, statistiques, responsive |
| **Semaine 11-12** | Recrutement 50 acteurs culturels pilotes, saisie manuelle de 100 événements, test groupe fermé, déploiement Vercel |

### 15.1 Stratégie d'acquisition des 50 premiers acteurs culturels

**C'est le véritable facteur de succès de Cultura.** Le plus grand risque n'est pas technique : c'est d'avoir une plateforme parfaite mais vide.

**Action immédiate (avant même le développement) :** constituer une liste de 50 acteurs culturels angolais à contacter personnellement :

- artistes (chanteurs, musiciens, acteurs, danseurs, écrivains) ;
- promoteurs de spectacles ;
- salles de concert et théâtres ;
- festivals ;
- centres culturels ;
- maisons de production ;
- municipalités et institutions publiques.

**Méthode de contact :** approche personnelle (téléphone, WhatsApp, rencontre), pas de cold email. Le succès de Cultura dépendra beaucoup plus de ces 50 premiers partenaires que du code lui-même.

**Objectif :** que chacun de ces 50 acteurs publie au moins une annonce avant le lancement public.

---

## 16. Indicateurs de succès (KPIs)

### 16.1 KPI principal

**Nombre d'événements publiés cette semaine.**

C'est la raison d'être de Cultura. Un agenda vide n'a aucune valeur, quel que soit le nombre de visiteurs.

**Objectif :** 20 événements actifs par semaine.

### 16.2 KPIs secondaires

| Horizon | Indicateur | Objectif |
|---|---|---|
| **3 mois** | Acteurs culturels inscrits et vérifiés | 50 |
| **3 mois** | Événements publiés (cumul) | 100 |
| **3 mois** | Visiteurs uniques | 1 000 |
| **3 mois** | Taux de partage WhatsApp | > 10 % |
| **6-12 mois** | Acteurs culturels actifs | 100 |
| **6-12 mois** | Événements référencés | 500 |
| **6-12 mois** | Visiteurs uniques/mois | 10 000 |
| **6-12 mois** | Annonceurs payants | 3 |
| **12-24 mois** | Référence nationale pour l'agenda culturel | — |
| **12-24 mois** | Annonceurs réguliers | 20+ |
| **12-24 mois** | Couverture des 5 principales villes | Luanda, Benguela, Huambo, Cabinda, Lubango |

---

## 17. Annexes

### 17.1 Glossaire

| Terme | Définition |
|---|---|
| **Annonce culturelle** | Contenu structuré publié par un acteur culturel (remplace « publication ») |
| **Acteur culturel** | Artiste, promoteur, salle, festival ou organisation culturelle |
| **Page « Aujourd'hui »** | Écran d'accueil affichant les événements du jour par ville |
| **Agenda culturel** | Vue agrégée des événements par ville, commune et jour |
| **Compte vérifié** | Compte acteur culturel validé par un administrateur |
| **Mise en avant** | Contenu sponsorisé affiché en priorité |

### 17.2 Décisions à graver dans le marbre

1. **Manifeste :** « Chaque acteur culturel devient sa propre source officielle. »
2. **Positionnement :** réseau d'information culturelle, pas réseau social.
3. **Vocabulaire :** « annonce culturelle » remplace « publication » ; « acteur culturel » remplace « artiste ».
4. **MVP :** Visiteur + Membre + Acteur culturel + Admin, rien d'autre.
5. **Killer feature :** page « Aujourd'hui » en écran d'accueil.
6. **Géolocalisation :** ville / commune / quartier dès la V1.
7. **Statistiques :** compteur de vues dès la V1 (table `views`).
8. **Suivre une ville :** fonctionnalité incluse dès la V1.
9. **Tech :** Next.js + Supabase + Vercel.
10. **Monétisation :** 3 pilotes gratuits → 2 000 Kz → 5 000 Kz → 10 000 Kz.
11. **Interdit en V1 :** scraping, commentaires, messagerie, followers, stories, notifications push.
12. **Acquisition :** 50 acteurs culturels à contacter personnellement avant le lancement.
13. **Mode éditorial :** avant 50 acteurs actifs, l'équipe Cultura crée et maintient les fiches, événements et annonces à partir de sources publiques ; revendication de fiche par les acteurs.

---

**Fin du cahier des charges — Version 1.2**

*Document de référence produit. Toute modification doit être justifiée par un retour terrain et validée avant intégration.*
