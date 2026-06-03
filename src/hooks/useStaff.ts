import { useState, useEffect, useCallback } from 'react';
import { Staff } from '../types';
import { getStaffBySalon } from '../services/firestoreService';

export const useStaff = (salonId: string | undefined) => {
  const [data, setData] = useState<Staff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!salonId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const staffList = await getStaffBySalon(salonId);
      setData(staffList);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  }, [salonId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
