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
| Dépôt en ligne | Fametrahana an-tserasera |
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

### Mise en ligne du lot A

- [ ] Commit et push sur `master` (déploiement automatique Coolify).
- [ ] Vérifier dans Coolify → *Deployments* que le déploiement est en
      **Success** (en cas d'échec `Could not resolve host`, voir
      `serveur.md` §4, difficulté n° 12).
- [ ] Test en ligne : dépôt d'un dossier avec un district autre
      qu'Ambohidratrimo, contrôle du message de remerciement, puis
      suppression de ce dossier depuis `/admin`.
