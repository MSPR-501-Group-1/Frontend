# Lighthouse A11y Commands (HealthAI Admin)

This document centralizes all commands for the batch accessibility audit script:
- script: `healthai-admin/scripts/run-lighthouse-batch.mjs`
- default output directory: `frontend/lighthouse/a11y-batch-reports`

## Prerequisites

1. Frontend container/app must be running on `http://localhost:5173`.
2. Run commands from `frontend/healthai-admin` unless stated otherwise.

## NPM commands

- Full audit (default behavior):
  - `npm run audit:a11y`

- Full audit in normal UI mode (light, non-high-contrast):
  - `npm run audit:a11y:normal`

- Dry run in normal UI mode (print routes/commands only):
  - `npm run audit:a11y:normal:dry`

- Full audit in accessibility mode (high-contrast ON):
  - `npm run audit:a11y:hc`

- Dry run in accessibility mode:
  - `npm run audit:a11y:hc:dry`

## Script CLI options

You can run the script directly for advanced control:

`node scripts/run-lighthouse-batch.mjs [options]`

Supported options:

- `--dry-run`
  - Prints Lighthouse commands without running audits.

- `--base-url=<url>`
  - Default: `http://localhost:5173`

- `--chrome-flags="<flags>"`
  - Default: `--headless=new --disable-gpu --no-sandbox`

- `--ui-high-contrast=<true|false>`
  - Default: `false`

- `--ui-theme=<light|dark>`
  - Default: `light`

- `--only-routes=/route1,/route2`
  - Restricts audit to listed routes.
  - Unknown routes fail fast with an explicit error.

- `--out-dir=<path>`
  - Output directory for JSON reports + summary files.
  - Default: `../lighthouse/a11y-batch-reports`

## PowerShell-safe targeted runs

On Windows, use env vars for route filtering to avoid argument forwarding issues with `npm run -- ...`.

- Audit only specific routes in high-contrast:
  - `$env:A11Y_ONLY_ROUTES='/data/quality,/403'; npm run audit:a11y:hc`

- Audit only specific routes in normal mode:
  - `$env:A11Y_ONLY_ROUTES='/data/pipeline,/admin/config'; npm run audit:a11y:normal`

- Clear the filter after run:
  - `Remove-Item Env:A11Y_ONLY_ROUTES`

## Direct examples

- Targeted high-contrast run (direct node):
  - `node scripts/run-lighthouse-batch.mjs --ui-high-contrast=true --ui-theme=light --only-routes=/data/quality,/403`

- Targeted normal-mode dry run with custom output:
  - `node scripts/run-lighthouse-batch.mjs --ui-high-contrast=false --ui-theme=light --only-routes=/data/pipeline --dry-run --out-dir=../lighthouse/tmp-normal`

## Outputs

Generated files in output directory:

- Per-route reports:
  - `public_<route>.json`
  - `auth_<route>.json`

- Summaries:
  - `summary.json`
  - `summary.md`

The summary includes:
- base URL
- chrome flags
- UI theme
- high-contrast status
- score and failed audits per route
