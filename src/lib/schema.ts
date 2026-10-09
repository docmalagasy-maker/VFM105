import { getPool } from "@/lib/db";

let schemaVerifie: Promise<unknown> | undefined;

/**
 * Applique les migrations 002 et 003 si besoin (idempotent, une fois par
 * démarrage du serveur), pour qu'un déploiement ne casse jamais le site avant
 * une migration manuelle de la base.
 */
export function verifierSchema(): Promise<unknown> {
  schemaVerifie ??= getPool()
    .query(
      `ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS association_district TEXT;
       ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS association_commune TEXT;
       ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS association_commune_pcode TEXT;
       ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS association_fokontany TEXT;
       ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS association_fokontany_pcode TEXT;
       CREATE INDEX IF NOT EXISTS idx_dossiers_district ON dossiers (association_district);
       CREATE TABLE IF NOT EXISTS administrateurs (
         id SERIAL PRIMARY KEY,
         nom TEXT NOT NULL,
         prenom TEXT NOT NULL,
         telephone TEXT NOT NULL,
         district TEXT NOT NULL,
         identifiant TEXT NOT NULL,
         mot_de_passe TEXT NOT NULL,
         statut TEXT NOT NULL DEFAULT 'en_attente',
         jeton_validation TEXT,
         cree_le TIMESTAMPTZ NOT NULL DEFAULT now(),
         traite_le TIMESTAMPTZ
       );
       CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_identifiant ON administrateurs (lower(identifiant));
       CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_district_actif
         ON administrateurs (district) WHERE statut IN ('en_attente', 'valide');`
    )
    .catch((err) => {
      schemaVerifie = undefined;
      throw err;
    });
  return schemaVerifie;
}
