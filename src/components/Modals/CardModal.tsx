import React, { useState, useEffect, useRef } from 'react';
import { Card as CardType, CARD_STATUSES, CARD_PRIORITIES, LABEL_OPTIONS } from '../../types';
import { useBoard } from '../../store/BoardContext';
import {
  X, AlignLeft, CreditCard, Calendar, Users, Tag, MessageSquare,
  ChevronDown, Trash2, Send, Clock
} from 'lucide-react';

interface CardModalProps {
  card: CardType;
  onClose: () => void;
}

const formatDate = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateInput = (ts: number | null | undefined): string => {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toISOString().split('T')[0];
};

const formatRelativeTime = (ts: number) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(ts);
};

const CardModal: React.FC<CardModalProps> = ({ card, onClose }) => {
  const { updateCard, deleteCard, lists, addComment, subscribeToComments, activeComments } = useBoard();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [status, setStatus] = useState(card.status || 'open');
  const [priority, setPriority] = useState(card.priority || 'medium');
  const [assignedTo, setAssignedTo] = useState<string[]>(card.assignedTo || []);
  const [labels, setLabels] = useState<string[]>(card.labels || []);
  const [startDate, setStartDate] = useState<string>(formatDateInput(card.startDate));
  const [dueDate, setDueDate] = useState<string>(formatDateInput(card.dueDate));
  const [newComment, setNewComment] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showAssigneeInput, setShowAssigneeInput] = useState(false);
  const [assigneeEmail, setAssigneeEmail] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const commentEndRef = useRef<HTMLDivElement>(null);

  const list = lists.find(l => l.id === card.listId);
  const statusConfig = CARD_STATUSES.find(s => s.value === status);
  const priorityConfig = CARD_PRIORITIES.find(p => p.value === priority);

  // Subscribe to comments
  useEffect(() => {
    const unsub = subscribeToComments(card.id);
    return unsub;
  }, [card.id, subscribeToComments]);

  // Scroll to bottom on new comments
  useEffect(() => {
    commentEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeComments.length]);

  // Close on Escape
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
      setTitle(card.title);
    }
  };

  const handleSaveDescription = () => {
    updateCard(card.id, { description: description.trim() });
    setIsEditingDesc(false);
  };

  const handleStatusChange = (newStatus: typeof status) => {
    setStatus(newStatus);
    updateCard(card.id, { status: newStatus });
    setShowStatusDropdown(false);
  };

  const handlePriorityChange = (newPriority: typeof priority) => {
    setPriority(newPriority);
    updateCard(card.id, { priority: newPriority });
    setShowPriorityDropdown(false);
  };

  const handleToggleLabel = (labelName: string) => {
    const newLabels = labels.includes(labelName)
      ? labels.filter(l => l !== labelName)
      : [...labels, labelName];
    setLabels(newLabels);
    updateCard(card.id, { labels: newLabels });
  };

  const handleAddAssignee = () => {
    if (assigneeEmail.trim() && !assignedTo.includes(assigneeEmail.trim().toLowerCase())) {
      const updated = [...assignedTo, assigneeEmail.trim().toLowerCase()];
      setAssignedTo(updated);
      updateCard(card.id, { assignedTo: updated });
      setAssigneeEmail('');
    }
  };

  const handleRemoveAssignee = (email: string) => {
    const updated = assignedTo.filter(a => a !== email);
    setAssignedTo(updated);
    updateCard(card.id, { assignedTo: updated });
  };

  const handleDateChange = (field: 'startDate' | 'dueDate', value: string) => {
    const ts = value ? new Date(value).getTime() : null;
    if (field === 'startDate') setStartDate(value);
    else setDueDate(value);
    updateCard(card.id, { [field]: ts });
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await addComment(card.id, newComment);
    setNewComment('');
  };

  const handleDelete = async () => {
    await deleteCard(card.id);
    onClose();
  };

  const isOverdue = card.dueDate && card.dueDate < Date.now() && status !== 'done';

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content modal-jira">
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        {/* ── Header ── */}
        <div className="jira-header">
          <div className="jira-header-left">
            <CreditCard size={20} style={{ color: 'var(--text-secondary)', marginTop: '2px', flexShrink: 0 }} />
            <div className="jira-title-area">
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

          {/* Status & Priority pills */}
          <div className="jira-header-controls">
            {/* Status Dropdown */}
            <div className="dropdown-wrapper">
              <button
                className="jira-pill"
                style={{ backgroundColor: `${statusConfig?.color}20`, color: statusConfig?.color, borderColor: `${statusConfig?.color}40` }}
                onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowPriorityDropdown(false); }}
              >
                {statusConfig?.label} <ChevronDown size={14} />
              </button>
              {showStatusDropdown && (
                <div className="dropdown-menu">
                  {CARD_STATUSES.map(s => (
                    <button
                      key={s.value}
                      className={`dropdown-item ${s.value === status ? 'dropdown-item-active' : ''}`}
                      onClick={() => handleStatusChange(s.value)}
                    >
                      <span className="dropdown-dot" style={{ backgroundColor: s.color }} />
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Priority Dropdown */}
            <div className="dropdown-wrapper">
              <button
                className="jira-pill"
                style={{ backgroundColor: `${priorityConfig?.color}20`, color: priorityConfig?.color, borderColor: `${priorityConfig?.color}40` }}
                onClick={() => { setShowPriorityDropdown(!showPriorityDropdown); setShowStatusDropdown(false); }}
              >
                {priorityConfig?.icon} {priorityConfig?.label} <ChevronDown size={14} />
              </button>
              {showPriorityDropdown && (
                <div className="dropdown-menu">
                  {CARD_PRIORITIES.map(p => (
                    <button
                      key={p.value}
                      className={`dropdown-item ${p.value === priority ? 'dropdown-item-active' : ''}`}
                      onClick={() => handlePriorityChange(p.value)}
                    >
                      <span>{p.icon}</span>
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="jira-body">
          {/* Left Panel — Description + Comments */}
          <div className="jira-main">
            {/* Description */}
            <div className="modal-section">
              <div className="modal-section-header">
                <AlignLeft size={18} />
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
                    <button className="btn btn-primary btn-sm" onClick={handleSaveDescription}>Save</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setIsEditingDesc(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="modal-description-content" onClick={() => setIsEditingDesc(true)}>
                  {description ? (
                    <p style={{ whiteSpace: 'pre-wrap' }}>{description}</p>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)' }}>Add a more detailed description...</span>
                  )}
                </div>
              )}
            </div>

            {/* Activity / Comments */}
            <div className="modal-section">
              <div className="modal-section-header">
                <MessageSquare size={18} />
                <h3>Activity</h3>
                <span className="comment-count-badge">{activeComments.length}</span>
              </div>

              <div className="comment-list">
                {activeComments.length === 0 && (
                  <p className="comment-empty">No comments yet. Start the conversation!</p>
                )}
                {activeComments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-avatar">
                      {comment.authorEmail.charAt(0).toUpperCase()}
                    </div>
                    <div className="comment-body">
                      <div className="comment-header">
                        <span className="comment-author">{comment.authorEmail}</span>
                        <span className="comment-time">{formatRelativeTime(comment.createdAt)}</span>
                      </div>
                      <p className="comment-text">{comment.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={commentEndRef} />
              </div>

              <div className="comment-input-area">
                <textarea
                  className="comment-input"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  rows={2}
                />
                <button
                  className="btn btn-primary btn-sm comment-send-btn"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="jira-sidebar">
            {/* Assignees */}
            <div className="jira-sidebar-section">
              <h4 className="jira-sidebar-label"><Users size={14} /> Assignees</h4>
              <div className="assignee-list">
                {assignedTo.map(email => (
                  <div key={email} className="assignee-chip">
                    <div className="assignee-chip-avatar">{email.charAt(0).toUpperCase()}</div>
                    <span className="assignee-chip-email">{email}</span>
                    <button className="assignee-chip-remove" onClick={() => handleRemoveAssignee(email)}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {showAssigneeInput ? (
                  <div className="assignee-input-row">
                    <input
                      type="email"
                      className="form-input assignee-input"
                      placeholder="Enter email..."
                      value={assigneeEmail}
                      onChange={(e) => setAssigneeEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddAssignee()}
                      autoFocus
                    />
                    <button className="btn btn-primary btn-sm" onClick={handleAddAssignee}>Add</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowAssigneeInput(false)}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button className="jira-add-btn" onClick={() => setShowAssigneeInput(true)}>
                    + Add assignee
                  </button>
                )}
              </div>
            </div>

            {/* Labels */}
            <div className="jira-sidebar-section">
              <h4 className="jira-sidebar-label"><Tag size={14} /> Labels</h4>
              <div className="label-grid">
                {LABEL_OPTIONS.map(label => (
                  <button
                    key={label.name}
                    className={`label-toggle ${labels.includes(label.name) ? 'label-toggle-active' : ''}`}
                    style={{
                      backgroundColor: labels.includes(label.name) ? label.bg : 'transparent',
                      color: label.color,
                      borderColor: labels.includes(label.name) ? label.color : `${label.color}40`,
                    }}
                    onClick={() => handleToggleLabel(label.name)}
                  >
                    {label.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Date */}
            <div className="jira-sidebar-section">
              <h4 className="jira-sidebar-label"><Calendar size={14} /> Start Date</h4>
              <input
                type="date"
                className="form-input date-input"
                value={startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
              />
            </div>

            {/* Due Date */}
            <div className="jira-sidebar-section">
              <h4 className="jira-sidebar-label">
                <Calendar size={14} /> Due Date
                {isOverdue && <span className="overdue-badge">Overdue</span>}
              </h4>
              <input
                type="date"
                className={`form-input date-input ${isOverdue ? 'date-input-overdue' : ''}`}
                value={dueDate}
                onChange={(e) => handleDateChange('dueDate', e.target.value)}
              />
            </div>

            {/* Timestamps */}
            <div className="jira-sidebar-section jira-timestamps">
              <div className="timestamp-row">
                <Clock size={12} />
                <span>Created {formatDate(card.createdAt)}</span>
              </div>
              {card.updatedAt && (
                <div className="timestamp-row">
                  <Clock size={12} />
                  <span>Updated {formatRelativeTime(card.updatedAt)}</span>
                </div>
              )}
            </div>

            {/* Delete */}
            <div className="jira-sidebar-section jira-danger">
              {showDeleteConfirm ? (
                <div className="delete-confirm">
                  <p>Delete this card?</p>
                  <div className="delete-confirm-actions">
                    <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                      <Trash2 size={14} /> Delete
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowDeleteConfirm(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button className="sidebar-btn sidebar-btn-danger" onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 size={14} /> Delete Card
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
