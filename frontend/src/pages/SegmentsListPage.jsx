import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { SEG_COLORS, fmtCurrency } from '../utils/chartConfig';
import './SegmentsListPage.css';

const PRIORITY_RANK = {
    premium: { rank: 1, label: 'Highest Value', color: 'badge-blue' },
    loyal: { rank: 2, label: 'High Retention', color: 'badge-blue' },
    occasional: { rank: 3, label: 'Growth Potential', color: 'badge-yellow' },
    discount: { rank: 4, label: 'Margin Risk', color: 'badge-red' },
};

export default function SegmentsListPage() {
    const [segments, setSegments] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.getSegments()
            .then(d => { setSegments(d.segments || []); })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-wrap"><div className="spinner" /><p>Loading segments...</p></div>;

    const totalCustomers = segments?.reduce((s, seg) => s + (seg.size || 0), 0) || 0;
    const totalRevenue = segments?.reduce((s, seg) => s + ((seg.avg_spend || 0) * (seg.size || 0)), 0) || 0;

    return (
        <div>
            <div className="page-header">
                <h1>Customer Segments</h1>
                <p>KMeans behavioral segmentation — click any segment for detailed analysis</p>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {/* Overview row */}
            <div className="seg-overview-row" style={{ marginBottom: '1.75rem' }}>
                <div className="seg-ov-item card">
                    <div className="seg-ov-val">{totalCustomers.toLocaleString()}</div>
                    <div className="seg-ov-label">Total Customers</div>
                </div>
                <div className="seg-ov-item card">
                    <div className="seg-ov-val">{segments?.length ?? 0}</div>
                    <div className="seg-ov-label">Active Segments</div>
                </div>
                <div className="seg-ov-item card">
                    <div className="seg-ov-val">${(totalRevenue / 1000).toFixed(1)}K</div>
                    <div className="seg-ov-label">Est. Total Revenue</div>
                </div>
                <div className="seg-ov-item card">
                    <div className="seg-ov-val">{totalCustomers > 0 ? fmtCurrency(totalRevenue / totalCustomers) : '—'}</div>
                    <div className="seg-ov-label">Avg Spend / Customer</div>
                </div>
            </div>

            {/* Segment Cards Grid */}
            <div className="segs-grid">
                {segments?.map(seg => {
                    const color = SEG_COLORS[seg.label] || '#7c89fa';
                    const pr = PRIORITY_RANK[seg.id] || { rank: 5, label: 'Unknown', color: 'badge-gray' };
                    const segRev = (seg.avg_spend || 0) * (seg.size || 0);
                    const revPct = totalRevenue > 0 ? ((segRev / totalRevenue) * 100).toFixed(1) : '0';
                    return (
                        <Link key={seg.id} to={`/segment/${seg.id}`} className="seg-detail-card" style={{ '--sc': color }}>
                            <div className="sdc-rank">#{pr.rank}</div>
                            <div className="sdc-top">
                                <div>
                                    <div className="sdc-label">{seg.label}</div>
                                    <div className="sdc-size">{(seg.size || 0).toLocaleString()} customers</div>
                                </div>
                                <span className={`badge ${pr.color}`}>{pr.label}</span>
                            </div>

                            <div className="sdc-progress-wrap">
                                <div className="sdc-progress-bar" style={{ width: `${revPct}%`, background: color }} />
                                <span className="sdc-rev-pct">{revPct}% of revenue</span>
                            </div>

                            <div className="sdc-metrics">
                                <div className="sdc-metric">
                                    <span>Avg Spend</span>
                                    <strong>{fmtCurrency(seg.avg_spend)}</strong>
                                </div>
                                <div className="sdc-metric">
                                    <span>Rating</span>
                                    <strong>{seg.avg_rating?.toFixed(2)} / 5</strong>
                                </div>
                                <div className="sdc-metric">
                                    <span>Discount Usage</span>
                                    <strong>{seg.discount_usage_pct?.toFixed(1)}%</strong>
                                </div>
                                <div className="sdc-metric">
                                    <span>Top Category</span>
                                    <strong>{seg.top_category}</strong>
                                </div>
                                <div className="sdc-metric">
                                    <span>Top Season</span>
                                    <strong>{seg.top_season}</strong>
                                </div>
                                <div className="sdc-metric">
                                    <span>Est. Revenue</span>
                                    <strong>${(segRev / 1000).toFixed(1)}K</strong>
                                </div>
                            </div>

                            <div className="sdc-cta">View detailed analysis →</div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
