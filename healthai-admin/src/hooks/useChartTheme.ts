/**
 * Hook providing theme-aware chart styling constants.
 *
 * Recharts doesn't consume MUI theme directly, so this hook
 * bridges the two by returning colours that match the current
 * palette mode (light/dark).
 */

import { useTheme } from '@mui/material/styles';

export function useChartTheme() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return {
        axisTickFill: isDark ? '#94A3B8' : '#94A3B8',
        axisLineStroke: isDark ? '#334155' : '#E2E8F0',
        gridStroke: isDark ? '#334155' : '#E2E8F0',
        tooltipBg: isDark ? '#1E293B' : '#FFFFFF',
        tooltipBorder: isDark ? '#334155' : '#E2E8F0',
    } as const;
}
