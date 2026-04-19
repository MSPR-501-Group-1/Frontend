# Lighthouse Accessibility Runbook

Version: 2.2
Scope: HealthAI Admin - audits Lighthouse accessibilite

Ce document est un guide pas a pas pour executer les audits Lighthouse, meme si vous decouvrez le projet.
L objectif est de vous permettre de passer d un clone neuf du repo a un rapport exploitable, sans supposer de connaissance interne.

## Sommaire

1. [Objectif](#1-objectif)
2. [Vue d ensemble (comment ca marche)](#2-vue-densemble-comment-ca-marche)
3. [Pre-requis](#3-pre-requis)
4. [Demarrage depuis un clone neuf](#4-demarrage-depuis-un-clone-neuf)
5. [Choisir votre strategie d audit](#5-choisir-votre-strategie-daudit)
6. [Commandes standards npm](#6-commandes-standards-npm)
7. [Procedure recommandee (A a E)](#7-procedure-recommandee-a-a-e)
8. [Arguments CLI et variables d environnement](#8-arguments-cli-et-variables-denvironnement)
9. [Lire les resultats](#9-lire-les-resultats)
10. [Depannage rapide](#10-depannage-rapide)
11. [Regles de securite](#11-regles-de-securite)
12. [Checklist avant PR](#12-checklist-avant-pr)

## 1. Objectif

Produire des rapports Lighthouse accessibilite reproductibles sur les routes publiques et protegees de l application.

Le runbook couvre:

- execution des audits
- choix du mode d authentification
- interpretation des sorties

Le runbook ne couvre pas:

- benchmark performance detaille
- strategie de deploiement production

## 2. Vue d ensemble (comment ca marche)

Pipeline simplifie:

1. Le runner lit les routes a auditer dans `scripts/lighthouse-routes.json`.
2. Il prepare un contexte UI (theme, high contrast).
3. Pour les routes protegees, il prepare un contexte auth (mode none/token/real-login/auto).
4. Il ouvre une page bootstrap locale qui injecte l etat attendu dans le store persiste.
5. Lighthouse audite la route ciblee et produit un JSON par route.
6. Le script genere `summary.json`, `summary.md` et met a jour `latest.json`.

## 3. Pre-requis

### Outils

- Docker + Docker Compose
- Node.js 22.12+
- npm

### Emplacement des commandes

- commandes Docker: racine projet
- commandes Lighthouse: `frontend/healthai-admin`

## 4. Demarrage depuis un clone neuf

### Etape 1 - Monter les services

Depuis la racine projet:

```powershell
docker compose -f docker-compose.yml up -d --build frontend backend
docker compose -f docker-compose.yml ps
```

Attendu: `frontend`, `backend` et `db` en statut `Up`/`healthy`.

### Etape 2 - Installer les dependances frontend

```powershell
Set-Location frontend/healthai-admin
npm ci
```

### Etape 3 - Verifier la configuration avec un dry-run

```powershell
npm run audit:a11y:normal:dry
```

Si le dry-run passe, la configuration est exploitable.

## 5. Choisir votre strategie d audit

Vous avez 4 modes d authentification:

- `none`: pas d auth (routes publiques)
- `token`: JWT deja disponible
- `real-login`: login backend email/password
- `auto`: essaye `token`, sinon `real-login`, sinon `none`

Recommandation pratique:

- audit global projet: `real-login`
- audit route publique uniquement: `none`
- CI securisee avec secret JWT: `token`

## 6. Commandes standards npm

Toutes les commandes de cette section s executent dans `frontend/healthai-admin`.

### 6.1 Difference explicite: npm run vs node + flags

Ce point est essentiel pour eviter la confusion:

- `npm run <script>`: lance un preset deja defini dans `package.json`.
- `node scripts/run-lighthouse-batch.mjs <flags>`: lance le meme moteur, mais vous choisissez vous meme toutes les options.

Equivalences directes:

- `npm run audit:a11y`
	== `node scripts/run-lighthouse-batch.mjs`
- `npm run audit:a11y:normal`
	== `node scripts/run-lighthouse-batch.mjs --ui-high-contrast=false --ui-theme=light`
- `npm run audit:a11y:normal:dry`
	== `node scripts/run-lighthouse-batch.mjs --ui-high-contrast=false --ui-theme=light --dry-run`
- `npm run audit:a11y:hc`
	== `node scripts/run-lighthouse-batch.mjs --ui-high-contrast=true --ui-theme=light`
- `npm run audit:a11y:hc:dry`
	== `node scripts/run-lighthouse-batch.mjs --ui-high-contrast=true --ui-theme=light --dry-run`

Regle de choix simple:

- utilisez `npm run` pour les cas standards (rapide, reproductible, equipe).
- utilisez `node ... --flags` si vous avez un besoin specifique: `--auth-mode`, `--only-routes`, `--run-id`, `--base-url`, etc.

### 6.2 Audit complet

```powershell
npm run audit:a11y
```

### 6.3 Audit normal (theme light, contraste normal)

```powershell
npm run audit:a11y:normal
```

### 6.4 Audit high contrast

```powershell
npm run audit:a11y:hc
```

### 6.5 Dry-run

```powershell
npm run audit:a11y:normal:dry
```

## 7. Procedure recommandee (A a E)

### A) Verifier les routes auditees

Fichier: `scripts/lighthouse-routes.json`

Regles:

- chaque route commence par `/`
- pas de doublons
- ajouter toute nouvelle page metier

### B) Choisir le mode auth

#### Option 1 - `real-login` (recommande en local)

Exemple (seed local):

```powershell
$env:A11Y_AUTH_MODE='real-login'
$env:A11Y_AUTH_LOGIN_URL='/api/auth/login'
$env:A11Y_AUTH_EMAIL='admin@healthapp.com'
$env:A11Y_AUTH_PASSWORD='AdminPass!'
```

#### Option 2 - `token`

```powershell
$env:A11Y_AUTH_MODE='token'
$env:A11Y_AUTH_TOKEN='<JWT_REEL>'
$env:A11Y_AUTH_USER_JSON='{"user_id":"USR_007","email":"admin@healthapp.com","first_name":"Admin","last_name":"System","role_type":"ADMIN"}'
```

### C) Lancer un run cible (validation rapide)

```powershell
$env:A11Y_ONLY_ROUTES='/admin/users'
node scripts/run-lighthouse-batch.mjs --ui-theme=light --ui-high-contrast=false --run-id=local-check-admin-users
```

### D) Lancer un run complet

```powershell
npm run audit:a11y:normal
npm run audit:a11y:hc
```

### E) Nettoyer les variables env (important)

```powershell
Remove-Item Env:A11Y_AUTH_MODE -ErrorAction SilentlyContinue
Remove-Item Env:A11Y_AUTH_LOGIN_URL -ErrorAction SilentlyContinue
Remove-Item Env:A11Y_AUTH_EMAIL -ErrorAction SilentlyContinue
Remove-Item Env:A11Y_AUTH_PASSWORD -ErrorAction SilentlyContinue
Remove-Item Env:A11Y_AUTH_TOKEN -ErrorAction SilentlyContinue
Remove-Item Env:A11Y_AUTH_USER_JSON -ErrorAction SilentlyContinue
Remove-Item Env:A11Y_ONLY_ROUTES -ErrorAction SilentlyContinue
Remove-Item Env:A11Y_RUN_ID -ErrorAction SilentlyContinue
```

## 8. Arguments CLI et variables d environnement

Script: `node scripts/run-lighthouse-batch.mjs`

Rappel: les scripts `npm run audit:a11y*` sont des raccourcis vers cette commande Node avec des flags predefinis (voir section 6.1).

### 8.1 Arguments CLI

1. `--dry-run`
- role: affiche les commandes Lighthouse sans executer les audits

2. `--base-url=<url>`
- defaut: `http://localhost:5173`

3. `--chrome-flags="<flags>"`
- defaut: `--headless=new --disable-gpu --no-sandbox`

4. `--ui-high-contrast=true|false`
- defaut: `false`

5. `--ui-theme=light|dark`
- defaut: `light`

6. `--routes-manifest=<path>`
- defaut: `scripts/lighthouse-routes.json`

7. `--only-routes=/r1,/r2`
- limite le run a certaines routes

8. `--out-dir=<path>`
- defaut: `../lighthouse/a11y-batch-reports`

9. `--run-id=<label>`
- defaut: timestamp

10. `--auth-mode=auto|none|token|real-login`
- defaut: `auto`

11. `--auth-token=<jwt>`
- utilise en mode `token`

12. `--auth-user-json=<json>`
- user explicite pour mode `token`

13. `--auth-user-file=<path-json>`
- alternative fichier pour mode `token`

14. `--auth-me-url=<url>`
- defaut: `/api/auth/me`

15. `--auth-login-url=<url>`
- defaut: `/api/auth/login`

16. `--auth-email=<email>`
- utilise en mode `real-login`

17. `--auth-password=<password>`
- utilise en mode `real-login`

18. `--auth-fallback-role=<role>`
- defaut: `ADMIN`

### 8.2 Variables d environnement supportees

- `A11Y_ONLY_ROUTES`
- `A11Y_UI_HIGH_CONTRAST`
- `A11Y_UI_THEME`
- `A11Y_RUN_ID`
- `A11Y_AUTH_MODE`
- `A11Y_AUTH_TOKEN`
- `A11Y_AUTH_USER_JSON`
- `A11Y_AUTH_USER_FILE`
- `A11Y_AUTH_ME_URL`
- `A11Y_AUTH_LOGIN_URL`
- `A11Y_AUTH_EMAIL`
- `A11Y_AUTH_PASSWORD`
- `A11Y_AUTH_FALLBACK_ROLE`

## 9. Lire les resultats

Sorties generees dans:

- `../lighthouse/a11y-batch-reports`

Structure:

- dossier par run: `<run-id>_<theme>-<contrast>-<authmode>/`
- rapports route: `public_<route>.json` ou `auth_<route>.json`
- syntheses: `summary.json` et `summary.md`
- pointeurs courants: `latest.json`, `latest/summary.json`, `latest/summary.md`

Lecture rapide:

```powershell
Get-Content ../lighthouse/a11y-batch-reports/latest.json
Get-Content ../lighthouse/a11y-batch-reports/latest/summary.json
```

Point cle de validation:

- `finalDisplayedUrl` doit correspondre a la route ciblee.
- pour une route protegee comme `/admin/users`, ne pas finir sur `/login`.

## 10. Depannage rapide

### Erreur `unknown route` avec `--only-routes`

Cause probable:

- route absente de `scripts/lighthouse-routes.json`

Action:

- ajouter la route dans `public` ou `protected`

### Une route protegee redirige vers `/login`

Causes probables:

- mode auth `none` utilise par erreur
- creds invalides en mode `real-login`
- user sans role suffisant

Actions:

- verifier `A11Y_AUTH_MODE`
- verifier email/password ou token
- fournir `A11Y_AUTH_USER_JSON` avec `role_type` correct

### Les options sont ignorees avec `npm run` sous Windows

Action:

- utiliser directement `node scripts/run-lighthouse-batch.mjs ...`

### Erreur de bootstrap local

Cause probable:

- `--base-url` non local

Action:

- utiliser `localhost` ou `127.0.0.1`

## 11. Regles de securite

- Ne pas mettre de token reel en dur dans un fichier versionne.
- Ne pas commiter de credentials dans la doc.
- Nettoyer les variables env apres execution.
- Verifier que les sorties `summary.json`/`latest.json` ne contiennent pas de token brut.

## 12. Checklist avant PR

1. Routes manifest aligne avec le routeur frontend.
2. Dry-run execute sans erreur.
3. Un run reel cible route publique + route protegee valide.
4. `finalDisplayedUrl` correct sur les routes protegees.
5. `latest.json` pointe vers le dernier run attendu.
6. Aucun secret dans la documentation ou les artefacts commits.
