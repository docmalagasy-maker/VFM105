import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";
import { TOUS_LES_DISTRICTS } from "@/lib/districts";
import type { PieceJointe } from "@/lib/types";

// Madagascar : numéros mobiles à 10 chiffres commençant par 032/033/034/037/038,
// acceptés avec ou sans indicatif +261.
export function validateTelephoneMadagascar(valeur: string): {
  valide: boolean;
  formate?: string;
} {
  const nettoye = valeur.trim();
  const phone = parsePhoneNumberFromString(nettoye, "MG");
  if (phone && phone.isValid() && phone.country === "MG") {
    return { valide: true, formate: phone.formatInternational() };
  }
  // Repli : format local strict 0XX XX XXX XX (10 chiffres, préfixes mobiles connus).
  const local = nettoye.replace(/[\s.-]/g, "");
  if (/^0(32|33|34|37|38)\d{7}$/.test(local)) {
    return { valide: true, formate: `+261${local.slice(1)}` };
  }
  return { valide: false };
}

export const responsableSchema = z.object({
  nom: z.string().trim().min(1, "Tsy maintsy soratana ny anaran'ny tompon'andraikitra."),
  prenom: z.string().trim().min(1, "Tsy maintsy soratana ny fanampin'anaran'ny tompon'andraikitra."),
});

export const pieceJointeSchema = z.object({
  nom: z.string().min(1),
  pathname: z.string().min(1),
  taille: z.number().positive(),
  type: z.string().min(1),
});

/** Champ texte facultatif (lot Q) : absent ou vide devient "". */
const texteFacultatif = (max: number) => z.string().trim().max(max).optional().transform((v) => v ?? "");

/** Téléphone facultatif (lot Q), mais contrôlé s'il est rempli. */
export const telephoneFacultatif = z
  .string()
  .trim()
  .optional()
  .transform((v) => v ?? "")
  .refine((v) => v === "" || validateTelephoneMadagascar(v).valide, "Toa diso ny laharana finday.");

/** District facultatif (lot Q), mais pris dans la liste officielle s'il est choisi. */
export const districtFacultatif = (message: string) =>
  z
    .string()
    .optional()
    .transform((v) => v ?? "")
    .refine((v) => v === "" || TOUS_LES_DISTRICTS.includes(v), message);

// Lot Q : seuls le nom et le prénom (de la personne qui assistera aux Tafa sy
// Dinika) restent obligatoires ; les autres champs sont contrôlés s'ils sont remplis.
export const dossierInputSchema = z.object({
  idempotencyKey: z.string().uuid(),
  association: z.object({
    nom: texteFacultatif(300),
    adresse: texteFacultatif(1000),
    district: districtFacultatif("Safidio ny distrikan'ny fikambanana."),
    commune: texteFacultatif(120),
    communePcode: z.string().max(20).optional(),
    fokontany: z.string().trim().max(120).optional(),
    fokontanyPcode: z.string().max(20).optional(),
    activite: texteFacultatif(200),
    nombreMembres: z
      .number()
      .int("Isa feno no atao amin'ny isan'ny mpikambana.")
      .positive("Tsy maintsy mihoatra ny aotra ny isan'ny mpikambana.")
      .nullable()
      .optional()
      .transform((v) => v ?? null),
  }),
  responsables: z
    .array(responsableSchema)
    .min(1, "Soraty ny anaran'izay hanatrika ny Tafa sy Dinika.")
    // Un seul nom : la personne qui assistera aux Tafa sy Dinika
    .transform((r) => r.slice(0, 1)),
  coordonnees: z.object({
    telephone: telephoneFacultatif,
    email: z
      .string()
      .trim()
      .email("Toa diso ny adiresy mailaka.")
      .optional()
      .or(z.literal("")),
    autres: z
      .array(z.object({ type: z.string(), valeur: z.string() }))
      .optional(),
  }),
  description: texteFacultatif(5000),
  // Pièces jointes supprimées du formulaire : tout envoi éventuel est ignoré.
  // `.optional()` : le formulaire n'envoie plus ce champ ; sans lui, zod 4
  // refusait le dossier (« expected nonoptional »).
  pieces: z.unknown().optional().transform((): PieceJointe[] => []),
});

export const MAX_TAILLE_FICHIER = 10 * 1024 * 1024; // 10 Mo

export const TYPES_FICHIERS_ACCEPTES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
];
