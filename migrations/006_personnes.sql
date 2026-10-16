-- Dossiers de personnes physiques (lot I). Les dossiers d'associations
-- (table dossiers) ne changent pas.
-- Appliqué aussi automatiquement par l'application (src/lib/schema.ts).

-- Numérotation propre aux personnes : VFM-P-AAAA-NNNN.
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
  -- Curriculum vitæ facultatif : { nom, pathname, taille, type } ou NULL
  cv JSONB,
  -- 'envoye' | 'echoue' ; vide si aucune adresse e-mail
  email_confirmation TEXT,
  cree_le TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_personnes_district ON dossiers_personnes (district);
CREATE INDEX IF NOT EXISTS idx_personnes_date_depot ON dossiers_personnes (date_depot);
