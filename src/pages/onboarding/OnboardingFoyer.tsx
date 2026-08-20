import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useFoyer } from "@/hooks/useFoyer";
import { useCreerInvitation, useRejoindreFoyer } from "@/hooks/data/useFoyerMembres";
import { labelAnneeScolaireParDefaut, bornesVisibiliteParDefaut } from "@/utils/rentree";
import { HB } from "@/components/HB";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

type Mode = "choix" | "creer-nom" | "creer-invite" | "rejoindre";

export default function OnboardingFoyer() {
  const navigate = useNavigate();
  const { refetch } = useFoyer();
  const [mode, setMode] = useState<Mode>("choix");
  const [nomFoyer, setNomFoyer] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  const creerInvitation = useCreerInvitation();
  const rejoindreFoyer = useRejoindreFoyer();

  async function creerLeFoyer(e: FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnvoi(true);
    try {
      const { error: erreurFoyer } = await supabase.rpc("create_foyer", { p_nom: nomFoyer });
      if (erreurFoyer) throw erreurFoyer;

      await refetch();

      // Année scolaire active par défaut, créée dans la foulée.
      const { data: lien } = await supabase
        .from("foyer_membres_comptes")
        .select("foyer_id")
        .limit(1)
        .maybeSingle();

      if (lien) {
        const label = labelAnneeScolaireParDefaut();
        const bornes = bornesVisibiliteParDefaut(label);
        await supabase.from("annees_scolaires").insert({
          foyer_id: lien.foyer_id,
          label,
          date_debut_visibilite: bornes.dateDebutVisibilite,
          date_fin_visibilite: bornes.dateFinVisibilite,
          active: true,
        });
        await refetch();
      }

      setMode("creer-invite");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setEnvoi(false);
    }
  }

  async function genererCode() {
    setErreur(null);
    try {
      const nouveauCode = await creerInvitation.mutateAsync();
      setCode(nouveauCode);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Impossible de générer le code.");
    }
  }

  async function copierCode() {
    if (code) await navigator.clipboard.writeText(code);
  }

  async function onRejoindre(e: FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnvoi(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const codeSaisi = String(formData.get("code") ?? "");
    try {
      await rejoindreFoyer.mutateAsync(codeSaisi);
      navigate("/", { replace: true });
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Code invalide.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-rentree-creme px-6 text-center">
      <HB humeur="content" taille={110} />

      {mode === "choix" && (
        <>
          <h1 className="font-title text-2xl font-bold">Bienvenue !</h1>
          <p className="max-w-xs text-rentree-encre/70">
            Un foyer regroupe toute la famille : c'est là que vivront les enfants, les fournitures
            et le budget.
          </p>
          <div className="flex w-full max-w-xs flex-col gap-3">
            <Button className="w-full" onClick={() => setMode("creer-nom")}>
              Créer mon foyer
            </Button>
            <Button className="w-full" variant="secondaire" onClick={() => setMode("rejoindre")}>
              Rejoindre un foyer existant
            </Button>
          </div>
        </>
      )}

      {mode === "creer-nom" && (
        <>
          <h1 className="font-title text-2xl font-bold">Comment s'appelle votre foyer ?</h1>
          <form onSubmit={creerLeFoyer} className="w-full max-w-xs space-y-4">
            <div className="text-left">
              <Label>Nom du foyer</Label>
              <Input
                required
                placeholder="Ex. Famille Martin"
                value={nomFoyer}
                onChange={(e) => setNomFoyer(e.target.value)}
              />
            </div>
            {erreur && <p className="text-sm font-medium text-red-600">{erreur}</p>}
            <Button type="submit" className="w-full" disabled={envoi}>
              {envoi ? "Création…" : "Continuer"}
            </Button>
          </form>
        </>
      )}

      {mode === "creer-invite" && (
        <>
          <h1 className="font-title text-2xl font-bold">Inviter votre conjoint ?</h1>
          <p className="max-w-xs text-rentree-encre/70">
            Il ou elle pourra rejoindre le même foyer avec son propre compte, et accéder à tout en
            temps réel. Vous pouvez aussi le faire plus tard depuis les réglages.
          </p>

          {code ? (
            <div className="w-full max-w-xs space-y-3 rounded-2xl bg-white p-5">
              <p className="text-sm text-rentree-encre/60">Code d'invitation (valable 7 jours) :</p>
              <p className="font-title text-3xl font-extrabold tracking-widest">{code}</p>
              <Button variant="secondaire" className="w-full" onClick={copierCode}>
                Copier le code
              </Button>
            </div>
          ) : (
            <Button
              variant="secondaire"
              className="w-full max-w-xs"
              onClick={genererCode}
              disabled={creerInvitation.isPending}
            >
              {creerInvitation.isPending ? "Génération…" : "Générer un code d'invitation"}
            </Button>
          )}

          {erreur && <p className="text-sm font-medium text-red-600">{erreur}</p>}

          <Button className="w-full max-w-xs" onClick={() => navigate("/onboarding/enfants")}>
            Continuer
          </Button>
        </>
      )}

      {mode === "rejoindre" && (
        <>
          <h1 className="font-title text-2xl font-bold">Rejoindre un foyer</h1>
          <p className="max-w-xs text-rentree-encre/70">
            Entrez le code d'invitation reçu de votre conjoint.
          </p>
          <form onSubmit={onRejoindre} className="w-full max-w-xs space-y-4">
            <Input name="code" required placeholder="Ex. A1B2C3D4" className="text-center uppercase tracking-widest" />
            {erreur && <p className="text-sm font-medium text-red-600">{erreur}</p>}
            <Button type="submit" className="w-full" disabled={envoi}>
              {envoi ? "Connexion…" : "Rejoindre"}
            </Button>
            <Button type="button" variant="fantome" className="w-full" onClick={() => setMode("choix")}>
              Retour
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
