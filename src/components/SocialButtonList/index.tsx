import React from 'react';
import {useNavigate} from 'react-router-dom';
import {
    azureOAuth,
    facebookOAuth,
    githubOAuth,
    googleOAuth,
    popUpSignIn,
    twitterOAuth
} from '@/firebase/auth';

interface SocialButtonListProps {
    currentUser?: any;
    currentProviders?: ((providerData: any[]) => void) | null;
}

const buttonList = {
    github: {
        visible: true,
        provider: () => {
            const provider = githubOAuth();
            provider.addScope('user');
            return provider;
        }
    },
    google: {
        visible: true,
        provider: () => googleOAuth()
    },
    microsoft: {
        visible: true,
        provider: () => azureOAuth()
    },
    twitter: {
        visible: false,
        provider: () => twitterOAuth()
    },
    facebook: {
        visible: false,
        provider: () => facebookOAuth()
    }
};

const SocialButtonList = ({currentUser, currentProviders = null}: SocialButtonListProps) => {
    const navigate = useNavigate();

    const authHandler = authData => {
        if (authData) {
            if (currentProviders === null) {
                navigate('/dashboard');
            } else {
                currentProviders(authData.user.providerData);
            }
        } else {
            console.error('Error authenticating');
        }
    };

    const authenticate = (e, provider) => {
        const providerOAuth = buttonList[provider].provider();
        if (!currentUser) {
            popUpSignIn(providerOAuth)
                .then(authHandler)
                .catch(err => console.error(err));
        } else {
            currentUser.linkWithPopup(providerOAuth)
                .then(authHandler)
                .catch(err => console.error(err));
        }
    };

    const renderButtonList = provider => {
        const visible = buttonList[provider].visible;

        if (visible) {
            const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
            return (
                <button
                    key={provider}
                    onClick={e => authenticate(e, provider)}
                    className="btn btn-primary w-full"
                >
                    {providerName}
                </button>
            );
        } else {
            return null;
        }
    };

    return (
        <div id="loginButtons" className="space-y-2">
            {Object.keys(buttonList).map(renderButtonList)}
        </div>
    );
};

export default SocialButtonList;
