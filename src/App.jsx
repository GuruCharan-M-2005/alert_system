import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import useAuthStore from './store/authStore';
import Login from './components/Login';
import AlertList from './components/AlertList';
import Privacy from './components/Privacy';
import Terms from './components/Terms';
import { getStoredToken, handleRedirectResult, silentRefreshToken } from './services/auth';

export default function App() {
  const { user, setUser, setAccessToken } = useAuthStore();
  const [initializing, setInitializing] = useState(true);
  const path = window.location.pathname;

  useEffect(() => {
    if (path === '/privacy' || path === '/terms') {
      setInitializing(false);
      return;
    }

    async function init() {
      // Step 1 — handle redirect result first (mobile)
      const redirectResult = await handleRedirectResult();
      if (redirectResult?.accessToken) {
        setAccessToken(redirectResult.accessToken);
      }

      // Step 2 — now listen to auth state
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser || null);

        if (firebaseUser) {
          if (redirectResult?.accessToken) {
            // Already got token from redirect
          } else {
            const stored = getStoredToken();
            if (stored) setAccessToken(stored);
          }
        }

        // Done initializing — now safe to show Login or AlertList
        setInitializing(false);
      });

      return unsubscribe;
    }

    let unsubscribe;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    let refreshInterval;

    init().then(fn => {
      unsubscribe = fn;
      if (!isMobile) {
        refreshInterval = setInterval(async () => {
          const token = await silentRefreshToken();
          if (token) setAccessToken(token);
        }, 50 * 60 * 1000);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [setUser, setAccessToken, path]);

  if (path === '/privacy') return <Privacy />;
  if (path === '/terms') return <Terms />;

  // Wait until Firebase + redirect result both resolved
  if (initializing) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
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
