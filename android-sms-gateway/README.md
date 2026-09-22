# Passerelle SMS Android — VFM 105

Application Android qui tourne sur le téléphone du responsable du projet et
envoie les SMS de confirmation avec sa carte SIM (§13.2 et §22.2 du cahier
des charges).

Projet Android Studio complet dans ce dossier — ouvrir `android-sms-gateway/`
directement dans Android Studio, ou compiler en ligne de commande :

```bash
./gradlew assembleDebug
```

L'APK compilé se trouve ensuite dans `app/build/outputs/apk/debug/app-debug.apk`.

## Fonctionnement (sondage, pas de serveur sur le téléphone)

Le téléphone n'accepte **aucune connexion entrante** — il n'expose rien sur
Internet, pas besoin de tunnel ni d'adresse fixe. À la place, l'application :

1. interroge le site toutes les 15 secondes (`GET /api/sms-gateway/pending`,
   authentifié par un secret partagé) pour savoir si des SMS sont en attente ;
2. envoie chaque SMS avec `SmsManager` (la carte SIM du téléphone) ;
3. confirme le résultat au site (`POST /api/sms-gateway/report`).

Un dossier reste enregistré même si le téléphone est éteint ou hors ligne —
le SMS repart automatiquement dès que la passerelle se reconnecte (voir
§23 du cahier des charges : un échec de SMS ne fait jamais perdre le dossier).

## Configuration

Au premier lancement, dans l'application :

- **Adresse du site** : `https://vfm-105.vercel.app` (ou le domaine définitif).
- **Secret partagé** : doit être **identique** à la variable d'environnement
  `SMS_GATEWAY_SECRET` configurée côté Vercel. À générer une seule fois
  (chaîne aléatoire longue, ex. `openssl rand -hex 32`) et reporter la même
  valeur des deux côtés.

L'application demande ensuite l'autorisation d'envoyer des SMS (et
d'afficher une notification permanente, obligatoire pour qu'Android laisse
la passerelle tourner en arrière-plan) puis démarre.

## Contrat HTTP avec le serveur

### `GET /api/sms-gateway/pending`

En-tête `X-Gateway-Secret: <secret>`. Réponse :

```json
{ "sms": [{ "reference": "VFM-105-2026-0001", "telephone": "+261340000000", "message": "VFM 105 : ..." }] }
```

### `POST /api/sms-gateway/report`

En-tête `X-Gateway-Secret: <secret>`, corps :

```json
{ "reference": "VFM-105-2026-0001", "succes": true }
```

Les deux routes répondent `401` si le secret est absent ou incorrect, et
`503` si `SMS_GATEWAY_SECRET` n'est pas configuré côté serveur.

## Fiabilité

- **Redémarrage automatique** : si le téléphone redémarre alors que la
  passerelle était active, elle se relance seule (`BootReceiver`).
- **Notification permanente** : requise par Android pour les services de
  fond de longue durée ; affiche l'état du dernier sondage.
- **Un seul SIM géré** : utilise la SIM par défaut du téléphone
  (`SmsManager.getDefault()`). Pour un téléphone double SIM, s'assurer que
  la SIM voulue est définie par défaut pour les SMS dans les réglages Android.

## Sécurité

Le secret (`SMS_GATEWAY_SECRET`) est la seule protection empêchant un tiers
d'interroger ces routes et de savoir quels numéros reçoivent des SMS —
à traiter comme un mot de passe : générer une valeur longue et aléatoire,
ne jamais la commiter en clair, et la changer si elle a pu fuiter.
