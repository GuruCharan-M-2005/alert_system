import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import useAuthStore from './store/authStore';
import Login from './components/Login';
import AlertList from './components/AlertList';

export default function App() {
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    // Firebase Auth listener — persists session automatically
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
    });
    return () => unsubscribe();
  }, [setUser]);

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
