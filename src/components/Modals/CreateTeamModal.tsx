import React, { useState } from 'react';
import { useTeam } from '../../store/TeamContext';
import { X, Users, Sparkles } from 'lucide-react';

interface CreateTeamModalProps {
  onClose: () => void;
}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ onClose }) => {
  const { createTeam, teams } = useTeam();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (teams.length >= 5) {
      setError('You can be part of a maximum of 5 teams.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const teamId = await createTeam(name.trim(), description.trim());
      if (teamId) {
        onClose();
      } else {
        setError('Failed to create team. You may have reached the 5 team limit.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content modal-sm">
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <Users size={24} style={{ color: 'var(--primary-color)', marginTop: '4px' }} />
          <div className="modal-title-container">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Create a New Team</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Bring your people together
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-message"><span>{error}</span></div>}

          <div className="form-group">
            <label className="form-label" htmlFor="team-name">Team Name *</label>
            <input
              id="team-name"
              type="text"
              className="form-input"
              placeholder="e.g., Engineering, Marketing..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="team-desc">Description</label>
            <textarea
              id="team-desc"
              className="form-input form-textarea"
              placeholder="What does this team work on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
            />
          </div>

          <div className="modal-form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-glow" disabled={loading || !name.trim()}>
              <Sparkles size={16} />
              {loading ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamModal;
