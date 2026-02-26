import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 64;

export default function AppLayout() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

    /** On mobile the sidebar is a temporary overlay; on desktop it's permanent */
    const effectiveWidth = isMobile ? 0 : sidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Skip to content link for accessibility */}
            <Box
                component="a"
                href="#main-content"
                sx={{
                    position: 'absolute',
                    left: '-9999px',
                    zIndex: 9999,
                    p: 1,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    fontWeight: 600,
                    borderRadius: 1,
                    textDecoration: 'none',
                    '&:focus': {
                        left: 8,
                        top: 8,
                    },
                }}
            >
                Aller au contenu principal
            </Box>

            <Sidebar
                open={sidebarOpen}
                width={DRAWER_WIDTH}
                collapsedWidth={COLLAPSED_WIDTH}
                onToggle={() => setSidebarOpen((prev) => !prev)}
                variant={isMobile ? 'temporary' : 'permanent'}
                onClose={() => setSidebarOpen(false)}
            />

            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    transition: 'margin-left 0.25s',
                }}
            >
                <Topbar
                    drawerWidth={effectiveWidth}
                    onMenuClick={() => setSidebarOpen((prev) => !prev)}
                    showMenuButton={isMobile}
                />

                <Box
                    component="main"
                    id="main-content"
                    tabIndex={-1}
                    sx={{
                        flexGrow: 1,
                        p: { xs: 1.5, sm: 2, md: 3 },
                        bgcolor: 'background.default',
                        outline: 'none',
                    }}
                >
                    {/* Spacer to push content below the fixed AppBar */}
                    <Toolbar />
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}
