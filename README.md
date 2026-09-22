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
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) pour les pièces jointes
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

Voir [`.env.example`](.env.example). À définir dans Vercel (Project
Settings → Environment Variables), jamais commitées :

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | Base Postgres (dossiers, séquence de référence) |
| `BLOB_READ_WRITE_TOKEN` | Stockage des pièces jointes (Vercel Storage → Blob) |
| `SMS_GATEWAY_URL` / `SMS_GATEWAY_SECRET` | Passerelle SMS Android du responsable |
| `ADMIN_USER` / `ADMIN_PASSWORD` | Accès à `/admin` |

## Mettre en ligne une nouvelle version (GitHub Desktop → GitHub → Vercel)

Ce projet suit le flux imposé au §22 du cahier des charges : aucune plateforme
de déploiement alternative, aucune dépendance à un compte personnel du
programmeur.

**Première mise en ligne :**

1. Dans **GitHub Desktop** : *File → Add Local Repository* et choisir ce
   dossier (`D:\PROJETS\VFM105`), puis *Publish repository* (nom suggéré :
   `vfm-105`) sur le compte GitHub du responsable du projet.
2. Sur [vercel.com](https://vercel.com) : *Add New → Project*, importer le
   dépôt `vfm-105` qui vient d'être publié. Vercel détecte automatiquement
   Next.js.
3. Dans Vercel : *Storage* → ajouter un store **Postgres** et un store
   **Blob** (les variables `DATABASE_URL` et `BLOB_READ_WRITE_TOKEN` sont
   alors injectées automatiquement).
4. Dans Vercel : *Settings → Environment Variables*, ajouter
   `SMS_GATEWAY_URL`, `SMS_GATEWAY_SECRET`, `ADMIN_USER`, `ADMIN_PASSWORD`.
5. Exécuter `migrations/001_init.sql` sur la base Postgres créée (via
   l'interface Vercel/Neon, ou `psql "$DATABASE_URL" -f migrations/001_init.sql`).
6. Redéployer (*Deployments → Redeploy*) pour que les nouvelles variables
   soient prises en compte.

**Mises à jour suivantes :**

1. Modifier le code localement, tester avec `npm run dev`.
2. Dans GitHub Desktop : vérifier les changements, écrire un message de
   commit, *Commit to main*, puis *Push origin*.
3. Vercel déploie automatiquement la nouvelle version à réception du push.

## Ce qui reste à brancher avant une mise en production réelle

- L'application Android « passerelle SMS » elle-même (spécification dans
  [`android-sms-gateway/README.md`](android-sms-gateway/README.md)) — sans
  elle, les dossiers sont enregistrés mais le SMS reste en statut « échoué ».
- Un renforcement de l'authentification `/admin` (actuellement basique,
  suffisant en v1 mais à faire évoluer — plusieurs administrateurs, etc.,
  voir §26 du cahier des charges).
- Le logo, les couleurs et les textes définitifs du VFM (§2).
