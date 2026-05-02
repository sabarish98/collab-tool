import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { UserPlus } from 'lucide-react';

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

      // Create a default board for the new user
      const boardRef = await addDoc(collection(db, 'boards'), {
        title: 'My First Board',
        ownerId: user.uid,
        createdAt: serverTimestamp()
      });

      // Create default lists
      const listsRef = collection(db, 'lists');
      const defaultLists = ['To Do', 'Doing', 'Done'];
      
      for (let i = 0; i < defaultLists.length; i++) {
        await addDoc(listsRef, {
          title: defaultLists[i],
          boardId: boardRef.id,
          order: i,
          createdAt: serverTimestamp()
        });
      }

      navigate('/board');
    } catch (err: any) {
      setError(err.message || 'Failed to create an account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Sign up for Trello Clone</h2>
        {error && <div className="error-message">{error}</div>}
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
