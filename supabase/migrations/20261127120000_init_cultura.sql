-- Cultura — initialisation du schéma (P2.1)
-- Source : CULTURA_CAHIER_DES_CHARGES_v1.3 §10.1 (modèle amendé)
-- Dépendances : ADR-003 (RLS, P2.2) et ADR-004 (accès, P2.2)
--
-- Contrainte produit : toute règle qui doit être vraie passe en base.

create schema if not exists public;

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  nom text not null,
  email text unique not null,
  role text not null default 'membre'
    check (role in ('membre', 'acteur', 'editeur', 'admin')),
  photo text,
  langue_preferee text not null default 'pt'
    check (langue_preferee in ('pt', 'fr', 'en')),
  created_at timestamptz not null default now()
);

create table public.acteurs_culturels (
  id uuid primary key,
  user_id uuid references public.users (id) null,
  statut_fiche text not null default 'geree_par_equipe'
    check (statut_fiche in ('geree_par_equipe', 'revendiquee')),
  cree_par uuid references public.users (id),
  source_url text,
  nom text not null,
  type text not null
    check (type in ('artiste', 'promoteur', 'salle', 'festival', 'organisation')),
  bio text,
  ville text,
  commune text,
  photo text,
  telephone text,
  email_contact text,
  genre text,
  liens jsonb,
  verified boolean default false,
  verified_at timestamptz,
  verified_by uuid references public.users (id),
  created_at timestamptz not null default now()
);

create table public.revendications_fiches (
  id uuid primary key,
  acteur_id uuid references public.acteurs_culturels (id),
  user_id uuid references public.users (id),
  preuve text,
  statut text default 'en_attente'
    check (statut in ('en_attente', 'approuvee', 'refusee')),
  traite_par uuid references public.users (id),
  created_at timestamptz not null default now()
);

create table public.demandes_retrait (
  id uuid primary key,
  content_type text
    check (content_type in ('acteur', 'annonce', 'event')),
  content_id uuid not null,
  message text,
  contact text,
  statut text default 'ouverte'
    check (statut in ('ouverte', 'traitee')),
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key,
  nom text not null
);

create table public.annonces (
  id uuid primary key,
  acteur_id uuid references public.acteurs_culturels (id),
  titre text not null,
  contenu text,
  image text,
  youtube_url text,
  spotify_url text,
  langue text not null default 'pt'
    check (langue in ('pt', 'fr', 'en')),
  donnees jsonb,
  categorie_id uuid references public.categories (id),
  format text
    check (format in ('actualite', 'evenement', 'sortie_musicale', 'video', 'film', 'exposition', 'annonce_officielle')),
  slug text unique,
  origine text not null default 'acteur'
    check (origine in ('acteur', 'equipe')),
  source_url text,
  statut text not null default 'en_attente'
    check (statut in ('brouillon', 'en_attente', 'valide', 'rejete')),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key,
  acteur_id uuid references public.acteurs_culturels (id),
  titre text not null,
  description text,
  ville text not null,
  commune text,
  quartier text,
  lieu text,
  date_event timestamptz not null,
  date_fin timestamptz,
  prix text,
  prix_kz integer,
  gratuit boolean default false,
  contact text,
  image text,
  categorie_id uuid references public.categories (id),
  slug text unique,
  origine text not null default 'acteur'
    check (origine in ('acteur', 'equipe')),
  source_url text,
  langue text not null default 'pt'
    check (langue in ('pt', 'fr', 'en')),
  annule boolean default false,
  statut text not null default 'en_attente'
    check (statut in ('brouillon', 'en_attente', 'valide', 'rejete')),
  created_at timestamptz not null default now()
);

create table public.events_acteurs (
  event_id uuid not null references public.events (id),
  acteur_id uuid not null references public.acteurs_culturels (id),
  primary key (event_id, acteur_id)
);

create table public.likes (
  id uuid primary key,
  user_id uuid references public.users (id),
  annonce_id uuid references public.annonces (id) null,
  event_id uuid references public.events (id) null,
  created_at timestamptz not null default now(),
  unique (user_id, annonce_id),
  unique (user_id, event_id),
  check (num_nonnulls (annonce_id, event_id) = 1)
);

create table public.favorites (
  id uuid primary key,
  user_id uuid references public.users (id),
  annonce_id uuid references public.annonces (id) null,
  event_id uuid references public.events (id) null,
  created_at timestamptz not null default now(),
  unique (user_id, annonce_id),
  unique (user_id, event_id),
  check (num_nonnulls (annonce_id, event_id) = 1)
);

