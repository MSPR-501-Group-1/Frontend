# Lighthouse A11y Operations Manual (HealthAI Admin)

This file is the long-term operating manual for Lighthouse accessibility batch audits.

## Scope

- Frontend app: `frontend/healthai-admin`
- Runner script: `healthai-admin/scripts/run-lighthouse-batch.mjs`
- Output root: `frontend/lighthouse/a11y-batch-reports`
- Routes manifest: `healthai-admin/scripts/lighthouse-routes.json`
- Auth profiles: `healthai-admin/scripts/lighthouse-auth-profiles.json`
- Bootstrap template: `healthai-admin/scripts/lighthouse-auth-bootstrap.template.html`

## Important Warning About This Setup

This setup is intentionally atypical.

Why:
- It injects a simulated authenticated session from audit tooling.
- It is designed for deterministic local/CI accessibility runs, not product authentication.

Risks if misunderstood:
- Treating audit session simulation as real security.
- Reusing audit profile conventions outside the audit pipeline.
- Breaking audits when auth store shape changes.

Rule:
- Keep this mechanism strictly limited to Lighthouse automation.

## Architecture And Service Responsibilities

### 1) Frontend runtime service (Docker `frontend`)

Purpose:
- Serves static React build on `http://localhost:5173`.
- Exposes `/api/*` reverse proxy to backend.

Must be true:
- Port 5173 reachable from host.
- SPA routing fallback enabled.
- Build contains app routes listed in routes manifest.

### 2) Backend service (Docker `backend`)

Purpose for Lighthouse:
- Serves API requests needed by pages during audit.

Must be true:
- Backend healthy at `/health`.
- API base path reachable from frontend (`/api`).

### 3) Lighthouse runner (`run-lighthouse-batch.mjs`)

Purpose:
- Builds test URLs.
- Generates temporary bootstrap page in `public/`.
- Runs Lighthouse per route.
- Generates summary artifacts and latest pointers.

Must be true:
- Node dependencies available in `healthai-admin`.
- Script can create and remove temporary bootstrap file.
- Write permission on output directory.

### 4) Bootstrap template (`lighthouse-auth-bootstrap.template.html`)

Purpose:
- Reads query params for target route, UI mode and simulated auth payload.
- Writes `sessionStorage` (`healthai-auth`) and `localStorage` (`healthai-ui`).
- Redirects to target route.

Must be true:
- Only used locally (`localhost` / `127.0.0.1`).
- Not committed as a permanent public page artifact.

## Configuration Matrix (What Goes Where)

### A) Route coverage

File:
- `scripts/lighthouse-routes.json`

Content contract:
- `public`: array of routes without auth simulation.
- `protected`: array of routes with auth simulation.

Update rule:
- Any new page in navigation/routing must be reflected here.

### B) Audit auth identities

File:
- `scripts/lighthouse-auth-profiles.json`

Content contract:
- `defaultProfile`: key in `profiles`.
- `profiles.<name>.user`: must include `user_id`, `email`, `first_name`, `last_name`, `role_type`.
- `profiles.<name>.tokenPrefix`: prefix for generated mock token.

Update rule:
- Keep only audit personas used for route permissions.
- Do not place real credentials in this file.

### C) UI mode

Provided by CLI options:
- `--ui-theme=light|dark`
- `--ui-high-contrast=true|false`

Usage rule:
- Normal visual checks: `ui-high-contrast=false`.
- Accessibility compliance checks: `ui-high-contrast=true`.

### D) Session lifetime

Provided by CLI option:
- `--auth-ttl-sec=<seconds>`

Default:
- `900`

Usage rule:
- Keep short-lived values in CI (5 to 15 minutes).

## NPM Commands (Standard Entry Points)

- Full audit (default):
  - `npm run audit:a11y`
- Full audit normal mode:
  - `npm run audit:a11y:normal`
- Dry run normal mode:
  - `npm run audit:a11y:normal:dry`
- Full audit high-contrast mode:
  - `npm run audit:a11y:hc`
