import { supabase } from "@/lib/supabase";

/** Format attendu pour l'import JSON ponctuel de démarrage (onboarding). */
export interface DonneesDepartJSON {
  enfants?: {
    nom: string;
    dateNaissance?: string | null;
    niveau?: string;
    emoji?: string;
    couleur?: string;
  }[];
  stockCommun?: { article: string; quantiteTotale: number; categorie?: string | null }[];
  articlesAttribuables?: {
    article: string;
    quantiteTotale: number;
    categorie?: string | null;
  }[];
}

export function parseDonneesDepartJSON(texte: string): DonneesDepartJSON {
  const data = JSON.parse(texte);
  if (typeof data !== "object" || data === null) {
    throw new Error("Le JSON doit être un objet.");
  }
  return data as DonneesDepartJSON;
}

/** Déclenche le téléchargement local d'un export JSON complet du foyer courant. */
export async function exporterFoyerEnJSON(foyerId: string, nomFichier: string) {
  const tables = [
    "foyers",
    "family_members",
    "annees_scolaires",
    "matieres",
    "trousse_check_items",
    "stock_commun",
    "articles_attribuables",
    "fourniture_items",
    "depenses",
  ] as const;

  const resultat: Record<string, unknown> = { exporte_le: new Date().toISOString() };

  for (const table of tables) {
    const colonne = table === "foyers" ? "id" : "foyer_id";
    // Chaque table a une colonne de filtre différente (id vs foyer_id) : le
    // typage précis de `.eq()` ne peut pas s'unifier sur une boucle générique.
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq(colonne as "id", foyerId);
    if (error) throw error;
    resultat[table] = data;
  }

  // allocations : scoped via articles_attribuables, récupérées séparément
  const articles = (resultat.articles_attribuables as { id: string }[]) ?? [];
  if (articles.length > 0) {
    const { data: allocations, error } = await supabase
      .from("allocations")
      .select("*")
      .in(
        "article_attribuable_id",
        articles.map((a) => a.id)
      );
    if (error) throw error;
    resultat.allocations = allocations;
  } else {
    resultat.allocations = [];
  }

  const blob = new Blob([JSON.stringify(resultat, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomFichier;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
