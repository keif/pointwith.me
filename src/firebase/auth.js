import {getAuth, GithubAuthProvider, TwitterAuthProvider, FacebookAuthProvider, GoogleAuthProvider, OAuthProvider, signInAnonymously, signInWithPopup, updateProfile} from 'firebase/auth';
import app from './firebase';
// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export const githubOAuth = () => {
  return new GithubAuthProvider();
};

export const twitterOAuth = () => {
  return new TwitterAuthProvider();
};

export const facebookOAuth = () => {
  return new FacebookAuthProvider();
};

export const googleOAuth = () => {
  return new GoogleAuthProvider();
};

export const azureOAuth = () => {
  return new OAuthProvider('microsoft.com');
};

export const signInAnonymouslyWithName = async (displayName) => {
  const result = await signInAnonymously(auth);
  await updateProfile(result.user, { displayName });
  return result;
};

export const popUpSignIn = (provider) => signInWithPopup(auth, provider);
