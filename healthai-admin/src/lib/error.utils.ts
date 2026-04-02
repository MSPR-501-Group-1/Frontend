import type { ApiError } from '@/api';

export const AUTH_REDIRECT_MESSAGE_KEY = 'healthai-auth-feedback';

const NETWORK_ERROR_MESSAGE = 'Impossible de contacter le serveur. Verifiez votre connexion puis reessayez.';
const TIMEOUT_ERROR_MESSAGE = 'Le serveur met trop de temps a repondre. Reessayez dans quelques instants.';

const TECHNICAL_MESSAGES = new Set([
    'Bad Gateway',
    'Gateway Timeout',
    'Service Unavailable',
    'Internal Server Error',
    'Unauthorized',
    'Forbidden',
    'Not Found',
    'Failed to fetch',
    'NetworkError when attempting to fetch resource.',
]);

export function isApiError(value: unknown): value is ApiError {
    return typeof value === 'object'
        && value !== null
        && 'status' in value
        && 'message' in value;
}

function statusFallback(status: number): string | null {
    if (status === 0) return NETWORK_ERROR_MESSAGE;
    if (status === 401) return 'Votre session a expire. Veuillez vous reconnecter.';
    if (status === 403) return 'Acces refuse. Vous n\'avez pas les permissions necessaires.';
    if (status === 408) return TIMEOUT_ERROR_MESSAGE;
    if (status >= 500) return 'Service momentanement indisponible. Reessayez dans quelques instants.';
    return null;
}

/** Convert any thrown error to a user-facing message. */
export function getErrorMessage(error: unknown, fallback = 'Une erreur est survenue.'): string {
    if (isApiError(error)) {
        const rawMessage = typeof error.message === 'string' ? error.message.trim() : '';
        const byStatus = statusFallback(error.status);

        if (!rawMessage) {
            return byStatus ?? fallback;
        }

        if (TECHNICAL_MESSAGES.has(rawMessage)) {
            return byStatus ?? fallback;
        }

        return rawMessage;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
        return TIMEOUT_ERROR_MESSAGE;
    }

    if (error instanceof Error) {
        const message = error.message.trim();
        if (!message || TECHNICAL_MESSAGES.has(message)) {
            return NETWORK_ERROR_MESSAGE;
        }
        return message;
    }

    return fallback;
}
