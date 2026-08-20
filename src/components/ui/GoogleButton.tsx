interface GoogleButtonProps {
  onClick: () => void;
  disabled?: boolean;
  texte?: string;
}

export function GoogleButton({ onClick, disabled, texte = "Continuer avec Google" }: GoogleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-black/10 bg-white px-5 py-3 font-title font-semibold text-rentree-encre transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M19.6 10.23c0-.68-.06-1.36-.17-2H10v3.79h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.75 2.99-4.32 2.99-7.31Z"
        />
        <path
          fill="#34A853"
          d="M10 20c2.7 0 4.96-.89 6.62-2.42l-3.23-2.5c-.9.6-2.06.95-3.39.95-2.6 0-4.8-1.76-5.59-4.12H1.07v2.59A10 10 0 0 0 10 20Z"
        />
        <path
          fill="#FBBC05"
          d="M4.41 11.9a6 6 0 0 1 0-3.8V5.51H1.07a10 10 0 0 0 0 8.98l3.34-2.59Z"
        />
        <path
          fill="#EA4335"
          d="M10 3.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 10 0 10 10 0 0 0 1.07 5.51L4.41 8.1C5.2 5.74 7.4 3.98 10 3.98Z"
        />
      </svg>
      {texte}
    </button>
  );
}
