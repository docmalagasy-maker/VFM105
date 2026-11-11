import { getPool } from "@/lib/db";
import {
  avecPlaceDisponible,
  compterParticipants,
  etatInscriptions,
  InscriptionsCompletes,
  sousVerrouInscriptions,
} from "@/lib/inscriptions";
import { LIMITE_INSCRITS } from "@/lib/inscriptions-regles";
import type { DossierPersonne, ImportPersonnes, PersonneInput } from "@/lib/personnes-modele";
import { validateTelephoneMadagascar } from "@/lib/validation";
import { genererProchaineReferencePersonne } from "@/lib/reference";
import { verifierSchema } from "@/lib/schema";
import { supprimerPieceJointe } from "@/lib/stockage";
import type { StatutDossier } from "@/lib/types";

function ligneVersPersonne(row: Record<string, unknown>): DossierPersonne {
  const naissance = row.date_naissance as Date | string | null;
  return {
    reference: row.reference as string,
    idempotencyKey: row.idempotency_key as string,
    dateDepot: (row.date_depot as Date).toISOString(),
    statut: row.statut as StatutDossier,
    nom: row.nom as string,
    prenom: row.prenom as string,
    // Colonne DATE (anciens dossiers uniquement) : lue sans décalage de fuseau.
    dateNaissance:
      naissance == null
        ? undefined
        : typeof naissance === "string"
          ? naissance.slice(0, 10)
          : `${naissance.getFullYear()}-${String(naissance.getMonth() + 1).padStart(2, "0")}-${String(naissance.getDate()).padStart(2, "0")}`,
    district: row.district as string,
    // Les dossiers antérieurs au lot K n'ont ni commune ni fokontany.
    commune: (row.commune as string) ?? "",
    communePcode: (row.commune_pcode as string) ?? undefined,
    fokontany: (row.fokontany as string) ?? undefined,
    fokontanyPcode: (row.fokontany_pcode as string) ?? undefined,
    activite: row.activite as string,
    descriptionActivite: row.description_activite as string,
    projet: row.projet as string,
    telephone: row.telephone as string,
    email: (row.email as string) ?? undefined,
    cv: (row.cv as DossierPersonne["cv"]) ?? undefined,
    emailConfirmation: (row.email_confirmation as DossierPersonne["emailConfirmation"]) ?? undefined,
    qrJeton: row.qr_jeton as string,
    nombreParticipants: Number(row.nombre_participants ?? 1),
    association: (row.association as string) ?? undefined,
    source: (row.source as string) ?? undefined,
  };
}

/**
 * Import d'une liste papier par le super-administrateur (lot R). Tout ou rien,
 * sous le verrou des inscriptions : refusé si les places manquent. Une ligne
 * dont la clé a déjà été importée est ignorée (jamais comptée deux fois).
 */
export async function importerPersonnes(
  donnees: ImportPersonnes
): Promise<{ crees: DossierPersonne[]; dejaImportees: string[]; participantsAjoutes: number; totalApres: number }> {
  await verifierSchema();
  return sousVerrouInscriptions(async (client) => {
    const cles = donnees.lignes.map((l) => l.idempotencyKey);
    const deja = await client.query<{ idempotency_key: string; reference: string }>(
      `SELECT idempotency_key, reference FROM dossiers_personnes WHERE idempotency_key = ANY($1::uuid[])`,
      [cles]
    );
    const clesDeja = new Set(deja.rows.map((r) => r.idempotency_key));
    const nouvelles = donnees.lignes.filter((l) => !clesDeja.has(l.idempotencyKey));
    const participantsAjoutes = nouvelles.reduce((s, l) => s + l.nombreParticipants, 0);
    const avant = await compterParticipants(client);
    if (avant + participantsAjoutes > LIMITE_INSCRITS) throw new InscriptionsCompletes();

    const maintenant = new Date();
    const annee = maintenant.getFullYear();
    const crees: DossierPersonne[] = [];
    for (const l of nouvelles) {
      const seq = await client.query<{ dernier_numero: number }>(
        `INSERT INTO reference_sequences_personnes (annee, dernier_numero)
         VALUES ($1, 1)
         ON CONFLICT (annee)
         DO UPDATE SET dernier_numero = reference_sequences_personnes.dernier_numero + 1
         RETURNING dernier_numero`,
        [annee]
      );
      const reference = `VFM-P-${annee}-${String(seq.rows[0].dernier_numero).padStart(4, "0")}`;
      const telephone = l.telephone ? (validateTelephoneMadagascar(l.telephone).formate ?? l.telephone) : "";
      const r = await client.query(
        `INSERT INTO dossiers_personnes (
           reference, idempotency_key, date_depot, nom, prenom, district, commune,
           activite, description_activite, projet, telephone,
           nombre_participants, association, source
         ) VALUES ($1,$2,$3,$4,$5,'','','','','',$6,$7,$8,$9)
         RETURNING *`,
        [reference, l.idempotencyKey, maintenant.toISOString(), l.nom, l.prenom, telephone, l.nombreParticipants, l.association ?? null, donnees.source]
      );
      crees.push(ligneVersPersonne(r.rows[0]));
    }
    return {
      crees,
      dejaImportees: deja.rows.map((r) => r.reference),
      participantsAjoutes,
      totalApres: avant + participantsAjoutes,
    };
  });
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

  // Refus avant de consommer un numéro de référence quand c'est déjà complet
  if ((await etatInscriptions())?.complet) throw new InscriptionsCompletes();

  const maintenant = new Date();
  const reference = await genererProchaineReferencePersonne(maintenant.getFullYear());
  // Refusé (InscriptionsCompletes) si les 200 places sont déjà prises
  const r = await avecPlaceDisponible((client) => client.query(
    `INSERT INTO dossiers_personnes (
       reference, idempotency_key, date_depot, nom, prenom, district,
       commune, commune_pcode, fokontany, fokontany_pcode,
       activite, description_activite, projet, telephone, email
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     ON CONFLICT (idempotency_key) DO NOTHING
     RETURNING *`,
    [
      reference,
      input.idempotencyKey,
      maintenant.toISOString(),
      input.nom,
      input.prenom,
      input.district,
      input.commune,
      input.communePcode || null,
      input.fokontany || null,
      input.fokontanyPcode || null,
      input.activite,
      input.descriptionActivite,
      input.projet,
      input.telephone,
      input.email || null,
    ]
  ));
  if (r.rows.length === 0) return { dossier: (await relire())!, creeMaintenant: false };
  return { dossier: ligneVersPersonne(r.rows[0]), creeMaintenant: true };
}

export async function obtenirPersonne(reference: string): Promise<DossierPersonne | null> {
  await verifierSchema();
  const r = await getPool().query(`SELECT * FROM dossiers_personnes WHERE reference = $1`, [reference]);
  return r.rows[0] ? ligneVersPersonne(r.rows[0]) : null;
}

/** Dossier de personne correspondant au code d'un QR code d'inscription. */
export async function obtenirPersonneParQrJeton(jeton: string): Promise<DossierPersonne | null> {
  await verifierSchema();
  const r = await getPool().query(`SELECT * FROM dossiers_personnes WHERE qr_jeton = $1`, [jeton]);
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
          OR district ILIKE $3 OR commune ILIKE $3 OR fokontany ILIKE $3
          OR activite ILIKE $3 OR telephone ILIKE $3 OR association ILIKE $3)
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
