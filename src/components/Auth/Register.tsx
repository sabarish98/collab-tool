import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { UserPlus, AlertCircle } from 'lucide-react';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create a personal team for the new user
      const teamRef = await addDoc(collection(db, 'teams'), {
        name: 'Personal',
        description: 'Your personal workspace',
        createdBy: user.uid,
        createdAt: Date.now()
      });

      // Add user as manager of their personal team
      await addDoc(collection(db, 'team_members'), {
        teamId: teamRef.id,
        userId: user.uid,
        userEmail: user.email || '',
        role: 'manager',
        joinedAt: Date.now()
      });

      // Create a default board inside the personal team
      const boardRef = await addDoc(collection(db, 'boards'), {
        title: 'My First Board',
        teamId: teamRef.id,
        createdBy: user.uid,
        createdAt: Date.now()
      });

      // Create default lists
      const defaultLists = ['To Do', 'Doing', 'Done'];
      for (let i = 0; i < defaultLists.length; i++) {
        await addDoc(collection(db, 'lists'), {
          title: defaultLists[i],
          boardId: boardRef.id,
          order: i,
          createdAt: Date.now()
        });
      }

      navigate('/teams');
    } catch (err: any) {
      const msg = err.message || 'Failed to create an account';
      if (msg.includes('auth/email-already-in-use')) {
        setError('An account with this email already exists.');
      } else if (msg.includes('auth/weak-password')) {
        setError('Password should be at least 6 characters.');
      } else if (msg.includes('auth/invalid-email')) {
        setError('Please enter a valid email address.');
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
        <h2 className="auth-title">Sign up for CollabMaxx</h2>
        <div className="tagline" style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '-1rem' }}>never stop collaborating</div>
        {error && (
          <div className="error-message">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleRegister} className="auth-form">
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
          <button type="submit" className="btn btn-success" disabled={loading}>
            <UserPlus size={18} />
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <div className="auth-link">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
