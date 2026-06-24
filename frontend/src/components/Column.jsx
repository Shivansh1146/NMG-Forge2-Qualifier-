import React, { useState } from 'react';
import Card from './Card';

const Column = ({ list, cards, onEditClick, onDragStart, onDropItem, onAddClick, onMoveLeft, onMoveRight }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const cardId = e.dataTransfer.getData('cardId');
    if (cardId) {
      onDropItem(cardId, list.id);
    }
  };

  return (
    <div 
      className={`board-column ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-header">
        <span>{list.name}</span>
        <span className="badge">{cards.length}</span>
      </div>
      
      <div className="column-cards">
        {cards.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#a0aec0', padding: '1rem', fontSize: '0.875rem' }}>
            No matching cards
          </div>
        ) : (
          cards.map(card => (
            <Card 
              key={card.id} 
              card={card} 
              onEditClick={onEditClick}
              onDragStart={onDragStart}
              onMoveLeft={onMoveLeft}
              onMoveRight={onMoveRight}
            />
          ))
        )}
        <button className="add-card-btn" onClick={() => onAddClick(list.id)}>
          + Add Card
        </button>
      </div>
    </div>
  );
};

export default Column;
