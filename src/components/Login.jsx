import { useState } from 'react';
import toast from 'react-hot-toast';
import { login, register, addSubscription } from '../services/api';
import useAuthStore from '../store/authStore';

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  async function handleSubmit() {
    if (!email || !password) { toast.error('Enter email and password'); return; }

    setLoading(true);
    try {
      const fn = isRegister ? register : login;
      const res = await fn(email, password);

      if (!res.success) { toast.error(res.error || 'Something went wrong'); return; }

      setUser(res.user);

      try {
        const player_id = window.OneSignal?.User?.PushSubscription?.id;
        if (player_id && res.user?.id) await addSubscription(res.user.id, player_id);
      } catch (e) { console.warn('subscription sync failed:', e); }

      toast.success(isRegister ? 'Account created!' : 'Welcome back!');
    } catch {
      toast.error('Network error. Try again.');
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
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="auth-divider" />

          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
          </button>

          <button className="btn-ghost" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
