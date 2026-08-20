import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFoyer } from "@/hooks/useFoyer";
import { HB } from "@/components/HB";

function SplashHB() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-rentree-creme">
      <HB humeur="neutre" taille={110} />
      <p className="font-title text-rentree-encre/60">Un instant…</p>
    </div>
  );
}

/** Nécessite un compte connecté. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <SplashHB />;
  if (!user) return <Navigate to="/bienvenue" replace />;
  return <>{children}</>;
}

/** Nécessite un compte connecté ET un foyer déjà créé/rejoint. */
export function RequireFoyer({ children }: { children: ReactNode }) {
  const { user, loading: loadingAuth } = useAuth();
  const { hasFoyer, loading: loadingFoyer } = useFoyer();

  if (loadingAuth || (user && loadingFoyer)) return <SplashHB />;
  if (!user) return <Navigate to="/bienvenue" replace />;
  if (!hasFoyer) return <Navigate to="/onboarding/foyer" replace />;
  return <>{children}</>;
}

/** Pour les écrans d'onboarding : redirige vers le tableau de bord si un foyer existe déjà. */
export function RequireNoFoyer({ children }: { children: ReactNode }) {
  const { user, loading: loadingAuth } = useAuth();
  const { hasFoyer, loading: loadingFoyer } = useFoyer();

  if (loadingAuth || (user && loadingFoyer)) return <SplashHB />;
  if (!user) return <Navigate to="/bienvenue" replace />;
  if (hasFoyer) return <Navigate to="/" replace />;
  return <>{children}</>;
}
