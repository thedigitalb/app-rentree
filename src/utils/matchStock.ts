const MOTS_VIDES = new Set([
  "de",
  "du",
  "des",
  "le",
  "la",
  "les",
  "un",
  "une",
  "et",
  "à",
  "a",
  "pour",
  "avec",
  "sans",
  "en",
]);

function singulariser(mot: string): string {
  if (mot.endsWith("aux") && mot.length > 4) return mot.slice(0, -3) + "al";
  if (mot.endsWith("s") && mot.length > 3) return mot.slice(0, -1);
  return mot;
}

function motsSignificatifs(texte: string): string[] {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // enlève les accents
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(singulariser)
    .filter((m) => m.length > 2 && !MOTS_VIDES.has(m));
}

/**
 * Retrouve, parmi une liste d'articles du Stock commun, celui dont le nom
 * correspond à une fourniture — par confinement de mots (tous les mots
 * significatifs de l'article de stock doivent se retrouver dans le nom de
 * la fourniture). Volontairement strict : mieux vaut ne rien proposer que
 * proposer un mauvais rapprochement (ex. un stylo bille rouge ne doit pas
 * matcher une recharge de stylo à friction rouge, même s'ils partagent le
 * mot "stylo").
 */
export function trouverCorrespondanceStock<T extends { id: string; article: string }>(
  nomFourniture: string,
  articlesStock: T[]
): T | null {
  const motsItem = new Set(motsSignificatifs(nomFourniture));
  if (motsItem.size === 0) return null;

  let meilleur: T | null = null;
  let meilleurScore = 0;

  for (const article of articlesStock) {
    const motsArticle = motsSignificatifs(article.article);
    if (motsArticle.length === 0) continue;

    const contenu = motsArticle.every((m) => motsItem.has(m));
    if (contenu && motsArticle.length > meilleurScore) {
      meilleur = article;
      meilleurScore = motsArticle.length;
    }
  }

  return meilleur;
}
