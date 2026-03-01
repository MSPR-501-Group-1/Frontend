/**
 * FilterBar — generic horizontal filter strip above DataGrid.
 *
 * Supports:
 *   1. Select-based filters (dropdowns)
 *   2. Date inputs (from / to)
 *   3. Result count summary
 *   4. Right-aligned actions slot (ExportButton, etc.)
 *
 * @example
 * <FilterBar
 *     filters={[
 *         { label: 'Statut', value: statusFilter, onChange: setStatusFilter, options: STATUS_OPTIONS },
 *     ]}
 *     resultCount={filteredRows.length}
 *     resultLabel="exécution"
 *     actions={<ExportButton ... />}
 * />
 */

import {
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Box,
    TextField,
    type SelectChangeEvent,
} from '@mui/material';
import { pluralize } from '@/lib/formatters';

// ─── Types ──────────────────────────────────────────────────

export interface FilterOption {
    value: string;
    label: string;
}

export interface FilterDef {
    /** Input label displayed above the select. */
    label: string;
    /** Current value (controlled). */
    value: string;
    /** onChange handler. */
    onChange: (value: string) => void;
    /** Available options. The first option is the "all" catch-all. */
    options: FilterOption[];
    /** Minimum width of the select. Default: 180. */
    minWidth?: number;
}

export interface DateFilter {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

interface FilterBarProps {
    /** Select-based filters. */
    filters?: FilterDef[];
    /** Optional date inputs (from / to). */
    dateFilters?: DateFilter[];
    /** Total result count to display. */
    resultCount?: number;
    /** Singular noun for the count label (e.g. "anomalie"). */
    resultLabel?: string;
    /** Right-aligned actions (ExportButton, etc.). */
    actions?: React.ReactNode;
}

// ─── Component ──────────────────────────────────────────────

export default function FilterBar({
    filters = [],
    dateFilters = [],
    resultCount,
    resultLabel,
    actions,
}: FilterBarProps) {
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
            {filters.map((f) => (
                <FormControl key={f.label} size="small" sx={{ minWidth: f.minWidth ?? 180 }}>
                    <InputLabel>{f.label}</InputLabel>
                    <Select
                        value={f.value}
                        label={f.label}
                        onChange={(e: SelectChangeEvent) => f.onChange(e.target.value)}
                    >
                        {f.options.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            ))}

            {dateFilters.map((df) => (
                <TextField
                    key={df.label}
                    size="small"
                    type="date"
                    label={df.label}
                    value={df.value}
                    onChange={(e) => df.onChange(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                />
            ))}

            {resultCount !== undefined && resultLabel && (
                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                    {resultCount} {pluralize(resultCount, resultLabel)}{' '}
                    {pluralize(resultCount, 'affichée')}
                </Typography>
            )}

            {!resultLabel && <Box sx={{ flexGrow: 1 }} />}

            {actions}
        </Paper>
    );
}
