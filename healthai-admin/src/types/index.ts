// User roles for RBAC
export enum UserRole {
    ADMIN = 'admin',
    DATA_ENGINEER = 'data_engineer',
    PRODUCT_OWNER = 'product_owner',
    DIRECTION = 'direction',
    B2B_PARTNER = 'b2b_partner',
}

// Role labels (i18n-ready)
export const ROLE_LABELS: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrateur',
    [UserRole.DATA_ENGINEER]: 'Data Engineer',
    [UserRole.PRODUCT_OWNER]: 'Product Owner',
    [UserRole.DIRECTION]: 'Direction',
    [UserRole.B2B_PARTNER]: 'Partenaire B2B',
};

// ─── Pipeline / Validation enums ────────────────────────────

/** Sources de données du pipeline ETL */
export enum DataSource {
    NUTRITION = 'nutrition',
    EXERCISES = 'exercises',
    USER_PROFILES = 'user_profiles',
    FITNESS_TRACKER = 'fitness_tracker',
    BIOMETRIC = 'biometric',
}

/** Statuts du workflow de validation des données */
export enum ValidationStatus {
    PENDING = 'pending',
    IN_REVIEW = 'in_review',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    CORRECTED = 'corrected',
}

/** Formats d'export supportés */
export enum ExportFormat {
    CSV = 'csv',
    JSON = 'json',
    PDF = 'pdf',
    PNG = 'png',
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

// ─── Data Quality models ────────────────────────────────────

export interface QualityDimension {
    id: string;
    label: string;
    score: number;         // 0–100
    description: string;
    status: KPIStatus;
}

export interface DataQualityScore {
    overall: number;       // 0–100
    dimensions: QualityDimension[];
    history: TimeSeriesPoint[];
}

// ─── Anomalies models ───────────────────────────────────────

export type AnomalySeverity = 'critical' | 'high' | 'medium' | 'low';
export type AnomalyStatus = 'open' | 'in_review' | 'corrected' | 'dismissed';
export type AnomalyType = 'out_of_range' | 'duplicate' | 'missing' | 'inconsistent' | 'format_error';

export interface Anomaly {
    id: string;
    detectedAt: string;         // ISO date
    source: string;             // e.g. "Nutrition API", "Fitness Tracker"
    field: string;              // e.g. "heart_rate", "calories"
    type: AnomalyType;
    severity: AnomalySeverity;
    status: AnomalyStatus;
    description: string;
    originalValue: string;
    suggestedValue?: string;
    correctedValue?: string;
    correctedBy?: string;
    correctedAt?: string;
    justification?: string;
}

// ─── Audit models ───────────────────────────────────────────

export type AuditAction =
    | 'login'
    | 'logout'
    | 'create_user'
    | 'update_role'
    | 'correct_anomaly'
    | 'approve_batch'
    | 'reject_batch'
    | 'export_data'
    | 'update_config'
    | 'delete_record';

export interface AuditLog {
    id: string;
    timestamp: string;          // ISO date
    user: string;               // email
    action: AuditAction;
    target?: string;            // resource affected
    detail: string;
    ip: string;
}

// ─── Pipeline ETL models ────────────────────────────────────

export type PipelineStatus = 'success' | 'failed' | 'running' | 'pending';

export interface PipelineRun {
    id: string;
    source: DataSource;
    startedAt: string;          // ISO date
    duration: number;           // seconds
    status: PipelineStatus;
    recordsProcessed: number;
    recordsFailed: number;
    errorMessage?: string;
    triggeredBy: string;        // 'scheduler' | user email
}

// ─── Admin User models ──────────────────────────────────────

export type AccountStatus = 'active' | 'inactive' | 'suspended';

export interface AdminUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: AccountStatus;
    createdAt: string;
    lastLogin: string | null;
}

// ─── Business KPI page models ───────────────────────────────

export interface BusinessPageData {
    kpis: BusinessKPI[];
    engagementTrend: TimeSeriesPoint[];
    retentionCohorts: CategoryDataPoint[];
    featureAdoption: CategoryDataPoint[];
    revenueVsTarget: MultiSeriesPoint[];
}
