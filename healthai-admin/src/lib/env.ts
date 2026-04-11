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
 * Mock mode is now opt-in:
 *   1. Set `VITE_USE_MOCKS=true` to force mocks locally.
 *   2. Omit the variable (or set false) to use real API endpoints.
 */

/**
 * `true`  -> services return embedded mock data (no network).
 * `false` -> services call the real API via `apiClient`.
 */
export const USE_MOCK: boolean =
    import.meta.env.VITE_USE_MOCKS?.toString().toLowerCase() === 'true';
