-- ============================================================
-- app-rentree — schéma initial
-- Foyer / comptes liés / enfants / années scolaires / matières /
-- stock commun / objets attribuables / fournitures / dépenses /
-- imports / trousse / invitations
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Fonction utilitaire générique : maj automatique de updated_at
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- Fonction réutilisable (section 9) : une rentrée est-elle visible ?
-- ------------------------------------------------------------
create or replace function public.est_rentree_visible(
  p_date_debut date,
  p_date_fin date,
  p_at date default current_date
)
returns boolean
language sql
immutable
as $$
  select p_at between p_date_debut and p_date_fin
$$;

-- ============================================================
-- FOYER
-- ============================================================
create table public.foyers (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- FOYER_MEMBRE_COMPTE (liaison compte Supabase Auth <-> foyer)
-- ============================================================
create table public.foyer_membres_comptes (
  user_id uuid not null references auth.users(id) on delete cascade,
  foyer_id uuid not null references public.foyers(id) on delete cascade,
  role text not null default 'parent' check (role = 'parent'),
  created_at timestamptz not null default now(),
  primary key (user_id, foyer_id)
);

-- Fonction sécurité : foyers du user courant (bypass RLS en lecture interne)
create or replace function public.my_foyer_ids()
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select foyer_id from public.foyer_membres_comptes where user_id = auth.uid()
$$;

-- ============================================================
-- INVITATIONS (rejoindre le foyer d'un conjoint)
-- ============================================================
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  foyer_id uuid not null references public.foyers(id) on delete cascade,
  code text not null unique,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  used_at timestamptz,
  used_by uuid references auth.users(id)
);

-- ============================================================
-- FAMILY_MEMBER (enfants)
-- ============================================================
create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  foyer_id uuid not null references public.foyers(id) on delete cascade,
  nom text not null,
  date_naissance date,
  niveau text not null,
  emoji text not null default '🧒',
  couleur text not null default '#FFB3D9',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_family_members_updated_at
  before update on public.family_members
  for each row execute function public.set_updated_at();

-- ============================================================
-- ANNEE_SCOLAIRE
-- ============================================================
create table public.annees_scolaires (
  id uuid primary key default gen_random_uuid(),
  foyer_id uuid not null references public.foyers(id) on delete cascade,
  label text not null,
  date_debut_visibilite date not null,
  date_fin_visibilite date not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
-- une seule année active par foyer
create unique index uq_annee_scolaire_active_par_foyer
  on public.annees_scolaires (foyer_id)
  where active;

-- ============================================================
-- MATIERE
-- ============================================================
create table public.matieres (
  id uuid primary key default gen_random_uuid(),
  foyer_id uuid not null references public.foyers(id) on delete cascade,
  annee_scolaire_id uuid not null references public.annees_scolaires(id) on delete cascade,
  family_member_id uuid not null references public.family_members(id) on delete cascade,
  nom text not null,
  active boolean not null default true,
  spec_fournitures text,
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- TROUSSE_CHECK_ITEM (checklist trousse — informatif, toggles)
-- ============================================================
create table public.trousse_check_items (
  id uuid primary key default gen_random_uuid(),
  foyer_id uuid not null references public.foyers(id) on delete cascade,
  annee_scolaire_id uuid not null references public.annees_scolaires(id) on delete cascade,
  family_member_id uuid not null references public.family_members(id) on delete cascade,
  item text not null,
  checked boolean not null default false,
  ordre integer not null default 0
);

-- ============================================================
-- STOCK_COMMUN (consommables en gros, non attribués)
-- ============================================================
create table public.stock_commun (
  id uuid primary key default gen_random_uuid(),
  foyer_id uuid not null references public.foyers(id) on delete cascade,
  annee_scolaire_id uuid not null references public.annees_scolaires(id) on delete cascade,
  article text not null,
  quantite_totale integer not null default 0 check (quantite_totale >= 0),
  categorie text,
  notes text
);

-- ============================================================
-- ARTICLE_ATTRIBUABLE + ALLOCATION
-- ============================================================
create table public.articles_attribuables (
  id uuid primary key default gen_random_uuid(),
  foyer_id uuid not null references public.foyers(id) on delete cascade,
  annee_scolaire_id uuid not null references public.annees_scolaires(id) on delete cascade,
  article text not null,
  quantite_totale integer not null default 0 check (quantite_totale >= 0),
  categorie text,
  notes text
);

create table public.allocations (
  id uuid primary key default gen_random_uuid(),
  article_attribuable_id uuid not null references public.articles_attribuables(id) on delete cascade,
  family_member_id uuid references public.family_members(id) on delete cascade,
  quantite integer not null default 0 check (quantite >= 0),
  etat text
);

-- Contrainte : somme des allocations <= quantité totale de l'article
create or replace function public.check_allocation_plafond()
returns trigger
language plpgsql
as $$
declare
  v_total integer;
  v_alloue integer;
begin
  select quantite_totale into v_total
  from public.articles_attribuables
  where id = new.article_attribuable_id;

  select coalesce(sum(quantite), 0) into v_alloue
  from public.allocations
  where article_attribuable_id = new.article_attribuable_id
    and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

  if (v_alloue + new.quantite) > v_total then
    raise exception 'Allocation refusée : % déjà attribué(s) + % demandé(s) dépasse le total de % pour cet article',
      v_alloue, new.quantite, v_total
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger trg_check_allocation_plafond
  before insert or update on public.allocations
  for each row execute function public.check_allocation_plafond();

-- ============================================================
-- FOURNITURE_ITEM
-- ============================================================
create table public.fourniture_items (
  id uuid primary key default gen_random_uuid(),
  foyer_id uuid not null references public.foyers(id) on delete cascade,
  annee_scolaire_id uuid not null references public.annees_scolaires(id) on delete cascade,
  family_member_id uuid not null references public.family_members(id) on delete cascade,
  matiere_id uuid references public.matieres(id) on delete set null,
  section text not null,
  item text not null,
  qte_demandee integer not null default 1 check (qte_demandee >= 0),
  qte_couverte integer not null default 0 check (qte_couverte >= 0),
  statut text not null default 'a_acheter' check (statut in ('a_acheter', 'en_cours', 'achete')),
  notes text,
  ordre integer not null default 0
);

-- ============================================================
-- DEPENSE
-- ============================================================
create table public.depenses (
  id uuid primary key default gen_random_uuid(),
  foyer_id uuid not null references public.foyers(id) on delete cascade,
  annee_scolaire_id uuid not null references public.annees_scolaires(id) on delete cascade,
  montant numeric(10, 2) not null check (montant >= 0),
  description text,
  ticket_url text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- LISTE_IMPORTEE
-- ============================================================
create table public.listes_importees (
  id uuid primary key default gen_random_uuid(),
  foyer_id uuid not null references public.foyers(id) on delete cascade,
  annee_scolaire_id uuid not null references public.annees_scolaires(id) on delete cascade,
  family_member_id uuid references public.family_members(id) on delete set null,
  fichier_url text not null,
  type_fichier text not null check (type_fichier in ('photo', 'pdf')),
  statut_extraction text not null default 'en_attente' check (statut_extraction in ('en_attente', 'traite', 'erreur')),
  created_at timestamptz not null default now()
);
