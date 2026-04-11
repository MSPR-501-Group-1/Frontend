/**
 * Correction dialog for anomaly resolution workflow.
 *
 * Extracted from AnomaliesPage to follow Single Responsibility:
 * - This component owns the form state and validation logic.
 * - The parent only provides the anomaly + callbacks.
 */

import { useState, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Alert,
    Box,
    Stack,
    CircularProgress,
} from '@mui/material';
import type { Anomaly } from '@/types';

export interface CorrectionDialogProps {
    anomaly: Anomaly | null;
    open: boolean;
    onClose: () => void;
    onSubmit: (id: string, resolutionAction: string) => void;
    isSubmitting: boolean;
}

export default function CorrectionDialog({
    anomaly,
    open,
    onClose,
    onSubmit,
    isSubmitting,
}: CorrectionDialogProps) {
    const [resolutionAction, setResolutionAction] = useState('');
    const [touched, setTouched] = useState(false);

    const handleEnter = useCallback(() => {
        setResolutionAction('');
        setTouched(false);
    }, []);

    const trimmedAction = resolutionAction.trim();
    const isTooLong = trimmedAction.length > 50;
    const isValid = trimmedAction.length > 0 && !isTooLong;

    const handleSubmit = () => {
        setTouched(true);
        if (!anomaly || !isValid) return;
        onSubmit(anomaly.id, trimmedAction);
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
                            label="Action de resolution"
                            value={resolutionAction}
                            onChange={(e) => setResolutionAction(e.target.value)}
                            error={(touched && trimmedAction.length === 0) || isTooLong}
                            helperText={
                                touched && trimmedAction.length === 0
                                    ? 'Obligatoire'
                                    : isTooLong
                                        ? 'Maximum 50 caracteres'
                                        : `${trimmedAction.length}/50 caracteres`
                            }
                            required
                            fullWidth
                            multiline
                            minRows={2}
                            slotProps={{ htmlInput: { maxLength: 120 } }}
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
