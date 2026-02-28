import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { SEG_COLORS, TOOLTIP_STYLE, GRID_COLOR, AXIS_COLOR, fmtCurrency } from '../utils/chartConfig';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend,
} from 'recharts';
import './AffinityPage.css';

const LIFT_BADGE = {
  Strong: 'badge-blue',
  Moderate: 'badge-yellow',
  Weak: 'badge-gray',
};

function exportCsv(data, filename) {
  if (!data?.length) return;
  const keys = Object.keys(data[0]);
  const csv = [keys.join(','), ...data.map(r => keys.map(k => `"${r[k]}"`).join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = filename; a.click();
}

export default function AffinityPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minLift, setMinLift] = useState(1.0);

  useEffect(() => {
    api.getAffinity()
      .then(d => setData(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /><p>Mining affinity patterns...</p></div>;

  const segments = data?.segments || [];
  const categories = data?.categories || [];
  const matrix = data?.affinity_matrix || [];
  const rules = (data?.association_rules || []).filter(r => r.lift >= minLift);
  const bundles = data?.top_bundles || [];

  // Grouped bar chart: one group per category, bars per segment
  const groupedData = categories.map(cat => {
    const row = { cat };
    segments.forEach(seg => {
      const m = matrix.find(r => r.segment === seg);
      row[seg.split(' ')[0]] = m ? +(m[cat] * 100).toFixed(1) : 0;
    });
    return row;
  });

  const segKeys = segments.map(s => s.split(' ')[0]);

  return (
    <div>
      <div className="page-header">
        <h1>Product Affinity Analysis</h1>
        <p>
          Normalized category affinity per segment · Normalization: relative-to-segment-max
          · Association rules mined at support ≥ {(data?.min_support * 100 || 20).toFixed(0)}%
        </p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Top Bundles */}
      {bundles.length > 0 && (
        <div style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Top Product Bundles by Lift</h2>
          <div className="grid-3">
            {bundles.map((b, i) => (
              <div key={i} className="bundle-card card">
                <div className="bundle-rank">#{i + 1}</div>
                <div className="bundle-pair">
                  <span>{b.antecedent}</span>
                  <span className="bundle-arrow">→</span>
                  <span>{b.consequent}</span>
                </div>
                <div className="bundle-metrics">
                  <div><span>Lift</span><strong>{b.lift?.toFixed(3)}</strong></div>
                  <div><span>Confidence</span><strong>{(b.confidence * 100).toFixed(1)}%</strong></div>
                  <div><span>Support</span><strong>{(b.support * 100).toFixed(0)}%</strong></div>
                </div>
                <span className={`badge ${LIFT_BADGE[b.lift_strength] || 'badge-gray'}`}>{b.lift_strength} association</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Affinity Matrix Heatmap */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="section-header">
          <h3>Category Affinity Matrix</h3>
          <span className="chart-note">Scores normalized within each segment (max=1.0). Color intensity indicates relative affinity.</span>
        </div>
        <div className="affinity-table-wrap">
          <table className="affinity-table">
            <thead>
              <tr>
                <th>Segment</th>
                {categories.map(c => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {matrix.map(row => (
                <tr key={row.segment}>
                  <td className="seg-name-cell">
                    <span style={{ background: SEG_COLORS[row.segment], width: 8, height: 8, borderRadius: '50%', display: 'inline-block', marginRight: 6 }} />
                    {row.segment}
                  </td>
                  {categories.map(cat => {
                    const val = row[cat] ?? 0;
                    const pct = (val * 100).toFixed(1);
                    const alpha = (val * 0.85 + 0.05).toFixed(2);
                    return (
                      <td key={cat} className="heat-cell"
                        style={{ background: `rgba(91,106,249,${alpha})`, color: val > 0.5 ? '#fff' : 'var(--text-secondary)' }}>
                        {pct}%
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="heatmap-legend">
            <span>Low affinity</span>
            <div className="heatmap-gradient" />
            <span>High affinity</span>
          </div>
        </div>
      </div>

      {/* Grouped Bar Chart */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ marginBottom: '1.2rem' }}>Affinity Score by Category and Segment</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={groupedData} barGap={3} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis dataKey="cat" stroke={AXIS_COLOR} tick={{ fontSize: 12 }} />
            <YAxis stroke={AXIS_COLOR} tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v}%`, '']} />
            <Legend formatter={(name) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{name}</span>} />
            {segKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={Object.values(SEG_COLORS)[i]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Association Rules Table */}
      <div className="card">
        <div className="section-header" style={{ marginBottom: '1rem' }}>
          <div>
            <h3>Association Rules</h3>
            <span className="chart-note">Segment-level category co-occurrence analysis</span>
          </div>
          <div className="table-controls">
            <label style={{ marginRight: '0.5rem', fontSize: '0.8rem' }}>Min Lift:</label>
            <select value={minLift} onChange={e => setMinLift(+e.target.value)} style={{ width: 'auto', padding: '0.35rem 0.6rem' }}>
              <option value={1.0}>1.0+</option>
              <option value={1.5}>1.5+</option>
              <option value={2.0}>2.0+</option>
            </select>
            <button className="btn-ghost" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', marginLeft: '0.5rem' }}
              onClick={() => exportCsv(rules, 'association_rules.csv')}>
              Export CSV
            </button>
          </div>
        </div>

        {rules.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem 0' }}>No rules meet the selected lift threshold.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Antecedent</th>
                <th>Consequent</th>
                <th>Support</th>
                <th>Confidence</th>
                <th>Lift</th>
                <th>Strength</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-primary)' }}>{r.antecedent}</td>
                  <td style={{ color: 'var(--text-primary)' }}>{r.consequent}</td>
                  <td>{(r.support * 100).toFixed(1)}%</td>
                  <td>{(r.confidence * 100).toFixed(1)}%</td>
                  <td style={{ fontWeight: 600 }}>{r.lift?.toFixed(3)}</td>
                  <td><span className={`badge ${LIFT_BADGE[r.lift_strength] || 'badge-gray'}`}>{r.lift_strength}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
