import { Pool } from "pg";

let pool: Pool | undefined;

export function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL absent. Configure une base Postgres (Coolify, ou équivalent) avant d'utiliser le stockage en base."
    );
  }
  if (!pool) {
    // Base Postgres interne de Coolify : réseau Docker privé, sans SSL.
    // DATABASE_SSL=true seulement pour une base externe qui l'exige.
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
