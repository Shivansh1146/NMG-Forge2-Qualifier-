import React from 'react';

const ActivityLog = ({ activities }) => {
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
    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Activity Log</h3>
      <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {activities.map(act => (
          <div key={act.id} style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
            <span style={{ fontWeight: '500' }}>
              ● {act.action}
              {act.action === 'Moved' && act.from_column && act.to_column && (
                ` (${act.from_column} → ${act.to_column})`
              )}
            </span>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {timeAgo(act.timestamp || act.created_at)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityLog;
