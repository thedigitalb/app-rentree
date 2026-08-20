import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { TrousseCheckItem } from "@/types/domain";

export function useTrousse(familyMemberId: string | undefined) {
  return useQuery({
    queryKey: ["trousse", familyMemberId],
    enabled: !!familyMemberId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trousse_check_items")
        .select("*")
        .eq("family_member_id", familyMemberId!)
        .order("ordre", { ascending: true });
      if (error) throw error;
      return data as TrousseCheckItem[];
    },
  });
}

export function useToggleTrousseItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; familyMemberId: string; checked: boolean }) => {
      const { error } = await supabase
        .from("trousse_check_items")
        .update({ checked: input.checked })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trousse", variables.familyMemberId] });
    },
  });
}
