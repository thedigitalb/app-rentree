import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useFoyer } from "@/hooks/useFoyer";
import type { StockCommun } from "@/types/domain";

export type StockCommunAvecDisponibilite = StockCommun & {
  utilise: number;
  disponible: number;
};

/**
 * Stock commun avec la quantité déjà tirée par des fournitures marquées
 * "en stock" (déduite en direct, plus de compteur figé) — voir
 * `useChangerStatutFourniture` côté fourniture_items pour la liaison.
 */
export function useStockCommun() {
  const { foyer, anneeActive } = useFoyer();

  return useQuery({
    queryKey: ["stock-commun", foyer?.id, anneeActive?.id],
    enabled: !!foyer && !!anneeActive,
    queryFn: async () => {
      const { data: stock, error } = await supabase
        .from("stock_commun")
        .select("*")
        .eq("foyer_id", foyer!.id)
        .eq("annee_scolaire_id", anneeActive!.id)
        .order("article", { ascending: true });
      if (error) throw error;

      const { data: utilisations, error: erreurUtilisations } = await supabase
        .from("fourniture_items")
        .select("stock_commun_id, qte_couverte")
        .eq("foyer_id", foyer!.id)
        .eq("annee_scolaire_id", anneeActive!.id)
        .eq("statut", "en_stock")
        .not("stock_commun_id", "is", null);
      if (erreurUtilisations) throw erreurUtilisations;

      const utiliseParArticle = new Map<string, number>();
      for (const u of utilisations ?? []) {
        if (!u.stock_commun_id) continue;
        utiliseParArticle.set(
          u.stock_commun_id,
          (utiliseParArticle.get(u.stock_commun_id) ?? 0) + u.qte_couverte
        );
      }

      return (stock as StockCommun[]).map((s) => {
        const utilise = utiliseParArticle.get(s.id) ?? 0;
        return { ...s, utilise, disponible: Math.max(s.quantite_totale - utilise, 0) };
      }) as StockCommunAvecDisponibilite[];
    },
  });
}

export function useCreateStockCommun() {
  const { foyer, anneeActive } = useFoyer();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      article: string;
      quantiteTotale: number;
      categorie?: string | null;
      notes?: string | null;
    }) => {
      if (!foyer || !anneeActive) throw new Error("Foyer ou année scolaire manquants");
      const { error } = await supabase.from("stock_commun").insert({
        foyer_id: foyer.id,
        annee_scolaire_id: anneeActive.id,
        article: input.article,
        quantite_totale: input.quantiteTotale,
        categorie: input.categorie ?? null,
        notes: input.notes ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-commun"] });
    },
  });
}

export function useUpdateStockCommun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string } & Partial<StockCommun>) => {
      const { id, ...rest } = input;
      const { error } = await supabase.from("stock_commun").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-commun"] });
    },
  });
}

export function useDeleteStockCommun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("stock_commun").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-commun"] });
    },
  });
}
