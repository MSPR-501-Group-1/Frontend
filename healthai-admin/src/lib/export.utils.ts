/**
 * Export utilities — CSV & PDF generation.
 *
 * Single Responsibility: each function handles one export format.
 * The public API (`exportToCSV`, `exportToPDF`) is format-agnostic
 * for the caller — the component only provides data + metadata.
 */

import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Types ──────────────────────────────────────────────────

export interface ExportColumn {
    /** Object key in the row data */
    field: string;
    /** Human-readable header for the export file */
    headerName: string;
}

interface ExportOptions {
    /** File name without extension */
    fileName: string;
    /** Column definitions */
    columns: ExportColumn[];
    /** Row data (array of objects) */
    rows: Record<string, unknown>[];
    /** Optional title shown in PDF header */
    title?: string;
}

// ─── CSV Export (via xlsx) ──────────────────────────────────

export function exportToCSV({ fileName, columns, rows }: ExportOptions): void {
    // Build an array of arrays: [ [headers], [row1], [row2], ... ]
    const headers = columns.map((c) => c.headerName);
    const data = rows.map((row) =>
        columns.map((c) => formatCellValue(row[c.field])),
    );

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Export');

    const buffer = XLSX.write(workbook, { bookType: 'csv', type: 'array' });
    const blob = new Blob([buffer], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${fileName}.csv`);
}

// ─── PDF Export (via jsPDF + autoTable) ─────────────────────

export function exportToPDF({ fileName, columns, rows, title }: ExportOptions): void {
    const doc = new jsPDF({ orientation: 'landscape' });

    // Title
    if (title) {
        doc.setFontSize(16);
        doc.text(title, 14, 20);
        doc.setFontSize(10);
        doc.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);
    }

    const head = [columns.map((c) => c.headerName)];
    const body = rows.map((row) =>
        columns.map((c) => String(formatCellValue(row[c.field]))),
    );

    autoTable(doc, {
        head,
        body,
        startY: title ? 34 : 14,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [37, 99, 235] }, // primary blue
    });

    doc.save(`${fileName}.pdf`);
}

// ─── Helpers ────────────────────────────────────────────────

function formatCellValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toLocaleDateString('fr-FR');
    return String(value);
}
