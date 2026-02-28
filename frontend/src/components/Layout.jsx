import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import './Layout.css';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: <GridIcon /> },
  { path: '/segment', label: 'Segments', icon: <LayersIcon /> },
  { path: '/analyzer', label: 'Analyzer', icon: <SearchIcon /> },
  { path: '/affinity', label: 'Affinity', icon: <HexIcon /> },
  { path: '/sentiment', label: 'Sentiment', icon: <CircleIcon /> },
  { path: '/strategy', label: 'Strategy', icon: <TrendIcon /> },
  { path: '/compare', label: 'Compare', icon: <CompareIcon /> },
  { path: '/executive', label: 'Summary', icon: <DocIcon /> },
];

function GridIcon() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" /><rect x="8.5" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" /><rect x="1" y="8.5" width="5.5" height="5.5" rx="1" fill="currentColor" /><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" fill="currentColor" /></svg>; }
function LayersIcon() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5l6 3-6 3-6-3 6-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M1.5 9.5l6 3 6-3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M1.5 7l6 3 6-3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>; }
function SearchIcon() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" /><path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>; }
function HexIcon() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1l5.5 3.25v6.5L7.5 14 2 10.75V4.25L7.5 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>; }
function CircleIcon() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.5" /><circle cx="7.5" cy="7.5" r="2.5" fill="currentColor" /></svg>; }
function TrendIcon() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><polyline points="1,11 5,7 8,9 14,3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><polyline points="10,3 14,3 14,7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function CompareIcon() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M5 2l-3 5 3 5M10 2l3 5-3 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function DocIcon() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="2" y="1" width="11" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><path d="M5 5h5M5 8h5M5 11h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>; }

export default function Layout({ children }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <div className={`layout ${collapsed ? 'layout-collapsed' : ''}`}>
      <aside className="sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-mark">S</div>
            {!collapsed && <span className="logo-text">ShopMind</span>}
          </div>
          <div className="sidebar-header-actions">
            {!collapsed && <ThemeToggle />}
            <button
              className="sidebar-toggle"
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Toggle sidebar"
            >
              {collapsed ? '›' : '‹'}
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {!collapsed && <div className="nav-group-label">Analytics</div>}
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'nav-active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  );
}
