import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card as CardType, CARD_PRIORITIES, LABEL_OPTIONS, CARD_STATUSES } from '../../types';
import CardModal from '../Modals/CardModal';
import { MessageSquare, Calendar, AlertTriangle } from 'lucide-react';

interface CardProps {
  card: CardType;
  index: number;
}

const getDueDateInfo = (dueDate?: number | null) => {
  if (!dueDate) return null;
  const now = Date.now();
  const diff = dueDate - now;
  const dayMs = 86400000;

  if (diff < 0) return { className: 'due-overdue', label: 'Overdue' };
  if (diff < dayMs) return { className: 'due-today', label: 'Due today' };
  if (diff < dayMs * 2) return { className: 'due-soon', label: 'Due tomorrow' };
  return { className: 'due-normal', label: '' };
};

const formatShortDate = (ts: number) => {
  const d = new Date(ts);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
};

const Card: React.FC<CardProps> = ({ card, index }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const priority = CARD_PRIORITIES.find(p => p.value === card.priority);
  const status = CARD_STATUSES.find(s => s.value === card.status);
  const cardLabels = (card.labels || []).map(name => LABEL_OPTIONS.find(l => l.name === name)).filter(Boolean);
  const dueDateInfo = getDueDateInfo(card.dueDate);

  return (
    <>
      <Draggable draggableId={card.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="card"
            style={{
              ...provided.draggableProps.style,
              opacity: snapshot.isDragging ? 0.8 : 1,
              transform: snapshot.isDragging
                ? `${provided.draggableProps.style?.transform} rotate(3deg)`
                : provided.draggableProps.style?.transform,
              borderLeft: `3px solid ${priority?.color || '#8b949e'}`,
            }}
            onClick={() => setIsModalOpen(true)}
          >
            {/* Labels */}
            {cardLabels.length > 0 && (
              <div className="card-labels">
                {cardLabels.map(label => label && (
                  <span
                    key={label.name}
                    className="card-label-chip"
                    style={{ backgroundColor: label.bg, color: label.color }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <div className="card-title">{card.title}</div>

            {/* Meta row */}
            <div className="card-meta-row">
              <div className="card-meta-left">
                {/* Status pill */}
                {card.status && card.status !== 'open' && (
                  <span
                    className="card-status-pill"
                    style={{
                      backgroundColor: `${status?.color}20`,
                      color: status?.color,
                      borderColor: `${status?.color}40`,
                    }}
                  >
                    {status?.label}
                  </span>
                )}

                {/* Due date */}
                {card.dueDate && (
                  <span className={`card-due-badge ${dueDateInfo?.className || ''}`}>
                    <Calendar size={11} />
                    {formatShortDate(card.dueDate)}
                    {dueDateInfo?.className === 'due-overdue' && <AlertTriangle size={10} />}
                  </span>
                )}

                {/* Comments count */}
                {(card.commentCount ?? 0) > 0 && (
                  <span className="card-comment-badge">
                    <MessageSquare size={11} />
                    {card.commentCount}
                  </span>
                )}
              </div>

              {/* Assignee avatars */}
              {card.assignedTo && card.assignedTo.length > 0 && (
                <div className="card-assignees">
                  {card.assignedTo.slice(0, 3).map((email, i) => (
                    <div
                      key={email}
                      className="card-assignee-avatar"
                      title={email}
                      style={{ zIndex: 3 - i }}
                    >
                      {email.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {card.assignedTo.length > 3 && (
                    <div className="card-assignee-avatar card-assignee-more">
                      +{card.assignedTo.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Draggable>

      {isModalOpen && (
        <CardModal card={card} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

export default Card;
