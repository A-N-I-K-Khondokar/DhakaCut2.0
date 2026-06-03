export interface Staff {
  id: string;
  salonId: string;
  name: string;
  phone: string;
  experience: number; // in years
  specialization: string[];
  avgRating: number;
  reviewCount: number;
  image: string;
  createdAt: string;
}
