import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";
import { TOUS_LES_DISTRICTS } from "@/lib/districts";

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

export const dossierInputSchema = z.object({
  idempotencyKey: z.string().uuid(),
  association: z.object({
    nom: z.string().trim().min(1, "Tsy maintsy soratana ny anaran'ny fikambanana."),
    adresse: z.string().trim().min(1, "Tsy maintsy soratana ny adiresin'ny fikambanana."),
    district: z
      .string()
      .refine((val) => TOUS_LES_DISTRICTS.includes(val), "Safidio ny distrikan'ny fikambanana."),
    commune: z.string().trim().min(1, "Safidio na soraty ny kaominin'ny fikambanana.").max(120),
    communePcode: z.string().max(20).optional(),
    fokontany: z.string().trim().max(120).optional(),
    fokontanyPcode: z.string().max(20).optional(),
    activite: z.string().trim().min(1, "Tsy maintsy soratana ny asan'ny fikambanana."),
    nombreMembres: z
      .number()
      .int("Isa feno no atao amin'ny isan'ny mpikambana.")
      .positive("Tsy maintsy mihoatra ny aotra ny isan'ny mpikambana."),
  }),
  responsables: z
    .array(responsableSchema)
    .min(1, "Tsy maintsy soratana ny tompon'andraikitra voalohany."),
  coordonnees: z.object({
    telephone: z.string().refine(
      (val) => validateTelephoneMadagascar(val).valide,
      "Toa diso ny laharana finday."
    ),
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
  description: z
    .string()
    .trim()
    .min(1, "Tsy maintsy hazavaina ny tetikasa na ny fangatahana."),
  pieces: z.array(pieceJointeSchema).default([]),
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
