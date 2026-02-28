import React from 'react';
import '../styles/SegmentBadge.css';

export default function SegmentBadge({
  label,
  variant = 'neutral',
  size = 'md',
  icon,
  selected = false,
  onClick,
  clickable = false,
  loading = false,
}) {
  if (loading) {
    return <div className="segment-badge skeleton"></div>;
  }

  const handleClick = clickable || selected ? onClick : undefined;

  return (
    <div
      className={`segment-badge segment-badge--${variant} segment-badge--${size} ${selected ? 'selected' : ''} ${clickable ? 'clickable' : ''}`}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : -1}
    >
      {icon && <span className="badge-icon">{icon}</span>}
      <span className="badge-label">{label}</span>
    </div>
  );
}
