import { 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Salon, Staff, Review, Booking } from '../../types';
import { generateId } from '../../utils/helpers';
import { 
  isMockMode, 
  withTimeout, 
  mapDoc, 
  getLocalData, 
  setLocalData,
  seedFirestoreData
} from './core';

export const getAllSalons = async (): Promise<Salon[]> => {
  if (isMockMode) {
    return getLocalData<Salon>('dc_salons');
  }
  try {
    console.log('[DhakaCut] Connecting to Firestore project:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
    const querySnapshot = await withTimeout(
      getDocs(collection(db, 'salons')),
      12000,
      'getAllSalons'
    );
    const salons: Salon[] = [];
    querySnapshot.forEach((docSnap) => {
      salons.push(mapDoc<Salon>(docSnap));
    });

    console.log(`[DhakaCut] Loaded ${salons.length} salons from Firestore`);

    const alreadySeeded = sessionStorage.getItem('dc_seeded');
    if (salons.length === 0 && !alreadySeeded) {
      sessionStorage.setItem('dc_seeded', 'true');
      console.log('[DhakaCut Service] Database empty — seeding in background...');
      seedFirestoreData();
    }

    return salons.sort((a, b) => b.rating - a.rating);
  } catch (err: any) {
    console.error('[DhakaCut] getAllSalons FULL ERROR:', {
      code: err?.code,
      message: err?.message,
      name: err?.name,
      stack: err?.stack,
    });
    throw new Error(`Failed to load salons. (${err?.code || err?.message || 'unknown error'})`);
  }
};

export const getSalonById = async (id: string): Promise<Salon | null> => {
  if (isMockMode) {
    return getLocalData<Salon>('dc_salons').find(s => s.id === id) || null;
  }
  try {
    const docSnap = await getDoc(doc(db, 'salons', id));
    if (docSnap.exists()) {
      return mapDoc<Salon>(docSnap);
    }
    return null;
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in getSalonById:', err);
    throw new Error('Failed to fetch salon details.');
  }
};

export const getSalonsByArea = async (area: string): Promise<Salon[]> => {
  if (isMockMode) {
    return getLocalData<Salon>('dc_salons').filter(s => s.area.toLowerCase() === area.toLowerCase());
  }
  try {
    const q = query(collection(db, 'salons'), where('area', '==', area));
    const querySnapshot = await getDocs(q);
    const salons: Salon[] = [];
    querySnapshot.forEach((docSnap) => {
      salons.push(mapDoc<Salon>(docSnap));
    });
    return salons.sort((a, b) => b.rating - a.rating);
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in getSalonsByArea:', err);
    throw new Error('Failed to fetch salons in this area.');
  }
};

export const createSalon = async (data: Omit<Salon, 'id' | 'createdAt' | 'updatedAt' | 'rating'>): Promise<Salon> => {
  if (isMockMode) {
    const newSalon: Salon = {
      ...data,
      id: `salon-${generateId(8)}`,
      rating: 5.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const salons = getLocalData<Salon>('dc_salons');
    salons.push(newSalon);
    setLocalData('dc_salons', salons);
    return newSalon;
  } else {
    try {
      const dbData = {
        ...data,
        rating: 5.0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'salons'), dbData);
      return {
        ...data,
        id: docRef.id,
        rating: 5.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      console.error('[DhakaCut Service] Error in createSalon:', err);
      throw new Error(err.message || 'Failed to create salon.');
    }
  }
};

export const updateSalon = async (id: string, updates: Partial<Salon>): Promise<void> => {
  if (isMockMode) {
    const salons = getLocalData<Salon>('dc_salons');
    const idx = salons.findIndex(s => s.id === id);
    if (idx !== -1) {
      salons[idx] = { ...salons[idx], ...updates, updatedAt: new Date().toISOString() };
      setLocalData('dc_salons', salons);
    }
    return;
  }
  try {
    const dbUpdates = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    await updateDoc(doc(db, 'salons', id), dbUpdates);
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in updateSalon:', err);
    throw new Error('Failed to update salon.');
  }
};

export const deleteSalon = async (id: string): Promise<void> => {
  if (isMockMode) {
    const salons = getLocalData<Salon>('dc_salons');
    const filtered = salons.filter(s => s.id !== id);
    setLocalData('dc_salons', filtered);
    
    const staff = getLocalData<Staff>('dc_staff').filter(st => st.salonId !== id);
    setLocalData('dc_staff', staff);
    const reviews = getLocalData<Review>('dc_reviews').filter(r => r.salonId !== id);
    setLocalData('dc_reviews', reviews);
    const bookings = getLocalData<Booking>('dc_bookings').filter(b => b.salonId !== id);
    setLocalData('dc_bookings', bookings);
    return;
  }
  try {
    await deleteDoc(doc(db, 'salons', id));
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in deleteSalon:', err);
    throw new Error('Failed to delete salon.');
  }
};
