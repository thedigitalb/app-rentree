/**
 * La connexion Google nécessite un client OAuth Google Cloud Console
 * configuré côté Supabase (Authentication > Providers > Google) — étape
 * volontairement pas faite pour l'instant. Passer à `true` dès que c'est
 * configuré pour réafficher le bouton "Continuer avec Google" partout où
 * il est utilisé, sans autre changement de code.
 */
export const GOOGLE_AUTH_ACTIVE = false;
