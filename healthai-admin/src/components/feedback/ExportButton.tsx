/**
 * ExportButton — reusable dropdown button for CSV/PDF exports.
 *
 * Usage:
 *   <ExportButton
 *     fileName="anomalies-export"
 *     title="Anomalies"
 *     columns={[{ field: 'id', headerName: 'ID' }, ...]}
 *     rows={filteredRows}
 *   />
 */

import { useState, useCallback } from 'react';
import {
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    FileDownload as FileDownloadIcon,
    Description as CsvIcon,
    PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { exportToCSV, exportToPDF, type ExportColumn } from '@/lib/export.utils';

// ─── Props ──────────────────────────────────────────────────

interface ExportButtonProps {
    /** File name without extension */
    fileName: string;
    /** Title shown inside the PDF header */
    title?: string;
    /** Column descriptors for the export */
    columns: ExportColumn[];
    /** Data rows */
    rows: Record<string, unknown>[];
    /** Disable when no data */
    disabled?: boolean;
}

// ─── Component ──────────────────────────────────────────────

export default function ExportButton({
    fileName,
    title,
    columns,
    rows,
    disabled = false,
}: ExportButtonProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleOpen = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(e.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleCSV = useCallback(() => {
        exportToCSV({ fileName, columns, rows, title });
        handleClose();
    }, [fileName, columns, rows, title, handleClose]);

    const handlePDF = useCallback(() => {
        exportToPDF({ fileName, columns, rows, title });
        handleClose();
    }, [fileName, columns, rows, title, handleClose]);

    return (
        <>
            <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={handleOpen}
                disabled={disabled || rows.length === 0}
                aria-label="Exporter les données"
                aria-haspopup="true"
                aria-expanded={open}
            >
                Exporter
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={handleCSV}>
                    <ListItemIcon><CsvIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Exporter en CSV</ListItemText>
                </MenuItem>
                <MenuItem onClick={handlePDF}>
                    <ListItemIcon><PdfIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Exporter en PDF</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
}
