import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { LogIn, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/teams');
    } catch (err: any) {
      const msg = err.message || 'Failed to log in';
      if (msg.includes('auth/invalid-credential')) {
        setError('Invalid email or password. Please try again.');
      } else if (msg.includes('auth/user-not-found')) {
        setError('No account found with this email.');
      } else if (msg.includes('auth/wrong-password')) {
        setError('Incorrect password. Please try again.');
      } else if (msg.includes('auth/too-many-requests')) {
        setError('Too many failed login attempts. Please try again later.');
      } else {
        setError(msg.replace('Firebase: ', '').replace(/Error \([^)]+\)\.?/, '').trim());
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img src="/logo.png" alt="CollabMaxx Logo" className="auth-logo" />
        </div>
        <h2 className="auth-title">Log in to CollabMaxx</h2>
        <div className="tagline" style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '-1rem' }}>never stop collaborating</div>
        {error && (
          <div className="error-message" role="alert" aria-live="polite">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{error}</span>
          </div>
        )}
        <form data-testid="login-form" aria-label="login-form" onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <LogIn size={18} />
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <div className="auth-link">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
