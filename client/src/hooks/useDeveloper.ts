import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { DeveloperProfileResponse } from '../types';

export function useDeveloper(username?: string) {
  const [data, setData] = useState<DeveloperProfileResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userToFetch?: string) => {
    const target = (userToFetch || username)?.trim();
    if (!target) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/developers/${target}`);
      setData(res.data);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to fetch developer profile';
      setError(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username, fetchProfile]);

  return {
    data,
    loading,
    error,
    refetch: fetchProfile
  };
}
