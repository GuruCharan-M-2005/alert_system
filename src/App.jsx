import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import Login from './components/Login';
import AlertList from './components/AlertList';
import { updatePlayerId } from './services/api';

export default function App() {
  const { user, playerId, setPlayerId } = useAuthStore();

  useEffect(() => {
    if (window.__oneSignalInitialized) return;
    window.__oneSignalInitialized = true;
    initOneSignal();
  }, []);

  async function initOneSignal() {
    
    try {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function (OneSignal) {
        await OneSignal.init({
          appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
          safari_web_id: import.meta.env.VITE_ONESIGNAL_SAFARI_WEB_ID,
          notifyButton: { enable: false },
          allowLocalhostAsSecureOrigin: true,
        });

        // Get id directly — don't wait for change event
        const id = OneSignal.User.PushSubscription.id;
        if (id) {
          setPlayerId(id);
          const storedUser = JSON.parse(localStorage.getItem('alert_user') || 'null');
          if (storedUser?.id) {
            await updatePlayerId(storedUser.id, id);
          }
        }

        // Also listen for future changes
        OneSignal.User.PushSubscription.addEventListener('change', async (event) => {
          const newId = event.current?.id;
          if (newId) {
            setPlayerId(newId);
            const storedUser = JSON.parse(localStorage.getItem('alert_user') || 'null');
            if (storedUser?.id) {
              await updatePlayerId(storedUser.id, newId);
            }
          }
        });
      });
    } catch (err) {
      console.warn('OneSignal init failed:', err);
    }
  }

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            borderRadius: '10px',
            border: '1px solid #E5E5E5',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
          }
        }}
      />
      {user ? <AlertList /> : <Login />}
    </>
  );
}
