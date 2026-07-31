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
  sessionStorage.setItem(TOKEN_KEY, token);
  const expiry = Date.now() + 55 * 60 * 1000;
  sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
}

export function getStoredToken() {
  const expiry = parseInt(sessionStorage.getItem(TOKEN_EXPIRY_KEY) || '0');
  if (Date.now() > expiry) {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
    return null;
  }
  return sessionStorage.getItem(TOKEN_KEY);
}

function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export async function signInWithGoogle() {
  if (isMobile()) {
    // Mark that a redirect is in progress so we know to handle it on return
    sessionStorage.setItem(REDIRECT_PENDING_KEY, 'true');
    await signInWithRedirect(auth, googleProvider);
    return null;
  } else {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;
    if (accessToken) saveToken(accessToken);
    return { user: result.user, accessToken };
  }
}

// Only called when we know a redirect was pending — avoids spurious calls
export async function handleRedirectResult() {
  const pending = sessionStorage.getItem(REDIRECT_PENDING_KEY);
  if (!pending) return null;

  try {
    sessionStorage.removeItem(REDIRECT_PENDING_KEY);
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
    return null;
  }
}

export async function logOut() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
  sessionStorage.removeItem(REDIRECT_PENDING_KEY);
  await signOut(auth);
}
