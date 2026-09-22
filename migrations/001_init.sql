-- Schéma initial VFM 105

CREATE TABLE IF NOT EXISTS reference_sequences (
  annee INTEGER PRIMARY KEY,
  dernier_numero INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS dossiers (
  reference TEXT PRIMARY KEY,
  idempotency_key UUID NOT NULL UNIQUE,
  date_depot TIMESTAMPTZ NOT NULL,
  statut TEXT NOT NULL DEFAULT 'recu',
  statut_sms TEXT NOT NULL DEFAULT 'a_envoyer',
  sms_date TIMESTAMPTZ,
  association_nom TEXT NOT NULL,
  association_adresse TEXT NOT NULL,
  association_activite TEXT NOT NULL,
  association_nombre_membres INTEGER NOT NULL,
  responsables JSONB NOT NULL,
  telephone TEXT NOT NULL,
  email TEXT,
  autres_coordonnees JSONB,
  description TEXT NOT NULL,
  pieces JSONB NOT NULL DEFAULT '[]'::jsonb,
  cree_le TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dossiers_association_nom ON dossiers (association_nom);
CREATE INDEX IF NOT EXISTS idx_dossiers_telephone ON dossiers (telephone);
CREATE INDEX IF NOT EXISTS idx_dossiers_date_depot ON dossiers (date_depot);
