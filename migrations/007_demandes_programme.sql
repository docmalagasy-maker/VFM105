-- Demandes de réception du programme de la conférence (affiche de l'accueil).
-- Appliqué aussi automatiquement par l'application (src/lib/schema.ts).

CREATE TABLE IF NOT EXISTS demandes_programme (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  cree_le TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_demandes_programme_email ON demandes_programme (lower(email));
