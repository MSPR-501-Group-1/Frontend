import { Card, Typography, Box, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, Remove } from '@mui/icons-material';
import { STATUS_MUI_COLOR } from '@/lib/status.utils';
import type { KPIStatus } from '@/types';

interface KPICardProps {
    label: string;
    value: string | number;
    unit?: string;
    trend?: number;
    status?: KPIStatus;
}

export default function KPICard({ label, value, unit, trend, status = 'success' }: KPICardProps) {
    const trendIcon =
        trend === undefined ? null
            : trend > 0 ? <TrendingUp sx={{ fontSize: 16 }} />
                : trend < 0 ? <TrendingDown sx={{ fontSize: 16 }} />
                    : <Remove sx={{ fontSize: 16 }} />;

    const trendColor: 'success' | 'error' | 'default' =
        trend === undefined ? 'default'
            : trend > 0 ? 'success'
                : trend < 0 ? 'error'
                    : 'default';

    return (
        <Card
            sx={{
                p: 2.5,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: 4,
                borderColor: `${STATUS_MUI_COLOR[status]}.main`,
            }}
        >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {label}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <Typography variant="h4" fontWeight={700}>
                    {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
                </Typography>
                {unit && (
                    <Typography variant="body1" color="text.secondary">
                        {unit}
                    </Typography>
                )}
            </Box>

            {trend !== undefined && (
                <Box sx={{ mt: 1 }}>
                    <Chip
                        icon={trendIcon ?? undefined}
                        label={`${trend > 0 ? '+' : ''}${trend}%`}
                        color={trendColor}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                    />
                </Box>
            )}
        </Card>
    );
}
