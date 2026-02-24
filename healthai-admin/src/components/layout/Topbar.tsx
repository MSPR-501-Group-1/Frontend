import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    Avatar,
    Tooltip,
} from '@mui/material';
import { Menu as MenuIcon, Logout } from '@mui/icons-material';
import { useAuthStore } from '@/stores/auth.store';

interface TopbarProps {
    onToggleSidebar: () => void;
    sidebarOpen: boolean;
    drawerWidth: number;
}

export default function Topbar({ onToggleSidebar, sidebarOpen, drawerWidth }: TopbarProps) {
    const { user, logout } = useAuthStore();

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                bgcolor: 'background.paper',
                color: 'text.primary',
                borderBottom: '1px solid',
                borderColor: 'divider',
                left: sidebarOpen ? `${drawerWidth}px` : 0,
                width: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
                transition: 'left 0.3s, width 0.3s',
            }}
        >
            <Toolbar>
                <IconButton
                    aria-label="Toggle sidebar"
                    onClick={onToggleSidebar}
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>

                <Typography variant="h6" sx={{ flexGrow: 1 }} />

                {/* User info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        {user?.firstName} {user?.lastName}
                    </Typography>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {user?.firstName?.[0]}
                    </Avatar>
                    <Tooltip title="Se déconnecter">
                        <IconButton aria-label="Se déconnecter" onClick={logout}>
                            <Logout fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
