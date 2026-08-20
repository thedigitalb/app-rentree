import { createContext, useContext, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { AnneeScolaire, Foyer } from "@/types/domain";

interface FoyerContextValue {
  foyer: Foyer | null;
  anneeActive: AnneeScolaire | null;
  loading: boolean;
  hasFoyer: boolean;
  refetch: () => Promise<void>;
}

const FoyerContext = createContext<FoyerContextValue | null>(null);

export function FoyerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: foyer, isLoading: loadingFoyer } = useQuery({
    queryKey: ["mon-foyer", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: lien, error: erreurLien } = await supabase
        .from("foyer_membres_comptes")
        .select("foyer_id")
        .limit(1)
        .maybeSingle();
      if (erreurLien) throw erreurLien;
      if (!lien) return null;

      const { data: foyerRow, error: erreurFoyer } = await supabase
        .from("foyers")
        .select("*")
        .eq("id", lien.foyer_id)
        .single();
      if (erreurFoyer) throw erreurFoyer;
      return foyerRow;
    },
  });

  const { data: anneeActive, isLoading: loadingAnnee } = useQuery({
    queryKey: ["annee-active", foyer?.id],
    enabled: !!foyer,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("annees_scolaires")
        .select("*")
        .eq("foyer_id", foyer!.id)
        .eq("active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  async function refetch() {
    await queryClient.invalidateQueries({ queryKey: ["mon-foyer"] });
    await queryClient.invalidateQueries({ queryKey: ["annee-active"] });
  }

  return (
    <FoyerContext.Provider
      value={{
        foyer: foyer ?? null,
        anneeActive: anneeActive ?? null,
        loading: !!user && (loadingFoyer || (!!foyer && loadingAnnee)),
        hasFoyer: !!foyer,
        refetch,
      }}
    >
      {children}
    </FoyerContext.Provider>
  );
}

export function useFoyer(): FoyerContextValue {
  const ctx = useContext(FoyerContext);
  if (!ctx) throw new Error("useFoyer doit être utilisé dans <FoyerProvider>");
  return ctx;
}
