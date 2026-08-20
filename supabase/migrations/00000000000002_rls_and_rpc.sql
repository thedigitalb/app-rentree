-- ============================================================
-- app-rentree — RLS (isolation par foyer) + fonctions RPC
-- ============================================================

-- ------------------------------------------------------------
-- Activation RLS sur toutes les tables
-- ------------------------------------------------------------
alter table public.foyers enable row level security;
alter table public.foyer_membres_comptes enable row level security;
alter table public.invitations enable row level security;
alter table public.family_members enable row level security;
alter table public.annees_scolaires enable row level security;
alter table public.matieres enable row level security;
alter table public.trousse_check_items enable row level security;
alter table public.stock_commun enable row level security;
alter table public.articles_attribuables enable row level security;
alter table public.allocations enable row level security;
alter table public.fourniture_items enable row level security;
alter table public.depenses enable row level security;
alter table public.listes_importees enable row level security;

-- ------------------------------------------------------------
-- FOYERS : lecture/maj des foyers dont on est membre.
-- Pas de policy insert directe : la création passe par create_foyer().
-- ------------------------------------------------------------
create policy "foyers_select_membre" on public.foyers
  for select using (id in (select public.my_foyer_ids()));

create policy "foyers_update_membre" on public.foyers
  for update using (id in (select public.my_foyer_ids()));

-- ------------------------------------------------------------
-- FOYER_MEMBRES_COMPTES : voir les membres de son foyer.
-- Pas d'insert/delete direct : passe par create_foyer() / join_foyer_with_code().
-- ------------------------------------------------------------
create policy "fmc_select_membre" on public.foyer_membres_comptes
  for select using (foyer_id in (select public.my_foyer_ids()));

-- ------------------------------------------------------------
-- INVITATIONS : les membres du foyer peuvent créer/voir/révoquer
-- leurs propres invitations. La consommation (join) se fait via
-- join_foyer_with_code(), en SECURITY DEFINER (pas besoin d'être
-- déjà membre pour lire le code).
-- ------------------------------------------------------------
create policy "invitations_select_membre" on public.invitations
  for select using (foyer_id in (select public.my_foyer_ids()));

create policy "invitations_insert_membre" on public.invitations
  for insert with check (
    foyer_id in (select public.my_foyer_ids())
    and created_by = auth.uid()
  );

create policy "invitations_delete_membre" on public.invitations
  for delete using (foyer_id in (select public.my_foyer_ids()));

-- ------------------------------------------------------------
-- Toutes les tables "métier" scoped foyer_id : CRUD complet
-- pour tout membre du foyer.
-- ------------------------------------------------------------
create policy "family_members_all" on public.family_members
  for all using (foyer_id in (select public.my_foyer_ids()))
  with check (foyer_id in (select public.my_foyer_ids()));

create policy "annees_scolaires_all" on public.annees_scolaires
  for all using (foyer_id in (select public.my_foyer_ids()))
  with check (foyer_id in (select public.my_foyer_ids()));

create policy "matieres_all" on public.matieres
  for all using (foyer_id in (select public.my_foyer_ids()))
  with check (foyer_id in (select public.my_foyer_ids()));

create policy "trousse_check_items_all" on public.trousse_check_items
  for all using (foyer_id in (select public.my_foyer_ids()))
  with check (foyer_id in (select public.my_foyer_ids()));

create policy "stock_commun_all" on public.stock_commun
  for all using (foyer_id in (select public.my_foyer_ids()))
  with check (foyer_id in (select public.my_foyer_ids()));

create policy "articles_attribuables_all" on public.articles_attribuables
  for all using (foyer_id in (select public.my_foyer_ids()))
  with check (foyer_id in (select public.my_foyer_ids()));

create policy "fourniture_items_all" on public.fourniture_items
  for all using (foyer_id in (select public.my_foyer_ids()))
  with check (foyer_id in (select public.my_foyer_ids()));

create policy "depenses_all" on public.depenses
  for all using (foyer_id in (select public.my_foyer_ids()))
  with check (foyer_id in (select public.my_foyer_ids()));

