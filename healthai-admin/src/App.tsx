import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getTheme } from '@/theme'
import { router } from '@/routes'
import ErrorBoundary from '@/components/feedback/ErrorBoundary'
import NotificationSnackbar from '@/components/feedback/NotificationSnackbar'
import { useUIStore } from '@/stores/ui.store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  const themeMode = useUIStore((s) => s.themeMode)
  const theme = getTheme(themeMode)

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <RouterProvider router={router} />
          <NotificationSnackbar />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
