/**
 * DataTable — generic wrapper around MUI DataGrid.
 *
 * Provides a consistent look-and-feel for every tabular page:
 *   - Paper container with standardised height
 *   - Shared sx styling (column headers, cell alignment)
 *   - Default pagination & sorting config
 *   - Integrated EmptyState when no rows
 *
 * Usage:
 *   <DataTable
 *     rows={filteredRows}
 *     columns={columns}
 *     ariaLabel="Tableau des logs d'audit"
 *     defaultSort={{ field: 'timestamp', sort: 'desc' }}
 *   />
 */

import { Paper } from '@mui/material';
import { DataGrid, type GridColDef, type GridSortModel } from '@mui/x-data-grid';
import { EmptyState } from '@/components/feedback';
import {
    DATAGRID_SX,
    DEFAULT_PAGE_SIZE_OPTIONS,
    DEFAULT_TABLE_HEIGHT,
} from '@/lib/datagrid.constants';

// ─── Props ──────────────────────────────────────────────────

interface DataTableProps<R extends { id: string | number }> {
    /** Data rows — must have an `id` field. */
    rows: R[];
    /** Column definitions (MUI DataGrid). */
    columns: GridColDef<R>[];
    /** Accessible label for the table. */
    ariaLabel: string;
    /** Default sort model (first render). */
    defaultSort?: GridSortModel[number];
    /** Default page size. @default 10 */
    defaultPageSize?: number;
    /** Page-size options. @default [10, 25, 50] */
    pageSizeOptions?: readonly number[];
    /** Container height in px. @default 560 */
    height?: number;
    /** Message when `rows` is empty. */
    emptyMessage?: string;
    /** Enable row selection. @default false */
    checkboxSelection?: boolean;
    /** Disable row click selection. @default true */
    disableRowSelectionOnClick?: boolean;
}

// ─── Component ──────────────────────────────────────────────

export default function DataTable<R extends { id: string | number }>({
    rows,
    columns,
    ariaLabel,
    defaultSort,
    defaultPageSize = 10,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    height = DEFAULT_TABLE_HEIGHT,
    emptyMessage,
    checkboxSelection = false,
    disableRowSelectionOnClick = true,
}: DataTableProps<R>) {
    if (rows.length === 0 && emptyMessage) {
        return <EmptyState message={emptyMessage} />;
    }

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
                pageSizeOptions={[...pageSizeOptions]}
                checkboxSelection={checkboxSelection}
                disableRowSelectionOnClick={disableRowSelectionOnClick}
                sx={DATAGRID_SX}
            />
        </Paper>
    );
}
