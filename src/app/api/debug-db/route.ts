import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// Diagnostic temporaire — a retirer une fois le probleme resolu.
export async function GET() {
  try {
    const pool = getPool();
    await pool.query("DELETE FROM reference_sequences WHERE annee = 9999");
    return NextResponse.json({ ok: true, message: "Ligne de test nettoyée." });
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
