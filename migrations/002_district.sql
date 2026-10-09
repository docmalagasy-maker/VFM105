-- Ajout du district de l'association (choisi dans la liste des 120 districts).
-- Colonne facultative en base pour conserver les dossiers déposés avant son ajout ;
-- le formulaire et l'API la rendent obligatoire pour tout nouveau dossier.

ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS association_district TEXT;
