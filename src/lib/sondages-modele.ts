import { z } from "zod";
import { DISTRICTS_PAR_REGION, TOUS_LES_DISTRICTS } from "@/lib/districts";

/**
 * Modèle des sondages « Manehoa hevitra », partagé entre le serveur, l'éditeur
 * de l'administration et le formulaire public (aucune dépendance serveur).
 */

export const MAX_SONDAGES = 30;
export const MAX_QUESTIONS = 30;
export const MAX_OPTIONS = 20;
export const MAX_TEXTE_REPONSE = 2000;

export type TypeQuestion = "unique" | "multiple" | "note" | "texte" | "classement";

export const TYPES_QUESTION: { type: TypeQuestion; libelle: string; avecOptions: boolean }[] = [
  { type: "unique", libelle: "Choix unique", avecOptions: true },
  { type: "multiple", libelle: "Choix multiples", avecOptions: true },
  { type: "note", libelle: "Note de 1 à 5", avecOptions: false },
  { type: "texte", libelle: "Texte libre", avecOptions: false },
  { type: "classement", libelle: "Classement", avecOptions: true },
];

export const avecOptions = (type: TypeQuestion) =>
  TYPES_QUESTION.find((t) => t.type === type)?.avecOptions ?? false;

export interface Question {
  id: string;
  type: TypeQuestion;
  intitule: string;
  obligatoire: boolean;
  /** Propositions (choix unique, multiples, classement) ; vide pour note et texte. */
  options: string[];
}

export interface Sondage {
  id: number;
  titre: string;
  description: string;
  actif: boolean;
  questions: Question[];
  creeLe: string;
  modifieLe: string;
}

/**
 * Valeur d'une réponse, par type : unique → index de l'option ; multiple →
 * index des options ; note → 1 à 5 ; texte → chaîne ; classement → index des
 * options du préféré au moins aimé (ordre complet).
 */
export type ValeurReponse = number | number[] | string;

export type Sexe = "lahy" | "vavy";
export const SEXES: { valeur: Sexe; libelle: string; libelleFr: string }[] = [
  { valeur: "lahy", libelle: "Lahy", libelleFr: "Homme" },
  { valeur: "vavy", libelle: "Vavy", libelleFr: "Femme" },
];
export const libelleSexe = (s: string) => SEXES.find((x) => x.valeur === s)?.libelleFr ?? s;

const REGION_PAR_DISTRICT = new Map(
  DISTRICTS_PAR_REGION.flatMap((r) => r.districts.map((d) => [d, r.region] as const))
);
export const regionDuDistrict = (district: string) => REGION_PAR_DISTRICT.get(district) ?? "—";

// ---------- Validation de la définition d'un sondage (administration) ----------

const questionSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]{6,16}$/, "Identifiant de question invalide."),
    type: z.enum(["unique", "multiple", "note", "texte", "classement"]),
    intitule: z.string().trim().min(1, "Chaque question doit avoir un intitulé.").max(300),
    obligatoire: z.boolean(),
    options: z.array(z.string().trim().min(1, "Une proposition est vide.").max(200)).max(MAX_OPTIONS),
  })
  .superRefine((q, ctx) => {
    if (avecOptions(q.type)) {
      if (q.options.length < 2) {
        ctx.addIssue({ code: "custom", message: `« ${q.intitule} » : au moins 2 propositions.` });
      }
      const uniques = new Set(q.options.map((o) => o.toLowerCase()));
      if (uniques.size !== q.options.length) {
        ctx.addIssue({ code: "custom", message: `« ${q.intitule} » : propositions en double.` });
      }
    }
  })
  .transform((q) => ({ ...q, options: avecOptions(q.type) ? q.options : [] }));

export const sondageSchema = z
  .object({
    titre: z.string().trim().min(1, "Le titre est obligatoire.").max(200),
    description: z.string().trim().max(2000).default(""),
    actif: z.boolean().default(false),
    questions: z
      .array(questionSchema)
      .min(1, "Ajoutez au moins une question.")
      .max(MAX_QUESTIONS, `${MAX_QUESTIONS} questions au maximum.`),
  })
  .superRefine((s, ctx) => {
    if (new Set(s.questions.map((q) => q.id)).size !== s.questions.length) {
      ctx.addIssue({ code: "custom", message: "Deux questions ont le même identifiant." });
    }
  });

export type SondageSaisi = z.infer<typeof sondageSchema>;

// ---------- Validation d'une participation (public, messages en malgache) ----------

export const participationSchema = z.object({
  sexe: z.enum(["lahy", "vavy"], { message: "Safidio ny maha-lahy na maha-vavy anao." }),
  district: z
    .string()
    .refine((d) => TOUS_LES_DISTRICTS.includes(d), { message: "Safidio ny distrika misy anao." }),
  reponses: z.record(z.string(), z.union([z.number(), z.array(z.number()), z.string()])),
  /** Champ piège invisible : rempli seulement par les robots. */
  site: z.string().optional(),
});

/** Contrôle les réponses au regard des questions ; renvoie les valeurs nettoyées ou un message. */
export function verifierReponses(
  questions: Question[],
  brutes: Record<string, ValeurReponse>
): { ok: true; reponses: Record<string, ValeurReponse> } | { ok: false; erreur: string } {
  const propres: Record<string, ValeurReponse> = {};
  for (const q of questions) {
    const v = brutes[q.id];
    const vide =
      v === undefined || v === "" || (Array.isArray(v) && v.length === 0) || (typeof v === "string" && !v.trim());
    if (vide) {
      if (q.obligatoire) return { ok: false, erreur: `Valiana ity fanontaniana ity : « ${q.intitule} »` };
      continue;
    }
    const indexValide = (n: unknown) => Number.isInteger(n) && (n as number) >= 0 && (n as number) < q.options.length;
    const invalide = { ok: false as const, erreur: `Valiny tsy mety : « ${q.intitule} »` };
    switch (q.type) {
      case "unique":
        if (!indexValide(v)) return invalide;
        propres[q.id] = v as number;
        break;
      case "multiple": {
        if (!Array.isArray(v) || !v.every(indexValide) || new Set(v).size !== v.length) return invalide;
        propres[q.id] = [...v].sort((a, b) => a - b);
        break;
      }
      case "note":
        if (!Number.isInteger(v) || (v as number) < 1 || (v as number) > 5) return invalide;
        propres[q.id] = v as number;
        break;
      case "texte":
        if (typeof v !== "string") return invalide;
        propres[q.id] = v.trim().slice(0, MAX_TEXTE_REPONSE);
        break;
      case "classement": {
        // Ordre complet : chaque proposition exactement une fois.
        if (
          !Array.isArray(v) ||
          v.length !== q.options.length ||
          !v.every(indexValide) ||
          new Set(v).size !== v.length
        ) {
          return invalide;
        }
        propres[q.id] = v;
        break;
      }
    }
  }
  return { ok: true, reponses: propres };
}

export function nouvelIdQuestion(): string {
  return Math.random().toString(36).slice(2, 10).padEnd(8, "0");
}
