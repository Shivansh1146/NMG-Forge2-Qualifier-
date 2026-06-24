import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Column from './Column';
import CardModal from './CardModal';
import SearchBar from './SearchBar';

const Board = () => {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [labelFilter, setLabelFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [assignees, setAssignees] = useState([]);
  
  const [editingCard, setEditingCard] = useState(null);
  const [activeListId, setActiveListId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchBoard();
  }, []);

  const fetchBoard = async () => {
    try {
      const response = await api.get('/boards');
      if (response.data && response.data.length > 0) {
        const boardData = response.data[0];
        setBoard(boardData);
        
        // Extract assignees
        const users = new Set();
        boardData.lists.forEach(list => {
          list.cards.forEach(card => {
            if (card.assignee) users.add(card.assignee);
          });
        });
        setAssignees(Array.from(users).filter(Boolean));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching board:', error);
      setLoading(false);
    }
  };

  const handleEditClick = (card) => {
    setEditingCard(card);
    setActiveListId(card.list_id);
    setIsModalOpen(true);
  };

  const handleAddClick = (listId) => {
    setEditingCard(null);
    setActiveListId(listId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCard(null);
  };

  const handleSaveCard = async (cardId, formData) => {
    try {
      if (cardId) {
        await api.put(`/cards/${cardId}`, formData);
      } else {
        await api.post('/cards', { ...formData, board_id: board.id });
      }
      fetchBoard();
      handleModalClose();
    } catch (error) {
      console.error('Error saving card:', error);
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await api.delete(`/cards/${cardId}`);
      fetchBoard();
      handleModalClose();
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const handleDragStart = (e, cardId) => {
    e.dataTransfer.setData('cardId', cardId);
  };

  const handleDropItem = async (cardId, targetListId) => {
    try {
      await api.patch(`/cards/${cardId}/move`, { list_id: targetListId });
      fetchBoard();
    } catch (error) {
      console.error('Error moving card:', error);
    }
  };

  if (loading) return <div style={{padding: '2rem'}}>Loading board data...</div>;
  if (!board) return <div style={{padding: '2rem'}}>No board found.</div>;

  const filteredLists = board.lists.map(list => {
    const filteredCards = list.cards.filter(card => {
      const matchSearch = card.title.toLowerCase().includes(search.toLowerCase());
      const matchLabel = labelFilter ? card.label === labelFilter : true;
      const matchAssignee = assigneeFilter ? card.assignee === assigneeFilter : true;
      return matchSearch && matchLabel && matchAssignee;
    });
    return { ...list, cards: filteredCards };
  });

  const handleMoveCard = async (cardId, direction, currentListId) => {
    const listIndex = board.lists.findIndex(l => l.id === currentListId);
    if (listIndex === -1) return;
    
    let targetListId;
    if (direction === 'left' && listIndex > 0) {
      targetListId = board.lists[listIndex - 1].id;
    } else if (direction === 'right' && listIndex < board.lists.length - 1) {
      targetListId = board.lists[listIndex + 1].id;
    }

    if (targetListId) {
      handleDropItem(cardId, targetListId);
    }
  };

  const handleTitleChange = async (e) => {
    const newTitle = e.target.value;
    setBoard({ ...board, name: newTitle });
    // In a real app we'd save this to backend, but no PUT /api/boards is required.
    try {
      await api.put(`/boards/${board.id}`, { name: newTitle });
    } catch(err) { /* ignore */ }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '1rem', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <input 
          type="text" 
          value={board.name} 
          onChange={handleTitleChange} 
          style={{ fontSize: '1.5rem', fontWeight: 'bold', border: 'none', background: 'transparent', outline: 'none', borderBottom: '2px solid transparent', flex: 1 }}
          onFocus={(e) => e.target.style.borderBottom = '2px solid var(--primary-color)'}
          onBlur={(e) => e.target.style.borderBottom = '2px solid transparent'}
        />
      </div>

      <SearchBar 
        search={search} setSearch={setSearch}
        labelFilter={labelFilter} setLabelFilter={setLabelFilter}
        assigneeFilter={assigneeFilter} setAssigneeFilter={setAssigneeFilter}
        assignees={assignees}
      />
      
      <div className="board-container">
        {filteredLists.map((list, index) => (
          <Column 
            key={list.id} 
            list={list} 
            cards={list.cards}
            onEditClick={handleEditClick}
            onAddClick={handleAddClick}
            onDragStart={handleDragStart}
            onDropItem={handleDropItem}
            onMoveLeft={index > 0 ? (cardId) => handleMoveCard(cardId, 'left', list.id) : null}
            onMoveRight={index < board.lists.length - 1 ? (cardId) => handleMoveCard(cardId, 'right', list.id) : null}
          />
        ))}
      </div>

      {isModalOpen && (
        <CardModal 
          card={editingCard}
          listId={activeListId}
          lists={board.lists}
          onClose={handleModalClose}
          onSave={handleSaveCard}
          onDelete={handleDeleteCard}
        />
      )}
    </div>
  );
};

export default Board;
