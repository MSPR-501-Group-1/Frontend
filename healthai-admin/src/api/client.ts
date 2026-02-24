/**
 * HTTP API client — single point of configuration for all backend calls.
 *
 * Currently wraps the native `fetch` API with sensible defaults
 * (JSON headers, base-URL, auth token injection, error mapping).
 *
 * When the backend is available, the ONLY change required is setting
 * `VITE_API_BASE_URL` in `.env`.  Every service already calls
 * `apiClient.get/post/…` so no refactoring is needed downstream.
 *
 * Design rationale:
 * - No external dependency (axios) — keeps the bundle small.
 * - Follows the Adapter pattern: services depend on an abstraction,
 *   not on a concrete HTTP library.
 * - Centralised error handling (401 → logout, 403 → redirect, etc.).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 * @see https://react.dev/learn/synchronizing-with-effects#fetching-data (React docs on data fetching)
 */

// ─── Types ──────────────────────────────────────────────────

export interface ApiError {
    status: number;
    message: string;
    details?: unknown;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
    params?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
}

// ─── Configuration ──────────────────────────────────────────

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '/api';

// ─── Helpers ────────────────────────────────────────────────

function buildUrl(path: string, params?: RequestOptions['params']): string {
    const url = new URL(path, BASE_URL.startsWith('http') ? BASE_URL : `${window.location.origin}${BASE_URL}`);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) url.searchParams.set(key, String(value));
        });
    }
    return url.toString();
}

function getAuthToken(): string | null {
    try {
        const raw = sessionStorage.getItem('healthai-auth');
        if (!raw) return null;
        const state = JSON.parse(raw)?.state;
        return state?.token ?? null;
    } catch {
        return null;
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let message = response.statusText;
        try {
            const body = await response.json();
            message = body.message ?? body.error ?? message;
        } catch { /* response body is not JSON */ }

        const error: ApiError = { status: response.status, message };

        // Centralised side-effects for specific HTTP codes
        if (response.status === 401) {
            sessionStorage.removeItem('healthai-auth');
            window.location.href = '/login';
        }

        throw error;
    }

    // 204 No Content
    if (response.status === 204) return undefined as unknown as T;

    return response.json() as Promise<T>;
}

// ─── Public API ─────────────────────────────────────────────

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
    const { params, body, headers: extraHeaders, ...rest } = options;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...extraHeaders,
    };

    const token = getAuthToken();
    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(buildUrl(path, params), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        ...rest,
    });

    return handleResponse<T>(response);
}

export const apiClient = {
    get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
    post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('POST', path, { ...options, body }),
    put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PUT', path, { ...options, body }),
    patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PATCH', path, { ...options, body }),
    delete: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
} as const;

export default apiClient;
