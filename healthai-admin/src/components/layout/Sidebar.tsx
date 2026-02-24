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
} from '@mui/material';
import {
    Dashboard,
    BugReport,
    Restaurant,
    Security,
    LocalHospital,
} from '@mui/icons-material';

interface SidebarProps {
    open: boolean;
    width: number;
}

const NAV_ITEMS = [
    { label: 'Dashboard', path: '/', icon: <Dashboard /> },
    { label: 'Anomalies', path: '/anomalies', icon: <BugReport /> },
    { label: 'Nutrition', path: '/nutrition', icon: <Restaurant /> },
    { label: 'Audit', path: '/audit', icon: <Security /> },
];

export default function Sidebar({ open, width }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();

    if (!open) return null;

    return (
        <Drawer
            variant="permanent"
            sx={{
                width,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width,
                    boxSizing: 'border-box',
                    borderRight: '1px solid',
                    borderColor: 'divider',
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

            {/* Navigation */}
            <List sx={{ px: 1, pt: 1 }}>
                {NAV_ITEMS.map((item) => {
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
