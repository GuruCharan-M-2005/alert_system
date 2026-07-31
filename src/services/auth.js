import { signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const TOKEN_KEY = 'alertify_gtoken';
const TOKEN_EXPIRY_KEY = 'alertify_gtoken_exp';

export function saveToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
  // Token valid for 55 minutes (Google expires at 60)
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

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const accessToken = credential?.accessToken;
  if (accessToken) saveToken(accessToken);
  return { user: result.user, accessToken };
}

// Re-authenticate silently to get fresh token (no popup if already logged in)
export async function refreshAccessToken() {
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
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
  await signOut(auth);
}
