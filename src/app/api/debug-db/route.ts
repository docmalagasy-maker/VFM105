import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// Diagnostic temporaire — a retirer une fois le probleme resolu.
export async function GET() {
  try {
    const pool = getPool();
    const tables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    const refTest = await pool.query(
      `INSERT INTO reference_sequences (annee, dernier_numero)
       VALUES (9999, 1)
       ON CONFLICT (annee) DO UPDATE SET dernier_numero = reference_sequences.dernier_numero + 1
       RETURNING dernier_numero`
    );
    return NextResponse.json({
      ok: true,
      tables: tables.rows.map((r) => r.table_name),
      refTest: refTest.rows,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        message: err instanceof Error ? err.message : String(err),
        name: err instanceof Error ? err.name : undefined,
      },
      { status: 500 }
    );
  }
}
