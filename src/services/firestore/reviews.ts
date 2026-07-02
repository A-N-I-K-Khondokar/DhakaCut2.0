import { 
  doc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Review } from '../../types';
import { generateId } from '../../utils/helpers';
import { 
  isMockMode, 
  mapDoc, 
  getLocalData, 
  setLocalData 
} from './core';
import { calculateStaffAvgRating } from './staff';

export const createReview = async (data: Omit<Review, 'id' | 'createdAt'>): Promise<Review> => {
  if (isMockMode) {
    const newReview: Review = {
      ...data,
      id: `review-${generateId(8)}`,
      createdAt: new Date().toISOString(),
    };
    const reviews = getLocalData<Review>('dc_reviews');
    reviews.push(newReview);
    setLocalData('dc_reviews', reviews);
    
    await calculateStaffAvgRating(data.staffId);
    return newReview;
  } else {
    try {
      const dbData = {
        ...data,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'reviews'), dbData);
      
      const newReview: Review = {
        ...data,
        id: docRef.id,
        createdAt: new Date().toISOString()
      };
      
      await calculateStaffAvgRating(data.staffId);
      return newReview;
    } catch (err: any) {
      console.error('[DhakaCut Service] Error in createReview:', err);
      throw new Error(err.message || 'Failed to create review.');
    }
  }
};

export const getReviewsByStaff = async (staffId: string): Promise<Review[]> => {
  if (isMockMode) {
    return getLocalData<Review>('dc_reviews')
      .filter(r => r.staffId === staffId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  try {
    const q = query(collection(db, 'reviews'), where('staffId', '==', staffId));
    const querySnapshot = await getDocs(q);
    const reviews: Review[] = [];
    querySnapshot.forEach((docSnap) => {
      reviews.push(mapDoc<Review>(docSnap));
    });
    return reviews.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in getReviewsByStaff:', err);
    throw new Error('Failed to fetch reviews for this staff member.');
  }
};

export const getReviewsBySalon = async (salonId: string): Promise<Review[]> => {
  if (isMockMode) {
    return getLocalData<Review>('dc_reviews')
      .filter(r => r.salonId === salonId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  try {
    const q = query(collection(db, 'reviews'), where('salonId', '==', salonId));
    const querySnapshot = await getDocs(q);
    const reviews: Review[] = [];
    querySnapshot.forEach((docSnap) => {
      reviews.push(mapDoc<Review>(docSnap));
    });
    return reviews.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in getReviewsBySalon:', err);
    throw new Error('Failed to fetch reviews for this salon.');
  }
};

export const getReviewsByUser = async (userId: string): Promise<Review[]> => {
  if (isMockMode) {
    return getLocalData<Review>('dc_reviews')
      .filter(r => r.userId === userId);
  }
  try {
    const q = query(collection(db, 'reviews'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const reviews: Review[] = [];
    querySnapshot.forEach((docSnap) => {
      reviews.push(mapDoc<Review>(docSnap));
    });
    return reviews;
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in getReviewsByUser:', err);
    throw new Error('Failed to fetch reviews for this user.');
  }
};

export const deleteReview = async (id: string): Promise<void> => {
  let staffId = '';
  if (isMockMode) {
    const reviews = getLocalData<Review>('dc_reviews');
    const review = reviews.find(r => r.id === id);
    if (review) {
      staffId = review.staffId;
      const filtered = reviews.filter(r => r.id !== id);
      setLocalData('dc_reviews', filtered);
      await calculateStaffAvgRating(staffId);
    }
    return;
  }
  try {
    const docSnap = await getDoc(doc(db, 'reviews', id));
    if (docSnap.exists()) {
      staffId = (docSnap.data() as Review).staffId;
      await deleteDoc(doc(db, 'reviews', id));
      await calculateStaffAvgRating(staffId);
    }
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in deleteReview:', err);
    throw new Error('Failed to delete review.');
  }
};
