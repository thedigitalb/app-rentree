import { Link } from "react-router-dom";
import { HB } from "@/components/HB";
import { Button } from "@/components/ui/Button";

export default function Welcome() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-gradient-to-b from-rentree-violet/40 via-rentree-ciel/30 to-rentree-creme px-6 text-center">
      <HB humeur="content" taille={160} />

      <div className="space-y-2">
        <h1 className="font-title text-3xl font-extrabold">App Rentrée</h1>
        <p className="mx-auto max-w-xs text-rentree-encre/70">
          Préparez la rentrée scolaire en famille, sans prise de tête — avec HB !
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Link to="/inscription">
          <Button className="w-full" variant="primaire">
            Créer un compte
          </Button>
        </Link>
        <Link to="/connexion">
          <Button className="w-full" variant="secondaire">
            J'ai déjà un compte
          </Button>
        </Link>
      </div>
    </div>
  );
}
