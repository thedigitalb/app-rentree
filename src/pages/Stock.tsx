import { useMemo, useState } from "react";
import {
  useStockCommun,
  useCreateStockCommun,
  useUpdateStockCommun,
  useDeleteStockCommun,
  type StockCommunAvecDisponibilite,
} from "@/hooks/data/useStock";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { CATEGORIES_FOURNITURE } from "@/types/domain";

type Vue = "alpha" | "categorie";

export default function Stock() {
  const { data: stock = [] } = useStockCommun();
  const creer = useCreateStockCommun();
  const maj = useUpdateStockCommun();
  const supprimer = useDeleteStockCommun();
  const online = useOnlineStatus();

  const [vue, setVue] = useState<Vue>("alpha");
  const [ajout, setAjout] = useState(false);
  const [article, setArticle] = useState("");
  const [quantite, setQuantite] = useState(1);
  const [categorie, setCategorie] = useState("");

  // `stock` est déjà trié alphabétiquement par le hook — les groupes
  // héritent donc de cet ordre sans tri supplémentaire.
  const parCategorie = useMemo(() => {
    const map = new Map<string, StockCommunAvecDisponibilite[]>();
    for (const s of stock) {
      const cle = s.categorie || "Sans catégorie";
      (map.get(cle) ?? map.set(cle, []).get(cle)!).push(s);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], "fr"));
  }, [stock]);

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

        {stock.length > 0 && (
          <div className="flex gap-2 rounded-2xl bg-black/5 p-1">
            {(
              [
                ["alpha", "Alphabétique"],
                ["categorie", "Par catégorie"],
              ] as [Vue, string][]
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setVue(v)}
                className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
                  vue === v ? "bg-white shadow-sm" : "text-rentree-encre/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {stock.length === 0 ? (
          <EmptyState titre="Aucun article en stock" />
        ) : vue === "alpha" ? (
          <div className="space-y-2">
            {stock.map((s) => (
              <StockCard key={s.id} stock={s} online={online} maj={maj} supprimer={supprimer} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {parCategorie.map(([cat, items]) => (
              <div key={cat} className="space-y-2">
                <p className="font-title px-1 text-sm font-semibold text-rentree-encre/70">
                  {cat} <span className="text-xs font-normal text-rentree-encre/40">({items.length})</span>
                </p>
                <div className="space-y-2">
                  {items.map((s) => (
                    <StockCard key={s.id} stock={s} online={online} maj={maj} supprimer={supprimer} />
                  ))}
                </div>
              </div>
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
                <select
                  value={categorie}
                  onChange={(e) => setCategorie(e.target.value)}
                  className="w-full rounded-xl border-2 border-black/5 px-3 py-2 text-sm"
                >
                  <option value="">Sans catégorie</option>
                  {CATEGORIES_FOURNITURE.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
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

function StockCard({
  stock: s,
  online,
  maj,
  supprimer,
}: {
  stock: StockCommunAvecDisponibilite;
  online: boolean;
  maj: ReturnType<typeof useUpdateStockCommun>;
  supprimer: ReturnType<typeof useDeleteStockCommun>;
}) {
  const [detailOuvert, setDetailOuvert] = useState(false);

  function ajusterQuantite(delta: number) {
    maj.mutate({ id: s.id, quantite_totale: Math.max(0, s.quantite_totale + delta) });
  }

  return (
    <Card className="space-y-2">
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
      <div className="flex flex-wrap items-center gap-2">
        <select
          disabled={!online}
          defaultValue={s.categorie ?? ""}
          onChange={(e) => maj.mutate({ id: s.id, categorie: e.target.value || null })}
          className="min-w-0 flex-1 rounded-lg border border-black/10 px-2 py-1 text-sm disabled:opacity-40"
        >
          <option value="">Sans catégorie</option>
          {CATEGORIES_FOURNITURE.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            disabled={!online || s.quantite_totale <= 0}
            onClick={() => ajusterQuantite(-1)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/5 text-base font-bold text-rentree-encre transition hover:bg-black/10 disabled:opacity-30"
          >
            −
          </button>
          <input
            key={s.quantite_totale}
            type="number"
            min={0}
            disabled={!online}
            defaultValue={s.quantite_totale}
            onBlur={(e) => maj.mutate({ id: s.id, quantite_totale: Number(e.target.value) })}
            className="w-12 shrink-0 rounded-lg border border-black/10 px-1 py-1 text-center text-sm disabled:opacity-40"
          />
          <button
            type="button"
            disabled={!online}
            onClick={() => ajusterQuantite(1)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/5 text-base font-bold text-rentree-encre transition hover:bg-black/10 disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>
      {s.utilise > 0 && (
        <div>
          <button
            onClick={() => setDetailOuvert((v) => !v)}
            className="text-left text-xs text-rentree-encre/60 underline decoration-dotted"
          >
            <span className="font-semibold text-rentree-encre no-underline">{s.disponible} disponible(s)</span> —{" "}
            {s.utilise} déjà pris {detailOuvert ? "▲" : "▼ (voir par qui)"}
          </button>
          {detailOuvert && (
            <ul className="mt-1.5 space-y-1 rounded-lg bg-black/5 p-2 text-xs text-rentree-encre/70">
              {s.utilisations.map((u, i) => (
                <li key={i} className="flex items-center justify-between gap-2">
                  <span>
                    {u.enfantEmoji} {u.enfantNom} — {u.item}
                  </span>
                  <span className="shrink-0 font-semibold">× {u.qte}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <input
        disabled={!online}
        placeholder="Notes (optionnel)"
        defaultValue={s.notes ?? ""}
        onBlur={(e) => maj.mutate({ id: s.id, notes: e.target.value || null })}
        className="w-full rounded-lg border border-black/10 px-2 py-1 text-xs text-rentree-encre/70 disabled:opacity-40"
      />
    </Card>
  );
}
