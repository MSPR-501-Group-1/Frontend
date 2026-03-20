# Lighthouse Accessibility Runbook

Version: 1.2
Scope: HealthAI Admin - audits Lighthouse accessibilite

Ce document est la reference operationnelle pour executer les audits a11y de facon fiable, en local et en CI.

## Sommaire

1. [Objectif](#1-objectif)
2. [Pre-requis](#2-pre-requis)
3. [Configuration a maintenir](#3-configuration-a-maintenir)
4. [Commandes standards](#4-commandes-standards)
5. [Arguments npm et node (detail)](#5-arguments-npm-et-node-detail)
6. [Procedure recommandee](#6-procedure-recommandee)
7. [Lire les resultats](#7-lire-les-resultats)
8. [Depannage rapide](#8-depannage-rapide)
9. [Regles de securite](#9-regles-de-securite)

## 1. Objectif

Produire des rapports Lighthouse accessibilite reproductibles sur les routes publiques et protegees de l application.

Le runbook couvre:

- execution des audits
- parametrage des profils et des routes
- interpretation des sorties

Le runbook ne couvre pas:

- authentification produit reelle
- performance Lighthouse

## 2. Pre-requis

### Outils

- Docker + Docker Compose
- Node.js 22+
- npm

### Emplacement des commandes

- commandes Docker: racine projet
- commandes Lighthouse: frontend/healthai-admin

### Verification minimale avant audit

Depuis la racine projet:

```powershell
docker compose -f docker-compose.yml up -d --build frontend
docker compose -f docker-compose.yml ps
```

Depuis frontend/healthai-admin:

```powershell
npm ci
npm run audit:a11y:normal:dry
```

Si le dry-run passe, la configuration est exploitable.

## 3. Configuration a maintenir

### Routes d audit

Fichier: scripts/lighthouse-routes.json

- public: routes sans session simulee
- protected: routes avec session simulee

Regles:

- chaque route commence par /
- pas de doublons
- toute nouvelle page doit etre ajoutee

### Profils d audit

Fichier: scripts/lighthouse-auth-profiles.json

Champs obligatoires pour profiles.<name>.user:

- user_id
- email
- first_name
- last_name
- role_type

Regles:

- defaultProfile doit pointer vers un profil existant
- pas de secrets reels dans ce fichier

## 4. Commandes standards

Toutes les commandes de cette section s executent dans frontend/healthai-admin.

### 4.1 Audit complet (par defaut)

```powershell
npm run audit:a11y
```

Usage:

- controle global des routes configurees

Sortie attendue:

- creation d un dossier de run
- creation de summary.json, summary.md et latest.json

### 4.2 Audit normal

```powershell
npm run audit:a11y:normal
```

### 4.3 Audit high contrast

```powershell
npm run audit:a11y:hc
```

### 4.4 Dry-run

```powershell
npm run audit:a11y:hc:dry
```

### 4.5 Ciblage de routes via variable d environnement

```powershell
$env:A11Y_ONLY_ROUTES='/data/quality,/403'
npm run audit:a11y:hc
Remove-Item Env:A11Y_ONLY_ROUTES
```

### 4.6 Commande avancee directe

```powershell
node scripts/run-lighthouse-batch.mjs --ui-high-contrast=true --auth-profile=admin --run-id=sprint-12-a11y
```

## 5. Arguments npm et node (detail)

Cette section decrit les arguments disponibles dans le script node scripts/run-lighthouse-batch.mjs.

### 5.1 Difference npm run vs node direct

- npm run audit:a11y:hc: lance un preset defini dans package.json
- node scripts/run-lighthouse-batch.mjs ...: donne le controle complet sur les options

Conseil:

- usage equipe: npm run pour rester standard
- usage debug/CI avance: node direct

### 5.2 Arguments CLI du script node

1. --dry-run
- type: flag
- defaut: false
- role: affiche les commandes Lighthouse sans generer de rapports
- exemple:

```powershell
node scripts/run-lighthouse-batch.mjs --dry-run
```

2. --base-url=<url>
- type: string
- defaut: http://localhost:5173
- role: URL de base de l application a auditer
- exemple:

```powershell
node scripts/run-lighthouse-batch.mjs --base-url=http://localhost:5173
```

3. --chrome-flags="<flags>"
- type: string
- defaut: --headless=new --disable-gpu --no-sandbox
- role: options de lancement Chrome pour Lighthouse
- exemple:

```powershell
node scripts/run-lighthouse-batch.mjs --chrome-flags="--headless=new --disable-gpu --no-sandbox"
```

4. --ui-high-contrast=true|false
- type: booleen
- defaut: false
- role: force le mode contraste eleve dans le contexte d audit
- exemple:

```powershell
node scripts/run-lighthouse-batch.mjs --ui-high-contrast=true
```

5. --ui-theme=light|dark
- type: string
- defaut: light
- role: theme UI applique pendant l audit
- exemple:

```powershell
node scripts/run-lighthouse-batch.mjs --ui-theme=dark
```

6. --auth-profile=<nom>
- type: string
- defaut: defaultProfile du fichier auth profiles
- role: profil utilisateur simule utilise pour les routes protegees
- exemple:

```powershell
node scripts/run-lighthouse-batch.mjs --auth-profile=admin
```

7. --auth-profiles-file=<path>
- type: string
- defaut: scripts/lighthouse-auth-profiles.json
- role: chemin vers un fichier de profils alternatif
- exemple:

```powershell
node scripts/run-lighthouse-batch.mjs --auth-profiles-file=scripts/lighthouse-auth-profiles.json
```

8. --auth-ttl-sec=<seconds>
- type: entier
- defaut: 900
- role: duree de validite de la session simulee
- exemple:

```powershell
node scripts/run-lighthouse-batch.mjs --auth-ttl-sec=600
```

9. --routes-manifest=<path>
- type: string
- defaut: scripts/lighthouse-routes.json
- role: fichier de routes a auditer
- exemple:

```powershell
node scripts/run-lighthouse-batch.mjs --routes-manifest=scripts/lighthouse-routes.json
```

10. --only-routes=/r1,/r2
- type: liste CSV
- defaut: toutes les routes du manifest
- role: limite le run a certaines routes
- exemple:

```powershell
node scripts/run-lighthouse-batch.mjs --only-routes=/login,/admin/audit
```

11. --out-dir=<path>
- type: string
- defaut: ../lighthouse/a11y-batch-reports
- role: dossier de sortie des rapports
- exemple:

```powershell
node scripts/run-lighthouse-batch.mjs --out-dir=../lighthouse/a11y-batch-reports
```

12. --run-id=<label>
- type: string
- defaut: timestamp genere automatiquement
- role: identifiant du run (traçabilite CI)
- exemple:

```powershell
node scripts/run-lighthouse-batch.mjs --run-id=sprint-12-a11y-hc
```

### 5.3 Variables d environnement supportees

Ces variables peuvent remplacer les arguments CLI:

- A11Y_ONLY_ROUTES
- A11Y_UI_HIGH_CONTRAST
- A11Y_UI_THEME
- A11Y_AUTH_TTL_SEC
- A11Y_AUTH_PROFILE
- A11Y_RUN_ID

Exemple PowerShell:

```powershell
$env:A11Y_UI_HIGH_CONTRAST='true'
$env:A11Y_AUTH_PROFILE='admin'
npm run audit:a11y
Remove-Item Env:A11Y_UI_HIGH_CONTRAST
Remove-Item Env:A11Y_AUTH_PROFILE
```

## 6. Procedure recommandee

1. Demarrer le frontend et ses dependances via Docker Compose.
2. Executer un dry-run.
3. Executer un run reel cible (ou complet).
4. Lire latest.json et summary.json.
5. Corriger les pages en echec puis relancer uniquement les routes impactees.

Commandes type:

```powershell
# racine projet
docker compose -f docker-compose.yml up -d --build frontend

# frontend/healthai-admin
npm run audit:a11y:hc:dry
$env:A11Y_ONLY_ROUTES='/login,/admin/audit'
npm run audit:a11y:hc
Remove-Item Env:A11Y_ONLY_ROUTES
```

## 7. Lire les resultats

Sorties generees dans:

- ../lighthouse/a11y-batch-reports

Structure:

- dossier par run: YYYYMMDD-HHmmss_theme-mode-profile/
- rapports route: public_<route>.json ou auth_<route>.json
- syntheses: summary.json et summary.md
- pointeurs courants: latest.json, latest/summary.json, latest/summary.md

Lecture rapide:

```powershell
Get-Content ../lighthouse/a11y-batch-reports/latest.json
Get-Content ../lighthouse/a11y-batch-reports/latest/summary.json
```

## 8. Depannage rapide

### Erreur unknown route dans only-routes

Cause:

- route absente de scripts/lighthouse-routes.json

Action:

- ajouter la route dans public ou protected

### Route protegee redirigee vers login

Cause:

- role du profil insuffisant

Action:

- changer --auth-profile ou adapter role_type dans le profil d audit

### Arguments ignores avec npm run sous Windows

Cause:

- forwarding npm parfois limite

Action:

- utiliser node scripts/run-lighthouse-batch.mjs directement

### Echec de bootstrap local

Cause:

- base-url non local

Action:

- utiliser localhost ou 127.0.0.1

## 9. Regles de securite

- Le mecanisme de session simulee est reserve au pipeline d audit.
- Les profils d audit ne doivent jamais contenir de credentials reels.
- Le bootstrap temporaire ne doit pas etre conserve comme page produit.
- Les artefacts de rapport ne doivent pas etre commit par erreur.

## Checklist sprint

1. Mettre a jour les routes auditees selon la navigation reelle.
2. Verifier les profils d audit par rapport aux guards.
3. Lancer au moins un audit high contrast cible.
4. Valider les pointeurs latest.
5. Verifier que les fichiers de rapports ne sont pas suivis par Git.
