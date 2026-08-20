import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useFoyer } from "@/hooks/useFoyer";
import type { Depense } from "@/types/domain";

export function useDepenses() {
  const { foyer, anneeActive } = useFoyer();

  return useQuery({
    queryKey: ["depenses", foyer?.id, anneeActive?.id],
    enabled: !!foyer && !!anneeActive,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("depenses")
        .select("*")
        .eq("foyer_id", foyer!.id)
        .eq("annee_scolaire_id", anneeActive!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Depense[];
    },
  });
}

/** Historique : total de dépenses par année scolaire (toutes années, foyer courant). */
export function useHistoriqueDepenses() {
  const { foyer } = useFoyer();

  return useQuery({
    queryKey: ["historique-depenses", foyer?.id],
    enabled: !!foyer,
    queryFn: async () => {
      const { data: annees, error: erreurAnnees } = await supabase
        .from("annees_scolaires")
        .select("id, label, active")
        .eq("foyer_id", foyer!.id)
        .order("label", { ascending: false });
      if (erreurAnnees) throw erreurAnnees;

      const { data: depenses, error: erreurDepenses } = await supabase
        .from("depenses")
        .select("annee_scolaire_id, montant")
        .eq("foyer_id", foyer!.id);
      if (erreurDepenses) throw erreurDepenses;

      return (annees ?? []).map((annee) => ({
        ...annee,
        total: (depenses ?? [])
          .filter((d) => d.annee_scolaire_id === annee.id)
          .reduce((somme, d) => somme + Number(d.montant), 0),
      }));
    },
  });
}

export function useCreateDepense() {
  const { foyer, anneeActive } = useFoyer();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { montant: number; description?: string | null; ticketUrl?: string | null }) => {
      if (!foyer || !anneeActive) throw new Error("Foyer ou année scolaire manquants");
      const { error } = await supabase.from("depenses").insert({
        foyer_id: foyer.id,
        annee_scolaire_id: anneeActive.id,
        montant: input.montant,
        description: input.description ?? null,
        ticket_url: input.ticketUrl ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["depenses"] });
      queryClient.invalidateQueries({ queryKey: ["historique-depenses"] });
    },
  });
}

export function useDeleteDepense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("depenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["depenses"] });
      queryClient.invalidateQueries({ queryKey: ["historique-depenses"] });
    },
  });
}
