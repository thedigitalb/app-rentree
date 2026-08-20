import { motion } from "framer-motion";
import { useMemo } from "react";

const COULEURS = ["#FFB3D9", "#B3F0E5", "#FFEAA7", "#D9B3FF", "#B3E5FF"];

/** Petite pluie de confettis, non envahissante, pour les célébrations. */
export function Confetti({ count = 24 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.6 + Math.random() * 1.2,
        rotate: Math.random() * 360,
        couleur: COULEURS[i % COULEURS.length],
        taille: 6 + Math.random() * 6,
      })),
    [count]
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          style={{
            position: "absolute",
            width: p.taille,
            height: p.taille,
            backgroundColor: p.couleur,
            borderRadius: 3,
          }}
        />
      ))}
    </div>
  );
}
