import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import SegmentsListPage from './pages/SegmentsListPage';
import SegmentPage from './pages/SegmentPage';
import AffinityPage from './pages/AffinityPage';
import SentimentPage from './pages/SentimentPage';
import StrategyPage from './pages/StrategyPage';
import ComparePage from './pages/ComparePage';
import AnalyzerPage from './pages/AnalyzerPage';
import ExecutiveSummaryPage from './pages/ExecutiveSummaryPage';
import './index.css';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/segment" element={<SegmentsListPage />} />
          <Route path="/segment/:id" element={<SegmentPage />} />
          <Route path="/affinity" element={<AffinityPage />} />
          <Route path="/sentiment" element={<SentimentPage />} />
          <Route path="/strategy" element={<StrategyPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/analyzer" element={<AnalyzerPage />} />
          <Route path="/executive" element={<ExecutiveSummaryPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
