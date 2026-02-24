import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const DRAWER_WIDTH = 260;

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Skip to content link for accessibility */}
            <a
                href="#main-content"
                style={{
                    position: 'absolute',
                    left: -9999,
                    zIndex: 9999,
                    padding: 8,
                    background: '#fff',
                }}
            >
                Aller au contenu principal
            </a>

            <Sidebar open={sidebarOpen} width={DRAWER_WIDTH} />

            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                }}
            >
                <Topbar
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    sidebarOpen={sidebarOpen}
                    drawerWidth={DRAWER_WIDTH}
                />

                <Box
                    component="main"
                    id="main-content"
                    sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default' }}
                >
                    {/* Spacer to push content below the fixed AppBar */}
                    <Toolbar />
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}
