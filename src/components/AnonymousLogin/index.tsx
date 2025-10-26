import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { signInAnonymouslyWithName } from '@/firebase/auth';

interface AnonymousLoginProps {
  onSuccess?: ((user: any) => void) | null;
}

const AnonymousLogin = ({ onSuccess = null }: AnonymousLoginProps) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError(null);

    toast.promise(
      signInAnonymouslyWithName(name.trim()),
      {
        loading: 'Joining as guest...',
        success: `Welcome, ${name.trim()}!`,
        error: 'Failed to join as guest',
      }
    )
      .then((result) => {
        if (onSuccess) {
          onSuccess(result.user);
        }
        // Don't navigate here - let the Login component's auth listener handle navigation
      })
      .catch((err) => {
        console.error('Anonymous login error:', err);
        setError(err.message || 'Failed to join. Please try again.');
        setLoading(false);
      });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={!name.trim() || loading}
          className="btn btn-primary flex items-center gap-2"
        >
          {loading && <Loader2 className="animate-spin" size={16} />}
          Join as Guest
        </button>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </form>
  );
};

export default AnonymousLogin;
