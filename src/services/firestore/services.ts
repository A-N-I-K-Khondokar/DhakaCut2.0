import { 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  collection, 
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Service } from '../../types';
import { generateId } from '../../utils/helpers';
import { 
  isMockMode, 
  mapDoc, 
  getLocalData, 
  setLocalData 
} from './core';

export const getAllServices = async (): Promise<Service[]> => {
  if (isMockMode) {
    return getLocalData<Service>('dc_services');
  }
  try {
    const querySnapshot = await getDocs(collection(db, 'services'));
    const services: Service[] = [];
    querySnapshot.forEach((docSnap) => {
      services.push(mapDoc<Service>(docSnap));
    });
    return services;
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in getAllServices:', err);
    throw new Error('Failed to fetch services.');
  }
};

export const getServiceById = async (id: string): Promise<Service | null> => {
  if (isMockMode) {
    return getLocalData<Service>('dc_services').find(s => s.id === id) || null;
  }
  try {
    const docSnap = await getDoc(doc(db, 'services', id));
    if (docSnap.exists()) {
      return mapDoc<Service>(docSnap);
    }
    return null;
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in getServiceById:', err);
    throw new Error('Failed to fetch service details.');
  }
};

export const createService = async (data: Omit<Service, 'id' | 'createdAt'>): Promise<Service> => {
  if (isMockMode) {
    const newService: Service = {
      ...data,
      id: `service-${generateId(8)}`,
      createdAt: new Date().toISOString(),
    };
    const services = getLocalData<Service>('dc_services');
    services.push(newService);
    setLocalData('dc_services', services);
    return newService;
  } else {
    try {
      const dbData = {
        ...data,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'services'), dbData);
      return {
        ...data,
        id: docRef.id,
        createdAt: new Date().toISOString(),
      };
    } catch (err: any) {
      console.error('[DhakaCut Service] Error in createService:', err);
      throw new Error(err.message || 'Failed to create service.');
    }
  }
};

export const updateService = async (id: string, updates: Partial<Service>): Promise<void> => {
  if (isMockMode) {
    const services = getLocalData<Service>('dc_services');
    const idx = services.findIndex(s => s.id === id);
    if (idx !== -1) {
      services[idx] = { ...services[idx], ...updates };
      setLocalData('dc_services', services);
    }
    return;
  }
  try {
    await updateDoc(doc(db, 'services', id), updates);
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in updateService:', err);
    throw new Error('Failed to update service.');
  }
};

export const deleteService = async (id: string): Promise<void> => {
  if (isMockMode) {
    const services = getLocalData<Service>('dc_services');
    const filtered = services.filter(s => s.id !== id);
    setLocalData('dc_services', filtered);
    return;
  }
  try {
    await deleteDoc(doc(db, 'services', id));
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in deleteService:', err);
    throw new Error('Failed to delete service.');
  }
};
