import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

interface TopBarProps {
  titre: string;
  retour?: boolean;
  action?: ReactNode;
}

export function TopBar({ titre, retour = false, action }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 bg-rentree-creme/95 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur">
      {retour && (
        <button
          onClick={() => navigate(-1)}
          aria-label="Retour"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white shadow-sm"
        >
          ←
        </button>
      )}
      <h1 className="font-title flex-1 truncate text-xl font-bold">{titre}</h1>
      {action}
    </header>
  );
}
