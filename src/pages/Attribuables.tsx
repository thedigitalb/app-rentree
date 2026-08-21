import { useState } from "react";
import {
  useArticlesAttribuables,
  useCreateArticleAttribuable,
  useUpdateArticleAttribuable,
  useDeleteArticleAttribuable,
  useUpsertAllocation,
  useDeleteAllocation,
  type ArticleAvecAllocations,
} from "@/hooks/data/useAttribuables";
import { useFamilyMembers } from "@/hooks/data/useFamilyMembers";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { CATEGORIES_FOURNITURE, type FamilyMember } from "@/types/domain";

export default function Attribuables() {
  const { data: articles = [] } = useArticlesAttribuables();
  const { data: enfants = [] } = useFamilyMembers();
  const creer = useCreateArticleAttribuable();
  const online = useOnlineStatus();

  const [ajout, setAjout] = useState(false);
  const [article, setArticle] = useState("");
  const [quantite, setQuantite] = useState(1);
  const [categorie, setCategorie] = useState("");

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
      <TopBar titre="Objets attribuables" retour />
      <div className="mx-auto max-w-md space-y-4 px-4 pb-6">
        <p className="text-sm text-rentree-encre/60">
          Objets à répartir entre les enfants (classeurs, ciseaux, trousses…) pour préparer les
          cartables.
        </p>

        {articles.length === 0 ? (
          <EmptyState titre="Aucun objet attribuable" />
        ) : (
          <div className="space-y-3">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} enfants={enfants} online={online} />
            ))}
          </div>
        )}

        {ajout ? (
          <Card className="space-y-3">
            <Input placeholder="Article (ex. Classeur 4 anneaux)" value={article} onChange={(e) => setArticle(e.target.value)} />
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-rentree-encre/60">Quantité totale</label>
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
            + Ajouter un objet attribuable
          </Button>
        )}
      </div>
    </div>
  );
}

function ArticleCard({
  article,
  enfants,
  online,
}: {
  article: ArticleAvecAllocations;
  enfants: FamilyMember[];
  online: boolean;
}) {
  const upsert = useUpsertAllocation();
  const supprimerAllocation = useDeleteAllocation();
  const supprimerArticle = useDeleteArticleAttribuable();
  const majArticle = useUpdateArticleAttribuable();
  const [erreur, setErreur] = useState<string | null>(null);
  const [erreurQuantite, setErreurQuantite] = useState<string | null>(null);
  const [ajoutAlloc, setAjoutAlloc] = useState(false);
  const [enfantId, setEnfantId] = useState("");
  const [quantite, setQuantite] = useState(1);

  const totalAlloue = article.allocations.reduce((s, a) => s + a.quantite, 0);
  const nonAttribue = article.quantite_totale - totalAlloue;

  async function attribuer() {
    if (!enfantId) return;
    setErreur(null);
    try {
      await upsert.mutateAsync({
        articleAttribuableId: article.id,
        familyMemberId: enfantId,
        quantite,
      });
      setAjoutAlloc(false);
      setEnfantId("");
      setQuantite(1);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Allocation refusée.");
    }
  }

  async function changerQuantiteTotale(valeur: number) {
    setErreurQuantite(null);
    try {
      await majArticle.mutateAsync({ id: article.id, quantite_totale: valeur });
    } catch (err) {
      setErreurQuantite(err instanceof Error ? err.message : "Modification refusée.");
    }
  }

  return (
    <Card className="space-y-2">
      <div className="flex items-start gap-2">
        <input
          disabled={!online}
          defaultValue={article.article}
          onBlur={(e) => {
            const valeur = e.target.value.trim();
            if (valeur && valeur !== article.article) majArticle.mutate({ id: article.id, article: valeur });
          }}
          className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-1 py-0.5 font-title font-semibold focus:border-black/10 focus:bg-white disabled:opacity-40"
        />
        <button
          disabled={!online}
          onClick={() => supprimerArticle.mutate(article.id)}
          className="shrink-0 text-rentree-encre/30 hover:text-red-500 disabled:opacity-40"
        >
          ✕
        </button>
      </div>

      <div className="flex gap-2">
        <select
          disabled={!online}
          defaultValue={article.categorie ?? ""}
          onChange={(e) => majArticle.mutate({ id: article.id, categorie: e.target.value || null })}
          className="min-w-0 flex-1 rounded-lg border border-black/10 px-2 py-1 text-sm disabled:opacity-40"
        >
          <option value="">Sans catégorie</option>
          {CATEGORIES_FOURNITURE.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={0}
          disabled={!online}
          defaultValue={article.quantite_totale}
          onBlur={(e) => changerQuantiteTotale(Number(e.target.value))}
          className="w-16 shrink-0 rounded-lg border border-black/10 px-2 py-1 text-center text-sm disabled:opacity-40"
        />
      </div>

      <p className="text-xs text-rentree-encre/60">
        {totalAlloue} / {article.quantite_totale} attribué(s) — {nonAttribue} non attribué(s)
      </p>
      {erreurQuantite && <p className="text-xs font-medium text-red-600">{erreurQuantite}</p>}

      <input
        disabled={!online}
        placeholder="Notes (optionnel)"
        defaultValue={article.notes ?? ""}
        onBlur={(e) => majArticle.mutate({ id: article.id, notes: e.target.value || null })}
        className="w-full rounded-lg border border-black/10 px-2 py-1 text-xs text-rentree-encre/70 disabled:opacity-40"
      />

      {article.allocations.length > 0 && (
        <ul className="mb-2 space-y-1.5 text-sm">
          {article.allocations.map((alloc) => {
            const enfant = enfants.find((e) => e.id === alloc.family_member_id);
            return (
              <li key={alloc.id} className="flex items-center justify-between">
                <span>
                  {enfant ? `${enfant.emoji} ${enfant.nom}` : "Non attribué"}
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold">× {alloc.quantite}</span>
                  <button
                    disabled={!online}
                    onClick={() => supprimerAllocation.mutate(alloc.id)}
                    className="text-rentree-encre/30 hover:text-red-500 disabled:opacity-40"
                  >
                    ✕
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {ajoutAlloc ? (
        <div className="space-y-2 rounded-2xl bg-black/5 p-3">
          <select
            value={enfantId}
            onChange={(e) => setEnfantId(e.target.value)}
            className="w-full rounded-xl border-2 border-black/5 px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Choisir un enfant
            </option>
            {enfants.map((e) => (
              <option key={e.id} value={e.id}>
                {e.emoji} {e.nom}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            value={quantite}
            onChange={(e) => setQuantite(Number(e.target.value))}
            className="w-full rounded-xl border-2 border-black/5 px-3 py-2 text-sm"
          />
          {erreur && <p className="text-xs font-medium text-red-600">{erreur}</p>}
          <div className="flex gap-2">
            <Button className="flex-1" onClick={attribuer} disabled={!online}>
              Attribuer
            </Button>
            <Button variant="fantome" onClick={() => setAjoutAlloc(false)}>
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="secondaire"
          className="w-full"
          disabled={!online || nonAttribue <= 0}
          onClick={() => setAjoutAlloc(true)}
        >
          + Attribuer
        </Button>
      )}
    </Card>
  );
}
