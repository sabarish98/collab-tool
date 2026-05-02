import React, { useState } from 'react';
import { useTeam } from '../../store/TeamContext';
import { X, LayoutDashboard } from 'lucide-react';

interface CreateBoardModalProps {
  onClose: () => void;
}

const CreateBoardModal: React.FC<CreateBoardModalProps> = ({ onClose }) => {
  const { createBoard } = useTeam();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError('');

    try {
      const boardId = await createBoard(title.trim());
      if (boardId) {
        onClose();
      } else {
        setError('Failed to create board');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create board');
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
          <LayoutDashboard size={24} style={{ color: 'var(--primary-color)', marginTop: '4px' }} />
          <div className="modal-title-container">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Create a New Board</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Boards contain lists and cards for organizing tasks
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-message"><span>{error}</span></div>}

          <div className="form-group">
            <label className="form-label" htmlFor="board-title">Board Name *</label>
            <input
              id="board-title"
              type="text"
              className="form-input"
              placeholder="e.g., Sprint 1, Product Roadmap..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={60}
              autoFocus
              required
            />
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Default lists (To Do, Doing, Done) will be created automatically.
          </p>

          <div className="modal-form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-glow" disabled={loading || !title.trim()}>
              <LayoutDashboard size={16} />
              {loading ? 'Creating...' : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBoardModal;
