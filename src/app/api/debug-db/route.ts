import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// Diagnostic temporaire — a retirer une fois le probleme resolu.
export async function GET() {
  try {
    const pool = getPool();
    const result = await pool.query("SELECT 1 as ok");
    return NextResponse.json({ ok: true, result: result.rows });
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
