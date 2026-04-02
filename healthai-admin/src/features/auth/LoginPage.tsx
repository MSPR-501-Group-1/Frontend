import { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, LocalHospital } from '@mui/icons-material';
import { useAuthStore } from '@/stores/auth.store';
import { AUTH_REDIRECT_MESSAGE_KEY, getErrorMessage } from '@/lib/error.utils';
import { useNotificationStore } from '@/stores/notification.store';

export default function LoginPage() {
    const [email, setEmail] = useState('admin@healthapp.com');
    const [password, setPassword] = useState('AdminPass!');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [sessionMessage, setSessionMessage] = useState('');

    const { login, isLoading } = useAuthStore();
    const { notify } = useNotificationStore();

    useEffect(() => {
        try {
            const message = sessionStorage.getItem(AUTH_REDIRECT_MESSAGE_KEY);
            if (message) {
                setSessionMessage(message);
                notify(message, 'warning');
                sessionStorage.removeItem(AUTH_REDIRECT_MESSAGE_KEY);
            }
        } catch {
            // Ignore session storage access issues in constrained environments.
        }
    }, [notify]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSessionMessage('');

        try {
            await login(email, password);
        } catch (err) {
            const userMessage = getErrorMessage(err, 'Connexion impossible. Veuillez reessayer.');
            setError(userMessage);
            notify(userMessage, 'error');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                p: 2,
            }}
        >
            <Card sx={{ maxWidth: 420, width: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <LocalHospital
                            sx={{ fontSize: 48, color: 'primary.main', mb: 1 }}
                        />
                        <Typography variant="h5" fontWeight={700}>
                            HealthAI Coach
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Interface d'administration
                        </Typography>
                    </Box>

                    {/* Error alert */}
                    {sessionMessage && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            {sessionMessage}
                        </Alert>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Login form */}
                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            fullWidth
                            required
                            autoFocus
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Mot de passe"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                            required
                            sx={{ mb: 3 }}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="Afficher le mot de passe"
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={isLoading}
                            sx={{ py: 1.5 }}
                        >
                            {isLoading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Se connecter'
                            )}
                        </Button>
                    </Box>

                    {/* Dev hint — available mock accounts */}
                    <Alert severity="info" sx={{ mt: 3 }} icon={false}>
                        <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                            <strong>Comptes de démonstration</strong>
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="div">
                            <strong>ADMIN :</strong> admin@healthapp.com - AdminPass!<br />
                            <strong>PREMIUM :</strong> alice.martin@email.com<br />
                            <strong>FREEMIUM :</strong> bob.dupont@email.com<br />
                            <strong>PREMIUM_PLUS :</strong> claire.leroy@email.com<br />
                            <strong>B2B :</strong> david.petit@email.com<br />
                        </Typography>
                    </Alert>
                </CardContent>
            </Card>
        </Box>
    );
}