create policy "listes_importees_all" on public.listes_importees
  for all using (foyer_id in (select public.my_foyer_ids()))
  with check (foyer_id in (select public.my_foyer_ids()));

-- ------------------------------------------------------------
-- ALLOCATIONS : scoped via l'article_attribuable parent
-- ------------------------------------------------------------
create policy "allocations_all" on public.allocations
  for all using (
    article_attribuable_id in (
      select id from public.articles_attribuables
      where foyer_id in (select public.my_foyer_ids())
    )
  )
  with check (
    article_attribuable_id in (
      select id from public.articles_attribuables
      where foyer_id in (select public.my_foyer_ids())
    )
  );

-- ============================================================
-- RPC : création du foyer à l'inscription
-- ============================================================
create or replace function public.create_foyer(p_nom text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_foyer_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentification requise';
  end if;

  insert into public.foyers (nom) values (p_nom) returning id into v_foyer_id;

  insert into public.foyer_membres_comptes (user_id, foyer_id, role)
  values (auth.uid(), v_foyer_id, 'parent');

  return v_foyer_id;
end;
$$;

grant execute on function public.create_foyer(text) to authenticated;

-- ============================================================
-- RPC : générer un code d'invitation pour le foyer courant
-- ============================================================
create or replace function public.create_invitation(p_foyer_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
begin
  if p_foyer_id not in (select public.my_foyer_ids()) then
    raise exception 'Vous n''êtes pas membre de ce foyer';
  end if;

  -- code lisible à 8 caractères (sans caractères ambigus)
  v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));

  insert into public.invitations (foyer_id, code, created_by)
  values (p_foyer_id, v_code, auth.uid());

  return v_code;
end;
$$;

grant execute on function public.create_invitation(uuid) to authenticated;

-- ============================================================
-- RPC : rejoindre un foyer via un code d'invitation
-- ============================================================
create or replace function public.join_foyer_with_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation record;
begin
  if auth.uid() is null then
    raise exception 'Authentification requise';
  end if;

  select * into v_invitation
  from public.invitations
  where code = upper(p_code)
  for update;

  if v_invitation is null then
    raise exception 'Code d''invitation invalide';
  end if;

  if v_invitation.used_at is not null then
    raise exception 'Ce code d''invitation a déjà été utilisé';
  end if;

  if v_invitation.expires_at < now() then
    raise exception 'Ce code d''invitation a expiré';
  end if;

  insert into public.foyer_membres_comptes (user_id, foyer_id, role)
  values (auth.uid(), v_invitation.foyer_id, 'parent')
  on conflict (user_id, foyer_id) do nothing;

  update public.invitations
  set used_at = now(), used_by = auth.uid()
  where id = v_invitation.id;

  return v_invitation.foyer_id;
end;
$$;

grant execute on function public.join_foyer_with_code(text) to authenticated;

-- ============================================================
-- STORAGE : buckets privés pour les photos de listes et tickets
-- Chemin attendu : {foyer_id}/{...}.ext
-- ============================================================
insert into storage.buckets (id, name, public)
values
  ('listes-fournitures', 'listes-fournitures', false),
  ('tickets-depenses', 'tickets-depenses', false)
on conflict (id) do nothing;

create policy "listes_fournitures_membre_foyer" on storage.objects
  for all using (
    bucket_id = 'listes-fournitures'
    and (storage.foldername(name))[1]::uuid in (select public.my_foyer_ids())
  )
  with check (
    bucket_id = 'listes-fournitures'
    and (storage.foldername(name))[1]::uuid in (select public.my_foyer_ids())
  );

create policy "tickets_depenses_membre_foyer" on storage.objects
  for all using (
    bucket_id = 'tickets-depenses'
    and (storage.foldername(name))[1]::uuid in (select public.my_foyer_ids())
  )
  with check (
    bucket_id = 'tickets-depenses'
    and (storage.foldername(name))[1]::uuid in (select public.my_foyer_ids())
  );
