import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import SegmentPage from './pages/SegmentPage';
import AffinityPage from './pages/AffinityPage';
import SentimentPage from './pages/SentimentPage';
import StrategyPage from './pages/StrategyPage';
import ComparePage from './pages/ComparePage';
import './index.css';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/segment/:id" element={<SegmentPage />} />
          <Route path="/segment" element={<DashboardPage />} />
          <Route path="/affinity" element={<AffinityPage />} />
          <Route path="/sentiment" element={<SentimentPage />} />
          <Route path="/strategy" element={<StrategyPage />} />
          <Route path="/compare" element={<ComparePage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
