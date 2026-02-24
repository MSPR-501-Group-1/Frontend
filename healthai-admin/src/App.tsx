import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from '@/theme'
import LoginPage from '@/features/auth/LoginPage'
import { useAuthStore } from '@/stores/auth.store'

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isAuthenticated ? (
        <div style={{ padding: 32 }}>
          <h1>Dashboard (à venir)</h1>
          <p>Bienvenue, vous êtes connecté.</p>
          <button onClick={() => useAuthStore.getState().logout()}>Se déconnecter</button>
        </div>
      ) : (
        <LoginPage />
      )}
    </ThemeProvider>
  )
}
