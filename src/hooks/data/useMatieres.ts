import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useFoyer } from "@/hooks/useFoyer";
import type { Matiere } from "@/types/domain";

export function useMatieres(familyMemberId: string | undefined) {
  return useQuery({
    queryKey: ["matieres", familyMemberId],
    enabled: !!familyMemberId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matieres")
        .select("*")
        .eq("family_member_id", familyMemberId!)
        .order("nom", { ascending: true });
      if (error) throw error;
      return data as Matiere[];
    },
  });
}

export function useCreateMatieres() {
  const queryClient = useQueryClient();
  const { foyer, anneeActive } = useFoyer();

  return useMutation({
    mutationFn: async (input: {
      familyMemberId: string;
      matieres: { nom: string; active: boolean }[];
    }) => {
      if (!foyer || !anneeActive) throw new Error("Foyer ou année scolaire manquants");
      const rows = input.matieres.map((m) => ({
        foyer_id: foyer.id,
        annee_scolaire_id: anneeActive.id,
        family_member_id: input.familyMemberId,
        nom: m.nom,
        active: m.active,
      }));
      const { error } = await supabase.from("matieres").insert(rows);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["matieres", variables.familyMemberId] });
    },
  });
}

export function useUpdateMatiere() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; familyMemberId: string } & Partial<Matiere>) => {
      const { id, familyMemberId: _familyMemberId, ...rest } = input;
      const { error } = await supabase.from("matieres").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["matieres", variables.familyMemberId] });
    },
  });
}

export function useDeleteMatiere() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; familyMemberId: string }) => {
      const { error } = await supabase.from("matieres").delete().eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["matieres", variables.familyMemberId] });
    },
  });
}
