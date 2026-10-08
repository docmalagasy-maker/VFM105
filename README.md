# VFM 105

Site de dépôt en ligne de dossiers pour les associations du district
d'Ambohidratrimo auprès du VFM. Cahier des charges complet :
[`LOCALSEND/VFM%20105.md`](LOCALSEND/VFM%20105.md).

Parcours : **Formulaire → Prévisualisation → Modification éventuelle →
Validation définitive → Enregistrement → Référence `VFM-105-AAAA-NNNN` →
SMS de confirmation.**

## Stack

- [Next.js 16](https://nextjs.org/) (App Router) + React 19 + Tailwind CSS 4
- Postgres (via `DATABASE_URL`) pour les dossiers et le compteur de référence
- Stockage disque du serveur pour les pièces jointes (`UPLOAD_DIR`, volume persistant)
- Hébergement : VPS avec Coolify (image Docker, voir [`Dockerfile`](Dockerfile))
- Passerelle SMS Android séparée (voir [`android-sms-gateway/README.md`](android-sms-gateway/README.md))

## Développement local

```bash
npm install
cp .env.example .env.local   # puis renseigner les variables (voir ci-dessous)
npm run dev
```

Sans `DATABASE_URL`, le formulaire fonctionne mais l'enregistrement d'un
dossier échouera proprement (message d'erreur affiché). Pour tester
complètement en local, pointez `DATABASE_URL` vers une base Postgres (locale
ou de développement) et appliquez `migrations/001_init.sql`.

## Variables d'environnement

Voir [`.env.example`](.env.example). À définir dans Coolify (application →
*Environment Variables*), jamais commitées :

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | Base Postgres (dossiers, séquence de référence) |
| `UPLOAD_DIR` | Dossier des pièces jointes (fixé à `/app/data/uploads` par le `Dockerfile`) |
| `DATABASE_SSL` | `true` seulement pour une base externe exigeant SSL (désactivé par défaut) |
| `SMS_GATEWAY_SECRET` | Secret partagé avec l'app Android (voir ci-dessous) |
| `ADMIN_USER` / `ADMIN_PASSWORD` | Accès à `/admin` |

## Mettre en ligne une nouvelle version (GitHub Desktop → GitHub → Coolify)

Le site est hébergé sur un VPS géré par [Coolify](https://coolify.io/),
relié au dépôt GitHub `docmalagasy-maker/VFM105` (branche `master`).
Adresse publique : **https://vfm.0550.site**.

**Mises à jour :**

1. Modifier le code localement, tester avec `npm run dev`.
2. Dans GitHub Desktop : vérifier les changements, écrire un message de
   commit, *Commit to master*, puis *Push origin*.
3. Coolify reçoit le push et reconstruit automatiquement le site (2 à
   3 minutes). Suivi dans Coolify → application → *Deployments*.

**Configuration Coolify (pour mémoire, déjà en place) :**

- Application : build **Dockerfile**, port **3000**, domaine
  `https://vfm.0550.site` (certificat HTTPS automatique).
- Volume persistant monté sur `/app/data/uploads` (pièces jointes).
- Base **PostgreSQL** dans le même projet, initialisée par
  `migrations/001_init.sql` (script d'initialisation Coolify). Une future
  migration SQL s'exécute depuis l'onglet *Terminal* de la base
  (`psql -U postgres`).
- Le site doit être servi en **HTTPS** : le bouton de validation utilise
  `crypto.randomUUID()`, indisponible sur une page HTTP.

## Ce qui reste à brancher avant une mise en production réelle

- Installer et configurer l'application Android « passerelle SMS » sur le
  téléphone du responsable (projet complet et instructions dans
  [`android-sms-gateway/README.md`](android-sms-gateway/README.md)) — sans
  elle, les dossiers sont enregistrés mais le SMS reste en statut « à
  envoyer » indéfiniment.
- Un renforcement de l'authentification `/admin` (actuellement basique,
  suffisant en v1 mais à faire évoluer — plusieurs administrateurs, etc.,
  voir §26 du cahier des charges).
- Le logo, les couleurs et les textes définitifs du VFM (§2).
