/**
 * Shared DataGrid styling constants.
 *
 * Centralises the MUI DataGrid `sx` tokens that were previously
 * copy-pasted across AuditPage, AnomaliesPage, PartnersPage,
 * PipelinePage and ValidationPage.
 *
 * Changing a value here propagates to ALL data tables in the app.
 */

import type { SxProps, Theme } from '@mui/material';

// ─── Default DataGrid sx ────────────────────────────────────

export const DATAGRID_SX: SxProps<Theme> = {
    border: 'none',
    '& .MuiDataGrid-columnHeaders': {
        bgcolor: 'action.hover',
        fontWeight: 600,
    },
    '& .MuiDataGrid-cell': {
        display: 'flex',
        alignItems: 'center',
    },
};

// ─── Default pagination options ─────────────────────────────

export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

// ─── Default table height ───────────────────────────────────

export const DEFAULT_TABLE_HEIGHT = 560;
