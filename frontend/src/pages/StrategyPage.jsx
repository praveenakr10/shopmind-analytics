import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import './StrategyPage.css';

const SEGMENTS = [
  { id: 'premium', label: 'Premium Urgent Buyers', icon: '💎', color: '#6366f1' },
  { id: 'loyal', label: 'Loyal Frequent Buyers', icon: '⭐', color: '#10b981' },
  { id: 'occasional', label: 'Occasional Buyers', icon: '🛍️', color: '#f59e0b' },
  { id: 'discount', label: 'Discount-Driven Shoppers', icon: '🏷️', color: '#ef4444' },
];

function RiskBadge({ level }) {
  const map = { Low: 'badge-green', Medium: 'badge-yellow', High: 'badge-red' };
  return <span className={`badge ${map[level] || 'badge-blue'}`}>{level}</span>;
}

function KPITarget({ icon, label, value, color }) {
  return (
    <div className="kpi-target-card" style={{ '--tc': color }}>
      <div className="kti-icon">{icon}</div>
      <div className="kti-value">{value}</div>
      <div className="kti-label">{label}</div>
    </div>
  );
}

export default function StrategyPage() {
  const [selectedId, setSelectedId] = useState('premium');
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getStrategy(selectedId)
      .then(d => { setStrategy(d); setError(null); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedId]);

  return (
    <div>
      <div className="page-header">
        <h1>Business Strategy Engine</h1>
        <p>AI-generated actionable recommendations per behavioral segment</p>
      </div>

      {/* Segment Selector */}
      <div className="strategy-tabs" style={{ marginBottom: '1.75rem' }}>
        {SEGMENTS.map(s => (
          <button
            key={s.id}
            className={`strat-tab ${selectedId === s.id ? 'active' : ''}`}
            style={{ '--sc': s.color }}
            onClick={() => setSelectedId(s.id)}
          >
            <span>{s.icon}</span>
            <span>{s.label.split(' ')[0]} {s.label.split(' ').slice(-1)}</span>
          </button>
        ))}
      </div>

      {error && <div className="error-banner">⚠ {error}</div>}

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /><p>Loading strategy...</p></div>
      ) : strategy ? (
        <div>
          {/* Header Card */}
          <div className="card strategy-hero" style={{ '--sc': strategy.color, marginBottom: '1.5rem' }}>
            <div className="strategy-hero-left">
              <div className="strategy-hero-icon">{strategy.icon}</div>
              <div>
                <h2>{strategy.segment_label}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                  {strategy.campaign_type}
                </p>
              </div>
            </div>
            <div className="strategy-hero-right">
              <div className="hero-stat"><span>Avg Spend</span><strong>${strategy.avg_spend?.toFixed(2)}</strong></div>
              <div className="hero-stat"><span>Expected ROI</span><strong style={{ color: '#10b981' }}>{strategy.expected_roi}</strong></div>
              <div className="hero-stat"><span>Churn Risk</span><RiskBadge level={strategy.churn_risk} /></div>
              <div className="hero-stat"><span>Margin Risk</span><RiskBadge level={strategy.margin_risk} /></div>
            </div>
          </div>

          {/* KPI Targets */}
          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            <KPITarget icon="📈" label="CLV Increase Target" value={`+${strategy.kpi_targets?.clv_increase_pct}%`} color="#10b981" />
            <KPITarget icon="🛡️" label="Retention Rate Target" value={`${strategy.kpi_targets?.retention_rate}%`} color="#6366f1" />
            <KPITarget icon="😊" label="NPS Target" value={strategy.kpi_targets?.nps_target} color="#f59e0b" />
          </div>

          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            {/* Recommended Actions */}
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Recommended Actions</h3>
              <div className="action-list">
                {(strategy.actions || []).map((action, i) => (
                  <div key={i} className="action-item">
                    <span className="action-num">{i + 1}</span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategy Details */}
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Campaign Configuration</h3>
              <div className="config-grid">
                <div className="config-item">
                  <span>Pricing Intensity</span>
                  <strong>{strategy.pricing_intensity}</strong>
                </div>
                <div className="config-item">
                  <span>Discount Cap</span>
                  <strong>{strategy.recommended_discount_pct}%</strong>
                </div>
                <div className="config-item">
                  <span>Contact Frequency</span>
                  <strong>{strategy.communication_frequency}</strong>
                </div>
                <div className="config-item">
                  <span>Retention Priority</span>
                  <strong>{strategy.retention_priority}</strong>
                </div>
                <div className="config-item" style={{ gridColumn: '1/-1' }}>
                  <span>Channels</span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                    {(strategy.channels || []).map((c, i) => (
                      <span key={i} className="badge badge-blue">{c}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <h4 style={{ marginBottom: '0.6rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Upsell Ideas</h4>
                {(strategy.upsell_ideas || []).map((idea, i) => (
                  <div key={i} className="upsell-item">💡 {idea}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Strategic Summary */}
          <div className="card strategy-summary">
            <h3 style={{ marginBottom: '0.75rem' }}>📊 Strategic Summary</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{strategy.strategic_summary}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
