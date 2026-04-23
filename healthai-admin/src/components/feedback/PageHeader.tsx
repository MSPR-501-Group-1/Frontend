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
    /** Optional id for heading association */
    titleId?: string;
    /** Optional id for subtitle association */
    subtitleId?: string;
    /** Heading element, defaults to h1 for page title semantics */
    titleComponent?: React.ElementType;
}

export default function PageHeader({
    title,
    subtitle,
    actions,
    titleId,
    subtitleId,
    titleComponent = 'h1',
}: PageHeaderProps) {
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
                <Typography id={titleId} variant="h4" component={titleComponent}>
                    {title}
                </Typography>
                {subtitle && (
                    <Typography id={subtitleId} color="text.secondary" sx={{ mt: 0.5 }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
            {actions}
        </Box>
    );
}
