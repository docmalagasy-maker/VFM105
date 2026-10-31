/** Règles de la limite d'inscription, sans accès à la base (utilisables dans le navigateur). */

/** Nombre maximal de participants aux Tafa & Dinika (associations et personnes confondues). */
export const LIMITE_INSCRITS = 200;
/** À partir de ce nombre d'inscrits, l'accueil affiche les places restantes. */
export const SEUIL_DECOMPTE = 180;

export interface EtatInscriptions {
  inscrits: number;
  limite: number;
  restantes: number;
  complet: boolean;
  /** Taux de remplissage en pourcentage (0 à 100, une décimale). */
  taux: number;
}

/** Message renvoyé aux formulaires quand les 200 places sont prises. */
export const MESSAGE_COMPLET =
  "Feno ny toerana : efa misy 200 ireo voasoratra anarana. Tsy azo atao intsony ny misoratra anarana.";

export function calculerEtat(inscrits: number): EtatInscriptions {
  const pris = Math.min(inscrits, LIMITE_INSCRITS);
  return {
    inscrits,
    limite: LIMITE_INSCRITS,
    restantes: LIMITE_INSCRITS - pris,
    complet: inscrits >= LIMITE_INSCRITS,
    taux: Math.round((pris / LIMITE_INSCRITS) * 1000) / 10,
  };
}
