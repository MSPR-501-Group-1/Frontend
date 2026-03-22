# Lighthouse Accessibility Runbook

Version: 2.0
Scope: HealthAI Admin - audits Lighthouse accessibilite

Ce runbook couvre le pipeline a11y avec authentification reelle (token JWT backend ou login backend) et remplace le flux historique base sur profils mock.

## 1. Objectif

Produire des rapports Lighthouse accessibilite reproductibles sur routes publiques et protegees, avec un bootstrap compatible Zustand persist (`healthai-auth` en localStorage).

## 2. Pre-requis

- Docker + Docker Compose
- Node.js 22+
- npm

Depuis la racine projet:

```powershell
docker compose -f docker-compose.yml up -d --build frontend backend
docker compose -f docker-compose.yml ps
```

Depuis `frontend/healthai-admin`:

```powershell
npm ci
npm run audit:a11y:normal:dry
```

## 3. Changement majeur (migration)

Le runner ne depend plus des profils mock (`lighthouse-auth-profiles.json`) pour simuler un user.

Nouveaux modes d auth:

- `--auth-mode=none`: aucune auth (routes publiques)
- `--auth-mode=token`: JWT reel fourni
- `--auth-mode=real-login`: login backend email/password
- `--auth-mode=auto` (defaut): choisit `token`, sinon `real-login`, sinon `none`

## 4. Commandes standards

Toutes les commandes ci-dessous s executent dans `frontend/healthai-admin`.

Audit complet preset:

```powershell
npm run audit:a11y
```

Audit normal:

```powershell
npm run audit:a11y:normal
```

Audit high contrast:

```powershell
npm run audit:a11y:hc
```

Dry-run:

```powershell
npm run audit:a11y:hc:dry
```

## 5. Auth reelle - exemples PowerShell

### 5.1 Mode token JWT reel (route protegee ciblee)

```powershell
$env:A11Y_AUTH_MODE='token'
$env:A11Y_AUTH_TOKEN='<JWT_REEL>'
$env:A11Y_AUTH_USER_JSON='{"user_id":"u-admin-1","email":"admin@healthai.local","first_name":"Admin","last_name":"Audit","role_type":"ADMIN"}'
$env:A11Y_ONLY_ROUTES='/admin/audit'
node scripts/run-lighthouse-batch.mjs --ui-theme=light --ui-high-contrast=false
Remove-Item Env:A11Y_AUTH_MODE
Remove-Item Env:A11Y_AUTH_TOKEN
Remove-Item Env:A11Y_AUTH_USER_JSON
Remove-Item Env:A11Y_ONLY_ROUTES
```

### 5.2 Mode login backend reel (email/password)

```powershell
$env:A11Y_AUTH_MODE='real-login'
$env:A11Y_AUTH_LOGIN_URL='/api/auth/login'
$env:A11Y_AUTH_EMAIL='admin@healthai.local'
$env:A11Y_AUTH_PASSWORD='<MOT_DE_PASSE_REEL>'
$env:A11Y_ONLY_ROUTES='/admin/audit'
node scripts/run-lighthouse-batch.mjs --ui-theme=light --ui-high-contrast=false
Remove-Item Env:A11Y_AUTH_MODE
Remove-Item Env:A11Y_AUTH_LOGIN_URL
Remove-Item Env:A11Y_AUTH_EMAIL
Remove-Item Env:A11Y_AUTH_PASSWORD
Remove-Item Env:A11Y_ONLY_ROUTES
```

Notes:

- En mode `token`, `--auth-user-json` ou `--auth-user-file` est recommande.
- Si `--auth-user-json`/`--auth-user-file` est absent, le runner tente `--auth-me-url` (defaut `/api/auth/me`).
- Aucun token n est ecrit dans `summary.json` ou `latest.json`.

## 6. Arguments CLI du runner

Script: `node scripts/run-lighthouse-batch.mjs`

1. `--dry-run`
- role: affiche les commandes Lighthouse sans generer les rapports

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
- limite le run aux routes ciblees

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
- alternative fichier pour le user du mode `token`

14. `--auth-me-url=<url>`
- defaut: `/api/auth/me`
- appele pour resoudre le user en mode `token` si user non fourni

15. `--auth-login-url=<url>`
- defaut: `/api/auth/login`
- utilise en mode `real-login`

16. `--auth-email=<email>`
- utilise en mode `real-login`

17. `--auth-password=<password>`
- utilise en mode `real-login`

18. `--auth-fallback-role=<role>`
- defaut: `ADMIN`
- complete le user si `role_type` n est pas retourne par le backend

## 7. Variables d environnement supportees

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

## 8. Procedure recommandee

1. Demarrer frontend + backend.
2. Lancer dry-run.
3. Lancer un run cible sur route protegee en auth reelle.
4. Verifier `finalDisplayedUrl` et `matchedTargetRoute` dans `summary.json`.

Exemple rapide:

```powershell
npm run audit:a11y:normal:dry
$env:A11Y_AUTH_MODE='token'
$env:A11Y_AUTH_TOKEN='<JWT_REEL>'
$env:A11Y_AUTH_USER_JSON='{"user_id":"u-admin-1","email":"admin@healthai.local","first_name":"Admin","last_name":"Audit","role_type":"ADMIN"}'
$env:A11Y_ONLY_ROUTES='/admin/audit'
node scripts/run-lighthouse-batch.mjs --ui-theme=light --ui-high-contrast=false
Remove-Item Env:A11Y_AUTH_MODE
Remove-Item Env:A11Y_AUTH_TOKEN
Remove-Item Env:A11Y_AUTH_USER_JSON
Remove-Item Env:A11Y_ONLY_ROUTES
```

## 9. Resultats attendus

- Pour `/admin/audit`, `finalDisplayedUrl` doit rester sur la route protegee ciblee (pas `/login`).
- Les routes publiques restent auditables avec `auth-mode=none` ou `auto` sans credentials.
- `summary.json` et `latest.json` ne contiennent pas de token brut.
