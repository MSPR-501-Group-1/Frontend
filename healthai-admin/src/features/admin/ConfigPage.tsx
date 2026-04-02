/**
 * ConfigPage — validation rules editor + alert thresholds + system params.
 *
 * Architecture layers:
 *   types/ → mocks/ → services/ → [useQuery/useMutation] → this page
 *
 * Patterns:
 *   - React Query for read, useMutation + cache invalidation for writes
 *   - DataGrid inline toggle for rule enabled/disabled (OCP-friendly)
 *   - Slider-based alert threshold editor
 *   - Notification snackbar on every mutation success (UX feedback)
 */

import { useState, useMemo, useCallback } from 'react';
import {
    Box, Grid, Paper, Typography, Switch, Slider, Button,
    Chip, Card, CardContent, Stack, Divider, FormControlLabel,
} from '@mui/material';
import {
    Save as SaveIcon,
    CheckCircleOutline as CheckIcon,
    WarningAmber as WarningIcon,
    Error as ErrorIcon,
} from '@mui/icons-material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchSystemConfig,
    updateValidationRule,
    toggleAlertThreshold,
    updateSystemParams,
} from '@/services/config.service';
import { LoadingState, ErrorState, PageHeader } from '@/components/feedback';
import { useNotificationStore } from '@/stores/notification.store';
import { getErrorMessage } from '@/lib/error.utils';
import { DataSource } from '@/types';
import type { ValidationRule, AlertThreshold } from '@/types';

// ─── Display config (SRP) ───────────────────────────────────

const SOURCE_LABELS: Record<DataSource, string> = {
    [DataSource.OPEN_FOOD_FACTS]: 'OpenFoodFacts',
    [DataSource.WHO_NUTRITION_DB]: 'WHO Nutrition DB',
    [DataSource.EXERCISE_DB]: 'ExerciseDB',
    [DataSource.USER_WEARABLES]: 'User Wearables',
    [DataSource.ANSES_CIQUAL]: 'ANSES CIQUAL',
};

const RULE_TYPE_LABELS: Record<string, string> = {
    range: 'Plage',
    pattern: 'Pattern',
    required: 'Obligatoire',
    unique: 'Unique',
};

// ─── Query key (DRY: single source of truth) ────────────────

const CONFIG_KEY = ['system-config'] as const;

// ─── Page ───────────────────────────────────────────────────

