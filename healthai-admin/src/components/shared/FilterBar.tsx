/**
 * FilterBar — generic composable filter container.
 *
 * Standardises the visual container for page filters:
 *   - Paper with elevation=0, consistent padding & flex layout
 *   - Optional result count display
 *   - Optional right-aligned actions slot (e.g. ExportButton)
 *   - Children = actual filter controls (Select, TextField, etc.)
 *
 * Usage:
 *   <FilterBar resultCount={filteredRows.length} resultLabel="entrée">
 *     <FormControl size="small" sx={{ minWidth: 180 }}>
 *       <InputLabel>Type</InputLabel>
 *       <Select ... />
 *     </FormControl>
 *   </FilterBar>
 */

import type { ReactNode } from 'react';
import { Paper, Typography } from '@mui/material';

// ─── Props ──────────────────────────────────────────────────

interface FilterBarProps {
    children: ReactNode;
    /** Number of results currently displayed. */
    resultCount?: number;
    /** Singular label for the result noun. Plural is auto-generated. @default "résultat" */
    resultLabel?: string;
    /** Optional right-aligned actions (ExportButton, etc.). */
    actions?: ReactNode;
}

// ─── Component ──────────────────────────────────────────────

export default function FilterBar({
    children,
    resultCount,
    resultLabel = 'résultat',
    actions,
}: FilterBarProps) {
    const plural = resultCount !== undefined && resultCount > 1;
    const resultText = resultCount !== undefined
        ? `${resultCount} ${resultLabel}${plural ? 's' : ''} affiché${plural ? 's' : ''}`
        : null;

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
            }}
        >
            {children}

            {resultText && (
                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                    {resultText}
                </Typography>
            )}

            {!resultText && <div style={{ flexGrow: 1 }} />}

            {actions}
        </Paper>
    );
}
