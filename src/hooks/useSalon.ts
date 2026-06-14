import { useState, useEffect, useCallback } from 'react';
import { Salon } from '../types';
import { getSalonById } from '../services/firestoreService';

export const useSalon = (id: string | undefined) => {
  const [data, setData] = useState<Salon | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const salon = await getSalonById(id);
      setData(salon);
    } catch (err: any) {
      setError(err.message || `Failed to fetch salon with id ${id}`);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
