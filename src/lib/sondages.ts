import crypto from "node:crypto";
import { getPool } from "@/lib/db";
import { verifierSchema } from "@/lib/schema";
import {
  MAX_SONDAGES,
  type Question,
  type Sondage,
  type SondageSaisi,
  type ValeurReponse,
} from "@/lib/sondages-modele";

export const COOKIE_PARTICIPANT = "vfm_participant";
/** Votes acceptés par sondage depuis une même adresse IP (réseaux mobiles partagés). */
const MAX_VOTES_PAR_IP = 40;

function ligneVersSondage(row: Record<string, unknown>): Sondage {
  return {
    id: row.id as number,
    titre: row.titre as string,
    description: (row.description as string) ?? "",
    actif: row.actif as boolean,
    questions: (row.questions as Question[]) ?? [],
    creeLe: (row.cree_le as Date).toISOString(),
    modifieLe: (row.modifie_le as Date).toISOString(),
  };
}

export interface SondageListe extends Sondage {
  nombreReponses: number;
}

/** `district` : nombre de réponses limité à ce district (administrateur de district). */
export async function listerSondages(district?: string): Promise<SondageListe[]> {
  await verifierSchema();
  const r = await getPool().query(
    `SELECT s.*, (SELECT count(*)::int FROM reponses_sondage r
                  WHERE r.sondage_id = s.id AND ($1::text IS NULL OR r.district = $1)) AS nombre_reponses
       FROM sondages s ORDER BY s.cree_le DESC`,
    [district ?? null]
  );
  return r.rows.map((row) => ({ ...ligneVersSondage(row), nombreReponses: row.nombre_reponses as number }));
}

export async function listerSondagesActifs(): Promise<Sondage[]> {
  await verifierSchema();
  const r = await getPool().query(`SELECT * FROM sondages WHERE actif ORDER BY cree_le DESC`);
  return r.rows.map(ligneVersSondage);
}

export async function obtenirSondage(id: number): Promise<Sondage | null> {
  await verifierSchema();
  const r = await getPool().query(`SELECT * FROM sondages WHERE id = $1`, [id]);
  return r.rows[0] ? ligneVersSondage(r.rows[0]) : null;
}

export async function nombreReponses(id: number): Promise<number> {
  const r = await getPool().query<{ n: number }>(
    `SELECT count(*)::int AS n FROM reponses_sondage WHERE sondage_id = $1`,
    [id]
  );
  return r.rows[0].n;
}

type Resultat<T = void> = { ok: true; valeur: T } | { ok: false; erreur: string; statut: number };

