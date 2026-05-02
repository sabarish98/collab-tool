import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../store/AuthContext';
import { LayoutDashboard, LogOut } from 'lucide-react';

const Header: React.FC = () => {
  const { user } = useAuth();

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <header className="header">
      <div className="header-logo">
        <LayoutDashboard size={20} />
        Trello Clone
      </div>
      <div className="header-user">
        <span style={{ fontSize: '0.875rem' }}>{user?.email}</span>
        <button onClick={handleLogout} className="logout-btn" title="Log out">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};

export default Header;
