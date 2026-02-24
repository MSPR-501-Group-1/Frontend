// User roles for RBAC
export enum UserRole {
    ADMIN = 'admin',
    DATA_ENGINEER = 'data_engineer',
    PRODUCT_OWNER = 'product_owner',
    DIRECTION = 'direction',
    PARTNER = 'partner',
}

// Basic user type
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    avatar?: string;
}

// ─── Business KPI ───────────────────────────────────────────

export type KPIStatus = 'success' | 'warning' | 'error';

export interface BusinessKPI {
    id: string;
    label: string;
    value: string | number;
    unit?: string;
    trend?: number;       // percentage variation (positive = up)
    target?: number;
    status: KPIStatus;
}

// ─── Chart data models ──────────────────────────────────────

export interface TimeSeriesPoint {
    date: string;       // ISO date or label (e.g. "2026-01-15")
    value: number;
    target?: number;
}

export interface CategoryDataPoint {
    name: string;
    value: number;
    color?: string;
}

export interface MultiSeriesPoint {
    date: string;
    [key: string]: string | number;  // dynamic series keys
}

export interface DashboardData {
    kpis: BusinessKPI[];
    userActivity: TimeSeriesPoint[];
    dataQualityTrend: TimeSeriesPoint[];
    dataSources: CategoryDataPoint[];
    anomaliesByType: CategoryDataPoint[];
    dataIngestion: MultiSeriesPoint[];      // stacked area — ingestion by source
    anomalyTrend: MultiSeriesPoint[];       // composed — new vs resolved anomalies
}

// ─── Analytics page models ──────────────────────────────────

export type DateRange = '7d' | '30d' | '90d';

export interface AnalyticsPageData {
    kpis: BusinessKPI[];
    timeSeries: TimeSeriesPoint[];
    breakdown: CategoryDataPoint[];
    distribution: CategoryDataPoint[];
}