- Dry run high-contrast mode:
  - `npm run audit:a11y:hc:dry`

## Advanced CLI Options

Direct command:
- `node scripts/run-lighthouse-batch.mjs [options]`

Options:
- `--dry-run`
- `--base-url=<url>` default `http://localhost:5173`
- `--chrome-flags="<flags>"` default `--headless=new --disable-gpu --no-sandbox`
- `--ui-high-contrast=<true|false>` default `false`
- `--ui-theme=<light|dark>` default `light`
- `--auth-profile=<profileName>` default from `defaultProfile`
- `--auth-profiles-file=<path>` default `scripts/lighthouse-auth-profiles.json`
- `--auth-ttl-sec=<seconds>` default `900`
- `--routes-manifest=<path>` default `scripts/lighthouse-routes.json`
- `--only-routes=/route1,/route2`
- `--out-dir=<path>` default `../lighthouse/a11y-batch-reports`
- `--run-id=<label>` default timestamp `YYYYMMDD-HHmmss`

## Windows / PowerShell Notes

Because of argument forwarding limitations with `npm run -- ...` on Windows:
- Prefer env vars for simple route filters.
- Prefer direct `node ...` for advanced flags.

Examples:
- `$env:A11Y_ONLY_ROUTES='/data/quality,/403'; npm run audit:a11y:hc`
- `Remove-Item Env:A11Y_ONLY_ROUTES`
- `node scripts/run-lighthouse-batch.mjs --ui-high-contrast=true --auth-profile=admin --only-routes=/admin/audit --dry-run`

## Output Contract

Per run:
- Folder: `YYYYMMDD-HHmmss_<theme>-<mode>-<profile>/`
- Route reports: `public_<route>.json`, `auth_<route>.json`
- Summaries: `summary.json`, `summary.md`

Global latest pointers:
- `latest.json`
- `latest/summary.json`
- `latest/summary.md`

`summary` contains:
- base URL
- chrome flags
- UI theme
- high contrast status
- auth profile
- auth session TTL
- run id
- score and failed audits per route

## Runbook (Operational Procedure)

1. Start stack:
   - `docker compose -f docker-compose.yml up -d --build frontend`
2. Dry-run first:
   - `npm run audit:a11y:hc:dry`
3. Targeted real run:
   - `$env:A11Y_ONLY_ROUTES='/login,/403'; npm run audit:a11y:hc; Remove-Item Env:A11Y_ONLY_ROUTES`
4. Read latest pointers:
   - `Get-Content ../lighthouse/a11y-batch-reports/latest.json`
   - `Get-Content ../lighthouse/a11y-batch-reports/latest/summary.json`

## Maintenance Checklist (Every Sprint)

1. Validate routes manifest matches real app routes.
2. Validate auth profiles still satisfy route guards.
3. Run one targeted high-contrast audit to confirm bootstrap flow.
4. Confirm temporary bootstrap cleanup works (file absent after run).
5. Confirm `latest.json` points to a valid run directory.
6. Confirm no generated report artifacts are accidentally tracked by Git.

## Troubleshooting

### Symptom: unknown route in `--only-routes`

Cause:
- Route missing from `lighthouse-routes.json`.

Fix:
- Add route to the appropriate array (`public` or `protected`).

### Symptom: route redirects to login unexpectedly

Cause:
- Audit profile role does not satisfy route guards.

Fix:
- Use a profile with required `role_type`.

### Symptom: bootstrap page blocked

Cause:
- Audit not executed on localhost.

Fix:
- Ensure base URL points to `localhost` or `127.0.0.1`.

### Symptom: npm ignores advanced flags on Windows

Cause:
- npm CLI argument parsing.

Fix:
- Use env vars or direct `node scripts/run-lighthouse-batch.mjs ...`.

## Security And Delivery Notes

- Bootstrap page is generated temporarily in `public/` from template and removed after execution.
- This mechanism must remain local/CI-only and never be treated as production auth.
- Auth identity data is isolated in audit profile config, not hardcoded in executable HTML.
