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

interface LigneConsolidee {
  cle: string;
  item: string;
  qteTotal: number;
  lignes: FournitureAAcheter[];
  enfants: { nom: string; emoji: string; qte: number }[];
  couleurs: { couleur: string; nom: string }[];
  notes: string[];
}

/**
 * Regroupe les lignes de fournitures identiques (même nom d'article) en une
 * seule ligne avec la quantité totale à acheter — au magasin, pas de "12
 * lignes" pour "12 cahiers", une seule ligne avec × 12.
 */
function consolider(items: FournitureAAcheter[]): LigneConsolidee[] {
  const map = new Map<string, LigneConsolidee>();

  for (const it of items) {
    const cle = it.item.trim().toLowerCase();
    const restant = qteAAcheter(it);
    let ligne = map.get(cle);
    if (!ligne) {
      ligne = { cle, item: it.item, qteTotal: 0, lignes: [], enfants: [], couleurs: [], notes: [] };
      map.set(cle, ligne);
    }
    ligne.qteTotal += restant;
    ligne.lignes.push(it);

    if (it.family_members) {
      const existant = ligne.enfants.find((e) => e.nom === it.family_members!.nom);
      if (existant) existant.qte += restant;
      else ligne.enfants.push({ nom: it.family_members.nom, emoji: it.family_members.emoji, qte: restant });
    }

    if (it.matieres?.couleur && !ligne.couleurs.some((c) => c.couleur === it.matieres!.couleur)) {
      ligne.couleurs.push({ couleur: it.matieres.couleur, nom: it.matieres.nom });
    }

    if (it.notes && !ligne.notes.includes(it.notes)) {
      ligne.notes.push(it.notes);
    }
  }

  return Array.from(map.values()).sort((a, b) => a.item.localeCompare(b.item, "fr"));
}

export default function AAcheter() {
  const { data: items = [] } = useFournituresAAcheter();
  const online = useOnlineStatus();
  const [copie, setCopie] = useState(false);
  const [vue, setVue] = useState<Vue>("tout");

  const consolideTout = useMemo(() => consolider(items), [items]);

  const parCategorie = useMemo(() => {
    const groupes = grouper(items, (i) => i.categorie || "Sans catégorie");
    return groupes.map(([nom, lignes]) => [nom, consolider(lignes)] as [string, LigneConsolidee[]]);
  }, [items]);

  const parEnfant = useMemo(() => {
    const groupes = grouper(items, (i) => i.family_members?.nom ?? "Non attribué");
    return groupes.map(
      ([nom, lignes]) => [nom, lignes[0]?.family_members?.emoji, consolider(lignes)] as [string, string | undefined, LigneConsolidee[]]
    );
  }, [items]);

  async function copierListe() {
    const texte = consolideTout.map((l) => `- ${l.item} × ${l.qteTotal}`).join("\n");
    await navigator.clipboard.writeText(texte);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  }

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
                {consolideTout.map((l) => (
                  <LigneAAcheter key={l.cle} ligne={l} online={online} afficherEnfants />
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
                    {lignes.map((l) => (
                      <LigneAAcheter key={l.cle} ligne={l} online={online} afficherEnfants />
                    ))}
                  </div>
                </Card>
              ))}

            {vue === "enfant" &&
              parEnfant.map(([nom, emoji, lignes]) => (
                <Card key={nom}>
                  <p className="font-title mb-2 flex items-center gap-1.5 font-semibold">
                    {emoji} {nom} <span className="text-xs font-normal text-rentree-encre/50">({lignes.length})</span>
                  </p>
                  <div className="divide-y divide-black/5">
                    {lignes.map((l) => (
                      <LigneAAcheter key={l.cle} ligne={l} online={online} />
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
  ligne,
  online,
  afficherEnfants,
}: {
  ligne: LigneConsolidee;
  online: boolean;
  afficherEnfants?: boolean;
}) {
  const marquerAchete = useMarquerAchete();

  /** Coche toutes les lignes sous-jacentes (peut concerner plusieurs enfants). */
  function toggleTout(achete: boolean) {
    for (const l of ligne.lignes) {
      marquerAchete.mutate({
        id: l.id,
        familyMemberId: l.family_member_id,
        qteDemandee: l.qte_demandee,
        achete,
      });
    }
  }

  return (
    <label className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <input
        type="checkbox"
        disabled={!online}
        onChange={(e) => toggleTout(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 accent-[#D9B3FF] disabled:opacity-40"
      />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 font-medium">
          {ligne.couleurs.map((c) => (
            <span
              key={c.couleur}
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: c.couleur }}
              title={`Cahier ${c.nom}`}
            />
          ))}
          {ligne.item}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-rentree-encre/60">
          <span className="rounded-full bg-orange-200 px-2 py-0.5 font-semibold text-orange-800">
            × {ligne.qteTotal}
          </span>
          {afficherEnfants &&
            ligne.enfants.map((e) => (
              <span key={e.nom}>
                {e.emoji} {e.nom}
                {ligne.enfants.length > 1 ? ` (${e.qte})` : ""}
              </span>
            ))}
        </div>
        {ligne.notes.length > 0 && (
          <p className="mt-0.5 text-xs italic text-rentree-encre/50">{ligne.notes.join(" · ")}</p>
        )}
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
