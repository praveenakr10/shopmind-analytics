import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { SEG_COLORS, TOOLTIP_STYLE, GRID_COLOR, AXIS_COLOR, fmtCurrency } from '../utils/chartConfig';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, Cell,
} from 'recharts';
import './ComparePage.css';

const SEG_OPTIONS = [
  { value: 'premium', label: 'Premium Urgent Buyers' },
  { value: 'loyal', label: 'Loyal Frequent Buyers' },
  { value: 'occasional', label: 'Occasional Buyers' },
  { value: 'discount', label: 'Discount-Driven Shoppers' },
];

export default function ComparePage() {
  const [seg1, setSeg1] = useState('premium');
  const [seg2, setSeg2] = useState('loyal');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allSegs, setAllSegs] = useState(null);

  // Preload segments for financial data
  useEffect(() => {
    api.getSegments().then(d => {
      const m = {};
      (d.segments || []).forEach(s => { m[s.id] = s; });
      setAllSegs(m);
    });
  }, []);

  const compare = () => {
    if (seg1 === seg2) return;
    setLoading(true); setError(null);
    Promise.all([api.getSegment(seg1), api.getSegment(seg2)])
      .then(([s1, s2]) => setData({ s1, s2 }))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  const s1 = data?.s1; const s2 = data?.s2;
  const l1 = s1?.label || SEG_OPTIONS.find(o => o.value === seg1)?.label;
  const l2 = s2?.label || SEG_OPTIONS.find(o => o.value === seg2)?.label;
  const c1 = SEG_COLORS[l1] || '#7c89fa';
  const c2 = SEG_COLORS[l2] || '#34d399';

  const kpis = s1 && s2 ? [
    { key: 'avg_spend', label: 'Avg Spend', fmt: v => `$${v?.toFixed(2)}` },
    { key: 'avg_rating', label: 'Avg Rating', fmt: v => `${v?.toFixed(2)}` },
    { key: 'discount_usage_pct', label: 'Discount Usage', fmt: v => `${v?.toFixed(1)}%` },
    { key: 'subscription_rate_pct', label: 'Sub Rate', fmt: v => `${v?.toFixed(1)}%` },
  ] : [];

  // Bar chart: side-by-side stats
  const barData = s1 && s2 ? [
    { metric: 'Avg Spend', [l1?.split(' ')[0]]: s1.stats?.avg_spend, [l2?.split(' ')[0]]: s2.stats?.avg_spend },
    { metric: 'Avg Rating×10', [l1?.split(' ')[0]]: (s1.stats?.avg_rating || 0) * 10, [l2?.split(' ')[0]]: (s2.stats?.avg_rating || 0) * 10 },
    { metric: 'Discount %', [l1?.split(' ')[0]]: s1.stats?.discount_usage_pct, [l2?.split(' ')[0]]: s2.stats?.discount_usage_pct },
    { metric: 'Prev Purchases', [l1?.split(' ')[0]]: s1.stats?.avg_previous_purchases, [l2?.split(' ')[0]]: s2.stats?.avg_previous_purchases },
  ] : [];

  const k1 = l1?.split(' ')[0], k2 = l2?.split(' ')[0];

  // Radar chart
  const radarData = s1 && s2 ? [
    { axis: 'Spend', [k1]: Math.min((s1.stats?.avg_spend || 0) / 100, 1) * 100, [k2]: Math.min((s2.stats?.avg_spend || 0) / 100, 1) * 100 },
    { axis: 'Rating', [k1]: ((s1.stats?.avg_rating || 0) / 5) * 100, [k2]: ((s2.stats?.avg_rating || 0) / 5) * 100 },
    { axis: 'Frequency', [k1]: Math.min((s1.stats?.avg_previous_purchases || 0) / 50, 1) * 100, [k2]: Math.min((s2.stats?.avg_previous_purchases || 0) / 50, 1) * 100 },
    { axis: 'Loyalty', [k1]: 100 - (s1.stats?.discount_usage_pct || 0), [k2]: 100 - (s2.stats?.discount_usage_pct || 0) },
    { axis: 'Promo', [k1]: s1.stats?.promo_usage_pct || 0, [k2]: s2.stats?.promo_usage_pct || 0 },
  ] : [];

  // Financial comparison (from live data)
  const fin1 = allSegs?.[seg1];
  const fin2 = allSegs?.[seg2];
  const rev1 = fin1 ? (fin1.avg_spend || 0) * (fin1.size || 0) : 0;
  const rev2 = fin2 ? (fin2.avg_spend || 0) * (fin2.size || 0) : 0;
  const revDelta = rev1 - rev2;

  return (
    <div>
      <div className="page-header">
        <h1>Segment Comparison</h1>
        <p>Side-by-side behavioral and financial analysis of two customer segments</p>
      </div>

      {/* Selector */}
      <div className="compare-selector card" style={{ marginBottom: '1.5rem' }}>
        <div className="cs-row">
          <div className="cs-field">
            <label>Segment A</label>
            <select value={seg1} onChange={e => setSeg1(e.target.value)}>
              {SEG_OPTIONS.filter(o => o.value !== seg2).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="cs-vs">vs</div>
          <div className="cs-field">
            <label>Segment B</label>
            <select value={seg2} onChange={e => setSeg2(e.target.value)}>
              {SEG_OPTIONS.filter(o => o.value !== seg1).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <button className="btn-primary" style={{ padding: '0.65rem 1.5rem', flex: 'none' }} onClick={compare} disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} /> Comparing...</> : 'Compare Segments'}
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Financial Delta */}
      {fin1 && fin2 && (
        <div className="fin-delta-row" style={{ marginBottom: '1.5rem' }}>
          <div className="card fin-item">
            <div className="fi-val" style={{ color: c1 }}>${(rev1 / 1000).toFixed(1)}K</div>
            <div className="fi-label">{l1?.split(' ')[0]} Est. Revenue</div>
          </div>
          <div className="card fin-item delta">
            <div className="fi-val" style={{ color: revDelta >= 0 ? '#22c55e' : '#ef4444' }}>
              {revDelta >= 0 ? '+' : ''}{fmtCurrency(revDelta)}
            </div>
            <div className="fi-label">Revenue Delta (A − B)</div>
            <div className="fi-note">Higher = Segment A more valuable</div>
          </div>
          <div className="card fin-item">
            <div className="fi-val" style={{ color: c2 }}>${(rev2 / 1000).toFixed(1)}K</div>
            <div className="fi-label">{l2?.split(' ')[0]} Est. Revenue</div>
          </div>
        </div>
      )}

      {s1 && s2 && (
        <>
          {/* Side-by-side KPI cards */}
          <div className="compare-kpi-row" style={{ marginBottom: '1.5rem' }}>
            {[
              { label: 'Size', v1: s1.stats?.size?.toLocaleString(), v2: s2.stats?.size?.toLocaleString() },
              { label: 'Avg Spend', v1: `$${s1.stats?.avg_spend?.toFixed(2)}`, v2: `$${s2.stats?.avg_spend?.toFixed(2)}` },
              { label: 'Avg Rating', v1: s1.stats?.avg_rating?.toFixed(2), v2: s2.stats?.avg_rating?.toFixed(2) },
              { label: 'Discount %', v1: `${s1.stats?.discount_usage_pct?.toFixed(1)}%`, v2: `${s2.stats?.discount_usage_pct?.toFixed(1)}%` },
              { label: 'Promo %', v1: `${s1.stats?.promo_usage_pct?.toFixed(1)}%`, v2: `${s2.stats?.promo_usage_pct?.toFixed(1)}%` },
              { label: 'Prev Purchases', v1: s1.stats?.avg_previous_purchases?.toFixed(1), v2: s2.stats?.avg_previous_purchases?.toFixed(1) },
            ].map(item => (
              <div key={item.label} className="compare-kpi-card">
                <div className="ckc-label">{item.label}</div>
                <div className="ckc-vals">
                  <div style={{ color: c1 }}>{item.v1}</div>
                  <div style={{ color: c2 }}>{item.v2}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            {/* Bar Chart */}
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>KPI Comparison</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData} barGap={4} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="metric" stroke={AXIS_COLOR} tick={{ fontSize: 11 }} />
                  <YAxis stroke={AXIS_COLOR} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend formatter={n => <span style={{ color: '#94a3b8', fontSize: 12 }}>{n}</span>} />
                  <Bar dataKey={k1} fill={c1} radius={[4, 4, 0, 0]} />
                  <Bar dataKey={k2} fill={c2} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Chart */}
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Behavioral Profile Radar</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke={GRID_COLOR} />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: AXIS_COLOR, fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: AXIS_COLOR }} />
                  <Radar name={k1} dataKey={k1} stroke={c1} fill={c1} fillOpacity={0.18} />
                  <Radar name={k2} dataKey={k2} stroke={c2} fill={c2} fillOpacity={0.18} />
                  <Legend formatter={n => <span style={{ color: '#94a3b8', fontSize: 12 }}>{n}</span>} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v.toFixed(1)}`, '']} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {!s1 && !loading && (
        <div className="card compare-empty">
          Select two segments above and click <strong>Compare Segments</strong> to view side-by-side analysis.
        </div>
      )}
    </div>
  );
}
