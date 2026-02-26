/**
 * Global notification snackbar — renders the latest notification
 * from the notification store as a MUI Snackbar + Alert.
 *
 * Mounted once in App.tsx; any component can trigger via:
 *   useNotificationStore.getState().notify('message', 'success');
 */

import { Snackbar, Alert } from '@mui/material';
import { useNotificationStore } from '@/stores/notification.store';

const AUTO_HIDE_DURATION = 4000;

export default function NotificationSnackbar() {
    const notification = useNotificationStore((s) => s.notification);
    const dismiss = useNotificationStore((s) => s.dismiss);

    return (
        <Snackbar
            open={notification !== null}
            autoHideDuration={AUTO_HIDE_DURATION}
            onClose={dismiss}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
            {notification ? (
                <Alert
                    onClose={dismiss}
                    severity={notification.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            ) : undefined}
        </Snackbar>
    );
}
