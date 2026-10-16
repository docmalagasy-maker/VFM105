/** Cellule CSV (séparateur « ; », guillemets doublés). */
function cellule(valeur: string | number | null | undefined): string {
  if (valeur === null || valeur === undefined) return "";
  let texte = typeof valeur === "number" ? String(valeur).replace(".", ",") : valeur;
  // Données saisies par le public : neutralise les formules (=, +, -, @) à l'ouverture dans Excel.
  if (typeof valeur === "string" && /^[=+\-@\t\r]/.test(texte)) texte = `'${texte}`;
  return /[";\n\r]/.test(texte) ? `"${texte.replace(/"/g, '""')}"` : texte;
}

export function csv(entetes: string[], lignes: (string | number | null | undefined)[][]): string {
  // BOM UTF-8 : Excel ouvre directement le fichier avec les bons accents.
  return "﻿" + [entetes, ...lignes].map((l) => l.map(cellule).join(";")).join("\r\n") + "\r\n";
}

export const arrondi = (n: number) => Math.round(n * 10) / 10;
