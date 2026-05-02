import React, { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { List as ListType } from '../../types';
import { useBoard } from '../../store/BoardContext';
import Card from './Card';
import { Plus, X } from 'lucide-react';

interface ListProps {
  list: ListType;
  index: number;
}

const List: React.FC<ListProps> = ({ list, index }) => {
  const { cards, addCard } = useBoard();
  const listCards = cards.filter(card => card.listId === list.id);
  
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  const handleAddCard = async () => {
    if (newCardTitle.trim()) {
      await addCard(list.id, newCardTitle.trim());
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="list"
        >
          <div className="list-header" {...provided.dragHandleProps}>
            {list.title}
          </div>
          
          <Droppable droppableId={list.id} type="card">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="list-cards"
                style={{
                  backgroundColor: snapshot.isDraggingOver ? 'rgba(0,0,0,0.05)' : 'transparent',
                  transition: 'background-color 0.2s ease',
                }}
              >
                {listCards.map((card, index) => (
                  <Card key={card.id} card={card} index={index} />
                ))}
                {provided.placeholder}
                
                {isAddingCard && (
                  <div className="add-item-form">
                    <textarea
                      className="add-item-input"
                      placeholder="Enter a title for this card..."
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddCard();
                        }
                      }}
                      autoFocus
                    />
                    <div className="add-item-actions">
                      <button className="btn btn-primary" onClick={handleAddCard}>
                        Add card
                      </button>
                      <button className="cancel-btn" onClick={() => setIsAddingCard(false)}>
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Droppable>
          
          {!isAddingCard && (
            <div className="add-card-btn" onClick={() => setIsAddingCard(true)}>
              <Plus size={16} />
              <span>Add a card</span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default List;
