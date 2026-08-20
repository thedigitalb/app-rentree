import { Link } from "react-router-dom";
import { useFoyer } from "@/hooks/useFoyer";
import { useFamilyMembers } from "@/hooks/data/useFamilyMembers";
import { useProgressionParEnfant, useFournituresAAcheter } from "@/hooks/data/useFournitures";
import { useStockCommun } from "@/hooks/data/useStock";
import { useArticlesAttribuables } from "@/hooks/data/useAttribuables";
import { useDepenses } from "@/hooks/data/useDepenses";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { HB } from "@/components/HB";

export default function Dashboard() {
  const { foyer, anneeActive } = useFoyer();
  const { data: enfants = [] } = useFamilyMembers();
  const { data: progression } = useProgressionParEnfant();
  const { data: stock = [] } = useStockCommun();
  const { data: attribuables = [] } = useArticlesAttribuables();
  const { data: aAcheter = [] } = useFournituresAAcheter();
  const { data: depenses = [] } = useDepenses();

  const totalDepense = depenses.reduce((somme, d) => somme + Number(d.montant), 0);

  return (
    <div>
      <TopBar titre={foyer?.nom ?? "App Rentrée"} />
      <div className="mx-auto max-w-md space-y-5 px-4 pb-6">
        {anneeActive && (
          <p className="text-center text-sm font-semibold text-rentree-encre/60">
            Rentrée {anneeActive.label}
          </p>
        )}

        {enfants.length === 0 ? (
          <EmptyState
            titre="Aucun enfant pour l'instant"
            description="Ajoutez vos enfants depuis les réglages pour commencer à préparer la rentrée."
            action={
              <Link to="/reglages">
                <Button className="mt-2">Ajouter un enfant</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {enfants.map((enfant) => {
              const prog = progression?.get(enfant.id);
              const total = prog?.total ?? 0;
              const achete = prog?.achete ?? 0;
              const pourcentage = total > 0 ? Math.round((achete / total) * 100) : 0;
              const pret = total > 0 && achete === total;

              return (
                <Link key={enfant.id} to={`/enfant/${enfant.id}`}>
                  <Card className="flex items-center gap-4">
                    <div
                      className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl"
                      style={{ backgroundColor: enfant.couleur }}
                    >
                      {enfant.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-title truncate font-semibold">{enfant.nom}</p>
                        {pret && (
                          <span className="rounded-full bg-rentree-turquoise px-2 py-0.5 text-xs font-bold">
                            Rentrée prête ! 🎉
                          </span>
                        )}
                      </div>
                      <p className="mb-1.5 text-xs text-rentree-encre/60">{enfant.niveau}</p>
                      {total > 0 ? (
                        <ProgressBar valeur={pourcentage} couleur={enfant.couleur} />
                      ) : (
                        <p className="text-xs text-rentree-encre/50">Aucune fourniture ajoutée</p>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Link to="/stock">
            <Card className="h-full">
              <p className="text-2xl">📦</p>
              <p className="font-title font-semibold">Stock commun</p>
              <p className="text-xs text-rentree-encre/60">{stock.length} article(s)</p>
            </Card>
          </Link>
          <Link to="/attribuables">
            <Card className="h-full">
              <p className="text-2xl">🎒</p>
              <p className="font-title font-semibold">Objets attribuables</p>
              <p className="text-xs text-rentree-encre/60">{attribuables.length} article(s)</p>
            </Card>
          </Link>
          <Link to="/a-acheter">
            <Card className="h-full">
              <p className="text-2xl">🛒</p>
              <p className="font-title font-semibold">À acheter</p>
              <p className="text-xs text-rentree-encre/60">{aAcheter.length} ligne(s)</p>
            </Card>
          </Link>
          <Link to="/budget">
            <Card className="h-full">
              <p className="text-2xl">💶</p>
              <p className="font-title font-semibold">Budget</p>
              <p className="text-xs text-rentree-encre/60">{totalDepense.toFixed(2)} € cette année</p>
            </Card>
          </Link>
        </div>

        <div className="flex justify-center pt-2">
          <HB humeur="neutre" taille={70} animer={false} />
        </div>
      </div>
    </div>
  );
}
