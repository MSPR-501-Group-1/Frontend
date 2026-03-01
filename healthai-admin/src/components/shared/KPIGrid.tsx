/**
 * KPIGrid — generic KPI card grid.
 *
 * Replaces the repeated pattern across 6+ pages:
 *   <Grid container spacing={2} sx={{ mb: 3 }}>
 *       {items.map(kpi => (
 *           <Grid key={kpi.id} size={{ xs: 12, sm: 6, md: N }}>
 *               <KPICard label={...} value={...} ... />
 *           </Grid>
 *       ))}
 *   </Grid>
 *
 * @example
 * <KPIGrid items={data.kpis} />
 * <KPIGrid items={kpis} columns={{ xs: 6, sm: 3 }} />
 */

import { Grid } from '@mui/material';
import KPICard from '@/components/dashboard/KPICard';
import type { KPIStatus } from '@/types';

// ─── Types ──────────────────────────────────────────────────

export interface KPIGridItem {
    id: string;
    label: string;
    value: string | number;
    unit?: string;
    trend?: number;
    status?: KPIStatus;
    /** Optional drill-down route. */
    to?: string;
}

export interface KPIGridColumns {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
}

interface KPIGridProps {
    /** KPI items to display. */
    items: KPIGridItem[];
    /** Responsive column sizing per item. Default: { xs: 12, sm: 6, md: 3 }. */
    columns?: KPIGridColumns;
    /** Bottom margin. Default: 3. */
    mb?: number;
}

// ─── Component ──────────────────────────────────────────────

export default function KPIGrid({
    items,
    columns = { xs: 12, sm: 6, md: 3 },
    mb = 3,
}: KPIGridProps) {
    if (items.length === 0) return null;

    return (
        <Grid container spacing={2} sx={{ mb }}>
            {items.map((kpi) => (
                <Grid key={kpi.id} size={columns}>
                    <KPICard
                        label={kpi.label}
                        value={kpi.value}
                        unit={kpi.unit}
                        trend={kpi.trend}
                        status={kpi.status}
                        to={kpi.to}
                    />
                </Grid>
            ))}
        </Grid>
    );
}
