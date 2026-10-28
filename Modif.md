# Journal des modifications — VFM 105

Registre des demandes de modification du site en production
(https://vfm.0550.site, VPS Coolify). Chaque demande y est consignée :
comportement avant/après, fichiers touchés, vérifications, mise en ligne.

> Le détail de l'infrastructure (VPS, Coolify, DNS, secrets) se trouve dans
> `serveur.md`. Aucun secret dans ce fichier.

| Lot | Date | Demande | État |
|---|---|---|---|
| A | 9 octobre 2026 | A1 — Message de remerciement selon le district | Mis en ligne |
| A | 9 octobre 2026 | A2 — Bouton « Supprimer » dans la liste admin | Mis en ligne |
| A | 9 octobre 2026 | A3 — Site national, accueil, formulaire et SMS en malgache, références VFM-AAAA | Mis en ligne |
| A | 9 octobre 2026 | A4 — Badge « Fametrahana Dosie » | Mis en ligne |
| B | 9 octobre 2026 | B1 — Consultation fiche par fiche dans l'admin | Mis en ligne |
| B | 9 octobre 2026 | B2 — Statistiques et exports CSV | Mis en ligne |
| C | 9 octobre 2026 | C1 — Galerie photos « Sary » | Mis en ligne |
| C | 9 octobre 2026 | C2 — Menu contact « Fifandraisana » | Mis en ligne |
| C | 9 octobre 2026 | C3 — Menus Sary / Fifandraisana visibles sur toutes les pages | Mis en ligne |
| D | 9 octobre 2026 | D1 — Administrateurs de district et droits d'accès | Mis en ligne |
| D | 9 octobre 2026 | D2.1 — Carte interactive districts / communes | Mis en ligne |
| D | 9 octobre 2026 | D2.2 / D2.3 — Listes District > Commune > Fokontany, liées à la carte | Mis en ligne |
| D | 15 octobre 2026 | D2.4 — Communes ONN Board ajoutées aux listes (114) | Mis en ligne |
| C | 15 octobre 2026 | C4 — Menus renommés : « Dossier », « Sary », « Resaho izahay » | Mis en ligne |
| E | 15 octobre 2026 | E1 — SMS désactivé, e-mail de confirmation de dépôt | Mis en ligne |
| F | 15 octobre 2026 | F1 — Menu « Radio » et page `/radio` avec lecteur du direct | Mis en ligne |
| G | 15 octobre 2026 | G1 — Sondages « Manehoa hevitra » (public, gestion, résultats, statistiques) | Mis en ligne (16 octobre 2026) |
| H | 16 octobre 2026 | H1 — Menus stables : page en cours grisée | Mis en ligne (16 octobre 2026) |
| H | 16 octobre 2026 | H2 — Menu et page « Birao » (Birao Nasionaly) | Mis en ligne (16 octobre 2026) |
| H | 16 octobre 2026 | H3 — Bouton « Radio » distinctif et indicateur LIVE | Mis en ligne (16 octobre 2026) |
| H | 16 octobre 2026 | H4 — Menus de l'administration toujours visibles | Mis en ligne (16 octobre 2026) |
| I | 16 octobre 2026 | I1 — Dossiers de personnes physiques (références VFM-P) | Mis en ligne (16 octobre 2026) |
| J | 28 octobre 2026 | J1 — Affiche « Tafa & dinika » à l'accueil, deux boutons sous l'affiche | Mis en ligne (28 octobre 2026) |
| J | 28 octobre 2026 | J2 — Nouveaux textes des boutons d'accueil | Mis en ligne (28 octobre 2026) |
| J | 28 octobre 2026 | J3 — Fond gris à pois, logo sur médaillon blanc | Mis en ligne (28 octobre 2026) |
| J | 28 octobre 2026 | J4 — Nouvelle affiche, bandeau « Voafetra » vert à texte blanc | Mis en ligne (28 octobre 2026) |
| J | 28 octobre 2026 | J5 — « AMBOHIDRATRIMO » sous le logo | Mis en ligne (28 octobre 2026) |
| J | 28 octobre 2026 | J6 — Domaine vfm105.com | Mis en ligne (28 octobre 2026) |
| K | 28 octobre 2026 | K1 — Associations : pièces jointes supprimées | Mis en ligne (28 octobre 2026) |
| K | 28 octobre 2026 | K2 — Personnes : sans date de naissance ni CV, avec commune et fokontany | Mis en ligne (28 octobre 2026) |
| K | 28 octobre 2026 | K3 — Associations : section « Ny hevitrao » | Mis en ligne (28 octobre 2026) |
| L | 28 octobre 2026 | L1 — Menu « Fisoratana anarana » | Mis en ligne (28 octobre 2026) |
| L | 28 octobre 2026 | L2 — Formulaire associations (un seul nom, 2 activités, nouveaux textes) | Mis en ligne (28 octobre 2026) |
| L | 28 octobre 2026 | L3 — Formulaire personnes (nouveaux textes) | Mis en ligne (28 octobre 2026) |
| L | 28 octobre 2026 | L4 — « VFM 105 » et « Radio VFM 105 » (site ; AzuraCast à faire) | Mis en ligne (28 octobre 2026) |
| L | 28 octobre 2026 | L5 — QR code d'inscription Tafa & Dinika | Mis en ligne (28 octobre 2026) |
| S | 9 octobre 2026 | S1 — Mise à jour de sécurité (Next.js 16.3.8, sharp 0.35.5) | Mis en ligne (15 octobre 2026) |

---

## Lot A — 9 octobre 2026

### A1 — Personnalisation du message de remerciement

**Avant :** la page de confirmation affichait toujours
« Misaotra anao ny VFM Ambohidratrimo », quel que soit le district choisi.

**Après :** le message reprend le district choisi dans le formulaire, par
exemple « Misaotra anao ny VFM Antsirabe I ». Pour les dossiers déposés
avant l'ajout du champ District (aucun district enregistré), le message
reste « VFM Ambohidratrimo ».

**Fichier modifié :** `src/app/confirmation/[reference]/page.tsx`

**Vérifié en local :** dossier « Antsirabe I » → « Misaotra anao ny VFM
Antsirabe I » ; dossier « Toamasina I » → « Misaotra anao ny VFM
Toamasina I ».

**Hors périmètre (inchangé) :** les textes « district d'Ambohidratrimo » de
la page d'accueil, de l'en-tête du formulaire et de la description du site
désignent le VFM 105 lui-même, pas le district du déposant.

### A2 — Suppression des dossiers dans l'administration

**Avant :** la liste des dossiers de `/admin` était consultable, sans
possibilité de suppression.

**Après :** chaque ligne de la liste a un bouton **Supprimer**.

- Une fenêtre de confirmation rappelle la référence et le nom de
  l'association, et précise que l'action est irréversible.
- Le dossier est supprimé de la base, ainsi que ses pièces jointes sur le
  disque (volume `/app/data/uploads`). Une pièce jointe citée par un autre
  dossier est conservée.
- La liste se met à jour automatiquement.
- La colonne du bouton reste visible à droite même quand le tableau défile
  horizontalement (petits écrans).
- Suppression **définitive** : aucune corbeille. Les sauvegardes
  quotidiennes de la base (02:00 UTC) restent le seul moyen de récupérer un
  dossier supprimé par erreur (pas les pièces jointes, qui ne sont pas
  sauvegardées).

**Fichiers :**

| Fichier | Modification |
|---|---|
| `src/app/admin/page.tsx` | Colonne avec le bouton Supprimer |
| `src/app/admin/BoutonSupprimer.tsx` (nouveau) | Bouton, confirmation, appel de suppression |
| `src/app/api/admin/dossiers/[reference]/route.ts` (nouveau) | Route `DELETE`, protégée par l'authentification admin (`src/proxy.ts`) |
| `src/lib/repository.ts` | Fonction `supprimerDossier` |
| `src/lib/stockage.ts` | Fonction `supprimerPieceJointe` |

**Vérifié en local** (base PostgreSQL de test temporaire) :

- suppression sans identifiants → refusée (401) ;
- suppression avec identifiants → dossier et pièce jointe supprimés (200) ;
- seconde suppression du même dossier → « Dossier introuvable » (404) ;
- bouton dans l'interface → confirmation affichée, dossier retiré de la
  liste.

### A3 — Plateforme nationale, accueil et formulaire en malgache

**Avant :** site présenté comme « VFM 105 », rattaché au district
d'Ambohidratrimo, textes de l'accueil et du formulaire en français.

**Après :**

- « VFM 105 » remplacé par **« VFM »** (titres, onglet du navigateur,
  description du site).
- Toute mention d'Ambohidratrimo retirée de l'accueil, du formulaire et de
  la description du site. L'accueil précise que la plateforme est ouverte
  aux associations des 120 districts de Madagascar. Le choix du district
  reste dans le formulaire (régions affichées « Faritra … »).
- Page de remerciement : pour un ancien dossier sans district, le message
  devient « Misaotra anao ny VFM » (au lieu de « VFM Ambohidratrimo »).
- **Traduit en malgache** : accueil, formulaire (titres de blocs,
  intitulés, exemples dans les champs, consignes, boutons, zone des pièces
  jointes), récapitulatif, liste des activités, types de coordonnées, tous
  les messages d'erreur du formulaire, ainsi que les messages renvoyés par
  le serveur (validation, envoi de fichiers, envoi du dossier).
- Langue de la page déclarée en malgache (`lang="mg"`).

**Principales traductions :**

| Français | Malgache |
|---|---|
| Déposer un dossier | Hametraka antontan-taratasy |
| Dépôt de dossier (badge) | Fametrahana Dosie |
| L'association / Activité et membres | Ny fikambanana / Asa sy mpikambana |
| Coordonnées / Votre projet | Fifandraisana / Ny tetikasanao |
| Pièces jointes | Antontan-taratasy miaraka |
| District / Région | Distrika / Faritra |
| Nom / Prénom / Responsable | Anarana / Fanampin'anarana / Tompon'andraikitra |
| Vérifier mon dossier | Hamarino ny antontan-taratasiko |
| Valider définitivement | Handefa farany ny antontan-taratasiko |

Activités : Fambolena sy fiompiana, Tanora, Fanatanjahantena, Tontolo
iainana, Kolontsaina, Asa sosialy, Fampandrosoana ifotony, Fiofanana, Hafa.

**Fichiers modifiés :** `src/app/page.tsx`, `src/app/layout.tsx`,
`src/components/DepotWizard.tsx`, `src/app/confirmation/[reference]/page.tsx`,
`src/lib/validation.ts`, `src/lib/stockage.ts`, `src/app/api/upload/route.ts`,
`src/app/api/dossiers/route.ts`.

**Vérifié en local :** accueil et formulaire en malgache ; formulaire vide →
7 messages d'erreur en malgache ; récapitulatif en malgache ; envoi → page
« Misaotra anao ny VFM Fianarantsoa I » ; district invalide et fichier
refusé → messages serveur en malgache.

**Complément demandé avec le GO :**

- **Références** : nouveau format **`VFM-AAAA-NNNN`** (ex. `VFM-2026-0002`)
  au lieu de `VFM-105-AAAA-NNNN` (`src/lib/reference.ts`). Les dossiers
  existants gardent leur référence. Le compteur annuel continue : le
  prochain numéro suit le dernier attribué (pas de retour à 0001).
- **SMS de confirmation en malgache** (`src/lib/sms.ts`) :
  « VFM : Voaray ny antontan-taratasinao. Laharana : VFM-2026-0002.
  Misaotra. » — 73 caractères sans accents, donc un seul SMS.

**Non modifié :**

- L'interface d'administration reste en français.
- L'application Android de passerelle SMS garde son nom « VFM 105 » (aucun
  effet sur le SMS envoyé, dont le texte vient du serveur).
