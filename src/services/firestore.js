import {
  collection, addDoc, getDocs, updateDoc, deleteDoc,
  doc, query, where, orderBy, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

const ALERTS = 'alerts';

// Get all alerts for a user
export async function getAlerts(userId) {
  const q = query(
    collection(db, ALERTS),
    where('user_id', '==', userId),
    orderBy('scheduled_at', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Create alert
export async function createAlert(userId, { title, message, scheduled_at, task_id, list_id }) {
  const ref = await addDoc(collection(db, ALERTS), {
    user_id: userId,
    title,
    message: message || '',
    scheduled_at,
    task_id,
    list_id,
    created_at: serverTimestamp()
  });
  return { id: ref.id, user_id: userId, title, message, scheduled_at, task_id, list_id };
}

// Update alert
export async function updateAlert(alertId, { title, message, scheduled_at, task_id, list_id }) {
  await updateDoc(doc(db, ALERTS, alertId), {
    title,
    message: message || '',
    scheduled_at,
    task_id,
    list_id
  });
}

// Delete alert
export async function deleteAlert(alertId) {
  await deleteDoc(doc(db, ALERTS, alertId));
}
