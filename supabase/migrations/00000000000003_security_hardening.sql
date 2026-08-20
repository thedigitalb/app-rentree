-- Fixe les search_path mutables et restreint les RPC à "authenticated" uniquement

alter function public.set_updated_at() set search_path = public;
alter function public.est_rentree_visible(date, date, date) set search_path = public;
alter function public.check_allocation_plafond() set search_path = public;

revoke execute on function public.create_foyer(text) from public, anon;
revoke execute on function public.create_invitation(uuid) from public, anon;
revoke execute on function public.join_foyer_with_code(text) from public, anon;
revoke execute on function public.my_foyer_ids() from public, anon;

grant execute on function public.create_foyer(text) to authenticated;
grant execute on function public.create_invitation(uuid) to authenticated;
grant execute on function public.join_foyer_with_code(text) to authenticated;
grant execute on function public.my_foyer_ids() to authenticated;
