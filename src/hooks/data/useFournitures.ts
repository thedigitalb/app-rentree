import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useFoyer } from "@/hooks/useFoyer";
import type { FournitureItem, StatutFourniture } from "@/types/domain";

export function qteAAcheter(item: Pick<FournitureItem, "qte_demandee" | "qte_couverte">): number {
  return Math.max(item.qte_demandee - item.qte_couverte, 0);
}

export function useFournitures(familyMemberId: string | undefined) {
  return useQuery({
    queryKey: ["fournitures", familyMemberId],
    enabled: !!familyMemberId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fourniture_items")
        .select("*")
        .eq("family_member_id", familyMemberId!)
        .order("section", { ascending: true })
        .order("ordre", { ascending: true });
      if (error) throw error;
      return data as FournitureItem[];
    },
  });
}

/** Progression (fournitures achetées / total) par enfant, pour l'année active. */
export function useProgressionParEnfant() {
  const { foyer, anneeActive } = useFoyer();

  return useQuery({
    queryKey: ["progression-fournitures", foyer?.id, anneeActive?.id],
    enabled: !!foyer && !!anneeActive,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fourniture_items")
        .select("family_member_id, statut")
        .eq("foyer_id", foyer!.id)
        .eq("annee_scolaire_id", anneeActive!.id);
      if (error) throw error;

      const parEnfant = new Map<string, { total: number; achete: number }>();
      for (const item of data ?? []) {
        const entree = parEnfant.get(item.family_member_id) ?? { total: 0, achete: 0 };
        entree.total += 1;
        if (item.statut === "achete") entree.achete += 1;
        parEnfant.set(item.family_member_id, entree);
      }
      return parEnfant;
    },
  });
}

export type FournitureAAcheter = FournitureItem & {
  family_members: { nom: string; emoji: string; couleur: string } | null;
};

/** Vue consolidée "à acheter", tous enfants, pour l'année active. */
export function useFournituresAAcheter() {
  const { foyer, anneeActive } = useFoyer();

  return useQuery({
    queryKey: ["fournitures-a-acheter", foyer?.id, anneeActive?.id],
    enabled: !!foyer && !!anneeActive,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fourniture_items")
        .select("*, family_members(nom, emoji, couleur)")
        .eq("foyer_id", foyer!.id)
        .eq("annee_scolaire_id", anneeActive!.id)
        .neq("statut", "achete")
        .order("section", { ascending: true });
      if (error) throw error;
      return data as FournitureAAcheter[];
    },
  });
}

export function useCreateFournitureItem() {
  const { foyer, anneeActive } = useFoyer();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      familyMemberId: string;
      matiereId: string | null;
      section: string;
      item: string;
      qteDemandee: number;
      notes?: string | null;
      categorie?: string | null;
    }) => {
      if (!foyer || !anneeActive) throw new Error("Foyer ou année scolaire manquants");
      const { data, error } = await supabase
        .from("fourniture_items")
        .insert({
          foyer_id: foyer.id,
          annee_scolaire_id: anneeActive.id,
          family_member_id: input.familyMemberId,
          matiere_id: input.matiereId,
          section: input.section,
          item: input.item,
          qte_demandee: input.qteDemandee,
          notes: input.notes ?? null,
          categorie: input.categorie ?? null,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as FournitureItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fournitures", data.family_member_id] });
      queryClient.invalidateQueries({ queryKey: ["fournitures-a-acheter"] });
    },
  });
}

export function useUpdateFournitureItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: { id: string; familyMemberId: string } & Partial<
        Pick<
          FournitureItem,
          "qte_demandee" | "qte_couverte" | "statut" | "notes" | "item" | "section" | "categorie"
        >
      >
    ) => {
      const { id, familyMemberId: _familyMemberId, ...rest } = input;
      const { error } = await supabase.from("fourniture_items").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["fournitures", variables.familyMemberId] });
      queryClient.invalidateQueries({ queryKey: ["fournitures-a-acheter"] });
    },
  });
}

/** "Marquer comme acheté" : statut="achete" ET qteCouverte=qteDemandee, en une seule action. */
export function useMarquerAchete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      familyMemberId: string;
      qteDemandee: number;
      achete: boolean;
    }) => {
      const statut: StatutFourniture = input.achete ? "achete" : "a_acheter";
      const { error } = await supabase
        .from("fourniture_items")
        .update({
          statut,
          qte_couverte: input.achete ? input.qteDemandee : 0,
        })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["fournitures", variables.familyMemberId] });
      queryClient.invalidateQueries({ queryKey: ["fournitures-a-acheter"] });
    },
  });
}

export function useDeleteFournitureItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; familyMemberId: string }) => {
      const { error } = await supabase.from("fourniture_items").delete().eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["fournitures", variables.familyMemberId] });
      queryClient.invalidateQueries({ queryKey: ["fournitures-a-acheter"] });
    },
  });
}
