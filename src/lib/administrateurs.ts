import crypto from "node:crypto";
import { hacherMotDePasse } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { echapperHtml, envoyerEmail } from "@/lib/email";
import { verifierSchema } from "@/lib/schema";

export type StatutAdmin = "en_attente" | "valide" | "refuse" | "desactive";

export interface Administrateur {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  district: string;
  identifiant: string;
  statut: StatutAdmin;
  creeLe: string;
  traiteLe?: string;
}

export const LIBELLES_STATUT_ADMIN: Record<StatutAdmin, string> = {
  en_attente: "En attente de validation",
  valide: "Actif",
  refuse: "Refusé",
  desactive: "Désactivé",
};

function ligneVersAdmin(r: Record<string, unknown>): Administrateur {
  return {
    id: r.id as number,
    nom: r.nom as string,
    prenom: r.prenom as string,
    telephone: r.telephone as string,
    district: r.district as string,
    identifiant: r.identifiant as string,
    statut: r.statut as StatutAdmin,
    creeLe: (r.cree_le as Date).toISOString(),
    traiteLe: r.traite_le ? (r.traite_le as Date).toISOString() : undefined,
  };
}

export async function listerAdministrateurs(): Promise<Administrateur[]> {
  await verifierSchema();
  const r = await getPool().query(
    `SELECT * FROM administrateurs
     ORDER BY CASE statut WHEN 'en_attente' THEN 0 WHEN 'valide' THEN 1 ELSE 2 END, district`
  );
  return r.rows.map(ligneVersAdmin);
}

export async function adminParJeton(jeton: string): Promise<Administrateur | null> {
  await verifierSchema();
  const r = await getPool().query(`SELECT * FROM administrateurs WHERE jeton_validation = $1`, [jeton]);
  return r.rows[0] ? ligneVersAdmin(r.rows[0]) : null;
}

/** Districts ayant déjà un administrateur actif ou une demande en attente. */
export async function districtsOccupes(): Promise<string[]> {
  await verifierSchema();
  const r = await getPool().query<{ district: string }>(
    `SELECT district FROM administrateurs WHERE statut IN ('en_attente', 'valide')`
  );
  return r.rows.map((x) => x.district);
}

export async function creerDemande(
  demande: Omit<Administrateur, "id" | "statut" | "creeLe" | "traiteLe"> & { motDePasse: string },
  urlSite: string
): Promise<{ ok: true; emailEnvoye: boolean } | { ok: false; erreur: string }> {
  await verifierSchema();
  const pool = getPool();

  const doublon = await pool.query<{ champ: string }>(
    `SELECT CASE WHEN lower(identifiant) = lower($1) THEN 'identifiant' ELSE 'district' END AS champ
     FROM administrateurs
     WHERE lower(identifiant) = lower($1) OR (district = $2 AND statut IN ('en_attente', 'valide'))
     LIMIT 1`,
    [demande.identifiant, demande.district]
  );
  if (doublon.rows[0]?.champ === "identifiant") return { ok: false, erreur: "Cet identifiant est déjà utilisé." };
  if (doublon.rows[0]) {
    return { ok: false, erreur: "Ce district a déjà un administrateur (ou une demande en attente)." };
  }

  const jeton = crypto.randomBytes(32).toString("hex");
  try {
    await pool.query(
      `INSERT INTO administrateurs (nom, prenom, telephone, district, identifiant, mot_de_passe, jeton_validation)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        demande.nom,
        demande.prenom,
        demande.telephone,
        demande.district,
        demande.identifiant,
        await hacherMotDePasse(demande.motDePasse),
        jeton,
      ]
    );
  } catch (err) {
    // Demande simultanée sur le même district ou le même identifiant (index uniques)
    if ((err as { code?: string }).code === "23505") {
      return { ok: false, erreur: "Ce district ou cet identifiant vient d'être pris. Vérifiez votre demande." };
    }
    throw err;
  }

  const lien = `${urlSite}/admin/validation/${jeton}`;
  const nomComplet = `${demande.prenom} ${demande.nom}`;
  const emailEnvoye = await envoyerEmail(
    process.env.SUPER_ADMIN_EMAIL || "doc.malagasy@gmail.com",
    `VFM — Demande d'administrateur pour le district ${demande.district}`,
    `${nomComplet} (${demande.telephone}) demande à devenir administrateur du district ${demande.district}.\n` +
      `Identifiant choisi : ${demande.identifiant}\n\nPour valider ou refuser : ${lien}\n` +
      `(connexion super-administrateur requise)`,
    `<p><strong>${echapperHtml(nomComplet)}</strong> (${echapperHtml(demande.telephone)}) demande à devenir
      administrateur du district <strong>${echapperHtml(demande.district)}</strong>.</p>
     <p>Identifiant choisi : ${echapperHtml(demande.identifiant)}</p>
     <p><a href="${lien}">Valider ou refuser cette demande</a><br>
     <small>Connexion super-administrateur requise.</small></p>`
  );
  return { ok: true, emailEnvoye };
}

export type ActionAdmin = "valider" | "refuser" | "desactiver" | "supprimer";

export async function traiterAdministrateur(
  id: number,
  action: ActionAdmin
): Promise<{ ok: true } | { ok: false; erreur: string }> {
  await verifierSchema();
  const pool = getPool();
  if (action === "supprimer") {
    await pool.query(`DELETE FROM administrateurs WHERE id = $1`, [id]);
    return { ok: true };
  }
  const nouveau: StatutAdmin = action === "valider" ? "valide" : action === "refuser" ? "refuse" : "desactive";
  try {
    const r = await pool.query(
      `UPDATE administrateurs SET statut = $1, traite_le = now(), jeton_validation = NULL WHERE id = $2`,
      [nouveau, id]
    );
    return r.rowCount ? { ok: true } : { ok: false, erreur: "Administrateur introuvable." };
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      return { ok: false, erreur: "Ce district a déjà un administrateur actif." };
    }
    throw err;
  }
}
