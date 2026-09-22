import { NextResponse } from "next/server";

// Route de diagnostic temporaire — ne révèle aucune valeur, seulement la
// présence des variables. À supprimer une fois le problème résolu.
export async function GET() {
  return NextResponse.json({
    vercelEnv: process.env.VERCEL_ENV ?? null,
    nodeEnv: process.env.NODE_ENV ?? null,
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasAdminUser: Boolean(process.env.ADMIN_USER),
    hasAdminPassword: Boolean(process.env.ADMIN_PASSWORD),
    hasBlobStoreId: Boolean(process.env.BLOB_STORE_ID),
    hasBlobReadWriteToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  });
}
