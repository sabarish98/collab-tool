import React, { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useBoard } from '../../store/BoardContext';
import List from './List';
import { Plus, X } from 'lucide-react';

const Board: React.FC = () => {
  const { board, lists, loading, reorderLists, moveCard, addList } = useBoard();
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  if (loading) {
    return <div style={{ padding: '2rem', color: 'white' }}>Loading board...</div>;
  }

  if (!board) {
    return <div style={{ padding: '2rem', color: 'white' }}>No board found.</div>;
  }

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, type } = result;

    // Dropped outside the list
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'list') {
      reorderLists(source.index, destination.index);
    } else if (type === 'card') {
      moveCard(result.draggableId, source.droppableId, destination.droppableId, destination.index);
    }
  };

  const handleAddList = async () => {
    if (newListTitle.trim()) {
      await addList(newListTitle.trim());
      setNewListTitle('');
      setIsAddingList(false);
    }
  };

  return (
    <div className="board-container">
      <div className="board-header">
        <h1 className="board-title">{board.title}</h1>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="all-lists" direction="horizontal" type="list">
          {(provided) => (
            <div
              className="board-lists"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {lists.map((list, index) => (
                <List key={list.id} list={list} index={index} />
              ))}
              {provided.placeholder}
              
              <div className="list" style={{ backgroundColor: isAddingList ? '#ebecf0' : 'rgba(255,255,255,0.2)', color: isAddingList ? '#172b4d' : 'white' }}>
                {isAddingList ? (
                  <div className="add-item-form">
                    <input
                      type="text"
                      className="add-item-input"
                      placeholder="Enter list title..."
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddList();
                      }}
                      autoFocus
                    />
                    <div className="add-item-actions">
                      <button className="btn btn-primary" onClick={handleAddList}>
                        Add list
                      </button>
                      <button className="cancel-btn" onClick={() => setIsAddingList(false)}>
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="add-card-btn" 
                    style={{ color: 'inherit' }}
                    onClick={() => setIsAddingList(true)}
                  >
                    <Plus size={16} />
                    <span>Add another list</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default Board;
