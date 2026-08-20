import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { HB } from "@/components/HB";
import { Button } from "@/components/ui/Button";
import { GoogleButton } from "@/components/ui/GoogleButton";
import { Input, Label } from "@/components/ui/Input";

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [envoiGoogle, setEnvoiGoogle] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnvoi(true);
    const { error } = await signIn(email, password);
    setEnvoi(false);
    if (error) {
      setErreur(traduireErreur(error));
      return;
    }
    navigate("/", { replace: true });
  }

  async function onGoogle() {
    setErreur(null);
    setEnvoiGoogle(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setErreur(error);
      setEnvoiGoogle(false);
    }
    // en cas de succès, la page est redirigée vers Google puis revient ici.
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-rentree-creme px-6">
      <HB humeur="neutre" taille={100} />
      <h1 className="font-title text-2xl font-bold">Content de vous revoir</h1>

      <div className="w-full max-w-xs">
        <GoogleButton onClick={onGoogle} disabled={envoiGoogle} texte={envoiGoogle ? "Redirection…" : "Continuer avec Google"} />
      </div>

      <div className="flex w-full max-w-xs items-center gap-3 text-xs font-semibold text-rentree-encre/40">
        <span className="h-px flex-1 bg-black/10" />
        ou
        <span className="h-px flex-1 bg-black/10" />
      </div>

      <form onSubmit={onSubmit} className="w-full max-w-xs space-y-4">
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label>Mot de passe</Label>
          <Input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {erreur && <p className="text-sm font-medium text-red-600">{erreur}</p>}
        <Button type="submit" className="w-full" disabled={envoi}>
          {envoi ? "Connexion…" : "Se connecter"}
        </Button>
      </form>

      <p className="text-sm text-rentree-encre/70">
        Pas encore de compte ?{" "}
        <Link to="/inscription" className="font-semibold text-rentree-encre underline">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}

function traduireErreur(message: string): string {
  if (message.includes("Invalid login credentials")) return "Email ou mot de passe incorrect.";
  if (message.includes("Email not confirmed")) return "Merci de confirmer votre email avant de vous connecter.";
  return message;
}
