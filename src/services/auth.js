import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  // Get Google Tasks access token from credential
  const { OAuthCredential } = await import('firebase/auth');
  const credential = OAuthCredential ? 
    result._tokenResponse : 
    result;
  
  // Extract access token for Google Tasks API
  const accessToken = result._tokenResponse?.oauthAccessToken || 
                      result.user?.accessToken;
  
  return {
    user: result.user,
    accessToken
  };
}

export async function logOut() {
  await signOut(auth);
}
