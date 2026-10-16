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
  /** AAAA-MM-JJ */
  dateNaissance: string;
  district: string;
  activite: string;
  descriptionActivite: string;
  projet: string;
  telephone: string;
  email?: string;
  cv?: PieceJointe;
}

export interface DossierPersonne extends PersonneInput {
  reference: string;
  dateDepot: string;
  statut: StatutDossier;
  emailConfirmation?: "envoye" | "echoue";
}

/** Date de naissance plausible : après 1900 et avant aujourd'hui. */
export function dateNaissanceValide(valeur: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valeur)) return false;
  const d = new Date(`${valeur}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === valeur && valeur >= "1900-01-01" && d < new Date();
}

const pieceSchema = z.object({
  nom: z.string().min(1),
  pathname: z.string().min(1),
  taille: z.number().positive(),
  type: z.string().min(1),
});

export const personneInputSchema = z.object({
  idempotencyKey: z.string().uuid(),
  nom: z.string().trim().min(1, "Soraty ny anaranao.").max(120),
  prenom: z.string().trim().min(1, "Soraty ny fanampin'anaranao.").max(120),
  dateNaissance: z.string().refine(dateNaissanceValide, "Toa diso ny daty nahaterahana."),
  district: z.string().refine((d) => TOUS_LES_DISTRICTS.includes(d), "Safidio ny distrika misy anao."),
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
  cv: pieceSchema.optional(),
});
