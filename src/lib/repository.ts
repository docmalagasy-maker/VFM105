import { getPool } from "@/lib/db";
import { genererProchaineReference } from "@/lib/reference";
import type { Dossier, DossierInput, StatutDossier } from "@/lib/types";

function ligneVersDossier(row: Record<string, unknown>): Dossier {
  return {
    reference: row.reference as string,
    idempotencyKey: row.idempotency_key as string,
    dateDepot: (row.date_depot as Date).toISOString(),
    statut: row.statut as StatutDossier,
    statutSms: row.statut_sms as Dossier["statutSms"],
    smsDate: row.sms_date ? (row.sms_date as Date).toISOString() : undefined,
    association: {
      nom: row.association_nom as string,
      adresse: row.association_adresse as string,
      activite: row.association_activite as string,
      nombreMembres: row.association_nombre_membres as number,
    },
    responsables: row.responsables as Dossier["responsables"],
    coordonnees: {
      telephone: row.telephone as string,
      email: (row.email as string) ?? undefined,
      autres: (row.autres_coordonnees as Dossier["coordonnees"]["autres"]) ?? [],
    },
    description: row.description as string,
    pieces: row.pieces as Dossier["pieces"],
  };
}

/**
 * Enregistre définitivement un dossier. Idempotent : si `idempotencyKey` a
 * déjà été utilisé (double clic, retry réseau), retourne le dossier existant
 * sans en recréer un ni renvoyer de SMS.
 */
export async function creerDossier(input: DossierInput): Promise<{
  dossier: Dossier;
  creeMaintenant: boolean;
}> {
  const pool = getPool();

  const existant = await pool.query(
    `SELECT * FROM dossiers WHERE idempotency_key = $1`,
    [input.idempotencyKey]
  );
  if (existant.rows.length > 0) {
    return { dossier: ligneVersDossier(existant.rows[0]), creeMaintenant: false };
  }

  const maintenant = new Date();
  const reference = await genererProchaineReference(maintenant.getFullYear());

  const result = await pool.query(
    `INSERT INTO dossiers (
       reference, idempotency_key, date_depot, statut, statut_sms,
       association_nom, association_adresse, association_activite, association_nombre_membres,
       responsables, telephone, email, autres_coordonnees, description, pieces
     ) VALUES ($1,$2,$3,'recu','a_envoyer',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     ON CONFLICT (idempotency_key) DO NOTHING
     RETURNING *`,
    [
      reference,
      input.idempotencyKey,
      maintenant.toISOString(),
      input.association.nom,
      input.association.adresse,
      input.association.activite,
      input.association.nombreMembres,
      JSON.stringify(input.responsables),
      input.coordonnees.telephone,
      input.coordonnees.email || null,
      JSON.stringify(input.coordonnees.autres ?? []),
      input.description,
      JSON.stringify(input.pieces),
    ]
  );

  // Course concurrente sur la même idempotencyKey : quelqu'un d'autre a gagné entre-temps.
  if (result.rows.length === 0) {
    const relecture = await pool.query(
      `SELECT * FROM dossiers WHERE idempotency_key = $1`,
      [input.idempotencyKey]
    );
    return { dossier: ligneVersDossier(relecture.rows[0]), creeMaintenant: false };
  }

  const dossier = ligneVersDossier(result.rows[0]);

  // Le SMS n'est pas envoyé ici : il reste en statut "a_envoyer" et sera
  // relevé par la passerelle Android au prochain sondage (voir
  // /api/sms-gateway/pending). Découplé pour ne jamais bloquer ni faire
  // échouer l'enregistrement du dossier à cause d'un problème réseau côté
  // téléphone (§23 du cahier des charges).
  return { dossier, creeMaintenant: true };
}

export async function marquerStatutSms(
  reference: string,
  statutSms: Dossier["statutSms"]
): Promise<void> {
  const pool = getPool();
  await pool.query(
    `UPDATE dossiers SET statut_sms = $1, sms_date = now() WHERE reference = $2`,
    [statutSms, reference]
  );
}

/**
 * Remet le SMS en file d'attente : la passerelle Android le relèvera à son
 * prochain sondage. Utilisé pour le renvoi manuel depuis l'administration.
 */
export async function remettreSmsEnAttente(reference: string): Promise<void> {
  const dossier = await obtenirDossierParReference(reference);
  if (!dossier) throw new Error("Dossier introuvable.");
  await marquerStatutSms(reference, "a_envoyer");
}

export interface SmsEnAttente {
  reference: string;
  telephone: string;
}

export async function listerSmsEnAttente(limite = 20): Promise<SmsEnAttente[]> {
  const pool = getPool();
  const result = await pool.query<{ reference: string; telephone: string }>(
    `SELECT reference, telephone FROM dossiers
     WHERE statut_sms = 'a_envoyer'
     ORDER BY date_depot ASC
     LIMIT $1`,
    [limite]
  );
  return result.rows;
}

export async function obtenirDossierParReference(reference: string): Promise<Dossier | null> {
  const pool = getPool();
  const result = await pool.query(`SELECT * FROM dossiers WHERE reference = $1`, [reference]);
  return result.rows.length > 0 ? ligneVersDossier(result.rows[0]) : null;
}

export async function listerDossiers(recherche?: string): Promise<Dossier[]> {
  const pool = getPool();
  if (recherche && recherche.trim()) {
    const motif = `%${recherche.trim()}%`;
    const result = await pool.query(
      `SELECT * FROM dossiers
       WHERE reference ILIKE $1
          OR association_nom ILIKE $1
          OR telephone ILIKE $1
          OR responsables::text ILIKE $1
       ORDER BY date_depot DESC
       LIMIT 200`,
      [motif]
    );
    return result.rows.map(ligneVersDossier);
  }
  const result = await pool.query(
    `SELECT * FROM dossiers ORDER BY date_depot DESC LIMIT 200`
  );
  return result.rows.map(ligneVersDossier);
}

export async function changerStatutDossier(
  reference: string,
  statut: StatutDossier
): Promise<void> {
  const pool = getPool();
  await pool.query(`UPDATE dossiers SET statut = $1 WHERE reference = $2`, [statut, reference]);
}
