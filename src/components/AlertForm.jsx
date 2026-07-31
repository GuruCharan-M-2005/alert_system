import { useState } from 'react';
import toast from 'react-hot-toast';
import { createAlert, updateAlert } from '../services/firestore';
import { createTask, deleteTask } from '../services/tasks';
import useAuthStore from '../store/authStore';
import { format } from 'date-fns';

function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function AlertForm({ alert, onClose, onSaved }) {
  const { user, accessToken } = useAuthStore();
  const isEdit = !!alert;

  const [title, setTitle] = useState(alert?.title || '');
  const [message, setMessage] = useState(alert?.message || '');
  const [scheduledAt, setScheduledAt] = useState(
    alert?.scheduled_at
      ? format(new Date(alert.scheduled_at), "yyyy-MM-dd'T'HH:mm")
      : ''
  );
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!scheduledAt) { toast.error('Pick a date and time'); return; }

    const scheduled = new Date(scheduledAt);
    if (scheduled <= new Date()) { toast.error('Schedule must be in the future'); return; }

    if (!accessToken) {
      toast.error(
        isMobile()
          ? 'Session expired — sign out and sign in again.'
          : 'Session expired — signing you back in…',
        { duration: 4000 }
      );
      if (!isMobile()) {
        // Desktop — try silent refresh
        const { silentRefreshToken } = await import('../services/auth');
        const token = await silentRefreshToken();
        if (token) {
          useAuthStore.getState().setAccessToken(token);
        } else {
          return;
        }
      } else {
        return;
      }
    }

    setLoading(true);
    try {
      const scheduled_at = scheduled.toISOString();

      if (isEdit) {
        // Always delete old task and create fresh one
        // (user may have deleted it manually from Google Tasks)
        try {
          await deleteTask(accessToken, {
            list_id: alert.list_id,
            task_id: alert.task_id
          });
        } catch (e) {
          // Ignore — task may already be deleted
        }

        const { task_id, list_id } = await createTask(accessToken, {
          title: title.trim(),
          message: message.trim(),
          scheduled_at
        });

        await updateAlert(alert.id, {
          title: title.trim(),
          message: message.trim(),
          scheduled_at,
          task_id,
          list_id
        });

        toast.success('Alert updated');
      } else {
        // Create Google Task
        const { task_id, list_id } = await createTask(accessToken, {
          title: title.trim(),
          message: message.trim(),
          scheduled_at
        });

        // Save to Firestore
        await createAlert(user.uid, {
          title: title.trim(),
          message: message.trim(),
          scheduled_at,
          task_id,
          list_id
        });

        toast.success('Alert created');
      }

      onSaved();
    } catch (err) {
      console.error(err);
      if (err.message === 'TOKEN_EXPIRED') {
        toast.error('Session expired — please sign out and sign in again.');
      } else {
        toast.error('Failed to save. Try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  const tokenMissing = !accessToken;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit alert' : 'New alert'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {tokenMissing && (
            <div className="reauth-notice">
              <span>⚠️ Session expired.</span>
              <span>Sign out and sign in again to continue.</span>
            </div>
          )}
          <div className="field">
            <label>Title</label>
            <input
              type="text"
              placeholder="e.g. Team standup"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="field">
            <label>Message <span className="optional">(optional)</span></label>
            <textarea
              placeholder="Any extra details…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="field">
            <label>When</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create alert'}
          </button>
        </div>
      </div>
    </div>
  );
}