export default function ConfigPage() {
    const queryClient = useQueryClient();
    const { notify } = useNotificationStore();

    // ── Fetch ──
    const { data: config, isLoading, isError, error } = useQuery({
        queryKey: CONFIG_KEY,
        queryFn: fetchSystemConfig,
    });

    // ── Local state for system params (optimistic edit) ──
    const [localRetention, setLocalRetention] = useState<number | null>(null);
    const [localRefresh, setLocalRefresh] = useState<number | null>(null);

    const retentionDays = localRetention ?? config?.retentionDays ?? 365;
    const refreshInterval = localRefresh ?? config?.refreshInterval ?? 30;

    // ── Mutations (SRP: each mutation handles one concern) ──
    const ruleMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<ValidationRule> }) =>
            updateValidationRule(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONFIG_KEY });
            notify('Règle de validation mise à jour', 'success');
        },
        onError: (mutationError) => notify(getErrorMessage(mutationError, 'Erreur lors de la mise à jour de la règle'), 'error'),
    });

    const thresholdMutation = useMutation({
        mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
            toggleAlertThreshold(id, enabled),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONFIG_KEY });
            notify('Seuil d\'alerte mis à jour', 'success');
        },
        onError: (mutationError) => notify(getErrorMessage(mutationError, 'Erreur lors de la mise à jour du seuil'), 'error'),
    });

    const paramsMutation = useMutation({
        mutationFn: ({ ret, ref }: { ret: number; ref: number }) =>
            updateSystemParams(ret, ref),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONFIG_KEY });
            notify('Paramètres système enregistrés', 'success');
        },
        onError: (mutationError) => notify(getErrorMessage(mutationError, 'Erreur lors de l\'enregistrement'), 'error'),
    });

    // ── Handlers ──
    const handleRuleToggle = useCallback((id: string, enabled: boolean) => {
        ruleMutation.mutate({ id, updates: { enabled } });
    }, [ruleMutation]);

    const handleThresholdToggle = useCallback((id: string, enabled: boolean) => {
        thresholdMutation.mutate({ id, enabled });
    }, [thresholdMutation]);

    const handleSaveParams = useCallback(() => {
        paramsMutation.mutate({ ret: retentionDays, ref: refreshInterval });
    }, [paramsMutation, retentionDays, refreshInterval]);

    // ── DataGrid columns for validation rules ──
    const ruleColumns: GridColDef<ValidationRule>[] = useMemo(() => [
        { field: 'field', headerName: 'Champ', width: 180 },
        {
            field: 'source',
            headerName: 'Source',
            width: 150,
            valueFormatter: (v: DataSource) => SOURCE_LABELS[v] || v,
        },
        {
            field: 'type',
            headerName: 'Type',
            width: 110,
            renderCell: ({ value }) => (
                <Chip
                    label={RULE_TYPE_LABELS[value as string] || value}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                />
            ),
        },
        {
            field: 'minValue',
            headerName: 'Min',
            width: 80,
            valueFormatter: (v: number | undefined) => v !== undefined ? v.toLocaleString('fr-FR') : '—',
        },
        {
            field: 'maxValue',
            headerName: 'Max',
            width: 80,
            valueFormatter: (v: number | undefined) => v !== undefined ? v.toLocaleString('fr-FR') : '—',
        },
        {
            field: 'pattern',
            headerName: 'Pattern',
            width: 160,
            valueFormatter: (v: string | undefined) => v || '—',
        },
        { field: 'description', headerName: 'Description', flex: 1, minWidth: 250 },
        {
            field: 'enabled',
            headerName: 'Activée',
            width: 100,
            renderCell: ({ row }) => (
                <Switch
                    checked={row.enabled}
                    onChange={(_, checked) => handleRuleToggle(row.id, checked)}
                    size="small"
                    slotProps={{ input: { 'aria-label': `Activer la règle ${row.field}` } }}
                />
            ),
        },
    ], [handleRuleToggle]);

    // ── Loading / Error ──
    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState message={getErrorMessage(error, 'Erreur lors du chargement de la configuration.')} />;
    if (!config) return null;

    return (
        <Box>
            <PageHeader
                title="Configuration"
                subtitle="Paramétrage système : règles de validation, seuils d'alerte et paramètres globaux"
            />

            {/* ── Section 1: Validation Rules ── */}
            <Typography variant="h5" sx={{ mb: 2 }}>
                Règles de validation physiologique
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Définissez les plages de valeurs acceptables pour chaque indicateur de santé.
                Les données hors plage seront signalées comme anomalies.
            </Typography>
            <Paper elevation={0} sx={{ height: 440, mb: 4 }}>
                <DataGrid
                    rows={config.validationRules}
                    columns={ruleColumns}
                    aria-label="Tableau des règles de validation physiologique"
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    pageSizeOptions={[10, 25]}
                    disableRowSelectionOnClick
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: 'action.hover',
                            fontWeight: 600,
                        },
                        '& .MuiDataGrid-cell': {
                            display: 'flex',
                            alignItems: 'center',
                        },
                    }}
                />
            </Paper>

            {/* ── Section 2: Alert Thresholds ── */}
            <Typography variant="h5" sx={{ mb: 2 }}>
                Seuils d'alerte
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Configurez les niveaux d'avertissement et critique pour les métriques de surveillance.
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {config.alertThresholds.map((threshold) => (
                    <Grid key={threshold.id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <AlertThresholdCard
                            threshold={threshold}
                            onToggle={handleThresholdToggle}
                        />
                    </Grid>
                ))}
            </Grid>

            <Divider sx={{ mb: 4 }} />

            {/* ── Section 3: System Parameters ── */}
            <Typography variant="h5" sx={{ mb: 2 }}>
                Paramètres système
            </Typography>
            <Paper elevation={0} sx={{ p: 3, maxWidth: 600 }}>
                <Stack spacing={4}>
                    {/* Retention */}
                    <Box>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            Rétention des données
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Durée de conservation des données avant archivage automatique.
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Slider
                                value={retentionDays}
                                onChange={(_, v) => setLocalRetention(v as number)}
                                min={30}
                                max={730}
                                step={30}
                                valueLabelDisplay="auto"
                                valueLabelFormat={(v) => `${v} jours`}
                                marks={[
                                    { value: 30, label: '30j' },
                                    { value: 365, label: '1 an' },
                                    { value: 730, label: '2 ans' },
                                ]}
                                aria-label="Rétention des données en jours"
                            />
                            <Typography variant="body1" fontWeight={600} sx={{ minWidth: 80, textAlign: 'right' }}>
                                {retentionDays} jours
                            </Typography>
                        </Stack>
                    </Box>

                    {/* Refresh interval */}
                    <Box>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            Intervalle de rafraîchissement
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Fréquence de rechargement automatique des données du dashboard.
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Slider
                                value={refreshInterval}
                                onChange={(_, v) => setLocalRefresh(v as number)}
                                min={5}
                                max={120}
                                step={5}
                                valueLabelDisplay="auto"
                                valueLabelFormat={(v) => `${v}s`}
                                marks={[
                                    { value: 5, label: '5s' },
                                    { value: 30, label: '30s' },
                                    { value: 60, label: '1min' },
                                    { value: 120, label: '2min' },
                                ]}
                                aria-label="Intervalle de rafraîchissement en secondes"
                            />
                            <Typography variant="body1" fontWeight={600} sx={{ minWidth: 80, textAlign: 'right' }}>
                                {refreshInterval}s
                            </Typography>
                        </Stack>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveParams}
                        disabled={paramsMutation.isPending}
                        sx={{ alignSelf: 'flex-start' }}
                    >
                        {paramsMutation.isPending ? 'Enregistrement…' : 'Enregistrer les paramètres'}
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
}

