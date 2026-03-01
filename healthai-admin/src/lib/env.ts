/**
 * Centralised environment flags — single source of truth.
 *
 * Replaces the 13 independent `const USE_MOCK = true` scattered
 * across every service file. Now there is exactly ONE place to
 * flip between mock and real backend.
 *
 * Usage in services:
 *   import { USE_MOCK } from '@/lib/env';
 *
 * When the backend is live, either:
 *   1. Set `VITE_USE_MOCKS=false` in `.env`
 *   2. Or remove the env var entirely (defaults to false in prod builds)
 */

/**
 * `true`  → services return embedded mock data (no network).
 * `false` → services call the real API via `apiClient`.
 */
export const USE_MOCK: boolean =
    import.meta.env.VITE_USE_MOCKS?.toString().toLowerCase() !== 'false';
