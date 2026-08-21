-- Relie une fourniture "en stock" à l'article du Stock commun dont elle
-- est tirée, pour que la quantité disponible reflète la réalité au lieu
-- de rester figée. Optionnel : on peut marquer "en stock" sans lier
-- (ex. objet non suivi dans le stock commun).
alter table public.fourniture_items
  add column stock_commun_id uuid references public.stock_commun(id) on delete set null;
