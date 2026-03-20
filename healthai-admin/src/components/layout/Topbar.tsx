import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    Avatar,
    Tooltip,
} from '@mui/material';
import { Logout, Menu as MenuIcon, DarkMode, LightMode, AccessibilityNew } from '@mui/icons-material';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';

interface TopbarProps {
    /** Current sidebar width (full or collapsed) — used to offset the AppBar */
    drawerWidth: number;
    /** Show the hamburger menu button (mobile) */
    showMenuButton?: boolean;
    /** Toggle sidebar callback */
    onMenuClick?: () => void;
}

export default function Topbar({ drawerWidth, showMenuButton = false, onMenuClick }: TopbarProps) {
    const { user, logout } = useAuthStore();
    const { themeMode, highContrast, toggleTheme, toggleHighContrast } = useUIStore();

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
                {showMenuButton && (
                    <IconButton
                        aria-label="Ouvrir le menu"
                        edge="start"
                        onClick={onMenuClick}
                        sx={{ mr: 1 }}
                    >
                        <MenuIcon />
                    </IconButton>
                )}
                <Box sx={{ flexGrow: 1 }} />

                {/* User info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title={highContrast ? 'Desactiver le contraste eleve' : 'Activer le contraste eleve'}>
                        <IconButton
                            aria-label={highContrast ? 'Desactiver le mode contraste eleve' : 'Activer le mode contraste eleve'}
                            onClick={toggleHighContrast}
                            color={highContrast ? 'secondary' : 'default'}
                        >
                            <AccessibilityNew fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={themeMode === 'light' ? 'Mode sombre' : 'Mode clair'}>
                        <IconButton
                            aria-label={themeMode === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}
                            onClick={toggleTheme}
                        >
                            {themeMode === 'light' ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                    <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                        {user?.first_name} {user?.last_name}
                    </Typography>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {user?.first_name?.[0]}
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
