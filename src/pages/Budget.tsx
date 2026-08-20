import { useState } from "react";
import { useFoyer } from "@/hooks/useFoyer";
import { useDepenses, useCreateDepense, useDeleteDepense, useHistoriqueDepenses } from "@/hooks/data/useDepenses";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";

export default function Budget() {
  const { anneeActive } = useFoyer();
  const { data: depenses = [] } = useDepenses();
  const { data: historique = [] } = useHistoriqueDepenses();
  const creer = useCreateDepense();
  const supprimer = useDeleteDepense();
  const online = useOnlineStatus();

  const [ajout, setAjout] = useState(false);
  const [montant, setMontant] = useState("");
  const [description, setDescription] = useState("");
  const [afficherHistorique, setAfficherHistorique] = useState(false);

  const total = depenses.reduce((s, d) => s + Number(d.montant), 0);

  async function ajouter() {
    const m = Number(montant.replace(",", "."));
    if (!m || m < 0) return;
    await creer.mutateAsync({ montant: m, description: description || null });
    setMontant("");
    setDescription("");
    setAjout(false);
  }

  return (
    <div>
      <TopBar titre="Budget" retour />
      <div className="mx-auto max-w-md space-y-4 px-4 pb-6">
        <Card className="text-center">
          <p className="text-sm text-rentree-encre/60">Dépensé pour {anneeActive?.label ?? "cette année"}</p>
          <p className="font-title text-3xl font-extrabold">{total.toFixed(2)} €</p>
        </Card>

        {ajout ? (
          <Card className="space-y-3">
            <Input
              placeholder="Montant (€)"
              inputMode="decimal"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
            />
            <Input
              placeholder="Description (ex. Courses fournitures Carrefour)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button variant="secondaire" className="w-full" disabled title="Bientôt disponible">
              📷 Scanner un ticket (bientôt)
            </Button>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={ajouter} disabled={!online || creer.isPending}>
                Enregistrer
              </Button>
              <Button variant="fantome" onClick={() => setAjout(false)}>
                Annuler
              </Button>
            </div>
          </Card>
        ) : (
          <Button className="w-full" disabled={!online} onClick={() => setAjout(true)}>
            + Ajouter une dépense
          </Button>
        )}

        {depenses.length === 0 ? (
          <EmptyState titre="Aucune dépense enregistrée" />
        ) : (
          <Card className="divide-y divide-black/5">
            {depenses.map((d) => (
              <div key={d.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{d.description || "Dépense"}</p>
                  <p className="text-xs text-rentree-encre/50">
                    {new Date(d.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <p className="font-semibold">{Number(d.montant).toFixed(2)} €</p>
                <button
                  disabled={!online}
                  onClick={() => supprimer.mutate(d.id)}
                  className="text-rentree-encre/30 hover:text-red-500 disabled:opacity-40"
                >
                  ✕
                </button>
              </div>
            ))}
          </Card>
        )}

        <button
          onClick={() => setAfficherHistorique((v) => !v)}
          className="w-full text-center text-sm font-semibold text-rentree-encre/60 underline"
        >
          {afficherHistorique ? "Masquer" : "Voir"} l'historique par année
        </button>

        {afficherHistorique && (
          <Card className="divide-y divide-black/5">
            {historique.map((h) => (
              <div key={h.id} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                <span className={h.active ? "font-semibold" : ""}>{h.label}</span>
                <span>{h.total.toFixed(2)} €</span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
