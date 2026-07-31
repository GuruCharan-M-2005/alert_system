import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import useAuthStore from './store/authStore';
import Login from './components/Login';
import AlertList from './components/AlertList';
import Privacy from './components/Privacy';
import Terms from './components/Terms';
import { getStoredToken, handleRedirectResult } from './services/auth';

export default function App() {
  const { user, setUser, setAccessToken } = useAuthStore();
  const path = window.location.pathname;

  useEffect(() => {
    if (path === '/privacy' || path === '/terms') return;

    async function init() {
      // Handle mobile redirect result ONLY if a redirect was pending
      const redirectResult = await handleRedirectResult();
      if (redirectResult?.accessToken) {
        setAccessToken(redirectResult.accessToken);
      }

      // Firebase auth state listener
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser || null);

        if (firebaseUser) {
          // Use token from redirect if just captured
          if (redirectResult?.accessToken) return;

          // Otherwise restore from sessionStorage
          const stored = getStoredToken();
          if (stored) setAccessToken(stored);
          // If no stored token — user needs to sign in again to get Tasks token
          // No silent popup — avoids double tab issue
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
