alter table public.fourniture_items
  add column categorie text;

-- Classement automatique des fournitures déjà importées, par mots-clés.
-- L'ordre des WHEN reflète une priorité (sport avant écriture avant
-- géométrie avant arts avant cahiers/classeurs, "Autre" en repli).
-- Ce backfill est spécifique aux données déjà présentes lors de cette
-- migration ; les nouvelles fournitures choisissent leur catégorie
-- explicitement dans le formulaire.
update public.fourniture_items
set categorie = case
  when item ~* 'sport|gourde|maillot de bain|bonnet de bain|chaussures de sport|serviette|natation|tenue de sport' then 'Sport'
  when item ~* 'stylo|crayon|gomme|surligneur|feutre|correcteur|taille-crayon|marqueur' then 'Écriture'
  when item ~* 'règle|équerre|compas|rapporteur|décimètre|calculatrice' then 'Instruments de géométrie'
  when item ~* 'gouache|pinceau|dessin|couleur|carton à dessin|peinture' then 'Arts'
  when item ~* 'cahier|classeur|intercalaire|pochette|porte-vues|lutin|trieur|chemise|copie|feuille|agenda|étiquette|protège-cahier|enveloppe|papier' then 'Cahiers & classeurs'
  else 'Autre'
end
where categorie is null;
