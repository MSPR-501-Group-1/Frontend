import { useState, useMemo } from 'react';
import { subDays } from 'date-fns';
import type { DateRange, TimeSeriesPoint } from '@/types';

const RANGE_DAYS: Record<DateRange, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
};

/**
 * Hook to manage a date range selector and filter time series data.
 * Follows the custom hook pattern: encapsulates state + derived data.
 */
export function useDateRange(data: TimeSeriesPoint[], defaultRange: DateRange = '30d') {
    const [range, setRange] = useState<DateRange>(defaultRange);

    const filteredData = useMemo(() => {
        const days = RANGE_DAYS[range];
        const cutoff = subDays(new Date(), days);
        return data.filter((point) => new Date(point.date) >= cutoff);
    }, [data, range]);

    return { range, setRange, filteredData } as const;
}
