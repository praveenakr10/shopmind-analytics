import React, { useState } from 'react';
import { api } from '../utils/api';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Legend,
} from 'recharts';
import './ComparePage.css';

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

export default function ComparePage() {
  const [seg1, setSeg1] = useState('premium');
  const [seg2, setSeg2] = useState('loyal');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ran, setRan] = useState(false);

  const handleCompare = async () => {
    if (seg1 === seg2) { setError('Please select two different segments'); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await api.compareStrategies(seg1, seg2);
      setComparison(data);
      setRan(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const s1 = comparison?.segment_1;
  const s2 = comparison?.segment_2;

  // Build radar data
  const radarMetrics = s1 && s2 ? [
    { metric: 'Avg Spend', s1: s1.avg_spend ? Math.min(s1.avg_spend / 100 * 100, 100) : 0, s2: s2.avg_spend ? Math.min(s2.avg_spend / 100 * 100, 100) : 0 },
    { metric: 'CLV Target', s1: s1.kpi_targets?.clv_increase_pct || 0, s2: s2.kpi_targets?.clv_increase_pct || 0 },
    { metric: 'Retention', s1: s1.kpi_targets?.retention_rate || 0, s2: s2.kpi_targets?.retention_rate || 0 },
    { metric: 'NPS', s1: (s1.kpi_targets?.nps_target || 0) / 100 * 100, s2: (s2.kpi_targets?.nps_target || 0) / 100 * 100 },
    { metric: 'Discount Cap', s1: 100 - (s1.recommended_discount_pct || 0), s2: 100 - (s2.recommended_discount_pct || 0) },
  ] : [];

  const barData = s1 && s2 ? [
    { metric: 'Avg Spend ($)', [s1.label?.split(' ')[0]]: s1.avg_spend, [s2.label?.split(' ')[0]]: s2.avg_spend },
    { metric: 'CLV Increase %', [s1.label?.split(' ')[0]]: s1.kpi_targets?.clv_increase_pct, [s2.label?.split(' ')[0]]: s2.kpi_targets?.clv_increase_pct },
    { metric: 'Retention %', [s1.label?.split(' ')[0]]: s1.kpi_targets?.retention_rate, [s2.label?.split(' ')[0]]: s2.kpi_targets?.retention_rate },
    { metric: 'NPS Target', [s1.label?.split(' ')[0]]: s1.kpi_targets?.nps_target, [s2.label?.split(' ')[0]]: s2.kpi_targets?.nps_target },
  ] : [];

  const s1Key = s1?.label?.split(' ')[0] || 'Seg1';
  const s2Key = s2?.label?.split(' ')[0] || 'Seg2';
  const s1Color = SEGMENTS.find(s => s.id === seg1)?.color || '#6366f1';
  const s2Color = SEGMENTS.find(s => s.id === seg2)?.color || '#10b981';

  return (
    <div>
      <div className="page-header">
        <h1>Segment Comparison</h1>
        <p>Side-by-side behavioral and strategic analysis across two segments</p>
      </div>

      {/* Selector */}
      <div className="compare-controls card" style={{ marginBottom: '1.75rem' }}>
        <div className="compare-selects">
          <div className="compare-select-wrap">
            <label>First Segment</label>
            <select value={seg1} onChange={e => setSeg1(e.target.value)}>
              {SEGMENTS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
            </select>
          </div>
          <div className="compare-vs">VS</div>
          <div className="compare-select-wrap">
            <label>Second Segment</label>
            <select value={seg2} onChange={e => setSeg2(e.target.value)}>
              {SEGMENTS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
            </select>
          </div>
        </div>
        <button className="compare-btn" onClick={handleCompare} disabled={loading}>
          {loading ? '⏳ Comparing...' : '⇄ Compare Segments'}
        </button>
      </div>

      {error && <div className="error-banner">⚠ {error}</div>}

      {ran && !loading && comparison && (
        <div>
          {/* Side by Side Cards */}
          <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
            {[s1, s2].map((seg, idx) => (
              <div key={idx} className="compare-seg-card card" style={{ '--sc': idx === 0 ? s1Color : s2Color }}>
                <div className="csc-header">
                  <span className="csc-icon">{SEGMENTS.find(s => s.id === (idx === 0 ? seg1 : seg2))?.icon}</span>
                  <div>
                    <h3>{seg?.label}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{seg?.campaign_type}</p>
                  </div>
                </div>
                <div className="csc-stats">
                  <div className="csc-stat"><span>Avg Spend</span><strong>${seg?.avg_spend?.toFixed(2)}</strong></div>
                  <div className="csc-stat"><span>Churn Risk</span><RiskBadge level={seg?.churn_risk} /></div>
                  <div className="csc-stat"><span>Margin Risk</span><RiskBadge level={seg?.margin_risk} /></div>
                  <div className="csc-stat"><span>Discount Cap</span><strong>{seg?.recommended_discount_pct}%</strong></div>
                  <div className="csc-stat"><span>Frequency</span><strong>{seg?.communication_frequency}</strong></div>
                  <div className="csc-stat"><span>Exp. ROI</span><strong style={{ color: '#10b981' }}>{seg?.expected_roi}</strong></div>
                </div>
                <div className="csc-actions">
                  {(seg?.top_actions || []).map((a, i) => (
                    <div key={i} className="csc-action">• {a}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid-2">
            <div className="card">
              <h3 style={{ marginBottom: '1.1rem' }}>KPI Comparison (Bar)</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} layout="vertical" barSize={20} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="metric" type="category" stroke="#64748b" tick={{ fontSize: 11 }} width={95} />
                  <Tooltip contentStyle={{ background: '#16163a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                  <Bar dataKey={s1Key} fill={s1Color} radius={[0, 4, 4, 0]} />
                  <Bar dataKey={s2Key} fill={s2Color} radius={[0, 4, 4, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '1.1rem' }}>Behavioral Radar</h3>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarMetrics}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Radar name={s1Key} dataKey="s1" stroke={s1Color} fill={s1Color} fillOpacity={0.25} />
                  <Radar name={s2Key} dataKey="s2" stroke={s2Color} fill={s2Color} fillOpacity={0.25} />
                  <Tooltip contentStyle={{ background: '#16163a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {!ran && (
        <div className="compare-empty card">
          <p>⇄ Select two segments and click <strong>Compare Segments</strong> to see a detailed side-by-side analysis</p>
        </div>
      )}
    </div>
  );
}
