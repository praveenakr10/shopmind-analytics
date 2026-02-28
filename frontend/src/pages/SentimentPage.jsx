import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { SEG_COLORS, TOOLTIP_STYLE, GRID_COLOR, AXIS_COLOR, STATUS_COLORS, fmtCurrency } from '../utils/chartConfig';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  PieChart, Pie, Legend, ResponsiveContainer,
} from 'recharts';
import './SentimentPage.css';

function exportCsv(data, filename) {
  if (!data?.length) return;
  const keys = Object.keys(data[0]);
  const csv = [keys.join(','), ...data.map(r => keys.map(k => `"${r[k]}"`).join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = filename; a.click();
}

export default function SentimentPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getSentiment()
      .then(d => setData(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /><p>Analyzing sentiment...</p></div>;

  const overall = data?.overall || {};
  const segs = data?.per_segment || [];
  const cats = data?.per_category || [];

  // At-risk segments: negative_pct > 15%
  const atRisk = segs.filter(s => (s.negative_pct || 0) > 15);
  const atRiskIds = new Set(atRisk.map(s => s.segment));

  const pieSentiment = [
    { name: 'Positive', value: overall.positive_count || 0, fill: STATUS_COLORS.positive },
    { name: 'Neutral', value: overall.neutral_count || 0, fill: STATUS_COLORS.neutral },
    { name: 'Negative', value: overall.negative_count || 0, fill: STATUS_COLORS.negative },
  ].filter(d => d.value > 0);

  const segBarData = segs.map(s => ({
    name: s.segment?.split(' ')[0],
    Positive: s.positive_count,
    Neutral: s.neutral_count,
    Negative: s.negative_count,
    color: SEG_COLORS[s.segment],
  }));

  const catBarData = [...cats]
    .sort((a, b) => b.avg_rating - a.avg_rating)
    .map(c => ({ name: c.category, rating: c.avg_rating, score: +(c.score * 100).toFixed(0) }));

  return (
    <div>
      <div className="page-header">
        <h1>Sentiment Analysis</h1>
        <p>NLP-based sentiment derived from review ratings across {overall.total?.toLocaleString()} reviews</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* At-risk banner */}
      {atRisk.length > 0 && (
        <div className="at-risk-banner" style={{ marginBottom: '1.5rem' }}>
          <span className="at-risk-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L14 14H2L8 2z" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round" /><path d="M8 6v4M8 11v1" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </span>
          <div>
            <strong>Churn Risk Detected</strong>
            <span> — {atRisk.map(s => s.segment).join(', ')} show {atRisk.map(s => s.negative_pct?.toFixed(1) + '% negative').join(', ')} sentiment. Consider targeted retention campaigns.</span>
          </div>
        </div>
      )}

      {/* Overall KPIs */}
      <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
        <SentKpi label="Overall Rating" value={overall.avg_rating?.toFixed(2)} sub="/ 5.0 avg" />
        <SentKpi label="Positive Reviews" value={`${overall.positive_pct?.toFixed(1)}%`} sub={`${overall.positive_count?.toLocaleString()} reviews`} color={STATUS_COLORS.positive} />
        <SentKpi label="Neutral Reviews" value={`${overall.neutral_pct?.toFixed(1)}%`} sub={`${overall.neutral_count?.toLocaleString()} reviews`} color={STATUS_COLORS.neutral} />
        <SentKpi label="Negative Reviews" value={`${overall.negative_pct?.toFixed(1)}%`} sub={`${overall.negative_count?.toLocaleString()} reviews`} color={STATUS_COLORS.negative} />
      </div>

      <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
        {/* Pie */}
        <div className="card">
          <h3 style={{ marginBottom: '1.1rem' }}>Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieSentiment} dataKey="value" cx="50%" cy="50%" innerRadius={62} outerRadius={95} paddingAngle={3}>
                {pieSentiment.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [v.toLocaleString(), 'Reviews']} />
              <Legend iconType="circle" formatter={n => <span style={{ color: '#94a3b8', fontSize: 12 }}>{n}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Ratings */}
        <div className="card">
          <h3 style={{ marginBottom: '1.1rem' }}>Category Rating Comparison</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={catBarData} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
              <XAxis type="number" stroke={AXIS_COLOR} tick={{ fontSize: 11 }} domain={[3, 5]} tickFormatter={v => v.toFixed(1)} />
              <YAxis dataKey="name" type="category" stroke={AXIS_COLOR} tick={{ fontSize: 12 }} width={86} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [v.toFixed(2), 'Avg Rating']} />
              <Bar dataKey="rating" radius={[0, 5, 5, 0]} fill={TOOLTIP_STYLE.background}>
                {catBarData.map((_, i) => <Cell key={i} fill={['#7c89fa', '#34d399', '#fbbf24', '#f87171'][i % 4]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segment Sentiment Stacked Bar */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ marginBottom: '1.1rem' }}>Sentiment by Segment</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={segBarData} barSize={46}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis dataKey="name" stroke={AXIS_COLOR} tick={{ fontSize: 12 }} />
            <YAxis stroke={AXIS_COLOR} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend iconType="circle" formatter={n => <span style={{ color: '#94a3b8', fontSize: 12 }}>{n}</span>} />
            <Bar dataKey="Positive" stackId="s" fill={STATUS_COLORS.positive} />
            <Bar dataKey="Neutral" stackId="s" fill={STATUS_COLORS.neutral} />
            <Bar dataKey="Negative" stackId="s" fill={STATUS_COLORS.negative} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Segment Detail Table */}
      <div className="card">
        <div className="section-header">
          <h3>Segment Sentiment Detail</h3>
          <button className="btn-ghost" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
            onClick={() => exportCsv(segs.map(s => ({
              Segment: s.segment, Size: s.size, AvgRating: s.avg_rating,
              PositivePct: s.positive_pct, NeutralPct: s.neutral_pct, NegativePct: s.negative_pct,
            })), 'sentiment_by_segment.csv')}>
            Export CSV
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Segment</th><th>Size</th><th>Avg Rating</th>
                <th>Positive</th><th>Neutral</th><th>Negative</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {segs.map(s => {
                const isAt = atRiskIds.has(s.segment);
                const label = s.sentiment_label || 'Neutral';
                const bClass = label === 'Positive' ? 'badge-green' : label === 'Negative' ? 'badge-red' : 'badge-yellow';
                return (
                  <tr key={s.segment} className={isAt ? 'at-risk-row' : ''}>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      {isAt && <span className="risk-dot" title="At-risk segment" />}
                      {s.segment}
                    </td>
                    <td>{s.size?.toLocaleString()}</td>
                    <td>{s.avg_rating?.toFixed(2)}</td>
                    <td style={{ color: STATUS_COLORS.positive }}>{s.positive_pct?.toFixed(1)}%</td>
                    <td style={{ color: STATUS_COLORS.neutral }}>{s.neutral_pct?.toFixed(1)}%</td>
                    <td style={{ color: STATUS_COLORS.negative }}>{s.negative_pct?.toFixed(1)}%</td>
                    <td><span className={`badge ${bClass}`}>{label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SentKpi({ label, value, sub, color }) {
  return (
    <div className="sent-kpi card">
      <div className="sk-value" style={{ color: color || 'var(--text-primary)' }}>{value}</div>
      <div className="sk-label">{label}</div>
      {sub && <div className="sk-sub">{sub}</div>}
    </div>
  );
}