export async function creerSondage(saisie: SondageSaisi): Promise<Resultat<Sondage>> {
  await verifierSchema();
  const pool = getPool();
  // Verrou transactionnel : deux créations simultanées ne dépassent pas la limite.
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(4105)");
    const { rows } = await client.query<{ n: number }>(`SELECT count(*)::int AS n FROM sondages`);
    if (rows[0].n >= MAX_SONDAGES) {
      await client.query("ROLLBACK");
      return { ok: false, statut: 409, erreur: `Limite de ${MAX_SONDAGES} thématiques atteinte : supprimez-en une d'abord.` };
    }
    const r = await client.query(
      `INSERT INTO sondages (titre, description, actif, questions) VALUES ($1, $2, $3, $4) RETURNING *`,
      [saisie.titre, saisie.description, saisie.actif, JSON.stringify(saisie.questions)]
    );
    await client.query("COMMIT");
    return { ok: true, valeur: ligneVersSondage(r.rows[0]) };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Modifie un sondage. Dès qu'il a reçu des réponses, ses questions sont
 * figées (seuls titre, description et activation changent) : les réponses
 * déjà enregistrées pointent vers ces questions et propositions.
 */
export async function modifierSondage(id: number, saisie: SondageSaisi): Promise<Resultat> {
  const existant = await obtenirSondage(id);
  if (!existant) return { ok: false, statut: 404, erreur: "Sondage introuvable." };
  // Comparaison champ par champ : JSONB ne conserve pas l'ordre des clés.
  const empreinte = (qs: Question[]) =>
    JSON.stringify(qs.map((q) => [q.id, q.type, q.intitule, q.obligatoire, q.options]));
  if ((await nombreReponses(id)) > 0 && empreinte(saisie.questions) !== empreinte(existant.questions)) {
    return {
      ok: false,
      statut: 409,
      erreur: "Ce sondage a déjà reçu des réponses : ses questions ne peuvent plus être modifiées.",
    };
  }
  await getPool().query(
    `UPDATE sondages SET titre = $2, description = $3, actif = $4, questions = $5, modifie_le = now() WHERE id = $1`,
    [id, saisie.titre, saisie.description, saisie.actif, JSON.stringify(saisie.questions)]
  );
  return { ok: true, valeur: undefined };
}

export async function changerActivation(id: number, actif: boolean): Promise<boolean> {
  await verifierSchema();
  const r = await getPool().query(`UPDATE sondages SET actif = $2, modifie_le = now() WHERE id = $1`, [id, actif]);
  return (r.rowCount ?? 0) > 0;
}

/** Suppression définitive, avec toutes les réponses du sondage. */
export async function supprimerSondage(id: number): Promise<boolean> {
  await verifierSchema();
  const r = await getPool().query(`DELETE FROM sondages WHERE id = $1`, [id]);
  return (r.rowCount ?? 0) > 0;
}

// ---------- Participation ----------

export function nouveauParticipant(): string {
  return crypto.randomUUID();
}

/** Empreinte de l'adresse IP (l'adresse elle-même n'est jamais enregistrée). */
export function empreinteIp(ip: string): string {
  const sel = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "vfm";
  return crypto.createHash("sha256").update(`sondage|${sel}|${ip}`).digest("hex").slice(0, 32);
}

export async function sondagesDejaRepondus(participant: string | undefined): Promise<Set<number>> {
  if (!participant) return new Set();
  await verifierSchema();
  const r = await getPool().query<{ sondage_id: number }>(
    `SELECT sondage_id FROM reponses_sondage WHERE participant = $1`,
    [participant]
  );
  return new Set(r.rows.map((x) => x.sondage_id));
}

export async function enregistrerParticipation(p: {
  sondageId: number;
  sexe: string;
  district: string;
  reponses: Record<string, ValeurReponse>;
  participant: string;
  ipEmpreinte: string;
}): Promise<"ok" | "deja" | "limite"> {
  const pool = getPool();
  const { rows } = await pool.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM reponses_sondage WHERE sondage_id = $1 AND ip_empreinte = $2`,
    [p.sondageId, p.ipEmpreinte]
  );
  if (rows[0].n >= MAX_VOTES_PAR_IP) return "limite";
  const r = await pool.query(
    `INSERT INTO reponses_sondage (sondage_id, sexe, district, reponses, participant, ip_empreinte)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (sondage_id, participant) DO NOTHING`,
    [p.sondageId, p.sexe, p.district, JSON.stringify(p.reponses), p.participant, p.ipEmpreinte]
  );
  return (r.rowCount ?? 0) > 0 ? "ok" : "deja";
}

// ---------- Lecture des réponses (administration) ----------

export interface ReponseSondage {
  id: number;
  sexe: string;
  district: string;
  reponses: Record<string, ValeurReponse>;
  creeLe: string;
}

export interface FiltresReponses {
  /** Imposé pour un administrateur de district. */
  district?: string;
  districts?: string[];
  sexe?: string;
  du?: string;
  au?: string;
}

export async function listerReponses(sondageId: number, f: FiltresReponses): Promise<ReponseSondage[]> {
  await verifierSchema();
  const conditions = ["sondage_id = $1"];
  const valeurs: unknown[] = [sondageId];
  const ajouter = (sql: string, v: unknown) => {
    valeurs.push(v);
    conditions.push(sql.replace("?", `$${valeurs.length}`));
  };
  if (f.district) ajouter("district = ?", f.district);
  if (f.districts?.length) ajouter("district = ANY(?)", f.districts);
  if (f.sexe) ajouter("sexe = ?", f.sexe);
  // Bornes de dates en heure de Madagascar, « au » inclus.
  if (f.du) ajouter("cree_le >= (?::date)::timestamp AT TIME ZONE 'Indian/Antananarivo'", f.du);
  if (f.au) ajouter("cree_le < ((?::date) + 1)::timestamp AT TIME ZONE 'Indian/Antananarivo'", f.au);
  const r = await getPool().query(
    `SELECT id, sexe, district, reponses, cree_le FROM reponses_sondage
      WHERE ${conditions.join(" AND ")} ORDER BY cree_le DESC LIMIT 100000`,
    valeurs
  );
  return r.rows.map((row) => ({
    id: row.id as number,
    sexe: row.sexe as string,
    district: row.district as string,
    reponses: row.reponses as Record<string, ValeurReponse>,
    creeLe: (row.cree_le as Date).toISOString(),
  }));
}
