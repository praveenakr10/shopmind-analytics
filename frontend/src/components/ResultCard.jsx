function ResultCard({ prediction }) {
  return (
    <div className="card result-card">
      <h2>Customer Segment Analysis</h2>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Segment:</span>
          <span className="info-value segment-badge">{prediction.segment}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Next Interest:</span>
          <span className="info-value">{prediction.predicted_next_interest}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Preferred Shipping:</span>
          <span className="info-value">{prediction.preferred_shipping}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Discount Sensitivity:</span>
          <span className="info-value highlight">{prediction.discount_sensitivity_percent}%</span>
        </div>
        <div className="info-item">
          <span className="info-label">Average Spend:</span>
          <span className="info-value currency">${prediction.segment_avg_spend}</span>
        </div>
      </div>
    </div>
  );
}

export default ResultCard;