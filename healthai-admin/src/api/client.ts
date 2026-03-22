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

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function resolveBaseUrl(value: unknown): string {
    if (typeof value !== 'string') return '/api';

    const trimmed = value.trim();
    if (!trimmed || trimmed === '/') return '/api';

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }

    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

const BASE_URL: string = resolveBaseUrl(RAW_BASE_URL);

// ─── Helpers ────────────────────────────────────────────────

function buildUrl(path: string, params?: RequestOptions['params']): string {
    const normalizedBase = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
    const base = BASE_URL.startsWith('http')
        ? normalizedBase
        : `${window.location.origin}${normalizedBase}`;

    // Keep BASE_URL path segment (e.g. "/api") even if callers pass paths like "/auth/login".
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    const url = new URL(normalizedPath, base);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) url.searchParams.set(key, String(value));
        });
    }
    return url.toString();
}

function getAuthToken(): string | null {
    try {
        // 1) localStorage persisted auth (preferred)
        const rawLocal = localStorage.getItem('healthai-auth');
        if (rawLocal) {
            try {
                const state = JSON.parse(rawLocal);
                const t1 = state?.state?.token ?? state?.token ?? state?.access_token ?? state?.token;
                if (t1) return t1;
            } catch { /* ignore parse error */ }
        }

        // 2) session storage legacy object { state: { token: '...' } }
        const raw = sessionStorage.getItem('healthai-auth');
        if (raw) {
            try {
                const state = JSON.parse(raw);
                const t1 = state?.state?.token ?? state?.token;
                if (t1) return t1;
            } catch { /* ignore parse error */ }
        }

        // 3) direct access_token keys in session/local storage
        const localToken = localStorage.getItem('access_token');
        if (localToken) return localToken;
        const sessToken = sessionStorage.getItem('access_token');
        if (sessToken) return sessToken;

        // 4) cookie fallback (access_token)
        const m = document.cookie.match(/(?:^|; )access_token=([^;]+)/);
        if (m) return decodeURIComponent(m[1]);

    } catch {
        // best-effort, return null if anything goes wrong
    }
    return null;
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
            // Clear persisted auth (both storages) and redirect to login
            try { localStorage.removeItem('healthai-auth'); } catch { }
            try { sessionStorage.removeItem('healthai-auth'); } catch { }
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
