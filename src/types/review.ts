export interface Review {
  id: string;
  salonId: string;
  staffId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}
