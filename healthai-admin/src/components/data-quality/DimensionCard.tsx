/**
 * Card displaying a single data quality dimension (completeness, freshness, …).
 */

import { Box, Typography, Paper, LinearProgress, Chip } from '@mui/material';
import { STATUS_HEX } from '@/lib/status.utils';
import type { KPIStatus } from '@/types';

interface DimensionCardProps {
    label: string;
    score: number;
    description: string;
    status: KPIStatus;
}

export default function DimensionCard({ label, score, description, status }: DimensionCardProps) {
    const color = STATUS_HEX[status];

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderLeft: 4,
                borderColor: color,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600}>
                    {label}
                </Typography>
                <Chip
                    label={`${score}%`}
                    size="small"
                    sx={{ fontWeight: 700, bgcolor: `${color}18`, color }}
                />
            </Box>
            <LinearProgress
                variant="determinate"
                value={score}
                sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'grey.100',
                    '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: color },
                }}
            />
            <Typography variant="body2" color="text.secondary">
                {description}
            </Typography>
        </Paper>
    );
}
