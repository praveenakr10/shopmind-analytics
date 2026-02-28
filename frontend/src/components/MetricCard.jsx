import React from 'react';
import '../styles/MetricCard.css';

export default function MetricCard({
  label,
  value,
  delta,
  unit = '',
  color = 'neutral',
  icon,
  trend,
  loading = false,
}) {
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '';
  const trendClass = trend === 'up' ? 'positive' : trend === 'down' ? 'negative' : '';

  if (loading) {
    return (
      <div className={`metric-card metric-card--${color} loading`}>
        <div className="metric-skeleton label"></div>
        <div className="metric-skeleton value"></div>
      </div>
    );
  }

  return (
    <div className={`metric-card metric-card--${color}`}>
      <div className="metric-header">
        {icon && <span className="metric-icon">{icon}</span>}
        <span className="metric-label">{label}</span>
      </div>
      <div className="metric-body">
        <div className="metric-value">
          {value}
          {unit && <span className="metric-unit">{unit}</span>}
        </div>
        {(delta !== undefined || trend) && (
          <div className={`metric-delta ${trendClass}`}>
            {trendIcon && <span className="trend-arrow">{trendIcon}</span>}
            {delta !== undefined && <span>{Math.abs(delta)}%</span>}
          </div>
        )}
      </div>
    </div>
  );
}
