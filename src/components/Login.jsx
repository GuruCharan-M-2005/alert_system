import { useState } from 'react';
import toast from 'react-hot-toast';
import { login, register, updatePlayerId } from '../services/api';
import useAuthStore from '../store/authStore';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setPlayerId } = useAuthStore();

  async function handleSubmit() {
    if (!email || !password) {
      toast.error('Enter email and password');
      return;
    }

    setLoading(true);
    try {
      const fn = isRegister ? register : login;
      const res = await fn(email, password);

      if (!res.success) {
        toast.error(res.error || 'Something went wrong');
        return;
      }

      setUser(res.user);

      // Read player_id directly from OneSignal at login time
      try {
        const currentPlayerId = window.OneSignal?.User?.PushSubscription?.id;
        if (currentPlayerId) {
          setPlayerId(currentPlayerId);
          await updatePlayerId(res.user.id, currentPlayerId);
        }
      } catch (e) {
        console.warn('player_id sync failed:', e);
      }

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
          <div className="logo-icon">🔔</div>
          <h1 className="logo-title">Alertify</h1>
          <p className="logo-sub">Your alerts, everywhere.</p>
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

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>

          <button
            className="btn-ghost"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister
              ? 'Already have an account? Sign in'
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
