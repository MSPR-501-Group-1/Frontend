import { apiClient } from '@/api';
import type { User } from '@/types';

// ─── Types ──────────────────────────────────────────────────

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}

// ─── Public API ─────────────────────────────────────────────

export async function loginUser(email: string, _password: string): Promise<LoginResponse> {
    const resp = await apiClient.post<LoginResponse | { data: LoginResponse }>('/auth/login', { email, password: _password });
    // Backend may return { data: { user, token } } or { user, token }
    // Normalize to LoginResponse
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = (resp as any).data ?? resp;
    return payload as LoginResponse;
}

export async function logoutUser(): Promise<void> {
    return apiClient.post<void>('/auth/logout');
}
