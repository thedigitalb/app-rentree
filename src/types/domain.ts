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

export type StatutFourniture = "a_acheter" | "en_cours" | "achete";

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
