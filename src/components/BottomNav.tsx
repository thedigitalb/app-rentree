import { NavLink } from "react-router-dom";

const ITEMS = [
  { to: "/", label: "Accueil", icon: "🏠", end: true },
  { to: "/a-acheter", label: "À acheter", icon: "🛒", end: false },
  { to: "/stock", label: "Stock", icon: "📦", end: false },
  { to: "/budget", label: "Budget", icon: "💶", end: false },
  { to: "/reglages", label: "Réglages", icon: "⚙️", end: false },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 px-1 py-2.5 text-xs font-semibold transition ${
                isActive ? "text-rentree-encre" : "text-rentree-encre/40"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full text-base transition ${
                    isActive ? "bg-rentree-violet" : ""
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
