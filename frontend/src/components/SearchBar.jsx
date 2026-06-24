import React from 'react';

const SearchBar = ({ search, setSearch, labelFilter, setLabelFilter, assigneeFilter, setAssigneeFilter, assignees }) => {
  const hasActiveFilters = search || labelFilter || assigneeFilter;

  const handleReset = () => {
    setSearch('');
    setLabelFilter('');
    setAssigneeFilter('');
  };

  return (
    <div className="search-toolbar">
      <input 
        type="text" 
        className="search-input" 
        placeholder="Search by title..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      <select 
        className="search-input"
        value={labelFilter}
        onChange={(e) => setLabelFilter(e.target.value)}
      >
        <option value="">All Labels</option>
        <option value="Bug">Bug</option>
        <option value="Feature">Feature</option>
        <option value="Design">Design</option>
        <option value="Research">Research</option>
        <option value="Urgent">Urgent</option>
      </select>

      <select 
        className="search-input"
        value={assigneeFilter}
        onChange={(e) => setAssigneeFilter(e.target.value)}
      >
        <option value="">All Assignees</option>
        {assignees.map(a => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>

      {hasActiveFilters && (
        <button 
          onClick={handleReset}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0', fontSize: '1.25rem' }}
          title="Reset filters"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;
