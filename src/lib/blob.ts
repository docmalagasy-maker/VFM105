import { put } from "@vercel/blob";
import crypto from "node:crypto";
import { MAX_TAILLE_FICHIER, TYPES_FICHIERS_ACCEPTES } from "@/lib/validation";

export interface UploadResultat {
  ok: boolean;
  erreur?: string;
  piece?: { nom: string; pathname: string; taille: number; type: string };
}

export function isBlobConfigure(): boolean {
  // Deux modes d'authentification possibles selon comment le store a été
  // connecté au projet Vercel : jeton classique, ou OIDC (BLOB_STORE_ID
  // suffit alors, le SDK récupère le jeton automatiquement à l'exécution).
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

/**
 * Stocke une pièce jointe sur Vercel Blob en accès privé : le fichier n'est
 * jamais accessible par une URL publique, uniquement via la route
 * `/api/admin/pieces/...` (protégée par l'authentification admin) qui lit le
 * blob côté serveur.
 */
export async function uploaderPieceJointe(fichier: File): Promise<UploadResultat> {
  if (fichier.size > MAX_TAILLE_FICHIER) {
    return { ok: false, erreur: "Ce fichier est trop volumineux (10 Mo maximum)." };
  }
  if (!TYPES_FICHIERS_ACCEPTES.includes(fichier.type)) {
    return { ok: false, erreur: "Type de fichier non accepté." };
  }
  if (!isBlobConfigure()) {
    return {
      ok: false,
      erreur: "Stockage des pièces jointes non configuré (BLOB_READ_WRITE_TOKEN ou BLOB_STORE_ID).",
    };
  }

  const nomSecurise = `${crypto.randomUUID()}-${fichier.name}`.replace(/[^\w.\-]/g, "_");

  const blob = await put(`dossiers/${nomSecurise}`, fichier, {
    access: "private",
    addRandomSuffix: true,
  });

  return {
    ok: true,
    piece: {
      nom: fichier.name,
      pathname: blob.pathname,
      taille: fichier.size,
      type: fichier.type,
    },
  };
}
