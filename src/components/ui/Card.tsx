import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-3xl bg-white/90 p-5 shadow-[0_4px_20px_rgba(80,60,120,0.08)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
