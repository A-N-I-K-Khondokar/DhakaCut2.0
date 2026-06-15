import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Booking } from '../types';
import { getUserBookings, getAllBookings, isMockMode } from '../services/firestoreService';

export const useBookings = (userId: string | undefined, fetchAll = false) => {
  const [data, setData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMockBookings = useCallback(async () => {
    if (!fetchAll && !userId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const bookings = fetchAll ? await getAllBookings() : await getUserBookings(userId!);
      setData(bookings);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [userId, fetchAll]);

  // Refetch for Firebase mode — does a one-shot getDocs query
  const fetchFirebaseBookings = useCallback(async () => {
    if (!fetchAll && !userId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const q = fetchAll
        ? query(collection(db, 'bookings'))
        : query(collection(db, 'bookings'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const bookingsList: Booking[] = [];
      snapshot.forEach((docSnap) => {
        const bData = docSnap.data();
        const converted: any = { id: docSnap.id };
        for (const key in bData) {
          if (Object.prototype.hasOwnProperty.call(bData, key)) {
            const val = bData[key];
            converted[key] = val && typeof val === 'object' && typeof val.toDate === 'function'
              ? val.toDate().toISOString()
              : val;
          }
        }
        bookingsList.push(converted as Booking);
      });
      bookingsList.sort((a, b) => b.bookingDate.localeCompare(a.bookingDate) || b.bookingTime.localeCompare(a.bookingTime));
      setData(bookingsList);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [userId, fetchAll]);

  useEffect(() => {
    if (!fetchAll && !userId) {
      setData([]);
      setLoading(false);
      return;
    }

    if (isMockMode) {
      // Initial load
      fetchMockBookings();

      // Real-time: re-fetch whenever a booking is created, updated, or cancelled.
      // emitBookingChange() dispatches a StorageEvent on 'dc_bookings' so all
      // mounted useBookings hooks instantly refresh — no polling needed.
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'dc_bookings') {
          fetchMockBookings();
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }

    setLoading(true);
    setError(null);

    try {
      const q = fetchAll
        ? query(collection(db, 'bookings'))
        : query(collection(db, 'bookings'), where('userId', '==', userId));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const bookingsList: Booking[] = [];
          snapshot.forEach((docSnap) => {
            const bData = docSnap.data();
            const converted: any = { id: docSnap.id };
            for (const key in bData) {
              if (Object.prototype.hasOwnProperty.call(bData, key)) {
                const val = bData[key];
                if (val && typeof val === 'object' && typeof val.toDate === 'function') {
                  converted[key] = val.toDate().toISOString();
                } else {
                  converted[key] = val;
                }
              }
            }
            bookingsList.push(converted as Booking);
          });

          // Sort descending by date & time client-side
          bookingsList.sort((a, b) => b.bookingDate.localeCompare(a.bookingDate) || b.bookingTime.localeCompare(a.bookingTime));
          setData(bookingsList);
          setLoading(false);
        },
        (err) => {
          console.error('[DhakaCut useBookings] Real-time listener error:', err);
          setError(err.message || 'Failed to listen to bookings');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      setError(err.message || 'Failed to initialize bookings connection');
      setLoading(false);
    }
  }, [userId, fetchAll, fetchMockBookings]);

  // Unified refetch: works in both mock mode and Firebase mode
  const refetch = useCallback(() => {
    if (isMockMode) {
      return fetchMockBookings();
    }
    return fetchFirebaseBookings();
  }, [fetchMockBookings, fetchFirebaseBookings]);

  return { data, loading, error, refetch };
};
