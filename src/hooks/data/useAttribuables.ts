import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useFoyer } from "@/hooks/useFoyer";
import type { Allocation, ArticleAttribuable } from "@/types/domain";

export type ArticleAvecAllocations = ArticleAttribuable & { allocations: Allocation[] };

export function useArticlesAttribuables() {
  const { foyer, anneeActive } = useFoyer();

  return useQuery({
    queryKey: ["articles-attribuables", foyer?.id, anneeActive?.id],
    enabled: !!foyer && !!anneeActive,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles_attribuables")
        .select("*, allocations(*)")
        .eq("foyer_id", foyer!.id)
        .eq("annee_scolaire_id", anneeActive!.id)
        .order("article", { ascending: true });
      if (error) throw error;
      return data as ArticleAvecAllocations[];
    },
  });
}

/** Ce qui est attribué à un enfant donné, tous articles confondus (année active). */
export function useAllocationsPourEnfant(familyMemberId: string | undefined) {
  const { anneeActive } = useFoyer();

  return useQuery({
    queryKey: ["allocations-enfant", familyMemberId, anneeActive?.id],
    enabled: !!familyMemberId && !!anneeActive,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("allocations")
        .select("*, articles_attribuables!inner(article, categorie, annee_scolaire_id)")
        .eq("family_member_id", familyMemberId!)
        .eq("articles_attribuables.annee_scolaire_id", anneeActive!.id);
      if (error) throw error;
      return data as (Allocation & {
        articles_attribuables: { article: string; categorie: string | null };
      })[];
    },
  });
}

export function useCreateArticleAttribuable() {
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
      const { error } = await supabase.from("articles_attribuables").insert({
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
      queryClient.invalidateQueries({ queryKey: ["articles-attribuables"] });
    },
  });
}

export function useUpdateArticleAttribuable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string } & Partial<ArticleAttribuable>) => {
      const { id, ...rest } = input;
      const { error } = await supabase.from("articles_attribuables").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles-attribuables"] });
    },
  });
}

export function useDeleteArticleAttribuable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("articles_attribuables").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["articles-attribuables"] }),
  });
}

/**
 * Crée ou met à jour une allocation. Le plafond (somme <= quantité totale)
 * est vérifié côté base (trigger) : l'erreur Postgres est remontée telle
 * quelle pour affichage clair côté UI.
 */
export function useUpsertAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id?: string;
      articleAttribuableId: string;
      familyMemberId: string | null;
      quantite: number;
      etat?: string | null;
    }) => {
      const { error } = await supabase.from("allocations").upsert({
        id: input.id,
        article_attribuable_id: input.articleAttribuableId,
        family_member_id: input.familyMemberId,
        quantite: input.quantite,
        etat: input.etat ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles-attribuables"] });
    },
  });
}

export function useDeleteAllocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("allocations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["articles-attribuables"] }),
  });
}
