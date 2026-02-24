import { useState, useMemo, useCallback } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAnomalies, correctAnomaly } from '@/services/anomalies.service';
import type { Anomaly, AnomalySeverity, AnomalyStatus, AnomalyType } from '@/types';

// ─── Lookup maps ────────────────────────────────────────────

const SEVERITY_CONFIG: Record<AnomalySeverity, { label: string; color: 'error' | 'warning' | 'info' | 'success' }> = {
    critical: { label: 'Critique', color: 'error' },
    high: { label: 'Élevée', color: 'warning' },
    medium: { label: 'Moyenne', color: 'info' },
    low: { label: 'Faible', color: 'success' },
};

const STATUS_CONFIG: Record<AnomalyStatus, { label: string; color: 'error' | 'warning' | 'info' | 'success' | 'default' }> = {
    open: { label: 'Ouverte', color: 'error' },
    in_review: { label: 'En revue', color: 'warning' },
    corrected: { label: 'Corrigée', color: 'success' },
    dismissed: { label: 'Écartée', color: 'default' },
};

const TYPE_LABELS: Record<AnomalyType, string> = {
    out_of_range: 'Hors plage',
    duplicate: 'Doublon',
    missing: 'Manquant',
    inconsistent: 'Incohérent',
    format_error: 'Format invalide',
};

// ─── Correction Dialog ──────────────────────────────────────

interface CorrectionDialogProps {
    anomaly: Anomaly | null;
    open: boolean;
    onClose: () => void;
    onSubmit: (id: string, correctedValue: string, justification: string) => void;
    isSubmitting: boolean;
}

