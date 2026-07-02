import { 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  collection, 
  query, 
  where, 
  runTransaction,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Booking } from '../../types';
import { generateId } from '../../utils/helpers';
import { 
  isMockMode, 
  mapDoc, 
  getLocalData, 
  setLocalData,
  emitBookingChange
} from './core';

export const createBooking = async (data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Booking> => {
  if (isMockMode) {
    const bookings = getLocalData<Booking>('dc_bookings');
    const conflict = bookings.find(b => 
      b.staffId === data.staffId && 
      b.bookingDate === data.bookingDate && 
      b.bookingTime === data.bookingTime && 
      b.status !== 'cancelled'
    );
    if (conflict) {
      throw new Error('This time slot has already been booked by another client.');
    }

    const newBooking: Booking = {
      ...data,
      id: `booking-${generateId(8)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    bookings.push(newBooking);
    setLocalData('dc_bookings', bookings);
    emitBookingChange();
    return newBooking;
  } else {
    try {
      const slotId = `${data.staffId}_${data.bookingDate}_${data.bookingTime.replace(':', '-')}`;
      const slotRef = doc(db, 'slots', slotId);
      const newBookingRef = doc(collection(db, 'bookings'));

      await runTransaction(db, async (transaction) => {
        const slotSnap = await transaction.get(slotRef);
        if (slotSnap.exists() && slotSnap.data()?.status === 'booked') {
          throw new Error('This time slot has already been booked by another client.');
        }

        const dbData = {
          ...data,
          status: 'pending' as const,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        transaction.set(slotRef, {
          status: 'booked',
          bookingId: newBookingRef.id,
          updatedAt: serverTimestamp()
        });
        transaction.set(newBookingRef, dbData);
      });

      return {
        ...data,
        id: newBookingRef.id,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (err: any) {
      console.error('[DhakaCut Service] Error in createBooking transaction:', err);
      throw new Error(err.message || 'Failed to create booking.');
    }
  }
};

export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  if (isMockMode) {
    const bookings = getLocalData<Booking>('dc_bookings');
    return bookings
      .filter(b => b.userId === userId)
      .sort((a, b) => b.bookingDate.localeCompare(a.bookingDate) || b.bookingTime.localeCompare(a.bookingTime));
  }
  try {
    const q = query(
      collection(db, 'bookings'), 
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];
    querySnapshot.forEach((docSnap) => {
      bookings.push(mapDoc<Booking>(docSnap));
    });
    return bookings.sort((a, b) => b.bookingDate.localeCompare(a.bookingDate) || b.bookingTime.localeCompare(a.bookingTime));
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in getUserBookings:', err);
    throw new Error('Failed to fetch user bookings.');
  }
};

export const getAllBookings = async (): Promise<Booking[]> => {
  if (isMockMode) {
    return getLocalData<Booking>('dc_bookings')
      .sort((a, b) => b.bookingDate.localeCompare(a.bookingDate) || b.bookingTime.localeCompare(a.bookingTime));
  }
  try {
    const querySnapshot = await getDocs(collection(db, 'bookings'));
    const bookings: Booking[] = [];
    querySnapshot.forEach((docSnap) => {
      bookings.push(mapDoc<Booking>(docSnap));
    });
    return bookings.sort((a, b) => b.bookingDate.localeCompare(a.bookingDate) || b.bookingTime.localeCompare(a.bookingTime));
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in getAllBookings:', err);
    throw new Error('Failed to fetch all bookings.');
  }
};

export const updateBookingStatus = async (id: string, status: Booking['status']): Promise<void> => {
  if (isMockMode) {
    const bookings = getLocalData<Booking>('dc_bookings');
    const idx = bookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      bookings[idx] = { ...bookings[idx], status, updatedAt: new Date().toISOString() };
      setLocalData('dc_bookings', bookings);
      emitBookingChange();
    }
    return;
  }
  try {
    if (status === 'cancelled') {
      const bookingDoc = await getDoc(doc(db, 'bookings', id));
      if (bookingDoc.exists()) {
        const bookingData = bookingDoc.data();
        const slotId = `${bookingData.staffId}_${bookingData.bookingDate}_${bookingData.bookingTime.replace(':', '-')}`;
        await runTransaction(db, async (transaction) => {
          transaction.update(doc(db, 'bookings', id), {
            status,
            updatedAt: serverTimestamp()
          });
          transaction.delete(doc(db, 'slots', slotId));
        });
        return;
      }
    }
    await updateDoc(doc(db, 'bookings', id), {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in updateBookingStatus:', err);
    throw new Error('Failed to update booking status.');
  }
};

export const cancelBooking = async (id: string, reason?: string): Promise<void> => {
  if (isMockMode) {
    const bookings = getLocalData<Booking>('dc_bookings');
    const idx = bookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      bookings[idx].status = 'cancelled';
      bookings[idx].cancelReason = reason || '';
      bookings[idx].updatedAt = new Date().toISOString();
      setLocalData('dc_bookings', bookings);
      emitBookingChange();
    }
  } else {
    try {
      const bookingDoc = await getDoc(doc(db, 'bookings', id));
      if (bookingDoc.exists()) {
        const bookingData = bookingDoc.data();
        const slotId = `${bookingData.staffId}_${bookingData.bookingDate}_${bookingData.bookingTime.replace(':', '-')}`;
        
        await runTransaction(db, async (transaction) => {
          transaction.update(doc(db, 'bookings', id), {
            status: 'cancelled',
            cancelReason: reason || '',
            updatedAt: serverTimestamp()
          });
          transaction.delete(doc(db, 'slots', slotId));
        });
      } else {
        await updateDoc(doc(db, 'bookings', id), {
          status: 'cancelled',
          cancelReason: reason || '',
          updatedAt: serverTimestamp()
        });
      }
      emitBookingChange();
    } catch (err: any) {
      console.error('[DhakaCut Service] Error in cancelBooking:', err);
      throw new Error('Failed to cancel appointment.');
    }
  }
};

export const getAvailableTimeSlots = async (staffId: string, date: string): Promise<string[]> => {
  const allSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', 
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', 
    '18:00', '18:30'
  ];

  try {
    let bookedSlots: string[] = [];

    if (isMockMode) {
      const bookings = getLocalData<Booking>('dc_bookings');
      bookedSlots = bookings
        .filter(b => b.staffId === staffId && b.bookingDate === date && b.status !== 'cancelled')
        .map(b => b.bookingTime);
    } else {
      const q = query(
        collection(db, 'bookings'),
        where('staffId', '==', staffId),
        where('bookingDate', '==', date)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(docSnap => {
        const b = mapDoc<Booking>(docSnap);
        if (b.status !== 'cancelled') {
          bookedSlots.push(b.bookingTime);
        }
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return allSlots.filter(slot => {
      if (bookedSlots.includes(slot)) return false;
      
      if (date === todayStr) {
        const [slotH, slotM] = slot.split(':').map(Number);
        if (slotH < currentHour || (slotH === currentHour && slotM <= currentMinute)) {
          return false;
        }
      }
      return true;
    });
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in getAvailableTimeSlots:', err);
    throw new Error('Failed to get available time slots.');
  }
};

export const isTimeSlotBooked = async (staffId: string, date: string, time: string): Promise<boolean> => {
  const available = await getAvailableTimeSlots(staffId, date);
  return !available.includes(time);
};
