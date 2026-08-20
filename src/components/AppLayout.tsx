import { Outlet } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { OfflineBanner } from "@/components/OfflineBanner";

export function AppLayout() {
  return (
    <div className="min-h-dvh bg-rentree-creme pb-24">
      <OfflineBanner />
      <Outlet />
      <BottomNav />
    </div>
  );
}
