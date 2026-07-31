import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getAlerts, deleteAlert } from '../services/firestore';
import { deleteTask } from '../services/tasks';
import { logOut } from '../services/auth';
import useAuthStore from '../store/authStore';
import AlertForm from './AlertForm';
import ChromeBanner from './ChromeBanner';
import { format, isPast, differenceInHours, differenceInMinutes } from 'date-fns';

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

function getUrgency(scheduled_at) {
  const now = new Date();
  const then = new Date(scheduled_at);
  if (isPast(then)) return 'past';
  const h = differenceInHours(then, now);
  if (h < 1) return 'urgent';
  if (h < 24) return 'soon';
  return 'upcoming';
}

function timeLabel(scheduled_at) {
  const now = new Date();
  const then = new Date(scheduled_at);
  if (isPast(then)) return 'PASSED';
  const mins = differenceInMinutes(then, now);
  if (mins < 60) return `${mins}m`;
  const hours = differenceInHours(then, now);
  if (hours < 24) return `${hours}h`;
  return format(then, 'MMM d');
}

export default function AlertList() {
  const { user, accessToken, logout } = useAuthStore();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const userId = user?.uid;

  const fetchAlerts = useCallback(async (silent = false) => {
    if (!userId) return;
    try {
      const data = await getAlerts(userId);
      setAlerts(data);
    } catch {
      if (!silent) toast.error('Failed to load alerts');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [userId]);

  // First load
  useEffect(() => { fetchAlerts(false); }, [fetchAlerts]);

  // Background poll every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchAlerts(true), 3000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  if (!user) return null;

  async function handleDelete(alert) {
    if (!window.confirm(`Delete "${alert.title}"?`)) return;
    setDeletingId(alert.id);
    try {
      // Delete from Google Tasks
      if (accessToken && alert.task_id && alert.list_id) {
        await deleteTask(accessToken, {
          list_id: alert.list_id,
          task_id: alert.task_id
        });
      }
      // Delete from Firestore
      await deleteAlert(alert.id);
      setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
      toast.success('Alert deleted');
    } catch (err) {
      if (err.message === 'TOKEN_EXPIRED') {
        toast.error('Session expired — please sign out and sign in again.');
      } else {
        toast.error('Delete failed');
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function handleLogout() {
    await logOut();
    logout();
  }

  function handleSaved() {
    setShowForm(false);
    setEditingAlert(null);
    fetchAlerts(true);
  }

  const upcoming = alerts.filter((a) => !isPast(new Date(a.scheduled_at)));
  const past = alerts.filter((a) => isPast(new Date(a.scheduled_at)));

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="navbar-inner">
          <div className="nav-brand">
            <div className="nav-logo-mark"><BellIcon /></div>
            <span className="nav-title">Alertify</span>
          </div>
          <div className="nav-right">
            {user.photoURL && (
              <img src={user.photoURL} alt="avatar" className="nav-avatar" />
            )}
            <span className="nav-email">{user.displayName || user.email}</span>
            <button className="btn-logout" onClick={handleLogout}>Sign out</button>
          </div>
        </div>
      </header>

      <ChromeBanner />

      <main className="main">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Alerts</h1>
            <p className="page-sub">
              {upcoming.length === 0 ? '0 upcoming' : `${upcoming.length} upcoming`}
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + New alert
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="spinner" />
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading…</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔕</div>
            <p className="empty-title">No alerts yet</p>
            <p className="empty-sub">Create your first alert to get started</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              + New alert
            </button>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section className="alert-section">
                <div className="section-label">Upcoming — {upcoming.length}</div>
                <div className="alert-list">
                  {upcoming.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onEdit={() => { setEditingAlert(alert); setShowForm(true); }}
                      onDelete={() => handleDelete(alert)}
                      deleting={deletingId === alert.id}
                    />
                  ))}
                </div>
              </section>
            )}
            {past.length > 0 && (
              <section className="alert-section">
                <div className="section-label">Past — {past.length}</div>
                <div className="alert-list">
                  {past.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onEdit={() => { setEditingAlert(alert); setShowForm(true); }}
                      onDelete={() => handleDelete(alert)}
                      deleting={deletingId === alert.id}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <button className="fab" onClick={() => setShowForm(true)}>+</button>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo-mark"><BellIcon /></div>
            <span className="footer-name">Alertify</span>
          </div>
          <div className="footer-links">
            <a href="/privacy" className="footer-link">Privacy</a>
            <span className="footer-sep">·</span>
            <a href="/terms" className="footer-link">Terms</a>
          </div>
        </div>
      </footer>

      {(showForm || editingAlert) && (
        <AlertForm
          alert={editingAlert}
          onClose={() => { setShowForm(false); setEditingAlert(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

function AlertCard({ alert, onEdit, onDelete, deleting }) {
  const urgency = getUrgency(alert.scheduled_at);
  const label = timeLabel(alert.scheduled_at);

  return (
    <div className={`alert-card ${urgency}`}>
      <div className="alert-bar" />
      <div className="alert-content">
        <div className="alert-top">
          <span className="alert-title">{alert.title}</span>
          <span className={`alert-badge ${urgency}`}>{label}</span>
        </div>
        {alert.message && <p className="alert-message">{alert.message}</p>}
        <div className="alert-bottom">
          <span className="alert-time">
            {format(new Date(alert.scheduled_at), 'MMM d, yyyy · HH:mm')}
          </span>
          <div className="alert-actions">
            <button className="action-btn edit" onClick={onEdit}>Edit</button>
            <button className="action-btn delete" onClick={onDelete} disabled={deleting}>
              {deleting ? '…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
