import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { SEG_COLORS, fmtCurrency } from '../utils/chartConfig';
import './StrategyPage.css';

const SEG_TABS = [
  { id: 'premium', label: 'Premium' },
  { id: 'loyal', label: 'Loyal' },
  { id: 'occasional', label: 'Occasional' },
  { id: 'discount', label: 'Discount' },
];

const PRIORITY_ORDER = ['premium', 'loyal', 'occasional', 'discount'];
const PRIORITY_LABELS = ['#1 — Focus First', '#2 — Retain & Grow', '#3 — Activate', '#4 — Manage Carefully'];

export default function StrategyPage() {
  const [allStrats, setAllStrats] = useState(null);
  const [activeId, setActiveId] = useState('premium');
  const [segStats, setSegStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getStrategies(), api.getSegments()])
      .then(([stratData, segsData]) => {
        setAllStrats(stratData.strategies || []);
        const stats = {};
        (segsData.segments || []).forEach(s => { stats[s.id] = s; });
        setSegStats(stats);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /><p>Loading strategies...</p></div>;

  const strat = allStrats?.find(s => s.segment_id === activeId) || {};
  const seg = segStats[activeId] || {};
  const color = SEG_COLORS[strat.segment_label] || '#7c89fa';

  // Dynamically computed revenue impact from real data
  const baseRevenue = (seg.avg_spend || 0) * (seg.size || 0);
  const roiPct = parseFloat((strat.expected_roi || '0').split('–')[0]) / 100;
  const revenueImpact = baseRevenue * roiPct;
  const discountRevenue = baseRevenue * (1 - (strat.recommended_discount_pct || 0) / 100);
  const noDiscountRevenue = baseRevenue * 1.15; // ~15% uplift without discount (conservative)

  const risk_color = { Low: 'badge-green', Medium: 'badge-yellow', High: 'badge-red' };
  const priority_idx = PRIORITY_ORDER.indexOf(activeId);

  return (
    <div>
      <div className="page-header">
        <h1>Segment Strategy Engine</h1>
        <p>Data-driven recommendations derived from behavioral segmentation and affinity analysis</p>
      </div>

      {/* Priority Ranking */}
      <div className="priority-row" style={{ marginBottom: '1.75rem' }}>
        <div className="priority-label-head">Segment Priority Ranking</div>
        <div className="priority-items">
          {PRIORITY_ORDER.map((id, i) => {
            const s = allStrats?.find(s => s.segment_id === id);
            const c = SEG_COLORS[s?.segment_label] || '#7c89fa';
            return (
              <div key={id} className={`priority-item ${activeId === id ? 'active' : ''}`}
                style={{ '--pc': c }} onClick={() => setActiveId(id)}>
                <div className="pr-rank">#{i + 1}</div>
                <div className="pr-label">{s?.segment_label?.split(' ')[0]}</div>
                <div className="pr-note">{PRIORITY_LABELS[i].split('— ')[1]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Segment Selector Tabs */}
      <div className="strat-tabs" style={{ marginBottom: '1.5rem' }}>
        {SEG_TABS.map(tab => (
          <button key={tab.id}
            className={`strat-tab ${activeId === tab.id ? 'active' : ''}`}
            style={{ '--tc': SEG_COLORS[allStrats?.find(s => s.segment_id === tab.id)?.segment_label] || '#7c89fa' }}
            onClick={() => setActiveId(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Verdict Box */}
      <div className="verdict-card card" style={{ '--vc': color, marginBottom: '1.5rem' }}>
        <div className="verdict-top">
          <div>
            <div className="verdict-seg">{strat.segment_label}</div>
            <div className="verdict-summary">{strat.strategic_summary}</div>
          </div>
          <div className="verdict-badges">
            <span className={`badge ${risk_color[strat.churn_risk] || 'badge-gray'}`}>Churn: {strat.churn_risk}</span>
            <span className={`badge ${risk_color[strat.margin_risk] || 'badge-gray'}`}>Margin Risk: {strat.margin_risk}</span>
            <span className="badge badge-blue">Priority #{priority_idx + 1}</span>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* KPI Targets */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>KPI Targets</h3>
          <div className="kpi-targets">
            <KpiTarget label="CLV Increase" value={`+${strat.kpi_targets?.clv_increase_pct}%`} />
            <KpiTarget label="Retention Rate" value={`${strat.kpi_targets?.retention_rate}%`} />
            <KpiTarget label="NPS Target" value={strat.kpi_targets?.nps_target} />
            <KpiTarget label="Discount Range" value={strat.recommended_discount_pct === 0 ? 'No discount' : `${strat.recommended_discount_pct}%`} />
            <KpiTarget label="Channel" value={strat.communication_frequency} />
            <KpiTarget label="Expected ROI" value={strat.expected_roi} accent />
          </div>
        </div>

        {/* Revenue Impact */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Estimated Revenue Impact</h3>
          <div className="rev-impact-grid">
            <RevImpact label="Baseline Revenue" value={fmtCurrency(baseRevenue)} note="Avg spend × segment size" />
            <RevImpact label="Projected Uplift" value={`+${fmtCurrency(revenueImpact)}`} note={`At ${strat.expected_roi} ROI range`} accent />
          </div>
          <div className="divider" />
          <h4 style={{ marginBottom: '0.85rem' }}>Discount Scenario</h4>
          <div className="discount-scenario">
            <div className="disc-option">
              <div className="disc-label">With {strat.recommended_discount_pct}% Discount</div>
              <div className="disc-revenue">{fmtCurrency(discountRevenue)}</div>
              <div className="disc-note">Lower margin, higher volume expected</div>
            </div>
            <div className="disc-divider">vs</div>
            <div className="disc-option disc-no">
              <div className="disc-label">Without Discount</div>
              <div className="disc-revenue">{fmtCurrency(noDiscountRevenue)}</div>
              <div className="disc-note">~15% organic uplift from loyalty tactics</div>
            </div>
          </div>
          <div className="meta-note">Note: Revenue figures use avg_spend × size from live dataset. Uplift is estimated from ROI range; actual results depend on campaign execution.</div>
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Recommended Actions</h3>
          <ul className="action-list">
            {(strat.actions || []).map((action, i) => (
              <li key={i} className="action-item">
                <span className="action-num" style={{ background: color }}>{i + 1}</span>
                {action}
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Campaign Details</h3>
          <div className="campaign-detail">
            <div className="cd-row"><span>Campaign Type</span><strong>{strat.campaign_type}</strong></div>
            <div className="cd-row"><span>Pricing Strategy</span><strong>{strat.pricing_intensity}</strong></div>
            <div className="cd-row"><span>Frequency</span><strong>{strat.communication_frequency}</strong></div>
          </div>
          <div className="divider" />
          <h4 style={{ marginBottom: '0.75rem' }}>Channels</h4>
          <div className="channel-tags">
            {(strat.channels || []).map(ch => <span key={ch} className="badge badge-blue">{ch}</span>)}
          </div>
          <div className="divider" />
          <h4 style={{ marginBottom: '0.75rem' }}>Upsell Opportunities</h4>
          <ul className="upsell-list">
            {(strat.upsell_ideas || []).map((u, i) => <li key={i}>{u}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

function KpiTarget({ label, value, accent }) {
  return (
    <div className="kpi-target">
      <div className={`kt-value ${accent ? 'kt-accent' : ''}`}>{value}</div>
      <div className="kt-label">{label}</div>
    </div>
  );
}

function RevImpact({ label, value, note, accent }) {
  return (
    <div className={`rev-impact-item ${accent ? 'ri-accent' : ''}`}>
      <div className="ri-value">{value}</div>
      <div className="ri-label">{label}</div>
      <div className="ri-note">{note}</div>
    </div>
  );
}
