-- Empêche de réduire la quantité totale d'un article attribuable en
-- dessous de ce qui est déjà attribué (symétrique au trigger existant sur
-- allocations, qui ne couvre que l'insert/update des allocations elles-
-- mêmes, pas la modification de l'article attribuable).
create or replace function public.check_quantite_totale_vs_allocations()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_alloue integer;
begin
  select coalesce(sum(quantite), 0) into v_alloue
  from public.allocations
  where article_attribuable_id = new.id;

  if new.quantite_totale < v_alloue then
    raise exception 'Impossible : % déjà attribué(s), la quantité totale ne peut pas descendre en dessous', v_alloue
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger trg_check_quantite_totale_vs_allocations
  before update of quantite_totale on public.articles_attribuables
  for each row execute function public.check_quantite_totale_vs_allocations();
