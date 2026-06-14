import { useState, useCallback } from 'react';
import { Booking } from '../types';
import { createBooking, cancelBooking } from '../services/firestoreService';

// Re-export individual hooks for backward compatibility
export { useBookings } from './useBookings';
export { useAvailableSlots } from './useAvailableSlots';

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