- Les dossiers déjà déposés gardent leur activité en français (« Sport »,
  etc.) ; les nouveaux l'auront en malgache.

### A4 — « Fametrahana an-tserasera » remplacé par « Fametrahana Dosie »

**Avant :** le badge au-dessus du titre affichait « Fametrahana
an-tserasera ».

**Après :** « Fametrahana Dosie » partout où l'expression apparaissait :

- badge de la page d'accueil (`src/app/page.tsx`) ;
- badge du formulaire (`src/components/DepotWizard.tsx`) ;
- description du site (`src/app/layout.tsx`) : « Fametrahana Dosie ho
  an'ny fikambanana eo amin'ny VFM — Madagasikara. »

### Mise en ligne du lot A

- [ ] Commit et push sur `master` (déploiement automatique Coolify).
- [ ] Vérifier dans Coolify → *Deployments* que le déploiement est en
      **Success** (en cas d'échec `Could not resolve host`, voir
      `serveur.md` §4, difficulté n° 12).
- [ ] Test en ligne : dépôt d'un dossier avec un district autre
      qu'Ambohidratrimo, contrôle du message de remerciement, puis
      suppression de ce dossier depuis `/admin`.

---

## Lot B — 9 octobre 2026 — Amélioration de la page administrateur

La page `/admin` a maintenant **trois onglets** en haut :
« Liste des dossiers » (par défaut), « Consultation fiche par fiche » et
« Statistiques ».

### B1 — Consultation des dossiers enregistrés

**Avant :** pour voir le détail d'un dossier, il fallait cliquer dessus
dans la liste, puis revenir à la liste pour le suivant.

**Après :**

- La **liste actuelle est conservée** telle quelle (onglet par défaut),
  avec en plus un bouton **Consulter** sur chaque ligne, qui ouvre ce
  dossier dans la vue fiche par fiche.
- Onglet **Consultation fiche par fiche** : un dossier complet à la fois
  (association, district, adresse, activité, membres, responsables,
  téléphone, e-mail, autres coordonnées, pièces jointes, description,
  statut, statut SMS).
  - Flèches **←** et **→** à l'écran, ou flèches du clavier, pour passer
    au dossier précédent ou suivant ; compteur « 7 / 12 ».
  - Menu déroulant pour aller directement à un dossier.
  - Téléphone et e-mail cliquables (appel, message).
  - Bouton **Gérer (statut, SMS)** vers la page existante du dossier.
- La recherche fonctionne dans la liste et dans la consultation, et
  cherche désormais aussi par **district**.

### B2 — Statistiques et exports

Onglet **Statistiques** :

- Chiffres clés : nombre total d'associations, nombre total de membres
  déclarés, moyenne et médiane de membres par association, nombre de
  districts représentés (sur 120).
- **Répartition selon le nombre de membres** : tranches 1–10, 11–25,
  26–50, 51–100, 101–250, plus de 250 (nombre d'associations, part en %,
  membres déclarés), avec barres.
- **Par district** : associations, membres déclarés et moyenne, avec la
  région du district ; trié du plus grand au plus petit.
- **Par région** : mêmes chiffres regroupés par région.
- **Exports CSV** (ouverture directe dans Excel ou LibreOffice, séparateur
  « ; », accents corrects) : un bouton par tableau (tranches, districts,
  régions) et un export de **tous les dossiers** (une ligne par dossier,
  toutes les informations).

**Règles de calcul :**

- Chaque dossier compte pour une association (une association ayant
  déposé deux dossiers compte deux fois).
- Tous les dossiers sont comptés, quel que soit leur statut (y compris
  refusés ou archivés).
- Les dossiers déposés avant l'ajout du champ District apparaissent sous
  « Non renseigné ».

**Sécurité :** les exports sont protégés par l'authentification admin
(401 sans identifiants). Les cellules commençant par `=`, `+`, `-` ou `@`
sont neutralisées pour qu'un texte saisi par le public ne puisse pas
s'exécuter comme formule dans Excel.

**Fichiers :**

| Fichier | Modification |
|---|---|
| `src/app/admin/page.tsx` | Onglets, recherche commune, bouton Consulter |
| `src/app/admin/FichesDossiers.tsx` (nouveau) | Vue fiche par fiche avec flèches |
| `src/app/admin/StatistiquesVue.tsx` (nouveau) | Onglet Statistiques |
| `src/app/admin/libelles.ts` (nouveau) | Libellés de statut partagés |
| `src/lib/statistiques.ts` (nouveau) | Calcul des statistiques |
| `src/app/api/admin/export/route.ts` (nouveau) | Exports CSV |
| `src/lib/repository.ts` | Recherche par district, limite configurable |

**Vérifié en local** (12 dossiers fictifs dans 8 districts) : chiffres
clés et tableaux corrects, flèches écran et clavier, bouton Consulter,
4 exports CSV corrects, export refusé sans identifiants, formule
neutralisée dans l'export.

### Mise en ligne du lot B

- [ ] GO, commit et push sur `master`.
- [ ] Vérifier le déploiement dans Coolify (*Deployments* → **Success**).
- [ ] Test en ligne des trois onglets de `/admin` et d'un export CSV.

---

## Lot C — 9 octobre 2026 — Galerie photos et contact

Choix validés : photos alimentées **à la fois** par le dossier `GALERIE`
du projet et par des envois depuis `/admin` ; intitulés des menus **en
malgache**.

La page d'accueil affiche, entre le logo et la carte, deux menus côte à
côte : **Sary** | **Fifandraisana**. Sur la page de la galerie, un menu
**Fandraisana** (accueil) s'ajoute pour revenir à l'accueil. Accès libre,
sans inscription ni mot de passe.

### C1 — Galerie photos « Sary » (`/galerie`)

**Page publique :**

- Grille de photos : 2 colonnes sur téléphone, 3 sur tablette, 4 sur
  ordinateur.
- Clic sur une photo → affichage en grand sur fond noir, avec flèches ← →,
  flèches du clavier, glissement du doigt sur téléphone, touche Échap ou
  croix pour fermer, compteur « 2 / 5 ».
- Photos redimensionnées automatiquement selon l'écran (chargement rapide
  sur téléphone, même pour des photos lourdes).
- Légende tirée du nom de fichier (voir ci-dessous).
- Message « Mbola tsy misy sary amin'izao fotoana izao. » tant que la
  galerie est vide.

**Alimenter la galerie — deux façons :**

1. **Dossier `D:\PROJETS\VFM105\GALERIE`** (via GitHub Desktop)
   - Ajouter, remplacer ou supprimer des photos dans le dossier, puis dans
     GitHub Desktop : *Commit to master* → *Push origin*. Le site se met à
     jour automatiquement en 2 à 3 minutes (redéploiement Coolify).
   - **Ordre d'affichage** : alphabétique ; préfixer par `01-`, `02-`...
     pour le choisir. Ce préfixe n'est pas affiché.
   - **Légende** = nom du fichier, tirets et soulignés remplacés par des
     espaces : `01-fety-nasionaly_2026.jpg` → « fety nasionaly 2026 ».
   - Les noms automatiques des téléphones et applications (`IMG-2026…`,
     `Picsart_…`, `file_…`, `WhatsApp…`) n'affichent pas de légende :
     renommer la photo pour en avoir une.
   - Formats : JPG, JPEG, PNG, WebP, GIF.
   - Conseil : réduire les photos d'appareil photo (par exemple 2000 px de
     large) avant de les ajouter, pour ne pas alourdir le dépôt Git.
2. **Page admin → onglet « Galerie photos »**
   - Bouton « Choisir des photos » (plusieurs à la fois, 15 Mo maximum
     chacune) : publication **immédiate**, sans redéploiement.
   - Bouton « Supprimer » sur chaque photo envoyée de cette façon.
   - Ces photos sont stockées sur le VPS dans le volume persistant
     (`/app/data/uploads/galerie`) : elles survivent aux redéploiements,
     mais ne sont pas sauvegardées ailleurs. Elles n'ont pas de légende.
   - Les photos du dossier `GALERIE` sont listées aussi, mais ne se
     modifient que par le dossier.

**Ordre dans la galerie :** photos envoyées depuis l'admin (plus récentes
d'abord), puis photos du dossier `GALERIE`.

**Sécurité :** envoi et suppression réservés à l'admin (401 sinon) ;
seuls les formats image sont acceptés (SVG refusé) ; noms de fichiers
générés par le serveur ; aucun accès possible en dehors des deux dossiers
de photos (testé).

### C2 — Menu contact « Fifandraisana »

Un clic sur **Fifandraisana** affiche simplement, sous les menus :
« Mailaka : **contact.vfm@0550.site** » (lien cliquable qui ouvre la
messagerie). Un second clic le masque. Aucun formulaire.

> Vérifier que la boîte `contact.vfm@0550.site` existe bien chez LWS
> (*Espace client* → *Mails*), sinon les messages seront perdus.

**Fichiers :**

