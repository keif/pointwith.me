import {
    getAuth,
    setPersistence,
    browserSessionPersistence,
    GithubAuthProvider,
    TwitterAuthProvider,
    FacebookAuthProvider,
    GoogleAuthProvider,
    OAuthProvider,
    signInAnonymously,
    signInWithPopup,
    updateProfile,
    AuthProvider,
    UserCredential
} from 'firebase/auth';
import app from './firebase';

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Set session persistence - auth state only persists for current browser session
// This ensures users are logged out when they close the browser
setPersistence(auth, browserSessionPersistence).catch((error) => {
    console.error('Error setting auth persistence:', error);
});

export const githubOAuth = (): GithubAuthProvider => {
    return new GithubAuthProvider();
};

export const twitterOAuth = (): TwitterAuthProvider => {
    return new TwitterAuthProvider();
};

export const facebookOAuth = (): FacebookAuthProvider => {
    return new FacebookAuthProvider();
};

export const googleOAuth = (): GoogleAuthProvider => {
    return new GoogleAuthProvider();
};

export const azureOAuth = (): OAuthProvider => {
    return new OAuthProvider('microsoft.com');
};

export const signInAnonymouslyWithName = async (displayName: string): Promise<UserCredential> => {
    const result = await signInAnonymously(auth);
    await updateProfile(result.user, { displayName });
    return result;
};

export const popUpSignIn = (provider: AuthProvider): Promise<UserCredential> =>
    signInWithPopup(auth, provider);
