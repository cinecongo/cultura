-- Cultura — RLS (P2.2)
-- Source : CULTURA_CAHIER_DES_CHARGES_v1.3 §10.3
-- Dépend de : ADR-003 (RLS, rôles, journal immuable)
--
-- Principes :
--   * aucune table sans RLS (ADR-003) ;
--   * lecture publique limitée aux contenus `statut = 'valide'` ;
--   * un acteur culturel ne touche que ses propres annonces/événements ;
--   * l'éditeur/admin gère les contenus d'origine `equipe` ;
--   * le rôle `users.role` est géré via les helpers ci-dessous ;
--   * `moderation_log` : insertion réservée aux admins (aucune modif/suppr).

-- ---------------------------------------------------------------------------
-- Helpers RLS
-- ---------------------------------------------------------------------------

create or replace function public.cultura_is_admin (uid uuid default auth.uid ())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = uid and u.role = 'admin'
  );
$$;

create or replace function public.cultura_is_editor (uid uuid default auth.uid ())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = uid and u.role in ('editeur', 'admin')
  );
$$;

create or replace function public.cultura_is_acteur (uid uuid default auth.uid ())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.acteurs_culturels a
    join public.users u on u.id = a.user_id
    where u.id = uid and a.statut_fiche <> 'revendiquee'
  );
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

alter table public.users enable row level security;

create policy "users_select_own" on public.users
  for select to authenticated
  using (id = auth.uid());

create policy "users_select_admin" on public.users
  for select to authenticated
  using (public.cultura_is_admin());

create policy "users_insert_admin" on public.users
  for insert to authenticated
  with check (public.cultura_is_admin());

create policy "users_update_admin" on public.users
  for update to authenticated
  using (public.cultura_is_admin())
  with check (public.cultura_is_admin());

create policy "users_delete_admin" on public.users
  for delete to authenticated
  using (public.cultura_is_admin());

alter table public.acteurs_culturels enable row level security;

create policy "acteurs_select_team" on public.acteurs_culturels
  for select to authenticated
  using (public.cultura_is_admin() or public.cultura_is_editor());

create policy "acteurs_select_claimant" on public.acteurs_culturels
  for select to authenticated
  using (
    exists (
      select 1
      from public.users u
      where u.id = public.acteurs_culturels.user_id and u.id = auth.uid()
    )
  );

alter table public.revendications_fiches enable row level security;

create policy "revendications_select_own" on public.revendications_fiches
  for select to authenticated
  using (user_id = auth.uid());

create policy "revendications_select_admin" on public.revendications_fiches
  for select to authenticated
  using (public.cultura_is_admin());

create policy "revendications_insert_own" on public.revendications_fiches
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "revendications_update_admin" on public.revendications_fiches
  for update to authenticated
  using (public.cultura_is_admin())
  with check (public.cultura_is_admin());

alter table public.demandes_retrait enable row level security;

create policy "demandes_retrait_insert" on public.demandes_retrait
  for insert to authenticated
  with check (content_type in ('acteur', 'annonce', 'event') and content_id is not null);

create policy "demandes_retrait_select_admin" on public.demandes_retrait
  for select to authenticated
  using (public.cultura_is_admin());

create policy "demandes_retrait_update_admin" on public.demandes_retrait
  for update to authenticated
  using (public.cultura_is_admin())
  with check (public.cultura_is_admin());

alter table public.categories enable row level security;

create policy "categories_select_public" on public.categories
  for select to anon, authenticated
  using (true);

create policy "categories_write_admin" on public.categories
  for insert to authenticated
  with check (public.cultura_is_admin());

create policy "categories_update_admin" on public.categories
  for update to authenticated
  using (public.cultura_is_admin())
  with check (public.cultura_is_admin());

alter table public.annonces enable row level security;

create policy "annonces_select_public" on public.annonces
  for select to anon, authenticated
  using (statut = 'valide');

create policy "annonces_select_acteur" on public.annonces
  for select to authenticated
  using (
    exists (
      select 1
      from public.acteurs_culturels a
      join public.users u on u.id = a.user_id
      where a.id = annonces.acteur_id and u.id = auth.uid()
    )
    or exists (
      select 1
      from public.acteurs_culturels a
      join public.users u on u.id = a.cree_par
      where a.id = annonces.acteur_id and u.id = auth.uid()
    )
    or public.cultura_is_editor()
  );

create policy "annonces_insert_acteur" on public.annonces
  for insert to authenticated
  with check (
    public.cultura_is_editor()
    or exists (
      select 1
      from public.acteurs_culturels a
      join public.users u on u.id = a.user_id
      where a.id = annonces.acteur_id and u.id = auth.uid()
    )
    or exists (
      select 1
      from public.acteurs_culturels a
      join public.users u on u.id = a.cree_par
      where a.id = annonces.acteur_id and u.id = auth.uid()
    )
  );

