# VFM — dépôt de dossiers des associations

Plateforme nationale, en malgache, permettant aux associations des
120 districts de Madagascar de déposer en ligne leur dossier auprès du VFM
(Vovonan'ny Fihavaozan'i Madagasikara).

- Site en ligne : **https://vfm.0550.site**
- Administration : **https://vfm.0550.site/admin**
- Cahier des charges d'origine : [`LOCALSEND/VFM%20105.md`](LOCALSEND/VFM%20105.md)
  (certains points ont depuis évolué, voir [`Modif.md`](Modif.md))
- Journal de toutes les modifications du site : [`Modif.md`](Modif.md)
- Serveur, Coolify, DNS, e-mails, incidents : [`serveur.md`](serveur.md)

## Fonctionnement

### Côté public (en malgache)

Parcours : **Formulaire → Récapitulatif → Modification éventuelle →
Validation définitive → Enregistrement → Référence `VFM-AAAA-NNNN` →
SMS de confirmation.**

- **Formulaire** (`/deposer`) : association, adresse, **District →
  Kaominina → Fokontany** (listes liées, avec saisie libre « Hafa »),
  responsables, activité, membres, coordonnées, projet, pièces jointes.
  Brouillon conservé dans le navigateur.
- **Remerciement** personnalisé avec le district choisi.
- **SMS** de confirmation envoyé par la passerelle Android (texte dans
  `src/lib/sms.ts`).
- Menus visibles sur toutes les pages : **Dossier** (retour à l'accueil,
  masqué sur l'accueil), **Sary** (`/galerie`, galerie de photos),
  **Resaho izahay** (affiche l'adresse e-mail de contact).

### Côté administration (en français)

| Rôle | Connexion | Accès |
|---|---|---|
| Super-administrateur | `ADMIN_USER` / `ADMIN_PASSWORD` (Coolify) | Tous les districts, toutes les actions, gestion des administrateurs |
| Administrateur de district | Compte demandé sur `/admin/inscription`, validé par le super-administrateur (lien reçu par e-mail ou onglet Administrateurs) | Son district uniquement, en lecture ; statistiques, exports, carte, galerie |

Onglets : **Liste des dossiers**, **Consultation fiche par fiche**,
**Statistiques** (exports CSV), **Carte** (districts et communes),
**Galerie photos**, **Administrateurs** (super-administrateur). Une fiche
de dossier permet de changer son statut, de renvoyer le SMS ou de
supprimer le dossier (super-administrateur).

## Données géographiques

| Fichier | Contenu | Source |
|---|---|---|
| `src/lib/districts.ts` | 24 régions, 120 districts | Projet ONN Board |
| `src/data/referentiel-geo.json` | Communes et fokontany par district | BNGRC via OCHA/HDX (licence CC BY-IGO), complété par 114 communes d'ONN Board (code `ONN-…`, sans fokontany) |
| `public/carte/` | Contours simplifiés des districts et des communes | BNGRC via OCHA/HDX |

Le détail de la construction (correspondance des noms, filtrage des
doublons) est dans [`Modif.md`](Modif.md), lots D2.1 à D2.4.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router) + React 19 + Tailwind CSS 4
- PostgreSQL (`DATABASE_URL`) : dossiers, compteur de références,
  administrateurs. Les migrations (`migrations/`) sont appliquées
  automatiquement au démarrage (`src/lib/schema.ts`).
- Pièces jointes et photos envoyées depuis l'admin : disque du serveur
  (`UPLOAD_DIR`, volume persistant)
- Carte : `d3-geo` ; e-mails : `nodemailer` (boîte LWS)
- Hébergement : VPS avec **Coolify** (image Docker, voir
  [`Dockerfile`](Dockerfile))
- Passerelle SMS Android séparée :
  [`android-sms-gateway/README.md`](android-sms-gateway/README.md)

## Développement local

```bash
npm install
cp .env.example .env.local   # puis renseigner les variables
npm run dev
```

Sans `DATABASE_URL`, les pages s'affichent mais l'enregistrement d'un
dossier et l'administration échouent proprement. Pour tester complètement,
pointer `DATABASE_URL` vers une base Postgres de test et appliquer
`migrations/001_init.sql` (les migrations suivantes s'appliquent toutes
seules).

Vérifications avant toute mise en ligne :

```bash
npx tsc --noEmit
npm run build
```

## Variables d'environnement

Voir [`.env.example`](.env.example). À définir dans Coolify (application →
*Environment Variables*), jamais dans un fichier du dépôt :

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | Base Postgres interne Coolify |
| `DATABASE_SSL` | `true` seulement pour une base externe exigeant SSL |
| `UPLOAD_DIR` | Dossier des fichiers (fixé à `/app/data/uploads` par le `Dockerfile`) |
| `SMS_GATEWAY_SECRET` | Secret partagé avec l'application Android |
| `ADMIN_USER` / `ADMIN_PASSWORD` | Super-administrateur |
| `SESSION_SECRET` | Clé des sessions admin (facultative, conseillée) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Envoi des e-mails de validation des administrateurs |
| `SUPER_ADMIN_EMAIL` | Destinataire des demandes d'accès (par défaut doc.malagasy@gmail.com) |
| `SITE_URL` | Adresse publique utilisée dans les liens des e-mails |

## Mettre en ligne une nouvelle version

1. Modifier le code, tester localement (`npm run dev`, puis `npm run build`).
2. Consigner la modification dans [`Modif.md`](Modif.md).
3. GitHub Desktop : *Commit to master*, puis *Push origin*.
4. Coolify reconstruit automatiquement le site (2 à 3 minutes) ; suivi dans
   Coolify → application → *Deployments*. En cas d'échec, voir
   [`serveur.md`](serveur.md) §4.

## Galerie photos

- **Dossier `GALERIE/`** : ajouter, renommer ou supprimer des photos, puis
  Commit et Push. Ordre alphabétique (préfixe `01-`, `02-`… non affiché),
  légende tirée du nom du fichier.
- **Admin → Galerie photos** : envoi immédiat, sans redéploiement (photos
  stockées sur le serveur).
