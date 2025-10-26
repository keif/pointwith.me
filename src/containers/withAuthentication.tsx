import React, {Component, useEffect, useState} from 'react';
import Delay from 'react-delay';
import store from 'store';

import { auth } from '../firebase';
import {useLocation, useNavigate} from 'react-router-dom';

export default WrappedComponent => {
  const WithAuthentication = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const unsubscribe = auth.auth.onAuthStateChanged(currentUser => {
        if (currentUser) {
          setUser(currentUser);
          setLoading(false);
        } else {
          store.set('entryPoint', location.pathname);
          navigate('/');
        }
      });

      return () => unsubscribe();
    }, [location.pathname, navigate]);

    if (loading) {
      return (
        <Delay wait={250}>
          <p>Loading...</p>
        </Delay>
      );
    }

    if (user) {
      return (
        <WrappedComponent
          {...props}
          providerData={user.providerData}
          currentUser={user}
        />
      );
    }

    return null;
  }

  return WithAuthentication;
};
