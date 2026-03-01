/**
 * StatsBar — horizontal row of Chip stats displayed above tables.
 *
 * Replaces the repeated pattern:
 *   <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
 *     <Chip label={`${N} ...`} variant="outlined" />
 *     <Chip label={`${M} ...`} color="..." variant="outlined" />
 *   </Stack>
 *
 * @example
 * <StatsBar
 *     items={[
 *         { label: `${stats.total} entrées totales` },
 *         { label: `${stats.open} ouvertes`, color: 'error' },
 *         { label: `${stats.critical} critiques`, color: 'warning' },
 *     ]}
 * />
 */

import { Chip, Stack, type ChipOwnProps } from '@mui/material';

// ─── Types ──────────────────────────────────────────────────

export interface StatItem {
    /** Text displayed inside the Chip. */
    label: string;
    /** MUI Chip color. Default: undefined (outlined default). */
    color?: ChipOwnProps['color'];
}

interface StatsBarProps {
    items: StatItem[];
    /** Bottom margin in spacing units. Default: 3. */
    mb?: number;
}

// ─── Component ──────────────────────────────────────────────

export default function StatsBar({ items, mb = 3 }: StatsBarProps) {
    return (
        <Stack direction="row" spacing={1.5} sx={{ mb }}>
            {items.map((item) => (
                <Chip
                    key={item.label}
                    label={item.label}
                    color={item.color}
                    variant="outlined"
                />
            ))}
        </Stack>
    );
}
