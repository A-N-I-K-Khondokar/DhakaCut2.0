export interface Salon {
  id: string;
  name: string;
  area: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  image: string;
  rating: number;
  description: string;
  operatingHours: {
    open: string;
    close: string;
  };
  createdAt: string;
  updatedAt: string;
}
