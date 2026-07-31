import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import useAuthStore from './store/authStore';
import Login from './components/Login';
import AlertList from './components/AlertList';
import Privacy from './components/Privacy';
import Terms from './components/Terms';
import { getStoredToken, silentRefreshToken } from './services/auth';

export default function App() {
  const { user, setUser, setAccessToken } = useAuthStore();
  const [initializing, setInitializing] = useState(true);
  const path = window.location.pathname;

  useEffect(() => {
    if (path === '/privacy' || path === '/terms') {
      setInitializing(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);

      if (firebaseUser) {
        const stored = getStoredToken();
        if (stored) setAccessToken(stored);
      }

      setInitializing(false);
    });

    // Desktop only — refresh token every 50 minutes
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    let refreshInterval;
    if (!isMobile) {
      refreshInterval = setInterval(async () => {
        const token = await silentRefreshToken();
        if (token) setAccessToken(token);
      }, 50 * 60 * 1000);
    }

    return () => {
      unsubscribe();
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [setUser, setAccessToken, path]);

  if (path === '/privacy') return <Privacy />;
  if (path === '/terms') return <Terms />;

  if (initializing) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            borderRadius: '6px',
            border: '1px solid #E2E2E2',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
          }
        }}
      />
      {user ? <AlertList /> : <Login />}
    </>
  );
}
