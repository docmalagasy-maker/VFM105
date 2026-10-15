-- E-mail de confirmation de dépôt (remplace provisoirement le SMS).
-- Appliqué aussi automatiquement par l'application (src/lib/schema.ts).
-- Valeurs : 'envoye' | 'echoue' ; vide si le déposant n'a pas donné d'adresse.
ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS email_confirmation TEXT;

-- statut_sms accepte aussi 'desactive' : dossier déposé pendant que l'envoi
-- de SMS est désactivé (SMS_ACTIF absent ou différent de true).
