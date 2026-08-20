import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useFoyer } from "@/hooks/useFoyer";
import type { FamilyMember } from "@/types/domain";

export function useFamilyMembers() {
  const { foyer } = useFoyer();

  return useQuery({
    queryKey: ["family-members", foyer?.id],
    enabled: !!foyer,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_members")
        .select("*")
        .eq("foyer_id", foyer!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as FamilyMember[];
    },
  });
}

export function useFamilyMember(id: string | undefined) {
  return useQuery({
    queryKey: ["family-member", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_members")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as FamilyMember;
    },
  });
}

export function useCreateFamilyMember() {
  const { foyer } = useFoyer();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      nom: string;
      dateNaissance: string | null;
      niveau: string;
      emoji: string;
      couleur: string;
    }) => {
      const { data, error } = await supabase
        .from("family_members")
        .insert({
          foyer_id: foyer!.id,
          nom: input.nom,
          date_naissance: input.dateNaissance,
          niveau: input.niveau,
          emoji: input.emoji,
          couleur: input.couleur,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as FamilyMember;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-members", foyer?.id] });
    },
  });
}

export function useUpdateFamilyMember() {
  const { foyer } = useFoyer();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string } & Partial<FamilyMember>) => {
      const { id, ...rest } = input;
      const { data, error } = await supabase
        .from("family_members")
        .update(rest)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return data as FamilyMember;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["family-members", foyer?.id] });
      queryClient.invalidateQueries({ queryKey: ["family-member", data.id] });
    },
  });
}
