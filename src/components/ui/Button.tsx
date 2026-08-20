import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primaire" | "secondaire" | "fantome" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const styles: Record<Variant, string> = {
  primaire:
    "bg-rentree-violet text-rentree-encre hover:brightness-95 shadow-sm disabled:opacity-40",
  secondaire:
    "bg-white border-2 border-rentree-violet/40 text-rentree-encre hover:bg-rentree-violet/10 disabled:opacity-40",
  fantome: "bg-transparent text-rentree-encre hover:bg-black/5 disabled:opacity-40",
  danger: "bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-40",
};

export function Button({ variant = "primaire", className = "", children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-title font-semibold transition disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
