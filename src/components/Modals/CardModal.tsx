import React, { useState, useEffect } from 'react';
import { Card as CardType } from '../../types';
import { useBoard } from '../../store/BoardContext';
import { X, AlignLeft, CreditCard } from 'lucide-react';

interface CardModalProps {
  card: CardType;
  onClose: () => void;
}

const CardModal: React.FC<CardModalProps> = ({ card, onClose }) => {
  const { updateCard, lists } = useBoard();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  const list = lists.find(l => l.id === card.listId);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSaveTitle = () => {
    if (title.trim() !== card.title && title.trim() !== '') {
      updateCard(card.id, { title: title.trim() });
    } else {
      setTitle(card.title); // Reset if empty
    }
  };

  const handleSaveDescription = () => {
    updateCard(card.id, { description: description.trim() });
    setIsEditingDesc(false);
  };

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="modal-header">
          <CreditCard size={24} style={{ color: 'var(--text-secondary)', marginTop: '4px' }} />
          <div className="modal-title-container">
            <input 
              className="modal-title-input" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
            />
            <div className="modal-list-info">
              in list <span style={{ textDecoration: 'underline' }}>{list?.title}</span>
            </div>
          </div>
        </div>
        
        <div className="modal-body">
          <div className="modal-main">
            <div className="modal-section">
              <div className="modal-section-header">
                <AlignLeft size={20} />
                <h3>Description</h3>
              </div>
              
              {isEditingDesc ? (
                <div>
                  <textarea
                    className="modal-description-input"
                    placeholder="Add a more detailed description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary" onClick={handleSaveDescription}>
                      Save
                    </button>
                    <button className="btn btn-ghost" onClick={() => setIsEditingDesc(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className="modal-description-content"
                  onClick={() => setIsEditingDesc(true)}
                  style={{ minHeight: description ? 'auto' : '56px' }}
                >
                  {description ? (
                    <p style={{ whiteSpace: 'pre-wrap' }}>{description}</p>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)' }}>Add a more detailed description...</span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="modal-sidebar">
            <h4 className="sidebar-title">Actions</h4>
            <button className="sidebar-btn sidebar-btn-danger" onClick={() => alert('Delete not implemented in V1!')}>
              Delete Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
