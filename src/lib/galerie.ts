import crypto from "node:crypto";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Deux sources de photos pour la galerie publique :
 * - « dossier » : le dossier GALERIE du dépôt Git, copié dans l'image Docker
 *   à chaque déploiement (ajout/suppression via GitHub Desktop, lecture seule
 *   sur le serveur) ;
 * - « envoi » : les photos envoyées depuis /admin, stockées dans le volume
 *   persistant (UPLOAD_DIR/galerie), donc conservées entre les déploiements.
 */
export type SourcePhoto = "dossier" | "envoi";

export interface Photo {
  source: SourcePhoto;
  nom: string;
  /** URL publique de la photo (servie par /galerie/photo/...). */
  url: string;
  /** Légende déduite du nom de fichier (« 01-fete-nationale_2026.jpg » → « fete nationale 2026 »). */
  legende: string;
  date: number;
}

export const TYPES_PAR_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const EXTENSION_PAR_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export const MAX_TAILLE_PHOTO = 15 * 1024 * 1024; // 15 Mo

function dossierSource(source: SourcePhoto): string {
  // Chemins choisis à l'exécution : ne pas les inclure dans le traçage du build
  // (le dossier GALERIE est copié dans l'image Docker par le Dockerfile).
  return source === "dossier"
    ? path.resolve(/*turbopackIgnore: true*/ process.env.GALERIE_DIR || path.join(process.cwd(), "GALERIE"))
    : path.resolve(
        /*turbopackIgnore: true*/ process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads"),
        "galerie"
      );
}

/** Chemin d'une photo, en refusant tout nom qui sortirait du dossier ou ne serait pas une image. */
export function cheminPhoto(source: SourcePhoto, nom: string): string | null {
  if (!TYPES_PAR_EXTENSION[path.extname(nom).toLowerCase()]) return null;
  const racine = dossierSource(source);
  const absolu = path.resolve(/*turbopackIgnore: true*/ racine, nom);
  return path.dirname(absolu) === racine ? absolu : null;
}

/** Noms donnés automatiquement par les téléphones et applications : pas de légende. */
const NOM_AUTOMATIQUE =
  /^(img|vid|dsc|dscn|pxl|picsart|file|screenshot|capture|whatsapp|photo|image|signal|received)([\s_-]|\d|$)|^[\d\s_-]+$|^[0-9a-f]{16,}$/i;

function legende(nom: string, source: SourcePhoto): string {
  if (source === "envoi") return "";
  // Préfixe d'ordre « 01- » retiré (non affiché)
  const base = path.basename(nom, path.extname(nom)).replace(/^\d+[\s_-]+(?=\D)/, "");
  if (NOM_AUTOMATIQUE.test(base)) return "";
  return base
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function lister(source: SourcePhoto): Promise<Photo[]> {
  const racine = dossierSource(source);
  let noms: string[];
  try {
    noms = await readdir(racine);
  } catch {
    return [];
  }
  const photos: Photo[] = [];
  for (const nom of noms) {
    if (nom.startsWith(".") || !cheminPhoto(source, nom)) continue;
    const infos = await stat(path.join(racine, nom)).catch(() => null);
    if (!infos?.isFile()) continue;
    photos.push({
      source,
      nom,
      url: `/galerie/photo/${source}/${encodeURIComponent(nom)}`,
      legende: legende(nom, source),
      date: infos.mtimeMs,
    });
  }
  return photos;
}

/**
 * Toutes les photos : d'abord celles envoyées depuis l'admin (plus récentes
 * en premier), puis celles du dossier GALERIE (ordre alphabétique : préfixer
 * les noms de fichiers par 01-, 02-... pour choisir l'ordre).
 */
export async function listerPhotos(): Promise<Photo[]> {
  const [envois, dossier] = await Promise.all([lister("envoi"), lister("dossier")]);
  envois.sort((a, b) => b.date - a.date);
  dossier.sort((a, b) => a.nom.localeCompare(b.nom, "fr", { numeric: true }));
  return [...envois, ...dossier];
}

export async function lirePhoto(
  source: SourcePhoto,
  nom: string
): Promise<{ contenu: Buffer; type: string } | null> {
  const absolu = cheminPhoto(source, nom);
  if (!absolu) return null;
  try {
    return { contenu: await readFile(/*turbopackIgnore: true*/ absolu), type: TYPES_PAR_EXTENSION[path.extname(absolu).toLowerCase()] };
  } catch {
    return null;
  }
}

export async function ajouterPhoto(fichier: File): Promise<{ ok: true; nom: string } | { ok: false; erreur: string }> {
  const extension = EXTENSION_PAR_TYPE[fichier.type];
  if (!extension) return { ok: false, erreur: `${fichier.name} : format non accepté (JPEG, PNG, WebP ou GIF).` };
  if (fichier.size > MAX_TAILLE_PHOTO) return { ok: false, erreur: `${fichier.name} : trop volumineux (15 Mo maximum).` };

  // Nom horodaté + aléatoire : jamais le nom fourni, et tri chronologique simple.
  const nom = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}${extension}`;
  const destination = cheminPhoto("envoi", nom);
  if (!destination) return { ok: false, erreur: "Nom de fichier invalide." };
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, Buffer.from(await fichier.arrayBuffer()));
  return { ok: true, nom };
}

/** Supprime une photo envoyée depuis l'admin (celles du dossier GALERIE se gèrent via Git). */
export async function supprimerPhoto(nom: string): Promise<boolean> {
  const absolu = cheminPhoto("envoi", nom);
  if (!absolu) return false;
  const existe = await stat(/*turbopackIgnore: true*/ absolu).then((s) => s.isFile()).catch(() => false);
  if (!existe) return false;
  await rm(absolu, { force: true });
  return true;
}
