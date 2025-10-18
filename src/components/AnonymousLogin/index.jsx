import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, Message } from 'semantic-ui-react';
import { signInAnonymouslyWithName } from '../../firebase/auth';

const propTypes = {
  onSuccess: PropTypes.func,
};

const defaultProps = {
  onSuccess: null,
};

const AnonymousLogin = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signInAnonymouslyWithName(name.trim());
      if (onSuccess) {
        onSuccess(result.user);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Anonymous login error:', err);
      setError('Failed to join. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} error={!!error}>
      <Form.Field>
        <Input
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          action={
            <Button
              primary
              loading={loading}
              disabled={!name.trim() || loading}
              type="submit"
            >
              Join as Guest
            </Button>
          }
        />
      </Form.Field>
      {error && <Message error content={error} />}
    </Form>
  );
};

AnonymousLogin.propTypes = propTypes;
AnonymousLogin.defaultProps = defaultProps;

export default AnonymousLogin;
