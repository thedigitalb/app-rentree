import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-40 bg-rentree-jaune px-4 py-2 text-center text-sm font-semibold text-rentree-encre shadow">
      📡 Hors-ligne — vous consultez les dernières données chargées. Les modifications sont
      désactivées tant que la connexion n'est pas rétablie.
    </div>
  );
}
