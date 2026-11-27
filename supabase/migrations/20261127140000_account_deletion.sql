-- Cultura — suppression atomique des données d'un compte (P3.4)
-- Source : guide IA §7.4 et §4 (P3.4), ADR-007, revue db-security 2026-11-27.
--
-- Le schéma P2 ne porte aucun `ON DELETE CASCADE` vers `users` hormis
-- `users.id → auth.users.id`. La suppression relationnelle est donc explicite,
-- dans l'ordre imposé par les clés étrangères, et s'exécute en une seule
-- transaction côté fonction. Aucune table, aucune politique RLS n'est modifiée.
--
-- La fonction ne supprime pas `public.users` : c'est la cascade de
-- `auth.admin.deleteUser()` qui le fait, afin d'éviter un `auth.users` zombie
-- si l'appel GoTrue échoue après la RPC.

create or replace function public.cultura_delete_account_data(
  p_user_id uuid,
  p_email text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_acteurs uuid[];
  v_annonces uuid[];
  v_events uuid[];
  v_restants bigint;
begin
  if p_user_id is null or p_email is null or length(trim(p_email)) = 0 then
    raise exception 'cultura_delete_account_data: identifiant invalide'
      using errcode = '22023';
  end if;

  -- Défense en profondeur : avec service_role, auth.uid() est NULL. Si un
  -- appelant inattendu obtenait EXECUTE avec un JWT, il ne pourrait pas agir
  -- pour un autre compte.
  if auth.uid() is not null and auth.uid() <> p_user_id then
    raise exception 'cultura_delete_account_data: compte différent du porteur du jeton'
      using errcode = '42501';
  end if;

  -- Sérialise les suppressions concurrentes et empêche l'insertion d'enfants
  -- entre deux `delete` (une FK prend FOR KEY SHARE sur le parent).
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));
  perform 1 from public.users where id = p_user_id for update;
  if not found then
    raise exception 'cultura_delete_account_data: profil introuvable'
      using errcode = '22023';
  end if;

  -- Journal immuable : un compte référencé ne peut pas être supprimé.
  if exists (select 1 from public.moderation_log where admin_id = p_user_id) then
    raise exception 'cultura_delete_account_data: compte journalisé'
      using errcode = '23514';
  end if;

  v_acteurs := array(
    select id from public.acteurs_culturels
    where user_id = p_user_id or cree_par = p_user_id
  );
  v_annonces := array(
    select id from public.annonces where acteur_id = any (v_acteurs)
  );
  v_events := array(
    select id from public.events where acteur_id = any (v_acteurs)
  );

  -- Liens de vérification et de traitement portés par le compte sur des
  -- fiches conservées : on retire la référence personnelle sans toucher au
  -- contenu lui-même.
  update public.acteurs_culturels
     set verified = false,
         verified_at = null,
         verified_by = null
   where verified_by = p_user_id
     and not (id = any (v_acteurs));

  update public.revendications_fiches
     set traite_par = null
   where traite_par = p_user_id
     and user_id is distinct from p_user_id
     and acteur_id is not null
     and not (acteur_id = any (v_acteurs));

  -- Statistiques et interactions : elles peuvent provenir d'autres comptes,
  -- mais portent sur un contenu supprimé avec le compte.
  delete from public.clicks
   where annonce_id = any (v_annonces) or event_id = any (v_events);

  delete from public.vues_quotidiennes
   where annonce_id = any (v_annonces) or event_id = any (v_events);

  delete from public.likes
   where user_id = p_user_id
      or annonce_id = any (v_annonces)
      or event_id = any (v_events);

  delete from public.favorites
   where user_id = p_user_id
      or annonce_id = any (v_annonces)
      or event_id = any (v_events);

  delete from public.views
   where user_id = p_user_id
      or annonce_id = any (v_annonces)
      or event_id = any (v_events);

  delete from public.shares
   where user_id = p_user_id
      or annonce_id = any (v_annonces)
      or event_id = any (v_events);

  delete from public.signalements
   where user_id = p_user_id
      or annonce_id = any (v_annonces)
      or event_id = any (v_events);

  delete from public.villes_suivies where user_id = p_user_id;

  delete from public.events_acteurs
   where acteur_id = any (v_acteurs) or event_id = any (v_events);

  delete from public.annonces where id = any (v_annonces);
  delete from public.events where id = any (v_events);

  delete from public.revendications_fiches
   where user_id = p_user_id
      or traite_par = p_user_id
      or acteur_id = any (v_acteurs);

  delete from public.acteurs_culturels
   where id = any (v_acteurs) or user_id = p_user_id or cree_par = p_user_id;

  -- Demandes de retrait : contact du compte ou contenu supprimé (références
  -- polymorphes, sans contrainte de clé étrangère).
  delete from public.demandes_retrait
   where (contact is not null and position(lower(trim(p_email)) in lower(contact)) > 0)
      or (content_type = 'acteur' and content_id = any (v_acteurs))
      or (content_type = 'annonce' and content_id = any (v_annonces))
      or (content_type = 'event' and content_id = any (v_events));

  -- Contrôle final : aucune écriture n'est validée s'il reste un reliquat.
  select coalesce(sum(n), 0) into v_restants from (
    select count(*) as n from public.likes
      where user_id = p_user_id or annonce_id = any (v_annonces) or event_id = any (v_events)
    union all
    select count(*) from public.favorites
      where user_id = p_user_id or annonce_id = any (v_annonces) or event_id = any (v_events)
    union all
    select count(*) from public.views
      where user_id = p_user_id or annonce_id = any (v_annonces) or event_id = any (v_events)
    union all
    select count(*) from public.villes_suivies where user_id = p_user_id
    union all
    select count(*) from public.shares
      where user_id = p_user_id or annonce_id = any (v_annonces) or event_id = any (v_events)
    union all
    select count(*) from public.signalements
      where user_id = p_user_id or annonce_id = any (v_annonces) or event_id = any (v_events)
    union all
    select count(*) from public.clicks
      where annonce_id = any (v_annonces) or event_id = any (v_events)
    union all
    select count(*) from public.vues_quotidiennes
      where annonce_id = any (v_annonces) or event_id = any (v_events)
    union all
    select count(*) from public.events_acteurs
      where acteur_id = any (v_acteurs) or event_id = any (v_events)
    union all
    select count(*) from public.annonces where id = any (v_annonces)
    union all
    select count(*) from public.events where id = any (v_events)
    union all
    select count(*) from public.revendications_fiches
      where user_id = p_user_id or traite_par = p_user_id or acteur_id = any (v_acteurs)
    union all
    select count(*) from public.acteurs_culturels
      where id = any (v_acteurs) or user_id = p_user_id or cree_par = p_user_id
    union all
    select count(*) from public.demandes_retrait
      where (contact is not null and position(lower(trim(p_email)) in lower(contact)) > 0)
         or (content_type = 'acteur' and content_id = any (v_acteurs))
         or (content_type = 'annonce' and content_id = any (v_annonces))
         or (content_type = 'event' and content_id = any (v_events))
    union all
    select count(*) from public.moderation_log where admin_id = p_user_id
  ) as reste;

  if v_restants > 0 then
    raise exception 'cultura_delete_account_data: reliquats détectés'
      using errcode = '23514';
  end if;
end;
$$;

comment on function public.cultura_delete_account_data(uuid, text) is
  'P3.4 : suppression relationnelle atomique des données d''un compte, hors auth.users. Réservé à service_role.';

revoke all on function public.cultura_delete_account_data(uuid, text)
  from public, anon, authenticated;

grant execute on function public.cultura_delete_account_data(uuid, text) to service_role;
