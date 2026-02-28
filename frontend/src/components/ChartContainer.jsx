import React from 'react';
import '../styles/ChartContainer.css';

export default function ChartContainer({
  title,
  children,
  loading = false,
  error = null,
  fullWidth = false,
}) {
  if (loading) {
    return (
      <div className={`chart-container chart-container--loading ${fullWidth ? 'full-width' : ''}`}>
        <div className="chart-skeleton title"></div>
        <div className="chart-skeleton content large"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`chart-container chart-container--error ${fullWidth ? 'full-width' : ''}`}>
        <h3 className="chart-title">{title}</h3>
        <div className="chart-error">
          <p>Failed to load chart data</p>
          <p className="error-detail">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`chart-container ${fullWidth ? 'full-width' : ''}`}>
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="chart-content">
        {children}
      </div>
    </div>
  );
}
