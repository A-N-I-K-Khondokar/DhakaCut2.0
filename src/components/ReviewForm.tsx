import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCreateReview } from '../hooks/useReviews';
import { useToast } from '../hooks/useToast';
import { Button } from './Button';

interface ReviewFormProps {
  staffId: string;
  salonId: string;
  onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  staffId,
  salonId,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { mutate: submitReview, loading } = useCreateReview();
  
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast('Please log in to submit a review.', 'error');
      return;
    }

    if (!comment.trim()) {
      toast('Please write a review comment.', 'error');
      return;
    }

    try {
      await submitReview({
        salonId,
        staffId,
        userId: user.id,
        userName: user.displayName || 'Anonymous Client',
        rating,
        comment,
      });

      toast('Review submitted successfully!', 'success');
      setComment('');
      setRating(5);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast(err.message || 'Failed to submit review.', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 border border-gray-150 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-gray-800">Leave a Review</h4>
      
      {/* Star Selector */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">Select Rating</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = hoverRating !== null ? star <= hoverRating : star <= rating;
            return (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform active:scale-95"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    isFilled 
                      ? 'text-yellow-500 fill-yellow-500' 
                      : 'text-gray-300'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Review Comment */}
      <div className="flex flex-col gap-1">
        <label htmlFor="review-comment" className="text-xs text-gray-500 font-medium">Your Review</label>
        <textarea
          id="review-comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your experience with this stylist..."
          className="w-full text-sm border border-gray-300 rounded p-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-y"
        />
      </div>

      <Button
        type="submit"
        size="sm"
        isLoading={loading}
        className="w-full"
      >
        Submit Review
      </Button>
    </form>
  );
};
