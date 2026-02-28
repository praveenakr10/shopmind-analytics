import React, { createContext, useCallback, useState, useEffect } from 'react';
import { apiClient } from '../utils/api';

export const AnalysisContext = createContext();

export function AnalysisProvider({ children }) {
  const [options, setOptions] = useState({});
  const [segments, setSegments] = useState({});
  const [selectedSegmentId, setSelectedSegmentId] = useState(null);
  const [customerResult, setCustomerResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cache, setCache] = useState({});

  // Load metadata on mount
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        setLoading(true);
        const optionsData = await apiClient.getMetadataOptions();
        setOptions(optionsData);
        
        // Mock segments data since /metadata/segments doesn't exist in backend
        setSegments({
          "high_value": { name: "High Value Customers", icon: "💎" },
          "discount_driven": { name: "Discount Driven Shoppers", icon: "🏷️" },
          "loyal": { name: "Loyal Repeat Buyers", icon: "⭐" },
          "churn_risk": { name: "Churn Risk Customers", icon: "⚠️" },
        });
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load metadata");
      } finally {
        setLoading(false);
      }
    };
    loadMetadata();
  }, []);

  const analyzeCustomer = useCallback(async (payload) => {
    try {
      setLoading(true);
      const result = await apiClient.analyzeCustomer(payload);
      setCustomerResult(result);
      setError(null);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSegmentStats = useCallback(async (segmentId) => {
    const cacheKey = `segment_stats_${segmentId}`;
    if (cache[cacheKey]) return cache[cacheKey];

    try {
      const data = await apiClient.getSegmentStats(segmentId);
      setCache(prev => ({ ...prev, [cacheKey]: data }));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [cache]);

  const getSegmentProductAffinities = useCallback(async (segmentId) => {
    const cacheKey = `segment_product_affinities_${segmentId}`;
    if (cache[cacheKey]) return cache[cacheKey];

    try {
      const data = await apiClient.getSegmentProductAffinities(segmentId);
      setCache(prev => ({ ...prev, [cacheKey]: data }));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [cache]);

  const getSegmentCategoryAffinities = useCallback(async (segmentId) => {
    const cacheKey = `segment_category_affinities_${segmentId}`;
    if (cache[cacheKey]) return cache[cacheKey];

    try {
      const data = await apiClient.getSegmentCategoryAffinities(segmentId);
      setCache(prev => ({ ...prev, [cacheKey]: data }));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [cache]);

  const getSegmentSentiment = useCallback(async (segmentId) => {
    const cacheKey = `segment_sentiment_${segmentId}`;
    if (cache[cacheKey]) return cache[cacheKey];

    try {
      const data = await apiClient.getSegmentSentiment(segmentId);
      setCache(prev => ({ ...prev, [cacheKey]: data }));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [cache]);

  const getProductAffinityMatrix = useCallback(async () => {
    const cacheKey = 'product_affinity_matrix';
    if (cache[cacheKey]) return cache[cacheKey];

    try {
      const data = await apiClient.getProductAffinityMatrix();
      setCache(prev => ({ ...prev, [cacheKey]: data }));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [cache]);

  const getCategoryAffinityMatrix = useCallback(async () => {
    const cacheKey = 'category_affinity_matrix';
    if (cache[cacheKey]) return cache[cacheKey];

    try {
      const data = await apiClient.getCategoryAffinityMatrix();
      setCache(prev => ({ ...prev, [cacheKey]: data }));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [cache]);

  const getSentimentOverview = useCallback(async () => {
    const cacheKey = 'sentiment_overview';
    if (cache[cacheKey]) return cache[cacheKey];

    try {
      const data = await apiClient.getSentimentOverview();
      setCache(prev => ({ ...prev, [cacheKey]: data }));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [cache]);

  const getSegmentStrategy = useCallback(async (segmentId) => {
    const cacheKey = `segment_strategy_${segmentId}`;
    if (cache[cacheKey]) return cache[cacheKey];

    try {
      const data = await apiClient.getSegmentStrategy(segmentId);
      setCache(prev => ({ ...prev, [cacheKey]: data }));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [cache]);

  const getProductStrategy = useCallback(async (productId) => {
    const cacheKey = `product_strategy_${productId}`;
    if (cache[cacheKey]) return cache[cacheKey];

    try {
      const data = await apiClient.getProductStrategy(productId);
      setCache(prev => ({ ...prev, [cacheKey]: data }));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [cache]);

  const compareSegments = useCallback(async (segment1Id, segment2Id) => {
    const cacheKey = `compare_segments_${segment1Id}_${segment2Id}`;
    if (cache[cacheKey]) return cache[cacheKey];

    try {
      const data = await apiClient.compareSegments(segment1Id, segment2Id);
      setCache(prev => ({ ...prev, [cacheKey]: data }));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [cache]);

  const compareProducts = useCallback(async (product1Id, product2Id) => {
    const cacheKey = `compare_products_${product1Id}_${product2Id}`;
    if (cache[cacheKey]) return cache[cacheKey];

    try {
      const data = await apiClient.compareProducts(product1Id, product2Id);
      setCache(prev => ({ ...prev, [cacheKey]: data }));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [cache]);

  const value = {
    options,
    segments,
    selectedSegmentId,
    setSelectedSegmentId,
    customerResult,
    loading,
    error,
    analyzeCustomer,
    getSegmentStats,
    getSegmentProductAffinities,
    getSegmentCategoryAffinities,
    getSegmentSentiment,
    getProductAffinityMatrix,
    getCategoryAffinityMatrix,
    getSentimentOverview,
    getSegmentStrategy,
    getProductStrategy,
    compareSegments,
    compareProducts,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = React.useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within AnalysisProvider');
  }
  return context;
}
