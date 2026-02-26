/**
 * Users service — fetches admin user accounts.
 *
 * Toggle `USE_MOCK` to switch between embedded mock data and real
 * backend calls via `apiClient`.
 */

import { apiClient } from '@/api';
import type { AdminUser } from '@/types';
import { usersMock } from '@/mocks/users.mock';

const USE_MOCK = true;

/** Fetch all admin user accounts. */
export async function fetchUsers(): Promise<AdminUser[]> {
    if (USE_MOCK) return usersMock.fetchAll();
    return apiClient.get<AdminUser[]>('/admin/users');
}
