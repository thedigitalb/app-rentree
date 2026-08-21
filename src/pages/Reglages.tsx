import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useFoyer } from "@/hooks/useFoyer";
import { usePreferences } from "@/hooks/usePreferences";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useMembresFoyer, useCreerInvitation } from "@/hooks/data/useFoyerMembres";
import { useFamilyMembers, useCreateFamilyMember, useUpdateFamilyMember } from "@/hooks/data/useFamilyMembers";
import { useAnneesScolaires, useCreerNouvelleAnnee } from "@/hooks/data/useAnneesScolaires";
import { exporterFoyerEnJSON } from "@/utils/exportImport";
import { labelAnneeScolaireParDefaut, bornesVisibiliteParDefaut } from "@/utils/rentree";
import { NIVEAUX_GROUPES, matieresParDefaut, trousseParDefaut } from "@/utils/defautsParNiveau";
import { COULEURS_ENFANT, EMOJIS_ENFANT } from "@/types/domain";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { Input, Label } from "@/components/ui/Input";

export default function Reglages() {
  const { user, signOut } = useAuth();
  const { foyer } = useFoyer();
  const online = useOnlineStatus();

  return (
    <div>
      <TopBar titre="Réglages" retour />
      <div className="mx-auto max-w-md space-y-6 px-4 pb-10">
        <SectionMembresFoyer />
        <SectionEnfants online={online} />
        <SectionAnneesScolaires online={online} />
        <SectionExport foyerId={foyer?.id} />
        <SectionPreferences />

        <Card className="space-y-2 text-center">
          <p className="text-xs text-rentree-encre/50">Connecté en tant que {user?.email}</p>
          <Button variant="fantome" className="w-full" onClick={() => signOut()}>
            Se déconnecter
          </Button>
        </Card>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
function SectionMembresFoyer() {
  const { data: membres = [] } = useMembresFoyer();
  const { user } = useAuth();
  const creerInvitation = useCreerInvitation();
  const [code, setCode] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  async function genererCode() {
    setErreur(null);
    try {
      setCode(await creerInvitation.mutateAsync());
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Impossible de générer le code.");
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="font-title px-1 text-sm font-bold uppercase tracking-wide text-rentree-encre/50">
        Membres du foyer
      </h2>
      <Card className="space-y-2">
        {membres.map((m) => (
          <div key={m.user_id} className="flex items-center justify-between gap-2 text-sm">
            <span className="min-w-0 truncate">{m.email}</span>
            {m.user_id === user?.id && (
              <span className="shrink-0 rounded-full bg-rentree-violet px-2 py-0.5 text-xs font-semibold">Vous</span>
            )}
          </div>
        ))}
      </Card>
      {code ? (
        <Card className="space-y-2 text-center">
          <p className="text-xs text-rentree-encre/60">Code d'invitation (valable 7 jours) :</p>
          <p className="font-title text-2xl font-extrabold tracking-widest">{code}</p>
          <Button variant="secondaire" className="w-full" onClick={() => navigator.clipboard.writeText(code)}>
            Copier le code
          </Button>
        </Card>
      ) : (
        <Button variant="secondaire" className="w-full" onClick={genererCode} disabled={creerInvitation.isPending}>
          Inviter mon conjoint
        </Button>
      )}
      {erreur && <p className="text-sm font-medium text-red-600">{erreur}</p>}
    </section>
  );
}

// ------------------------------------------------------------------
function SectionEnfants({ online }: { online: boolean }) {
  const { foyer, anneeActive } = useFoyer();
  const { data: enfants = [] } = useFamilyMembers();
  const creerEnfant = useCreateFamilyMember();
  const majEnfant = useUpdateFamilyMember();

  const [ajout, setAjout] = useState(false);
  const [nom, setNom] = useState("");
  const [niveau, setNiveau] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS_ENFANT[0]);
  const [couleur, setCouleur] = useState(COULEURS_ENFANT[0]);

  async function ajouter() {
    if (!foyer || !anneeActive || !niveau || !nom.trim()) return;
    const enfant = await creerEnfant.mutateAsync({
      nom,
      dateNaissance: null,
      niveau,
      emoji,
      couleur,
    });
    // matières + trousse par défaut, comme à l'onboarding
    const matieres = matieresParDefaut(niveau).map((m) => ({
      foyer_id: foyer.id,
      annee_scolaire_id: anneeActive.id,
      family_member_id: enfant.id,
      nom: m.nom,
      active: m.active,
    }));
    if (matieres.length > 0) await supabase.from("matieres").insert(matieres);
    const trousse = trousseParDefaut().map((item: string, index: number) => ({
      foyer_id: foyer.id,
      annee_scolaire_id: anneeActive.id,
      family_member_id: enfant.id,
      item,
      checked: false,
      ordre: index,
    }));
    if (trousse.length > 0) await supabase.from("trousse_check_items").insert(trousse);

    setNom("");
    setNiveau("");
    setAjout(false);
  }

  return (
    <section className="space-y-3">
      <h2 className="font-title px-1 text-sm font-bold uppercase tracking-wide text-rentree-encre/50">
        Membres de la famille
      </h2>
      <div className="space-y-2">
        {enfants.map((e) => (
          <Card key={e.id} className="flex items-center gap-3">
            <span className="shrink-0 text-2xl">{e.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{e.nom}</p>
            </div>
            <select
              disabled={!online}
              defaultValue={e.niveau}
              onChange={(ev) => majEnfant.mutate({ id: e.id, niveau: ev.target.value })}
              className="shrink-0 rounded-xl border-2 border-black/5 px-2 py-1.5 text-sm disabled:opacity-40"
            >
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
          </Card>
        ))}
      </div>

      {ajout ? (
        <Card className="space-y-3">
          <Input placeholder="Prénom" value={nom} onChange={(e) => setNom(e.target.value)} />
          <select
            value={niveau}
            onChange={(e) => setNiveau(e.target.value)}
            className="w-full rounded-xl border-2 border-black/5 px-3 py-2 text-sm"
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
          <div className="flex flex-wrap gap-2">
            {EMOJIS_ENFANT.map((e) => (
              <button
                type="button"
                key={e}
                onClick={() => setEmoji(e)}
                className={`grid h-9 w-9 place-items-center rounded-xl text-lg ${emoji === e ? "bg-rentree-violet" : "bg-black/5"}`}
              >
                {e}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {COULEURS_ENFANT.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setCouleur(c)}
                className={`h-9 w-9 rounded-xl ${couleur === c ? "ring-4 ring-rentree-encre/30" : ""}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={ajouter} disabled={!online || creerEnfant.isPending}>
              Ajouter
            </Button>
            <Button variant="fantome" onClick={() => setAjout(false)}>
              Annuler
            </Button>
          </div>
        </Card>
      ) : (
        <Button variant="secondaire" className="w-full" disabled={!online} onClick={() => setAjout(true)}>
          + Ajouter un enfant
        </Button>
      )}
    </section>
  );
}

// ------------------------------------------------------------------
function SectionAnneesScolaires({ online }: { online: boolean }) {
  const { data: annees = [] } = useAnneesScolaires();
  const creerAnnee = useCreerNouvelleAnnee();
  const [ouvert, setOuvert] = useState(false);
  const [label, setLabel] = useState(labelAnneeScolaireParDefaut());
  const [reporterStock, setReporterStock] = useState(true);
  const [reporterAttribuables, setReporterAttribuables] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  async function creer() {
    setErreur(null);
    try {
      const bornes = bornesVisibiliteParDefaut(label);
      await creerAnnee.mutateAsync({
        label,
        dateDebutVisibilite: bornes.dateDebutVisibilite,
        dateFinVisibilite: bornes.dateFinVisibilite,
        reporterStock,
        reporterAttribuables,
      });
      setOuvert(false);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Impossible de créer l'année.");
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="font-title px-1 text-sm font-bold uppercase tracking-wide text-rentree-encre/50">
        Années scolaires
      </h2>
      <Card className="divide-y divide-black/5">
        {annees.map((a) => (
          <div key={a.id} className="flex items-center justify-between py-2 text-sm first:pt-0 last:pb-0">
            <span className={a.active ? "font-semibold" : ""}>{a.label}</span>
            {a.active && <span className="text-xs text-rentree-encre/50">active</span>}
          </div>
        ))}
      </Card>

      {ouvert ? (
        <Card className="space-y-3">
          <div>
            <Label>Label</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <label className="flex items-center justify-between text-sm">
            Reporter le stock commun restant
            <Toggle checked={reporterStock} onChange={setReporterStock} />
          </label>
          <label className="flex items-center justify-between text-sm">
            Reporter les objets attribuables et allocations
            <Toggle checked={reporterAttribuables} onChange={setReporterAttribuables} />
          </label>
          <p className="text-xs text-rentree-encre/50">
            Pensez à mettre à jour le niveau de chaque enfant si besoin (ci-dessus).
          </p>
          {erreur && <p className="text-sm font-medium text-red-600">{erreur}</p>}
          <div className="flex gap-2">
            <Button className="flex-1" onClick={creer} disabled={!online || creerAnnee.isPending}>
              {creerAnnee.isPending ? "Création…" : "Ouvrir cette nouvelle année"}
            </Button>
            <Button variant="fantome" onClick={() => setOuvert(false)}>
              Annuler
            </Button>
          </div>
        </Card>
      ) : (
        <Button variant="secondaire" className="w-full" disabled={!online} onClick={() => setOuvert(true)}>
          + Nouvelle année scolaire
        </Button>
      )}
    </section>
  );
}

// ------------------------------------------------------------------
function SectionExport({ foyerId }: { foyerId: string | undefined }) {
  const [export_, setExport] = useState(false);

  async function exporter() {
    if (!foyerId) return;
    setExport(true);
    try {
      await exporterFoyerEnJSON(foyerId, `app-rentree-export-${new Date().toISOString().slice(0, 10)}.json`);
    } finally {
      setExport(false);
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="font-title px-1 text-sm font-bold uppercase tracking-wide text-rentree-encre/50">
        Sauvegarde
      </h2>
      <Button variant="secondaire" className="w-full" onClick={exporter} disabled={export_}>
        {export_ ? "Export…" : "⬇️ Exporter mes données en JSON"}
      </Button>
    </section>
  );
}

// ------------------------------------------------------------------
function SectionPreferences() {
  const { animationsActives, sonsActifs, setAnimationsActives, setSonsActifs } = usePreferences();

  return (
    <section className="space-y-3">
      <h2 className="font-title px-1 text-sm font-bold uppercase tracking-wide text-rentree-encre/50">
        Préférences
      </h2>
      <Card className="space-y-3">
        <label className="flex items-center justify-between text-sm">
          Animations et célébrations
          <Toggle checked={animationsActives} onChange={setAnimationsActives} />
        </label>
        <label className="flex items-center justify-between text-sm">
          Sons
          <Toggle checked={sonsActifs} onChange={setSonsActifs} />
        </label>
      </Card>
    </section>
  );
}
