import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useFoyer } from "@/hooks/useFoyer";

export function useMembresFoyer() {
  const { foyer } = useFoyer();

  return useQuery({
    queryKey: ["membres-foyer", foyer?.id],
    enabled: !!foyer,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("foyer_membres_emails", {
        p_foyer_id: foyer!.id,
      });
      if (error) throw error;
      return data;
    },
  });
}

/** Génère un code d'invitation à partager avec le conjoint. */
export function useCreerInvitation() {
  const { foyer } = useFoyer();

  return useMutation({
    mutationFn: async () => {
      if (!foyer) throw new Error("Foyer manquant");
      const { data, error } = await supabase.rpc("create_invitation", {
        p_foyer_id: foyer.id,
      });
      if (error) throw error;
      return data as string;
    },
  });
}

/** Rejoint un foyer existant via un code d'invitation. */
export function useRejoindreFoyer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase.rpc("join_foyer_with_code", { p_code: code });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mon-foyer"] });
    },
  });
}
