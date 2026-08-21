import { useMemo, useState } from "react";
import {
  useStockCommun,
  useCreateStockCommun,
  useUpdateStockCommun,
  useDeleteStockCommun,
} from "@/hooks/data/useStock";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";

export default function Stock() {
  const { data: stock = [] } = useStockCommun();
  const creer = useCreateStockCommun();
  const maj = useUpdateStockCommun();
  const supprimer = useDeleteStockCommun();
  const online = useOnlineStatus();

  const [filtre, setFiltre] = useState<string>("Toutes");
  const [ajout, setAjout] = useState(false);
  const [article, setArticle] = useState("");
  const [quantite, setQuantite] = useState(1);
  const [categorie, setCategorie] = useState("");

  const categories = useMemo(
    () => ["Toutes", ...Array.from(new Set(stock.map((s) => s.categorie).filter(Boolean) as string[]))],
    [stock]
  );

  const filtres = filtre === "Toutes" ? stock : stock.filter((s) => s.categorie === filtre);

  async function ajouter() {
    if (!article.trim()) return;
    await creer.mutateAsync({ article, quantiteTotale: quantite, categorie: categorie || null });
    setArticle("");
    setQuantite(1);
    setCategorie("");
    setAjout(false);
  }

  return (
    <div>
      <TopBar titre="Stock commun" retour />
      <div className="mx-auto max-w-md space-y-4 px-4 pb-6">
        <p className="text-sm text-rentree-encre/60">
          Consommables achetés en gros, non attribués à un enfant — juste pour éviter les doublons
          d'achat.
        </p>

        {categories.length > 2 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFiltre(c)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  filtre === c ? "bg-rentree-violet" : "bg-black/5 text-rentree-encre/60"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {filtres.length === 0 ? (
          <EmptyState titre="Aucun article en stock" />
        ) : (
          <div className="space-y-2">
            {filtres.map((s) => (
              <Card key={s.id} className="space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    disabled={!online}
                    defaultValue={s.article}
                    onBlur={(e) => {
                      const valeur = e.target.value.trim();
                      if (valeur && valeur !== s.article) maj.mutate({ id: s.id, article: valeur });
                    }}
                    className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-1 py-0.5 font-medium focus:border-black/10 focus:bg-white disabled:opacity-40"
                  />
                  <button
                    disabled={!online}
                    onClick={() => supprimer.mutate(s.id)}
                    className="shrink-0 text-rentree-encre/30 hover:text-red-500 disabled:opacity-40"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    disabled={!online}
                    placeholder="Catégorie"
                    defaultValue={s.categorie ?? ""}
                    onBlur={(e) => maj.mutate({ id: s.id, categorie: e.target.value || null })}
                    className="min-w-0 flex-1 rounded-lg border border-black/10 px-2 py-1 text-sm disabled:opacity-40"
                  />
                  <input
                    type="number"
                    min={0}
                    disabled={!online}
                    defaultValue={s.quantite_totale}
                    onBlur={(e) => maj.mutate({ id: s.id, quantite_totale: Number(e.target.value) })}
                    className="w-16 shrink-0 rounded-lg border border-black/10 px-2 py-1 text-center text-sm disabled:opacity-40"
                  />
                </div>
                {s.utilise > 0 && (
                  <p className="text-xs text-rentree-encre/60">
                    <span className="font-semibold text-rentree-encre">{s.disponible} disponible(s)</span> — {s.utilise}{" "}
                    déjà pris pour des fournitures "en stock"
                  </p>
                )}
                <input
                  disabled={!online}
                  placeholder="Notes (optionnel)"
                  defaultValue={s.notes ?? ""}
                  onBlur={(e) => maj.mutate({ id: s.id, notes: e.target.value || null })}
                  className="w-full rounded-lg border border-black/10 px-2 py-1 text-xs text-rentree-encre/70 disabled:opacity-40"
                />
              </Card>
            ))}
          </div>
        )}

        {ajout ? (
          <Card className="space-y-3">
            <Input placeholder="Article (ex. Bâtons de colle)" value={article} onChange={(e) => setArticle(e.target.value)} />
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-rentree-encre/60">Quantité</label>
                <input
                  type="number"
                  min={0}
                  value={quantite}
                  onChange={(e) => setQuantite(Number(e.target.value))}
                  className="w-full rounded-xl border-2 border-black/5 px-3 py-2"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-rentree-encre/60">Catégorie</label>
                <Input value={categorie} onChange={(e) => setCategorie(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={ajouter} disabled={!online || creer.isPending}>
                Ajouter
              </Button>
              <Button variant="fantome" onClick={() => setAjout(false)}>
                Annuler
              </Button>
            </div>
          </Card>
        ) : (
          <Button variant="secondaire" className="w-full" disabled={!online} onClick={() => setAjout(true)}>
            + Ajouter un article
          </Button>
        )}
      </div>
    </div>
  );
}
