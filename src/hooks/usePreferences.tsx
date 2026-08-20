import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface PreferencesValue {
  animationsActives: boolean;
  sonsActifs: boolean;
  setAnimationsActives: (v: boolean) => void;
  setSonsActifs: (v: boolean) => void;
}

const PreferencesContext = createContext<PreferencesValue | null>(null);

const CLE_ANIMATIONS = "app-rentree:animations";
const CLE_SONS = "app-rentree:sons";

function lireBooleen(cle: string, defaut: boolean): boolean {
  const valeur = localStorage.getItem(cle);
  return valeur === null ? defaut : valeur === "true";
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [animationsActives, setAnimationsActives] = useState(() => lireBooleen(CLE_ANIMATIONS, true));
  const [sonsActifs, setSonsActifs] = useState(() => lireBooleen(CLE_SONS, true));

  useEffect(() => {
    localStorage.setItem(CLE_ANIMATIONS, String(animationsActives));
  }, [animationsActives]);

  useEffect(() => {
    localStorage.setItem(CLE_SONS, String(sonsActifs));
  }, [sonsActifs]);

  return (
    <PreferencesContext.Provider
      value={{ animationsActives, sonsActifs, setAnimationsActives, setSonsActifs }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences doit être utilisé dans <PreferencesProvider>");
  return ctx;
}
