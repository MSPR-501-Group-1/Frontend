/**
 * Barrel export for the API layer.
 *
 * Every service imports the client from here:
 *   import { apiClient } from '@/api';
 */
export { apiClient, type ApiError, type RequestOptions } from './client';
