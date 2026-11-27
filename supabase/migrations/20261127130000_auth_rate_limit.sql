-- Cultura — P3.1 : limitation de débit des parcours d'authentification.
--
-- Aucun Redis au MVP (cahier T15) : une fenêtre temporelle persistante en base.
-- La table n'a AUCUNE policy : son accès passe uniquement par la fonction
-- SECURITY DEFINER ci-dessous, exécutable par `service_role` seulement.
-- Le rôle de connexion `postgres.<ref>` contourne RLS, comme pour le seed.

create table if not exists public.auth_rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  hits integer not null default 1,
  constraint auth_rate_limits_key_not_empty check (length(key) between 1 and 200),
  constraint auth_rate_limits_hits_positive check (hits > 0)
);

alter table public.auth_rate_limits enable row level security;

comment on table public.auth_rate_limits is
  'Fenêtres de limitation de débit auth. Aucune policy : accès par fonction SECURITY DEFINER.';

-- Retourne true si la tentative est autorisée, false si la fenêtre est pleine.
-- `search_path = ''` figé : aucun objet non qualifié, aucun SQL dynamique.
create or replace function public.cultura_auth_rate_limit(
  p_key text,
  p_max integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_start timestamptz;
  v_hits integer;
begin
  if p_key is null or length(p_key) = 0 or length(p_key) > 200 then
    return false;
  end if;
  if p_max is null or p_max < 1 or p_max > 1000 then
    return false;
  end if;
  if p_window_seconds is null or p_window_seconds < 1 or p_window_seconds > 86400 then
    return false;
  end if;

  select window_start, hits into v_start, v_hits
  from public.auth_rate_limits
  where key = p_key;

  if v_start is null or v_start < now() - make_interval(secs => p_window_seconds) then
    insert into public.auth_rate_limits (key, window_start, hits)
    values (p_key, now(), 1)
    on conflict (key) do update
      set window_start = excluded.window_start, hits = 1;
    return true;
  end if;

  if v_hits >= p_max then
    return false;
  end if;

  update public.auth_rate_limits set hits = hits + 1 where key = p_key;
  return true;
end;
$$;

-- Les droits d'exécution sont accordés par défaut à PUBLIC : on les retire.
revoke all on function public.cultura_auth_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.cultura_auth_rate_limit(text, integer, integer)
  to service_role;

comment on function public.cultura_auth_rate_limit(text, integer, integer) is
  'Limite les tentatives auth par clé et fenêtre ; exécution réservée à service_role.';
