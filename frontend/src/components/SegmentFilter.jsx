import React from 'react';
import '../styles/SegmentFilter.css';

export default function SegmentFilter({ segments, selectedId, onSelect }) {
  const segmentList = Object.entries(segments || {}).map(([id, data]) => ({
    id,
    name: data.name || `Segment ${id}`,
    description: data.description || '',
  }));

  if (segmentList.length === 0) {
    return (
      <div className="filter-container">
        <p className="filter-empty">No segments available</p>
      </div>
    );
  }

  return (
    <div className="filter-container">
      <h3 className="filter-title">Select Segment</h3>
      <div className="segment-grid">
        {segmentList.map(segment => (
          <button
            key={segment.id}
            className={`segment-card ${selectedId === segment.id ? 'active' : ''}`}
            onClick={() => onSelect(segment.id)}
          >
            <div className="segment-name">{segment.name}</div>
            {segment.description && (
              <div className="segment-description">{segment.description}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
