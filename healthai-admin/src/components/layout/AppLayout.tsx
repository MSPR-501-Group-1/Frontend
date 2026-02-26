import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 64;

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

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
                    drawerWidth={sidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH}
                />

                <Box
                    component="main"
                    id="main-content"
                    tabIndex={-1}
                    sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default', outline: 'none' }}
                >
                    {/* Spacer to push content below the fixed AppBar */}
                    <Toolbar />
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}
