/**
 * Users service — fetches admin user accounts.
 *
 * Toggle `USE_MOCK` to switch between embedded mock data and real
 * backend calls via `apiClient`.
 */

import { apiClient } from '@/api';
import type { AdminUser, CreateUserPayload } from '@/types';
import { usersMock } from '@/mocks/users.mock';

const USE_MOCK = true;

/** Fetch all admin user accounts. */
export async function fetchUsers(): Promise<AdminUser[]> {
    if (USE_MOCK) return usersMock.fetchAll();
    return apiClient.get<AdminUser[]>('/admin/users');
}

/** Create a new admin user account. */
export async function createUser(payload: CreateUserPayload): Promise<AdminUser> {
    if (USE_MOCK) return usersMock.createUser(payload);
    return apiClient.post<AdminUser>('/admin/users', payload);
}
