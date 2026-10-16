-- Sondages « Manehoa hevitra » (lot G).
-- Appliqué aussi automatiquement par l'application (src/lib/schema.ts).

-- Une ligne par thématique (30 au maximum, contrôlé par l'application).
-- questions : tableau JSON [{ id, type, intitule, obligatoire, options[] }],
-- type ∈ unique | multiple | note | texte | classement.
CREATE TABLE IF NOT EXISTS sondages (
  id SERIAL PRIMARY KEY,
  titre TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  actif BOOLEAN NOT NULL DEFAULT false,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  cree_le TIMESTAMPTZ NOT NULL DEFAULT now(),
  modifie_le TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Une ligne par participation. reponses : objet JSON { idQuestion: valeur }.
-- participant : identifiant aléatoire du navigateur (cookie), un vote par
-- sondage et par navigateur ; ip_empreinte : empreinte de l'adresse IP
-- (jamais l'adresse elle-même), pour limiter les votes en série.
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
