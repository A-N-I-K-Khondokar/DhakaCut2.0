import { useState, useEffect, useCallback } from 'react';
import { getAvailableTimeSlots } from '../services/firestoreService';

export const useAvailableSlots = (staffId: string | undefined, date: string | undefined) => {
  const [data, setData] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = useCallback(async () => {
    if (!staffId || !date) {
      setData([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const slots = await getAvailableTimeSlots(staffId, date);
      setData(slots);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch available slots');
    } finally {
      setLoading(false);
    }
  }, [staffId, date]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  return { data, loading, error, refetch: fetchSlots };
};
