import { useState, useEffect, useCallback } from 'react';
import { Salon } from '../types';
import { getAllSalons } from '../services/firestoreService';

let salonsCache: Salon[] | null = null;

export const useSalons = () => {
  const [data, setData] = useState<Salon[]>(salonsCache || []);
  const [loading, setLoading] = useState<boolean>(!salonsCache);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (force = false) => {
    if (salonsCache && !force) {
      setData(salonsCache);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const salons = await getAllSalons();
      salonsCache = salons;
      setData(salons);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch salons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  return { data, loading, error, refetch };
};