create policy "annonces_update_acteur" on public.annonces
  for update to authenticated
  using (
    public.cultura_is_admin()
    or public.cultura_is_editor()
    or exists (
      select 1
      from public.acteurs_culturels a
      join public.users u on u.id = a.user_id
      where a.id = annonces.acteur_id and u.id = auth.uid()
    )
    or exists (
      select 1
      from public.acteurs_culturels a
      join public.users u on u.id = a.cree_par
      where a.id = annonces.acteur_id and u.id = auth.uid()
    )
  )
  with check (
    public.cultura_is_admin()
    or public.cultura_is_editor()
    or exists (
      select 1
      from public.acteurs_culturels a
      join public.users u on u.id = a.user_id
      where a.id = annonces.acteur_id and u.id = auth.uid()
    )
    or exists (
      select 1
      from public.acteurs_culturels a
      join public.users u on u.id = a.cree_par
      where a.id = annonces.acteur_id and u.id = auth.uid()
    )
  );

alter table public.events enable row level security;

create policy "events_select_public" on public.events
  for select to anon, authenticated
  using (statut = 'valide');

create policy "events_select_acteur" on public.events
  for select to authenticated
  using (
    public.cultura_is_admin()
    or public.cultura_is_editor()
    or exists (
      select 1
      from public.acteurs_culturels a
      join public.users u on u.id = a.user_id
      where a.id = events.acteur_id and u.id = auth.uid()
    )
  );

create policy "events_insert_acteur" on public.events
  for insert to authenticated
  with check (
    public.cultura_is_editor()
    or exists (
      select 1
      from public.acteurs_culturels a
      join public.users u on u.id = a.user_id
      where a.id = events.acteur_id and u.id = auth.uid()
    )
  );

create policy "events_update_acteur" on public.events
  for update to authenticated
  using (
    public.cultura_is_admin()
    or public.cultura_is_editor()
    or exists (
      select 1
      from public.acteurs_culturels a
      join public.users u on u.id = a.user_id
      where a.id = events.acteur_id and u.id = auth.uid()
    )
  )
  with check (
    public.cultura_is_admin()
    or public.cultura_is_editor()
    or exists (
      select 1
      from public.acteurs_culturels a
      join public.users u on u.id = a.user_id
      where a.id = events.acteur_id and u.id = auth.uid()
    )
  );

alter table public.events_acteurs enable row level security;

create policy "events_acteurs_select_team" on public.events_acteurs
  for select to authenticated
  using (public.cultura_is_admin() or public.cultura_is_editor());

alter table public.likes enable row level security;

create policy "likes_select_own" on public.likes
  for select to authenticated
  using (user_id = auth.uid());

create policy "likes_insert_own" on public.likes
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "likes_delete_own" on public.likes
  for delete to authenticated
  using (user_id = auth.uid());

alter table public.favorites enable row level security;

create policy "favorites_select_own" on public.favorites
  for select to authenticated
  using (user_id = auth.uid());

create policy "favorites_insert_own" on public.favorites
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "favorites_delete_own" on public.favorites
  for delete to authenticated
  using (user_id = auth.uid());

alter table public.views enable row level security;

create policy "views_insert" on public.views
  for insert to anon, authenticated
  with check (session_id is not null);

alter table public.villes_suivies enable row level security;

create policy "villes_suivies_select_own" on public.villes_suivies
  for select to authenticated
  using (user_id = auth.uid());

create policy "villes_suivies_insert_own" on public.villes_suivies
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "villes_suivies_delete_own" on public.villes_suivies
  for delete to authenticated
  using (user_id = auth.uid());

alter table public.moderation_log enable row level security;

create policy "moderation_log_insert_admin" on public.moderation_log
  for insert to authenticated
  with check (public.cultura_is_admin());

-- Statistiques (vues_quotidiennes) : accès réservé au service / admin.

alter table public.vues_quotidiennes enable row level security;

-- Complète la couverture RLS : aucune table du modèle (§10.1) sans RLS.
alter table public.shares enable row level security;

create policy "shares_insert" on public.shares
  for insert to authenticated
  with check (num_nonnulls (annonce_id, event_id) = 1);

alter table public.clicks enable row level security;

create policy "clicks_insert" on public.clicks
  for insert to authenticated
  with check (num_nonnulls (annonce_id, event_id) = 1);

alter table public.signalements enable row level security;

create policy "signalements_insert" on public.signalements
  for insert to authenticated
  with check (motif is not null);

create policy "signalements_select_own" on public.signalements
  for select to authenticated
  using (user_id = auth.uid());

create policy "signalements_update_admin" on public.signalements
  for update to authenticated
  using (public.cultura_is_admin())
  with check (public.cultura_is_admin());

create policy "signalements_delete_admin" on public.signalements
  for delete to authenticated
  using (public.cultura_is_admin());
