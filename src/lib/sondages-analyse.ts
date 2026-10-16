import type { ReponseSondage } from "@/lib/sondages";
import { libelleSexe, regionDuDistrict, type Question, type Sondage } from "@/lib/sondages-modele";

/** Calculs des résultats d'un sondage, sur des réponses déjà filtrées. */

export type Regroupement = "aucun" | "sexe" | "region" | "district";
export type Tri = "ordre" | "desc";

export const REGROUPEMENTS: { valeur: Regroupement; libelle: string }[] = [
  { valeur: "aucun", libelle: "Aucun" },
  { valeur: "sexe", libelle: "Sexe" },
  { valeur: "region", libelle: "Région" },
  { valeur: "district", libelle: "District" },
];

function cleGroupe(r: ReponseSondage, g: Regroupement): string {
  if (g === "sexe") return libelleSexe(r.sexe);
  if (g === "region") return regionDuDistrict(r.district);
  if (g === "district") return r.district;
  return "Ensemble";
}

export interface LigneOption {
  index: number;
  libelle: string;
  nombre: number;
  /** Part des participants ayant répondu à la question (0 à 1). */
  part: number;
}

export interface LigneClassement {
  index: number;
  libelle: string;
  /** Rang moyen (1 = préféré). */
  rangMoyen: number;
  premieres: number;
  /** Score de Borda normalisé (0 à 1, 1 = toujours premier). */
  score: number;
}

export interface Groupe<T> {
  nom: string;
  repondants: number;
  valeur: T;
}

export type ResultatQuestion =
  | { question: Question; type: "choix"; repondants: number; options: LigneOption[]; groupes: Groupe<LigneOption[]>[] }
  | {
      question: Question;
      type: "note";
      repondants: number;
      moyenne: number;
      mediane: number;
      repartition: LigneOption[];
      groupes: Groupe<{ moyenne: number; mediane: number }>[];
    }
  | { question: Question; type: "texte"; repondants: number; textes: { texte: string; sexe: string; district: string; creeLe: string }[] }
  | { question: Question; type: "classement"; repondants: number; lignes: LigneClassement[]; groupes: Groupe<LigneClassement[]>[] };

export interface Synthese {
  total: number;
  parSexe: { nom: string; nombre: number }[];
  districts: number;
  regions: number;
  premiere?: string;
  derniere?: string;
  parJour: { jour: string; nombre: number }[];
  parZone: { nom: string; region: string; nombre: number }[];
}

const mediane = (valeurs: number[]) => {
  if (valeurs.length === 0) return 0;
  const t = [...valeurs].sort((a, b) => a - b);
  const m = Math.floor(t.length / 2);
  return t.length % 2 ? t[m] : (t[m - 1] + t[m]) / 2;
};
const moyenne = (valeurs: number[]) => (valeurs.length ? valeurs.reduce((a, b) => a + b, 0) / valeurs.length : 0);

const jourMadagascar = (iso: string) =>
  new Date(iso).toLocaleDateString("sv-SE", { timeZone: "Indian/Antananarivo" });

export function calculerSynthese(reponses: ReponseSondage[]): Synthese {
  const parSexe = new Map<string, number>();
  const parJour = new Map<string, number>();
  const parDistrict = new Map<string, number>();
  for (const r of reponses) {
    const s = libelleSexe(r.sexe);
    parSexe.set(s, (parSexe.get(s) ?? 0) + 1);
    const j = jourMadagascar(r.creeLe);
    parJour.set(j, (parJour.get(j) ?? 0) + 1);
    parDistrict.set(r.district, (parDistrict.get(r.district) ?? 0) + 1);
  }
  // Jours sans réponse inclus, pour une chronologie continue.
  const jours = [...parJour.keys()].sort();
  const chronologie: { jour: string; nombre: number }[] = [];
  if (jours.length) {
    const fin = new Date(`${jours[jours.length - 1]}T00:00:00Z`);
    for (let d = new Date(`${jours[0]}T00:00:00Z`); d <= fin; d.setUTCDate(d.getUTCDate() + 1)) {
      const j = d.toISOString().slice(0, 10);
      chronologie.push({ jour: j, nombre: parJour.get(j) ?? 0 });
    }
  }
  const dates = reponses.map((r) => r.creeLe).sort();
  return {
    total: reponses.length,
    parSexe: ["Homme", "Femme"].map((nom) => ({ nom, nombre: parSexe.get(nom) ?? 0 })),
    districts: parDistrict.size,
    regions: new Set([...parDistrict.keys()].map(regionDuDistrict)).size,
    premiere: dates[0],
    derniere: dates[dates.length - 1],
    parJour: chronologie,
    parZone: [...parDistrict.entries()]
      .map(([nom, nombre]) => ({ nom, region: regionDuDistrict(nom), nombre }))
      .sort((a, b) => b.nombre - a.nombre || a.nom.localeCompare(b.nom, "fr")),
  };
}

