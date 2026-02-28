import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ScatterChart, Scatter, ZAxis,
} from 'recharts';
import './AffinityPage.css';

const SEGMENTS = ['Premium Urgent Buyers', 'Loyal Frequent Buyers', 'Occasional Buyers', 'Discount-Driven Shoppers'];
const SEG_COLORS = { 'Premium Urgent Buyers': '#6366f1', 'Loyal Frequent Buyers': '#10b981', 'Occasional Buyers': '#f59e0b', 'Discount-Driven Shoppers': '#ef4444' };
const SEG_SHORT = { 'Premium Urgent Buyers': 'Premium', 'Loyal Frequent Buyers': 'Loyal', 'Occasional Buyers': 'Occasional', 'Discount-Driven Shoppers': 'Discount' };

function LiftBadge({ lift }) {
  const color = lift >= 2 ? '#10b981' : lift >= 1.3 ? '#f59e0b' : '#94a3b8';
  return <span style={{ color, fontWeight: 600 }}>{lift?.toFixed(3)}</span>;
}

export default function AffinityPage() {
  const [data, setData] = useState(null);
  const [rules, setRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSegment, setActiveSegment] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getAffinity(), api.getAffinityRules(1.0)])
      .then(([aff, r]) => {
        setData(aff);
        setRules(r);
        setError(null);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /><p>Mining association rules...</p></div>;
  if (error) return <div className="error-banner">⚠ {error}</div>;
  if (!data) return null;

  const categories = data.categories || [];
  const matrix = data.affinity_matrix || [];
  const topRules = rules?.rules || [];

  // Build grouped bar chart data: per category, value per segment
  const groupedData = categories.map(cat => {
    const row = { cat };
    matrix.forEach(m => {
      row[SEG_SHORT[m.segment] || m.segment] = +(((m[cat] || 0) * 100)).toFixed(1);
    });
    return row;
  });

  const segKeys = matrix.map(m => SEG_SHORT[m.segment] || m.segment);

  return (
    <div>
      <div className="page-header">
        <h1>Product & Category Affinity</h1>
        <p>Association rule mining · Segment-category behavioral patterns</p>
      </div>

      {/* Heatmap Table */}
      <div className="card" style={{ marginBottom: '1.75rem', overflowX: 'auto' }}>
        <h3 style={{ marginBottom: '1.2rem' }}>Category Affinity Matrix by Segment</h3>
        <table className="affinity-table">
          <thead>
            <tr>
              <th>Segment</th>
              {categories.map(c => <th key={c}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <td className="seg-name-cell">
                  <span className="seg-dot" style={{ background: SEG_COLORS[row.segment] }}></span>
                  {SEG_SHORT[row.segment] || row.segment}
                </td>
                {categories.map(cat => {
                  const val = row[cat] || 0;
                  const intensity = Math.min(val * 1.2, 1);
                  return (
                    <td key={cat} className="heat-cell" style={{ '--heat': intensity }}>
                      {(val * 100).toFixed(1)}%
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grouped Bar Chart */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ marginBottom: '1.2rem' }}>Affinity Scores by Category & Segment</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={groupedData} barGap={2} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="cat" stroke="#64748b" tick={{ fontSize: 12 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: '#16163a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
              formatter={v => [`${v}%`, '']}
            />
            {segKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={Object.values(SEG_COLORS)[i]} stackId="none" radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Association Rules */}
      <div className="card">
        <h3 style={{ marginBottom: '1.1rem' }}>
          Association Rules
          <span className="rules-count">{topRules.length} rules · sorted by lift</span>
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="rules-table">
            <thead>
              <tr>
                <th>Antecedent</th>
                <th>→</th>
                <th>Consequent</th>
                <th>Support</th>
                <th>Confidence</th>
                <th>Lift</th>
              </tr>
            </thead>
            <tbody>
              {topRules.map((rule, i) => (
                <tr key={i}>
                  <td className="rule-cat">{rule.antecedent}</td>
                  <td style={{ color: 'var(--text-muted)', textAlign: 'center' }}>→</td>
                  <td className="rule-cat">{rule.consequent}</td>
                  <td>{(rule.support * 100).toFixed(2)}%</td>
                  <td>{(rule.confidence * 100).toFixed(1)}%</td>
                  <td><LiftBadge lift={rule.lift} /></td>
                </tr>
              ))}
              {topRules.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No rules found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