// ─── AlertThresholdCard (SRP: extracted sub-component) ──────

interface AlertThresholdCardProps {
    threshold: AlertThreshold;
    onToggle: (id: string, enabled: boolean) => void;
}

function AlertThresholdCard({ threshold, onToggle }: AlertThresholdCardProps) {
    return (
        <Card
            sx={{
                height: '100%',
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: threshold.enabled ? 'divider' : 'grey.400',
                bgcolor: threshold.enabled ? 'background.paper' : 'grey.50',
            }}
        >
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                    <Typography variant="subtitle1" component="p" fontWeight={600}>
                        {threshold.metric}
                    </Typography>
                    <FormControlLabel
                        label=""
                        sx={{ m: 0 }}
                        control={
                            <Switch
                                checked={threshold.enabled}
                                onChange={(_, checked) => onToggle(threshold.id, checked)}
                                size="small"
                                slotProps={{ input: { 'aria-label': `Activer le seuil ${threshold.metric}` } }}
                            />
                        }
                    />
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {threshold.description}
                </Typography>

                <Stack direction="row" spacing={1}>
                    <Chip
                        icon={<WarningIcon sx={{ fontSize: 16 }} />}
                        label={`Warning : ${threshold.warningLevel}`}
                        color="warning"
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                    />
                    <Chip
                        icon={<ErrorIcon sx={{ fontSize: 16 }} />}
                        label={`Critique : ${threshold.criticalLevel}`}
                        color="error"
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                    />
                </Stack>

                <Box sx={{ mt: 1.5 }}>
                    <Chip
                        icon={threshold.enabled ? <CheckIcon sx={{ fontSize: 16 }} /> : undefined}
                        label={threshold.enabled ? 'Actif' : 'Désactivé'}
                        color={threshold.enabled ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                    />
                </Box>
            </CardContent>
        </Card>
    );
}
