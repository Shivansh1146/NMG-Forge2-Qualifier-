import React, { useState, useEffect } from 'react';
import ActivityLog from './ActivityLog';

const CardModal = ({ card, listId, lists, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    label: '',
    assignee: '',
    due_date: '',
    list_id: listId
  });

  useEffect(() => {
    if (card) {
      setFormData({
        title: card.title || '',
        description: card.description || '',
        label: card.label || '',
        assignee: card.assignee || '',
        due_date: card.due_date ? card.due_date.split('T')[0] : '',
        list_id: card.list_id || listId
      });
    } else {
      setFormData(prev => ({ ...prev, list_id: listId }));
    }
  }, [card, listId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(card ? card.id : null, formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 style={{marginTop: 0}}>{card ? 'Edit Card' : 'New Card'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input 
              type="text" 
              name="title" 
              className="form-control"
              value={formData.title} 
              onChange={handleChange} 
              required 
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description" 
              className="form-control"
              value={formData.description} 
              onChange={handleChange} 
              rows="3"
            />
          </div>

          <div style={{display: 'flex', gap: '1rem'}}>
            <div className="form-group" style={{flex: 1}}>
              <label>List</label>
              <select 
                name="list_id" 
                className="form-control"
                value={formData.list_id} 
                onChange={handleChange}
                required
              >
                {lists.map(list => (
                  <option key={list.id} value={list.id}>{list.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group" style={{flex: 1}}>
              <label>Label</label>
              <select 
                name="label" 
                className="form-control"
                value={formData.label} 
                onChange={handleChange}
              >
                <option value="">None</option>
                <option value="Bug">Bug</option>
                <option value="Feature">Feature</option>
                <option value="Design">Design</option>
                <option value="Research">Research</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div style={{display: 'flex', gap: '1rem'}}>
            <div className="form-group" style={{flex: 1}}>
              <label>Assignee</label>
              <input 
                type="text" 
                name="assignee" 
                className="form-control"
                value={formData.assignee} 
                onChange={handleChange} 
                placeholder="e.g. John Doe"
              />
            </div>
            
            <div className="form-group" style={{flex: 1}}>
              <label>Due Date</label>
              <input 
                type="date" 
                name="due_date" 
                className="form-control"
                value={formData.due_date} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="modal-actions">
            {card && onDelete && (
              <button type="button" className="btn btn-danger" onClick={() => {
                if (window.confirm('Are you sure you want to delete this card?')) {
                  onDelete(card.id);
                }
              }}>
                Delete Card
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Card
            </button>
          </div>
        </form>

        {card && card.activities && card.activities.length > 0 && (
          <ActivityLog activities={card.activities} />
        )}
      </div>
    </div>
  );
};

export default CardModal;
