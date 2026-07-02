import { 
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  orderBy,
  Timestamp,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User, Salon, Service, Staff, Booking, Review } from '../../types';
import { generateId } from '../../utils/helpers';

// Set to true to use localStorage mock data (no Firebase needed).
// Set to false to use live Firestore — database must exist in Firebase Console.
export const isMockMode = false;

console.log(`[DhakaCut Service] Running in ${isMockMode ? 'MOCK LOCAL' : 'FIREBASE'} mode.`);

// Emit a custom storage event so real-time listeners in useBookings/useSlots
// can react immediately when bookings are created, updated, or cancelled.
export const emitBookingChange = () => {
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'dc_bookings',
    storageArea: localStorage,
  }));
};

// Helper: race a promise against a timeout so Firestore reads can never hang forever
export const withTimeout = <T>(promise: Promise<T>, ms = 8000, label = 'Firestore'): Promise<T> => {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`[DhakaCut] ${label} timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
};

// Helper: convert Firestore Timestamp to ISO string
export const mapDoc = <T>(docSnap: any): T => {
  const data = docSnap.data();
  const id = docSnap.id;
  const converted: any = { id };
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const val = data[key];
      if (val && typeof val === 'object' && typeof val.toDate === 'function') {
        converted[key] = val.toDate().toISOString();
      } else {
        converted[key] = val;
      }
    }
  }
  return converted as T;
};

// Helper to get from localstorage
export const getLocalData = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Helper to save to localstorage
export const setLocalData = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// ==========================================
// MOCK DATA STORAGE & SEEDING (LOCALSTORAGE)
// ==========================================

export const MOCK_SALONS: Salon[] = [
  {
    id: 'salon-1',
    name: 'DhakaCut Prime',
    area: 'Banani',
    address: 'House 42, Road 11, Banani, Dhaka 1213',
    phone: '+880 1711 122233',
    lat: 23.7937,
    lng: 90.4066,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600',
    rating: 4.9,
    description: 'Our flagship branch in Banani offers premium grooming services with top-tier professionals. Experience the ultimate hair styling, hot towel shaves, and skin treatments in a luxurious environment.',
    operatingHours: { open: '09:00', close: '20:00' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'salon-2',
    name: 'DhakaCut Premium',
    area: 'Gulshan 2',
    address: 'Building 12, Madani Avenue, Gulshan 2, Dhaka 1212',
    phone: '+880 1711 122244',
    lat: 23.7925,
    lng: 90.4149,
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600',
    rating: 4.8,
    description: 'Located in the exclusive Gulshan 2 neighborhood, this premium lounge delivers signature hair styling and luxury grooming. Relax with hot towels and premium therapies tailored for the modern executive.',
    operatingHours: { open: '09:00', close: '20:00' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'salon-3',
    name: 'DhakaCut Elite',
    area: 'Dhanmondi',
    address: 'Sanmar Tower, Satmasjid Road, Dhanmondi, Dhaka 1209',
    phone: '+880 1711 122255',
    lat: 23.7461,
    lng: 90.3742,
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600',
    rating: 4.7,
    description: 'Our Dhanmondi branch brings executive-class cuts and precision shaves closer to you. Experience premium beard styling and refreshing facials in our comfortable and modern studio.',
    operatingHours: { open: '09:00', close: '20:00' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'salon-4',
    name: 'DhakaCut Prestige',
    area: 'Uttara',
    address: 'Sector 3, Jashimuddin Avenue, Uttara, Dhaka 1230',
    phone: '+880 1711 122266',
    lat: 23.8728,
    lng: 90.4008,
    image: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&q=80&w=600',
    rating: 4.6,
    description: 'Serving northern Dhaka, DhakaCut Prestige offers high-quality styling, shaving, and hair treatments. Pamper yourself with services designed to keep you sharp and refreshed.',
    operatingHours: { open: '09:00', close: '20:00' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'salon-5',
    name: 'DhakaCut Studio',
    area: 'Mirpur 11',
    address: 'Mirpur Road, Avenue 5, Mirpur 11, Dhaka 1216',
    phone: '+880 1711 122277',
    lat: 23.8188,
    lng: 90.3654,
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=600',
    rating: 4.5,
    description: 'A contemporary space in Mirpur offering exceptional value grooming. Enjoy clean cuts, styling, and basic facial services from our friendly and skilled team.',
    operatingHours: { open: '09:00', close: '20:00' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'salon-6',
    name: 'DhakaCut Royal',
    area: 'Wari',
    address: 'Rankin Street, Wari, Old Dhaka 1203',
    phone: '+880 1711 122288',
    lat: 23.7171,
    lng: 90.4184,
    image: 'https://images.unsplash.com/photo-1512864084360-7c0c4d0a0845?auto=format&fit=crop&q=80&w=600',
    rating: 4.8,
    description: 'Wari’s premier address for men’s luxury grooming. DhakaCut Royal offers precision haircuts, traditional hot-lather shaves, and relaxing skin treatments in a classic regal setup.',
    operatingHours: { open: '09:00', close: '20:00' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'salon-7',
    name: 'DhakaCut Lounge',
    area: 'Badda',
    address: 'House 88, Pragati Sarani, Badda, Dhaka 1212',
    phone: '+880 1711 122299',
    lat: 23.7844,
    lng: 90.4258,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600',
    rating: 4.4,
    description: 'A cozy local groomers on Pragati Sarani. Perfect for Badda residents looking for quick, high-quality, and clean styling services at an accessible price.',
    operatingHours: { open: '09:00', close: '20:00' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'salon-8',
    name: 'DhakaCut Executive',
    area: 'Tejgaon',
    address: 'Tejgaon Industrial Area, Link Road, Dhaka 1208',
    phone: '+880 1711 122300',
    lat: 23.7684,
    lng: 90.3992,
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600',
    rating: 4.5,
    description: 'Designed specifically for busy corporate professionals. Located in Tejgaon Industrial Area, this lounge offers fast-track executive haircuts, standard shaves, and scalp massages.',
    operatingHours: { open: '09:00', close: '20:00' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'salon-9',
    name: 'DhakaCut Express',
    area: 'Mohammadpur',
    address: 'Ring Road, Mohammadpur, Dhaka 1207',
    phone: '+880 1711 122311',
    lat: 23.7628,
    lng: 90.3622,
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600',
    rating: 4.3,
    description: 'Get standard, no-wait grooming. DhakaCut Express in Mohammadpur focuses on quick styling, beard lineups, and essential grooming without compromising on cleanliness and care.',
    operatingHours: { open: '09:00', close: '20:00' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'salon-10',
    name: 'DhakaCut Hub',
    area: 'Khilgaon',
    address: 'Taltola Market Road, Khilgaon, Dhaka 1219',
    phone: '+880 1711 122322',
    lat: 23.7508,
    lng: 90.4225,
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=600',
    rating: 4.6,
    description: 'Mirrored in the lively food hub of Khilgaon, this branch offers custom cuts and beard styling. Stop by for premium grooming services before headed to your social dinner.',
    operatingHours: { open: '09:00', close: '20:00' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const MOCK_SERVICES: Service[] = [
  // Banani Salon Services
  { id: 'service-1', name: 'Classic Haircut', price: 350, duration: 30, description: 'Standard hair styling, wash, and blow dry', salonId: 'salon-1', category: 'Hair', createdAt: new Date().toISOString() },
  { id: 'service-2', name: 'Premium Haircut', price: 500, duration: 45, description: 'Custom cut, head massage, wash, and hair tonic styling', salonId: 'salon-1', category: 'Hair', createdAt: new Date().toISOString() },
  { id: 'service-3', name: 'Royal Hot Shave', price: 300, duration: 30, description: 'Traditional hot towel straight razor shave with facial cream massage', salonId: 'salon-1', category: 'Shave', createdAt: new Date().toISOString() },
  { id: 'service-4', name: 'Beard Trim & Detail', price: 200, duration: 20, description: 'Beard alignment, clipper trim, and styling oils', salonId: 'salon-1', category: 'Beard', createdAt: new Date().toISOString() },
  { id: 'service-5', name: 'Deep Cleanse Facial', price: 800, duration: 40, description: 'Exfoliating scrub, clay mask, charcoal extraction, and steam therapy', salonId: 'salon-1', category: 'Treatment', createdAt: new Date().toISOString() },

  // Gulshan Salon Services
  { id: 'service-6', name: 'Classic Haircut', price: 400, duration: 30, description: 'Standard hair styling, wash, and blow dry', salonId: 'salon-2', category: 'Hair', createdAt: new Date().toISOString() },
  { id: 'service-7', name: 'Executive Haircut', price: 600, duration: 45, description: 'Premium cut, neck massage, hot towel treatment, and wash', salonId: 'salon-2', category: 'Hair', createdAt: new Date().toISOString() },
  { id: 'service-8', name: 'Signature Hot Shave', price: 350, duration: 30, description: 'Premium razor shave, cold stone wrap, and post-shave balm', salonId: 'salon-2', category: 'Shave', createdAt: new Date().toISOString() },
  { id: 'service-9', name: 'Beard Detail & Razor Lineup', price: 250, duration: 25, description: 'Beard shaping, razor boundary lineup, and oil treatment', salonId: 'salon-2', category: 'Beard', createdAt: new Date().toISOString() },
  { id: 'service-10', name: 'Gold Radiant Facial', price: 1200, duration: 50, description: '24K gold mask, relaxing face massage, steam, and serum', salonId: 'salon-2', category: 'Treatment', createdAt: new Date().toISOString() },

  // Dhanmondi Salon Services
  { id: 'service-11', name: 'Classic Haircut', price: 300, duration: 30, description: 'Standard haircut, wash, and basic style', salonId: 'salon-3', category: 'Hair', createdAt: new Date().toISOString() },
  { id: 'service-12', name: 'Elite Haircut', price: 450, duration: 45, description: 'Clipper fade or scissor cut, head massage, wash, and blow dry', salonId: 'salon-3', category: 'Hair', createdAt: new Date().toISOString() },
  { id: 'service-13', name: 'Hot Towel Beard Trim', price: 180, duration: 20, description: 'Standard clipper trim with hot towel relaxing wrap', salonId: 'salon-3', category: 'Beard', createdAt: new Date().toISOString() },
  { id: 'service-14', name: 'Traditional Razor Shave', price: 250, duration: 25, description: 'Straight razor shave, lather, and moisturizing lotion', salonId: 'salon-3', category: 'Shave', createdAt: new Date().toISOString() },
  { id: 'service-15', name: 'Detoxifying Facial', price: 650, duration: 35, description: 'Oatmeal scrub, steam, blackhead removal mask, and moisturizer', salonId: 'salon-3', category: 'Treatment', createdAt: new Date().toISOString() },

  // Uttara Salon Services
  { id: 'service-16', name: 'Classic Haircut', price: 300, duration: 30, description: 'Standard haircut, wash, and basic style', salonId: 'salon-4', category: 'Hair', createdAt: new Date().toISOString() },
  { id: 'service-17', name: 'Prestige Haircut', price: 450, duration: 45, description: 'Custom hair styling, conditioning wash, scalp rub, and tonic', salonId: 'salon-4', category: 'Hair', createdAt: new Date().toISOString() },
  { id: 'service-18', name: 'Lather Shave & Trim', price: 220, duration: 25, description: 'Traditional warm lather shave or beard styling trim', salonId: 'salon-4', category: 'Shave', createdAt: new Date().toISOString() },
  { id: 'service-19', name: 'Anti-Acne Herbal Facial', price: 700, duration: 40, description: 'Herbal extracts clay mask, tea tree wash, steam, and extraction', salonId: 'salon-4', category: 'Treatment', createdAt: new Date().toISOString() },

  // Mirpur Salon Services
  { id: 'service-20', name: 'Classic Haircut', price: 250, duration: 30, description: 'Simple scissor/clipper haircut, wash, and comb', salonId: 'salon-5', category: 'Hair', createdAt: new Date().toISOString() },
  { id: 'service-21', name: 'Mirpur Special Haircut', price: 350, duration: 45, description: 'Modern styling, conditioning wash, and light head massage', salonId: 'salon-5', category: 'Hair', createdAt: new Date().toISOString() },
  { id: 'service-22', name: 'Standard Shave', price: 150, duration: 20, description: 'Standard razor shave with warm lather and lotion', salonId: 'salon-5', category: 'Shave', createdAt: new Date().toISOString() },
  { id: 'service-23', name: 'Beard Design Lineup', price: 150, duration: 20, description: 'Beard trimming and razor boundary sharpening', salonId: 'salon-5', category: 'Beard', createdAt: new Date().toISOString() },
  { id: 'service-24', name: 'Express Glow Facial', price: 400, duration: 25, description: 'Quick scrubbing, steam, massage, and cold towel pack', salonId: 'salon-5', category: 'Treatment', createdAt: new Date().toISOString() },

  // Wari Salon Services
  { id: 'service-25', name: 'Classic Haircut', price: 300, duration: 30, description: 'Standard haircut, wash, and basic style', salonId: 'salon-6', category: 'Hair', createdAt: new Date().toISOString() },
  { id: 'service-26', name: 'Royal Hair Styling', price: 500, duration: 45, description: 'Bespoke cut, premium wash, scalp tonic, and styled finish', salonId: 'salon-6', category: 'Hair', createdAt: new Date().toISOString() },
  { id: 'service-27', name: 'King’s Lather Shave', price: 250, duration: 25, description: 'Traditional warm lather straight shave and essential oils', salonId: 'salon-6', category: 'Shave', createdAt: new Date().toISOString() },
  { id: 'service-28', name: 'Brightening Cleanse Facial', price: 750, duration: 40, description: 'Deep pore exfoliation, steam, fruit clay mask, and serum', salonId: 'salon-6', category: 'Treatment', createdAt: new Date().toISOString() },

  // Badda Salon Services
  { id: 'service-29', name: 'Classic Haircut', price: 250, duration: 30, description: 'Simple scissor/clipper haircut, wash, and comb', salonId: 'salon-7', category: 'Hair', createdAt: new Date().toISOString() },
  { id: 'service-30', name: 'Beard Lineup & Trim', price: 150, duration: 20, description: 'Beard trimming and razor boundary sharpening', salonId: 'salon-7', category: 'Beard', createdAt: new Date().toISOString() },
  { id: 'service-31', name: 'Standard Shave', price: 150, duration: 20, description: 'Standard razor shave with warm lather and lotion', salonId: 'salon-7', category: 'Shave', createdAt: new Date().toISOString() },

  // Tejgaon Salon Services
  { id: 'service-32', name: 'Classic Haircut', price: 300, duration: 30, description: 'Standard haircut, wash, and basic style', salonId: 'salon-8', category: 'Hair', createdAt: new Date().toISOString() },
  { id: 'service-33', name: 'Executive Speed Cut', price: 400, duration: 40, description: 'Fast-track premium cut, wash, and dry for busy office hours', salonId: 'salon-8', category: 'Hair', createdAt: new Date().toISOString() },
  { id: 'service-34', name: 'Express Scalp Massage', price: 200, duration: 15, description: 'Invigorating 15-minute scalp rub with styling tonic', salonId: 'salon-8', category: 'Treatment', createdAt: new Date().toISOString() },

  // Mohammadpur Salon Services
  { id: 'service-35', name: 'Classic Haircut', price: 250, duration: 30, description: 'Simple scissor/clipper haircut, wash, and comb', salonId: 'salon-9', category: 'Hair', createdAt: new Date().toISOString() },
  { id: 'service-36', name: 'Beard Detailing', price: 150, duration: 20, description: 'Beard trimming and razor boundary sharpening', salonId: 'salon-9', category: 'Beard', createdAt: new Date().toISOString() },
  { id: 'service-37', name: 'Standard Razor Shave', price: 180, duration: 20, description: 'Standard straight razor shave and moisturizing cream', salonId: 'salon-9', category: 'Shave', createdAt: new Date().toISOString() },

  // Khilgaon Salon Services
  { id: 'service-38', name: 'Classic Haircut', price: 300, duration: 30, description: 'Standard haircut, wash, and basic style', salonId: 'salon-10', category: 'Hair', createdAt: new Date().toISOString() },
  { id: 'service-39', name: 'Hub Custom Fade', price: 400, duration: 45, description: 'Bespoke fade styling, conditioning wash, and blow dry', salonId: 'salon-10', category: 'Hair', createdAt: new Date().toISOString() },
  { id: 'service-40', name: 'Beard Trim & Clean', price: 180, duration: 20, description: 'Standard beard line trim with post-styling oils', salonId: 'salon-10', category: 'Beard', createdAt: new Date().toISOString() },
  { id: 'service-41', name: 'Premium Hair Dye', price: 800, duration: 60, description: 'Standard black/brown hair coloring and wash treatment', salonId: 'salon-10', category: 'Color', createdAt: new Date().toISOString() }
];

export const MOCK_STAFF: Staff[] = [
  // Salon 1 (Banani)
  {
    id: 'staff-1',
    salonId: 'salon-1',
    name: 'Kabir Khan',
    phone: '+880 1711 223344',
    experience: 8,
    specialization: ['Fade Cut', 'Keratin Treatment'],
    avgRating: 4.9,
    reviewCount: 42,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Senior Stylist',
    isAvailable: true,
  },
  {
    id: 'staff-2',
    salonId: 'salon-1',
    name: 'Rafsan Ahmed',
    phone: '+880 1711 223345',
    experience: 5,
    specialization: ['Hot Towel Shave', 'Beard Styling'],
    avgRating: 4.8,
    reviewCount: 28,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Master Barber',
    isAvailable: true,
  },
  {
    id: 'staff-3',
    salonId: 'salon-1',
    name: 'Mahin Islam',
    phone: '+880 1711 223346',
    experience: 3,
    specialization: ['Fade Cut', 'Scalp Treatment'],
    avgRating: 4.4,
    reviewCount: 15,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Junior Stylist',
    isAvailable: true,
  },

  // Salon 2 (Gulshan 2)
  {
    id: 'staff-4',
    salonId: 'salon-2',
    name: 'Arifin Shuvo',
    phone: '+880 1711 223347',
    experience: 10,
    specialization: ['Hair Coloring', 'Keratin Treatment'],
    avgRating: 4.9,
    reviewCount: 56,
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Color Expert',
    isAvailable: true,
  },
  {
    id: 'staff-5',
    salonId: 'salon-2',
    name: 'Imran Khan',
    phone: '+880 1711 223348',
    experience: 6,
    specialization: ['Hot Towel Shave', 'Beard Styling'],
    avgRating: 4.7,
    reviewCount: 19,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Master Barber',
    isAvailable: true,
  },
  {
    id: 'staff-6',
    salonId: 'salon-2',
    name: 'Sajid Hasan',
    phone: '+880 1711 223349',
    experience: 4,
    specialization: ['Scalp Treatment', 'Keratin Treatment'],
    avgRating: 4.5,
    reviewCount: 12,
    image: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Skin Care Specialist',
    isAvailable: true,
  },

  // Salon 3 (Dhanmondi)
  {
    id: 'staff-7',
    salonId: 'salon-3',
    name: 'Zayed Khan',
    phone: '+880 1711 223350',
    experience: 7,
    specialization: ['Fade Cut', 'Beard Styling'],
    avgRating: 4.6,
    reviewCount: 24,
    image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Senior Stylist',
    isAvailable: true,
  },
  {
    id: 'staff-8',
    salonId: 'salon-3',
    name: 'Taskin Ahmed',
    phone: '+880 1711 223351',
    experience: 5,
    specialization: ['Hair Coloring', 'Scalp Treatment'],
    avgRating: 4.7,
    reviewCount: 18,
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Color Expert',
    isAvailable: true,
  },
  {
    id: 'staff-9',
    salonId: 'salon-3',
    name: 'Rubel Mia',
    phone: '+880 1711 223352',
    experience: 3,
    specialization: ['Fade Cut', 'Hot Towel Shave'],
    avgRating: 4.2,
    reviewCount: 9,
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Junior Stylist',
    isAvailable: true,
  },

  // Salon 4 (Mirpur)
  {
    id: 'staff-10',
    salonId: 'salon-4',
    name: 'Shakib Al Hasan',
    phone: '+880 1711 223353',
    experience: 12,
    specialization: ['Fade Cut', 'Hot Towel Shave', 'Beard Styling'],
    avgRating: 5.0,
    reviewCount: 75,
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Master Barber',
    isAvailable: true,
  },
  {
    id: 'staff-11',
    salonId: 'salon-4',
    name: 'Tamim Iqbal',
    phone: '+880 1711 223354',
    experience: 9,
    specialization: ['Fade Cut', 'Keratin Treatment'],
    avgRating: 4.8,
    reviewCount: 48,
    image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Senior Stylist',
    isAvailable: true,
  },
  {
    id: 'staff-12',
    salonId: 'salon-4',
    name: 'Mushfiqur Rahim',
    phone: '+880 1711 223355',
    experience: 8,
    specialization: ['Scalp Treatment'],
    avgRating: 4.7,
    reviewCount: 32,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Skin Care Specialist',
    isAvailable: true,
  },

  // Salon 5 (Uttara)
  {
    id: 'staff-13',
    salonId: 'salon-5',
    name: 'Mustafizur Rahman',
    phone: '+880 1711 223356',
    experience: 4,
    specialization: ['Fade Cut', 'Beard Styling'],
    avgRating: 4.5,
    reviewCount: 14,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Junior Stylist',
    isAvailable: true,
  },
  {
    id: 'staff-14',
    salonId: 'salon-5',
    name: 'Mahmudullah Riyad',
    phone: '+880 1711 223357',
    experience: 11,
    specialization: ['Hair Coloring', 'Keratin Treatment'],
    avgRating: 4.9,
    reviewCount: 60,
    image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Color Expert',
    isAvailable: true,
  },
  {
    id: 'staff-15',
    salonId: 'salon-5',
    name: 'Soumya Sarkar',
    phone: '+880 1711 223358',
    experience: 5,
    specialization: ['Hot Towel Shave', 'Beard Styling'],
    avgRating: 4.3,
    reviewCount: 21,
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Master Barber',
    isAvailable: true,
  },

  // Salon 6 (Motijheel)
  {
    id: 'staff-16',
    salonId: 'salon-6',
    name: 'Liton Das',
    phone: '+880 1711 223359',
    experience: 6,
    specialization: ['Fade Cut', 'Scalp Treatment'],
    avgRating: 4.6,
    reviewCount: 22,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Senior Stylist',
    isAvailable: true,
  },
  {
    id: 'staff-17',
    salonId: 'salon-6',
    name: 'Mehidy Miraz',
    phone: '+880 1711 223360',
    experience: 5,
    specialization: ['Scalp Treatment', 'Keratin Treatment'],
    avgRating: 4.7,
    reviewCount: 18,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Skin Care Specialist',
    isAvailable: true,
  },
  {
    id: 'staff-18',
    salonId: 'salon-6',
    name: 'Shoriful Islam',
    phone: '+880 1711 223361',
    experience: 2,
    specialization: ['Fade Cut', 'Hot Towel Shave'],
    avgRating: 4.1,
    reviewCount: 10,
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Junior Stylist',
    isAvailable: true,
  },

  // Salon 7 (Bashundhara)
  {
    id: 'staff-19',
    salonId: 'salon-7',
    name: 'Towhid Hridoy',
    phone: '+880 1711 223362',
    experience: 4,
    specialization: ['Fade Cut', 'Hot Towel Shave', 'Beard Styling'],
    avgRating: 4.8,
    reviewCount: 25,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Master Barber',
    isAvailable: true,
  },
  {
    id: 'staff-20',
    salonId: 'salon-7',
    name: 'Najmul Shanto',
    phone: '+880 1711 223363',
    experience: 5,
    specialization: ['Hair Coloring', 'Keratin Treatment'],
    avgRating: 4.4,
    reviewCount: 16,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Color Expert',
    isAvailable: true,
  },
  {
    id: 'staff-21',
    salonId: 'salon-7',
    name: 'Rishad Hossain',
    phone: '+880 1711 223364',
    experience: 3,
    specialization: ['Fade Cut', 'Scalp Treatment'],
    avgRating: 4.7,
    reviewCount: 12,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Senior Stylist',
    isAvailable: true,
  },

  // Salon 8 (Mohammadpur)
  {
    id: 'staff-22',
    salonId: 'salon-8',
    name: 'Tanzim Sakib',
    phone: '+880 1711 223365',
    experience: 2,
    specialization: ['Fade Cut', 'Beard Styling'],
    avgRating: 4.5,
    reviewCount: 8,
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Junior Stylist',
    isAvailable: true,
  },
  {
    id: 'staff-23',
    salonId: 'salon-8',
    name: 'Jaker Ali',
    phone: '+880 1711 223366',
    experience: 4,
    specialization: ['Scalp Treatment'],
    avgRating: 4.6,
    reviewCount: 14,
    image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Skin Care Specialist',
    isAvailable: true,
  },
  {
    id: 'staff-24',
    salonId: 'salon-8',
    name: 'Ebadot Hossain',
    phone: '+880 1711 223367',
    experience: 6,
    specialization: ['Hot Towel Shave', 'Beard Styling'],
    avgRating: 4.8,
    reviewCount: 30,
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Master Barber',
    isAvailable: true,
  },

  // Salon 9 (Rayer Bazar)
  {
    id: 'staff-25',
    salonId: 'salon-9',
    name: 'Nasum Ahmed',
    phone: '+880 1711 223368',
    experience: 5,
    specialization: ['Hair Coloring', 'Scalp Treatment'],
    avgRating: 4.3,
    reviewCount: 11,
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Color Expert',
    isAvailable: true,
  },
  {
    id: 'staff-26',
    salonId: 'salon-9',
    name: 'Afif Hossain',
    phone: '+880 1711 223369',
    experience: 6,
    specialization: ['Fade Cut', 'Keratin Treatment'],
    avgRating: 4.5,
    reviewCount: 18,
    image: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Senior Stylist',
    isAvailable: true,
  },
  {
    id: 'staff-27',
    salonId: 'salon-9',
    name: 'Naim Sheikh',
    phone: '+880 1711 223370',
    experience: 3,
    specialization: ['Fade Cut', 'Hot Towel Shave'],
    avgRating: 4.2,
    reviewCount: 7,
    image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Junior Stylist',
    isAvailable: true,
  },

  // Salon 10 (Old Dhaka)
  {
    id: 'staff-28',
    salonId: 'salon-10',
    name: 'Shamim Patwari',
    phone: '+880 1711 223371',
    experience: 4,
    specialization: ['Fade Cut', 'Beard Styling'],
    avgRating: 4.6,
    reviewCount: 15,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Senior Stylist',
    isAvailable: true,
  },
  {
    id: 'staff-29',
    salonId: 'salon-10',
    name: 'Mahedi Hasan',
    phone: '+880 1711 223372',
    experience: 7,
    specialization: ['Hot Towel Shave', 'Beard Styling'],
    avgRating: 4.7,
    reviewCount: 28,
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Master Barber',
    isAvailable: true,
  },
  {
    id: 'staff-30',
    salonId: 'salon-10',
    name: 'Hasan Mahmud',
    phone: '+880 1711 223373',
    experience: 5,
    specialization: ['Scalp Treatment', 'Keratin Treatment'],
    avgRating: 4.8,
    reviewCount: 20,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    role: 'Skin Care Specialist',
    isAvailable: true,
  }
];


export const MOCK_REVIEWS: Review[] = [];

// Initialize mock localStorage tables if empty
export const initializeLocalStorage = () => {
  const existingSalons = localStorage.getItem('dc_salons');
  let needsReseed = false;
  if (existingSalons) {
    try {
      const parsed = JSON.parse(existingSalons);
      if (Array.isArray(parsed) && parsed.length < MOCK_SALONS.length) {
        needsReseed = true;
      }
    } catch (e) {
      needsReseed = true;
    }
  }

  // Force reset reviews and staff ratings if they have old demo data
  const hasDemoReviews = localStorage.getItem('dc_reviews') && localStorage.getItem('dc_reviews') !== '[]';
  if (hasDemoReviews) {
    localStorage.setItem('dc_reviews', JSON.stringify([]));
    needsReseed = true;
  }

  if (!existingSalons || needsReseed) {
    localStorage.setItem('dc_salons', JSON.stringify(MOCK_SALONS));
  }
  if (!localStorage.getItem('dc_services') || needsReseed) {
    localStorage.setItem('dc_services', JSON.stringify(MOCK_SERVICES));
  }
  if (!localStorage.getItem('dc_staff') || needsReseed) {
    const staffWithZeroRatings = MOCK_STAFF.map(s => ({
      ...s,
      avgRating: 0.0,
      reviewCount: 0
    }));
    localStorage.setItem('dc_staff', JSON.stringify(staffWithZeroRatings));
  }
  if (!localStorage.getItem('dc_reviews')) {
    localStorage.setItem('dc_reviews', JSON.stringify([]));
  }
  if (!localStorage.getItem('dc_bookings')) {
    localStorage.setItem('dc_bookings', JSON.stringify([]));
  }
  if (!localStorage.getItem('dc_users')) {
    // Add default admin and default customer
    const initialUsers: User[] = [
      {
        id: 'mock-uid-customer',
        email: 'customer@dhacut.com',
        displayName: 'John Doe',
        phone: '01711223344',
        role: 'customer',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'mock-uid-admin',
        email: 'admin@dhacut.com',
        displayName: 'Salon Director',
        phone: '01711223355',
        role: 'admin',
        createdAt: new Date().toISOString(),
      }
    ];
    localStorage.setItem('dc_users', JSON.stringify(initialUsers));
  }
};

initializeLocalStorage();

// Seed real Firestore database with mock data if it is empty or incomplete
export const seedFirestoreData = async (): Promise<void> => {
  try {
    console.log('[DhakaCut Service] Seeding Firestore with 10 salons, 50 services, and 30 staff...');
    
    // 1. Seed Salons
    for (const salon of MOCK_SALONS) {
      await setDoc(doc(db, 'salons', salon.id), salon);
    }
    
    // 2. Seed Services
    for (const service of MOCK_SERVICES) {
      await setDoc(doc(db, 'services', service.id), service);
    }
    
    // 3. Seed Staff
    for (const staff of MOCK_STAFF) {
      await setDoc(doc(db, 'staff', staff.id), staff);
    }
    
    console.log('[DhakaCut Service] Firestore database seeding completed successfully!');
  } catch (err) {
    console.error('[DhakaCut Service] Failed to seed Firestore database:', err);
  }
};
