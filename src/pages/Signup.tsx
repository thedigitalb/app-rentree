import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { HB } from "@/components/HB";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [attenteConfirmation, setAttenteConfirmation] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur(null);

    if (password.length < 6) {
      setErreur("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setEnvoi(true);
    const { error } = await signUp(email, password);
    setEnvoi(false);

    if (error) {
      setErreur(traduireErreur(error));
      return;
    }

    // Si la confirmation d'email est désactivée côté Supabase, une session
    // est déjà active : on peut filer directement à l'onboarding.
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      navigate("/onboarding/foyer", { replace: true });
    } else {
      setAttenteConfirmation(true);
    }
  }

  if (attenteConfirmation) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-rentree-creme px-6 text-center">
        <HB humeur="content" taille={120} />
        <h1 className="font-title text-2xl font-bold">Vérifiez vos emails</h1>
        <p className="max-w-xs text-rentree-encre/70">
          Un email de confirmation vient d'être envoyé à <strong>{email}</strong>. Cliquez sur le
          lien reçu, puis revenez vous connecter.
        </p>
        <Link to="/connexion">
          <Button variant="secondaire">Retour à la connexion</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-rentree-creme px-6">
      <HB humeur="neutre" taille={100} />
      <h1 className="font-title text-2xl font-bold">Créer votre compte</h1>

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
            autoComplete="new-password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {erreur && <p className="text-sm font-medium text-red-600">{erreur}</p>}
        <Button type="submit" className="w-full" disabled={envoi}>
          {envoi ? "Création…" : "Créer mon compte"}
        </Button>
      </form>

      <p className="text-sm text-rentree-encre/70">
        Déjà un compte ?{" "}
        <Link to="/connexion" className="font-semibold text-rentree-encre underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}

function traduireErreur(message: string): string {
  if (message.includes("already registered")) return "Un compte existe déjà avec cet email.";
  return message;
}
