// User roles for RBAC
export enum UserRole {
    FREEMIUM = 'FREEMIUM',
    PREMIUM = 'PREMIUM',
    PREMIUM_PLUS = 'PREMIUM_PLUS',
    B2B = 'B2B',
    ADMIN = 'ADMIN',
}

// Role labels (i18n-ready)
export const ROLE_LABELS: Record<UserRole, string> = {
    [UserRole.FREEMIUM]: 'Freemium',
    [UserRole.PREMIUM]: 'Premium',
    [UserRole.PREMIUM_PLUS]: 'Premium+',
    [UserRole.B2B]: 'B2B',
    [UserRole.ADMIN]: 'Administrateur',
};

// ─── Pipeline / Validation enums ────────────────────────────

/** Sources de données du pipeline ETL */
export enum DataSource {
    OPEN_FOOD_FACTS = 'OPEN_FOOD_FACTS',
    WHO_NUTRITION_DB = 'WHO_NUTRITION_DB',
    EXERCISE_DB = 'EXERCISE_DB',
    USER_WEARABLES = 'USER_WEARABLES',
    ANSES_CIQUAL = 'ANSES_CIQUAL',
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
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    role_type: UserRole;
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

export type DateRange = '7d' | '30d' | '90d' | 'all';

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

export interface AdminUser {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    role_type: UserRole;
    is_active: boolean;
    created_at: string;
}

/** Payload for creating a new admin user account */
export interface CreateUserPayload {
    email: string;
    first_name: string;
    last_name: string;
    role_type: UserRole;
}

// ─── Business KPI page models ───────────────────────────────

export interface BusinessPageData {
    kpis: BusinessKPI[];
    engagementTrend: TimeSeriesPoint[];
    retentionCohorts: CategoryDataPoint[];
    featureAdoption: CategoryDataPoint[];
    revenueVsTarget: MultiSeriesPoint[];
}

// ─── Partners B2B models ────────────────────────────────────

export type PartnerType = 'COMPANY' | 'GYM' | 'MUTUAL' | 'NGO' | 'OTHER';
export type PartnerStatus = 'active' | 'trial' | 'suspended' | 'churned';

export const PARTNER_TYPE_LABELS: Record<PartnerType, string> = {
    COMPANY: 'Entreprise',
    GYM: 'Salle de sport',
    MUTUAL: 'Mutuelle',
    NGO: 'ONG',
    OTHER: 'Autre',
};

export const PARTNER_STATUS_LABELS: Record<PartnerStatus, string> = {
    active: 'Actif',
    trial: 'Essai',
    suspended: 'Suspendu',
    churned: 'Résilié',
};

export interface Partner {
    id: string;
    name: string;
    type: PartnerType;
    status: PartnerStatus;
    contractStart: string;      // ISO date
    contractEnd: string;        // ISO date
    usersCount: number;
    apiCallsMonth: number;
    lastActivity: string;       // ISO date
    satisfactionScore: number;  // 0–100
}

export interface PartnerDashboardData {
    partners: Partner[];
    usageByPartner: CategoryDataPoint[];
    partnerTypesBreakdown: CategoryDataPoint[];
    monthlyApiCalls: TimeSeriesPoint[];
}

// ─── Configuration / Validation Rules models ────────────────

export type ValidationRuleType = 'range' | 'pattern' | 'required' | 'unique';

export interface ValidationRule {
    id: string;
    field: string;
    source: DataSource;
    type: ValidationRuleType;
    minValue?: number;
    maxValue?: number;
    pattern?: string;
    enabled: boolean;
    description: string;
}

export interface AlertThreshold {
    id: string;
    metric: string;
    warningLevel: number;
    criticalLevel: number;
    enabled: boolean;
    description: string;
}

export interface SystemConfig {
    validationRules: ValidationRule[];
    alertThresholds: AlertThreshold[];
    retentionDays: number;
    refreshInterval: number;
}

// ─── Validation Batch models (ETL CSV OK/KO workflow) ───────

/**
 * Représente un lot de données produit par l'ETL (un run Spark).
 *
 * Architecture Approche A : l'ETL génère ok.csv + ko.csv.
 * Le Backend expose ces batches via API REST.
 * L'admin valide/rejette chaque lot depuis cette interface.
 */
export interface ValidationBatch {
    id: string;
    source: DataSource;
    pipelineRunId: string;          // lien vers le run ETL ayant produit ce batch
    receivedAt: string;             // ISO date — date de dépôt des CSV
    status: ValidationStatus;
    /** Nombre total d'enregistrements dans ok.csv */
    okRecordCount: number;
    /** Nombre total d'enregistrements dans ko.csv */
    koRecordCount: number;
    /** Reviewer ayant traité le batch (null si pending) */
    reviewer?: string;
    reviewedAt?: string;            // ISO date
    comment?: string;
    /** Nom du fichier ok.csv d'origine (traçabilité) */
    okFileName: string;
    /** Nom du fichier ko.csv d'origine (traçabilité) */
    koFileName: string;
}

/** Enregistrement individuel issu d'un ko.csv — ligne en anomalie */
export interface ValidationRecord {
    id: string;
    batchId: string;
    /** Nom du champ en anomalie (ex: heart_rate, calories, weight_kg) */
    field: string;
    /** Valeur originale (telle que figurant dans ko.csv) */
    originalValue: string;
    /** Valeur corrigée par l'admin (null si pas encore édité) */
    correctedValue?: string;
    validationStatus: 'flagged' | 'corrected' | 'dismissed';
    rule?: string;                  // nom de la règle enfreinte
    flagReason: string;
    /** Admin ayant effectué la correction */
    correctedBy?: string;
    /** Date ISO de la correction */
    correctedAt?: string;
}

/** Résumé agrégé pour les KPIs de la page validation */
export interface ValidationSummary {
    pending: number;
    inReview: number;
    approved: number;
    rejected: number;
    corrected: number;
    total: number;
}
