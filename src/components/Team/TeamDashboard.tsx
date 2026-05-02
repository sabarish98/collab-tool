import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeam } from '../../store/TeamContext';
import { useAuth } from '../../store/AuthContext';
import CreateTeamModal from '../Modals/CreateTeamModal';
import { Plus, Users, Crown, User, ChevronRight, Sparkles } from 'lucide-react';

const TeamDashboard: React.FC = () => {
  const { teams, loading, selectTeam } = useTeam();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (loading) {
    return (
      <div className="team-dashboard">
        <div className="team-dashboard-loading">
          <div className="loading-spinner" />
          <p>Loading your teams...</p>
        </div>
      </div>
    );
  }

  const handleTeamClick = (team: typeof teams[0]) => {
    selectTeam(team);
    navigate(`/team/${team.id}`);
  };

  return (
    <div className="team-dashboard">
      <div className="team-dashboard-header">
        <div>
          <h1 className="team-dashboard-title">Your Teams</h1>
          <p className="team-dashboard-subtitle">Select a team to view its boards and collaborate</p>
        </div>
        {teams.length < 5 && (
          <button 
            className="btn btn-primary btn-glow"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={18} />
            Create Team
          </button>
        )}
      </div>

      {teams.length === 0 ? (
        <div className="team-empty-state">
          <div className="team-empty-icon">
            <Users size={48} />
          </div>
          <h2>No teams yet</h2>
          <p>Create your first team to start collaborating with others</p>
          <button 
            className="btn btn-primary btn-lg btn-glow"
            onClick={() => setShowCreateModal(true)}
          >
            <Sparkles size={18} />
            Create Your First Team
          </button>
        </div>
      ) : (
        <>
          <div className="team-grid">
            {teams.map((team, index) => {
              const isCreator = team.createdBy === user?.uid;
              return (
                <div
                  key={team.id}
                  className="team-card"
                  onClick={() => handleTeamClick(team)}
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className="team-card-gradient" />
                  <div className="team-card-content">
                    <div className="team-card-header">
                      <h3 className="team-card-name">{team.name}</h3>
                      <ChevronRight size={20} className="team-card-arrow" />
                    </div>
                    {team.description && (
                      <p className="team-card-desc">{team.description}</p>
                    )}
                    <div className="team-card-footer">
                      <div className="team-card-meta">
                        {isCreator ? (
                          <span className="role-badge role-badge-manager">
                            <Crown size={12} /> Manager
                          </span>
                        ) : (
                          <span className="role-badge role-badge-member">
                            <User size={12} /> Member
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {teams.length >= 5 && (
            <div className="team-limit-notice">
              <span>You've reached the maximum of 5 teams</span>
            </div>
          )}
        </>
      )}

      {showCreateModal && (
        <CreateTeamModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default TeamDashboard;
