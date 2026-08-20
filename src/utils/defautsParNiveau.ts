import {
  NIVEAUX_COLLEGE,
  NIVEAUX_LYCEE,
  NIVEAUX_PRIMAIRE,
  type Niveau,
} from "@/types/domain";

export type CycleScolaire = "primaire" | "college" | "lycee";

export function cycleDuNiveau(niveau: string): CycleScolaire {
  if ((NIVEAUX_COLLEGE as readonly string[]).includes(niveau)) return "college";
  if ((NIVEAUX_LYCEE as readonly string[]).includes(niveau)) return "lycee";
  return "primaire";
}

export interface MatiereDefaut {
  nom: string;
  active: boolean;
}

/**
 * Listes de matières par défaut proposées à la création d'un enfant (ou au
 * changement de niveau). Toujours un point de départ modifiable — jamais
 * figées (section 2 du cahier des charges).
 */
export function matieresParDefaut(niveau: string): MatiereDefaut[] {
  const cycle = cycleDuNiveau(niveau);

  if (cycle === "primaire") {
    return [
      { nom: "Français", active: true },
      { nom: "Mathématiques", active: true },
      { nom: "Questionner le monde", active: true },
      { nom: "Arts", active: true },
      { nom: "EPS", active: true },
    ];
  }

  if (cycle === "college") {
    return [
      { nom: "Français", active: true },
      { nom: "Mathématiques", active: true },
      { nom: "SVT", active: true },
      { nom: "Technologie", active: true },
      { nom: "Physique-Chimie", active: true },
      { nom: "Arts Plastiques", active: true },
      { nom: "Éducation musicale", active: true },
      { nom: "Histoire-Géographie", active: true },
      { nom: "Anglais", active: true },
      { nom: "EPS", active: true },
      { nom: "Espagnol", active: false },
      { nom: "Allemand", active: false },
      { nom: "Latin", active: false },
    ];
  }

  // lycée
  return [
    { nom: "Français", active: true },
    { nom: "Mathématiques", active: true },
    { nom: "Histoire-Géographie", active: true },
    { nom: "LV1", active: true },
    { nom: "LV2", active: true },
    { nom: "EPS", active: true },
    { nom: "Physique-Chimie", active: true },
    { nom: "SVT", active: true },
    { nom: "Latin", active: false },
    { nom: "SES", active: false },
  ];
}

/**
 * Checklist trousse par défaut (informative, toggles) proposée à la
 * création d'un enfant.
 */
export function trousseParDefaut(): string[] {
  return [
    "Trousse complète",
    "Crayons à papier taillés",
    "Gomme",
    "Stylos (bleu, noir, vert, rouge)",
    "Surligneurs",
    "Paire de ciseaux",
    "Colle",
    "Règle",
    "Cahier de brouillon",
    "Tenue de sport",
  ];
}

export const NIVEAUX_GROUPES: { label: string; niveaux: readonly string[] }[] = [
  { label: "Primaire", niveaux: NIVEAUX_PRIMAIRE },
  { label: "Collège", niveaux: NIVEAUX_COLLEGE },
  { label: "Lycée", niveaux: NIVEAUX_LYCEE },
];

export type { Niveau };
