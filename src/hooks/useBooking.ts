import { useState, useEffect, useCallback } from 'react';
import { Booking } from '../types';
import { 
  getUserBookings, 
  getAvailableTimeSlots, 
  createBooking, 
  cancelBooking 
} from '../services/firestoreService';

export const useBookings = (userId: string | undefined) => {
  const [data, setData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const bookings = await getUserBookings(userId);
      setData(bookings);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

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

export const useCreateBooking = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Booking> => {
    setLoading(true);
    setError(null);
    try {
      const newBooking = await createBooking(bookingData);
      return newBooking;
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
};

export const useCancelBooking = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (bookingId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await cancelBooking(bookingId);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
};
