import { useParams } from "react-router-dom";
import { useFamilyMember } from "@/hooks/data/useFamilyMembers";
import { useTrousse, useToggleTrousseItem } from "@/hooks/data/useTrousse";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { EmptyState } from "@/components/ui/EmptyState";

export default function Trousse() {
  const { id } = useParams<{ id: string }>();
  const { data: enfant } = useFamilyMember(id);
  const { data: items = [] } = useTrousse(id);
  const toggle = useToggleTrousseItem();
  const online = useOnlineStatus();

  const cochees = items.filter((i) => i.checked).length;

  return (
    <div>
      <TopBar titre={`Trousse de ${enfant?.nom ?? "…"}`} retour />
      <div className="mx-auto max-w-md space-y-4 px-4 pb-6">
        <p className="text-center text-sm text-rentree-encre/60">
          {cochees} / {items.length} vérifié(s) — juste un rappel informatif, pas un stock à jour.
        </p>

        {items.length === 0 ? (
          <EmptyState titre="Aucun élément de trousse" />
        ) : (
          <Card className="divide-y divide-black/5">
            {items.map((item) => (
              <label key={item.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <span className={item.checked ? "text-rentree-encre/40 line-through" : ""}>{item.item}</span>
                <Toggle
                  checked={item.checked}
                  disabled={!online}
                  onChange={(v) =>
                    toggle.mutate({ id: item.id, familyMemberId: id!, checked: v })
                  }
                />
              </label>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
