import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
} from 'recharts';

export function HeatmapChart({ data, title }) {
  if (!data || !Array.isArray(data)) {
    return <div className="chart-container"><p>No data available</p></div>;
  }

  // Transform data for heatmap visualization
  const processedData = data.map((item, idx) => ({
    name: item.name || `Item ${idx}`,
    value: item.value || 0,
    ...item,
  }));

  const maxValue = Math.max(...processedData.map(d => d.value || 0));

  const getHeatmapColor = (value) => {
    const ratio = value / maxValue;
    if (ratio < 0.33) return '#10b981';
    if (ratio < 0.67) return '#fbbf24';
    return '#f43f5e';
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={processedData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" stroke="#6b7280" />
          <YAxis dataKey="name" type="category" width={100} stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value) => `${value.toFixed(2)}`}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]}>
            {processedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getHeatmapColor(entry.value)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SentimentChart({ data, title }) {
  if (!data) {
    return <div className="chart-container"><p>No data available</p></div>;
  }

  const chartData = [
    { name: 'Positive', value: data.positive || 0, fill: '#10b981' },
    { name: 'Neutral', value: data.neutral || 0, fill: '#fbbf24' },
    { name: 'Negative', value: data.negative || 0, fill: '#f43f5e' },
  ].filter(d => d.value > 0);

  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="value" fill="#8b5cf6">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MatrixChart({ data, title }) {
  if (!data || !Array.isArray(data)) {
    return <div className="chart-container"><p>No data available</p></div>;
  }

  const maxValue = Math.max(...data.flat().map(v => typeof v === 'number' ? v : 0));

  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <div className="matrix-grid">
        {data.map((row, rowIdx) => (
          <div key={rowIdx} className="matrix-row">
            {Array.isArray(row) ? row.map((value, colIdx) => {
              const ratio = value / maxValue;
              const color = ratio < 0.33 ? '#10b981' : ratio < 0.67 ? '#fbbf24' : '#f43f5e';
              return (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className="matrix-cell"
                  style={{
                    backgroundColor: color,
                    opacity: 0.3 + ratio * 0.7,
                  }}
                  title={value.toFixed(2)}
                />
              );
            }) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
