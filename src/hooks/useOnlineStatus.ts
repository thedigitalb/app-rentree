import { useEffect, useState } from "react";

/**
 * Statut de connexion réseau. L'appli PWA lit les dernières données en
 * cache hors-ligne, mais toute écriture nécessite une connexion : ce hook
 * sert à griser les actions et afficher un message clair (section 7).
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return online;
}
