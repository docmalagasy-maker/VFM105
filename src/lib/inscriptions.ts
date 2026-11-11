import type { PoolClient } from "pg";
import { getPool, isDatabaseConfigured } from "@/lib/db";
import { calculerEtat, LIMITE_INSCRITS, MESSAGE_COMPLET, type EtatInscriptions } from "@/lib/inscriptions-regles";
import { verifierSchema } from "@/lib/schema";

/** Clé du verrou Postgres qui sérialise les nouvelles inscriptions (évite de dépasser la limite). */
const VERROU_INSCRIPTIONS = 105200;

export class InscriptionsCompletes extends Error {
  constructor() {
    super(MESSAGE_COMPLET);
  }
}

/**
 * Chaque inscription compte pour son nombre de participants (1 par défaut,
 * davantage pour une inscription collective, lot R). Les dossiers refusés
 * libèrent leurs places, les dossiers supprimés aussi.
 */
const SQL_COMPTE = `SELECT
  (SELECT coalesce(sum(nombre_participants), 0) FROM dossiers WHERE statut <> 'refuse')
  + (SELECT coalesce(sum(nombre_participants), 0) FROM dossiers_personnes WHERE statut <> 'refuse') AS total`;

/** Nombre de participants déjà comptés (même calcul que l'état des inscriptions), dans une transaction. */
export async function compterParticipants(client: PoolClient): Promise<number> {
  const r = await client.query(SQL_COMPTE);
  return Number(r.rows[0].total);
}

/** Exécute `inserer` sous le verrou des inscriptions, sans contrôle de place (le contrôle est fait par l'appelant). */
export async function sousVerrouInscriptions<T>(inserer: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1)", [VERROU_INSCRIPTIONS]);
    const resultat = await inserer(client);
    await client.query("COMMIT");
    return resultat;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/** État des inscriptions ; null si la base n'est pas configurée (développement local). */
export async function etatInscriptions(): Promise<EtatInscriptions | null> {
  if (!isDatabaseConfigured()) return null;
  await verifierSchema();
  const r = await getPool().query(SQL_COMPTE);
  return calculerEtat(Number(r.rows[0].total));
}

/**
 * Exécute `inserer` seulement s'il reste une place. Le verrou de transaction
 * fait passer les inscriptions simultanées l'une après l'autre : deux
 * personnes ne peuvent pas prendre la même dernière place.
 */
export async function avecPlaceDisponible<T>(inserer: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1)", [VERROU_INSCRIPTIONS]);
    const r = await client.query(SQL_COMPTE);
    if (Number(r.rows[0].total) >= LIMITE_INSCRITS) throw new InscriptionsCompletes();
    const resultat = await inserer(client);
    await client.query("COMMIT");
    return resultat;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
