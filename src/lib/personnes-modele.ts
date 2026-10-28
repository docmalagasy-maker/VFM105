import { z } from "zod";
import { TOUS_LES_DISTRICTS } from "@/lib/districts";
import type { PieceJointe, StatutDossier } from "@/lib/types";
import { validateTelephoneMadagascar } from "@/lib/validation";

/**
 * Dossiers de personnes physiques (« olona tsirairay »), partagé entre le
 * formulaire public et le serveur. Les dossiers d'associations ne changent pas.
 */

export const PREFIXE_REFERENCE_PERSONNE = "VFM-P-";
export const estReferencePersonne = (reference: string) => reference.startsWith(PREFIXE_REFERENCE_PERSONNE);

export interface PersonneInput {
  idempotencyKey: string;
  nom: string;
  prenom: string;
  district: string;
  commune: string;
  communePcode?: string;
  fokontany?: string;
  fokontanyPcode?: string;
  activite: string;
  descriptionActivite: string;
  projet: string;
  telephone: string;
  email?: string;
}

export interface DossierPersonne extends PersonneInput {
  reference: string;
  dateDepot: string;
  statut: StatutDossier;
  emailConfirmation?: "envoye" | "echoue";
  /** AAAA-MM-JJ — plus demandée depuis le lot K, présente sur les anciens dossiers. */
  dateNaissance?: string;
  /** Plus demandé depuis le lot K, présent sur les anciens dossiers. */
  cv?: PieceJointe;
}

export const personneInputSchema = z.object({
  idempotencyKey: z.string().uuid(),
  nom: z.string().trim().min(1, "Soraty ny anaranao.").max(120),
  prenom: z.string().trim().min(1, "Soraty ny fanampin'anaranao.").max(120),
  district: z.string().refine((d) => TOUS_LES_DISTRICTS.includes(d), "Safidio ny distrika misy anao."),
  commune: z
    .string({ error: "Safidio na soraty ny kaominina misy anao." })
    .trim()
    .min(1, "Safidio na soraty ny kaominina misy anao.")
    .max(120),
  communePcode: z.string().max(20).optional(),
  fokontany: z.string().trim().max(120).optional(),
  fokontanyPcode: z.string().max(20).optional(),
  activite: z.string().trim().min(1, "Soraty ny asanao ankehitriny.").max(200),
  descriptionActivite: z.string().trim().min(1, "Hazavao ny asanao.").max(5000),
  projet: z.string().trim().min(1, "Hazavao ny tetikasanao manokana.").max(5000),
  telephone: z
    .string()
    .trim()
    .refine((v) => validateTelephoneMadagascar(v).valide, "Toa diso ny laharana finday."),
  email: z
    .string()
    .trim()
    .email("Toa diso ny adiresy mailaka.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});