| Fichier | Modification |
|---|---|
| `GALERIE/` (nouveau, avec `.gitkeep`) | Photos de la galerie |
| `src/lib/galerie.ts` (nouveau) | Lecture, ajout, suppression des photos |
| `src/app/galerie/page.tsx`, `GrilleGalerie.tsx` (nouveaux) | Page publique et agrandissement |
| `src/app/galerie/photo/[source]/[nom]/route.ts` (nouveau) | Envoi des fichiers photo |
| `src/components/MenuPublic.tsx` (nouveau) | Menus Sary / Fifandraisana |
| `src/components/PublicShell.tsx`, `src/app/page.tsx` | Emplacement du menu |
| `src/app/admin/GalerieAdmin.tsx` (nouveau), `src/app/admin/page.tsx` | Onglet admin « Galerie photos » |
| `src/app/api/admin/galerie/...` (nouveaux) | Envoi et suppression (admin) |
| `next.config.ts` | Optimisation des images de la galerie ; limite d'envoi admin portée à 16 Mo |
| `Dockerfile` | Copie du dossier `GALERIE` dans l'image |
| `src/lib/stockage.ts` | Le build n'embarque plus tout le projet dans l'image serveur |

**Vérifié en local :** menus sur l'accueil, affichage de l'e-mail ;
galerie avec 5 photos de test (grille, agrandissement, flèches, Échap,
images optimisées) ; affichage téléphone sans défilement horizontal ;
envoi et suppression depuis l'admin ; refus sans identifiants (401) ;
refus du SVG ; tentatives d'accès hors dossier refusées (404) ; une photo
du dossier `GALERIE` ne peut pas être supprimée depuis l'admin.

**Mise en ligne :** 8 premières photos du dossier `GALERIE` publiées avec le
lot C (sans légende, noms automatiques).

### Mise en ligne du lot C

- [ ] GO, commit et push sur `master`.
- [ ] Vérifier le déploiement dans Coolify (*Deployments* → **Success**).
- [ ] Ajouter de vraies photos (dossier `GALERIE` ou admin) et vérifier
      `/galerie` sur téléphone et ordinateur.

### C3 — Correction : menus visibles en permanence

**Avant :** les menus **Sary** | **Fifandraisana** n'apparaissaient que sur
l'accueil et la galerie ; ils disparaissaient sur le formulaire de dépôt.

**Après :** les menus sont intégrés à l'habillage commun de toutes les
pages publiques : accueil, formulaire de dépôt, récapitulatif, page de
remerciement et galerie. Le lien **Fandraisana** (retour à l'accueil)
s'ajoute automatiquement sur toutes les pages sauf l'accueil.

Quitter le formulaire par un menu ne fait pas perdre la saisie : le
brouillon est conservé dans le navigateur et retrouvé au retour.

**Fichiers :** `src/components/PublicShell.tsx` (menu toujours affiché),
`src/components/MenuPublic.tsx` (détection de l'accueil),
`src/app/page.tsx` et `src/app/galerie/page.tsx` (menu retiré, désormais
fourni par l'habillage).

**Vérifié en local :** menus présents sur `/`, `/deposer` et `/galerie` ;
« Fandraisana » absent de l'accueil uniquement.

### C4 — Nouveaux intitulés des menus (15 octobre 2026)

| Avant | Après | Action |
|---|---|---|
| Fandraisana | **Dossier** | Retour à l'accueil (masqué sur l'accueil) |
| Sary | Sary | Galerie photos (inchangé) |
| Fifandraisana | **Resaho izahay** | Affiche l'adresse e-mail de contact |

Le titre de bloc « Fifandraisana » (coordonnées) du formulaire n'est pas
un menu : inchangé.

**Fichiers :** `src/components/MenuPublic.tsx` (intitulés),
`src/components/PublicShell.tsx` (commentaire), `README.md`.

**Vérifié en local :** intitulés affichés ; sur téléphone (375 px), les
trois menus tiennent sur une ligne sans débordement.

---

## Lot D — 9 octobre 2026 — Administrateurs de district et cartographie

### Référentiel géographique (source des données)

Les projets `D:\WINTIME CODE\onn-board` et `D:\New_moring` ont été examinés :
ils ne contiennent ni les contours des districts et des communes, ni les
noms des fokontany (onn-board : contours des 24 régions et liste des
communes ; New Morning : carte des régions en image et données simulées).

Source retenue (accord donné le 9 octobre 2026) : **Madagascar —
Subnational Administrative Boundaries**, BNGRC, diffusée par OCHA/HDX
(data.humdata.org, jeu `cod-ab-mdg`, mise à jour du 13 août 2026),
**licence CC BY-IGO** (citation de la source affichée sous la carte).
Fichiers téléchargés sur le PC uniquement (hors dépôt) :
`mdg_admin_boundaries.xlsx` (3,3 Mo) et `mdg_admin_boundaries.geojson.zip`
(77,3 Mo).

Données extraites et allégées, intégrées au site :

| Fichier | Contenu | Taille |
|---|---|---|
| `src/data/referentiel-geo.json` | 120 districts → 1 645 communes → 17 465 fokontany (noms + codes officiels) | 620 Ko (côté serveur) |
| `public/carte/districts.json` | Contours simplifiés des 120 districts | 217 Ko |
| `public/carte/communes/<code>.json` | Contours simplifiés des communes, un fichier par district | 1,8 Mo au total (≈ 15 Ko chargés par district) |

20 districts portent un nom différent dans la source officielle
(« Antananarivo I » = « 1er Arrondissement », « Taolanaro » =
« Taolagnaro », « Port-Bergé » = « Port-Berge (Boriziny-Vaovao) »...) :
la correspondance est faite automatiquement, la liste du formulaire ne
change pas.

### D1 — Administrateurs de district et droits d'accès

**Connexion :** la fenêtre de mot de passe du navigateur est remplacée par
une **page de connexion** (`/admin/connexion`). Le super-administrateur se
connecte avec les mêmes identifiants qu'avant (`ADMIN_USER` /
`ADMIN_PASSWORD`). Session de 12 heures, bouton « Se déconnecter » ;
8 essais ratés → blocage 15 minutes.

**Demande d'accès (par l'administrateur de district lui-même) :** page
`/admin/inscription` (lien aussi sur la page de connexion) : nom, prénom,
téléphone, district d'origine, **identifiant et mot de passe choisis par
l'administrateur** (10 caractères minimum). Le mot de passe est enregistré
chiffré (scrypt) : personne, pas même le super-administrateur, ne peut le
lire.

**Validation par le super-administrateur :**

- un e-mail est envoyé à **doc.malagasy@gmail.com** avec un lien de
  validation ; le lien ouvre la demande, **uniquement après connexion en
  super-administrateur** (un lien intercepté ne suffit pas) ;
- les demandes apparaissent aussi dans le nouvel onglet **Administrateurs**
  (réservé au super-administrateur) : Valider, Refuser, Désactiver,
  Réactiver, Supprimer ;
- tant que la demande n'est pas validée, la connexion est refusée ; une
  désactivation prend effet immédiatement.

**Règles :**

- un seul administrateur (actif ou en attente) par district, garanti par la
  base de données ; les districts déjà attribués sont grisés dans la liste ;
- identifiant unique, différent de celui du super-administrateur.

**Droits de l'administrateur de district** (choix du 9 octobre 2026) :

| Fonction | Super-administrateur | Administrateur de district |
|---|---|---|
| Liste et consultation des dossiers | Tous | Son district uniquement |
| Fiche d'un dossier, pièces jointes | Tous | Son district uniquement (lecture seule) |
| Changer le statut, renvoyer le SMS, supprimer un dossier | Oui | Non |
| Statistiques | Nationales | Son district (par commune) |
| Exports CSV | Tout | Son district uniquement |
| Carte | Madagascar entière | Son district |
| Galerie photos (nationale) | Ajouter, supprimer toutes les photos envoyées | Ajouter ; supprimer ses propres photos |
| Gestion des administrateurs | Oui | Non |

Les restrictions sont appliquées côté serveur (affichage, consultation,
modification, exports, carte, pièces jointes) : testées en appelant
directement les adresses interdites (403 ou 404).

### D2.1 — Carte interactive (onglet « Carte »)

- **Super-administrateur :** carte de Madagascar par district, colorée selon
  le nombre d'associations (0, 1, 2–4, 5–9, 10 et plus) ; survol = nom et
  chiffres ; clic sur un district → carte de ses communes ; bouton
  « ← Madagascar » pour revenir. Liste des districts classés à droite.
- **Administrateur de district :** directement la carte des communes de son
  district.
- Clic sur une commune → liste de ses associations : nom, responsable,
  téléphone (cliquable), fokontany, nombre de membres, lien vers la fiche.
- Les communes **saisies à la main** (hors référentiel) sont listées à part,
  « hors carte », et restent consultables.
- Données lues en direct dans la base : chaque nouveau dossier apparaît
  aussitôt sur la carte.

### D2.2 / D2.3 — Formulaire : District > Kaominina > Fokontany

Dans le bloc « Ny fikambanana », après le district :

- **Kaominina** (obligatoire) : liste des communes du district choisi,
  plus « Hafa (soraty ny anarana) » pour saisir un nom absent de la liste ;
- **Fokontany** (facultatif) : liste des fokontany de la commune choisie,
  plus « Hafa » pour la saisie libre ; saisie libre directe si la commune
  a été écrite à la main ;
- changer de district vide la commune et le fokontany ; bouton « Lisitra »
  pour revenir à la liste après une saisie manuelle ;
- récapitulatif, fiche admin, exports et carte affichent commune et
  fokontany.

**Enregistrement :** chaque dossier conserve le nom de la commune et du
fokontany, et leur code officiel quand ils viennent du référentiel. Le
serveur revérifie : un code qui n'appartient pas au district choisi est
ignoré, et un nom tapé à la main identique à un nom officiel est rattaché
automatiquement à son code. Les saisies manuelles sont conservées telles
quelles et comptées dans les statistiques (tableau par commune).

### Base de données

Migration `migrations/003_admins_geo.sql`, **appliquée automatiquement**
au premier accès après le déploiement (aucune action manuelle) :
4 colonnes ajoutées aux dossiers (commune, code commune, fokontany, code
fokontany), nouvelle table `administrateurs`.

### Configuration à faire (Coolify et LWS)

1. **Boîte d'envoi chez LWS** : `noreply@0550.site`, créée le 9 octobre
   2026. Serveur vérifié : `mail77.lwspanel.com`, port 465 (SSL),
   certificat valide ; l'enregistrement SPF du domaine autorise ce serveur.
