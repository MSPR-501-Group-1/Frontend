/**
 * Card displaying a single data quality dimension (completeness, freshness, …).
 */

import { Box, Typography, Paper, LinearProgress, Chip } from '@mui/material';
import { STATUS_MUI_COLOR } from '@/lib/status.utils';
import type { KPIStatus } from '@/types';

interface DimensionCardProps {
    label: string;
    score: number;
    description: string;
    status: KPIStatus;
}

export default function DimensionCard({ label, score, description, status }: DimensionCardProps) {
    return (
        <Paper
            elevation={0}
            sx={(theme) => ({
                p: 2.5,
                borderLeft: 4,
                borderColor: theme.palette[STATUS_MUI_COLOR[status]].main,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
            })}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600}>
                    {label}
                </Typography>
                <Chip
                    label={`${score}%`}
                    size="small"
                    sx={(theme) => {
                        const tone = theme.palette[STATUS_MUI_COLOR[status]].main;
                        return {
                            fontWeight: 700,
                            bgcolor: tone,
                            color: theme.palette.getContrastText(tone),
                        };
                    }}
                />
            </Box>
            <LinearProgress
                variant="determinate"
                value={score}
                aria-label={`Progression de ${label} : ${score} sur 100`}
                sx={(theme) => ({
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'grey.100',
                    '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        bgcolor: theme.palette[STATUS_MUI_COLOR[status]].main,
                    },
                })}
            />
            <Typography variant="body2" color="text.secondary">
                {description}
            </Typography>
        </Paper>
    );
}
