import React from 'react';
import '../styles/InsightPanel.css';

export default function InsightPanel({
  title,
  content,
  type = 'info',
  icon,
  actions,
  loading = false,
}) {
  if (loading) {
    return (
      <div className={`insight-panel insight-panel--${type} loading`}>
        <div className="insight-skeleton header"></div>
        <div className="insight-skeleton content short"></div>
        <div className="insight-skeleton content"></div>
      </div>
    );
  }

  return (
    <div className={`insight-panel insight-panel--${type}`}>
      <div className="insight-header">
        {icon && <span className="insight-icon">{icon}</span>}
        <h3 className="insight-title">{title}</h3>
      </div>
      <div className="insight-content">
        {typeof content === 'string' ? <p>{content}</p> : content}
      </div>
      {actions && (
        <div className="insight-actions">
          {actions.map((action, idx) => (
            <button
              key={idx}
              className={`insight-action insight-action--${action.variant || 'primary'}`}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
