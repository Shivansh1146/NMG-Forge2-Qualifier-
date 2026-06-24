import React from 'react';

const Card = ({ card, onEditClick, onDragStart, onMoveLeft, onMoveRight }) => {
  const isOverdue = card.due_date && new Date(card.due_date) < new Date();
  
  const getLabelColor = (label) => {
    const map = {
      'Bug': 'var(--bug-color)',
      'Feature': 'var(--feature-color)',
      'Design': 'var(--design-color)',
      'Research': 'var(--research-color)',
      'Urgent': 'var(--urgent-color)'
    };
    return map[label] || '#cbd5e0';
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    const days = Math.floor(diff/86400);
    if (days === 1) return 'yesterday';
    return `${days}d ago`;
  };

  return (
    <div 
      className="card" 
      draggable="true" 
      onDragStart={(e) => { e.target.classList.add('dragging'); onDragStart(e, card.id); }}
      onDragEnd={(e) => e.target.classList.remove('dragging')}
      onClick={() => onEditClick(card)}
      style={{ borderLeftColor: getLabelColor(card.label) }}
    >
      <div className="card-meta">
        {card.label && (
          <span className="label-badge" style={{ backgroundColor: getLabelColor(card.label) }}>
            {card.label}
          </span>
        )}
      </div>
      
      <h3 className="card-title">{card.title}</h3>
      {card.description && <p className="card-desc">{card.description}</p>}
      
      <div className="card-meta">
        {card.due_date && (
          <span className={`due-date ${isOverdue ? 'overdue' : ''}`}>
            due {new Date(card.due_date).toLocaleDateString()}
          </span>
        )}
        
        {card.assignee && (
          <div className="avatar" title={card.assignee}>
            {card.assignee.substring(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      {card.activities && card.activities.length > 0 && (
        <div className="card-activity">
          ● {card.activities[0].action} {card.activities[0].to_column ? `to ${card.activities[0].to_column}` : ''} · {timeAgo(card.activities[0].timestamp || card.activities[0].created_at)}
        </div>
      )}
      
      <div className="card-actions" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={(e) => { e.stopPropagation(); onMoveLeft && onMoveLeft(card.id); }} 
          disabled={!onMoveLeft}
          style={{ visibility: onMoveLeft ? 'visible' : 'hidden' }}
        >←</button>
        <button 
          onClick={(e) => { e.stopPropagation(); onMoveRight && onMoveRight(card.id); }} 
          disabled={!onMoveRight}
          style={{ visibility: onMoveRight ? 'visible' : 'hidden' }}
        >→</button>
      </div>
    </div>
  );
};

export default Card;
