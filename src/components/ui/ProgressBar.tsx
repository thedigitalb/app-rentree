interface ProgressBarProps {
  valeur: number; // 0-100
  couleur?: string;
  className?: string;
}

export function ProgressBar({ valeur, couleur = "#D9B3FF", className = "" }: ProgressBarProps) {
  const pourcentage = Math.max(0, Math.min(100, valeur));
  return (
    <div className={`h-3 w-full overflow-hidden rounded-full bg-black/5 ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pourcentage}%`, backgroundColor: couleur }}
      />
    </div>
  );
}