create table public.views (
  id uuid primary key,
  annonce_id uuid references public.annonces (id) null,
  event_id uuid references public.events (id) null,
  user_id uuid references public.users (id) null,
  session_id text,
  viewed_at timestamptz not null default now(),
  check (num_nonnulls (annonce_id, event_id) = 1)
);

create table public.villes_suivies (
  id uuid primary key,
  user_id uuid references public.users (id),
  ville text not null,
  created_at timestamptz not null default now(),
  unique (user_id, ville)
);

create table public.moderation_log (
  id uuid primary key,
  admin_id uuid references public.users (id),
  content_type text
    check (content_type in ('annonce', 'event', 'acteur', 'revendication')),
  content_id uuid not null,
  action text
    check (action in ('valide', 'rejete', 'cree_editorial', 'modifie_editorial')),
  raison text,
  created_at timestamptz not null default now()
);

create table public.shares (
  id uuid primary key,
  annonce_id uuid references public.annonces (id) null,
  event_id uuid references public.events (id) null,
  user_id uuid references public.users (id) null,
  canal text
    check (canal in ('whatsapp', 'facebook', 'telegram', 'messenger', 'natif', 'lien')),
  created_at timestamptz not null default now(),
  check (num_nonnulls (annonce_id, event_id) = 1)
);

create table public.clicks (
  id uuid primary key,
  annonce_id uuid references public.annonces (id) null,
  event_id uuid references public.events (id) null,
  cible text
    check (cible in ('youtube', 'spotify', 'contact', 'billet', 'site', 'reseau_social')),
  created_at timestamptz not null default now(),
  check (num_nonnulls (annonce_id, event_id) = 1)
);

create table public.signalements (
  id uuid primary key,
  annonce_id uuid references public.annonces (id) null,
  event_id uuid references public.events (id) null,
  user_id uuid references public.users (id) null,
  motif text not null,
  statut text not null default 'ouvert'
    check (statut in ('ouvert', 'traitee')),
  created_at timestamptz not null default now(),
  check (num_nonnulls (annonce_id, event_id) = 1)
);

create table public.vues_quotidiennes (
  jour date not null,
  annonce_id uuid references public.annonces (id) null,
  event_id uuid references public.events (id) null,
  total integer not null,
  check (num_nonnulls (annonce_id, event_id) = 1)
);

-- ============================================================================
-- Index recommandés (cahier §10.2) et invariants (cahier §10.1)
-- ============================================================================

create unique index if not exists idx_likes_annonce_user
  on public.likes (user_id, annonce_id) where annonce_id is not null;
create unique index if not exists idx_likes_event_user
  on public.likes (user_id, event_id) where event_id is not null;
create unique index if not exists idx_favorites_annonce_user
  on public.favorites (user_id, annonce_id) where annonce_id is not null;
create unique index if not exists idx_favorites_event_user
  on public.favorites (user_id, event_id) where event_id is not null;
create unique index if not exists idx_shares_annonce_user
  on public.shares (user_id, annonce_id) where annonce_id is not null;
create unique index if not exists idx_shares_event_user
  on public.shares (user_id, event_id) where event_id is not null;
create unique index if not exists idx_clicks_annonce_user
  on public.clicks (user_id, annonce_id) where annonce_id is not null;
create unique index if not exists idx_clicks_event_user
  on public.clicks (user_id, event_id) where event_id is not null;
create unique index if not exists idx_signalements_annonce_user
  on public.signalements (user_id, annonce_id) where annonce_id is not null;
create unique index if not exists idx_signalements_event_user
  on public.signalements (user_id, event_id) where event_id is not null;

create index if not exists idx_annonces_created on public.annonces (created_at desc);
create index if not exists idx_annonces_statut on public.annonces (statut);
create index if not exists idx_annonces_categorie on public.annonces (categorie_id);
create index if not exists idx_events_date on public.events (date_event);
create index if not exists idx_events_ville on public.events (ville);
create index if not exists idx_events_commune on public.events (commune);
create index if not exists idx_events_statut on public.events (statut);
create index if not exists idx_events_acteur on public.events (acteur_id);
create index if not exists idx_acteurs_user on public.acteurs_culturels (user_id);
create index if not exists idx_views_annonce on public.views (annonce_id);
create index if not exists idx_views_event on public.views (event_id);

alter table public.annonces
  add constraint chk_annonces_origine_source_url check (origine <> 'equipe' or source_url is not null);

alter table public.events
  add constraint chk_events_origine_source_url check (origine <> 'equipe' or source_url is not null);
