-- Cultura — P3.1 : durcissement soulevé par la revue `security-reviewer`.
--
-- 1. Les trois helpers RLS de P2.2 déclarent `search_path = public` : `pg_temp`
--    reste implicitement recherché en premier. On les recrée avec
--    `public, pg_temp` (ADR-003 §2), tous les objets restant qualifiés.
-- 2. La table de limitation de débit est protégée par des policies explicites
--    de refus pour `anon` et `authenticated`, en plus de l'absence de droit
--    d'exécution de la fonction. `service_role` contourne RLS par conception.

create or replace function public.cultura_is_admin (uid uuid default auth.uid ())
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
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
set search_path = public, pg_temp
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
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.acteurs_culturels a
    join public.users u on u.id = a.user_id
    where u.id = uid and a.statut_fiche <> 'revendiquee'
  );
$$;

create policy auth_rate_limits_deny_anon
  on public.auth_rate_limits for all to anon
  using (false) with check (false);

create policy auth_rate_limits_deny_authenticated
  on public.auth_rate_limits for all to authenticated
  using (false) with check (false);
