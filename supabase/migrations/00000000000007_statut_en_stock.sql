-- Remplace le statut intermédiaire "en_cours" (jamais utilisé côté UI) par
-- "en_stock" : un statut à 3 valeurs clair pour l'utilisatrice — à acheter,
-- déjà en stock à la maison, ou acheté pour cette rentrée.
alter table public.fourniture_items drop constraint fourniture_items_statut_check;
alter table public.fourniture_items add constraint fourniture_items_statut_check
  check (statut in ('a_acheter', 'en_stock', 'achete'));
