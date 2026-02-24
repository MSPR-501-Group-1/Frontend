/**
 * Consistent page header used across all feature pages.
 *
 * Extracts the repeated pattern of <Typography h4> + <Typography secondary>.
 */

import { Typography, Box } from '@mui/material';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    /** Optional right-aligned actions (filters, buttons, etc.) */
    actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 3,
                flexWrap: 'wrap',
                gap: 2,
            }}
        >
            <Box>
                <Typography variant="h4">{title}</Typography>
                {subtitle && (
                    <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
            {actions}
        </Box>
    );
}
