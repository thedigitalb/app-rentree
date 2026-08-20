-- RPC : liste des comptes membres d'un foyer avec leur email (auth.users
-- n'est pas exposé directement au client). Restreint aux membres du foyer.
create or replace function public.foyer_membres_emails(p_foyer_id uuid)
returns table (user_id uuid, email text, role text, created_at timestamptz)
language sql
security definer
stable
set search_path = public
as $$
  select fmc.user_id, u.email, fmc.role, fmc.created_at
  from public.foyer_membres_comptes fmc
  join auth.users u on u.id = fmc.user_id
  where fmc.foyer_id = p_foyer_id
    and p_foyer_id in (select public.my_foyer_ids())
$$;

revoke execute on function public.foyer_membres_emails(uuid) from public, anon;
grant execute on function public.foyer_membres_emails(uuid) to authenticated;
