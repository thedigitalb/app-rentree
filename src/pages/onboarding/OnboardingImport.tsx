import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useFoyer } from "@/hooks/useFoyer";
import { useFamilyMembers } from "@/hooks/data/useFamilyMembers";
import { parseDonneesDepartJSON, type DonneesDepartJSON } from "@/utils/exportImport";
import { matieresParDefaut, trousseParDefaut, NIVEAUX_GROUPES } from "@/utils/defautsParNiveau";
import { HB } from "@/components/HB";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";

type Correspondance = "nouveau" | "ignorer" | string; // string = id d'un enfant existant

export default function OnboardingImport() {
  const navigate = useNavigate();
  const { foyer, anneeActive } = useFoyer();
  const { data: enfantsExistants = [] } = useFamilyMembers();

  const [texte, setTexte] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [donnees, setDonnees] = useState<DonneesDepartJSON | null>(null);
  const [correspondances, setCorrespondances] = useState<Correspondance[]>([]);
  const [niveauxChoisis, setNiveauxChoisis] = useState<string[]>([]);
  const [envoi, setEnvoi] = useState(false);

  function analyser() {
    setErreur(null);
    try {
      const parsed = parseDonneesDepartJSON(texte);
      const enfants = parsed.enfants ?? [];

      // pré-sélection : correspondance exacte (insensible à la casse) et non déjà utilisée
      const utilises = new Set<string>();
      const auto = enfants.map((e) => {
        const match = enfantsExistants.find(
          (ex) => ex.nom.trim().toLowerCase() === e.nom.trim().toLowerCase() && !utilises.has(ex.id)
        );
        if (match) {
          utilises.add(match.id);
          return match.id;
        }
        return "nouveau" as Correspondance;
      });

      setDonnees(parsed);
      setCorrespondances(auto);
      setNiveauxChoisis(enfants.map((e) => e.niveau ?? ""));
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "JSON invalide.");
    }
  }

  async function onFichier(fichier: File) {
    const contenu = await fichier.text();
    setTexte(contenu);
  }

  async function confirmer() {
    if (!donnees || !foyer || !anneeActive) return;
    setErreur(null);
    setEnvoi(true);
    try {
      const enfants = donnees.enfants ?? [];
      for (let i = 0; i < enfants.length; i++) {
        const choix = correspondances[i];
        if (choix === "ignorer" || (choix !== "nouveau" && choix)) continue;

        const e = enfants[i];
        const niveau = niveauxChoisis[i];
        if (!niveau) throw new Error(`Choisissez un niveau pour "${e.nom}".`);

        const { data: enfant, error } = await supabase
          .from("family_members")
          .insert({
            foyer_id: foyer.id,
            nom: e.nom,
            date_naissance: e.dateNaissance || null,
            niveau,
            emoji: e.emoji || "🧒",
            couleur: e.couleur || "#FFB3D9",
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
        if (matieres.length > 0) await supabase.from("matieres").insert(matieres);

        const trousse = trousseParDefaut().map((item, index) => ({
          foyer_id: foyer.id,
          annee_scolaire_id: anneeActive.id,
          family_member_id: enfant.id,
          item,
          checked: false,
          ordre: index,
        }));
        if (trousse.length > 0) await supabase.from("trousse_check_items").insert(trousse);
      }

      const stock = donnees.stockCommun ?? [];
      if (stock.length > 0) {
        await supabase.from("stock_commun").insert(
          stock.map((s) => ({
            foyer_id: foyer.id,
            annee_scolaire_id: anneeActive.id,
            article: s.article,
            quantite_totale: s.quantiteTotale,
            categorie: s.categorie ?? null,
          }))
        );
      }

      const attribuables = donnees.articlesAttribuables ?? [];
      if (attribuables.length > 0) {
        await supabase.from("articles_attribuables").insert(
          attribuables.map((a) => ({
            foyer_id: foyer.id,
            annee_scolaire_id: anneeActive.id,
            article: a.article,
            quantite_totale: a.quantiteTotale,
            categorie: a.categorie ?? null,
          }))
        );
      }

      navigate("/onboarding/celebration");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Import impossible.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="min-h-dvh bg-rentree-creme px-6 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 text-center">
        <HB humeur="neutre" taille={90} />
        <h1 className="font-title text-2xl font-bold">Un fichier de départ ?</h1>
        <p className="max-w-xs text-rentree-encre/70">
          Optionnel, une seule fois : collez ou importez un JSON pour préremplir le stock commun,
          les objets attribuables ou des enfants supplémentaires.
        </p>

        {!donnees && (
          <div className="w-full space-y-3 rounded-3xl bg-white p-5 text-left">
            <input
              type="file"
              accept="application/json"
              onChange={(e) => e.target.files?.[0] && onFichier(e.target.files[0])}
              className="text-sm"
            />
            <Textarea
              rows={6}
              placeholder='{"enfants": [{"nom": "Léa", "niveau": "CE2"}]}'
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
            />
            {erreur && <p className="text-sm font-medium text-red-600">{erreur}</p>}
            <Button variant="secondaire" className="w-full" onClick={analyser} disabled={!texte.trim()}>
              Analyser le fichier
            </Button>
          </div>
        )}

        {donnees && (
          <div className="w-full space-y-4 text-left">
            {(donnees.enfants ?? []).length > 0 && (
              <div className="rounded-3xl bg-white p-5">
                <h2 className="font-title mb-3 font-semibold">Enfants détectés</h2>
                <p className="mb-3 text-xs text-rentree-encre/60">
                  Choisissez pour chaque ligne : créer un nouvel enfant, l'associer à un enfant déjà
                  ajouté, ou l'ignorer.
                </p>
                <div className="space-y-3">
                  {(donnees.enfants ?? []).map((e, i) => (
                    <div key={i} className="rounded-2xl border border-black/5 p-3">
                      <p className="font-semibold">{e.nom}</p>
                      <select
                        className="mt-2 w-full rounded-xl border-2 border-black/5 px-3 py-2 text-sm"
                        value={correspondances[i]}
                        onChange={(ev) =>
                          setCorrespondances((prev) =>
                            prev.map((c, idx) => (idx === i ? ev.target.value : c))
                          )
                        }
                      >
                        <option value="nouveau">➕ Nouvel enfant</option>
                        <option value="ignorer">Ignorer cette ligne</option>
                        {enfantsExistants.map((ex) => (
                          <option key={ex.id} value={ex.id}>
                            = {ex.nom} (déjà ajouté(e))
                          </option>
                        ))}
                      </select>
                      {correspondances[i] === "nouveau" && (
                        <select
                          className="mt-2 w-full rounded-xl border-2 border-black/5 px-3 py-2 text-sm"
                          value={niveauxChoisis[i] ?? ""}
                          onChange={(ev) =>
                            setNiveauxChoisis((prev) =>
                              prev.map((n, idx) => (idx === i ? ev.target.value : n))
                            )
                          }
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
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(donnees.stockCommun ?? []).length > 0 && (
              <div className="rounded-3xl bg-white p-5">
                <h2 className="font-title mb-2 font-semibold">Stock commun ({donnees.stockCommun!.length})</h2>
                <ul className="text-sm text-rentree-encre/70">
                  {donnees.stockCommun!.map((s, i) => (
                    <li key={i}>
                      {s.article} — {s.quantiteTotale}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(donnees.articlesAttribuables ?? []).length > 0 && (
              <div className="rounded-3xl bg-white p-5">
                <h2 className="font-title mb-2 font-semibold">
                  Objets attribuables ({donnees.articlesAttribuables!.length})
                </h2>
                <ul className="text-sm text-rentree-encre/70">
                  {donnees.articlesAttribuables!.map((a, i) => (
                    <li key={i}>
                      {a.article} — {a.quantiteTotale}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {erreur && <p className="text-sm font-medium text-red-600">{erreur}</p>}
            <Button className="w-full" onClick={confirmer} disabled={envoi}>
              {envoi ? "Import…" : "Confirmer l'import"}
            </Button>
            <Button variant="fantome" className="w-full" onClick={() => setDonnees(null)}>
              Revenir en arrière
            </Button>
          </div>
        )}

        <Button variant="fantome" className="w-full" onClick={() => navigate("/onboarding/celebration")}>
          Passer cette étape
        </Button>
      </div>
    </div>
  );
}
