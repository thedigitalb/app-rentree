/**
 * Utilitaire réutilisable (voir section 9 du cahier des charges) : indique si
 * une rentrée scolaire doit être visible/mise en avant à une date donnée.
 * Pensé pour être facilement réexposé côté autre appli familiale
 * (même logique que la fonction SQL `est_rentree_visible`).
 */
export function estRentreeVisible(
  anneeScolaire: { dateDebutVisibilite: string; dateFinVisibilite: string },
  dateActuelle: Date = new Date()
): boolean {
  const d = toDateOnly(dateActuelle);
  return d >= anneeScolaire.dateDebutVisibilite && d <= anneeScolaire.dateFinVisibilite;
}

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Génère un label d'année scolaire par défaut, ex "2026-2027". */
export function labelAnneeScolaireParDefaut(dateActuelle: Date = new Date()): string {
  const annee = dateActuelle.getFullYear();
  // avant juillet -> on considère l'année scolaire en cours (annee-1/annee)
  // à partir de juillet -> on prépare la suivante (annee/annee+1)
  const debut = dateActuelle.getMonth() >= 6 ? annee : annee - 1;
  return `${debut}-${debut + 1}`;
}

/** Bornes par défaut d'une fenêtre de visibilité de rentrée : 1er juin -> 31 octobre. */
export function bornesVisibiliteParDefaut(labelAnnee: string): {
  dateDebutVisibilite: string;
  dateFinVisibilite: string;
} {
  const anneeDebut = Number(labelAnnee.split("-")[0]);
  return {
    dateDebutVisibilite: `${anneeDebut}-06-01`,
    dateFinVisibilite: `${anneeDebut}-10-31`,
  };
}
