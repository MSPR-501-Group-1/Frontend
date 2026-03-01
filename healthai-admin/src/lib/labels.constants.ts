/**
 * Shared label maps for DataSource and other enums.
 *
 * Previously duplicated in PipelinePage, ConfigPage, and ValidationPage.
 * Now there is a single source of truth.
 */

import { DataSource } from '@/types';

/** Human-readable labels for DataSource enum values (fr-FR). */
export const SOURCE_LABELS: Record<DataSource, string> = {
    [DataSource.NUTRITION]: 'Nutrition',
    [DataSource.EXERCISES]: 'Exercices',
    [DataSource.USER_PROFILES]: 'Profils utilisateur',
    [DataSource.FITNESS_TRACKER]: 'Fitness Tracker',
    [DataSource.BIOMETRIC]: 'Biométrique',
};
