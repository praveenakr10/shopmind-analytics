import React from 'react';
import '../styles/RiskIndicator.css';

export default function RiskIndicator({
  label,
  value,
  max = 100,
  severity = 'low',
  icon,
  description,
  loading = false,
}) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const determineSeverity = (val, maxVal) => {
    const pct = (val / maxVal) * 100;
    if (pct >= 70) return 'high';
    if (pct >= 40) return 'medium';
    return 'low';
  };

  const actualSeverity = severity || determineSeverity(value, max);

  if (loading) {
    return (
      <div className="risk-indicator loading">
        <div className="risk-skeleton label"></div>
        <div className="risk-skeleton bar"></div>
      </div>
    );
  }

  return (
    <div className={`risk-indicator risk-indicator--${actualSeverity}`}>
      <div className="risk-header">
        {icon && <span className="risk-icon">{icon}</span>}
        <div className="risk-info">
          <span className="risk-label">{label}</span>
          <span className="risk-value">{value.toFixed(1)}%</span>
        </div>
      </div>
      <div className="risk-bar-container">
        <div
          className={`risk-bar risk-bar--${actualSeverity}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {description && <p className="risk-description">{description}</p>}
    </div>
  );
}
