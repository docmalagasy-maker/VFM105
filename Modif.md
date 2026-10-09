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
- [ ] `SMTP_PASSWORD` et `SESSION_SECRET` : à saisir par le responsable
      (secrets), puis *Deploy*.
- [ ] Test : demande d'accès pour un district, réception de l'e-mail,
      validation, connexion de l'administrateur de district.
