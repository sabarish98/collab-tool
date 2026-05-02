import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTeam } from '../../store/TeamContext';
import { useAuth } from '../../store/AuthContext';
import CreateBoardModal from '../Modals/CreateBoardModal';
import InviteMemberModal from '../Modals/InviteMemberModal';
import {
  Plus, LayoutDashboard, Users, Crown, User, UserMinus, UserPlus,
  Shield, ShieldOff, Trash2, ArrowLeft, MoreVertical
} from 'lucide-react';

const TeamView: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const {
    teams, currentTeam, selectTeam, teamMembers, teamBoards,
    isManager, removeMember, updateMemberRole, deleteTeam
  } = useTeam();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memberMenuId, setMemberMenuId] = useState<string | null>(null);

  // Auto-select team from URL
  useEffect(() => {
    if (teamId && (!currentTeam || currentTeam.id !== teamId)) {
      const found = teams.find(t => t.id === teamId);
      if (found) {
        selectTeam(found);
      }
    }
  }, [teamId, teams, currentTeam, selectTeam]);

  if (!currentTeam) {
    return (
      <div className="team-view-loading">
        <div className="loading-spinner" />
        <p>Loading team...</p>
      </div>
    );
  }

  const handleBoardClick = (boardId: string) => {
    navigate(`/team/${currentTeam.id}/board/${boardId}`);
  };

  const handleDeleteTeam = async () => {
    await deleteTeam(currentTeam.id);
    navigate('/teams');
  };

  const handleRemoveMember = async (memberId: string) => {
    await removeMember(memberId);
    setMemberMenuId(null);
  };

  const handleToggleRole = async (memberId: string, currentRole: string) => {
    const newRole = currentRole === 'manager' ? 'member' : 'manager';
    await updateMemberRole(memberId, newRole);
    setMemberMenuId(null);
  };

  const manager = isManager();

  return (
    <div className="team-view">
      <div className="team-view-main">
        <div className="team-view-header">
          <div>
            <button className="btn-back" onClick={() => navigate('/teams')}>
              <ArrowLeft size={16} />
              Back to Teams
            </button>
            <h1 className="team-view-title">{currentTeam.name}</h1>
            {currentTeam.description && (
              <p className="team-view-desc">{currentTeam.description}</p>
            )}
          </div>
          <div className="team-view-actions">
            {manager && (
              <button
                className="btn btn-primary btn-glow"
                onClick={() => setShowCreateBoard(true)}
              >
                <Plus size={18} />
                New Board
              </button>
            )}
          </div>
        </div>

        <h2 className="section-title">
          <LayoutDashboard size={20} />
          Boards
        </h2>

        {teamBoards.length === 0 ? (
          <div className="boards-empty">
            <LayoutDashboard size={40} style={{ opacity: 0.3 }} />
            <p>No boards yet</p>
            {manager && <p className="text-muted">Create a board to get started</p>}
          </div>
        ) : (
          <div className="board-grid">
            {teamBoards.map((board, index) => (
              <div
                key={board.id}
                className="board-card"
                onClick={() => handleBoardClick(board.id)}
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                <div className="board-card-gradient" />
                <div className="board-card-content">
                  <h3>{board.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <aside className="team-sidebar">
        <div className="team-sidebar-section">
          <div className="team-sidebar-header">
            <h3>
              <Users size={18} />
              Members ({teamMembers.length})
            </h3>
            {manager && (
              <button className="btn-icon" onClick={() => setShowInvite(true)} title="Invite member">
                <UserPlus size={16} />
              </button>
            )}
          </div>

          <div className="member-list">
            {teamMembers.map(member => {
              const isCurrentUser = member.userId === user?.uid || member.userEmail === user?.email;
              const isCreator = member.userId === currentTeam.createdBy;

              return (
                <div key={member.id} className="member-item">
                  <div className="member-info">
                    <div className="member-avatar">
                      {member.userEmail.charAt(0).toUpperCase()}
                    </div>
                    <div className="member-details">
                      <span className="member-email">
                        {member.userEmail}
                        {isCurrentUser && <span className="you-badge">you</span>}
                      </span>
                      <span className={`role-badge-sm ${member.role === 'manager' ? 'role-badge-manager-sm' : 'role-badge-member-sm'}`}>
                        {member.role === 'manager' ? <Crown size={10} /> : <User size={10} />}
                        {member.role}
                      </span>
                    </div>
                  </div>

                  {manager && !isCurrentUser && !isCreator && (
                    <div className="member-actions">
                      <button
                        className="btn-icon"
                        onClick={() => setMemberMenuId(memberMenuId === member.id ? null : member.id)}
                      >
                        <MoreVertical size={14} />
                      </button>
                      {memberMenuId === member.id && (
                        <div className="member-menu">
                          <button onClick={() => handleToggleRole(member.id, member.role)}>
                            {member.role === 'manager' ? (
                              <><ShieldOff size={14} /> Demote to Member</>
                            ) : (
                              <><Shield size={14} /> Promote to Manager</>
                            )}
                          </button>
                          <button className="danger" onClick={() => handleRemoveMember(member.id)}>
                            <UserMinus size={14} /> Remove
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {manager && currentTeam.createdBy === user?.uid && (
          <div className="team-sidebar-section team-danger-zone">
            <h3>Danger Zone</h3>
            {showDeleteConfirm ? (
              <div className="delete-confirm">
                <p>Delete "{currentTeam.name}" and all its data?</p>
                <div className="delete-confirm-actions">
                  <button className="btn btn-danger btn-sm" onClick={handleDeleteTeam}>
                    <Trash2 size={14} /> Yes, Delete
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowDeleteConfirm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn btn-danger-outline btn-sm" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 size={14} /> Delete Team
              </button>
            )}
          </div>
        )}
      </aside>

      {showCreateBoard && <CreateBoardModal onClose={() => setShowCreateBoard(false)} />}
      {showInvite && <InviteMemberModal onClose={() => setShowInvite(false)} />}
    </div>
  );
};

export default TeamView;
