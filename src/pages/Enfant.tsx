import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useFamilyMember } from "@/hooks/data/useFamilyMembers";
import { useMatieres, useCreateMatieres, useUpdateMatiere, useDeleteMatiere } from "@/hooks/data/useMatieres";
import {
  useFournitures,
  useCreateFournitureItem,
  useUpdateFournitureItem,
  useMarquerAchete,
  useDeleteFournitureItem,
  qteAAcheter,
  type FournitureAvecMatiere,
} from "@/hooks/data/useFournitures";
import { useAllocationsPourEnfant } from "@/hooks/data/useAttribuables";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { usePreferences } from "@/hooks/usePreferences";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { Input, Textarea } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { HB } from "@/components/HB";
import { Confetti } from "@/components/Confetti";
import { CATEGORIES_FOURNITURE, COULEURS_MATIERE } from "@/types/domain";

type Onglet = "fournitures" | "matieres";

export default function Enfant() {
  const { id } = useParams<{ id: string }>();
  const { data: enfant } = useFamilyMember(id);
  const [onglet, setOnglet] = useState<Onglet>("fournitures");
  const online = useOnlineStatus();
  const { animationsActives } = usePreferences();

  const { data: fournitures = [] } = useFournitures(id);
  const totalItems = fournitures.length;
  const acheteItems = fournitures.filter((f) => f.statut === "achete").length;
  const pret = totalItems > 0 && acheteItems === totalItems;

  const [afficherCelebration, setAfficherCelebration] = useState(false);
  const dejaFete = useRef(false);
  useEffect(() => {
    if (pret && !dejaFete.current && animationsActives) {
      dejaFete.current = true;
      setAfficherCelebration(true);
      const t = setTimeout(() => setAfficherCelebration(false), 2600);
      return () => clearTimeout(t);
    }
    if (!pret) dejaFete.current = false;
  }, [pret, animationsActives]);

  if (!enfant || !id) {
    return (
      <div>
        <TopBar titre="Chargement…" retour />
      </div>
    );
  }

  return (
    <div>
      {afficherCelebration && <Confetti />}
      <TopBar titre={enfant.nom} retour />

      <div className="mx-auto max-w-md space-y-5 px-4 pb-6">
        <Card className="flex items-center gap-4">
          <div
            className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-3xl"
            style={{ backgroundColor: enfant.couleur }}
          >
            {enfant.emoji}
          </div>
          <div>
            <p className="font-title text-lg font-semibold">{enfant.nom}</p>
            <p className="text-sm text-rentree-encre/60">{enfant.niveau}</p>
          </div>
        </Card>

        {pret && (
          <div className="flex items-center gap-3 rounded-2xl bg-rentree-turquoise/60 p-4">
            <HB humeur="fete" taille={56} animer={animationsActives} />
            <p className="font-title font-semibold">Rentrée prête ! Bravo 🎉</p>
          </div>
        )}

        <Link to={`/trousse/${id}`}>
          <Card className="flex items-center justify-between">
            <span className="font-title font-semibold">🎒 Vérifier la trousse</span>
            <span>→</span>
          </Card>
        </Link>

        <div className="flex gap-2 rounded-2xl bg-black/5 p-1">
          <button
            onClick={() => setOnglet("fournitures")}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
              onglet === "fournitures" ? "bg-white shadow-sm" : "text-rentree-encre/50"
            }`}
          >
            Fournitures
          </button>
          <button
            onClick={() => setOnglet("matieres")}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
              onglet === "matieres" ? "bg-white shadow-sm" : "text-rentree-encre/50"
            }`}
          >
            Matières
          </button>
        </div>

        {onglet === "fournitures" ? (
          <SectionFournitures familyMemberId={id} fournitures={fournitures} online={online} />
        ) : (
          <SectionMatieres familyMemberId={id} online={online} />
        )}

        <SectionAttribue familyMemberId={id} />
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Fournitures, groupées par section
// ------------------------------------------------------------------
function SectionFournitures({
  familyMemberId,
  fournitures,
  online,
}: {
  familyMemberId: string;
  fournitures: FournitureAvecMatiere[];
  online: boolean;
}) {
  const marquerAchete = useMarquerAchete();
  const majItem = useUpdateFournitureItem();
  const supprimerItem = useDeleteFournitureItem();
  const creerItem = useCreateFournitureItem();
  const { data: matieres = [] } = useMatieres(familyMemberId);

  const [ajout, setAjout] = useState(false);
  const [section, setSection] = useState("Toutes matières confondues");
  const [item, setItem] = useState("");
  const [qte, setQte] = useState(1);
  const [categorie, setCategorie] = useState<string>("");

  const groupes = groupBy(fournitures, (f) => f.section);

  async function ajouter() {
    if (!item.trim()) return;
    await creerItem.mutateAsync({
      familyMemberId,
      matiereId: null,
      section,
      item,
      qteDemandee: qte,
      categorie: categorie || null,
    });
    setItem("");
    setQte(1);
    setCategorie("");
    setAjout(false);
  }

  return (
    <div className="space-y-4">
      {fournitures.length === 0 ? (
        <EmptyState
          titre="Aucune fourniture pour l'instant"
          description="Ajoutez des articles manuellement, ou importez une liste (bientôt)."
        />
      ) : (
        Object.entries(groupes).map(([nomSection, items]) => (
          <Card key={nomSection}>
            <p className="font-title mb-3 font-semibold">{nomSection}</p>
            <div className="space-y-3">
              {items.map((f) => {
                const restant = qteAAcheter(f);
                return (
                  <div
                    key={f.id}
                    className="space-y-2 border-b border-black/5 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={`flex min-w-0 items-center gap-1.5 font-medium ${f.statut === "achete" ? "text-rentree-encre/40 line-through" : ""}`}>
                        {f.matieres?.couleur && (
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: f.matieres.couleur }}
                            title={`Cahier ${f.matieres.nom}`}
                          />
                        )}
                        <span className="min-w-0 break-words">{f.item}</span>
                      </p>
                      <button
                        disabled={!online}
                        onClick={() => supprimerItem.mutate({ id: f.id, familyMemberId })}
                        className="shrink-0 text-rentree-encre/30 hover:text-red-500 disabled:opacity-40"
                        aria-label="Supprimer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-rentree-encre/60">
                      <span>Demandé : {f.qte_demandee}</span>
                      <label className="flex items-center gap-1">
                        Couvert :
                        <input
                          type="number"
                          min={0}
                          disabled={!online}
                          defaultValue={f.qte_couverte}
                          onBlur={(e) =>
                            majItem.mutate({
                              id: f.id,
                              familyMemberId,
                              qte_couverte: Number(e.target.value),
                            })
                          }
                          className="w-14 rounded border border-black/10 px-1 py-0.5 disabled:opacity-40"
                        />
                      </label>
                      <select
                        disabled={!online}
                        defaultValue={f.categorie ?? ""}
                        onChange={(e) =>
                          majItem.mutate({
                            id: f.id,
                            familyMemberId,
                            categorie: e.target.value || null,
                          })
                        }
                        className="rounded border border-black/10 bg-transparent px-1 py-0.5 text-xs disabled:opacity-40"
                      >
                        <option value="">Sans catégorie</option>
                        {CATEGORIES_FOURNITURE.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {restant > 0 ? (
                        <span className="rounded-full bg-orange-200 px-2 py-1 text-xs font-semibold text-orange-800">
                          à acheter : {restant}
                        </span>
                      ) : (
                        <span />
                      )}
                      <button
                        disabled={!online}
                        onClick={() =>
                          marquerAchete.mutate({
                            id: f.id,
                            familyMemberId,
                            qteDemandee: f.qte_demandee,
                            achete: f.statut !== "achete",
                          })
                        }
                        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition disabled:opacity-40 ${
                          f.statut === "achete"
                            ? "bg-rentree-turquoise text-rentree-encre"
                            : "bg-rentree-violet text-rentree-encre"
                        }`}
                      >
                        {f.statut === "achete" ? "✓ Acheté" : "Marquer acheté"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))
      )}

      {ajout ? (
        <Card className="space-y-3">
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full rounded-2xl border-2 border-black/5 px-3 py-2 text-sm"
          >
            <option>Toutes matières confondues</option>
            {matieres.map((m) => (
              <option key={m.id} value={m.nom}>
                {m.nom}
              </option>
            ))}
          </select>
          <Input placeholder="Article (ex. Classeur 4 anneaux)" value={item} onChange={(e) => setItem(e.target.value)} />
          <div className="flex items-center gap-2">
            <label className="text-sm">Quantité</label>
            <input
              type="number"
              min={1}
              value={qte}
              onChange={(e) => setQte(Number(e.target.value))}
              className="w-20 rounded-xl border-2 border-black/5 px-2 py-1"
            />
          </div>
          <select
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            className="w-full rounded-2xl border-2 border-black/5 px-3 py-2 text-sm"
          >
            <option value="">Catégorie (optionnel)</option>
            {CATEGORIES_FOURNITURE.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={ajouter} disabled={!online || creerItem.isPending}>
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
  );
}

// ------------------------------------------------------------------
// Matières
// ------------------------------------------------------------------
function SectionMatieres({ familyMemberId, online }: { familyMemberId: string; online: boolean }) {
  const { data: matieres = [] } = useMatieres(familyMemberId);
  const creer = useCreateMatieres();
  const majMatiere = useUpdateMatiere();
  const supprimer = useDeleteMatiere();
  const [nouvelleMatiere, setNouvelleMatiere] = useState("");

  async function ajouterMatiere() {
    if (!nouvelleMatiere.trim()) return;
    await creer.mutateAsync({
      familyMemberId,
      matieres: [{ nom: nouvelleMatiere, active: true }],
    });
    setNouvelleMatiere("");
  }

  return (
    <div className="space-y-3">
      {matieres.length === 0 && (
        <EmptyState titre="Aucune matière" description="Ajoutez les matières suivies par cet enfant." />
      )}
      {matieres.map((m) => (
        <Card key={m.id} className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10"
                style={{ backgroundColor: m.couleur ?? "transparent" }}
                title={m.couleur ? "Couleur du cahier" : "Aucune couleur"}
              />
              <p className={`font-title font-semibold ${!m.active ? "text-rentree-encre/40" : ""}`}>{m.nom}</p>
            </div>
            <div className="flex items-center gap-2">
              <Toggle
                checked={m.active}
                disabled={!online}
                onChange={(v) => majMatiere.mutate({ id: m.id, familyMemberId, active: v })}
              />
              <button
                disabled={!online}
                onClick={() => supprimer.mutate({ id: m.id, familyMemberId })}
                className="text-rentree-encre/30 hover:text-red-500 disabled:opacity-40"
                aria-label="Supprimer"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs text-rentree-encre/50">Couleur du cahier :</span>
            <button
              disabled={!online}
              onClick={() => majMatiere.mutate({ id: m.id, familyMemberId, couleur: null })}
              className={`h-5 w-5 shrink-0 rounded-full border border-dashed border-black/20 disabled:opacity-40 ${
                !m.couleur ? "ring-2 ring-rentree-encre/30" : ""
              }`}
              title="Aucune couleur"
            />
            {COULEURS_MATIERE.map((c) => (
              <button
                key={c}
                disabled={!online}
                onClick={() => majMatiere.mutate({ id: m.id, familyMemberId, couleur: c })}
                className={`h-5 w-5 shrink-0 rounded-full disabled:opacity-40 ${
                  m.couleur === c ? "ring-2 ring-rentree-encre/50" : ""
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <Textarea
            rows={2}
            placeholder="Spécificités fournitures (ex. cahier grands carreaux 96p, sans spirale)"
            defaultValue={m.spec_fournitures ?? ""}
            disabled={!online}
            onBlur={(e) =>
              majMatiere.mutate({ id: m.id, familyMemberId, spec_fournitures: e.target.value || null })
            }
            className="text-sm"
          />
        </Card>
      ))}

      <Card className="flex gap-2">
        <Input
          placeholder="Ajouter une matière"
          value={nouvelleMatiere}
          onChange={(e) => setNouvelleMatiere(e.target.value)}
        />
        <Button disabled={!online} onClick={ajouterMatiere}>
          +
        </Button>
      </Card>
    </div>
  );
}

// ------------------------------------------------------------------
// Ce qui est attribué à l'enfant
// ------------------------------------------------------------------
function SectionAttribue({ familyMemberId }: { familyMemberId: string }) {
  const { data: allocations = [] } = useAllocationsPourEnfant(familyMemberId);
  if (allocations.length === 0) return null;

  return (
    <Card>
      <p className="font-title mb-3 font-semibold">Ce qui lui est attribué</p>
      <ul className="space-y-1.5 text-sm">
        {allocations.map((a) => (
          <li key={a.id} className="flex justify-between">
            <span>{a.articles_attribuables.article}</span>
            <span className="font-semibold">× {a.quantite}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function groupBy<T>(items: T[], fn: (item: T) => string): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = fn(item);
    (acc[key] ??= []).push(item);
    return acc;
  }, {});
}
