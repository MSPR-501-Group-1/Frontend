import { useState } from 'react';
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

export default function LoginPage() {
    const [email, setEmail] = useState('admin@healthapp.com');
    const [password, setPassword] = useState('AdminPass!');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const { login, isLoading } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await login(email, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur de connexion');
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
                            <strong>ADMIN :</strong> admin@healthapp.com<br />
                            <strong>PREMIUM :</strong> alice.martin@email.com<br />
                            <strong>FREEMIUM :</strong> bob.dupont@email.com<br />
                            <strong>PREMIUM_PLUS :</strong> claire.leroy@email.com<br />
                            <strong>B2B :</strong> david.petit@email.com<br />
                            Mot de passe mock : <em>libre (non vérifié en mode mock)</em>
                        </Typography>
                    </Alert>
                </CardContent>
            </Card>
        </Box>
    );
}
