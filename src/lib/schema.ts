import { getPool } from "@/lib/db";

let schemaVerifie: Promise<unknown> | undefined;

/**
 * Applique les migrations 002 à 005 si besoin (idempotent, une fois par
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
       ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS email_confirmation TEXT;
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
         ON administrateurs (district) WHERE statut IN ('en_attente', 'valide');
       CREATE TABLE IF NOT EXISTS sondages (
         id SERIAL PRIMARY KEY,
         titre TEXT NOT NULL,
         description TEXT NOT NULL DEFAULT '',
         actif BOOLEAN NOT NULL DEFAULT false,
         questions JSONB NOT NULL DEFAULT '[]'::jsonb,
         cree_le TIMESTAMPTZ NOT NULL DEFAULT now(),
         modifie_le TIMESTAMPTZ NOT NULL DEFAULT now()
       );
       CREATE TABLE IF NOT EXISTS reponses_sondage (
         id SERIAL PRIMARY KEY,
         sondage_id INTEGER NOT NULL REFERENCES sondages (id) ON DELETE CASCADE,
         sexe TEXT NOT NULL,
         district TEXT NOT NULL,
         reponses JSONB NOT NULL,
         participant TEXT NOT NULL,
         ip_empreinte TEXT NOT NULL,
         cree_le TIMESTAMPTZ NOT NULL DEFAULT now()
       );
       CREATE UNIQUE INDEX IF NOT EXISTS idx_reponses_participant ON reponses_sondage (sondage_id, participant);
       CREATE INDEX IF NOT EXISTS idx_reponses_sondage_district ON reponses_sondage (sondage_id, district);
       CREATE INDEX IF NOT EXISTS idx_reponses_sondage_ip ON reponses_sondage (sondage_id, ip_empreinte);`
    )
    .catch((err) => {
      schemaVerifie = undefined;
      throw err;
    });
  return schemaVerifie;
}
