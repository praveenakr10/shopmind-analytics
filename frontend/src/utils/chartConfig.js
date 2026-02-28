/* Centralized chart + data configuration for ShopMind4 */

/* ── Segment meta (id → label + color) ────────────────── */
export const SEG_META = {
    premium: { label: 'Premium Urgent Buyers', color: '#4f46e5' },
    loyal: { label: 'Loyal Frequent Buyers', color: '#059669' },
    occasional: { label: 'Occasional Buyers', color: '#d97706' },
    discount: { label: 'Discount-Driven Shoppers', color: '#dc2626' },
};

/* Label → color (for dynamic lookup by segment name) */
export const SEG_COLORS = Object.fromEntries(
    Object.values(SEG_META).map(({ label, color }) => [label, color])
);

/* ── Status Colors ─────────────────────────────────────── */
export const STATUS_COLORS = {
    positive: '#16a34a',
    neutral: '#ca8a04',
    negative: '#dc2626',
};

/* ── Tooltip style (always white bg + dark text) ────────── */
export const TOOLTIP_STYLE = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
    color: '#0f172a',
    fontSize: '0.82rem',
    padding: '10px 14px',
};

/* ── Chart axis / grid ───────────────────────────────────── */
export const GRID_COLOR = 'rgba(0,0,0,0.06)';    // works on both light & dark with CSS var
export const AXIS_COLOR = '#94a3b8';

/* ── Safe value formatters (NaN / null guards) ─────────── */
export function safeNum(v, fallback = 0) {
    if (v === null || v === undefined) return fallback;
    const n = Number(v);
    return isNaN(n) ? fallback : n;
}

export function safeStr(v, fallback = '—') {
    if (!v || v === 'undefined' || v === 'null') return fallback;
    return String(v);
}

/* ── Currency formatter ─────────────────────────────────── */
export function fmtCurrency(v, decimals = 2) {
    const n = safeNum(v);
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
    return `$${n.toFixed(decimals)}`;
}
