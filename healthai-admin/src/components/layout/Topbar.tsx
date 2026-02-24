import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    Avatar,
    Tooltip,
} from '@mui/material';
import { Logout } from '@mui/icons-material';
import { useAuthStore } from '@/stores/auth.store';

interface TopbarProps {
    /** Current sidebar width (full or collapsed) — used to offset the AppBar */
    drawerWidth: number;
}

export default function Topbar({ drawerWidth }: TopbarProps) {
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
                left: `${drawerWidth}px`,
                width: `calc(100% - ${drawerWidth}px)`,
                transition: 'left 0.25s, width 0.25s',
            }}
        >
            <Toolbar>
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
