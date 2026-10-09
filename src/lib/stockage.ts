import crypto from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { MAX_TAILLE_FICHIER, TYPES_FICHIERS_ACCEPTES } from "@/lib/validation";

export interface UploadResultat {
  ok: boolean;
  erreur?: string;
  piece?: { nom: string; pathname: string; taille: number; type: string };
}

const TYPES_PAR_EXTENSION: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const EXTENSION_PAR_TYPE: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

/**
 * Dossier racine des pièces jointes, sur le disque du serveur. En production
 * (Coolify), il doit pointer vers un volume persistant, sinon les fichiers
 * sont perdus à chaque redéploiement. Il n'est jamais servi publiquement :
 * les fichiers ne sont lisibles que via `/api/admin/pieces/...` (protégée par
 * l'authentification admin).
 */
function dossierStockage(): string {
  return path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads"));
}

/** Résout un chemin interne en refusant toute sortie du dossier de stockage. */
function cheminAbsolu(pathname: string): string | null {
  const racine = dossierStockage();
  const absolu = path.resolve(racine, pathname);
  return absolu.startsWith(racine + path.sep) ? absolu : null;
}

export async function uploaderPieceJointe(fichier: File): Promise<UploadResultat> {
  if (fichier.size > MAX_TAILLE_FICHIER) {
    return { ok: false, erreur: "Lehibe loatra ity rakitra ity (10 Mo farafahabetsany)." };
  }
  if (!TYPES_FICHIERS_ACCEPTES.includes(fichier.type)) {
    return { ok: false, erreur: "Tsy ekena io karazana rakitra io." };
  }

  // Le nom stocké ne dépend jamais du nom fourni par le visiteur (hors
  // affichage) : identifiant aléatoire + extension déduite du type contrôlé.
  const pathname = `dossiers/${crypto.randomUUID()}${EXTENSION_PAR_TYPE[fichier.type]}`;
  const destination = cheminAbsolu(pathname);
  if (!destination) {
    return { ok: false, erreur: "Tsy mety ny toerana fitehirizana." };
  }

  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, Buffer.from(await fichier.arrayBuffer()));

  return {
    ok: true,
    piece: {
      nom: fichier.name,
      pathname,
      taille: fichier.size,
      type: fichier.type,
    },
  };
}

export async function lirePieceJointe(
  pathname: string
): Promise<{ contenu: Buffer; type: string } | null> {
  const absolu = cheminAbsolu(pathname);
  if (!absolu) return null;
  try {
    const contenu = await readFile(absolu);
    const type = TYPES_PAR_EXTENSION[path.extname(absolu).toLowerCase()] ?? "application/octet-stream";
    return { contenu, type };
  } catch {
    return null;
  }
}

/** Supprime une pièce jointe du disque. Sans effet si elle n'existe plus. */
export async function supprimerPieceJointe(pathname: string): Promise<void> {
  const absolu = cheminAbsolu(pathname);
  if (!absolu) return;
  await rm(absolu, { force: true });
}
