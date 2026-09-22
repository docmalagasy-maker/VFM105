import { getPool } from "@/lib/db";

/**
 * Génère la prochaine référence VFM-105-AAAA-NNNN de façon atomique
 * (UPDATE ... RETURNING sous verrou ligne Postgres : aucune collision possible
 * même avec des validations simultanées).
 */
export async function genererProchaineReference(annee: number): Promise<string> {
  const pool = getPool();
  const result = await pool.query<{ dernier_numero: number }>(
    `INSERT INTO reference_sequences (annee, dernier_numero)
     VALUES ($1, 1)
     ON CONFLICT (annee)
     DO UPDATE SET dernier_numero = reference_sequences.dernier_numero + 1
     RETURNING dernier_numero`,
    [annee]
  );
  const numero = result.rows[0].dernier_numero;
  const numeroFormate = String(numero).padStart(4, "0");
  return `VFM-105-${annee}-${numeroFormate}`;
}
