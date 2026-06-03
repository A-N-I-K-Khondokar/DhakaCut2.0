export interface Service {
  id: string;
  salonId: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  createdAt: string;
  category: 'Hair' | 'Beard' | 'Shave' | 'Color' | 'Treatment';
}
