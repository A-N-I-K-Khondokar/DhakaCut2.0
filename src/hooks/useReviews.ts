import { useState, useEffect, useCallback } from 'react';
import { Review } from '../types';
import { getReviewsByStaff, getReviewsBySalon, createReview } from '../services/firestoreService';

export const useReviews = (staffId?: string, salonId?: string) => {
  const [data, setData] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let reviews: Review[] = [];
      if (staffId) {
        reviews = await getReviewsByStaff(staffId);
      } else if (salonId) {
        reviews = await getReviewsBySalon(salonId);
      }
      setData(reviews);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, [staffId, salonId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useCreateReview = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> => {
    setLoading(true);
    setError(null);
    try {
      const review = await createReview(reviewData);
      return review;
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
};
