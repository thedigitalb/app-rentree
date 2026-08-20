import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useFoyer } from "@/hooks/useFoyer";
import { useFamilyMembers } from "@/hooks/data/useFamilyMembers";
import { matieresParDefaut, trousseParDefaut, NIVEAUX_GROUPES } from "@/utils/defautsParNiveau";
import { COULEURS_ENFANT, EMOJIS_ENFANT } from "@/types/domain";
import { HB } from "@/components/HB";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { useQueryClient } from "@tanstack/react-query";

export default function OnboardingEnfants() {
  const navigate = useNavigate();
  const { foyer, anneeActive } = useFoyer();
  const { data: enfants = [] } = useFamilyMembers();
  const queryClient = useQueryClient();

  const [nom, setNom] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [niveau, setNiveau] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS_ENFANT[0]);
  const [couleur, setCouleur] = useState(COULEURS_ENFANT[0]);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function ajouterEnfant(e: FormEvent) {
    e.preventDefault();
    if (!foyer || !anneeActive || !niveau) return;
    setErreur(null);
    setEnvoi(true);
    try {
      const { data: enfant, error } = await supabase
        .from("family_members")
        .insert({
          foyer_id: foyer.id,
          nom,
          date_naissance: dateNaissance || null,
          niveau,
          emoji,
          couleur,
        })
        .select("*")
        .single();
      if (error) throw error;

      const matieres = matieresParDefaut(niveau).map((m) => ({
        foyer_id: foyer.id,
        annee_scolaire_id: anneeActive.id,
        family_member_id: enfant.id,
        nom: m.nom,
        active: m.active,
      }));
      if (matieres.length > 0) {
        const { error: erreurMatieres } = await supabase.from("matieres").insert(matieres);
        if (erreurMatieres) throw erreurMatieres;
      }

      const trousse = trousseParDefaut().map((item, index) => ({
        foyer_id: foyer.id,
        annee_scolaire_id: anneeActive.id,
        family_member_id: enfant.id,
        item,
        checked: false,
        ordre: index,
      }));
      if (trousse.length > 0) {
        const { error: erreurTrousse } = await supabase.from("trousse_check_items").insert(trousse);
        if (erreurTrousse) throw erreurTrousse;
      }

      queryClient.invalidateQueries({ queryKey: ["family-members", foyer.id] });
      setNom("");
      setDateNaissance("");
      setNiveau("");
      setEmoji(EMOJIS_ENFANT[(enfants.length + 1) % EMOJIS_ENFANT.length]);
      setCouleur(COULEURS_ENFANT[(enfants.length + 1) % COULEURS_ENFANT.length]);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Impossible d'ajouter cet enfant.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="min-h-dvh bg-rentree-creme px-6 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 text-center">
        <HB humeur="neutre" taille={90} />
        <h1 className="font-title text-2xl font-bold">Qui prépare sa rentrée ?</h1>
        <p className="max-w-xs text-rentree-encre/70">
          Ajoutez vos enfants un par un. Matières et trousse se pré-remplissent automatiquement
          selon leur niveau — modifiables ensuite à tout moment.
        </p>

        {enfants.length > 0 && (
          <ul className="w-full space-y-2 text-left">
            {enfants.map((enfant) => (
              <li
                key={enfant.id}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm"
                style={{ borderLeft: `6px solid ${enfant.couleur}` }}
              >
                <span className="text-2xl">{enfant.emoji}</span>
                <div>
                  <p className="font-semibold">{enfant.nom}</p>
                  <p className="text-xs text-rentree-encre/60">{enfant.niveau}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={ajouterEnfant} className="w-full space-y-4 rounded-3xl bg-white p-5 text-left">
          <div>
            <Label>Prénom</Label>
            <Input required value={nom} onChange={(e) => setNom(e.target.value)} />
          </div>
          <div>
            <Label>Date de naissance (optionnel)</Label>
            <Input
              type="date"
              value={dateNaissance}
              onChange={(e) => setDateNaissance(e.target.value)}
            />
          </div>
          <div>
            <Label>Niveau</Label>
            <select
              required
              value={niveau}
              onChange={(e) => setNiveau(e.target.value)}
              className="w-full rounded-2xl border-2 border-black/5 bg-white px-4 py-3 outline-none focus:border-rentree-violet"
            >
              <option value="" disabled>
                Choisir un niveau
              </option>
              {NIVEAUX_GROUPES.map((groupe) => (
                <optgroup key={groupe.label} label={groupe.label}>
                  {groupe.niveaux.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <Label>Emoji</Label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS_ENFANT.map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`grid h-10 w-10 place-items-center rounded-xl text-xl transition ${
                    emoji === e ? "bg-rentree-violet" : "bg-black/5"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Couleur</Label>
            <div className="flex flex-wrap gap-2">
              {COULEURS_ENFANT.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCouleur(c)}
                  className={`h-10 w-10 rounded-xl transition ${
                    couleur === c ? "ring-4 ring-rentree-encre/30" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          {erreur && <p className="text-sm font-medium text-red-600">{erreur}</p>}
          <Button type="submit" className="w-full" disabled={envoi}>
            {envoi ? "Ajout…" : "+ Ajouter cet enfant"}
          </Button>
        </form>

        <Button
          className="w-full"
          disabled={enfants.length === 0}
          onClick={() => navigate("/onboarding/import")}
        >
          Continuer{enfants.length === 0 ? " (ajoutez au moins un enfant)" : ""}
        </Button>
      </div>
    </div>
  );
}
