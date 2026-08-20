import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useFoyer } from "@/hooks/useFoyer";
import { matieresParDefaut, trousseParDefaut } from "@/utils/defautsParNiveau";
import type { AnneeScolaire } from "@/types/domain";

export function useAnneesScolaires() {
  const { foyer } = useFoyer();

  return useQuery({
    queryKey: ["annees-scolaires", foyer?.id],
    enabled: !!foyer,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("annees_scolaires")
        .select("*")
        .eq("foyer_id", foyer!.id)
        .order("label", { ascending: false });
      if (error) throw error;
      return data as AnneeScolaire[];
    },
  });
}

interface NouvelleAnneeInput {
  label: string;
  dateDebutVisibilite: string;
  dateFinVisibilite: string;
  reporterStock: boolean;
  reporterAttribuables: boolean;
}

/**
 * Ouvre une nouvelle année scolaire : désactive l'ancienne, crée la
 * nouvelle, régénère trousse + matières par défaut pour chaque enfant, et
 * reporte (en option) le stock commun / les objets attribuables comme point
 * de départ ajustable (section 8).
 */
export function useCreerNouvelleAnnee() {
  const { foyer, anneeActive, refetch } = useFoyer();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: NouvelleAnneeInput) => {
      if (!foyer) throw new Error("Foyer manquant");
      const ancienneAnneeId = anneeActive?.id ?? null;

      if (ancienneAnneeId) {
        const { error } = await supabase
          .from("annees_scolaires")
          .update({ active: false })
          .eq("id", ancienneAnneeId);
        if (error) throw error;
      }

      const { data: nouvelleAnnee, error: erreurCreation } = await supabase
        .from("annees_scolaires")
        .insert({
          foyer_id: foyer.id,
          label: input.label,
          date_debut_visibilite: input.dateDebutVisibilite,
          date_fin_visibilite: input.dateFinVisibilite,
          active: true,
        })
        .select("*")
        .single();
      if (erreurCreation) throw erreurCreation;

      const { data: enfants, error: erreurEnfants } = await supabase
        .from("family_members")
        .select("id, niveau")
        .eq("foyer_id", foyer.id);
      if (erreurEnfants) throw erreurEnfants;

      for (const enfant of enfants ?? []) {
        const matieres = matieresParDefaut(enfant.niveau).map((m) => ({
          foyer_id: foyer.id,
          annee_scolaire_id: nouvelleAnnee.id,
          family_member_id: enfant.id,
          nom: m.nom,
          active: m.active,
        }));
        if (matieres.length > 0) {
          const { error } = await supabase.from("matieres").insert(matieres);
          if (error) throw error;
        }

        const trousse = trousseParDefaut().map((item, index) => ({
          foyer_id: foyer.id,
          annee_scolaire_id: nouvelleAnnee.id,
          family_member_id: enfant.id,
          item,
          checked: false,
          ordre: index,
        }));
        if (trousse.length > 0) {
          const { error } = await supabase.from("trousse_check_items").insert(trousse);
          if (error) throw error;
        }
      }

      if (ancienneAnneeId && input.reporterStock) {
        const { data: ancienStock, error } = await supabase
          .from("stock_commun")
          .select("article, quantite_totale, categorie, notes")
          .eq("annee_scolaire_id", ancienneAnneeId);
        if (error) throw error;
        if (ancienStock && ancienStock.length > 0) {
          const { error: erreurInsert } = await supabase.from("stock_commun").insert(
            ancienStock.map((s) => ({ ...s, foyer_id: foyer.id, annee_scolaire_id: nouvelleAnnee.id }))
          );
          if (erreurInsert) throw erreurInsert;
        }
      }

      if (ancienneAnneeId && input.reporterAttribuables) {
        const { data: anciensArticles, error } = await supabase
          .from("articles_attribuables")
          .select("id, article, quantite_totale, categorie, notes")
          .eq("annee_scolaire_id", ancienneAnneeId);
        if (error) throw error;

        for (const article of anciensArticles ?? []) {
          const { data: nouvelArticle, error: erreurArticle } = await supabase
            .from("articles_attribuables")
            .insert({
              foyer_id: foyer.id,
              annee_scolaire_id: nouvelleAnnee.id,
              article: article.article,
              quantite_totale: article.quantite_totale,
              categorie: article.categorie,
              notes: article.notes,
            })
            .select("id")
            .single();
          if (erreurArticle) throw erreurArticle;

          const { data: anciennesAllocations, error: erreurAlloc } = await supabase
            .from("allocations")
            .select("family_member_id, quantite, etat")
            .eq("article_attribuable_id", article.id);
          if (erreurAlloc) throw erreurAlloc;

          if (anciennesAllocations && anciennesAllocations.length > 0) {
            const { error: erreurInsertAlloc } = await supabase.from("allocations").insert(
              anciennesAllocations.map((a) => ({
                ...a,
                article_attribuable_id: nouvelArticle.id,
              }))
            );
            if (erreurInsertAlloc) throw erreurInsertAlloc;
          }
        }
      }

      return nouvelleAnnee;
    },
    onSuccess: async () => {
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["annees-scolaires"] });
    },
  });
}
