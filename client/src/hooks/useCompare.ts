import { useState, useCallback } from 'react';
import api from '../services/api';
import { ComparisonMetricData } from '../types';

export function useCompare() {
  const [data, setData] = useState<ComparisonMetricData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const compareDevelopers = useCallback(async (usernames: string[]) => {
    if (!usernames || usernames.length < 2) {
      setError('Please provide at least 2 developers to compare');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/compare', { usernames });
      setData(res.data);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to compare developers';
      setError(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveComparison = useCallback(async (name: string, usernames: string[]) => {
    try {
      const res = await api.post('/comparisons', { name, usernames });
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to save comparison');
    }
  }, []);

  return {
    data,
    loading,
    error,
    compareDevelopers,
    saveComparison,
    setData
  };
}
