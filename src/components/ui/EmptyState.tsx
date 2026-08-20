import type { ReactNode } from "react";
import { HB } from "@/components/HB";

interface EmptyStateProps {
  titre: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ titre, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-white/70 px-6 py-10 text-center">
      <HB humeur="vide" taille={100} />
      <h3 className="font-title text-lg font-semibold">{titre}</h3>
      {description && <p className="max-w-xs text-sm text-rentree-encre/70">{description}</p>}
      {action}
    </div>
  );
}
