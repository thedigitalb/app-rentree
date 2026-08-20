import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-2xl border-2 border-black/5 bg-white px-4 py-3 font-body outline-none transition focus:border-rentree-violet ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-2xl border-2 border-black/5 bg-white px-4 py-3 font-body outline-none transition focus:border-rentree-violet ${className}`}
      {...props}
    />
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1.5 block text-sm font-semibold text-rentree-encre/80">{children}</label>;
}
