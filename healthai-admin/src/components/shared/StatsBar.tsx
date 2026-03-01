/**
 * StatsBar — generic chip-based stats row.
 *
 * Standardises the display of quick summary statistics at the top
 * of pages (total count, filtered count, status breakdowns, etc.).
 *
 * Usage:
 *   <StatsBar
 *     stats={[
 *       { label: '120 entrées totales', variant: 'outlined' },
 *       { label: '45 affichées', color: 'primary', variant: 'outlined' },
 *     ]}
 *   />
 */

import { Stack, Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';

// ─── Types ──────────────────────────────────────────────────

export interface StatChip {
    label: string;
    color?: ChipProps['color'];
    variant?: ChipProps['variant'];
}

// ─── Props ──────────────────────────────────────────────────

interface StatsBarProps {
    stats: StatChip[];
    /** Spacing between chips. @default 1.5 */
    spacing?: number;
}

// ─── Component ──────────────────────────────────────────────

export default function StatsBar({ stats, spacing = 1.5 }: StatsBarProps) {
    if (stats.length === 0) return null;

    return (
        <Stack direction="row" spacing={spacing} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
            {stats.map((stat, index) => (
                <Chip
                    key={`${stat.label}-${index}`}
                    label={stat.label}
                    color={stat.color ?? 'default'}
                    variant={stat.variant ?? 'outlined'}
                />
            ))}
        </Stack>
    );
}
