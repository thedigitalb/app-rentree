import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useFoyer } from "@/hooks/useFoyer";
import type { StockCommun } from "@/types/domain";

export function useStockCommun() {
  const { foyer, anneeActive } = useFoyer();

  return useQuery({
    queryKey: ["stock-commun", foyer?.id, anneeActive?.id],
    enabled: !!foyer && !!anneeActive,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_commun")
        .select("*")
        .eq("foyer_id", foyer!.id)
        .eq("annee_scolaire_id", anneeActive!.id)
        .order("article", { ascending: true });
      if (error) throw error;
      return data as StockCommun[];
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
