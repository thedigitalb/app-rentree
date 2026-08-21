import { useMemo, useState } from "react";
import {
  useFournituresAAcheter,
  useMarquerAchete,
  qteAAcheter,
  type FournitureAAcheter,
} from "@/hooks/data/useFournitures";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

type Vue = "tout" | "categorie" | "enfant";

export default function AAcheter() {
  const { data: items = [] } = useFournituresAAcheter();
  const online = useOnlineStatus();
  const [copie, setCopie] = useState(false);
  const [vue, setVue] = useState<Vue>("tout");

  async function copierListe() {
    const texte = items
      .map((i) => `- ${i.item} × ${qteAAcheter(i)}${i.family_members ? ` (${i.family_members.nom})` : ""}`)
      .join("\n");
    await navigator.clipboard.writeText(texte);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  }

  const parCategorie = useMemo(() => grouper(items, (i) => i.categorie || "Sans catégorie"), [items]);
  const parEnfant = useMemo(
    () => grouper(items, (i) => i.family_members?.nom ?? "Non attribué"),
    [items]
  );

  return (
    <div>
      <TopBar titre="À acheter" retour />
      <div className="mx-auto max-w-md space-y-4 px-4 pb-6">
        {items.length === 0 ? (
          <EmptyState titre="Rien à acheter !" description="Toutes les fournitures sont couvertes. 🎉" />
        ) : (
          <>
            <Button variant="secondaire" className="w-full" onClick={copierListe}>
              {copie ? "Copié ✓" : "📋 Copier en liste de courses"}
            </Button>

            <div className="flex gap-2 rounded-2xl bg-black/5 p-1">
              {(
                [
                  ["tout", "Tout"],
                  ["categorie", "Par catégorie"],
                  ["enfant", "Par enfant"],
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

            {vue === "tout" && (
              <Card className="divide-y divide-black/5">
                {items.map((i) => (
                  <LigneAAcheter key={i.id} item={i} online={online} afficherEnfant afficherCategorie />
                ))}
              </Card>
            )}

            {vue === "categorie" &&
              parCategorie.map(([categorie, lignes]) => (
                <Card key={categorie}>
                  <p className="font-title mb-2 font-semibold">
                    {categorie} <span className="text-xs font-normal text-rentree-encre/50">({lignes.length})</span>
                  </p>
                  <div className="divide-y divide-black/5">
                    {lignes.map((i) => (
                      <LigneAAcheter key={i.id} item={i} online={online} afficherEnfant />
                    ))}
                  </div>
                </Card>
              ))}

            {vue === "enfant" &&
              parEnfant.map(([nom, lignes]) => (
                <Card key={nom}>
                  <p className="font-title mb-2 flex items-center gap-1.5 font-semibold">
                    {lignes[0].family_members?.emoji} {nom}{" "}
                    <span className="text-xs font-normal text-rentree-encre/50">({lignes.length})</span>
                  </p>
                  <div className="divide-y divide-black/5">
                    {lignes.map((i) => (
                      <LigneAAcheter key={i.id} item={i} online={online} afficherCategorie />
                    ))}
                  </div>
                </Card>
              ))}
          </>
        )}
      </div>
    </div>
  );
}

function LigneAAcheter({
  item,
  online,
  afficherEnfant,
  afficherCategorie,
}: {
  item: FournitureAAcheter;
  online: boolean;
  afficherEnfant?: boolean;
  afficherCategorie?: boolean;
}) {
  const marquerAchete = useMarquerAchete();

  return (
    <label className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <input
        type="checkbox"
        disabled={!online}
        onChange={(e) =>
          marquerAchete.mutate({
            id: item.id,
            familyMemberId: item.family_member_id,
            qteDemandee: item.qte_demandee,
            achete: e.target.checked,
          })
        }
        className="mt-0.5 h-5 w-5 shrink-0 accent-[#D9B3FF] disabled:opacity-40"
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{item.item}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-rentree-encre/60">
          <span className="rounded-full bg-orange-200 px-2 py-0.5 font-semibold text-orange-800">
            × {qteAAcheter(item)}
          </span>
          {afficherEnfant && item.family_members && (
            <span>
              {item.family_members.emoji} {item.family_members.nom}
            </span>
          )}
          <span>· {item.section}</span>
          {afficherCategorie && item.categorie && <span>· {item.categorie}</span>}
        </div>
        {item.notes && <p className="mt-0.5 text-xs italic text-rentree-encre/50">{item.notes}</p>}
      </div>
    </label>
  );
}

function grouper<T>(items: T[], cle: (item: T) => string): [string, T[]][] {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = cle(item);
    (map.get(k) ?? map.set(k, []).get(k)!).push(item);
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], "fr"));
}
