import { getPool } from "@/lib/db";

let schemaVerifie: Promise<unknown> | undefined;

/**
 * Applique les migrations 002 à 006 si besoin (idempotent, une fois par
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
       CREATE INDEX IF NOT EXISTS idx_reponses_sondage_ip ON reponses_sondage (sondage_id, ip_empreinte);
       CREATE TABLE IF NOT EXISTS reference_sequences_personnes (
         annee INTEGER PRIMARY KEY,
         dernier_numero INTEGER NOT NULL DEFAULT 0
       );
       CREATE TABLE IF NOT EXISTS dossiers_personnes (
         reference TEXT PRIMARY KEY,
         idempotency_key UUID NOT NULL UNIQUE,
         date_depot TIMESTAMPTZ NOT NULL,
         statut TEXT NOT NULL DEFAULT 'recu',
         nom TEXT NOT NULL,
         prenom TEXT NOT NULL,
         date_naissance DATE NOT NULL,
         district TEXT NOT NULL,
         activite TEXT NOT NULL,
         description_activite TEXT NOT NULL,
         projet TEXT NOT NULL,
         telephone TEXT NOT NULL,
         email TEXT,
         cv JSONB,
         email_confirmation TEXT,
         cree_le TIMESTAMPTZ NOT NULL DEFAULT now()
       );
       CREATE INDEX IF NOT EXISTS idx_personnes_district ON dossiers_personnes (district);
       CREATE INDEX IF NOT EXISTS idx_personnes_date_depot ON dossiers_personnes (date_depot);`
    )
    .catch((err) => {
      schemaVerifie = undefined;
      throw err;
    });
  return schemaVerifie;
}
