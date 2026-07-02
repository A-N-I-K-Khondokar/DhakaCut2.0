import { 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  collection, 
  addDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Staff, Review, Booking } from '../../types';
import { generateId } from '../../utils/helpers';
import { 
  isMockMode, 
  mapDoc, 
  getLocalData, 
  setLocalData 
} from './core';

export const getStaffBySalon = async (salonId: string): Promise<Staff[]> => {
  if (isMockMode) {
    return getLocalData<Staff>('dc_staff').filter(st => st.salonId === salonId);
  }
  try {
    const q = query(collection(db, 'staff'), where('salonId', '==', salonId));
    const querySnapshot = await getDocs(q);
    const staff: Staff[] = [];
    querySnapshot.forEach((docSnap) => {
      staff.push(mapDoc<Staff>(docSnap));
    });
    return staff;
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in getStaffBySalon:', err);
    throw new Error('Failed to fetch staff for this salon.');
  }
};

export const getAllStaff = async (): Promise<Staff[]> => {
  if (isMockMode) {
    return getLocalData<Staff>('dc_staff');
  }
  try {
    const querySnapshot = await getDocs(collection(db, 'staff'));
    const staff: Staff[] = [];
    querySnapshot.forEach((docSnap) => {
      staff.push(mapDoc<Staff>(docSnap));
    });
    return staff;
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in getAllStaff:', err);
    throw new Error('Failed to fetch all staff.');
  }
};

export const getStaffById = async (id: string): Promise<Staff | null> => {
  if (isMockMode) {
    return getLocalData<Staff>('dc_staff').find(st => st.id === id) || null;
  }
  try {
    const docSnap = await getDoc(doc(db, 'staff', id));
    if (docSnap.exists()) {
      return mapDoc<Staff>(docSnap);
    }
    return null;
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in getStaffById:', err);
    throw new Error('Failed to fetch staff details.');
  }
};

export const createStaff = async (data: Omit<Staff, 'id' | 'createdAt' | 'avgRating' | 'reviewCount'>): Promise<Staff> => {
  if (isMockMode) {
    const newStaff: Staff = {
      ...data,
      id: `staff-${generateId(8)}`,
      avgRating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };
    const staffList = getLocalData<Staff>('dc_staff');
    staffList.push(newStaff);
    setLocalData('dc_staff', staffList);
    return newStaff;
  } else {
    try {
      const dbData = {
        ...data,
        avgRating: 5.0,
        reviewCount: 0,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'staff'), dbData);
      return {
        ...data,
        id: docRef.id,
        avgRating: 5.0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
      };
    } catch (err: any) {
      console.error('[DhakaCut Service] Error in createStaff:', err);
      throw new Error(err.message || 'Failed to create staff member.');
    }
  }
};

export const updateStaff = async (id: string, updates: Partial<Staff>): Promise<void> => {
  if (isMockMode) {
    const staffList = getLocalData<Staff>('dc_staff');
    const idx = staffList.findIndex(st => st.id === id);
    if (idx !== -1) {
      staffList[idx] = { ...staffList[idx], ...updates };
      setLocalData('dc_staff', staffList);
    }
    return;
  }
  try {
    await updateDoc(doc(db, 'staff', id), updates);
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in updateStaff:', err);
    throw new Error('Failed to update staff member.');
  }
};

export const deleteStaff = async (id: string): Promise<void> => {
  if (isMockMode) {
    const staffList = getLocalData<Staff>('dc_staff');
    const filtered = staffList.filter(st => st.id !== id);
    setLocalData('dc_staff', filtered);
    
    const reviews = getLocalData<Review>('dc_reviews').filter(r => r.staffId !== id);
    setLocalData('dc_reviews', reviews);
    const bookings = getLocalData<Booking>('dc_bookings').filter(b => b.staffId !== id);
    setLocalData('dc_bookings', bookings);
    return;
  }
  try {
    await deleteDoc(doc(db, 'staff', id));
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in deleteStaff:', err);
    throw new Error('Failed to delete staff member.');
  }
};

export const calculateStaffAvgRating = async (staffId: string): Promise<{ avgRating: number; reviewCount: number }> => {
  try {
    let staffReviews: Review[] = [];
    
    if (isMockMode) {
      staffReviews = getLocalData<Review>('dc_reviews').filter(r => r.staffId === staffId);
    } else {
      const q = query(collection(db, 'reviews'), where('staffId', '==', staffId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(docSnap => {
        staffReviews.push(mapDoc<Review>(docSnap));
      });
    }

    const reviewCount = staffReviews.length;
    const avgRating = reviewCount > 0 
      ? parseFloat((staffReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
      : 0.0;

    await updateStaff(staffId, { avgRating, reviewCount });
    
    return { avgRating, reviewCount };
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in calculateStaffAvgRating:', err);
    throw new Error('Failed to calculate staff average rating.');
  }
};