2. **Coolify → application → Environment Variables**, ajouter :

| Variable | Valeur |
|---|---|
| `SMTP_HOST` | `mail77.lwspanel.com` (serveur LWS de la boîte ; `mail.0550.site` pointe au même endroit mais son certificat SSL est au nom de lwspanel.com et serait refusé) |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `noreply@0550.site` |
| `SMTP_PASSWORD` | mot de passe de la boîte (ne jamais l'écrire ailleurs) |
| `SMTP_FROM` | `VFM <noreply@0550.site>` |
| `SESSION_SECRET` | nouveau secret de 64 caractères (méthode `serveur.md` §5) — conseillé |
| `SUPER_ADMIN_EMAIL` | facultatif, `doc.malagasy@gmail.com` par défaut |

3. **Deploy**. Sans les variables `SMTP_*`, tout fonctionne mais les
   demandes ne sont visibles que dans l'onglet Administrateurs.

### Fichiers principaux

| Fichier | Rôle |
|---|---|
| `src/lib/auth.ts`, `src/lib/jeton.ts`, `src/proxy.ts` | Sessions, mots de passe, protection des pages admin |
| `src/app/admin/connexion/`, `src/app/admin/inscription/`, `src/app/admin/validation/[jeton]/` | Connexion, demande d'accès, validation |
| `src/app/api/auth/*` | Connexion, déconnexion, inscription |
| `src/lib/administrateurs.ts`, `src/app/admin/AdministrateursVue.tsx`, `ActionsAdministrateur.tsx`, `src/app/api/admin/administrateurs/[id]/` | Gestion des comptes |
| `src/lib/email.ts` | Envoi d'e-mails (nodemailer) |
| `src/lib/referentiel.ts`, `src/data/referentiel-geo.json`, `src/app/api/referentiel/` | Référentiel District > Commune > Fokontany |
| `src/components/ChoixLocalite.tsx`, `src/components/DepotWizard.tsx` | Listes liées du formulaire |
| `src/lib/carte.ts`, `src/app/api/admin/carte/`, `src/app/admin/CarteAdmin.tsx`, `public/carte/` | Carte interactive |
| `src/lib/schema.ts`, `migrations/003_admins_geo.sql` | Évolution de la base |
| Routes `src/app/api/admin/*`, `src/lib/statistiques.ts`, `src/lib/galerie.ts`, pages `src/app/admin/*` | Application des droits par district |

Nouvelles dépendances : `d3-geo` (dessin de la carte), `nodemailer`
(e-mails, version 10.0.16).

**Vérifié en local** (base de test) : listes liées (25 communes pour
Ambohidratrimo, 31 fokontany pour Mahitsy), saisie manuelle, rattachement
et contrôle des codes ; demande d'accès, refus d'une 2e demande pour le
même district, connexion refusée avant validation, validation par lien
(connexion super-administrateur exigée) ; administrateur de district limité
à son district pour la liste, les fiches, les exports et la carte ; actions
interdites refusées (403/404) ; galerie : suppression des photos d'autrui
refusée ; carte nationale (120 districts) et carte de district
(25 communes) colorées selon les données ; build de production réussi.

### Mise en ligne du lot D

- [ ] GO, commit et push sur `master` (avec C3).
- [ ] Vérifier le déploiement dans Coolify (*Deployments* → **Success**).
- [ ] Se reconnecter à `/admin` avec les identifiants habituels (nouvelle
      page de connexion).
- [x] Créer la boîte `noreply@0550.site` chez LWS.
- [x] Variables `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_FROM` ajoutées
      dans Coolify (9 octobre 2026).
- [x] Test depuis le VPS : ports 465 et 587 vers `mail77.lwspanel.com`
      ouverts.
- [x] `SMTP_PASSWORD` saisi par le responsable, *Deploy* (9 octobre 2026).
- [x] E-mail de demande d'accès reçu sur doc.malagasy@gmail.com
      (9 octobre 2026).
- [ ] `SESSION_SECRET` : facultatif, non défini (clé de session dérivée des
      secrets existants) ; à ajouter si souhaité.
- Remarque : un e-mail n'est envoyé qu'à la création d'une demande ; une
  demande supprimée disparaît de la base.
- [ ] Test : demande d'accès pour un district, réception de l'e-mail,
      validation, connexion de l'administrateur de district.

### D2.4 — Communes d'ONN Board ajoutées aux listes (15 octobre 2026)

**Demande :** réutiliser les données administratives du projet ONN Board
pour le formulaire (listes District > Commune > Fokontany liées, saisie
manuelle conservée).

**Constat :** les listes liées étaient déjà en ligne (D2.2). ONN Board
contient 1 911 communes rattachées à leur district, mais **aucun nom de
fokontany** ni contour cartographique : le référentiel officiel BNGRC reste
la base (communes, fokontany, carte).

**Après :** les communes d'ONN Board **absentes** de la liste officielle
sont ajoutées aux listes déroulantes : **114 communes** (1 759 au total).

Écartées automatiquement :

- 1 763 communes déjà présentes sous la même écriture ou une variante
  (Sud/Atsimo, Nord/Avaratra, « Ville », « Suburbaine », « Banlieue d' »,
  fautes de frappe, nom contenu dans le nom officiel, nom officiel entre
  parenthèses comme « Mahavelona (Foulpointe) ») ;
- synonymes connus : Antsiranana = Diego Suarez, Fenoarivo Atsinanana =
  Fenerive Est, Nosy-Be = Hell-Ville, Taolagnaro = Fort-Dauphin,
  Belon'i Tsiribihina = Belo Sur Tsiribihina ;
- 12 codes Wikidata (« Q21538633 ») à la place d'un nom, 12 communes sans
  district, 6 entrées parasites (noms de région, « AMORON'I MANIA
  (Suite) »), 4 doublons ;
- précision après une virgule retirée (« Antanambe, Diana » → Antanambe).

**Fonctionnement :** une commune ONN Board se choisit comme les autres ;
n'ayant pas de liste de fokontany, le champ Fokontany passe directement en
saisie libre. Elle est enregistrée **sans code officiel** : comptée dans
les statistiques par commune, listée sur la carte dans « Communes hors
carte (saisies à la main ou sans contour officiel) ».

**Fichiers :** `src/data/referentiel-geo.json` (communes ajoutées, code
interne `ONN-…`), `src/lib/referentiel.ts` (traitement de ces communes),
`src/app/admin/CarteAdmin.tsx` (intitulé de la liste hors carte).

**Vérifié en local :** district Moramanga → 24 communes dont Beparasy
(ONN Board) ; Fokontany en saisie libre ; dossier enregistré avec la
commune sans code ; carte : Beparasy dans la liste hors carte ; build de
production réussi.

---

## Lot E — Confirmation du dépôt

### E1 — Suppression provisoire du SMS, confirmation par e-mail (15 octobre 2026)

**Avant :** après la validation définitive, la page de remerciement
annonçait l'envoi d'un SMS, et la passerelle Android envoyait le SMS
« VFM : Voaray ny antontan-taratasinao. Laharana : … ».

**Après :**

- **Envoi de SMS désactivé** : plus aucun SMS n'est préparé ni envoyé, et
  plus aucune mention du SMS n'apparaît sur le site public. Les nouveaux
  dossiers ont le statut SMS « Désactivé ».
- **E-mail de confirmation** envoyé automatiquement, depuis
  `noreply@0550.site`, si le déposant a renseigné son adresse e-mail :
  - objet : « VFM — Voaray ny antontan-taratasinao (VFM-2026-0002) » ;
  - contenu en malgache : nom de l'association, **référence du dossier**,
    lieu (fokontany, commune, district), date et heure du dépôt, consigne
    de conserver la référence, adresse de contact ;
  - envoyé une seule fois par dossier (pas de doublon en cas de double
    clic).
- **Page de remerciement** :
  - e-mail envoyé → « Nalefa tany amin'ny <adresse> ny mailaka
    fanamarinana misy ity laharana ity. » ;
  - pas d'adresse e-mail (ou échec d'envoi) → simple confirmation de
    réception avec la référence : « Tehirizo ity laharana ity. » (aucune
    annonce d'e-mail ni de SMS).
- **Formulaire** : le sous-titre du bloc Coordonnées annonce désormais
  l'e-mail : « Raha manome mailaka ianao dia handray mailaka
  fanamarinana ».
- **Administration** : colonne et badge **E-mail** (Envoyé / Échec / Pas
  d'adresse) à la place du SMS ; bouton « Renvoyer le SMS » masqué.

**Code SMS conservé, prêt à être réactivé :**

- tout le code SMS est regroupé dans `src/lib/sms.ts` (texte du SMS, file
  d'attente, statuts, renvoi), avec le mode d'emploi en tête de fichier ;
- routes conservées mais coupées : `/api/sms-gateway/pending` et
  `/api/sms-gateway/report` répondent « Envoi de SMS désactivé » (503),
  le renvoi admin est refusé (409) ;
- application Android inchangée (`android-sms-gateway/`).

**Réactivation :** ajouter `SMS_ACTIF=true` dans Coolify (Environment
Variables), *Deploy*, puis redémarrer la passerelle dans l'application
Android. Les dossiers déposés pendant la désactivation ne recevront pas de
SMS rétroactivement.

> **À faire sur le téléphone :** arrêter la passerelle dans l'application
> Android (« Arrêter la passerelle ») ; sinon elle affichera des erreurs de
> sondage, sans conséquence.

**Base de données :** nouvelle colonne `email_confirmation`
(`migrations/004_email_confirmation.sql`), appliquée automatiquement.

**Fichiers :**

| Fichier | Modification |
|---|---|
| `src/lib/sms.ts` | Module SMS complet + interrupteur `SMS_ACTIF` |
| `src/lib/confirmation.ts` (nouveau) | E-mail de confirmation en malgache |
| `src/app/api/dossiers/route.ts` | Envoi de l'e-mail après l'enregistrement |
| `src/lib/repository.ts`, `src/lib/types.ts`, `src/lib/schema.ts` | Statut SMS « desactive », statut de l'e-mail |
| `src/app/confirmation/[reference]/page.tsx` | Nouveaux messages de remerciement |
| `src/components/DepotWizard.tsx` | Sous-titre du bloc Coordonnées |
| `src/app/api/sms-gateway/*`, `src/app/api/admin/dossiers/[reference]/resend-sms/` | Coupés tant que `SMS_ACTIF` n'est pas activé |
| `src/app/admin/page.tsx`, `FichesDossiers.tsx`, `libelles.ts`, `[reference]/page.tsx`, `[reference]/DossierActions.tsx` | Affichage de l'e-mail, SMS masqué |
| `migrations/004_email_confirmation.sql`, `.env.example` | Colonne et variable documentées |

**Vérifié en local** (serveur mail de test qui capture les messages) :
dépôt avec e-mail → e-mail reçu avec la référence, objet et contenu
corrects, page de remerciement annonçant l'e-mail ; dépôt sans e-mail →
simple confirmation ; statut SMS « Désactivé » ; passerelle 503 ; renvoi
SMS refusé ; colonne E-mail dans l'administration ; build de production
réussi.

---

## Lot F — Radio VFM

### F1 — Menu « Radio » et lecteur du direct (15 octobre 2026)

**Contexte :** radio en ligne AzuraCast installée sur le même VPS (projet
Coolify « Radio VFM », https://radio.0550.site, voir `serveur.md` étape 14).
Flux commun à tous les auditeurs : MP3 128 kbit/s,
`https://radio.0550.site/listen/vfm/radio.mp3`.

**Avant :** menus Dossier | Sary | Resaho izahay ; aucune radio sur le site.

**Après :**

- nouveau menu **Radio** sur toutes les pages publiques, entre Sary et
  Resaho izahay ;
- page **`/radio`** (« Radio VFM — Henoy mivantana ny Radio VFM ») :
  - grand bouton Play / Arrêt ; Play rejoint toujours le direct (l'arrêt
    coupe le flux au lieu de le mettre en pause) ;
  - titre en cours (« Mandeha ankehitriny ») et titre suivant
    (« Manaraka »), avec pochette, rafraîchis toutes les 15 secondes par
    l'API publique d'AzuraCast ;
  - réglage du volume (« Feo ») ;
  - message « Tsy mandeha ny radio amin'izao fotoana izao. » si la station
    est arrêtée, et message d'erreur si le flux ne répond pas ;
  - ~~lien « Pejin'ny Radio VFM » vers la page publique de la station~~ :
    retiré à la demande le 15 octobre 2026 (F1 bis).
- Sur téléphone (375 px), les quatre menus tiennent sur une ligne :
  espacement des menus légèrement réduit sur petits écrans.

Aucune donnée ni secret côté VFM : le lecteur lit directement le flux et
l'API publique de `radio.0550.site` (CORS ouvert par AzuraCast).

**Fichiers :**

| Fichier | Modification |
|---|---|
| `src/app/radio/page.tsx` (nouveau) | Page Radio |
| `src/app/radio/LecteurRadio.tsx` (nouveau) | Lecteur, titre en cours, volume |
| `src/components/MenuPublic.tsx` | Menu Radio, espacement mobile |
| `src/components/PublicShell.tsx` | Commentaire |

**Vérifié en local :** page `/radio`, titre en cours affiché, lecture du
direct (flux reçu, aucune erreur), arrêt (flux coupé), menus sur une ligne
en 375 px sans défilement horizontal, accueil (Sary / Radio / Resaho
izahay), console sans erreur, vérification des types, lint, build de
production.

### Mise en ligne du lot F

- [x] GO, commit `b5a92ef` et push sur `master` (15 octobre 2026).
- [x] Déploiement Coolify réussi : `/radio` en ligne environ 1 min 30 après
      le push ; l'accueil est resté accessible pendant la bascule.
- [x] Test en ligne (ordinateur) : 4 menus présents, lecture du direct,
      arrêt, titre en cours et suivant affichés, console sans erreur.
- [ ] Test sur un vrai téléphone.

---

## Lot G — Sondages « Manehoa hevitra »

### G1 — Système de sondages (15 octobre 2026)

**Demande :** menu « Donnez votre avis » (« Manehoa hevitra ») permettant
aux internautes de répondre à des sondages sur différentes thématiques ;
gestion (jusqu'à 30 thématiques), résultats, analyses et graphiques dans
l'administration, avec les droits d'accès existants.

**Choix validés le 15 octobre 2026 :**

- types de questions : choix unique, choix multiples, note de 1 à 5,
  texte libre, classement par ordre de préférence ;
- renseignements demandés au participant : **sexe** et **district**
  (obligatoires, pour regrouper et comparer) ; aucune donnée personnelle ;
- un vote par sondage **et par navigateur** (cookie), et au plus 40 votes
  par sondage depuis une même adresse IP (réseaux mobiles partagés) ;
- résultats visibles **dans l'administration uniquement** ;
- administrateur de district : résultats de **son district**, en lecture.

**Côté public (en malgache) :**

- nouveau menu **Manehoa hevitra** sur toutes les pages publiques ; sur
  téléphone, les menus passent sur deux lignes au besoin ;
- `/sondages` : liste des sondages actifs, avec « Hamaly » ou « Efa namaly »
  (déjà répondu sur ce navigateur) ;
- `/sondages/<n°>` : formulaire « Mombamomba anao » (Lahy / Vavy, Distrika),
  puis les questions ; note en 5 boutons (« 1 = ratsy indrindra, 5 = tsara
  indrindra »), classement par boutons ↑ ↓ (utilisable au doigt) ; messages
  d'erreur en malgache ; remerciement « Misaotra nanome ny hevitrao! » ;
- un sondage désactivé n'est plus visible ni ouvert aux réponses ;
- protection contre les robots par champ piège invisible.

**Administration, nouvel onglet « Sondages » :**

- liste des thématiques (état, nombre de questions et de réponses) ;
  compteur « n / 30 » ; bouton **Nouveau sondage** (super-administrateur,
  masqué à 30) ;
- **éditeur** : titre, présentation, activation, questions (ajout,
  suppression, déplacement ↑ ↓, type, réponse obligatoire, 2 à 20
  propositions). Dès qu'un sondage a reçu des réponses, ses questions et
  propositions sont **figées** (seuls titre, présentation et activation
  changent), pour ne pas fausser les résultats ;
- **Activer / Désactiver / Supprimer** (suppression définitive du sondage et
  de ses réponses, avec confirmation) ;
- **page de résultats** :
  - filtres sur une ligne : sexe, région, district, période (du / au),
    **comparer par** (aucun, sexe, région, district), **tri** (ordre du
    questionnaire ou réponses les plus choisies d'abord) ;
  - chiffres clés : réponses, hommes, femmes (et %), districts et régions
    représentés, période des réponses ;
  - répartition par sexe (barre à deux couleurs avec légende), réponses
    par jour, participation par district ;
  - par question : barres avec nombre et % ; note moyenne et médiane avec
    répartition 1 à 5 ; classement (score de préférence, rang moyen, nombre
    de fois classée 1re) ; textes libres avec sexe, district et date ;
  - comparaison par groupe : tableau croisé (une ligne par groupe, une
    colonne par proposition, avec mini-barres) ;
  - **exports CSV** : réponses détaillées (une ligne par participation) et
    synthèse par question, avec les filtres choisis.
- Couleurs Homme / Femme vérifiées pour la lisibilité et le daltonisme ;
  chaque valeur est aussi écrite en chiffres.

**Droits :** création, modification, activation et suppression réservées au
super-administrateur (403 sinon, contrôlé côté serveur). Administrateur de
district : onglet Sondages en lecture, résultats et exports limités à son
district quel que soit le filtre demandé ; comparaison par sexe seulement.

**Base de données :** tables `sondages` et `reponses_sondage`
(`migrations/005_sondages.sql`), créées automatiquement au premier accès.
L'adresse IP n'est jamais enregistrée (empreinte seulement).

**Fichiers :**

| Fichier | Rôle |
|---|---|
| `migrations/005_sondages.sql`, `src/lib/schema.ts` | Tables des sondages et réponses |
| `src/lib/sondages-modele.ts` (nouveau) | Types, limites, validation (partagé public / admin) |
| `src/lib/sondages.ts` (nouveau) | Lecture, création, modification, participation |
| `src/lib/sondages-analyse.ts` (nouveau) | Statistiques, regroupements, tri |
| `src/lib/sondages-filtres.ts` (nouveau) | Filtres de la page de résultats et de l'export |
| `src/lib/csv.ts` (nouveau) | Fonctions CSV communes (reprises de l'export des dossiers) |
| `src/app/sondages/` (nouveau) | Liste et formulaire publics |
| `src/app/api/sondages/[id]/route.ts` (nouveau) | Enregistrement d'une participation |
| `src/app/admin/SondagesVue.tsx`, `src/app/admin/sondages/` (nouveaux) | Onglet, éditeur, résultats |
| `src/app/api/admin/sondages/` (nouveaux) | Création, modification, activation, suppression, export |
| `src/app/admin/page.tsx` | Onglet « Sondages » |
| `src/components/MenuPublic.tsx`, `PublicShell.tsx` | Menu « Manehoa hevitra » |
| `src/app/api/admin/export/route.ts` | Utilise `src/lib/csv.ts` (sans changement de résultat) |

**Vérifié en local** (base PostgreSQL de test temporaire, 101 participations
fictives) — 43 contrôles automatiques réussis :

- création refusée sans session (401) ; sondage invalide refusé (400) ;
- sondage désactivé : page et vote refusés (404) ; activé : visible ;
- 60 participations acceptées ; 2e vote du même navigateur refusé (409) et
  page « Efa namaly » ; question obligatoire manquante, proposition hors
  liste, classement incomplet, district inconnu, note 6 refusés (400) ;
  robot ignoré ; 41e et 42e votes d'une même IP refusés (429) ;
- questions figées après réponses (409), titre toujours modifiable ;
- page de résultats avec chaque filtre, comparaison et tri (200) ; exports
  réponses (100 lignes) et synthèse ; export refusé sans session (401) ;
- administrateur de district : onglet en lecture sans boutons de gestion,
  création / désactivation / suppression refusées (403), page de
  modification refusée (404), résultats et export limités à son district
  même en demandant un autre district.

Contrôle visuel : liste et formulaire publics sur téléphone (375 px, sans
défilement horizontal), message d'erreur, remerciement ; onglet, éditeur
(questions figées signalées) et résultats sur ordinateur et téléphone.
Vérification des types et build de production réussis. Lint : seule
l'erreur déjà connue de `DepotWizard.tsx` (`serveur.md` §9).

### Mise en ligne du lot G

- [x] GO, commit `9749cea` et push sur `master` (16 octobre 2026).
- [x] Déploiement : nouvelles pages en ligne environ 1 min 40 après le push,
      accueil resté accessible ; `/sondages` interroge la base de
      production (tables créées). Statut Coolify non consulté (session du
      panneau expirée).
- [x] Contrôles en ligne : menu « Manehoa hevitra » sur l'accueil, page
      `/sondages` (« Tsy misy fanadihadiana… »), sondage inexistant (404),
      création et export refusés sans session (401), page
      `/admin/sondages/nouveau` redirigée vers la connexion ; `/`, `/radio`,
      `/galerie`, `/deposer` en 200.
- [ ] Créer un premier sondage depuis l'admin, l'activer, y répondre depuis
      un téléphone, consulter les résultats.

---

## Lot H — Menus, Birao et bouton Radio (16 octobre 2026)

Demande : `MARKDOWN/modifE.md` (« Modification E » E1 à E3), numérotée ici
H1 à H3 pour ne pas la confondre avec le lot E (confirmation par e-mail).

### H1 — Menus stables, page en cours grisée

**Avant :** le bouton de la page affichée disparaissait (« Dossier » masqué
sur l'accueil), ce qui décalait les autres boutons.

**Après :** les six boutons sont toujours présents, dans le même ordre :
**Dossier · Birao · Sary · Radio · Manehoa hevitra · Resaho izahay**. Le
bouton de la page en cours reste à sa place, **grisé et inactif** (non
cliquable, signalé comme page en cours aux lecteurs d'écran) :

- Dossier sur l'accueil (il reste actif sur le formulaire de dépôt et la
  page de remerciement, pour revenir à l'accueil) ;
- Birao sur `/birao`, Sary sur `/galerie`, Radio sur `/radio` ;
- Manehoa hevitra sur `/sondages` et sur chaque sondage.

« Resaho izahay » n'ouvre pas de page (il affiche l'adresse e-mail) : il
garde son fonctionnement. Le petit séparateur vertical avant ce bouton est
supprimé (il restait seul en fin de ligne quand le menu passe sur deux
lignes). Ordinateur et tablette : une ligne ; téléphone : deux lignes.

### H2 — Menu et page « Birao »

- Nouveau bouton **Birao** et page **`/birao`** « Birao Nasionaly — Ireo
  mpikambana ao amin'ny Birao Nasionaly VFM ».
- Le président est mis en avant, les quatre autres membres en grille
  (1 colonne sur téléphone, 2 sur tablette, 4 sur ordinateur). Chaque fiche :
  initiales (en attendant une photo), nom, fonction en malgache, district.

| Nom et prénom | Fonction affichée | Distrika |
|---|---|---|
| Fanomezantsoa ANDRIANJANAHARY | Filoha nasionalin'ny VFM | Manandriana |
| Pety RAKOTONIAINA | Filoha lefitra nasionalin'ny VFM | Ikalamavony |
| Nirina Fenohery Johnny RAKOTOARISOA | Filoha lefitra nasionalin'ny VFM | Ambohidratrimo |
| Namiandrazana François AROSY | Filoha lefitra nasionalin'ny VFM | Nosy Be |
| Marco TSARADIA | Sekretera jeneraly nasionalin'ny VFM | Ampanihy |

**Faire évoluer la page :** tout est dans `src/data/birao.ts` (mode d'emploi
en tête du fichier) — ajouter une ligne pour un membre ; photo : déposer
l'image dans `public/images/birao/` et indiquer son nom (`photo`) ;
biographie : champ `tantara`. Puis commit et push.

### H3 — Bouton « Radio » distinctif et indicateur LIVE

- Le bouton **Radio** a son propre style sur toutes les pages : fond bleu
  marine, texte blanc, icône d'ondes.
- **Pendant la diffusion** (choix du 16 octobre 2026 : dès que la station
  est en marche, playlist automatique comprise) : pastille rouge **LIVE**
  avec point clignotant, et le mot « Radio » qui pulse doucement.
- **Radio arrêtée ou injoignable :** bouton visible, sans animation ni
  LIVE. L'indicateur n'apparaît qu'après confirmation par la station
  (jamais de LIVE « par défaut »).
- État vérifié toutes les 30 secondes auprès de l'API publique d'AzuraCast
  (`radio.0550.site`), et à chaque retour sur l'onglet ; aucune requête quand
  l'onglet est en arrière-plan.
- Animations désactivées si le visiteur a demandé à réduire les animations
  (réglage du téléphone ou de l'ordinateur).
- Sur la page Radio, le bouton est grisé (H1) mais garde l'indication LIVE.

### H4 — Menus de l'administration toujours visibles

Demande : « Modification E4 ».

**Avant :** les onglets de l'administration (Liste des dossiers,
Consultation fiche par fiche, Statistiques, Carte, Galerie photos,
Sondages, Administrateurs) disparaissaient dès qu'on ouvrait une page
intérieure : fiche d'un dossier, résultats, création ou modification d'un
sondage.

**Après :** même en-tête (« Administration VFM », rôle, Se déconnecter) et
mêmes onglets, au même endroit et dans le même ordre, sur **toutes** les
pages de l'administration :

- rubrique affichée (ex. `/admin?vue=sondages`) : son onglet est **grisé et
  inactif** ;
- page intérieure d'une rubrique (fiche d'un dossier, résultats d'un
  sondage, éditeur) : l'onglet de la rubrique est souligné et **reste
  cliquable** pour revenir à sa liste ; les liens « ← » existants sont
  conservés ;
- les autres onglets restent actifs ; l'onglet Administrateurs reste
  réservé au super-administrateur ;
- une future rubrique s'ajoute à un seul endroit
  (`src/app/admin/EnteteAdmin.tsx`) et apparaît partout ;
- le titre de l'en-tête devient « Administration VFM » sur toutes les pages
  (le district de l'administrateur de district est rappelé dessous).

Pages de connexion, de demande d'accès et de validation par e-mail :
inchangées (pas de menu avant connexion).

**Également :**

- titre de la page Birao « Birao Nasionaly » (au lieu de
  « Biraom-pirenena ») ;
- page d'accueil : « Apetraho an-tserasera eo amin'ny VFM… » devient
  « Apetraho ny Dosie-nao eo amin'ny VFM ny antontan-taratasin'ny
  fikambananao. », sur l'accueil (`src/app/page.tsx`) et en tête du
  formulaire de dépôt (`src/components/DepotWizard.tsx`).

**Vérifié en local** (base de test) : sur les 10 pages d'administration
(7 rubriques, résultats, modification et création d'un sondage), menu à la
même position avec les 7 onglets ; onglet de la rubrique grisé, ou
souligné et cliquable sur les pages intérieures ; téléphone 375 px sans
défilement horizontal ; tests automatiques des sondages et des droits de
district rejoués (43 / 43) ; types et build de production.

**Fichiers (lot H) :**

| Fichier | Modification |
|---|---|
| `src/components/MenuPublic.tsx` | Menus fixes, page en cours grisée, Birao, bouton Radio et LIVE |
| `src/components/PublicShell.tsx` | Commentaire |
| `src/app/globals.css` | Animations du bouton Radio |
| `src/lib/radio.ts` (nouveau) | Adresses de la station (partagées) |
| `src/app/radio/LecteurRadio.tsx` | Utilise `src/lib/radio.ts` |
| `src/data/birao.ts` (nouveau) | Membres du Bureau national |
| `src/app/birao/page.tsx` (nouveau) | Page Birao |
| `src/app/admin/EnteteAdmin.tsx` (nouveau) | En-tête et onglets communs de l'administration |
| `src/app/admin/page.tsx`, `[reference]/page.tsx`, `sondages/nouveau/page.tsx`, `sondages/[id]/page.tsx`, `sondages/[id]/modifier/page.tsx` | Utilisent l'en-tête commun |

**Vérifié en local :** menus sur `/`, `/birao`, `/radio` (page en cours
grisée et non cliquable, ordre identique) ; téléphone 375 px (deux lignes,
sans défilement horizontal), tablette 768 px (une ligne), ordinateur ;
LIVE affiché avec la station en marche ; LIVE et animation retirés quand la
station est indiquée arrêtée (simulation) ; page Birao (5 fiches, président
en tête) ; console sans erreur ; types, lint, build de production.

### Mise en ligne du lot H

- [x] GO, commit `a6de5e5` et push sur `master` (16 octobre 2026, avec le lot I).
- [x] Nouvelles pages en ligne environ 1 min 30 après le push, accueil
      resté accessible ; statut Coolify non consulté (session du panneau
      expirée).
- [x] Contrôles en ligne : six menus avec « Dossier » grisé sur l'accueil,
      Radio avec LIVE (station en marche), page Birao Nasionaly, phrase
      « Apetraho ny Dosie-nao », console sans erreur.
- [ ] Test en ligne sur téléphone : menus, page Birao, LIVE.

---

## Lot I — Dossiers de personnes physiques (16 octobre 2026)

Demande « Modification F1 », numérotée ici I1 (un lot F existe déjà : la
radio).

### I1 — Enregistrement des personnes physiques

**Avant :** le bouton vert « Hametraka antontan-taratasy » de l'accueil
ouvrait directement le formulaire des associations.

**Après :** le bouton propose d'abord **« Iza no ametrahana ny dosie ? »** :

- **Fikambanana** → formulaire des associations, **inchangé** (`/deposer`) ;
- **Olona tsirairay** → nouveau formulaire des personnes (`/deposer/olona`).

**Choix validés le 16 octobre 2026 :** référence `VFM-P-AAAA-NNNN` avec sa
propre numérotation ; téléphone obligatoire et e-mail facultatif (pour
recontacter la personne et lui envoyer sa référence) ; CV facultatif ; nouvel
onglet « Personnes » dans l'administration.

**Formulaire personne (en malgache) :** 1. Mombamomba anao (Anarana,
Fanampin'anarana, Daty nahaterahana, Distrika) · 2. Ny asanao (Asa
ankehitriny, Fanazavana momba ny asanao) · 3. Tetikasa manokana ·
4. Fifandraisana (Finday obligatoire, Mailaka) · 5. CV (un fichier, PDF,
Word ou image, 10 Mo au plus, facultatif). Même parcours que les
associations : vérification des champs, **famintinana** (récapitulatif),
« Hanova ny mombamomba » ou « Handefa farany ny dosie-ko », protection contre
le double envoi, brouillon gardé dans le navigateur (séparé de celui des
associations).

**Après l'envoi :** page « Misaotra anao ny VFM <district> » avec la
référence `VFM-P-…` ; e-mail de confirmation en malgache si une adresse a
été donnée (« VFM — Voaray ny dosie-nao (VFM-P-2026-0001) »).

**Administration — nouvel onglet « Personnes »** (après « Consultation fiche
par fiche ») :

- liste (référence, date, nom, âge, district, activité, téléphone, statut,
  CV, e-mail de confirmation), recherche par référence, nom, prénom,
  district, activité, téléphone ;
- fiche de la personne : toutes les informations, âge, lien vers le CV,
  téléphone et e-mail cliquables ; super-administrateur : changement de
  statut (mêmes statuts que les associations) et suppression définitive
  (dossier et CV) ;
- **export CSV** des personnes ;
- administrateur de district : uniquement les personnes de son district
  (liste, fiche, CV, export), en lecture seule.

Les dossiers d'associations, leur liste, leurs statistiques, la carte et
leur numérotation `VFM-AAAA-NNNN` sont inchangés.

**Base de données :** tables `dossiers_personnes` et
`reference_sequences_personnes` (`migrations/006_personnes.sql`), créées
automatiquement au premier accès.

**Fichiers :**

| Fichier | Rôle |
|---|---|
| `migrations/006_personnes.sql`, `src/lib/schema.ts` | Tables des personnes |
| `src/lib/reference.ts` | Numérotation `VFM-P-AAAA-NNNN` |
| `src/lib/personnes-modele.ts`, `src/lib/personnes.ts` (nouveaux) | Champs, validation, accès aux données |
| `src/lib/confirmation-personne.ts` (nouveau) | E-mail de confirmation |
| `src/app/ChoixDepot.tsx` (nouveau), `src/app/page.tsx` | Choix Fikambanana / Olona tsirairay |
| `src/app/deposer/olona/` (nouveau) | Formulaire des personnes |
| `src/app/confirmation/olona/[reference]/` (nouveau) | Page de remerciement |
| `src/app/api/personnes/route.ts` (nouveau) | Enregistrement |
| `src/app/admin/PersonnesVue.tsx`, `src/app/admin/olona/` (nouveaux) | Onglet, fiche, statut, suppression |
| `src/app/api/admin/personnes/` (nouveaux) | Statut et suppression |
| `src/app/admin/EnteteAdmin.tsx`, `src/app/admin/page.tsx` | Onglet « Personnes » |
| `src/app/api/admin/export/route.ts` | Export `type=personnes` |
| `src/app/api/admin/pieces/[...pathname]/route.ts` | CV accessible à l'administrateur du district |
| `src/components/DepotWizard.tsx` | Blocs de présentation réutilisés (sans changement du formulaire) |

**Vérifié en local** (base PostgreSQL de test) — 40 contrôles automatiques
réussis : envoi du CV ; dépôt avec CV → `VFM-P-2026-0001`, double envoi →
même dossier ; dépôt sans CV → `0002` ; nom, date future ou impossible,
district inconnu, téléphone, e-mail, projet → refusés avec message en
malgache ; dossier d'association toujours `VFM-2026-0001` ; pages
publiques ; remerciement ; onglet, recherche, fiche, CV, statut, export ;
refus sans session ; administrateur de district limité à son district
(liste, fiche, CV, export) et sans droit de gestion (403) ; suppression du
dossier et du fichier CV ; numérotation continue. Tests des sondages et des
droits de district rejoués (43 / 43). Contrôle visuel sur téléphone (choix
de l'accueil, formulaire). Types et build de production.

### Mise en ligne du lot I

- [x] GO, commit `a6de5e5` et push sur `master` (16 octobre 2026).
- [x] Contrôles en ligne : choix Fikambanana / Olona tsirairay sur
      l'accueil, `/deposer` et `/deposer/olona` en 200, envoi vide refusé
      (400), remerciement inexistant (404), onglet Personnes redirigé vers
      la connexion sans session, export et statut refusés sans session (401).
- [ ] Test en ligne : dépôt d'un dossier de personne, consultation dans
      l'onglet Personnes, puis suppression du dossier de test.

---

## Lot J — Accueil (28 octobre 2026)

### J1 — Affiche « Tafa & dinika » à la place de la carte d'accueil

**Avant :** carte blanche « Fametrahana Dosie / VFM » avec texte de
présentation et bouton « Hametraka antontan-taratasy » qui dévoilait les
choix Fikambanana / Olona tsirairay.

**Après :** l'affiche « Tafa & dinika — Fanabeazana politika »
(14 novembre 2026, Ambohidratrimo) remplace la carte : pleine largeur, bord
à bord sur téléphone ; limitée à la hauteur de l'écran, coins arrondis, sur
ordinateur. Les deux boutons Fikambanana (`/deposer`) et Olona tsirairay
(`/deposer/olona`) sont affichés directement sous l'affiche (plus de bouton
intermédiaire ni de « Hiverina »). Logo et menus inchangés.

**Fichiers :** `public/images/affiche-accueil.png` (nouveau),
`src/app/page.tsx`, `src/app/ChoixDepot.tsx`, `src/components/PublicShell.tsx`
(option `sansCarte`).

**Vérifié en local :** affichage téléphone (375 px, sans défilement
horizontal) et ordinateur, deux boutons visibles.

### J2 — Textes des boutons d'accueil

| Avant | Après |
|---|---|
| Iza no ametrahana ny dosie ? | Amin'ny anaran'iza no hisoratanao anarana ? |
| Fikambanana — Dosien'ny fikambanana iray | Fikambanana — sy ny mombamomba azy |
| Olona tsirairay — Dosie manokana ho an'ny olona iray | Ny tenako manokana — sy ny mombamomba ahy |

Liens inchangés (`/deposer`, `/deposer/olona`).

**Fichier :** `src/app/ChoixDepot.tsx`.

### J3 — Nouveau fond du site public

**Avant :** fond beige clair avec halos.

**Après :** fond gris taupe (#8e857c) à pois gris clairs décalés, d'après
l'image `IMG_20261028_104043.jpg`. Reproduit en CSS plutôt qu'en image :
net à toutes les tailles, rien à télécharger, et sans la signature
« @theslaytiqedit » présente dans le coin de l'image. S'applique à toutes
les pages publiques. Le logo est posé sur un médaillon blanc pour que son
texte gris reste lisible sur le fond gris.

**Fichiers :** `src/app/globals.css`, `src/components/PublicShell.tsx`.

**Vérifié en local :** accueil (téléphone et ordinateur), `/deposer`.

### J4 — Nouvelle affiche, bandeau « Voafetra » vert

**Après :** nouvelle affiche « Fanabeazana ara-politika » (avec pastille
rouge « Hotronon'ireo manam-pahaizana… »). Le bandeau du bas « Voafetra ny
toerana… vfm105.com », jaune à texte noir, est redessiné dans l'image :
pastille verte VFM (#0a9a4a) aux coins arrondis, texte blanc. Le fichier
change de nom (`affiche-tafa-dinika.png`, l'ancien `affiche-accueil.png`
est supprimé) pour que navigateurs et serveur d'images ne gardent pas
l'ancienne affiche en cache.

**Fichiers :** `public/images/affiche-tafa-dinika.png`, `src/app/page.tsx`.

### J5 — « AMBOHIDRATRIMO » sous le logo

Grosses lettres blanches (ombre légère pour la lisibilité sur le fond gris)
juste sous le médaillon du logo, sur toutes les pages publiques.

**Fichier :** `src/components/PublicShell.tsx`.

**Vérifié en local (J4, J5) :** téléphone 375 px sans défilement
horizontal, nouvelle affiche bien servie.

### J6 — Domaine `vfm105.com`

Le domaine pointait sur la page de parking LWS. Étapes (détail dans
`serveur.md`) :

- [x] LWS → zone DNS `vfm105.com` : enregistrement **A `@` → `31.207.34.137`**
      (remplace `185.135.132.106`) ; CNAME `www` → `vfm105.com.` conservé.
- [x] Coolify → application VFM → *Domains* : `https://vfm105.com` ajouté
      (Coolify a ajouté `https://www.vfm105.com` de lui-même), **Redeploy**.
- [x] Contrôle (28 octobre 2026) : `https://vfm105.com` et
      `https://www.vfm105.com` en 200, certificat valide, `http://` redirigé
      vers `https://`. `https://vfm.0550.site` toujours en 200.

**Reste possible :** les liens des e-mails envoyés par le site utilisent
toujours `https://vfm.0550.site` (variable `SITE_URL` non définie). Pour
passer à `vfm105.com`, définir `SITE_URL=https://vfm105.com` dans Coolify
puis redéployer.

### Mise en ligne du lot J

- [x] GO (28 octobre 2026), commit `d43ca01` et push sur `master`.
- [x] Déploiement en ligne contrôlé : https://vfm.0550.site en 200, nouvelle affiche, boutons et « Ambohidratrimo » présents.

---

## Lot K — Formulaires sans pièces jointes, commune et fokontany pour les personnes (28 octobre 2026)

### K1 — Associations : plus de pièces jointes

**Avant :** section 5 « Antontan-taratasy miaraka » pour joindre des
fichiers (statuts, récépissé, photos…).

**Après :** section supprimée (formulaire et récapitulatif). Tous les autres
champs sont inchangés. Le serveur ignore toute pièce jointe envoyée
(ancienne page restée ouverte, brouillon ancien). L'adresse d'envoi de
fichiers `/api/upload`, ouverte à tous et devenue inutile, est supprimée.
Les pièces des dossiers déjà déposés restent consultables dans l'admin.

**Fichiers :** `src/components/DepotWizard.tsx`, `src/lib/validation.ts`,
`src/app/api/upload/route.ts` (supprimé).

### K2 — Personnes : sans date de naissance ni CV, avec commune et fokontany

**Avant :** Anarana, Fanampin'anarana, Daty nahaterahana, Distrika… et
section 5 « CV ».

**Après :** date de naissance et CV supprimés ; ordre géographique
**Distrika → Kaominina → Fokontany**, avec les mêmes listes liées que pour
les associations (référentiel officiel, saisie libre « Hafa » possible).
Kaominina obligatoire, Fokontany facultatif (comme pour les associations).
Les autres champs sont inchangés.

**Base de données :** colonnes `commune`, `commune_pcode`, `fokontany`,
`fokontany_pcode` ajoutées à `dossiers_personnes`, `date_naissance` devient
facultative. Appliqué automatiquement au démarrage du site (aucune
manipulation manuelle) ; les anciens dossiers sont conservés tels quels.

**Administration :** liste des personnes avec colonnes Commune et Fokontany
(colonnes Âge et CV retirées) ; fiche avec Commune et Fokontany, date de
naissance et CV affichés seulement pour les anciens dossiers qui en ont ;
export CSV avec Commune, Code commune, Fokontany (Date de naissance et CV
gardés en fin de fichier pour les anciens dossiers). Recherche aussi par
commune et fokontany.

**Fichiers :** `src/app/deposer/olona/FormulairePersonne.tsx`,
`src/lib/personnes-modele.ts`, `src/lib/personnes.ts`, `src/lib/schema.ts`,
`src/app/admin/PersonnesVue.tsx`, `src/app/admin/olona/[reference]/page.tsx`,
`src/app/api/admin/export/route.ts`.

**Vérifié en local :** types ; formulaire personne (listes Distrika →
Kaominina → Fokontany, récapitulatif sans date ni CV) ; formulaire
association sans section pièces jointes ; refus serveur sans kaominina
(400, message malgache) ; `/api/upload` en 404. Enregistrement réel non
testable en local (pas de base PostgreSQL sur le PC) : à contrôler en ligne
après déploiement.

### K3 — Associations : section « Ny hevitrao »

| Avant | Après |
|---|---|
| Titre : Ny tetikasanao | Ny hevitrao |
| Sous-titre : Hazavao ny filanao na ny fangatahanao | Hazavao ny hevitrao momba ny fanabeazana ara-politika |
| Champ : Fanazavana momba ny tetikasanao, ny filanao na ny fangatahanao | Soraty eto ambany ny hevitrao |
| Texte d'exemple dans la zone de saisie | Aucun (zone vide) |
| Récapitulatif : Ny tetikasa | Ny hevitrao |

Message d'erreur si vide (formulaire et serveur) : « Soraty ny hevitrao
momba ny fanabeazana ara-politika. » Même champ en base (`description`),
rien ne change dans l'admin.

**Fichiers :** `src/components/DepotWizard.tsx`, `src/lib/validation.ts`.

**Vérifié en local :** section affichée avec les nouveaux textes, zone de
saisie vide.

### Mise en ligne du lot K

- [x] GO (28 octobre 2026), commit `62f59b1` et push sur `master`.
- [x] Contrôles en ligne (https://vfm105.com) : `/`, `/deposer`,
      `/deposer/olona` en 200 ; formulaire personne avec listes Distrika →
      Kaominina → Fokontany, sans date de naissance ni CV ; formulaire
      association avec « Ny hevitrao », sans pièces jointes ; `/api/upload`
      en 404 ; refus sans kaominina (personne) et sans avis (association)
      en 400 avec les nouveaux messages.
- [ ] Test en ligne : dépôt d'un dossier de personne test (commune,
      fokontany), consultation dans l'admin, puis suppression du dossier test.

---

## Lot L — Fisoratana anarana, VFM 105 et QR code Tafa & Dinika (28 octobre 2026)

Demandes : `modif X.md` et `modif Y.md`.

### L1 — Menu « Fisoratana anarana » (X1)

Le bouton « Dossier » du menu public devient « Fisoratana anarana » (même
destination : l'accueil). **Fichier :** `src/components/MenuPublic.tsx`.

### L2 — Formulaire des associations (X2)

| Élément | Avant | Après |
|---|---|---|
| Badge d'en-tête | Fametrahana Dosie | Fisoratana anarana |
| Texte d'introduction | Apetraho ny Dosie-nao eo amin'ny VFM… | Fenoina tsara ho mariky ny fisoratana anarana ho an'ny fikambanana misy anao. |
| Champ | Tompon'andraikitra (plusieurs possibles) | Anaran'izay hanatrika ny Tafa sy Dinika (un seul nom) |
| Bouton « Hanampy tompon'andraikitra » | présent | supprimé |
| Asan'ny fikambanana | 9 choix | + Fanabeazana, Fialamboly (avant « Hafa ») |
| Bouton de validation | Hamarino ny antontan-taratasiko | Tsindrio rehefa tsy misy adino na diso |

La phrase « Tsy maintsy fenoina ireo saha misy marika * » est conservée
après le nouveau texte. Le serveur ne garde qu'un seul nom si une ancienne
page en envoie plusieurs. **Fichiers :** `src/components/DepotWizard.tsx`,
`src/lib/validation.ts`.

### L3 — Formulaire des personnes (X3)

| Élément | Avant | Après |
|---|---|---|
| Badge d'en-tête | Fametrahana Dosie — Olona tsirairay | Fisoratana anarana (affiché en majuscules) |
| Texte d'introduction | Apetraho ny Dosie-nao manokana… | Fenoy tsara ho mariky ny fisoratanao anarana. |
| Section 3 | Ny tetikasanao manokana / Ny zavatra tianao ho tanterahina | Ny zavatra handrasanao amin'ny Tafa sy Dinika (sans sous-titre) |
| Champ | Tetikasa manokana, avec texte d'exemple | Soraty eto ambany, zone vide |

**Fichiers :** `src/app/deposer/olona/FormulairePersonne.tsx`,
`src/lib/personnes-modele.ts`, `src/components/DepotWizard.tsx` (sous-titre
de section facultatif).

### L4 — « VFM 105 » et « Radio VFM 105 » (Y1, Y2)

Tous les textes visibles du site : titres des pages et onglets, en-têtes
des formulaires, remerciements (« Misaotra anao ny VFM 105 … »), page
Birao, galerie, radio, menu Radio, administration, e-mails et SMS.
**Inchangés :** le logo et l'affiche (images « V.F.M »), les références des
dossiers (`VFM-2026-…`, `VFM-P-…`), et l'expéditeur réel des e-mails, fixé
par la variable `SMTP_FROM` dans Coolify.

**Reste à faire (Y2) :** renommer la station dans l'administration
AzuraCast (https://radio.0550.site) en « Radio VFM 105 ».

### L5 — QR code d'inscription Tafa & Dinika (Y3)

- **Code unique :** chaque dossier (association ou personne) reçoit un
  code secret de 32 caractères aléatoires (colonne `qr_jeton`, index
  unique), généré par la base, y compris pour les dossiers déjà déposés.
- **Contenu du QR code :** uniquement l'adresse
  `https://vfm105.com/admin/verifier/<code>` ; aucune donnée personnelle
  n'y est lisible.
- **Après l'inscription :** la page de remerciement affiche la carte
  « TAFA & DINIKA » (logo, thème, date et lieu, QR code, nom, prénom,
  association, téléphone, référence) et le bouton **« Télécharger mon QR
  code »** (image PNG 1080 × 1620, `QR-<référence>.png`). La carte n'apparaît
  qu'avec le code secret transmis à l'envoi du formulaire : une personne qui
  tape une autre référence ne voit ni nom ni téléphone.
- **Le jour de la conférence :** scanner le QR code ouvre la page de
  vérification, réservée aux administrateurs connectés (sinon : page de
  connexion, puis retour automatique). Bandeau vert « Inscription valide »
  avec nom, association, téléphone, district, commune, statut ; orange pour
  un inscrit d'un autre district (administrateur de district) ; rouge si le
  QR code est inconnu.
- **Administration :** la carte QR (avec téléchargement) figure aussi sur la
  fiche de chaque dossier, pour la renvoyer à un participant.

**Fichiers :** `src/components/CarteQr.tsx` (nouveau),
`src/app/admin/verifier/[jeton]/page.tsx` (nouveau),
`src/app/confirmation/[reference]/page.tsx`,
`src/app/confirmation/olona/[reference]/page.tsx`,
`src/app/admin/[reference]/page.tsx`, `src/app/admin/olona/[reference]/page.tsx`,
`src/lib/schema.ts`, `src/lib/repository.ts`, `src/lib/personnes.ts`,
`src/lib/types.ts`, `src/app/api/personnes/route.ts`,
`package.json` (bibliothèque `qrcode` 1.5.4).

**Vérifié en local :** types ; textes des deux formulaires, du menu et des
pages ; carte QR dessinée et téléchargeable (page d'essai temporaire,
supprimée) ; page de vérification redirigée vers la connexion sans
session. Dépôt réel et vérification d'un vrai QR code non testables en
local (pas de base PostgreSQL) : à contrôler en ligne.

### Mise en ligne du lot L

- [x] GO (28 octobre 2026), commit et push sur `master`.
- [ ] Contrôle en ligne : inscription test, carte QR affichée et
      téléchargée, scan du QR code avec un téléphone (administrateur
      connecté), puis suppression du dossier test.
- [ ] AzuraCast : station renommée « Radio VFM 105 ».

---

## Lot S — Maintenance et sécurité

### S1 — Mise à jour de sécurité de Next.js et sharp (9 octobre 2026)

**Constat :** l'audit des dépendances (`npm audit`) signalait des failles
présentes depuis la création du site :

| Composant | Rôle | Version | Gravité | Corrigé en |
|---|---|---|---|---|
| Next.js | Moteur du site | 16.3.5 | Critique | **16.3.8** |
| sharp | Redimensionnement des images | 0.35.4 | Élevée (CVE-2026-96889) | **0.35.5** |
| source-map-js | Outil interne de Next.js | 1.2.1 | Élevée | **1.2.2** |

**Choix :** version corrective 16.3.8 (et non 16.4.0) pour changer le
moins de choses possible. `eslint-config-next` aligné en 16.3.8.

**Résultat :** `npm audit --omit=dev` → **0 vulnérabilité** dans ce qui
tourne sur le serveur.

**Reste (sans risque pour le site) :** une faille « élevée » dans `braces`,
utilisé uniquement par l'outil de vérification du code ESLint sur le PC de
développement ; il n'est pas déployé et n'analyse que les fichiers du
projet. La seule correction proposée ramènerait ESLint à une version de
2024 incompatible : non appliquée, à revoir lors d'une future version de
`eslint-config-next`.

**Fichiers :** `package.json`, `package-lock.json` (la version Alpine de
sharp, nécessaire à l'image Docker, est toujours présente).

**Vérifié en local :** vérification des types, build de production
(Next.js 16.3.8), pages publiques, listes Commune/Fokontany, dépôt d'un
dossier, optimisation des images (logo et galerie), connexion admin et
les 6 onglets, carte, refus sans session (401).

### Mise en ligne du lot S

- [ ] GO, commit et push sur `master`.
- [ ] Vérifier le déploiement dans Coolify (*Deployments* → **Success**).
