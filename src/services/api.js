const BASE_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

async function call(payload) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.json();
}

// Auth
export const login = (email, password) =>
  call({ action: 'login', email, password });

export const register = (email, password) =>
  call({ action: 'register', email, password });

export const updatePlayerId = (user_id, player_id) =>
  call({ action: 'update_player_id', user_id, player_id });

// Alerts
export const getAlerts = (user_id) =>
  call({ action: 'get_alerts', user_id });

export const createAlert = (data) =>
  call({ action: 'create_alert', ...data });

export const editAlert = (data) =>
  call({ action: 'edit_alert', ...data });

export const deleteAlert = (alert_id) =>
  call({ action: 'delete_alert', alert_id });
