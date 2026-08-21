import type { Tables } from "@/types/database";

export type Foyer = Tables<"foyers">;
export type FoyerMembreCompte = Tables<"foyer_membres_comptes">;
export type FamilyMember = Tables<"family_members">;
export type AnneeScolaire = Tables<"annees_scolaires">;
export type Matiere = Tables<"matieres">;
export type TrousseCheckItem = Tables<"trousse_check_items">;
export type StockCommun = Tables<"stock_commun">;
export type ArticleAttribuable = Tables<"articles_attribuables">;
export type Allocation = Tables<"allocations">;
export type FournitureItem = Tables<"fourniture_items">;
export type Depense = Tables<"depenses">;
export type ListeImportee = Tables<"listes_importees">;
export type Invitation = Tables<"invitations">;

export type StatutFourniture = "a_acheter" | "en_stock" | "achete";

export const LABELS_STATUT_FOURNITURE: Record<StatutFourniture, string> = {
  a_acheter: "À acheter",
  en_stock: "En stock",
  achete: "Acheté",
};

export const NIVEAUX_PRIMAIRE = [
  "Petite section",
  "Moyenne section",
  "Grande section",
  "CP",
  "CE1",
  "CE2",
  "CM1",
  "CM2",
] as const;

export const NIVEAUX_COLLEGE = ["6ème", "5ème", "4ème", "3ème"] as const;

export const NIVEAUX_LYCEE = ["2nde", "1ère", "Terminale"] as const;

export const TOUS_NIVEAUX = [...NIVEAUX_PRIMAIRE, ...NIVEAUX_COLLEGE, ...NIVEAUX_LYCEE] as const;

export type Niveau = (typeof TOUS_NIVEAUX)[number];

export const EMOJIS_ENFANT = ["🦊", "🐻", "🐰", "🐼", "🦁", "🐨", "🐯", "🐸", "🦄", "🐙", "🐢", "🦋"];

export const COULEURS_ENFANT = [
  "#FFB3D9",
  "#B3F0E5",
  "#FFEAA7",
  "#D9B3FF",
  "#B3E5FF",
  "#FFC9A3",
];

/** Catégories de fournitures (indépendantes de la matière et de l'enfant),
 * utilisées pour filtrer la vue "à acheter" au magasin. */
export const CATEGORIES_FOURNITURE = [
  "Écriture",
  "Cahiers & classeurs",
  "Instruments de géométrie",
  "Arts",
  "Sport",
  "Autre",
] as const;

export type CategorieFourniture = (typeof CATEGORIES_FOURNITURE)[number];

/** Palette de couleurs de cahier par matière — plus saturée que la palette
 * enfant, pensée pour rester distinguable même avec beaucoup de matières
 * (ex. repérer le cahier de maths en un coup d'œil au magasin). */
export const COULEURS_MATIERE = [
  "#F87171", // rouge
  "#FB923C", // orange
  "#FACC15", // jaune
  "#4ADE80", // vert
  "#2DD4BF", // turquoise
  "#60A5FA", // bleu
  "#A78BFA", // violet
  "#F472B6", // rose
  "#A16207", // marron
  "#9CA3AF", // gris
] as const;
