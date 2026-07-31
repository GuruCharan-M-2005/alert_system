import { useState } from 'react';
import toast from 'react-hot-toast';
import { signInWithGoogle } from '../services/auth';
import useAuthStore from '../store/authStore';

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
    <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.76-2.7.76-2.08 0-3.84-1.4-4.47-3.29H1.83v2.07A8 8 0 0 0 8.98 17z"/>
    <path fill="#FBBC05" d="M4.51 10.52A4.8 4.8 0 0 1 4.26 9c0-.52.09-1.02.25-1.52V5.41H1.83A8 8 0 0 0 .98 9c0 1.29.31 2.51.85 3.59l2.68-2.07z"/>
    <path fill="#EA4335" d="M8.98 3.58c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 8.98 1a8 8 0 0 0-7.15 4.41l2.68 2.07c.63-1.89 2.39-3.3 4.47-3.3z"/>
  </svg>
);

const steps = [
  { icon: '🔐', text: 'Click "Continue with Google" below' },
  { icon: '⚠️', text: 'Google shows a warning — click "Advanced"' },
  { icon: '→',  text: 'Click "Go to Alertify (unsafe)"' },
  { icon: '☑️', text: 'Check the Google Tasks checkbox' },
  { icon: '✅', text: 'Click "Continue" — you\'re in!' },
];

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const { setAccessToken } = useAuthStore();

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      // On mobile, result is null — redirect is happening, do nothing
      if (!result) return;
      if (result.accessToken) setAccessToken(result.accessToken);
      toast.success(`Welcome, ${result.user.displayName?.split(' ')[0]}!`);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Sign in failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">
            <BellIcon />
          </div>
          <span className="auth-logo-title">Alertify</span>
          <span className="auth-logo-sub">Notifications that actually arrive.</span>
        </div>

        <div className="auth-form">
          {/* First time notice */}
          <div className="auth-notice">
            <button
              className="auth-notice-toggle"
              onClick={() => setShowSteps(!showSteps)}
            >
              <span>⚡ First time? Read this before signing in</span>
              <span>{showSteps ? '▲' : '▼'}</span>
            </button>

            {showSteps && (
              <div className="auth-steps">
                <p className="auth-steps-intro">
                  Google will show an "unverified app" warning — that's normal.
                  Just follow these steps:
                </p>
                <ol className="auth-steps-list">
                  {steps.map((s, i) => (
                    <li key={i} className="auth-step">
                      <span className="auth-step-icon">{s.icon}</span>
                      <span>{s.text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <div className="auth-divider" />

          <button
            className="btn-google"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <span>Signing in…</span>
            ) : (
              <>
                <GoogleIcon />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <p className="auth-note">
            By signing in you agree to our{' '}
            <a href="/privacy" className="auth-link">Privacy Policy</a>
            {' '}and{' '}
            <a href="/terms" className="auth-link">Terms of Service</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
