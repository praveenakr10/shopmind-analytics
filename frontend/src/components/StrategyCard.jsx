function StrategyCard({ strategy }) {
  return (
    <div className="card strategy">
      <h2>AI Strategy Recommendation</h2>
      
      <div className="strategy-grid">
        <div className="strategy-item">
          <span className="strategy-label">Discount Strategy</span>
          <span className="strategy-value">{strategy.discount_strategy}</span>
        </div>
        <div className="strategy-item">
          <span className="strategy-label">Campaign Type</span>
          <span className="strategy-value">{strategy.campaign_type}</span>
        </div>
        <div className="strategy-item">
          <span className="strategy-label">Margin Risk</span>
          <span className="strategy-value">{strategy.margin_risk}</span>
        </div>
        <div className="strategy-item">
          <span className="strategy-label">Pricing Intensity</span>
          <span className="strategy-value">{strategy.pricing_intensity}</span>
        </div>
        <div className="strategy-item">
          <span className="strategy-label">Recommended Discount</span>
          <span className="strategy-value highlight">{strategy.recommended_discount_percent}%</span>
        </div>
        <div className="strategy-item">
          <span className="strategy-label">Churn Risk</span>
          <span className="strategy-value">{strategy.churn_risk_level}</span>
        </div>
        <div className="strategy-item">
          <span className="strategy-label">Inventory Focus</span>
          <span className="strategy-value">{strategy.inventory_focus}</span>
        </div>
      </div>

      <div className="upsell-section">
        <h3>Upsell Ideas</h3>
        <ul className="upsell-list">
          {strategy.upsell_ideas?.map((idea, i) => (
            <li key={i}><span className="bullet">→</span> {idea}</li>
          ))}
        </ul>
      </div>

      <div className="summary">
        <strong>Executive Summary</strong>
        <p>{strategy.strategic_summary_for_store_owner}</p>
      </div>
    </div>
  );
}

export default StrategyCard;