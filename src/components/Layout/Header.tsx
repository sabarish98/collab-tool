import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../store/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, ChevronRight, Users } from 'lucide-react';

interface HeaderProps {
  teamName?: string;
  boardName?: string;
}

const Header: React.FC<HeaderProps> = ({ teamName, boardName }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    signOut(auth);
  };

  const isTeamsDashboard = location.pathname === '/teams';

  return (
    <header className="header">
      <div className="header-logo">
        <div 
          className="header-brand" 
          onClick={() => navigate('/teams')}
          style={{ cursor: 'pointer' }}
        >
          <LayoutDashboard size={20} />
          <span>CollabMaxx</span>
        </div>

        {/* Breadcrumbs */}
        {!isTeamsDashboard && (
          <nav className="breadcrumb">
            <ChevronRight size={14} className="breadcrumb-sep" />
            {teamName && (
              <span
                className="breadcrumb-item breadcrumb-clickable"
                onClick={() => navigate(-1)}
              >
                <Users size={14} />
                {teamName}
              </span>
            )}
            {boardName && (
              <>
                <ChevronRight size={14} className="breadcrumb-sep" />
                <span className="breadcrumb-item breadcrumb-current">
                  {boardName}
                </span>
              </>
            )}
          </nav>
        )}
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
