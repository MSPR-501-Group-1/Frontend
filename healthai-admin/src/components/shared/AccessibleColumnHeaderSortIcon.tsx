import { memo } from 'react';
import {
    ArrowDownward as ArrowDownwardIcon,
    ArrowUpward as ArrowUpwardIcon,
    UnfoldMore as UnfoldMoreIcon,
} from '@mui/icons-material';
import { Badge, IconButton, Tooltip } from '@mui/material';
import type { GridColumnHeaderSortIconProps } from '@mui/x-data-grid/components';

const SORT_BUTTON_LABEL = 'Trier la colonne';

function SortIndicator({ direction }: { direction: GridColumnHeaderSortIconProps['direction'] }) {
    if (direction === 'asc') {
        return <ArrowUpwardIcon fontSize="small" className="MuiDataGrid-sortIcon" />;
    }

    if (direction === 'desc') {
        return <ArrowDownwardIcon fontSize="small" className="MuiDataGrid-sortIcon" />;
    }

    return <UnfoldMoreIcon fontSize="small" className="MuiDataGrid-sortIcon" />;
}

function AccessibleColumnHeaderSortIcon({
    direction,
    index,
    disabled,
    className,
    onClick,
    field,
}: GridColumnHeaderSortIconProps) {
    const iconButtonClassName = className
        ? `MuiDataGrid-sortButton ${className}`
        : 'MuiDataGrid-sortButton';

    const iconButton = (
        <IconButton
            size="small"
            aria-label={SORT_BUTTON_LABEL}
            title={SORT_BUTTON_LABEL}
            disabled={disabled}
            onClick={onClick}
            tabIndex={0}
            className={iconButtonClassName}
            data-field={field}
        >
            <SortIndicator direction={direction} />
        </IconButton>
    );

    return (
        <span className="MuiDataGrid-iconButtonContainer">
            <Tooltip title={SORT_BUTTON_LABEL} enterDelay={1000}>
                <span>
                    {index == null ? (
                        iconButton
                    ) : (
                        <Badge badgeContent={index} color="default" overlap="circular">
                            {iconButton}
                        </Badge>
                    )}
                </span>
            </Tooltip>
        </span>
    );
}

export default memo(AccessibleColumnHeaderSortIcon);