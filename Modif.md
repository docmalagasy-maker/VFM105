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
