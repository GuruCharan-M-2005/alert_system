import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import useAuthStore from './store/authStore';
import Login from './components/Login';
import AlertList from './components/AlertList';
import Privacy from './components/Privacy';
import Terms from './components/Terms';
import { getStoredToken, refreshAccessToken, handleRedirectResult } from './services/auth';

export default function App() {
  const { user, setUser, setAccessToken } = useAuthStore();
  const path = window.location.pathname;

  useEffect(() => {
    if (path === '/privacy' || path === '/terms') return;

    async function init() {
      // Step 1 — handle mobile redirect result FIRST before auth listener
      const redirectResult = await handleRedirectResult();
      if (redirectResult?.accessToken) {
        setAccessToken(redirectResult.accessToken);
      }

      // Step 2 — Firebase auth state listener
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser || null);

        if (firebaseUser) {
          // Already got token from redirect above — skip
          if (redirectResult?.accessToken) return;

          // Try sessionStorage first
          const stored = getStoredToken();
          if (stored) {
            setAccessToken(stored);
            return;
          }

          // Desktop only — silent refresh via popup
          const fresh = await refreshAccessToken();
          if (fresh) setAccessToken(fresh);
        }
      });

      return unsubscribe;
    }

    let unsubscribe;
    init().then(fn => { unsubscribe = fn; });
    return () => { if (unsubscribe) unsubscribe(); };
  }, [setUser, setAccessToken, path]);

  if (path === '/privacy') return <Privacy />;
  if (path === '/terms') return <Terms />;

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
