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
    // Mobile — use redirect (more reliable than popup)
    await signInWithRedirect(auth, googleProvider);
    return null; // page will redirect, nothing to return
  } else {
    // Desktop — use popup
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;
    if (accessToken) saveToken(accessToken);
    return { user: result.user, accessToken };
  }
}

// Called on page load to handle redirect result on mobile
export async function handleRedirectResult() {
  try {
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

export async function refreshAccessToken() {
  try {
    if (isMobile()) {
      // On mobile, can't silently refresh — use stored token only
      return getStoredToken();
    }
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
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
  await signOut(auth);
}
