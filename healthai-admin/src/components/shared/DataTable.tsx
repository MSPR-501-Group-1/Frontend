/**
 * DataTable — generic wrapper around MUI DataGrid with consistent styling.
 *
 * Features:
 *   - Uniform styling across all table pages (DATA_GRID_SX)
 *   - Top-positioned pagination via CSS flexbox order
 *     (native footer is reordered above the grid body so users paginate
 *     without scrolling)
 *   - Configurable sort, page size, height
 *   - Escape hatch via `slotProps` for advanced cases
 *
 * @example
 * <DataTable
 *     rows={filteredRows}
 *     columns={columns}
 *     ariaLabel="Tableau des logs d'audit"
 *     defaultSort={{ field: 'timestamp', sort: 'desc' }}
 *     height={560}
 * />
 */

import { Paper } from '@mui/material';
import {
    DataGrid,
    type GridColDef,
    type DataGridProps,
} from '@mui/x-data-grid';

// ─── Shared styles (single source of truth) ─────────────────

/**
 * Standard DataGrid sx applied project-wide.
 *
 * The footer (pagination) is repositioned above the grid body
 * using CSS `order` on the flex children of the DataGrid root,
 * which is already `display: flex; flex-direction: column`.
 */
export const DATA_GRID_SX = {
    border: 'none',
    '& .MuiDataGrid-main': {
        order: 1,
    },
    '& .MuiDataGrid-footerContainer': {
        order: 0,
        borderBottom: 1,
        borderBottomColor: 'divider',
        borderTop: 'none',
    },
    '& .MuiDataGrid-columnHeaders': {
        bgcolor: 'action.hover',
        fontWeight: 600,
    },
    '& .MuiDataGrid-cell': {
        display: 'flex',
        alignItems: 'center',
    },
} as const;

// ─── Props ──────────────────────────────────────────────────

interface SortItem {
    field: string;
    sort: 'asc' | 'desc';
}

interface DataTableProps<R extends { id: string | number }> {
    /** Row data. */
    rows: R[];
    /** Column definitions. */
    columns: GridColDef<R>[];
    /** Accessible label for the grid. */
    ariaLabel?: string;
    /** Default sort model (e.g. `{ field: 'date', sort: 'desc' }`). */
    defaultSort?: SortItem;
    /** Container height in px. Default: 560. */
    height?: number;
    /** Page size options. Default: [10, 25, 50]. */
    pageSizeOptions?: number[];
    /** Default page size. Default: 10. */
    defaultPageSize?: number;
    /** Additional DataGrid props to merge in (escape hatch). */
    slotProps?: DataGridProps<R>;
}

// ─── Component ──────────────────────────────────────────────

export default function DataTable<R extends { id: string | number }>({
    rows,
    columns,
    ariaLabel,
    defaultSort,
    height = 560,
    pageSizeOptions = [10, 25, 50],
    defaultPageSize = 10,
    slotProps,
}: DataTableProps<R>) {
    return (
        <Paper elevation={0} sx={{ height }}>
            <DataGrid
                rows={rows}
                columns={columns}
                aria-label={ariaLabel}
                initialState={{
                    sorting: defaultSort
                        ? { sortModel: [defaultSort] }
                        : undefined,
                    pagination: {
                        paginationModel: { pageSize: defaultPageSize },
                    },
                }}
                pageSizeOptions={pageSizeOptions}
                disableRowSelectionOnClick
                sx={DATA_GRID_SX}
                {...slotProps}
            />
        </Paper>
    );
}
