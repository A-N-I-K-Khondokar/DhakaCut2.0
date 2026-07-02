export interface Booking {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  salonId: string;
  staffId: string;
  serviceId: string;
  bookingDate: string; // YYYY-MM-DD
  bookingTime: string; // HH:MM
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  cancelReason?: string;
}
