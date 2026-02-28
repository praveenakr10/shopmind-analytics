import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import './SentimentPage.css';

const SENT_COLORS = { Positive: '#10b981', Neutral: '#f59e0b', Negative: '#ef4444' };
const SEG_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

function SentimentBar({ label, pct, color }) {
  return (
    <div className="sent-bar-row">
      <span className="sent-bar-label">{label}</span>
      <div className="sent-bar-track">
        <div className="sent-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="sent-bar-pct">{pct}%</span>
    </div>
  );
}

export default function SentimentPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getSentiment()
      .then(d => { setData(d); setError(null); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /><p>Analyzing sentiment...</p></div>;
  if (error) return <div className="error-banner">⚠ {error}</div>;
  if (!data) return null;

  const overall = data.overall || {};
  const perSeg = data.per_segment || [];
  const perCat = data.per_category || [];

  const overallPie = [
    { name: 'Positive', value: overall.positive_count || 0 },
    { name: 'Neutral', value: overall.neutral_count || 0 },
    { name: 'Negative', value: overall.negative_count || 0 },
  ].filter(d => d.value > 0);

  const avgRatingData = perCat.map(c => ({ cat: c.category, rating: c.avg_rating }))
    .sort((a, b) => b.rating - a.rating);

  const segBarData = perSeg.map(s => ({
    seg: s.segment.split(' ')[0],
    Positive: s.positive_pct,
    Neutral: s.neutral_pct,
    Negative: s.negative_pct,
    rating: s.avg_rating,
  }));

  return (
    <div>
      <div className="page-header">
        <h1>Customer Sentiment Analysis</h1>
        <p>NLP sentiment scores derived from review ratings · {overall.total?.toLocaleString() || 0} total reviews</p>
      </div>

      {/* Overall KPIs */}
      <div className="grid-3" style={{ marginBottom: '1.75rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="sent-kpi-label">Overall Sentiment</div>
          <div className="sent-kpi-value" style={{ color: overall.sentiment_label === 'Positive' ? '#10b981' : overall.sentiment_label === 'Negative' ? '#ef4444' : '#f59e0b' }}>
            {overall.sentiment_label}
          </div>
          <div className="sent-kpi-sub">Avg score: {((overall.avg_score || 0) * 100).toFixed(1)}%</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="sent-kpi-label">Avg Review Rating</div>
          <div className="sent-kpi-value" style={{ color: '#f59e0b' }}>{overall.avg_rating?.toFixed(2)} ★</div>
          <div className="sent-kpi-sub">Out of 5.0</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="sent-kpi-label">Positive Rate</div>
          <div className="sent-kpi-value" style={{ color: '#10b981' }}>{overall.positive_pct}%</div>
          <div className="sent-kpi-sub">{overall.positive_count?.toLocaleString()} customers</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
        {/* Overall Pie */}
        <div className="card">
          <h3 style={{ marginBottom: '1.1rem' }}>Overall Sentiment Distribution</h3>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={overallPie} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {overallPie.map((e, i) => <Cell key={i} fill={SENT_COLORS[e.name]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#16163a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              <SentimentBar label="Positive" pct={overall.positive_pct || 0} color="#10b981" />
              <SentimentBar label="Neutral" pct={overall.neutral_pct || 0} color="#f59e0b" />
              <SentimentBar label="Negative" pct={overall.negative_pct || 0} color="#ef4444" />
            </div>
          </div>
        </div>

        {/* Segment Stacked */}
        <div className="card">
          <h3 style={{ marginBottom: '1.1rem' }}>Sentiment Split by Segment</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={segBarData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="seg" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#16163a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} formatter={v => [`${v}%`, '']} />
              <Bar dataKey="Positive" stackId="s" fill="#10b981" />
              <Bar dataKey="Neutral" stackId="s" fill="#f59e0b" />
              <Bar dataKey="Negative" stackId="s" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per Segment Detail */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ marginBottom: '1.1rem' }}>Segment Sentiment Detail</h3>
        <table className="sent-table">
          <thead>
            <tr>
              <th>Segment</th><th>Size</th><th>Avg Rating</th><th>Avg Spend</th>
              <th>Positive %</th><th>Neutral %</th><th>Negative %</th><th>Label</th>
            </tr>
          </thead>
          <tbody>
            {perSeg.map((s, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>
                  <span style={{ marginRight: 6 }}>{s.icon}</span>{s.segment}
                </td>
                <td>{s.size?.toLocaleString()}</td>
                <td>{s.avg_rating?.toFixed(2)}</td>
                <td>${s.avg_spend?.toFixed(2)}</td>
                <td style={{ color: '#10b981' }}>{s.positive_pct}%</td>
                <td style={{ color: '#f59e0b' }}>{s.neutral_pct}%</td>
                <td style={{ color: '#ef4444' }}>{s.negative_pct}%</td>
                <td>
                  <span className={`badge badge-${s.sentiment_label === 'Positive' ? 'green' : s.sentiment_label === 'Negative' ? 'red' : 'yellow'}`}>
                    {s.sentiment_label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Category Ratings */}
      <div className="card">
        <h3 style={{ marginBottom: '1.1rem' }}>Avg Review Rating by Category</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={avgRatingData} layout="vertical" barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 5]} />
            <YAxis dataKey="cat" type="category" stroke="#64748b" tick={{ fontSize: 12 }} width={90} />
            <Tooltip contentStyle={{ background: '#16163a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} formatter={v => [v?.toFixed(2), 'Avg Rating']} />
            <Bar dataKey="rating" fill="#818cf8" radius={[0, 5, 5, 0]}>
              {avgRatingData.map((e, i) => <Cell key={i} fill={e.rating >= 4 ? '#10b981' : e.rating >= 3.5 ? '#f59e0b' : '#ef4444'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
