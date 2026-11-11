import { z } from "zod";
import type { PieceJointe, StatutDossier } from "@/lib/types";
import { districtFacultatif, telephoneFacultatif } from "@/lib/validation";

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
  /** Code secret porté par le QR code d'inscription (Tafa & Dinika). */
  qrJeton: string;
  /** AAAA-MM-JJ — plus demandée depuis le lot K, présente sur les anciens dossiers. */
  dateNaissance?: string;
  /** Plus demandé depuis le lot K, présent sur les anciens dossiers. */
  cv?: PieceJointe;
  /** Lot R : nombre de personnes représentées par cette inscription (1 par défaut). */
  nombreParticipants: number;
  /** Lot R : association ou structure indiquée sur une liste papier. */
  association?: string;
  /** Lot R : origine de l'inscription ("liste_papier" pour un import admin, absent pour le formulaire). */
  source?: string;
}

/** Ligne d'un import de liste papier par le super-administrateur (lot R). */
export const importPersonnesSchema = z.object({
  source: z.string().trim().min(1).max(60),
  lignes: z
    .array(
      z.object({
        // Clé fixe par ligne : un nouvel envoi du même import ne crée rien deux fois.
        idempotencyKey: z.string().uuid(),
        nom: z.string().trim().min(1).max(120),
        prenom: z.string().trim().max(120).optional().transform((v) => v ?? ""),
        association: z.string().trim().max(200).optional().transform((v) => v || undefined),
        nombreParticipants: z.number().int().min(1).max(200),
        telephone: telephoneFacultatif,
      })
    )
    .min(1)
    .max(500),
});
export type ImportPersonnes = z.infer<typeof importPersonnesSchema>;

export const personneInputSchema = z.object({
  idempotencyKey: z.string().uuid(),
  nom: z.string().trim().min(1, "Soraty ny anaranao.").max(120),
  prenom: z.string().trim().min(1, "Soraty ny fanampin'anaranao.").max(120),
  // Lot Q : seuls le nom et le prénom restent obligatoires ; le reste est
  // contrôlé s'il est rempli, sinon enregistré vide.
  district: districtFacultatif("Safidio ny distrika misy anao."),
  commune: z.string().trim().max(120).optional().transform((v) => v ?? ""),
  communePcode: z.string().max(20).optional(),
  fokontany: z.string().trim().max(120).optional(),
  fokontanyPcode: z.string().max(20).optional(),
  activite: z.string().trim().max(200).optional().transform((v) => v ?? ""),
  descriptionActivite: z.string().trim().max(5000).optional().transform((v) => v ?? ""),
  projet: z.string().trim().max(5000).optional().transform((v) => v ?? ""),
  telephone: telephoneFacultatif,
  email: z
    .string()
    .trim()
    .email("Toa diso ny adiresy mailaka.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});
