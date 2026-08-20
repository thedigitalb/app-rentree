import { useState } from "react";
import { useFournituresAAcheter, useMarquerAchete, qteAAcheter } from "@/hooks/data/useFournitures";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AAcheter() {
  const { data: items = [] } = useFournituresAAcheter();
  const marquerAchete = useMarquerAchete();
  const online = useOnlineStatus();
  const [copie, setCopie] = useState(false);

  async function copierListe() {
    const texte = items
      .map((i) => `- ${i.item} × ${qteAAcheter(i)}${i.family_members ? ` (${i.family_members.nom})` : ""}`)
      .join("\n");
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
            <Card className="divide-y divide-black/5">
              {items.map((i) => (
                <label key={i.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <input
                    type="checkbox"
                    disabled={!online}
                    onChange={(e) =>
                      marquerAchete.mutate({
                        id: i.id,
                        familyMemberId: i.family_member_id,
                        qteDemandee: i.qte_demandee,
                        achete: e.target.checked,
                      })
                    }
                    className="h-5 w-5 shrink-0 accent-[#D9B3FF] disabled:opacity-40"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{i.item}</p>
                    <p className="text-xs text-rentree-encre/60">
                      {i.family_members?.emoji} {i.family_members?.nom} · {i.section} · à acheter :{" "}
                      {qteAAcheter(i)}
                    </p>
                  </div>
                </label>
              ))}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
