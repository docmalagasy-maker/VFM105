import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";

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
  nom: z.string().trim().min(1, "Le nom du responsable est obligatoire."),
  prenom: z.string().trim().min(1, "Le prénom du responsable est obligatoire."),
});

export const pieceJointeSchema = z.object({
  nom: z.string().min(1),
  url: z.string().url(),
  taille: z.number().positive(),
  type: z.string().min(1),
});

export const dossierInputSchema = z.object({
  idempotencyKey: z.string().uuid(),
  association: z.object({
    nom: z.string().trim().min(1, "Le nom de l'association est obligatoire."),
    adresse: z.string().trim().min(1, "L'adresse de l'association est obligatoire."),
    activite: z.string().trim().min(1, "L'activité de l'association est obligatoire."),
    nombreMembres: z
      .number()
      .int("Le nombre de membres doit être un nombre entier.")
      .positive("Le nombre de membres doit être positif."),
  }),
  responsables: z
    .array(responsableSchema)
    .min(1, "Le responsable principal est obligatoire."),
  coordonnees: z.object({
    telephone: z.string().refine(
      (val) => validateTelephoneMadagascar(val).valide,
      "Le numéro de téléphone semble incorrect."
    ),
    email: z
      .string()
      .trim()
      .email("L'adresse e-mail semble incorrecte.")
      .optional()
      .or(z.literal("")),
    autres: z
      .array(z.object({ type: z.string(), valeur: z.string() }))
      .optional(),
  }),
  description: z
    .string()
    .trim()
    .min(1, "La description du projet ou de la demande est obligatoire."),
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
