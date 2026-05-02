import React, { useState } from 'react';
import { useTeam } from '../../store/TeamContext';
import { X, UserPlus, Mail } from 'lucide-react';

interface InviteMemberModalProps {
  onClose: () => void;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ onClose }) => {
  const { addMember, currentTeam } = useTeam();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !currentTeam) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await addMember(currentTeam.id, email.trim());
      if (result.success) {
        setSuccess(`${email.trim()} has been added to the team!`);
        setEmail('');
      } else {
        setError(result.error || 'Failed to add member');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add member');
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
          <UserPlus size={24} style={{ color: 'var(--primary-color)', marginTop: '4px' }} />
          <div className="modal-title-container">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Invite Team Member</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Add a collaborator to {currentTeam?.name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-message"><span>{error}</span></div>}
          {success && (
            <div className="success-message">
              <span>{success}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="member-email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                id="member-email"
                type="email"
                className="form-input form-input-icon"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          <div className="modal-form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Close
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !email.trim()}>
              <UserPlus size={16} />
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;
