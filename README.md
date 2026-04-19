# Frontend

Interface web React + TypeScript + Vite (application principale dans healthai-admin).

## Prerequis

- Node.js 22.12+ recommande (20.19+ minimum)
- npm 10+

## Lancement local

Se placer dans l'application frontend, installer les dependances, puis lancer Vite:

```bash
cd healthai-admin
npm ci
npm run dev
```

Application disponible sur http://localhost:5173

## Verification qualite

Depuis frontend/healthai-admin:

```bash
npm run typecheck
npm run lint
npm run build

# ou en une commande
npm run verify
```

## Variables d'environnement

Variables utilisees au build frontend:

- VITE_API_BASE_URL (defaut: /api)
- VITE_USE_MOCKS (defaut: false)

Ces variables sont centralisees via .env a la racine et injectees par docker-compose.

## Lancement avec Docker (depuis la racine)

```bash
docker compose up --build backend frontend
```

Le frontend est expose sur http://localhost:5173 (Nginx ecoute sur le port 80 dans le conteneur).

## Verification rapide

- Ouvrir http://localhost:5173
- Verifier que les appels /api sont bien rediriges vers le backend