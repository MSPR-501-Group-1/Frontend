/**
 * Circular gauge displaying a 0–100 quality score with colour coding.
 *
 * Uses MUI CircularProgress as a lightweight gauge — no extra
 * charting dependency needed for a single arc.
 */

import { Box, Typography, CircularProgress } from '@mui/material';
import { STATUS_HEX, scoreToStatus } from '@/lib/status.utils';

interface ScoreGaugeProps {
    score: number;
    size?: number;
    thickness?: number;
}

export default function ScoreGauge({ score, size = 160, thickness = 6 }: ScoreGaugeProps) {
    const color = STATUS_HEX[scoreToStatus(score)];

    return (
        <Box
            sx={{ position: 'relative', display: 'inline-flex' }}
            role="img"
            aria-label={`Score de qualité des données : ${score} sur 100`}
        >
            {/* Background track */}
            <CircularProgress
                variant="determinate"
                value={100}
                size={size}
                thickness={thickness}
                sx={{ color: 'grey.200' }}
            />
            {/* Foreground arc */}
            <CircularProgress
                variant="determinate"
                value={score}
                size={size}
                thickness={thickness}
                sx={{
                    color,
                    position: 'absolute',
                    left: 0,
                    '& .MuiCircularProgress-circle': { strokeLinecap: 'round' },
                }}
            />
            {/* Centre label */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography variant="h3" fontWeight={800} sx={{ color }}>
                    {score}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    / 100
                </Typography>
            </Box>
        </Box>
    );
}
