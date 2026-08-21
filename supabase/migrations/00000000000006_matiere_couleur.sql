-- Couleur de cahier associée à une matière, par enfant (ex. rouge pour les
-- maths d'Ava, bleu pour les maths de Liza) — aide au repérage en magasin
-- et lors de la préparation du cartable.
alter table public.matieres add column couleur text;
