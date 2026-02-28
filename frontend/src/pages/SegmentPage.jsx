import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell, PieChart, Pie,
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
    setLoading(true);
    setError(null);
    Promise.all([
      api.getSegment(id),
      api.getSegmentAffinity(id),
      api.getSegmentSentiment(id),
    ])
      .then(([seg, aff, sent]) => {
        setSegment(seg);
        setAffinity(aff);
        setSentiment(sent);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-wrap"><div className="spinner" /><p>Loading segment data...</p></div>;
  if (error) return <div className="error-banner">⚠ {error}</div>;
  if (!segment) return null;

  const stats = segment.stats || {};
  const catAffinity = affinity?.category_affinity || {};
  const catData = Object.entries(catAffinity)
    .map(([cat, score]) => ({ cat, score: +(score * 100).toFixed(1) }))
    .sort((a, b) => b.score - a.score);

  const seasonData = Object.entries(affinity?.season_affinity || {})
    .map(([season, val]) => ({ season, pct: +(val * 100).toFixed(1) }));

  const sentPie = [
    { name: 'Positive', value: sentiment?.positive_count || 0, fill: '#10b981' },
    { name: 'Neutral', value: sentiment?.neutral_count || 0, fill: '#f59e0b' },
    { name: 'Negative', value: sentiment?.negative_count || 0, fill: '#ef4444' },
  ].filter(d => d.value > 0);

  const statItems = [
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
  ];

  return (
    <div>
      <div className="seg-detail-header" style={{ '--seg-color': segment.color }}>
        <div className="seg-detail-back">
          <Link to="/">← Dashboard</Link>
        </div>
        <div className="seg-detail-title">
          <span className="seg-detail-icon">{segment.icon}</span>
          <div>
            <h1>{segment.label}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {stats.size?.toLocaleString() || 0} customers · {id} segment
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid" style={{ marginBottom: '1.75rem' }}>
        {statItems.map(item => (
          <div key={item.label} className="stat-item card">
            <div className="stat-label">{item.label}</div>
            <div className="stat-value">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
        {/* Category Affinity */}
        <div className="card">
          <h3 style={{ marginBottom: '1.1rem' }}>Category Affinity Score</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catData} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
              <YAxis dataKey="cat" type="category" stroke="#64748b" tick={{ fontSize: 12 }} width={80} />
              <Tooltip
                contentStyle={{ background: '#16163a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                formatter={v => [`${v}%`, 'Affinity']}
              />
              <Bar dataKey="score" fill={segment.color || '#6366f1'} radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Season Affinity */}
        <div className="card">
          <h3 style={{ marginBottom: '1.1rem' }}>Seasonal Purchase Pattern</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={seasonData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="season" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="%" />
              <Tooltip
                contentStyle={{ background: '#16163a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                formatter={v => [`${v}%`, 'Share']}
              />
              <Bar dataKey="pct" fill="#818cf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sentiment */}
      {sentPie.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '1.1rem' }}>Customer Sentiment Distribution</h3>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <ResponsiveContainer width="40%" height={200}>
              <PieChart>
                <Pie data={sentPie} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {sentPie.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#16163a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="sent-stats">
              <div className="sent-row"><span className="sent-dot" style={{ background: '#10b981' }}></span>
                <span>Positive</span><strong>{sentiment?.positive_count?.toLocaleString()} ({sentiment?.positive_pct}%)</strong>
              </div>
              <div className="sent-row"><span className="sent-dot" style={{ background: '#f59e0b' }}></span>
                <span>Neutral</span><strong>{sentiment?.neutral_count?.toLocaleString()} ({sentiment?.neutral_pct}%)</strong>
              </div>
              <div className="sent-row"><span className="sent-dot" style={{ background: '#ef4444' }}></span>
                <span>Negative</span><strong>{sentiment?.negative_count?.toLocaleString()} ({sentiment?.negative_pct}%)</strong>
              </div>
              <div className="sent-avg">
                Avg Rating: <strong>{sentiment?.avg_rating?.toFixed(2)}</strong> · Avg Spend: <strong>${sentiment?.avg_spend?.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
