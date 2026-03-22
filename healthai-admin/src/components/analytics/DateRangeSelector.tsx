import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import type { DateRange } from '@/types';

interface DateRangeSelectorProps {
    value: DateRange;
    onChange: (range: DateRange) => void;
}

const OPTIONS: { value: DateRange; label: string }[] = [
    { value: 'all', label: 'Tout' },
    { value: '7d', label: '7 jours' },
    { value: '30d', label: '30 jours' },
    { value: '90d', label: '90 jours' },
];

export default function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
    const handleChange = (_: React.MouseEvent<HTMLElement>, newValue: DateRange | null) => {
        if (newValue !== null) {
            onChange(newValue);
        }
    };

    return (
        <ToggleButtonGroup
            value={value}
            exclusive
            onChange={handleChange}
            size="small"
            aria-label="Sélecteur de période"
        >
            {OPTIONS.map((opt) => (
                <ToggleButton
                    key={opt.value}
                    value={opt.value}
                    sx={{
                        px: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                    }}
                >
                    {opt.label}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
}
