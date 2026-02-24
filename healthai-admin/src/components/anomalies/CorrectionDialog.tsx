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
    onSubmit: (id: string, correctedValue: string, justification: string) => void;
    isSubmitting: boolean;
}

export default function CorrectionDialog({
    anomaly,
    open,
    onClose,
    onSubmit,
    isSubmitting,
}: CorrectionDialogProps) {
    const [correctedValue, setCorrectedValue] = useState('');
    const [justification, setJustification] = useState('');
    const [touched, setTouched] = useState(false);

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
