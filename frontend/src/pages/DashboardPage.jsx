import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, Cell, PieChart, Pie, Legend,
} from 'recharts';
import './DashboardPage.css';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

const KPICard = ({ label, value, sub, color, icon }) => (
  <div className="kpi-card" style={{ '--accent': color }}>
    <div className="kpi-icon">{icon}</div>
    <div className="kpi-body">
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  </div>
);

export default function DashboardPage() {
  const [segments, setSegments] = useState(null);
  const [projection, setProjection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getSegments(), api.getProjection()])
      .then(([segsData, projData]) => {
        setSegments(segsData.segments);
        setProjection(projData.projections);
        setError(null);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-wrap"><div className="spinner" /><p>Loading dashboard...</p></div>
  );

  const totalCustomers = segments?.reduce((s, seg) => s + (seg.size || 0), 0) || 0;
  const avgSpend = segments?.length
    ? (segments.reduce((s, seg) => s + seg.avg_spend, 0) / segments.length).toFixed(2)
    : 0;
  const avgRating = segments?.length
    ? (segments.reduce((s, seg) => s + seg.avg_rating, 0) / segments.length).toFixed(2)
    : 0;
  const avgDiscount = segments?.length
    ? (segments.reduce((s, seg) => s + seg.discount_usage_pct, 0) / segments.length).toFixed(1)
    : 0;

  const spendData = segments?.map(s => ({ name: s.label.split(' ')[0], spend: s.avg_spend })) || [];
  const discountData = segments?.map(s => ({
    name: s.label.split(' ')[0],
    value: s.discount_usage_pct,
  })) || [];

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Shopper Behavior Intelligence</h1>
        <p>KMeans behavioral segmentation · {totalCustomers.toLocaleString()} customers analyzed</p>
      </div>

      {error && <div className="error-banner">⚠ {error}</div>}

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <KPICard label="Total Customers" value={totalCustomers.toLocaleString()} icon="👥" color="#6366f1" sub="Across 4 segments" />
        <KPICard label="Avg. Spend / Order" value={`$${avgSpend}`} icon="💳" color="#10b981" sub="All segments" />
        <KPICard label="Avg. Review Rating" value={`${avgRating} / 5`} icon="⭐" color="#f59e0b" sub="From dataset" />
        <KPICard label="Avg. Discount Usage" value={`${avgDiscount}%`} icon="🏷️" color="#ef4444" sub="Customers using discounts" />
      </div>

      {/* Segment Cards */}
      <h2 style={{ marginBottom: '1rem' }}>Customer Segments</h2>
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {segments?.map((seg, i) => (
          <Link key={seg.id} to={`/segment/${seg.id}`} className="segment-card" style={{ '--seg-color': COLORS[i] }}>
            <div className="seg-card-header">
              <span className="seg-icon">{seg.icon}</span>
              <span className="seg-label">{seg.label}</span>
              <span className="seg-size">{(seg.size || 0).toLocaleString()} customers</span>
            </div>
            <div className="seg-metrics">
              <div className="seg-metric"><span>Avg Spend</span><strong>${seg.avg_spend?.toFixed(2)}</strong></div>
              <div className="seg-metric"><span>Rating</span><strong>{seg.avg_rating}</strong></div>
              <div className="seg-metric"><span>Discount %</span><strong>{seg.discount_usage_pct?.toFixed(1)}%</strong></div>
              <div className="seg-metric"><span>Top Cat.</span><strong>{seg.top_category}</strong></div>
            </div>
            <div className="seg-footer">View segment detail →</div>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.2rem' }}>Avg Spend by Segment</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={spendData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} unit="$" />
              <Tooltip
                contentStyle={{ background: '#16163a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                formatter={v => [`$${v.toFixed(2)}`, 'Avg Spend']}
              />
              <Bar dataKey="spend" radius={[6, 6, 0, 0]}>
                {spendData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.2rem' }}>Discount Usage Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={discountData}
                dataKey="value"
                nameKey="name"
                cx="50%" cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                label={({ name, value }) => `${name} ${value?.toFixed(1)}%`}
                labelLine={false}
              >
                {discountData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#16163a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                formatter={v => [`${v.toFixed(1)}%`, 'Discount Usage']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cluster Scatter */}
      {projection && (
        <div className="card">
          <h3 style={{ marginBottom: '1.2rem' }}>Segment Cluster Projection (PCA 2D)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="x" type="number" name="PC1" stroke="#64748b" tick={{ fontSize: 12 }} label={{ value: 'PC1', position: 'insideBottomRight', fill: '#64748b' }} />
              <YAxis dataKey="y" type="number" name="PC2" stroke="#64748b" tick={{ fontSize: 12 }} label={{ value: 'PC2', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ background: '#16163a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                formatter={(v, n) => [v?.toFixed(2), n]}
                labelFormatter={(_, p) => p[0]?.payload?.label || ''}
              />
              <Scatter data={projection} shape="circle">
                {projection.map((p, i) => <Cell key={i} fill={p.color} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="scatter-legend">
            {projection.map((p, i) => (
              <span key={i} className="legend-item">
                <span className="legend-dot" style={{ background: p.color }}></span>
                {p.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
