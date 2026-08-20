import { motion } from "framer-motion";

export type HumeurHB = "neutre" | "content" | "vide" | "fete";

interface HBProps {
  humeur?: HumeurHB;
  taille?: number;
  className?: string;
  animer?: boolean;
}

/**
 * HB, la mascotte crayon à papier kawaii de l'appli. Cohérente partout où
 * elle apparaît : écran de bienvenue, états vides, célébrations.
 */
export function HB({ humeur = "neutre", taille = 140, className = "", animer = true }: HBProps) {
  const bouche = {
    neutre: "M -14 -28 Q 0 -18 14 -28",
    content: "M -16 -30 Q 0 -6 16 -30",
    vide: "M -12 -22 Q 0 -26 12 -22",
    fete: "M -18 -32 Q 0 -2 18 -32",
  }[humeur];

  const inclinaison = humeur === "vide" ? -8 : 0;

  const Wrapper = animer ? motion.div : "div";
  const wrapperProps = animer
    ? {
        animate:
          humeur === "fete"
            ? { rotate: [-4, 4, -4], y: [0, -6, 0] }
            : { y: [0, -4, 0] },
        transition: { duration: humeur === "fete" ? 0.6 : 2.4, repeat: Infinity, ease: "easeInOut" as const },
      }
    : {};

  return (
    <Wrapper className={className} {...wrapperProps}>
      <svg width={taille} height={taille * 1.2} viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="hb-wood" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFD873" />
            <stop offset="1" stopColor="#FFC94D" />
          </linearGradient>
        </defs>

        {humeur === "fete" && (
          <g>
            <text x="20" y="30" fontSize="22">✨</text>
            <text x="160" y="50" fontSize="18">✨</text>
            <text x="30" y="200" fontSize="16">🎉</text>
            <text x="165" y="190" fontSize="20">🎉</text>
          </g>
        )}

        <g transform={`translate(100 130) rotate(${inclinaison})`}>
          {/* graphite tip */}
          <path d="M -34 78 L 0 130 L 34 78 Z" fill="#5b4636" />
          <path d="M -14 78 L 0 108 L 14 78 Z" fill="#2b2b2b" />

          {/* wood cone */}
          <path d="M -46 42 L 46 42 L 34 78 L -34 78 Z" fill="#F3C583" />

          {/* body */}
          <rect x="-46" y="-100" width="92" height="142" rx="18" fill="url(#hb-wood)" />
          <rect x="-46" y="-100" width="16" height="142" rx="8" fill="#ffffff" opacity="0.25" />

          {/* HB band */}
          <rect x="-46" y="8" width="92" height="30" fill="#7a4a2b" opacity="0.12" />
          <text x="0" y="30" textAnchor="middle" fontFamily="'Baloo 2', sans-serif" fontWeight="700" fontSize="20" fill="#7a4a2b">
            HB
          </text>

          {/* ferrule */}
          <rect x="-46" y="-132" width="92" height="32" rx="8" fill="#D9DEE3" />
          <rect x="-46" y="-132" width="92" height="7" fill="#EDF1F4" />

          {/* eraser */}
          <rect x="-46" y="-176" width="92" height="48" rx="18" fill="#FFB3D9" />
          <rect x="-46" y="-176" width="26" height="48" rx="14" fill="#ffffff" opacity="0.3" />

          {/* face */}
          <g>
            {humeur === "content" || humeur === "fete" ? (
              <>
                <path d="M -26 -60 Q -20 -50 -14 -60" stroke="#3a2c22" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M 14 -60 Q 20 -50 26 -60" stroke="#3a2c22" strokeWidth="4" fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                <circle cx="-20" cy="-52" r="9" fill="#3a2c22" />
                <circle cx="20" cy="-52" r="9" fill="#3a2c22" />
                <circle cx="-23" cy="-56" r="3" fill="#ffffff" />
                <circle cx="17" cy="-56" r="3" fill="#ffffff" />
              </>
            )}
            <circle cx="-32" cy="-30" r="9" fill="#FF9FC8" opacity="0.7" />
            <circle cx="32" cy="-30" r="9" fill="#FF9FC8" opacity="0.7" />
            <path d={bouche} stroke="#3a2c22" strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>

          {/* arms */}
          <path
            d={humeur === "fete" ? "M -46 -10 Q -90 -50 -80 -80" : "M -46 -10 Q -78 4 -70 34"}
            stroke="#FFC94D"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={humeur === "fete" ? "M 46 -10 Q 90 -50 80 -80" : "M 46 -10 Q 78 4 70 34"}
            stroke="#FFC94D"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx={humeur === "fete" ? -80 : -70} cy={humeur === "fete" ? -84 : 38} r="11" fill="#FFD873" />
          <circle cx={humeur === "fete" ? 80 : 70} cy={humeur === "fete" ? -84 : 38} r="11" fill="#FFD873" />
        </g>
      </svg>
    </Wrapper>
  );
}
