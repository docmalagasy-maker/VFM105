-- Lot D : localisation fine des associations et comptes administrateurs de district.
-- Appliqué aussi automatiquement par l'application (src/lib/schema.ts).

-- Commune et fokontany de l'association. Le code (pcode) vient du référentiel
-- officiel BNGRC/HDX ; il reste vide pour une commune ou un fokontany saisi à la main.
ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS association_commune TEXT;
ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS association_commune_pcode TEXT;
ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS association_fokontany TEXT;
ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS association_fokontany_pcode TEXT;
CREATE INDEX IF NOT EXISTS idx_dossiers_district ON dossiers (association_district);

-- Administrateurs de district (le super-administrateur reste défini par
-- ADMIN_USER / ADMIN_PASSWORD dans les variables d'environnement).
CREATE TABLE IF NOT EXISTS administrateurs (
  id SERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  telephone TEXT NOT NULL,
  district TEXT NOT NULL,
  identifiant TEXT NOT NULL,
  mot_de_passe TEXT NOT NULL,          -- empreinte scrypt, jamais le mot de passe
  statut TEXT NOT NULL DEFAULT 'en_attente', -- en_attente | valide | refuse | desactive
  jeton_validation TEXT,               -- lien envoyé par e-mail au super-administrateur
  cree_le TIMESTAMPTZ NOT NULL DEFAULT now(),
  traite_le TIMESTAMPTZ
);

-- Identifiant unique ; un seul administrateur actif ou en attente par district.
CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_identifiant ON administrateurs (lower(identifiant));
CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_district_actif
  ON administrateurs (district) WHERE statut IN ('en_attente', 'valide');
