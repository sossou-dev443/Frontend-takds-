# TaskD — Module d’authentification

Module d’authentification de TaskD : inscription et connexion des
**délégués** et **collaborateurs**, intégré à l’API identity-service
(contrat TaskD v0.2).

Le rendu reprend la maquette fournie (variables CSS, breakpoints 1050 / 760 /
420 px, mise en page à deux colonnes, textes et illustrations).

## Stack

- Next.js 16 (App Router) + TypeScript
- React 19
- CSS global (`src/app/globals.css`)
- API identity-service via `fetch` avec `credentials: "include"`

## Démarrage rapide

Prérequis : Node.js 20 ou plus récent et npm.

```bash
npm install
```

Créer le fichier d’environnement local :

```powershell
Copy-Item .env.example .env.local
```

Puis lancer le serveur de développement :

```bash
npm run dev
```

Ouvrir :

- http://localhost:3000/login
- http://localhost:3000/register

### Sans mode développement (mémoire limitée)

Si `npm run dev` échoue avec `ERR_MEMORY_ALLOCATION_FAILED`, utiliser le build
de production :

```bash
npm run build
npm start
```

Sous Windows, le script `start.ps1` fait les trois étapes automatiquement
(installation si nécessaire, build si nécessaire, puis démarrage) :

```powershell
.\start.ps1
```

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement (webpack) |
| `npm run dev:turbo` | Serveur de développement avec Turbopack |
| `npm run build` | Vérification TypeScript puis build de production |
| `npm run typecheck` | Vérification TypeScript seule |
| `npm run lint` | ESLint |
| `npm start` | Démarre le build de production |

## Routes

| Route | Rôle |
|---|---|
| `/` | Redirige vers `/login` |
| `/login` | Connexion |
| `/register` | Inscription |
| `/connexion` | Ancienne route, redirige vers `/login` |
| `/inscription` | Ancienne route, redirige vers `/register` |
| `/dashboard` | Destination collaborateur avec profil complété |
| `/dashboard/profile` | Complétion du profil collaborateur |
| `/offers` | Destination délégué |

## Fonctionnement de l’authentification

### Inscription

Le rôle est lu depuis le paramètre de requête :

```text
/register?role=delegator
/register?role=collaborator
```

Sans rôle valide, un sélecteur de rôle est affiché. Le rôle `admin` n’est
jamais proposé ni envoyé.

Payload envoyé à `POST /api/v1/auth/register` :

```json
{
  "lastName": "…",
  "firstNames": "…",
  "phone": "+229…",
  "email": "…",
  "profession": "…",
  "password": "…",
  "role": "delegator",
  "acceptTerms": true
}
```

Après succès :

- collaborateur → `/dashboard/profile`
- délégué → `/offers`

### Connexion

Payload envoyé à `POST /api/v1/auth/login` :

```json
{ "identifier": "email@exemple.com", "password": "…" }
```

Le bouton reste désactivé tant que les deux champs ne sont pas remplis.
Après succès, la destination dépend du rôle renvoyé par l’API et de l’état du
profil. Le paramètre `next` n’est accepté que s’il s’agit d’un chemin relatif
interne commençant par un seul `/`.

### Validation

- noms : 2 à 100 caractères ;
- téléphone : format E.164 (`^\+[1-9]\d{7,14}$`) ;
- email : 254 caractères maximum, normalisé en minuscules ;
- mot de passe : 8 à 128 caractères, au moins une lettre et un chiffre ;
- conditions générales : obligatoires.

Les messages sont en français. Les erreurs RFC 9457 sont interprétées par le
slug de `type` et par `errors[].field` (400, 401, 409, 415, 500, erreur
réseau).

Le mot de passe est masqué par défaut, peut être affiché via l’œil, puis est
effacé après succès. Il n’est jamais journalisé ni persisté.

## Intégration identity-service (contrat API TaskD v0.2)

### Configuration

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

L’adresse du backend est provisoire et doit être confirmée avec le développeur
backend. Les appels sont faits directement depuis le navigateur avec
`credentials: "include"` ; aucun proxy Next.js ni Server Action ne relaie le
cookie.

### Routes utilisées

| Méthode | Route | Usage |
|---|---|---|
| POST | `/api/v1/auth/register` | Inscription |
| POST | `/api/v1/auth/login` | Connexion |
| GET | `/api/v1/auth/me` | Vérification de la session |
| POST | `/api/v1/auth/logout` | Déconnexion (204, sans corps JSON) |

### Cookie et CORS

Le cookie `taskd_session` est `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`,
`Max-Age=604800`. Il n’est jamais lu ni stocké en JavaScript.

Pour que l’intégration fonctionne, le backend doit :

- autoriser précisément l’origine du frontend (par exemple
  `http://localhost:3000`) ;
- envoyer `Access-Control-Allow-Credentials: true` ;
- ne jamais utiliser `Access-Control-Allow-Origin: *` avec les credentials ;
- rester sur le même site que le frontend pour `SameSite=Lax` (`localhost`
  avec des ports différents reste same-site).

### État de l’intégration

Le backend `http://localhost:3001` n’était pas joignable pendant le
développement (timeout sur `GET /api/v1/auth/me`). Le rendu, les validations,
les redirections et le build ont été testés localement ; les échanges réels
d’authentification restent à valider dès que identity-service est disponible.

## Notes sur le build et le développement

Le build utilise webpack (`next build --webpack`) avec un seul worker de
génération statique (`experimental.cpus: 1`), la compilation webpack dans le
processus principal (`webpackBuildWorker: false`) et les optimisations mémoire
de webpack (`webpackMemoryOptimizations: true`), car l’environnement de build
dispose de peu de mémoire.

La vérification TypeScript est lancée séparément par `npm run build`
(`tsc --noEmit`) avant Next.js. Le worker de vérification intégré à Next.js
manquait de mémoire ; `typescript.ignoreBuildErrors` évite donc cette double
vérification. `npm run typecheck` permet de la relancer seule.

Pour la même raison, `npm run dev` utilise webpack (`next dev --webpack`) par
défaut. Sur une machine plus confortable, `npm run dev:turbo` permet d’utiliser
Turbopack. Les options mémoire peuvent alors être retirées et `next build`
(Turbopack) utilisé.

Si `npm run dev` échoue malgré tout avec `ERR_MEMORY_ALLOCATION_FAILED`,
libérer de la mémoire (fermer les applications lourdes) ou activer un fichier
d’échange Windows. À défaut, utiliser `npm run build` puis `npm start`, ou
`.\start.ps1`.

## Structure

```text
src/
  app/                  routes App Router
  components/auth/      composants du module d’authentification
  lib/                  client API, authentification, validation
  types/                types TypeScript
public/images/          illustrations de la maquette
```
