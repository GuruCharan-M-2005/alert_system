import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import useAuthStore from './store/authStore';
import Login from './components/Login';
import AlertList from './components/AlertList';
import Privacy from './components/Privacy';
import Terms from './components/Terms';
import { getStoredToken, refreshAccessToken } from './services/auth';

export default function App() {
  const { user, setUser, setAccessToken } = useAuthStore();
  const path = window.location.pathname;

  useEffect(() => {
    if (path === '/privacy' || path === '/terms') return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser || null);

      if (firebaseUser) {
        const stored = getStoredToken();
        if (stored) {
          setAccessToken(stored);
        } else {
          const fresh = await refreshAccessToken();
          if (fresh) setAccessToken(fresh);
        }
      }
    });
    return () => unsubscribe();
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
