import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getAlerts, deleteAlert } from '../services/api';
import useAuthStore from '../store/authStore';
import AlertForm from './AlertForm';
import ChromeBanner from './ChromeBanner';
import { format, isPast, differenceInHours, differenceInMinutes } from 'date-fns';

function getUrgency(scheduled_at) {
  const now = new Date();
  const then = new Date(scheduled_at);
  if (isPast(then)) return 'past';
  const hoursLeft = differenceInHours(then, now);
  if (hoursLeft < 1) return 'urgent';
  if (hoursLeft < 24) return 'soon';
  return 'upcoming';
}

function timeLabel(scheduled_at) {
  const now = new Date();
  const then = new Date(scheduled_at);
  if (isPast(then)) return 'Passed';
  const mins = differenceInMinutes(then, now);
  if (mins < 60) return `in ${mins}m`;
  const hours = differenceInHours(then, now);
  if (hours < 24) return `in ${hours}h`;
  return format(then, 'MMM d, yyyy');
}

export default function AlertList() {
  const { user, logout } = useAuthStore();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const userId = user?.id;

  const fetchAlerts = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await getAlerts(userId);
      if (res.success) setAlerts(res.alerts);
    } catch {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Redirect to login if no user
  if (!user) return null;

  async function handleDelete(alert) {
    if (!window.confirm(`Delete "${alert.title}"?`)) return;
    setDeletingId(alert.id);
    try {
      const res = await deleteAlert(alert.id);
      if (res.success) {
        setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
        toast.success('Alert deleted');
      } else {
        toast.error(res.error || 'Delete failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDeletingId(null);
    }
  }

  function handleSaved() {
    setShowForm(false);
    setEditingAlert(null);
    setLoading(true);
    fetchAlerts();
  }

  const upcoming = alerts.filter((a) => !isPast(new Date(a.scheduled_at)));
  const past = alerts.filter((a) => isPast(new Date(a.scheduled_at)));

  return (
    <div className="app-container">
      {/* Navbar */}
      <header className="navbar">
        <div className="navbar-inner">
          <div className="nav-brand">
            <span className="nav-icon">🔔</span>
            <span className="nav-title">Alertify</span>
          </div>
          <div className="nav-right">
            <span className="nav-email">{user.email}</span>
            <button className="btn-logout" onClick={logout}>Sign out</button>
          </div>
        </div>
      </header>

      <ChromeBanner />

      {/* Main */}
      <main className="main">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Alerts</h1>
            <p className="page-sub">
              {upcoming.length === 0
                ? 'No upcoming alerts'
                : `${upcoming.length} upcoming`}
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + New Alert
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="spinner" />
            <p>Loading alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔕</div>
            <p className="empty-title">No alerts yet</p>
            <p className="empty-sub">Create your first alert to get started</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Create Alert
            </button>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section className="alert-section">
                <h2 className="section-label">Upcoming</h2>
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
                <h2 className="section-label">Past</h2>
                <div className="alert-list">
                  {past.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onEdit={() => { setEditingAlert(alert); setShowForm(true); }}
                      onDelete={() => handleDelete(alert)}
                      deleting={deletingId === alert.id}
                      isPast
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* FAB on mobile */}
      <button className="fab" onClick={() => setShowForm(true)}>+</button>

      {/* Modal */}
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

function AlertCard({ alert, onEdit, onDelete, deleting, isPast }) {
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
        {alert.message && (
          <p className="alert-message">{alert.message}</p>
        )}
        <div className="alert-bottom">
          <span className="alert-time">
            {format(new Date(alert.scheduled_at), 'MMM d, yyyy · h:mm a')}
          </span>
          <div className="alert-actions">
            <button className="action-btn edit" onClick={onEdit}>Edit</button>
            <button
              className="action-btn delete"
              onClick={onDelete}
              disabled={deleting}
            >
              {deleting ? '...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
