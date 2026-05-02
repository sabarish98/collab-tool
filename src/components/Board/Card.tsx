import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card as CardType } from '../../types';
import CardModal from '../Modals/CardModal';

interface CardProps {
  card: CardType;
  index: number;
}

const Card: React.FC<CardProps> = ({ card, index }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
              transform: snapshot.isDragging ? `${provided.draggableProps.style?.transform} rotate(3deg)` : provided.draggableProps.style?.transform,
            }}
            onClick={() => setIsModalOpen(true)}
          >
            <div className="card-title">{card.title}</div>
            {card.description && (
              <div className="card-badges">
                <div className="card-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
                </div>
              </div>
            )}
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
