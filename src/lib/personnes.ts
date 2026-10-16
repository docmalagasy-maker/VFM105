import { getPool } from "@/lib/db";
import type { DossierPersonne, PersonneInput } from "@/lib/personnes-modele";
import { genererProchaineReferencePersonne } from "@/lib/reference";
import { verifierSchema } from "@/lib/schema";
import { supprimerPieceJointe } from "@/lib/stockage";
import type { StatutDossier } from "@/lib/types";

function ligneVersPersonne(row: Record<string, unknown>): DossierPersonne {
  const naissance = row.date_naissance as Date | string;
  return {
    reference: row.reference as string,
    idempotencyKey: row.idempotency_key as string,
    dateDepot: (row.date_depot as Date).toISOString(),
    statut: row.statut as StatutDossier,
    nom: row.nom as string,
    prenom: row.prenom as string,
    // Colonne DATE : lue sans décalage de fuseau.
    dateNaissance:
      typeof naissance === "string"
        ? naissance.slice(0, 10)
        : `${naissance.getFullYear()}-${String(naissance.getMonth() + 1).padStart(2, "0")}-${String(naissance.getDate()).padStart(2, "0")}`,
    district: row.district as string,
    activite: row.activite as string,
    descriptionActivite: row.description_activite as string,
    projet: row.projet as string,
    telephone: row.telephone as string,
    email: (row.email as string) ?? undefined,
    cv: (row.cv as DossierPersonne["cv"]) ?? undefined,
    emailConfirmation: (row.email_confirmation as DossierPersonne["emailConfirmation"]) ?? undefined,
  };
}

/**
 * Enregistre un dossier de personne. Idempotent comme les dossiers
 * d'associations : une même `idempotencyKey` (double clic, nouvel essai
 * réseau) renvoie le dossier déjà créé.
 */
export async function creerPersonne(input: PersonneInput): Promise<{ dossier: DossierPersonne; creeMaintenant: boolean }> {
  const pool = getPool();
  await verifierSchema();
  const relire = async () => {
    const r = await pool.query(`SELECT * FROM dossiers_personnes WHERE idempotency_key = $1`, [input.idempotencyKey]);
    return r.rows[0] ? ligneVersPersonne(r.rows[0]) : null;
  };
  const existant = await relire();
  if (existant) return { dossier: existant, creeMaintenant: false };

  const maintenant = new Date();
  const reference = await genererProchaineReferencePersonne(maintenant.getFullYear());
  const r = await pool.query(
    `INSERT INTO dossiers_personnes (
       reference, idempotency_key, date_depot, nom, prenom, date_naissance, district,
       activite, description_activite, projet, telephone, email, cv
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     ON CONFLICT (idempotency_key) DO NOTHING
     RETURNING *`,
    [
      reference,
      input.idempotencyKey,
      maintenant.toISOString(),
      input.nom,
      input.prenom,
      input.dateNaissance,
      input.district,
      input.activite,
      input.descriptionActivite,
      input.projet,
      input.telephone,
      input.email || null,
      input.cv ? JSON.stringify(input.cv) : null,
    ]
  );
  if (r.rows.length === 0) return { dossier: (await relire())!, creeMaintenant: false };
  return { dossier: ligneVersPersonne(r.rows[0]), creeMaintenant: true };
}

export async function obtenirPersonne(reference: string): Promise<DossierPersonne | null> {
  await verifierSchema();
  const r = await getPool().query(`SELECT * FROM dossiers_personnes WHERE reference = $1`, [reference]);
  return r.rows[0] ? ligneVersPersonne(r.rows[0]) : null;
}

/** Du plus récent au plus ancien ; `district` limite à ce district (administrateur de district). */
export async function listerPersonnes(recherche?: string, limite = 200, district?: string): Promise<DossierPersonne[]> {
  await verifierSchema();
  const motif = recherche?.trim() ? `%${recherche.trim()}%` : null;
  const r = await getPool().query(
    `SELECT * FROM dossiers_personnes
      WHERE ($2::text IS NULL OR district = $2)
        AND ($3::text IS NULL
          OR reference ILIKE $3 OR nom ILIKE $3 OR prenom ILIKE $3
          OR district ILIKE $3 OR activite ILIKE $3 OR telephone ILIKE $3)
      ORDER BY date_depot DESC
      LIMIT $1`,
    [limite, district ?? null, motif]
  );
  return r.rows.map(ligneVersPersonne);
}

export async function marquerEmailPersonne(reference: string, statut: "envoye" | "echoue"): Promise<void> {
  await getPool().query(`UPDATE dossiers_personnes SET email_confirmation = $1 WHERE reference = $2`, [statut, reference]);
}

export async function changerStatutPersonne(reference: string, statut: StatutDossier): Promise<boolean> {
  await verifierSchema();
  const r = await getPool().query(`UPDATE dossiers_personnes SET statut = $1 WHERE reference = $2`, [statut, reference]);
  return (r.rowCount ?? 0) > 0;
}

/** Vrai si le fichier est le CV d'une personne du district donné. */
export async function cvDuDistrict(pathname: string, district: string): Promise<boolean> {
  await verifierSchema();
  const r = await getPool().query(
    `SELECT 1 FROM dossiers_personnes WHERE district = $1 AND cv->>'pathname' = $2 LIMIT 1`,
    [district, pathname]
  );
  return r.rows.length > 0;
}

/**
 * Supprime définitivement un dossier de personne et son CV sur le disque
 * (sauf si le même fichier est cité par un autre dossier).
 */
export async function supprimerPersonne(reference: string): Promise<boolean> {
  await verifierSchema();
  const pool = getPool();
  const r = await pool.query<{ cv: DossierPersonne["cv"] | null }>(
    `DELETE FROM dossiers_personnes WHERE reference = $1 RETURNING cv`,
    [reference]
  );
  if (r.rows.length === 0) return false;
  const cv = r.rows[0].cv;
  if (cv?.pathname) {
    const encore = await pool.query(
      `SELECT 1 FROM dossiers_personnes WHERE cv->>'pathname' = $1
       UNION SELECT 1 FROM dossiers WHERE pieces @> $2::jsonb LIMIT 1`,
      [cv.pathname, JSON.stringify([{ pathname: cv.pathname }])]
    );
    if (encore.rows.length === 0) {
      await supprimerPieceJointe(cv.pathname).catch((err) => console.error("Suppression du CV impossible", cv.pathname, err));
    }
  }
  return true;
}
