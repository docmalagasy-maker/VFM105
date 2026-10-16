# Serveur VPS — guide de référence

Journal de la migration du site **VFM 105** de Vercel vers un VPS géré par
**Coolify** (8 octobre 2026), rédigé pour servir de modèle aux futurs projets
(sites web, applications web, services) hébergés sur ce serveur.

> **Aucun secret dans ce document.** Les mots de passe, secrets et adresses
> de connexion aux bases se trouvent uniquement dans Coolify (variables
> d'environnement) et dans les notes privées du responsable. Ne jamais les
> écrire dans un fichier du dépôt.

---

## 1. Inventaire de l'infrastructure

| Élément | Valeur |
|---|---|
| VPS | `vps125329.serveur-vps.net` |
| Adresse IP publique (IPv4) | `31.207.34.137` |
| Panneau Coolify (à utiliser) | **https://vps125329.serveur-vps.net** |
| Panneau Coolify (secours, non chiffré) | `http://vps125329.serveur-vps.net:8000` |
| Proxy (reverse proxy) | Traefik, géré par Coolify (ports 80/443, certificats Let's Encrypt automatiques) |
| Serveur Coolify | `localhost` (« This is the server where Coolify is running on. Don't delete this! ») |
| Projet Coolify | **MAIN SERVEUR**, environnement **production** |
| Source Git | GitHub App Coolify → dépôt `docmalagasy-maker/VFM105`, branche `master` |
| Registrar / DNS | **LWS** (lws.fr), serveurs DNS `ns17` à `ns20.lwsdns.com` |
| Domaine | `0550.site` |
| Messagerie du domaine | LWS : boîtes `noreply@0550.site` (envoi automatique du site) et `contact.vfm@0550.site` (contact public) |
| Serveur mail LWS | `mail77.lwspanel.com` (IMAP 993, POP3 995, SMTP 465 SSL / 587) |
| Ressources | 4 vCPU, 7,9 Go RAM, **swap 4 Go** (`/swapfile`, depuis le 16 octobre 2026), disque 148 Go |
| Services hébergés | **VFM** (site + Postgres, projet MAIN SERVEUR) ; **messagerie « Core CRYPTED »** (Supabase auto-hébergé, projet MAIN SERVEUR, https://messagerie.0550.site, dépôt `D:\MessagerieAssociation`, voir son `modifications.md` M24) ; **Radio VFM** (AzuraCast, projet Radio VFM, https://radio.0550.site) |

### Enregistrements DNS chez LWS (zone `0550.site`)

| Type | Nom | Valeur | Usage |
|---|---|---|---|
| A | `vfm` | `31.207.34.137` | Site VFM 105 → https://vfm.0550.site |
| A | `coolify` | `31.207.34.137` | Créé, finalement inutile (le panneau est déjà en HTTPS sur `vps125329.serveur-vps.net`). Peut être supprimé ou réutilisé. |
| A | `radio` | `31.207.34.137` | Radio VFM (AzuraCast) → https://radio.0550.site (15 octobre 2026) |
| A | `messagerie` | `31.207.34.137` | Messagerie Core CRYPTED (Supabase, Kong) → https://messagerie.0550.site |

`0550.site` lui-même (racine) pointe ailleurs (`216.198.79.1`) : ne pas y
toucher sans raison.

---

## 2. État final du projet VFM 105

| Ressource Coolify | Réglages retenus |
|---|---|
| **Application** `v-f-m105:master-…` | Build **Dockerfile** (`/Dockerfile`, base `/`), port exposé **3000**, domaine **https://vfm.0550.site**, redirection HTTP → HTTPS activée, déploiement automatique à chaque push sur `master` (webhook GitHub App) |
| **Volume persistant** | Nom `…-vfm105-uploads`, monté sur **`/app/data/uploads`** : pièces jointes (`dossiers/`) et photos envoyées depuis l'admin (`galerie/`) |
| **Base de données** `postgresql-database-…` | Image `postgres:18-alpine`, base `postgres`, utilisateur `postgres`, accès **privé** (réseau Docker interne uniquement), SSL désactivé, script d'initialisation `001_init.sql`. Migrations suivantes (`002` à `005`) appliquées automatiquement par l'application. Tables : `dossiers`, `reference_sequences`, `administrateurs`, `sondages`, `reponses_sondage` |
| **Sauvegardes** | Quotidiennes, `0 2 * * *` (02:00 UTC = 05:00 Madagascar), timeout 3600 s, stockées dans `/data/coolify/backups/databases/…` sur le VPS |

### Variables d'environnement de l'application

| Variable | Origine de la valeur | Remarque |
|---|---|---|
| `DATABASE_URL` | Copiée depuis la base Coolify → *General* → **Postgres URL (internal)** | Contient le mot de passe de la base |
| `SMS_GATEWAY_SECRET` | Nouveau secret aléatoire de 64 caractères hexadécimaux | Identique dans l'appli Android |
| `SMS_ACTIF` | *(non définie)* | Envoi de SMS désactivé depuis le 15 octobre 2026 ; `true` pour le réactiver |
| `ADMIN_USER` | `admin` | Super-administrateur (page `/admin/connexion`) |
| `ADMIN_PASSWORD` | Nouveau mot de passe aléatoire de 20 caractères | Super-administrateur |
| `SMTP_HOST` | `mail77.lwspanel.com` | Pas `mail.0550.site` : certificat refusé (difficulté n° 14) |
| `SMTP_PORT` | `465` | `587` possible (les deux ports sont ouverts depuis le VPS) |
| `SMTP_USER` | `noreply@0550.site` | |
| `SMTP_PASSWORD` | Mot de passe de la boîte LWS | Saisi par le responsable |
| `SMTP_FROM` | `VFM <noreply@0550.site>` | |
| `SESSION_SECRET` | *(non définie, facultative)* | Sans elle, la clé de session est dérivée de `ADMIN_PASSWORD` et `DATABASE_URL` ; la définir invalide les sessions en cours |
| `SUPER_ADMIN_EMAIL` | *(non définie)* | Par défaut `doc.malagasy@gmail.com` |
| `SITE_URL` | *(non définie)* | Par défaut `https://vfm.0550.site` |
| `UPLOAD_DIR` | *(non définie dans Coolify)* | Déjà fixée à `/app/data/uploads` par le `Dockerfile` |
| `DATABASE_SSL` | *(non définie)* | `true` uniquement pour une base externe exigeant SSL |

Toutes ces variables sont dans la section **Production** de la page
*Environment Variables* (et non dans *Preview deployments*).

Les secrets de Vercel n'ont pas pu être récupérés : les variables marquées
**Sensitive** sur Vercel ne sont plus jamais affichables. De nouveaux secrets
ont donc été générés.

### Passerelle SMS Android

- Adresse du site : `https://vfm.0550.site`
- Secret partagé : la valeur de `SMS_GATEWAY_SECRET`
- Vérification : le journal de l'appli ne doit afficher aucune
  « Erreur de sondage » ; le SMS du dossier de test `VFM-105-2026-0001`
  a bien été reçu.
- Depuis le 9 octobre 2026, le texte du SMS est en malgache et les
  références suivent le format `VFM-AAAA-NNNN` ; l'application Android
  n'a pas eu besoin d'être modifiée (le texte vient du serveur).
- **Depuis le 15 octobre 2026, l'envoi de SMS est désactivé** (remplacé par
  un e-mail de confirmation) : les routes de la passerelle répondent 503.
  Arrêter la passerelle dans l'application Android. Réactivation :
  `SMS_ACTIF=true` dans Coolify, *Deploy*, puis redémarrer la passerelle.

---

## 3. Chronologie de la migration

### Étape 0 — Analyse préalable

Points du code liés à Vercel identifiés avant toute action :

1. **Pièces jointes** stockées sur **Vercel Blob** (`@vercel/blob`), service
   qui n'existe pas hors de Vercel.
2. **Connexion Postgres** : SSL activé dès que l'URL ne contenait pas
   `localhost`, incompatible avec le Postgres interne de Coolify (sans SSL).
3. `vercel.json` devenu inutile.

### Étape 1 — Adaptation du code (commit `b955852`)

| Fichier | Modification |
|---|---|
| `src/lib/stockage.ts` (nouveau, remplace `src/lib/blob.ts`) | Pièces jointes écrites sur disque dans `UPLOAD_DIR`. Nom de fichier = UUID aléatoire + extension déduite du type MIME contrôlé (jamais le nom fourni par le visiteur). Refus de tout chemin sortant du dossier (anti *path traversal*). |
| `src/app/api/admin/pieces/[...pathname]/route.ts` | Lecture depuis le disque, `Content-Type` déduit de l'extension, en-tête `X-Content-Type-Options: nosniff`. Toujours protégée par l'authentification admin (`src/proxy.ts`). |
| `src/lib/db.ts` | SSL désactivé par défaut, activable par `DATABASE_SSL=true`. |
| `next.config.ts` | `output: "standalone"` (image Docker légère). |
| `Dockerfile` (nouveau) | Build multi-étapes Node 22 Alpine, exécution en utilisateur `node`, port 3000. |
| `.dockerignore` (nouveau) | Exclut `node_modules`, `.next`, `.git`, `.env*`, `data`, `android-sms-gateway`, `LOCALSEND`, `.claude`. |
| `.env.example`, `.gitignore` | Nouvelles variables ; `/data/` ignoré. |
| `package.json` | Dépendance `@vercel/blob` retirée. |
| `vercel.json` | Supprimé. |

Vérifications locales avant le push :

```bash
npm run build
npx tsc --noEmit
# serveur de production local sur un port de test
cd .next/standalone && PORT=3999 UPLOAD_DIR=./data/test-uploads ADMIN_USER=t ADMIN_PASSWORD=t node server.js
```

Tests effectués contre ce serveur local : envoi d'un PDF (OK), lecture sans
identifiants (401), lecture avec identifiants (OK), tentative de
*path traversal* (404), fichier `.exe` refusé.

### Étape 2 — Base PostgreSQL dans Coolify

1. Projet **MAIN SERVEUR** → **+ New Resource** → **PostgreSQL** →
   **PostgreSQL 18**.
2. **Avant le premier démarrage** : section *Initialization scripts* →
   **+ Add** → nom `001_init.sql`, contenu = `migrations/001_init.sql`.
   Les scripts d'initialisation ne s'exécutent qu'au **tout premier**
   démarrage (base vide).
3. **Start**.
4. Vérification : *Runtime Logs* → rechercher `initdb.d`, on doit voir
   `running /docker-entrypoint-initdb.d/001_init.sql`, puis rechercher
   `ERROR` : aucun résultat.

### Étape 3 — Application

L'application existait déjà (créée via la GitHub App) mais en build
**Railpack**.

1. *General* → *Build strategy* : **Dockerfile** (emplacement `/Dockerfile`,
   port 3000) → **Save changes**.
2. *Persistent Storage* → **Add Mount** → **Volume mount** → nom
   `vfm105-uploads`, destination `/app/data/uploads` → **Add Volume**.
3. *Environment Variables* → **+ Add** pour chaque variable (voir §2).
   Secrets générés sans les afficher (voir §5).
4. **Deploy** (≈ 2 min). Vérifications :

```bash
U=https://vfm.0550.site
curl -s -o /dev/null -w '%{http_code}\n' $U/                         # 200
curl -s -o /dev/null -w '%{http_code}\n' $U/admin                    # 401 (protégé)
curl -s -o /dev/null -w '%{http_code}\n' $U/api/sms-gateway/pending  # 401 (protégé)
```

### Étape 4 — Passage en HTTPS (adresse provisoire)

Coolify fournit d'abord une adresse `http://<id>.31.207.34.137.sslip.io`.
Le bouton « Valider définitivement mon dossier » ne réagissait pas : voir
difficulté n° 3 (§4). *Domains* → réglages du domaine → *Protocol* :
**https** → **Save** → **Deploy**. Certificat Let's Encrypt obtenu en
environ 30 s.

### Étape 5 — Test de bout en bout

Dossier de test déposé depuis le formulaire public → référence
`VFM-105-2026-0001`, visible dans `/admin`, pièce jointe consultable,
statut SMS « À envoyer ».

### Étape 6 — Passerelle Android

Dans l'appli : **Arrêter la passerelle** → nouvelle adresse → nouveau
secret → **Démarrer la passerelle** → SMS reçu en quelques secondes.

### Étape 7 — Domaine définitif

1. LWS → *Espace client* → *Mes domaines* → `0550.site` → *Gérer* →
   **Zone DNS** → ajouter `A  vfm  31.207.34.137`.
2. Vérifier la propagation (voir §6, `dns.google`).
3. Coolify → *Domains* → **Add Domain** → `https` + `vfm.0550.site` →
   **Save**.
4. Coolify a ajouté de lui-même `www.vfm.0550.site` : supprimé (aucun
   enregistrement DNS correspondant).
5. **Deploy** → certificat obtenu en environ 1 min.
6. Appli Android basculée sur `https://vfm.0550.site`.
7. Adresse provisoire `sslip.io` supprimée → **Deploy**.

### Étape 8 — Documentation (commit `cc58e5d`)

- `README.md` : procédure de mise en ligne via Coolify.
- Appli Android : adresse par défaut `https://vfm.0550.site`
  (`Prefs.kt`, `activity_main.xml`). Ne concerne que les nouvelles
  installations, et nécessite de recompiler l'APK.

### Étape 9 — Sauvegardes et accès au panneau

- Base → *Backups* → **+ Add** → fréquence `0 2 * * *` → **Add Schedule** →
  **Back Up Now** : premier test réussi (fichier `.dmp` créé).
- Le panneau répond déjà en HTTPS sur `https://vps125329.serveur-vps.net`,
  il n'y avait rien à configurer.

### Étape 10 — Refonte du design et panne DNS du VPS (9 octobre 2026, commit `9e26ecb`)

- Nouveau design public (fond beige, logo agrandi, formulaire en blocs
  numérotés) et nouveau champ **District** obligatoire (120 districts
  groupés par région).
- Nouvelle colonne `association_district` : `migrations/002_district.sql`,
  également appliquée automatiquement par l'application au premier dépôt
  (aucune action manuelle sur la base).
- Le déploiement automatique a échoué : `Could not resolve host:
  github.com` (voir difficulté n° 12, §4). Après correction du DNS du VPS,
  **Deploy** manuel → succès.

### Étape 11 — Évolutions fonctionnelles (9 octobre 2026)

Détail complet dans `Modif.md`. Effets sur le serveur :

- lots A à C (commits `c3422fd`, `3e51454`) : site national en malgache,
  galerie photos (dossier `GALERIE` copié dans l'image Docker, envois admin
  dans le volume), statistiques et exports ;
- lot D (commit `19daf68`) : page de connexion admin à la place de la
  fenêtre du navigateur, comptes d'administrateurs de district, carte,
  listes District > Commune > Fokontany. Migration `003_admins_geo.sql`
  appliquée automatiquement au démarrage.

### Étape 12 — Envoi d'e-mails par la boîte LWS (9 octobre 2026)

1. Boîte `noreply@0550.site` créée chez LWS par le responsable.
2. Serveur SMTP identifié : `mail77.lwspanel.com` (difficulté n° 14).
3. Test depuis le VPS : ports 465 et 587 ouverts (commande §6).
4. Variables `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_FROM` ajoutées
   dans Coolify ; `SMTP_PASSWORD` saisi par le responsable.
5. **Deploy**, puis vérification de la présence des variables dans le
   conteneur (commande §6) : e-mail de demande d'accès bien reçu sur
   doc.malagasy@gmail.com.

### Étape 13 — Mise à jour de sécurité (15 octobre 2026, commit `407aa0f`)

Next.js 16.3.5 → **16.3.8** (faille critique) et sharp 0.35.4 →
**0.35.5** (faille élevée) : `npm audit --omit=dev` → 0 vulnérabilité.
Même commit : 114 communes du projet ONN Board ajoutées aux listes du
formulaire.

### Étape 14 — Radio VFM (AzuraCast) sur le même VPS (15 octobre 2026)

- Projet Coolify distinct **Radio VFM**, service Docker Compose `azuracast`
  (image `ghcr.io/azuracast/azuracast:stable`). Fichier et procédure :
  `D:\PROJETS\RADIO NM\coolify\` (`docker-compose.yml`, `DEPLOIEMENT.md`).
- Aucun port publié : Traefik → `https://radio.0550.site` → port 80 interne ;
  flux par `/listen/...`. Ports 8000/8080 du VPS inchangés.
- Coolify affiche « This service requires port 80 » à l'enregistrement du
  domaine : choisir **Use This Port Anyway** (le port saisi est bien 80) ;
  « Keep Required Port » annule l'enregistrement.
- Relevé avant installation : 7,8 Go RAM (3,9 Go libres, pas de swap),
  4 vCPU, 123 Go libres. VFM resté en 200 pendant tout le déploiement.

### Étape 15 — Mémoire de secours (swap) de 4 Go (16 octobre 2026)

**Relevé avant** (terminal Coolify, lecture seule) : 7,9 Go de RAM, 4,7 Go
utilisés, **3,2 Go disponibles**, **aucun swap** ; disque 148 Go, 22 Go
utilisés (120 Go libres) ; Docker : images 18,9 Go, volumes 466 Mo, cache de
build 2,2 Go (1,7 Go récupérables). Principaux consommateurs : messagerie
Supabase ≈ 1,9 Go (plusieurs conteneurs `supabase-…`, `realtime-dev`,
`imgproxy`), AzuraCast ≈ 630 Mo, Coolify ≈ 640 Mo, VFM ≈ 100 Mo.

**Commande** (collée par le responsable dans Terminal → localhost) :

```bash
fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile && echo '/swapfile none swap sw 0 0' >> /etc/fstab && sysctl -w vm.swappiness=10 && echo 'vm.swappiness=10' > /etc/sysctl.d/99-swap.conf && swapon --show && free -m
```

- Fichier `/swapfile` de 4 Go, droits 600, déclaré dans `/etc/fstab` (gardé
  après redémarrage) ;
- `vm.swappiness=10` (`/etc/sysctl.d/99-swap.conf`) : la RAM reste utilisée
  en priorité, le swap ne sert qu'en cas de pic ;
- résultat : `Échange: 4095 Mo`, 0 utilisé ; aucune coupure ; VFM, radio et
  messagerie vérifiés juste après (200 / 200 / 401 attendu).

Annuler si besoin : `swapoff /swapfile`, retirer la ligne de `/etc/fstab`,
supprimer `/swapfile` et `/etc/sysctl.d/99-swap.conf`.

Le swap évite un plantage lors d'un pic de mémoire, mais il est beaucoup plus
lent que la RAM : il ne permet **pas** d'ajouter un service lourd (par
exemple un modèle d'IA local de 4 Go).

---

## 4. Difficultés rencontrées et solutions

| # | Problème | Cause | Solution |
|---|---|---|---|
| 1 | Pièces jointes impossibles hors Vercel | Dépendance à Vercel Blob | Stockage disque + volume persistant Coolify |
| 2 | Connexion Postgres refusée (prévu) | SSL forcé dans `db.ts` | SSL désactivé par défaut, option `DATABASE_SSL` |
| 3 | **Bouton « Valider » sans effet, aucun message** | `crypto.randomUUID()` n'existe que dans un *contexte sécurisé* (HTTPS ou localhost). Sur une page HTTP, l'appel échoue en silence. | Servir le site en **HTTPS**. Règle générale : **ne jamais tester un site en HTTP**. |
| 4 | Brouillon du formulaire perdu après le passage en HTTPS | `localStorage` est lié à l'origine (`http://` ≠ `https://`) | Normal : re-saisir le formulaire |
| 5 | Secrets Vercel illisibles (« Copy to clipboard » grisé) | Variables Vercel de type *Sensitive* | Générer de nouveaux secrets et reconfigurer les deux côtés |
| 6 | Fenêtre de connexion `/admin` qui revient sans cesse | Mot de passe mal collé (espace ou caractère en trop) | Copier uniquement la valeur, sans texte autour |
| 7 | Certains boutons de Coolify ne réagissaient pas | Service temps réel de Coolify injoignable (WebSocket `wss://…:6001` en échec, panneau utilisé en `http://…:8000`) | Utiliser le panneau en **HTTPS** (`https://vps125329.serveur-vps.net`) ; recharger la page après chaque enregistrement pour vérifier |
| 8 | Domaine `www.` ajouté automatiquement | Comportement par défaut de Coolify | Supprimer l'entrée `www` si aucun DNS n'existe (sinon risque d'échec du certificat) |
| 9 | « DNS mismatch » affiché par Coolify alors que le DNS est correct | Cache ou résolveur de Coolify | Vérifier soi-même via `dns.google` ; le certificat s'obtient quand même |
| 10 | Requêtes DNS classiques (`nslookup … 8.8.8.8`) en échec depuis le PC | Réseau local qui bloque le DNS externe | Utiliser le DNS par HTTPS (`curl https://dns.google/resolve?...`) |
| 11 | Fichiers sensibles dans le dossier du dépôt (`secretssms.txt`, capture d'écran montrant le secret) | Créés pendant la configuration | Ajoutés à `.git/info/exclude` (exclusion locale, non publiée). Mieux : les ranger hors du dossier du projet. |
| 12 | **Déploiement en échec en quelques secondes** : `Could not resolve host: github.com` (le site reste sur l'ancienne version, *Deploy* manuel échoue aussi) | **Aucun serveur DNS configuré sur le VPS** : `resolvectl status` ne liste aucun « DNS Servers » sur `eth0`, `getent hosts github.com` ne renvoie rien, alors que `ping 1.1.1.1` répond | Déclarer des DNS publics dans `systemd-resolved` (voir §7.0), puis relancer **Deploy**. Correction permanente, sans coupure du site. |
| 13 | **E-mail non reçu** après une demande d'accès administrateur | `SMTP_PASSWORD` absent du conteneur : variable non encore ajoutée, ou ajoutée **après** le dernier déploiement | Ajouter la variable dans la section Production, puis **Deploy** ; vérifier sa présence dans le conteneur (§6). Refaire une demande : l'e-mail n'est envoyé qu'à la création d'une demande |
| 14 | Connexion SSL refusée vers `mail.0550.site` | Le serveur mail LWS présente un certificat au nom de `*.lwspanel.com` | Utiliser le nom réel du serveur : **`mail77.lwspanel.com`** (indiqué aussi dans LWS → *Paramètres de configuration mail*) |
| 15 | Terminal Coolify : la commande tapée ne fait rien | La page affiche encore « Finding available servers and containers… » | Attendre l'invite `root@vps125329:~#` avant de taper |
| 16 | Aucune demande d'accès en base alors qu'un test a été fait | Demande supprimée depuis l'onglet Administrateurs (la suppression l'efface), ou formulaire refusé (mot de passe < 10 caractères, identifiant avec espaces ou accents) | Refaire la demande et vérifier le message vert de confirmation |

---

## 5. Gestion des secrets (méthode retenue)

Principe : **le secret ne doit apparaître ni à l'écran, ni dans le chat, ni
dans un fichier du dépôt**.

Générer un secret directement dans le presse-papiers Windows (PowerShell),
sans l'afficher :

```powershell
# Secret de 64 caractères hexadécimaux (ex. SMS_GATEWAY_SECRET)
$b = New-Object byte[] 32; [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); Set-Clipboard -Value (($b | ForEach-Object { $_.ToString("x2") }) -join "")
```

```powershell
# Mot de passe de 20 caractères sans caractères ambigus (ex. ADMIN_PASSWORD)
$c = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"; $b = New-Object byte[] 20; [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); Set-Clipboard -Value (-join ($b | ForEach-Object { $c[$_ % $c.Length] }))
```

Ensuite :

1. Coller (Ctrl + V) dans une note privée, **hors du dossier du projet**.
2. Coller dans Coolify → *Environment Variables* → champ **Value**.
3. Vider le presse-papiers : `Set-Clipboard -Value " "`.

Pour transférer un secret vers le téléphone : envoyer la note avec
**LocalSend**, puis copier-coller dans l'appli. Masquer le champ (icône œil)
avant toute capture d'écran.

Éviter les caractères `$` dans les valeurs : l'option *Interpolate
$VARIABLES* de Coolify les interpréterait.

---

## 6. Commandes de vérification utiles

```bash
# Le DNS pointe-t-il vers le VPS ?
curl -s "https://dns.google/resolve?name=vfm.0550.site&type=A"

# Code HTTP + validité du certificat (verify=0 → certificat valide)
curl -s -o /dev/null -w '%{http_code} verify=%{ssl_verify_result}\n' https://vfm.0550.site/

# Redirection HTTP → HTTPS
curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}\n' http://vfm.0550.site/

# Envoi d'une pièce jointe de test
printf '%%PDF-1.4 test' > t.pdf
curl -s -F "fichier=@t.pdf;type=application/pdf" https://vfm.0550.site/api/upload

# Sur le VPS (Coolify → Terminal → serveur localhost, ou SSH root@31.207.34.137) :
# le VPS résout-il les noms de domaine ? (doit afficher une adresse IP)
getent hosts github.com
# serveurs DNS utilisés (nslookup n'est pas installé sur le VPS)
resolvectl status

# Le VPS peut-il joindre le serveur mail LWS ? (OUVERT attendu)
for p in 465 587; do timeout 5 bash -c "</dev/tcp/mail77.lwspanel.com/$p" && echo "PORT $p OUVERT" || echo "PORT $p BLOQUE"; done

# Variables présentes dans le conteneur du site (affiche present/ABSENT, jamais la valeur)
C=$(docker ps -q -f name=if8wkxm2gpev7ht75gsehdml | head -1)
docker exec $C sh -c 'for v in SMTP_HOST SMTP_PORT SMTP_USER SMTP_PASSWORD SMTP_FROM SESSION_SECRET; do eval x=\$$v; [ -n "$x" ] && echo "$v present" || echo "$v ABSENT"; done'

# Journal du site (erreurs d'envoi d'e-mail, etc.)
docker logs --since 2h $C 2>&1 | grep -iE 'mail|smtp|error' | tail -20

# Demandes d'administrateurs en base (sans les mots de passe)
D=$(docker ps --format '{{.Names}} {{.Image}}' | grep 'postgres:18' | cut -d' ' -f1 | head -1)
docker exec $D psql -U postgres -d postgres -c "select id, district, identifiant, statut, cree_le from administrateurs order by id"

# Attendre qu'un site réponde après un déploiement
for i in $(seq 1 30); do [ "$(curl -s -o /dev/null -w '%{http_code}' https://vfm.0550.site/)" = 200 ] && break; sleep 10; done
```

---

## 7. Procédure type pour un nouveau projet sur ce VPS

### 7.0 Vérifier le DNS du VPS (déjà fait sur ce VPS, à refaire sur un nouveau)

Sans DNS, Coolify ne peut ni récupérer le code sur GitHub ni télécharger
d'images Docker. Dans le terminal du VPS :

```bash
getent hosts github.com   # doit afficher une adresse IP
```

Si rien ne s'affiche (difficulté n° 12, §4) :

```bash
mkdir -p /etc/systemd/resolved.conf.d && printf '[Resolve]\nDNS=1.1.1.1 8.8.8.8\nFallbackDNS=9.9.9.9 1.0.0.1\n' > /etc/systemd/resolved.conf.d/dns.conf
systemctl restart systemd-resolved
getent hosts github.com   # vérification
```

### 7.1 Préparer le code

- [ ] Supprimer toute dépendance propre à un hébergeur (Vercel Blob, KV,
      Edge Config, `vercel.json`, etc.).
- [ ] Fichiers envoyés par les utilisateurs → disque, dans un dossier
      configurable (`UPLOAD_DIR`) qui deviendra un volume persistant.
- [ ] Base de données : SSL configurable, désactivé pour une base interne
      Coolify.
- [ ] Ajouter un `Dockerfile` (plus prévisible que Railpack/Nixpacks) et un
      `.dockerignore`.
- [ ] Next.js : `output: "standalone"` dans `next.config.ts`.
- [ ] Tester le build de production en local avant de pousser.

Modèle de `Dockerfile` pour Next.js (celui de VFM 105) :

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    UPLOAD_DIR=/app/data/uploads
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
RUN mkdir -p /app/data/uploads && chown -R node:node /app/data
USER node
EXPOSE 3000
CMD ["node", "server.js"]
```

### 7.2 Dans Coolify (ordre recommandé)

1. **Base de données d'abord** : *+ New Resource* → PostgreSQL (version
   la plus récente) → ajouter le schéma SQL dans *Initialization scripts*
   **avant** le premier *Start* → *Start* → vérifier les logs.
2. **Application** : *+ New Resource* → *Git Repository (with GitHub App)*
   → dépôt + branche → *Build strategy* **Dockerfile** → port exposé.
3. **Volume persistant** pour tout dossier qui doit survivre aux
   redéploiements.
4. **Variables d'environnement** (adresse interne de la base, secrets).
5. **Domaine en `https://` dès le départ.**
6. **Deploy**, puis tests `curl` (§6) et test réel dans le navigateur.
7. **Sauvegardes** de la base : *Backups* → *+ Add* → `0 2 * * *` →
   *Back Up Now* pour tester.

### 7.3 Domaine (LWS)

1. Zone DNS → `A  <sous-domaine>  31.207.34.137`.
2. Vérifier avec `dns.google` (souvent en quelques minutes).
3. Coolify → *Domains* → *Add Domain* (`https`) → supprimer l'entrée
   `www.` ajoutée automatiquement si elle n'a pas de DNS → *Deploy*.

### 7.4 Mise à jour d'un site existant

GitHub Desktop → *Commit to master* → *Push origin* → Coolify reconstruit
automatiquement (2 à 3 min, suivi dans *Deployments*). Le site est
brièvement indisponible pendant le remplacement du conteneur.

---

## 8. Astuces d'utilisation de Coolify

- Après chaque **Save**, **recharger la page** pour vérifier que la valeur
  est bien enregistrée.
- Une modification de domaine ou de variable ne prend effet qu'après un
  **Deploy** (ou *Restart*).
- Le bandeau « You have changes that haven't been saved yet » peut
  s'afficher sans modification réelle : ne pas s'y fier.
- Les champs secrets (*Postgres URL (internal)*, valeurs des variables)
  sont masqués : utiliser l'icône **copier** sans révéler la valeur.
- Les rappels « Love Coolify? » et « No notifications enabled » peuvent
  masquer des boutons : les fermer.
- Le *Terminal* intégré dépend du service temps réel : à utiliser depuis le
  panneau en HTTPS. Menu de gauche **Terminal** → **localhost** = le VPS
  lui-même (ne pas confondre avec le Terminal de l'application, qui ouvre
  l'intérieur du conteneur du site).
- Page des variables de l'application : Projects → **MAIN SERVEUR** →
  **production** → application **v-f-m105:master-…** → *Environment
  Variables*. Bouton violet **+ Add** → nom, valeur → **Add variable**.
  Ajouter dans la section du haut (Production), pas sous *Preview
  deployments*.
- Si une valeur contient `$`, désactiver *Interpolate $VARIABLES* dans le
  formulaire de la variable.
- Une variable ajoutée n'est visible par le site qu'après **Deploy**.

---

## 9. Points restants / à faire plus tard

- [ ] **Supprimer le projet Vercel** (*Settings → General → Delete
      Project*), ainsi que son *Storage* (Postgres/Blob) s'il existe.
- [ ] **Fermer le port 8000** (accès non chiffré au panneau) une fois
      l'accès HTTPS bien adopté (pare-feu du VPS).
- [ ] **Sauvegardes hors serveur** : configurer une destination S3 dans
      Coolify pour copier les sauvegardes ailleurs que sur le VPS.
- [ ] **Durée de conservation** des sauvegardes à définir.
- [ ] **Notifications Coolify** (e-mail) pour être alerté d'un échec de
      déploiement ou de sauvegarde (l'échec du 9 octobre, difficulté
      n° 12, est passé inaperçu faute d'alerte).
- [ ] Recompiler l'APK Android pour les futures installations (adresse par
      défaut mise à jour).
- [ ] Supprimer le dossier de test `VFM-105-2026-0001` (bouton Supprimer de
      `/admin`) avant la vraie mise en service, et décider si la numérotation
      doit repartir de 0001 (table `reference_sequences`).
- [ ] Erreur de lint préexistante dans `src/components/DepotWizard.tsx:93`
      (`react-hooks/set-state-in-effect`), sans effet sur le build.
- [ ] `SESSION_SECRET` (facultatif) : à ajouter si souhaité (déconnecte les
      sessions en cours).
- [ ] Vérifier que la boîte `contact.vfm@0550.site` (affichée sur le site)
      existe chez LWS.
- [ ] Faille « élevée » dans `braces` (outil ESLint, poste de développement
      uniquement, non déployé) : à revoir à la prochaine version de
      `eslint-config-next`.
- [x] `secretssms.md` rangé hors du dépôt, dans `D:\PROJETS\_PRIVE-VFM105\`
      (15 octobre 2026) ; nom ajouté à `.git/info/exclude` par sécurité.
- [x] Renforcer l'authentification `/admin` : page de connexion, mots de
      passe chiffrés, administrateurs de district (lot D, 9 octobre 2026).
- [x] Dossier de test avec district déposé en ligne (9 octobre 2026).
- [x] Envoi d'e-mails configuré et testé (9 octobre 2026).