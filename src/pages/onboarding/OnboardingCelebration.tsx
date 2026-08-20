import { useNavigate } from "react-router-dom";
import { HB } from "@/components/HB";
import { Confetti } from "@/components/Confetti";
import { Button } from "@/components/ui/Button";
import { usePreferences } from "@/hooks/usePreferences";

export default function OnboardingCelebration() {
  const navigate = useNavigate();
  const { animationsActives } = usePreferences();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-gradient-to-b from-rentree-jaune/40 via-rentree-rose/30 to-rentree-creme px-6 text-center">
      {animationsActives && <Confetti />}
      <HB humeur="fete" taille={170} animer={animationsActives} />
      <div className="space-y-2">
        <h1 className="font-title text-3xl font-extrabold">Tout est prêt !</h1>
        <p className="mx-auto max-w-xs text-rentree-encre/70">
          Votre foyer est configuré. HB vous attend sur le tableau de bord pour préparer la
          rentrée ensemble.
        </p>
      </div>
      <Button className="w-full max-w-xs" onClick={() => navigate("/", { replace: true })}>
        Découvrir le tableau de bord
      </Button>
    </div>
  );
}
