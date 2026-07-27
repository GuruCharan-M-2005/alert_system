import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createAlert, editAlert } from '../services/api';
import useAuthStore from '../store/authStore';
import { format } from 'date-fns';

export default function AlertForm({ alert, onClose, onSaved }) {
  const { user, playerId } = useAuthStore();
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
    if (scheduled <= new Date()) {
      toast.error('Schedule must be in the future');
      return;
    }

    setLoading(true);
    try {
      let res;

      if (isEdit) {
        res = await editAlert({
          alert_id: alert.id,
          player_id: playerId || user.onesignal_player_id,
          title: title.trim(),
          message: message.trim(),
          scheduled_at: scheduled.toISOString()
        });
      } else {
        res = await createAlert({
          user_id: user.id,
          player_id: playerId || user.onesignal_player_id,
          title: title.trim(),
          message: message.trim(),
          scheduled_at: scheduled.toISOString()
        });
      }

      if (!res.success) {
        toast.error(res.error || 'Failed to save alert');
        return;
      }

      toast.success(isEdit ? 'Alert updated' : 'Alert created');
      onSaved();
    } catch {
      toast.error('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Alert' : 'New Alert'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
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
              placeholder="Any extra details..."
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
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Alert'}
          </button>
        </div>
      </div>
    </div>
  );
}
