import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const TOKEN_KEY = 'alertify_gtoken';
const TOKEN_EXPIRY_KEY = 'alertify_gtoken_exp';
const REDIRECT_PENDING_KEY = 'alertify_redirect_pending';

export function saveToken(token) {
  // Use localStorage so it survives redirects on mobile
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

function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export async function signInWithGoogle() {
  if (isMobile()) {
    // Use localStorage — survives page redirect on mobile browsers
    localStorage.setItem(REDIRECT_PENDING_KEY, 'true');
    localStorage.setItem('alertify_redirect_pending_debug', new Date().toISOString());
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      // Some browsers throw before redirect — ignore, redirect still happens
      console.warn('Redirect warning (safe to ignore):', err);
    }
    return null;
  } else {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;
    if (accessToken) saveToken(accessToken);
    return { user: result.user, accessToken };
  }
}

// Called on page load — only processes if redirect was pending
export async function handleRedirectResult() {
  const pending = localStorage.getItem(REDIRECT_PENDING_KEY);
  if (!pending) return null;

  try {
    localStorage.removeItem(REDIRECT_PENDING_KEY);
    const result = await getRedirectResult(auth);
    if (result) {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
      if (accessToken) saveToken(accessToken);
      return { user: result.user, accessToken };
    }
    return null;
  } catch (err) {
    console.error('Redirect result error:', err);
    localStorage.removeItem(REDIRECT_PENDING_KEY);
    return null;
  }
}

export async function logOut() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  localStorage.removeItem(REDIRECT_PENDING_KEY);
  await signOut(auth);
}

// Desktop only — silently refresh token via popup every 50 minutes
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
