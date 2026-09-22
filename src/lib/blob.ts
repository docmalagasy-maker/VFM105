import { put } from "@vercel/blob";
import crypto from "node:crypto";
import { MAX_TAILLE_FICHIER, TYPES_FICHIERS_ACCEPTES } from "@/lib/validation";

export interface UploadResultat {
  ok: boolean;
  erreur?: string;
  piece?: { nom: string; url: string; taille: number; type: string };
}

/**
 * Stocke une pièce jointe sur Vercel Blob (espace sécurisé, accès par URL
 * signée le temps nécessaire). Nécessite la variable BLOB_READ_WRITE_TOKEN
 * (créée automatiquement en ajoutant le store "Blob" depuis Vercel Storage).
 */
export async function uploaderPieceJointe(fichier: File): Promise<UploadResultat> {
  if (fichier.size > MAX_TAILLE_FICHIER) {
    return { ok: false, erreur: "Ce fichier est trop volumineux (10 Mo maximum)." };
  }
  if (!TYPES_FICHIERS_ACCEPTES.includes(fichier.type)) {
    return { ok: false, erreur: "Type de fichier non accepté." };
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      ok: false,
      erreur: "Stockage des pièces jointes non configuré (BLOB_READ_WRITE_TOKEN).",
    };
  }

  const nomSecurise = `${crypto.randomUUID()}-${fichier.name}`.replace(/[^\w.\-]/g, "_");

  const blob = await put(`dossiers/${nomSecurise}`, fichier, {
    access: "public",
    addRandomSuffix: true,
  });

  return {
    ok: true,
    piece: {
      nom: fichier.name,
      url: blob.url,
      taille: fichier.size,
      type: fichier.type,
    },
  };
}
