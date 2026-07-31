import {
  signInWithPopup,
  signOut,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const TOKEN_KEY = 'alertify_gtoken';
const TOKEN_EXPIRY_KEY = 'alertify_gtoken_exp';

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
  const expiry = Date.now() + 55 * 60 * 1000;
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
}

export function getStoredToken() {
  const expiry = parseInt(localStorage.getItem(TOKEN_EXPIRY_KEY) || '0');
  if (Date.now() > expiry) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
}

// Single sign-in method for ALL platforms — popup works on mobile too
// as long as it's triggered by a direct user gesture (button click)
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const accessToken = credential?.accessToken;
  if (accessToken) saveToken(accessToken);
  return { user: result.user, accessToken };
}

// No-op now — redirect flow removed
export async function handleRedirectResult() {
  return null;
}

// Desktop only — silently refresh token every 50 minutes
export async function silentRefreshToken() {
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return null;
  try {
    googleProvider.setCustomParameters({ prompt: 'none' });
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    if (token) saveToken(token);
    googleProvider.setCustomParameters({});
    return token;
  } catch {
    googleProvider.setCustomParameters({});
    return null;
  }
}

export async function logOut() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  await signOut(auth);
}
