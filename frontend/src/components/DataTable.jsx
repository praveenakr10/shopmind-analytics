import React, { useState } from 'react';
import '../styles/DataTable.css';

export default function DataTable({ data, columns, title, sortable = true }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="table-container">
        <h3 className="table-title">{title}</h3>
        <p className="table-empty">No data available</p>
      </div>
    );
  }

  const handleSort = (key) => {
    if (!sortable) return;
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  let sortedData = [...data];
  if (sortable && sortConfig.key) {
    sortedData.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      return sortConfig.direction === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }

  return (
    <div className="table-container">
      <h3 className="table-title">{title}</h3>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={sortable ? 'sortable' : ''}
                >
                  <span className="header-content">
                    {col.label}
                    {sortable && sortConfig.key === col.key && (
                      <span className="sort-indicator">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {columns.map(col => (
                  <td key={`${rowIdx}-${col.key}`}>
                    {col.format
                      ? col.format(row[col.key])
                      : typeof row[col.key] === 'number'
                      ? row[col.key].toFixed(col.decimals ?? 2)
                      : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
