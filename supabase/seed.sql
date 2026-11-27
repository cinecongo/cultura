-- Cultura — seed fictif (P2.4)
-- Données fictives, en PT/FR/EN, sans donnée réelle ni personnelle.
-- Couvre : 5 villes (texte libre), 6 catégories, fiches, événements, annonces, likes.
-- Source : CULTURA_CAHIER_DES_CHARGES_v1.3 §10 (modèle de données).

-- ---------------------------------------------------------------------------
-- Catégories (toutes)
-- ---------------------------------------------------------------------------
insert into public.categories (id, nom) values
  ('10000000-0000-4000-8000-000000000001', 'Musique'),
  ('10000000-0000-4000-8000-000000000002', 'Cinéma'),
  ('10000000-0000-4000-8000-000000000003', 'Danse'),
  ('10000000-0000-4000-8000-000000000004', 'Théâtre'),
  ('10000000-0000-4000-8000-000000000005', 'Littérature'),
  ('10000000-0000-4000-8000-000000000006', 'Exposition');

-- ---------------------------------------------------------------------------
-- Acteurs culturels fictifs (3) + un membre fictif
-- ---------------------------------------------------------------------------
insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, last_sign_in_at) values
  ('30000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'fictif.aren@cultura.ao', 'x', now(), now(), now(), now()),
  ('30000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'fictif.sala@cultura.ao', 'x', now(), now(), now(), now()),
  ('30000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'fictif.fest@cultura.ao', 'x', now(), now(), now(), now()),
  ('30000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'fictif.visitante@personas.cultura', 'x', now(), now(), now(), now());

insert into public.users (id, nom, email, role, langue_preferee) values
  ('30000000-0000-4000-8000-000000000001', 'Fictício Aren', 'fictif.aren@cultura.ao', 'acteur', 'pt'),
  ('30000000-0000-4000-8000-000000000002', 'Fictícia Sala', 'fictif.sala@cultura.ao', 'acteur', 'fr'),
  ('30000000-0000-4000-8000-000000000003', 'Fictif Festival', 'fictif.fest@cultura.ao', 'acteur', 'en'),
  ('30000000-0000-4000-8000-000000000004', 'Fictiva Visitante', 'fictif.visitante@personas.cultura', 'membre', 'pt');

insert into public.acteurs_culturels (id, user_id, statut_fiche, cree_par, source_url, nom, type, bio, ville, commune, photo, telephone, email_contact, genre, liens, verified, verified_at, verified_by) values
  ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'geree_par_equipe', null, null, 'Fictício Aren', 'artiste', 'Fictício. Banda de música angolana fictícia.', 'Luanda', 'Luanda Sul', null, null, null, 'ficticio', null, false, null, null),
  ('40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', 'geree_par_equipe', null, null, 'Fictícia Sala', 'salle', 'Fictícia. Espaço fictício de cinema.', 'Luanda', 'Luanda Norte', null, null, null, null, null, false, null, null),
  ('40000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000003', 'geree_par_equipe', null, null, 'Fictif Festival', 'festival', 'Fictif. Festival fictício de performance.', 'Huambo', 'Huambo', null, null, null, null, null, false, null, null);

-- ---------------------------------------------------------------------------
-- Événements fictifs (2)
-- ---------------------------------------------------------------------------
insert into public.events (id, acteur_id, titre, description, ville, commune, quartier, lieu, date_event, date_fin, prix, prix_kz, gratuit, contact, image, categorie_id, slug, origine, source_url, langue, annule, statut, created_at)
values
  ('50000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'Concert Fictício', 'Concert fictício de rock angolano.', 'Luanda', 'Luanda Sul', null, 'Ficta Hall', '2026-12-12T20:00:00Z', null, null, 0, true, null, null, '10000000-0000-4000-8000-000000000001', 'concert-ficticio-2026-12-12', 'acteur', null, 'pt', false, 'valide', now()),
  ('50000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000003', 'Fictif Fest', 'Festival fictício.', 'Huambo', 'Huambo', null, 'Ficta Arena', '2026-12-20T18:00:00Z', null, null, 0, true, null, null, '10000000-0000-4000-8000-000000000005', 'fictif-fest-2026-12-20', 'acteur', null, 'en', false, 'valide', now());

-- ---------------------------------------------------------------------------
-- Annonces fictives (2)
-- ---------------------------------------------------------------------------
insert into public.annonces (id, acteur_id, titre, contenu, image, youtube_url, spotify_url, langue, donnees, categorie_id, format, slug, origine, source_url, statut, published_at, created_at)
values
  ('60000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'Concert Fictício — affiche', 'Annonce fictive.', null, null, null, 'pt', null, '10000000-0000-4000-8000-000000000001', 'evenement', 'concert-ficticio-2026-12-12', 'acteur', null, 'valide', '2026-12-11T10:00:00Z', now()),
  ('60000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000002', 'Salle Fictícia — programme', 'Annonce fictive.', null, null, null, 'fr', null, '10000000-0000-4000-8000-000000000002', 'actualite', 'salle-ficticia-programme-2026-12', 'acteur', null, 'valide', '2026-12-11T12:00:00Z', now());

-- ---------------------------------------------------------------------------
-- Like fictif
-- ---------------------------------------------------------------------------
insert into public.likes (id, user_id, annonce_id, event_id, created_at)
values ('70000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000004', '60000000-0000-4000-8000-000000000001', null, now());
