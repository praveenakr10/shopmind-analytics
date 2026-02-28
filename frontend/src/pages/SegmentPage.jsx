import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { SEG_COLORS, TOOLTIP_STYLE, GRID_COLOR, AXIS_COLOR } from '../utils/chartConfig';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import './SegmentPage.css';

export default function SegmentPage() {
  const { id } = useParams();
  const [segment, setSegment] = useState(null);
  const [affinity, setAffinity] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true); setError(null);
    Promise.all([api.getSegment(id), api.getSegmentAffinity(id), api.getSegmentSentiment(id)])
      .then(([seg, aff, sent]) => {
        setSegment(seg); setAffinity(aff); setSentiment(sent);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-wrap"><div className="spinner" /><p>Loading segment profile...</p></div>;
  if (error) return <div className="error-banner">{error}</div>;
  if (!segment) return null;

  const stats = segment.stats || {};
  const color = SEG_COLORS[segment.label] || '#7c89fa';
  const catAff = affinity?.category_affinity || {};
  const catData = Object.entries(catAff)
    .map(([cat, score]) => ({ cat, score: +(score * 100).toFixed(1) }))
    .sort((a, b) => b.score - a.score);

  const seasonData = Object.entries(affinity?.season_affinity || {})
    .map(([season, val]) => ({ season, pct: +(val * 100).toFixed(1) }))
    .sort((a, b) => b.pct - a.pct);

  const sentPie = [
    { name: 'Positive', value: sentiment?.positive_count || 0, fill: '#22c55e' },
    { name: 'Neutral', value: sentiment?.neutral_count || 0, fill: '#eab308' },
    { name: 'Negative', value: sentiment?.negative_count || 0, fill: '#ef4444' },
  ].filter(d => d.value > 0);

  const statItems = [
    { label: 'Customers', value: (stats.size || 0).toLocaleString() },
    { label: 'Avg Spend', value: `$${stats.avg_spend?.toFixed(2) || 0}` },
    { label: 'Avg Rating', value: `${stats.avg_rating?.toFixed(2) || 0} / 5` },
    { label: 'Prev Purchases', value: stats.avg_previous_purchases?.toFixed(1) || 0 },
    { label: 'Subscription Rate', value: `${stats.subscription_rate_pct?.toFixed(1) || 0}%` },
    { label: 'Discount Usage', value: `${stats.discount_usage_pct?.toFixed(1) || 0}%` },
    { label: 'Promo Usage', value: `${stats.promo_usage_pct?.toFixed(1) || 0}%` },
    { label: 'Top Category', value: stats.top_category || 'N/A' },
    { label: 'Top Season', value: stats.top_season || 'N/A' },
    { label: 'Top Payment', value: stats.top_payment || 'N/A' },
    { label: 'Top Shipping', value: stats.top_shipping || 'N/A' },
    { label: 'Est. Segment Revenue', value: `$${(((stats.avg_spend || 0) * (stats.size || 0)) / 1000).toFixed(1)}K` },
  ];

  return (
    <div>
      {/* Back */}
      <Link to="/segment" className="seg-back-link">← All Segments</Link>

      {/* Header */}
      <div className="seg-header" style={{ '--sc': color }}>
        <div className="seg-header-info">
          <h1 style={{ color }}>{segment.label}</h1>
          <p>{(stats.size || 0).toLocaleString()} customers · Segment ID: {id}</p>
        </div>
        <div className="seg-header-kpi">
          <div><div className="shk-val">${stats.avg_spend?.toFixed(2)}</div><div className="shk-label">Avg Spend</div></div>
          <div><div className="shk-val">{stats.avg_rating?.toFixed(2)}</div><div className="shk-label">Avg Rating</div></div>
          <div><div className="shk-val">{stats.discount_usage_pct?.toFixed(1)}%</div><div className="shk-label">Discount Usage</div></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="seg-stat-grid" style={{ marginBottom: '1.75rem' }}>
        {statItems.map(item => (
          <div key={item.label} className="ssg-item card">
            <div className="ssg-value">{item.value}</div>
            <div className="ssg-label">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
        {/* Category Affinity */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Category Affinity Score</h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>Normalized within segment (max=1.0). Values show relative category preference.</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={catData} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
              <XAxis type="number" stroke={AXIS_COLOR} tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
              <YAxis dataKey="cat" type="category" stroke={AXIS_COLOR} tick={{ fontSize: 12 }} width={86} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v}%`, 'Affinity']} />
              <Bar dataKey="score" fill={color} radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Season */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Seasonal Purchase Pattern</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={seasonData} barSize={42}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="season" stroke={AXIS_COLOR} tick={{ fontSize: 12 }} />
              <YAxis stroke={AXIS_COLOR} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v}%`, 'Share']} />
              <Bar dataKey="pct" fill={color} radius={[6, 6, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sentiment */}
      {sentPie.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Customer Sentiment Distribution</h3>
          <div className="sent-layout">
            <ResponsiveContainer width="45%" height={200}>
              <PieChart>
                <Pie data={sentPie} dataKey="value" cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={3}>
                  {sentPie.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [v.toLocaleString(), 'Reviews']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="sent-stats">
              {sentPie.map(item => (
                <div key={item.name} className="sent-stat-row">
                  <span className="sent-dot" style={{ background: item.fill }} />
                  <span>{item.name}</span>
                  <strong>{item.value.toLocaleString()}</strong>
                </div>
              ))}
              <div className="sent-footer">
                Avg Rating: <strong>{sentiment?.avg_rating?.toFixed(2)}</strong>
                {' · '}Avg Spend: <strong>${sentiment?.avg_spend?.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
