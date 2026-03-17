import { useLocation, useNavigate } from 'react-router-dom';
import {
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Box,
    Divider,
    Chip,
    Collapse,
    Tooltip,
    IconButton,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Storage as StorageIcon,
    BarChart as BarChartIcon,
    Business as BusinessIcon,
    AdminPanelSettings as AdminPanelSettingsIcon,
    ExpandLess,
    ExpandMore,
    ChevronLeft as ChevronLeftIcon,
    LocalHospital,
} from '@mui/icons-material';
import { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import {
    NAV_SECTIONS,
    isRoleAllowed,
    type NavItem,
    type NavGroupSection,
    type NavLeafSection,
} from '@/lib/nav.constants';
import { ROLE_LABELS } from '@/types';


const ICON_MAP: Record<string, React.ReactNode> = {
    Dashboard: <DashboardIcon />,
    Storage: <StorageIcon />,
    BarChart: <BarChartIcon />,
    Business: <BusinessIcon />,
    AdminPanelSettings: <AdminPanelSettingsIcon />,
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SidebarProps {
    open: boolean;
    width: number;
    collapsedWidth: number;
    onToggle: () => void;
    /** 'permanent' (desktop) or 'temporary' (mobile overlay) */
    variant?: 'permanent' | 'temporary';
    /** Called when the temporary drawer should close (backdrop click) */
    onClose?: () => void;
}

// ---------------------------------------------------------------------------
// Type narrows
// ---------------------------------------------------------------------------

function isGroup(item: NavItem): item is NavGroupSection {
    return 'children' in item;
}


export default function Sidebar({ open, width, collapsedWidth, onToggle, variant = 'permanent', onClose }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);

    // Pre-expand sections that contain the currently active route
    const initialExpanded = useMemo<Set<string>>(() => {
        const active = new Set<string>(['data', 'analytics']);
        NAV_SECTIONS.forEach((section) => {
            if (isGroup(section)) {
                const childIsActive = section.children.some((c) => location.pathname === c.path);
                if (childIsActive) active.add(section.key);
            }
        });
        return active;
    }, []);

    const [expandedSections, setExpandedSections] = useState<Set<string>>(initialExpanded);

    /** Sections filtered by current user's role */
    const visibleSections = useMemo(() => {
        if (!user) return [];
        return NAV_SECTIONS.filter((section) => isRoleAllowed(user.role_type, section.roles));
    }, [user]);

    const toggleSection = (key: string) => {
        setExpandedSections((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const isActivePath = (path: string) => location.pathname === path;

    const currentWidth = open ? width : collapsedWidth;

    // Shared active-item styles
    const activeItemSx = {
        borderRadius: 1,
        mb: 0.5,
        '&.Mui-selected': {
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
            '& .MuiListItemIcon-root': { color: 'white' },
        },
    };

    const isTemporary = variant === 'temporary';
    const drawerWidth = isTemporary ? width : currentWidth;

    return (
        <Drawer
            variant={variant}
            open={isTemporary ? open : undefined}
            onClose={onClose}
            sx={{
                width: isTemporary ? 0 : currentWidth,
                flexShrink: 0,
                transition: 'width 0.25s',
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                    transition: 'width 0.25s',
                },
            }}
        >
            <Box
                component="nav"
                aria-label="Navigation principale"
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
                {/* ── Brand ─────────────────────────────────────────────── */}
                <Box
                    sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: open ? 'space-between' : 'center',
                        minHeight: 64,
                    }}
                >
                    {open && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocalHospital color="primary" fontSize="small" />
                            <Typography variant="h6" fontWeight={700} noWrap color="primary.main">
                                HealthAI
                            </Typography>
                        </Box>
                    )}
                    <Tooltip title={open ? 'Réduire' : 'Agrandir'} placement="right">
                        <IconButton
                            onClick={onToggle}
                            size="small"
                            aria-label={open ? 'Réduire le menu' : 'Agrandir le menu'}
                        >
                            <ChevronLeftIcon
                                sx={{ transform: open ? 'none' : 'rotate(180deg)', transition: '0.25s' }}
                            />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Divider />

                {/* ── Role badge (expanded only) ─────────────────────────── */}
                {user && open && (
                    <Box sx={{ px: 2, py: 1.5 }}>
                        <Chip
                            label={ROLE_LABELS[user.role_type]}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 600, fontSize: '0.7rem', maxWidth: '100%' }}
                        />
                    </Box>
                )}

                {/* ── Nav items ─────────────────────────────────────────── */}
                <List sx={{ flexGrow: 1, px: 1, py: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                    {visibleSections.map((section) => {
                        const icon = ICON_MAP[section.icon] ?? <DashboardIcon />;

                        // ── Leaf item (no children) ──────────────────────
                        if (!isGroup(section)) {
                            const leaf = section as NavLeafSection;
                            return (
                                <Tooltip
                                    key={section.key}
                                    title={!open ? section.label : ''}
                                    placement="right"
                                >
                                    <ListItemButton
                                        selected={isActivePath(leaf.path)}
                                        onClick={() => navigate(leaf.path)}
                                        sx={{
                                            ...activeItemSx,
                                            minHeight: 44,
                                            justifyContent: open ? 'initial' : 'center',
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{ minWidth: open ? 40 : 'unset', justifyContent: 'center' }}
                                        >
                                            {icon}
                                        </ListItemIcon>
                                        {open && <ListItemText primary={section.label} />}
                                    </ListItemButton>
                                </Tooltip>
                            );
                        }

                        // ── Group section (with children) ────────────────
                        const group = section as NavGroupSection;
                        const isExpanded = expandedSections.has(section.key);
                        const hasActiveChild = group.children.some((c) => isActivePath(c.path));

                        // Filter children by role
                        const visibleChildren = user
                            ? group.children.filter((c) => isRoleAllowed(user.role_type, c.roles))
                            : [];

                        if (visibleChildren.length === 0) return null;

                        return (
                            <Box key={section.key}>
                                {/* Section header */}
                                <Tooltip title={!open ? section.label : ''} placement="right">
                                    <ListItemButton
                                        onClick={() =>
                                            open
                                                ? toggleSection(section.key)
                                                : navigate(visibleChildren[0].path)
                                        }
                                        sx={{
                                            borderRadius: 1,
                                            mb: 0.5,
                                            minHeight: 44,
                                            justifyContent: open ? 'initial' : 'center',
                                            bgcolor: hasActiveChild && !open ? 'action.selected' : undefined,
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{ minWidth: open ? 40 : 'unset', justifyContent: 'center' }}
                                        >
                                            {icon}
                                        </ListItemIcon>
                                        {open && (
                                            <>
                                                <ListItemText
                                                    primary={section.label}
                                                    primaryTypographyProps={{
                                                        fontWeight: hasActiveChild ? 600 : 400,
                                                    }}
                                                />
                                                {isExpanded ? <ExpandLess /> : <ExpandMore />}
                                            </>
                                        )}
                                    </ListItemButton>
                                </Tooltip>

                                {/* Children — visible only when sidebar is open */}
                                <Collapse in={open && isExpanded} timeout="auto" unmountOnExit>
                                    <List disablePadding>
                                        {visibleChildren.map((child) => (
                                            <ListItemButton
                                                key={child.path}
                                                selected={isActivePath(child.path)}
                                                onClick={() => navigate(child.path)}
                                                sx={{ ...activeItemSx, pl: 4 }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 32 }} />
                                                <ListItemText
                                                    primary={child.label}
                                                    primaryTypographyProps={{ variant: 'body2' }}
                                                />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </Collapse>
                            </Box>
                        );
                    })}
                </List>
            </Box>
        </Drawer>
    );
}

