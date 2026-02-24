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
} from '@mui/material';
import {
    Dashboard,
    VerifiedUser,
    BugReport,
    Restaurant,
    FitnessCenter,
    MonitorHeart,
    Security,
    LocalHospital,
} from '@mui/icons-material';
import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@/types';

interface SidebarProps {
    open: boolean;
    width: number;
}

interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
    roles?: UserRole[]; // undefined = visible to all authenticated users
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Dashboard', path: '/', icon: <Dashboard /> },
    { label: 'Qualité données', path: '/data-quality', icon: <VerifiedUser /> },
    { label: 'Anomalies', path: '/anomalies', icon: <BugReport /> },
    { label: 'Nutrition', path: '/nutrition', icon: <Restaurant /> },
    { label: 'Fitness', path: '/fitness', icon: <FitnessCenter /> },
    { label: 'Biométrique', path: '/biometric', icon: <MonitorHeart /> },
    { label: 'Audit', path: '/audit', icon: <Security />, roles: [UserRole.ADMIN] },
];

export default function Sidebar({ open, width }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);

    // Filter nav items based on user role
    const visibleItems = NAV_ITEMS.filter(
        (item) => !item.roles || (user && item.roles.includes(user.role))
    );

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: open ? width : 0,
                flexShrink: 0,
                overflow: 'hidden',
                transition: 'width 0.3s',
                '& .MuiDrawer-paper': {
                    width: open ? width : 0,
                    boxSizing: 'border-box',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                    transition: 'width 0.3s',
                },
            }}
        >
            {/* Logo */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalHospital color="primary" />
                <Typography variant="h6" fontWeight={700} noWrap>
                    HealthAI
                </Typography>
            </Box>

            <Divider />

            {/* User role badge */}
            {user && (
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Chip
                        label={user.role.replace('_', ' ').toUpperCase()}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                    />
                </Box>
            )}

            {/* Navigation */}
            <List sx={{ px: 1, pt: 0 }}>
                {visibleItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItemButton
                            key={item.path}
                            selected={isActive}
                            onClick={() => navigate(item.path)}
                            sx={{
                                borderRadius: 1,
                                mb: 0.5,
                                '&.Mui-selected': {
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'primary.dark' },
                                    '& .MuiListItemIcon-root': { color: 'white' },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    );
                })}
            </List>
        </Drawer>
    );
}
