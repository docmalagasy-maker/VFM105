# Passerelle SMS Android — VFM 105

Ce dossier documente l'application Android à développer séparément (§13.2 et
§22.2 du cahier des charges). Elle tourne sur le téléphone du responsable du
projet et envoie les SMS de confirmation avec sa carte SIM.

Elle peut être livrée dans un dépôt GitHub séparé ; ce fichier fixe le contrat
attendu avec le site web pour que les deux projets restent compatibles.

## Rôle

1. Recevoir une requête HTTP signée depuis le serveur (Vercel).
2. Vérifier la signature — aucun visiteur du site ne doit pouvoir déclencher
   un envoi.
3. Envoyer le SMS via `SmsManager` avec la carte SIM du téléphone.
4. Répondre au serveur pour confirmer le succès ou l'échec.

## Contrat HTTP attendu par le site

Le site (`src/lib/sms.ts`) appelle, à chaque validation définitive de dossier :

```
POST <SMS_GATEWAY_URL>
Content-Type: application/json
X-Signature: HMAC-SHA256(corps, SMS_GATEWAY_SECRET) en hexadécimal

{
  "telephone": "+261340000000",
  "message": "VFM 105 : Votre dossier a bien été reçu. Référence : VFM-105-2026-0001. Merci.",
  "horodatage": 1735689600000
}
```

Réponse attendue :

- `200 OK` si le SMS a été transmis à l'API Android pour envoi ;
- tout autre code → le site marque le dossier en statut SMS "échoué" et
  conserve le dossier (voir §23 : un échec de SMS ne doit jamais faire perdre
  le dossier).

`SMS_GATEWAY_SECRET` doit être un secret long et aléatoire, identique côté
site (variable d'environnement Vercel) et côté application Android. Il ne
doit jamais être commité en clair dans un dépôt.

## Pistes d'implémentation côté Android

- Un petit serveur HTTP embarqué (ex. NanoHTTPD, ou Ktor) écoutant en local,
  exposé à Internet via un tunnel sécurisé (ex. Cloudflare Tunnel, Tailscale
  Funnel) pour éviter d'ouvrir un port sur le réseau mobile ;
- ou, alternative plus simple à opérer : le téléphone interroge
  périodiquement une file d'attente côté serveur (polling) au lieu de
  recevoir un push — évite d'exposer le téléphone directement sur Internet.

Le choix exact revient au développeur de l'application Android, du moment
que le contrat ci-dessus (signature HMAC, statuts de retour) est respecté.
