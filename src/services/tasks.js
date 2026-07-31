// Google Tasks API service
// All calls use the user's OAuth access token

const BASE = 'https://tasks.googleapis.com/tasks/v1';
const LIST_TITLE = 'Alertify';

// Get or create the Alertify task list
async function getOrCreateTaskList(accessToken) {
  const res = await fetch(`${BASE}/users/@me/lists`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const data = await res.json();
  
  // Find existing Alertify list
  const existing = data.items?.find(l => l.title === LIST_TITLE);
  if (existing) return existing.id;
  
  // Create new list
  const created = await fetch(`${BASE}/users/@me/lists`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: LIST_TITLE })
  });
  const list = await created.json();
  return list.id;
}

// Create a task with due date
export async function createTask(accessToken, { title, message, scheduled_at }) {
  const listId = await getOrCreateTaskList(accessToken);
  
  // Google Tasks only supports date in due field, not time
  // So we include time in the title for clarity
  const date = new Date(scheduled_at);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const taskTitle = `${title} — ${timeStr}`;
  
  // due must be RFC 3339 date-only format
  const due = date.toISOString().split('T')[0] + 'T00:00:00.000Z';
  
  const res = await fetch(`${BASE}/lists/${listId}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: taskTitle,
      notes: message || '',
      due
    })
  });
  
  const task = await res.json();
  if (!task.id) throw new Error('Failed to create task');
  return { task_id: task.id, list_id: listId };
}

// Update an existing task
export async function updateTask(accessToken, { list_id, task_id, title, message, scheduled_at }) {
  const date = new Date(scheduled_at);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const taskTitle = `${title} — ${timeStr}`;
  const due = date.toISOString().split('T')[0] + 'T00:00:00.000Z';
  
  const res = await fetch(`${BASE}/lists/${list_id}/tasks/${task_id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: taskTitle,
      notes: message || '',
      due
    })
  });
  
  const task = await res.json();
  if (!task.id) throw new Error('Failed to update task');
  return task;
}

// Delete a task
export async function deleteTask(accessToken, { list_id, task_id }) {
  await fetch(`${BASE}/lists/${list_id}/tasks/${task_id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` }
  });
}