function compterOptions(q: Question, valeurs: (number | number[])[], tri: Tri): LigneOption[] {
  const comptes = q.options.map(() => 0);
  for (const v of valeurs) for (const i of Array.isArray(v) ? v : [v]) comptes[i] = (comptes[i] ?? 0) + 1;
  const lignes = q.options.map((libelle, index) => ({
    index,
    libelle,
    nombre: comptes[index],
    part: valeurs.length ? comptes[index] / valeurs.length : 0,
  }));
  return tri === "desc" ? lignes.sort((a, b) => b.nombre - a.nombre || a.index - b.index) : lignes;
}

function analyserClassement(q: Question, valeurs: number[][], tri: Tri): LigneClassement[] {
  const n = q.options.length;
  const rangs = q.options.map(() => [] as number[]);
  const premieres = q.options.map(() => 0);
  for (const ordre of valeurs) {
    ordre.forEach((index, position) => rangs[index]?.push(position + 1));
    if (ordre[0] !== undefined) premieres[ordre[0]] += 1;
  }
  const lignes = q.options.map((libelle, index) => {
    const rangMoyen = moyenne(rangs[index]);
    return {
      index,
      libelle,
      rangMoyen,
      premieres: premieres[index],
      score: rangs[index].length && n > 1 ? (n - rangMoyen) / (n - 1) : 0,
    };
  });
  return tri === "desc" ? lignes.sort((a, b) => a.rangMoyen - b.rangMoyen || a.index - b.index) : lignes;
}

/** Groupes triés par effectif décroissant (les plus représentés d'abord). */
function grouper(reponses: ReponseSondage[], g: Regroupement): [string, ReponseSondage[]][] {
  if (g === "aucun") return [];
  const m = new Map<string, ReponseSondage[]>();
  for (const r of reponses) {
    const k = cleGroupe(r, g);
    m.set(k, [...(m.get(k) ?? []), r]);
  }
  return [...m.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], "fr"));
}

export function analyserQuestions(
  sondage: Sondage,
  reponses: ReponseSondage[],
  regroupement: Regroupement,
  tri: Tri
): ResultatQuestion[] {
  const groupes = grouper(reponses, regroupement);
  const valeursDe = <T,>(liste: ReponseSondage[], q: Question) =>
    liste.map((r) => r.reponses[q.id]).filter((v) => v !== undefined && v !== "") as T[];

  return sondage.questions.map((q): ResultatQuestion => {
    if (q.type === "unique" || q.type === "multiple") {
      const valeurs = valeursDe<number | number[]>(reponses, q);
      return {
        question: q,
        type: "choix",
        repondants: valeurs.length,
        options: compterOptions(q, valeurs, tri),
        // Dans les comparaisons, les options gardent l'ordre de l'ensemble.
        groupes: groupes.map(([nom, liste]) => {
          const v = valeursDe<number | number[]>(liste, q);
          return { nom, repondants: v.length, valeur: compterOptions(q, v, "ordre") };
        }),
      };
    }
    if (q.type === "note") {
      const valeurs = valeursDe<number>(reponses, q);
      const repartition = [1, 2, 3, 4, 5].map((note, index) => {
        const nombre = valeurs.filter((v) => v === note).length;
        return { index, libelle: `${note} / 5`, nombre, part: valeurs.length ? nombre / valeurs.length : 0 };
      });
      return {
        question: q,
        type: "note",
        repondants: valeurs.length,
        moyenne: moyenne(valeurs),
        mediane: mediane(valeurs),
        repartition,
        groupes: groupes.map(([nom, liste]) => {
          const v = valeursDe<number>(liste, q);
          return { nom, repondants: v.length, valeur: { moyenne: moyenne(v), mediane: mediane(v) } };
        }),
      };
    }
    if (q.type === "texte") {
      const textes = reponses
        .filter((r) => typeof r.reponses[q.id] === "string" && (r.reponses[q.id] as string).trim())
        .map((r) => ({ texte: r.reponses[q.id] as string, sexe: libelleSexe(r.sexe), district: r.district, creeLe: r.creeLe }));
      return { question: q, type: "texte", repondants: textes.length, textes };
    }
    const valeurs = valeursDe<number[]>(reponses, q);
    return {
      question: q,
      type: "classement",
      repondants: valeurs.length,
      lignes: analyserClassement(q, valeurs, tri),
      groupes: groupes.map(([nom, liste]) => {
        const v = valeursDe<number[]>(liste, q);
        return { nom, repondants: v.length, valeur: analyserClassement(q, v, "ordre") };
      }),
    };
  });
}
