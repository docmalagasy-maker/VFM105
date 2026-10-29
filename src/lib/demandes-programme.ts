import { z } from "zod";
import { getPool } from "@/lib/db";
import { verifierSchema } from "@/lib/schema";

/** Demande de réception du programme de la conférence (zone rouge de l'affiche). */
export interface DemandeProgramme {
  id: number;
  email: string;
  creeLe: string;
}

export const demandeProgrammeSchema = z.object({
  email: z.string().trim().max(254, "Adresse e-mail trop longue.").email("Adresse e-mail invalide."),
});

/** Enregistre la demande ; une même adresse n'est enregistrée qu'une fois. */
export async function enregistrerDemandeProgramme(email: string): Promise<void> {
  await verifierSchema();
  await getPool().query(
    `INSERT INTO demandes_programme (email) VALUES ($1)
     ON CONFLICT (lower(email)) DO NOTHING`,
    [email]
  );
}

export async function listerDemandesProgramme(): Promise<DemandeProgramme[]> {
  await verifierSchema();
  const r = await getPool().query(`SELECT id, email, cree_le FROM demandes_programme ORDER BY cree_le DESC`);
  return r.rows.map((row) => ({
    id: row.id as number,
    email: row.email as string,
    creeLe: (row.cree_le as Date).toISOString(),
  }));
}
