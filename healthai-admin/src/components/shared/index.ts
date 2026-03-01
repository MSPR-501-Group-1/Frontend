/**
 * Barrel export for shared / generic components.
 *
 * These components implement cross-cutting patterns used by
 * multiple feature pages (tables, filters, stats, KPIs).
 */

export { default as DataTable, DATA_GRID_SX } from './DataTable';
export { default as FilterBar } from './FilterBar';
export type { FilterDef, FilterOption, DateFilter } from './FilterBar';
export { default as KPIGrid } from './KPIGrid';
export type { KPIGridItem, KPIGridColumns } from './KPIGrid';
export { default as StatsBar } from './StatsBar';
export type { StatItem } from './StatsBar';
