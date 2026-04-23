import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

export interface ChartDataColumn<T extends object> {
    key: keyof T | string;
    label: string;
    format?: (value: unknown, row: T) => string;
}

interface ChartDataTableProps<T extends object> {
    title: string;
    columns: ChartDataColumn<T>[];
    rows: T[];
    rowHeaderKey?: string;
    summaryLabel?: string;
    emptyMessage?: string;
}

function defaultFormat(value: unknown): string {
    if (value === null || value === undefined) return '-';
    return String(value);
}

export default function ChartDataTable<T extends object>({
    title,
    columns,
    rows,
    rowHeaderKey,
    summaryLabel,
    emptyMessage = 'Aucune donnée disponible pour ce graphique.',
}: ChartDataTableProps<T>) {
    return (
        <Box
            component="details"
            sx={{
                mt: 2,
                pt: 1.5,
                borderTop: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Box
                component="summary"
                sx={{
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'text.primary',
                    '&:focus-visible': {
                        outline: '2px solid',
                        outlineColor: 'primary.main',
                        outlineOffset: 2,
                    },
                }}
            >
                {summaryLabel ?? `Afficher les données tabulaires du graphique: ${title}`}
            </Box>

            <Box sx={{ mt: 1.25 }}>
                {rows.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        {emptyMessage}
                    </Typography>
                ) : (
                    <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <Table size="small" aria-label={`Tableau des données du graphique: ${title}`}>
                            <caption>{`Tableau des données: ${title}`}</caption>
                            <TableHead>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableCell key={String(column.key)} component="th" scope="col" sx={{ fontWeight: 700 }}>
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {rows.map((row, rowIndex) => (
                                    <TableRow key={`${title}-row-${rowIndex}`}>
                                        {columns.map((column) => {
                                            const key = String(column.key);
                                            const rawValue = (row as Record<string, unknown>)[key];
                                            const formatted = column.format
                                                ? column.format(rawValue, row)
                                                : defaultFormat(rawValue);
                                            const isRowHeader = rowHeaderKey === key;

                                            return (
                                                <TableCell
                                                    key={`${title}-cell-${rowIndex}-${key}`}
                                                    component={isRowHeader ? 'th' : 'td'}
                                                    scope={isRowHeader ? 'row' : undefined}
                                                >
                                                    {formatted}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </Box>
    );
}