function CorrectionDialog({ anomaly, open, onClose, onSubmit, isSubmitting }: CorrectionDialogProps) {
    const [correctedValue, setCorrectedValue] = useState('');
    const [justification, setJustification] = useState('');
    const [touched, setTouched] = useState(false);

    // Reset form when dialog opens with new anomaly
    const handleEnter = useCallback(() => {
        setCorrectedValue(anomaly?.suggestedValue || '');
        setJustification('');
        setTouched(false);
    }, [anomaly]);

    const isValid = correctedValue.trim().length > 0 && justification.trim().length > 0;

    const handleSubmit = () => {
        setTouched(true);
        if (!anomaly || !isValid) return;
        onSubmit(anomaly.id, correctedValue.trim(), justification.trim());
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            TransitionProps={{ onEnter: handleEnter }}
        >
            <DialogTitle>Corriger l'anomalie {anomaly?.id}</DialogTitle>
            <DialogContent dividers>
                {anomaly && (
                    <Stack spacing={2.5} sx={{ pt: 1 }}>
                        {/* Summary */}
                        <Alert severity="info" variant="outlined">
                            {anomaly.description}
                        </Alert>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <TextField
                                label="Valeur originale"
                                value={anomaly.originalValue}
                                size="small"
                                slotProps={{ input: { readOnly: true } }}
                            />
                            <TextField
                                label="Valeur suggérée"
                                value={anomaly.suggestedValue || '—'}
                                size="small"
                                slotProps={{ input: { readOnly: true } }}
                            />
                        </Box>

                        <TextField
                            label="Valeur corrigée"
                            value={correctedValue}
                            onChange={(e) => setCorrectedValue(e.target.value)}
                            error={touched && correctedValue.trim().length === 0}
                            helperText={touched && correctedValue.trim().length === 0 ? 'Obligatoire' : ''}
                            required
                            fullWidth
                        />

                        <TextField
                            label="Justification"
                            value={justification}
                            onChange={(e) => setJustification(e.target.value)}
                            error={touched && justification.trim().length === 0}
                            helperText={touched && justification.trim().length === 0 ? 'Obligatoire — requis pour la traçabilité' : ''}
                            required
                            fullWidth
                            multiline
                            minRows={2}
                        />
                    </Stack>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={isSubmitting}>
                    Annuler
                </Button>
                <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting || !isValid}>
                    {isSubmitting ? <CircularProgress size={20} /> : 'Valider la correction'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ─── Page ───────────────────────────────────────────────────

type SeverityFilter = 'all' | AnomalySeverity;

export default function AnomaliesPage() {
    const queryClient = useQueryClient();
    const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
    const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // ── Queries ──
    const { data: anomalies, isLoading, isError } = useQuery({
        queryKey: ['anomalies'],
        queryFn: fetchAnomalies,
    });

    const mutation = useMutation({
        mutationFn: ({ id, correctedValue, justification }: { id: string; correctedValue: string; justification: string }) =>
            correctAnomaly(id, correctedValue, justification),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['anomalies'] });
            setDialogOpen(false);
            setSelectedAnomaly(null);
        },
    });

    // ── Filtered data ──
    const filteredRows = useMemo(() => {
        if (!anomalies) return [];
        if (severityFilter === 'all') return anomalies;
        return anomalies.filter((a) => a.severity === severityFilter);
    }, [anomalies, severityFilter]);

    // ── Stats ──
    const stats = useMemo(() => {
        if (!anomalies) return { total: 0, open: 0, critical: 0 };
        return {
            total: anomalies.length,
            open: anomalies.filter((a) => a.status === 'open').length,
            critical: anomalies.filter((a) => a.severity === 'critical').length,
        };
    }, [anomalies]);

    // ── Handlers ──
    const handleOpenCorrection = useCallback((anomaly: Anomaly) => {
        setSelectedAnomaly(anomaly);
        setDialogOpen(true);
    }, []);

    const handleCorrection = useCallback(
        (id: string, correctedValue: string, justification: string) => {
            mutation.mutate({ id, correctedValue, justification });
        },
        [mutation],
    );

    // ── Columns ──
    const columns: GridColDef<Anomaly>[] = useMemo(
        () => [
            {
                field: 'id',
                headerName: 'ID',
                width: 120,
                renderCell: ({ value }) => (
                    <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                        {value}
                    </Typography>
                ),
            },
            {
                field: 'detectedAt',
                headerName: 'Détection',
                width: 150,
                valueFormatter: (value: string) => {
                    const d = new Date(value);
                    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                },
            },
            { field: 'source', headerName: 'Source', width: 150 },
            { field: 'field', headerName: 'Champ', width: 120 },
            {
                field: 'type',
                headerName: 'Type',
                width: 130,
                valueFormatter: (value: AnomalyType) => TYPE_LABELS[value] || value,
            },
            {
                field: 'severity',
                headerName: 'Sévérité',
                width: 120,
                renderCell: ({ value }) => {
                    const cfg = SEVERITY_CONFIG[value as AnomalySeverity];
                    return <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 600 }} />;
                },
                sortComparator: (a: AnomalySeverity, b: AnomalySeverity) => {
                    const order: AnomalySeverity[] = ['critical', 'high', 'medium', 'low'];
                    return order.indexOf(a) - order.indexOf(b);
                },
            },
            {
                field: 'status',
                headerName: 'Statut',
                width: 120,
                renderCell: ({ value }) => {
                    const cfg = STATUS_CONFIG[value as AnomalyStatus];
                    return <Chip label={cfg.label} color={cfg.color} size="small" variant="outlined" />;
                },
            },
            {
                field: 'description',
                headerName: 'Description',
                flex: 1,
                minWidth: 200,
            },
            {
                field: 'actions',
                headerName: 'Action',
                width: 120,
                sortable: false,
                filterable: false,
                renderCell: ({ row }) =>
                    row.status === 'open' || row.status === 'in_review' ? (
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenCorrection(row)}
                        >
                            Corriger
                        </Button>
                    ) : null,
            },
        ],
        [handleOpenCorrection],
    );

    // ── Loading / Error ──
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isError) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                Erreur lors du chargement des anomalies.
            </Alert>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Typography variant="h4" gutterBottom>
                Anomalies
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
                Détection et correction des anomalies de données
            </Typography>

            {/* Stats chips */}
            <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
                <Chip label={`${stats.total} total`} variant="outlined" />
                <Chip label={`${stats.open} ouvertes`} color="error" variant="outlined" />
                <Chip label={`${stats.critical} critiques`} color="warning" variant="outlined" />
            </Stack>

            {/* Severity filter */}
            <Paper elevation={0} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Sévérité</InputLabel>
                    <Select
                        value={severityFilter}
                        label="Sévérité"
                        onChange={(e: SelectChangeEvent) => setSeverityFilter(e.target.value as SeverityFilter)}
                    >
                        <MenuItem value="all">Toutes</MenuItem>
                        <MenuItem value="critical">Critique</MenuItem>
                        <MenuItem value="high">Élevée</MenuItem>
                        <MenuItem value="medium">Moyenne</MenuItem>
                        <MenuItem value="low">Faible</MenuItem>
                    </Select>
                </FormControl>
                <Typography variant="body2" color="text.secondary">
                    {filteredRows.length} anomalie{filteredRows.length > 1 ? 's' : ''} affichée{filteredRows.length > 1 ? 's' : ''}
                </Typography>
            </Paper>

            {/* DataGrid */}
            <Paper elevation={0} sx={{ height: 560 }}>
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    initialState={{
                        sorting: { sortModel: [{ field: 'detectedAt', sort: 'desc' }] },
                        pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    pageSizeOptions={[10, 25, 50]}
                    disableRowSelectionOnClick
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: 'grey.50',
                            fontWeight: 600,
                        },
                        '& .MuiDataGrid-cell': {
                            display: 'flex',
                            alignItems: 'center',
                        },
                    }}
                />
            </Paper>

            {/* Correction Dialog */}
            <CorrectionDialog
                anomaly={selectedAnomaly}
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSubmit={handleCorrection}
                isSubmitting={mutation.isPending}
            />
        </Box>
    );
}
