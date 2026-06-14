import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
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
import { auth, db } from './firebase';
import { User, Salon, Service, Staff, Booking, Review } from '../types';
import { generateId } from '../utils/helpers';


// Determine if we are in mock mode (i.e. no Firebase configuration provided, or default mock IDs)
export const isMockMode = (() => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mock') === 'true') {
      localStorage.setItem('dc_force_mock', 'true');
      return true;
    }
    if (urlParams.get('mock') === 'false') {
      localStorage.removeItem('dc_force_mock');
      return false;
    }
    if (localStorage.getItem('dc_force_mock') === 'true') {
      return true;
    }
  }
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  return !apiKey || apiKey === 'mock-key' || projId === 'dhakacut-mock';
})();

console.log(`[DhakaCut Service] Running in ${isMockMode ? 'MOCK LOCAL' : 'FIREBASE'} mode.`);

// ==========================================
// MOCK DATA STORAGE & SEEDING (LOCALSTORAGE)
// ==========================================

const MOCK_SALONS: Salon[] = [
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
    name: 'DhakaCut Classic',
    area: 'Mirpur',
    address: 'Plot 15, Block B, Section 10, Mirpur, Dhaka 1216',
    phone: '+880 1711 122266',
    lat: 23.8103,
    lng: 90.3664,
    image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&q=80&w=600',
    rating: 4.5,
    description: 'Serving the vibrant community of Mirpur, this branch provides top-class hair styling and shaves at highly competitive rates. Our friendly stylists are ready to give you the perfect look.',
    operatingHours: { open: '09:00', close: '20:00' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'salon-5',
    name: 'DhakaCut Studio',
    area: 'Uttara',
    address: 'Sector 3, Sonargaon Janapath, Uttara, Dhaka 1230',
    phone: '+880 1711 122277',
    lat: 23.8759,
    lng: 90.3795,
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=600',
    rating: 4.6,
    description: 'Situated in Uttara, this modern grooming studio specializes in current haircut trends and custom styling. Enjoy our relaxing therapies in a spacious, modern, and hygienic environment.',
    operatingHours: { open: '09:00', close: '20:00' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'salon-6',
    name: 'DhakaCut Express',
    area: 'Motijheel',
    address: 'Dilkusha Commercial Area, Motijheel, Dhaka 1000',
    phone: '+880 1711 122288',
    lat: 23.7231,
    lng: 90.4185,
    image: 'https://images.unsplash.com/photo-1596728325488-58c87691e9af?auto=format&fit=crop&q=80&w=600',
    rating: 4.4,
    description: 'Designed for busy executives in Motijheel, our express branch provides fast and high-quality grooming services. Stop by for a quick haircut or a clean razor shave during your busy workday.',
    operatingHours: { open: '09:00', close: '20:00' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'salon-7',
    name: 'DhakaCut Prestige',
    area: 'Bashundhara',
    address: 'Block C, Bashundhara R/A, Dhaka 1229',
    phone: '+880 1711 122299',
    lat: 23.8136,
    lng: 90.4243,
    image: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&q=80&w=600',
    rating: 4.7,
    description: 'Located near the residential estates of Bashundhara, this high-end branch offers relaxing hair styling and facial services. Enjoy a refreshing grooming session with our friendly styling professionals.',
    operatingHours: { open: '09:00', close: '20:00' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'salon-8',
    name: 'DhakaCut Royal',
    area: 'Mohammadpur',
    address: 'Ring Road, Mohammadpur, Dhaka 1207',
    phone: '+880 1711 122300',
    lat: 23.7629,
    lng: 90.3567,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600',
    rating: 4.5,
    description: 'Bringing premium male grooming to Mohammadpur, our royal branch offers precision beard detailing and classic cuts. Step in for a relaxing hot towel treatment from our experienced team.',
    operatingHours: { open: '09:00', close: '20:00' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'salon-9',
    name: 'DhakaCut Luxe',
    area: 'Rayer Bazar',
    address: 'Rayer Bazar, Dhaka 1209',
    phone: '+880 1711 122311',
    lat: 23.7538,
    lng: 90.3621,
    image: 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?auto=format&fit=crop&q=80&w=600',
    rating: 4.3,
    description: 'Our Rayer Bazar studio delivers specialized hair treatments and beard detailing. Experience high-quality care and custom hair coloring from our dedicated staff.',
    operatingHours: { open: '09:00', close: '20:00' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'salon-10',
    name: 'DhakaCut Downtown',
    area: 'Old Dhaka',
    address: 'Sadarghat Road, Old Dhaka, Dhaka 1100',
    phone: '+880 1711 122322',
    lat: 23.7104,
    lng: 90.4074,
    image: 'https://images.unsplash.com/photo-1532710093739-9470acff878f?auto=format&fit=crop&q=80&w=600',
    rating: 4.6,
    description: 'Nestled in the historic lanes of Old Dhaka, this branch blends traditional grooming with modern comforts. Come by for a signature cut and a classic hot towel straight-razor shave.',
    operatingHours: { open: '09:00', close: '20:00' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const MOCK_SERVICES: Service[] = [
  // Salon 1
  {
    id: 'service-1-1',
    salonId: 'salon-1',
    name: 'Classic Haircut',
    description: 'A tailored haircut featuring a personal consultation, a relaxing shampoo, and precision styling.',
    price: 250,
    duration: 30,
    category: 'Hair',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-1-2',
    salonId: 'salon-1',
    name: 'Beard Trim & Shape',
    description: 'Keep your beard neat and well-defined with our professional trimming and outlining service.',
    price: 150,
    duration: 20,
    category: 'Beard',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-1-3',
    salonId: 'salon-1',
    name: 'Hot Towel Shave',
    description: 'Experience a traditional straight razor shave paired with soothing pre-shave oils and hot towels.',
    price: 300,
    duration: 40,
    category: 'Shave',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-1-4',
    salonId: 'salon-1',
    name: 'Hair Color (Full)',
    description: 'Get a full coverage hair color change using premium, skin-safe organic dyes.',
    price: 800,
    duration: 90,
    category: 'Color',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-1-5',
    salonId: 'salon-1',
    name: 'Scalp Treatment',
    description: 'Rejuvenate your hair roots and soothe your dry scalp with our deep-conditioning therapy.',
    price: 500,
    duration: 60,
    category: 'Treatment',
    createdAt: new Date().toISOString(),
  },
  // Salon 2
  {
    id: 'service-2-1',
    salonId: 'salon-2',
    name: 'Classic Haircut',
    description: 'A tailored haircut featuring a personal consultation, a relaxing shampoo, and precision styling.',
    price: 250,
    duration: 30,
    category: 'Hair',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-2-2',
    salonId: 'salon-2',
    name: 'Beard Trim & Shape',
    description: 'Keep your beard neat and well-defined with our professional trimming and outlining service.',
    price: 150,
    duration: 20,
    category: 'Beard',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-2-3',
    salonId: 'salon-2',
    name: 'Hot Towel Shave',
    description: 'Experience a traditional straight razor shave paired with soothing pre-shave oils and hot towels.',
    price: 300,
    duration: 40,
    category: 'Shave',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-2-4',
    salonId: 'salon-2',
    name: 'Hair Color (Full)',
    description: 'Get a full coverage hair color change using premium, skin-safe organic dyes.',
    price: 800,
    duration: 90,
    category: 'Color',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-2-5',
    salonId: 'salon-2',
    name: 'Scalp Treatment',
    description: 'Rejuvenate your hair roots and soothe your dry scalp with our deep-conditioning therapy.',
    price: 500,
    duration: 60,
    category: 'Treatment',
    createdAt: new Date().toISOString(),
  },
  // Salon 3
  {
    id: 'service-3-1',
    salonId: 'salon-3',
    name: 'Classic Haircut',
    description: 'A tailored haircut featuring a personal consultation, a relaxing shampoo, and precision styling.',
    price: 250,
    duration: 30,
    category: 'Hair',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-3-2',
    salonId: 'salon-3',
    name: 'Beard Trim & Shape',
    description: 'Keep your beard neat and well-defined with our professional trimming and outlining service.',
    price: 150,
    duration: 20,
    category: 'Beard',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-3-3',
    salonId: 'salon-3',
    name: 'Hot Towel Shave',
    description: 'Experience a traditional straight razor shave paired with soothing pre-shave oils and hot towels.',
    price: 300,
    duration: 40,
    category: 'Shave',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-3-4',
    salonId: 'salon-3',
    name: 'Hair Color (Full)',
    description: 'Get a full coverage hair color change using premium, skin-safe organic dyes.',
    price: 800,
    duration: 90,
    category: 'Color',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-3-5',
    salonId: 'salon-3',
    name: 'Scalp Treatment',
    description: 'Rejuvenate your hair roots and soothe your dry scalp with our deep-conditioning therapy.',
    price: 500,
    duration: 60,
    category: 'Treatment',
    createdAt: new Date().toISOString(),
  },
  // Salon 4
  {
    id: 'service-4-1',
    salonId: 'salon-4',
    name: 'Classic Haircut',
    description: 'A tailored haircut featuring a personal consultation, a relaxing shampoo, and precision styling.',
    price: 250,
    duration: 30,
    category: 'Hair',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-4-2',
    salonId: 'salon-4',
    name: 'Beard Trim & Shape',
    description: 'Keep your beard neat and well-defined with our professional trimming and outlining service.',
    price: 150,
    duration: 20,
    category: 'Beard',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-4-3',
    salonId: 'salon-4',
    name: 'Hot Towel Shave',
    description: 'Experience a traditional straight razor shave paired with soothing pre-shave oils and hot towels.',
    price: 300,
    duration: 40,
    category: 'Shave',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-4-4',
    salonId: 'salon-4',
    name: 'Hair Color (Full)',
    description: 'Get a full coverage hair color change using premium, skin-safe organic dyes.',
    price: 800,
    duration: 90,
    category: 'Color',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-4-5',
    salonId: 'salon-4',
    name: 'Scalp Treatment',
    description: 'Rejuvenate your hair roots and soothe your dry scalp with our deep-conditioning therapy.',
    price: 500,
    duration: 60,
    category: 'Treatment',
    createdAt: new Date().toISOString(),
  },
  // Salon 5
  {
    id: 'service-5-1',
    salonId: 'salon-5',
    name: 'Classic Haircut',
    description: 'A tailored haircut featuring a personal consultation, a relaxing shampoo, and precision styling.',
    price: 250,
    duration: 30,
    category: 'Hair',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-5-2',
    salonId: 'salon-5',
    name: 'Beard Trim & Shape',
    description: 'Keep your beard neat and well-defined with our professional trimming and outlining service.',
    price: 150,
    duration: 20,
    category: 'Beard',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-5-3',
    salonId: 'salon-5',
    name: 'Hot Towel Shave',
    description: 'Experience a traditional straight razor shave paired with soothing pre-shave oils and hot towels.',
    price: 300,
    duration: 40,
    category: 'Shave',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-5-4',
    salonId: 'salon-5',
    name: 'Hair Color (Full)',
    description: 'Get a full coverage hair color change using premium, skin-safe organic dyes.',
    price: 800,
    duration: 90,
    category: 'Color',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-5-5',
    salonId: 'salon-5',
    name: 'Scalp Treatment',
    description: 'Rejuvenate your hair roots and soothe your dry scalp with our deep-conditioning therapy.',
    price: 500,
    duration: 60,
    category: 'Treatment',
    createdAt: new Date().toISOString(),
  },
  // Salon 6
  {
    id: 'service-6-1',
    salonId: 'salon-6',
    name: 'Classic Haircut',
    description: 'A tailored haircut featuring a personal consultation, a relaxing shampoo, and precision styling.',
    price: 250,
    duration: 30,
    category: 'Hair',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-6-2',
    salonId: 'salon-6',
    name: 'Beard Trim & Shape',
    description: 'Keep your beard neat and well-defined with our professional trimming and outlining service.',
    price: 150,
    duration: 20,
    category: 'Beard',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-6-3',
    salonId: 'salon-6',
    name: 'Hot Towel Shave',
    description: 'Experience a traditional straight razor shave paired with soothing pre-shave oils and hot towels.',
    price: 300,
    duration: 40,
    category: 'Shave',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-6-4',
    salonId: 'salon-6',
    name: 'Hair Color (Full)',
    description: 'Get a full coverage hair color change using premium, skin-safe organic dyes.',
    price: 800,
    duration: 90,
    category: 'Color',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-6-5',
    salonId: 'salon-6',
    name: 'Scalp Treatment',
    description: 'Rejuvenate your hair roots and soothe your dry scalp with our deep-conditioning therapy.',
    price: 500,
    duration: 60,
    category: 'Treatment',
    createdAt: new Date().toISOString(),
  },
  // Salon 7
  {
    id: 'service-7-1',
    salonId: 'salon-7',
    name: 'Classic Haircut',
    description: 'A tailored haircut featuring a personal consultation, a relaxing shampoo, and precision styling.',
    price: 250,
    duration: 30,
    category: 'Hair',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-7-2',
    salonId: 'salon-7',
    name: 'Beard Trim & Shape',
    description: 'Keep your beard neat and well-defined with our professional trimming and outlining service.',
    price: 150,
    duration: 20,
    category: 'Beard',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-7-3',
    salonId: 'salon-7',
    name: 'Hot Towel Shave',
    description: 'Experience a traditional straight razor shave paired with soothing pre-shave oils and hot towels.',
    price: 300,
    duration: 40,
    category: 'Shave',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-7-4',
    salonId: 'salon-7',
    name: 'Hair Color (Full)',
    description: 'Get a full coverage hair color change using premium, skin-safe organic dyes.',
    price: 800,
    duration: 90,
    category: 'Color',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-7-5',
    salonId: 'salon-7',
    name: 'Scalp Treatment',
    description: 'Rejuvenate your hair roots and soothe your dry scalp with our deep-conditioning therapy.',
    price: 500,
    duration: 60,
    category: 'Treatment',
    createdAt: new Date().toISOString(),
  },
  // Salon 8
  {
    id: 'service-8-1',
    salonId: 'salon-8',
    name: 'Classic Haircut',
    description: 'A tailored haircut featuring a personal consultation, a relaxing shampoo, and precision styling.',
    price: 250,
    duration: 30,
    category: 'Hair',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-8-2',
    salonId: 'salon-8',
    name: 'Beard Trim & Shape',
    description: 'Keep your beard neat and well-defined with our professional trimming and outlining service.',
    price: 150,
    duration: 20,
    category: 'Beard',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-8-3',
    salonId: 'salon-8',
    name: 'Hot Towel Shave',
    description: 'Experience a traditional straight razor shave paired with soothing pre-shave oils and hot towels.',
    price: 300,
    duration: 40,
    category: 'Shave',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-8-4',
    salonId: 'salon-8',
    name: 'Hair Color (Full)',
    description: 'Get a full coverage hair color change using premium, skin-safe organic dyes.',
    price: 800,
    duration: 90,
    category: 'Color',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-8-5',
    salonId: 'salon-8',
    name: 'Scalp Treatment',
    description: 'Rejuvenate your hair roots and soothe your dry scalp with our deep-conditioning therapy.',
    price: 500,
    duration: 60,
    category: 'Treatment',
    createdAt: new Date().toISOString(),
  },
  // Salon 9
  {
    id: 'service-9-1',
    salonId: 'salon-9',
    name: 'Classic Haircut',
    description: 'A tailored haircut featuring a personal consultation, a relaxing shampoo, and precision styling.',
    price: 250,
    duration: 30,
    category: 'Hair',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-9-2',
    salonId: 'salon-9',
    name: 'Beard Trim & Shape',
    description: 'Keep your beard neat and well-defined with our professional trimming and outlining service.',
    price: 150,
    duration: 20,
    category: 'Beard',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-9-3',
    salonId: 'salon-9',
    name: 'Hot Towel Shave',
    description: 'Experience a traditional straight razor shave paired with soothing pre-shave oils and hot towels.',
    price: 300,
    duration: 40,
    category: 'Shave',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-9-4',
    salonId: 'salon-9',
    name: 'Hair Color (Full)',
    description: 'Get a full coverage hair color change using premium, skin-safe organic dyes.',
    price: 800,
    duration: 90,
    category: 'Color',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-9-5',
    salonId: 'salon-9',
    name: 'Scalp Treatment',
    description: 'Rejuvenate your hair roots and soothe your dry scalp with our deep-conditioning therapy.',
    price: 500,
    duration: 60,
    category: 'Treatment',
    createdAt: new Date().toISOString(),
  },
  // Salon 10
  {
    id: 'service-10-1',
    salonId: 'salon-10',
    name: 'Classic Haircut',
    description: 'A tailored haircut featuring a personal consultation, a relaxing shampoo, and precision styling.',
    price: 250,
    duration: 30,
    category: 'Hair',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-10-2',
    salonId: 'salon-10',
    name: 'Beard Trim & Shape',
    description: 'Keep your beard neat and well-defined with our professional trimming and outlining service.',
    price: 150,
    duration: 20,
    category: 'Beard',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-10-3',
    salonId: 'salon-10',
    name: 'Hot Towel Shave',
    description: 'Experience a traditional straight razor shave paired with soothing pre-shave oils and hot towels.',
    price: 300,
    duration: 40,
    category: 'Shave',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-10-4',
    salonId: 'salon-10',
    name: 'Hair Color (Full)',
    description: 'Get a full coverage hair color change using premium, skin-safe organic dyes.',
    price: 800,
    duration: 90,
    category: 'Color',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-10-5',
    salonId: 'salon-10',
    name: 'Scalp Treatment',
    description: 'Rejuvenate your hair roots and soothe your dry scalp with our deep-conditioning therapy.',
    price: 500,
    duration: 60,
    category: 'Treatment',
    createdAt: new Date().toISOString(),
  },
]

const MOCK_STAFF: Staff[] = [
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

const MOCK_REVIEWS: Review[] = [
  {
    id: 'review-1',
    salonId: 'salon-1',
    staffId: 'staff-1',
    userId: 'user-customer',
    userName: 'Tanvir Rahman',
    rating: 5,
    comment: 'Kabir is the best barber in Banani! Absolute perfection on the fade.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'review-2',
    salonId: 'salon-1',
    staffId: 'staff-2',
    userId: 'user-customer2',
    userName: 'Sadman Sakib',
    rating: 4,
    comment: 'Great hot towel shave. Very relaxing experience.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'review-3',
    salonId: 'salon-2',
    staffId: 'staff-3',
    userId: 'user-customer3',
    userName: 'Mehrab Hossain',
    rating: 5,
    comment: 'Exceptional service and extremely clean environment. Arifin is a master of his craft.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Initialize mock localStorage tables if empty
const initializeLocalStorage = () => {
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

  if (!existingSalons || needsReseed) {
    localStorage.setItem('dc_salons', JSON.stringify(MOCK_SALONS));
  }
  if (!localStorage.getItem('dc_services') || needsReseed) {
    localStorage.setItem('dc_services', JSON.stringify(MOCK_SERVICES));
  }
  if (!localStorage.getItem('dc_staff') || needsReseed) {
    localStorage.setItem('dc_staff', JSON.stringify(MOCK_STAFF));
  }
  if (!localStorage.getItem('dc_reviews')) {
    localStorage.setItem('dc_reviews', JSON.stringify(MOCK_REVIEWS));
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

// Helper to get from localstorage
const getLocalData = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Helper to save to localstorage
const setLocalData = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Helper to convert Firestore Timestamp to ISO string
const mapDoc = <T>(docSnap: any): T => {
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

// ==========================================
// AUTHENTICATION FUNCTIONS
// ==========================================

export const signUp = async (email: string, password: string, name: string, phone: string): Promise<User> => {
  if (isMockMode) {
    const users = getLocalData<User>('dc_users');
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) throw new Error('Email already in use.');

    const newUser: User = {
      id: `mock-uid-${generateId(8)}`,
      email,
      displayName: name,
      phone,
      role: email.toLowerCase().includes('admin') ? 'admin' : 'customer', // Auto-promote users with admin in email
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    setLocalData('dc_users', users);
    
    // Save session in local storage
    localStorage.setItem('dhakacut_user', JSON.stringify(newUser));
    return newUser;
  } else {
    // Step 1: Firebase Auth — hard fail on auth errors
    let fbUser: any = null;
    try {
      console.log('[DhakaCut Auth Debug] Starting signUp with email:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      fbUser = userCredential.user;
      console.log('[DhakaCut Auth Debug] Auth account created. UID:', fbUser.uid);
      await updateProfile(fbUser, { displayName: name });
      console.log('[DhakaCut Auth Debug] Display name set.');
    } catch (authErr: any) {
      console.error('[DhakaCut Service] Auth error in signUp:', authErr);
      if (authErr.code === 'auth/email-already-in-use') {
        throw new Error('This email is already in use.');
      } else if (authErr.code === 'auth/weak-password') {
        throw new Error('The password is too weak. It must be at least 6 characters.');
      } else if (authErr.code === 'auth/invalid-email') {
        throw new Error('The email address is invalid.');
      }
      throw new Error(authErr.message || 'Failed to sign up.');
    }

    // Step 2: Write Firestore profile — soft fail if offline
    const role = email.toLowerCase().includes('admin') ? 'admin' : 'customer';
    const userObj: User = {
      id: fbUser.uid,
      email,
      displayName: name,
      phone,
      role,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', fbUser.uid), {
        ...userObj,
        createdAt: serverTimestamp(),
      });
      console.log('[DhakaCut Auth Debug] Firestore profile saved.');
    } catch (firestoreErr: any) {
      // Firestore offline — account is created in Auth, user can still proceed
      console.warn('[DhakaCut Auth Debug] Firestore offline during signUp. Profile will sync later.', firestoreErr.message);
    }

    localStorage.setItem('dhakacut_user', JSON.stringify(userObj));
    console.log('[DhakaCut Auth Debug] SignUp complete. Role:', role);
    return userObj;
  }
};

export const logIn = async (email: string, password: string): Promise<User> => {
  if (isMockMode) {
    const users = getLocalData<User>('dc_users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('User not found. Try signing up or check credentials.');
    
    // Mock simple password validation: matching length at least
    if (password.length < 6) throw new Error('Invalid credentials (password too short).');

    localStorage.setItem('dhakacut_user', JSON.stringify(user));
    return user;
  } else {
    let fbUser: any = null;
    try {
      console.log('[DhakaCut Auth Debug] Starting logIn with email:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      fbUser = userCredential.user;
      console.log('[DhakaCut Auth Debug] Auth succeeded. UID:', fbUser.uid);
    } catch (authErr: any) {
      console.error('[DhakaCut Service] Firebase Auth error in logIn:', authErr);
      if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/wrong-password' || authErr.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password.');
      } else if (authErr.code === 'auth/invalid-email') {
        throw new Error('The email address is invalid.');
      }
      throw new Error(authErr.message || 'Failed to log in.');
    }

    // Auth succeeded — now try to load Firestore profile
    // If Firestore is offline, fall back gracefully using Auth data
    try {
      console.log('[DhakaCut Auth Debug] Fetching Firestore user document...');
      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));

      if (userDoc.exists()) {
        const userData = mapDoc<User>(userDoc);
        localStorage.setItem('dhakacut_user', JSON.stringify(userData));
        console.log('[DhakaCut Auth Debug] User profile loaded from Firestore.');
        return userData;
      }

      // Firestore document missing — create it
      console.warn('[DhakaCut Auth Debug] Firestore profile missing. Creating one...');
      const role: 'admin' | 'customer' = (fbUser.email && fbUser.email.toLowerCase().includes('admin')) ? 'admin' : 'customer';
      const newProfile = {
        id: fbUser.uid,
        email: fbUser.email || email,
        displayName: fbUser.displayName || email.split('@')[0],
        phone: '',
        role,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', fbUser.uid), newProfile);
      const userObj: User = { ...newProfile, createdAt: new Date().toISOString() };
      localStorage.setItem('dhakacut_user', JSON.stringify(userObj));
      return userObj;
    } catch (firestoreErr: any) {
      // Firestore is offline — but Auth worked! Build user from auth token and let them in.
      console.warn('[DhakaCut Auth Debug] Firestore offline. Using Auth data as fallback user profile.');
      const role = (fbUser.email && fbUser.email.toLowerCase().includes('admin')) ? 'admin' : 'customer';
      const offlineUser: User = {
        id: fbUser.uid,
        email: fbUser.email || email,
        displayName: fbUser.displayName || email.split('@')[0],
        phone: '',
        role,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('dhakacut_user', JSON.stringify(offlineUser));
      console.log('[DhakaCut Auth Debug] Offline login successful via Auth fallback. Role:', role);
      return offlineUser;
    }
  }
};

export const logOut = async (): Promise<void> => {
  localStorage.removeItem('dhakacut_user');
  if (!isMockMode) {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('[DhakaCut Service] Error in logOut:', err);
      throw new Error(err.message || 'Failed to log out.');
    }
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  const localCached = localStorage.getItem('dhakacut_user');
  if (localCached) {
    return JSON.parse(localCached);
  }
  
  if (isMockMode) return null;

  const fbUser = auth.currentUser;
  if (!fbUser) return null;

  try {
    const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
    if (userDoc.exists()) {
      const data = mapDoc<User>(userDoc);
      localStorage.setItem('dhakacut_user', JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.error('[DhakaCut Service] Error fetching current user from Firestore: ', err);
  }
  return null;
};

export const resetPassword = async (email: string): Promise<void> => {
  if (isMockMode) {
    const users = getLocalData<User>('dc_users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('User not found.');
    console.log(`Password reset email sent (Mocked) to: ${email}`);
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in resetPassword:', err);
    if (err.code === 'auth/user-not-found') {
      throw new Error('User not found.');
    } else if (err.code === 'auth/invalid-email') {
      throw new Error('The email address is invalid.');
    }
    throw new Error(err.message || 'Failed to send password reset email.');
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
  if (isMockMode) {
    const users = getLocalData<User>('dc_users');
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found.');
    
    users[idx] = { ...users[idx], ...updates };
    setLocalData('dc_users', users);
    
    // Update local cache if updating current logged in user
    const cur = localStorage.getItem('dhakacut_user');
    if (cur) {
      const parsed = JSON.parse(cur) as User;
      if (parsed.id === userId) {
        localStorage.setItem('dhakacut_user', JSON.stringify(users[idx]));
      }
    }
    return;
  }
  try {
    await updateDoc(doc(db, 'users', userId), updates);
    
    const cur = localStorage.getItem('dhakacut_user');
    if (cur) {
      const parsed = JSON.parse(cur) as User;
      if (parsed.id === userId) {
        localStorage.setItem('dhakacut_user', JSON.stringify({ ...parsed, ...updates }));
      }
    }
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in updateUserProfile:', err);
    throw new Error('Failed to update user profile.');
  }
};


// ==========================================
// SALON FUNCTIONS
// ==========================================

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

export const getAllSalons = async (): Promise<Salon[]> => {
  if (isMockMode) {
    return getLocalData<Salon>('dc_salons');
  }
  try {
    const querySnapshot = await getDocs(collection(db, 'salons'));
    const salons: Salon[] = [];
    querySnapshot.forEach((docSnap) => {
      salons.push(mapDoc<Salon>(docSnap));
    });

    // Seed Firestore ONLY ONCE per session if the database is empty/incomplete.
    // Previously this ran on every getAllSalons() call, causing 5-10s delays.
    const alreadySeeded = sessionStorage.getItem('dc_seeded');
    if (salons.length < MOCK_SALONS.length && !alreadySeeded) {
      console.log(`[DhakaCut Service] Firestore has ${salons.length} salons — seeding once this session...`);
      sessionStorage.setItem('dc_seeded', 'true');
      await seedFirestoreData();

      // Re-fetch after seeding
      const reQuery = await getDocs(collection(db, 'salons'));
      const reSalons: Salon[] = [];
      reQuery.forEach((docSnap) => {
        reSalons.push(mapDoc<Salon>(docSnap));
      });
      return reSalons.sort((a, b) => b.rating - a.rating);
    }

    // Sort by rating (descending) by default
    return salons.sort((a, b) => b.rating - a.rating);
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in getAllSalons:', err);
    throw new Error('Failed to load salons. Please try again.');
  }
};

export const getSalonById = async (id: string): Promise<Salon | null> => {
  if (isMockMode) {
    return getLocalData<Salon>('dc_salons').find(s => s.id === id) || null;
  }
  try {
    const docSnap = await getDoc(doc(db, 'salons', id));
    if (docSnap.exists()) {
      return mapDoc<Salon>(docSnap);
    }
    return null;
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in getSalonById:', err);
    throw new Error('Failed to fetch salon details.');
  }
};

export const getSalonsByArea = async (area: string): Promise<Salon[]> => {
  if (isMockMode) {
    return getLocalData<Salon>('dc_salons').filter(s => s.area.toLowerCase() === area.toLowerCase());
  }
  try {
    const q = query(collection(db, 'salons'), where('area', '==', area));
    const querySnapshot = await getDocs(q);
    const salons: Salon[] = [];
    querySnapshot.forEach((docSnap) => {
      salons.push(mapDoc<Salon>(docSnap));
    });
    return salons.sort((a, b) => b.rating - a.rating);
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in getSalonsByArea:', err);
    throw new Error('Failed to fetch salons in this area.');
  }
};

export const createSalon = async (data: Omit<Salon, 'id' | 'createdAt' | 'updatedAt' | 'rating'>): Promise<Salon> => {
  if (isMockMode) {
    const newSalon: Salon = {
      ...data,
      id: `salon-${generateId(8)}`,
      rating: 5.0, // Initial rating
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const salons = getLocalData<Salon>('dc_salons');
    salons.push(newSalon);
    setLocalData('dc_salons', salons);
    return newSalon;
  } else {
    try {
      const dbData = {
        ...data,
        rating: 5.0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'salons'), dbData);
      return {
        ...data,
        id: docRef.id,
        rating: 5.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      console.error('[DhakaCut Service] Error in createSalon:', err);
      throw new Error(err.message || 'Failed to create salon.');
    }
  }
};

export const updateSalon = async (id: string, updates: Partial<Salon>): Promise<void> => {
  if (isMockMode) {
    const salons = getLocalData<Salon>('dc_salons');
    const idx = salons.findIndex(s => s.id === id);
    if (idx !== -1) {
      salons[idx] = { ...salons[idx], ...updates, updatedAt: new Date().toISOString() };
      setLocalData('dc_salons', salons);
    }
    return;
  }
  try {
    const dbUpdates = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    await updateDoc(doc(db, 'salons', id), dbUpdates);
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in updateSalon:', err);
    throw new Error('Failed to update salon.');
  }
};

export const deleteSalon = async (id: string): Promise<void> => {
  if (isMockMode) {
    const salons = getLocalData<Salon>('dc_salons');
    const filtered = salons.filter(s => s.id !== id);
    setLocalData('dc_salons', filtered);
    
    // Cascading delete mock bookings/staff/reviews matching salonId
    const staff = getLocalData<Staff>('dc_staff').filter(st => st.salonId !== id);
    setLocalData('dc_staff', staff);
    const reviews = getLocalData<Review>('dc_reviews').filter(r => r.salonId !== id);
    setLocalData('dc_reviews', reviews);
    const bookings = getLocalData<Booking>('dc_bookings').filter(b => b.salonId !== id);
    setLocalData('dc_bookings', bookings);
    return;
  }
  try {
    await deleteDoc(doc(db, 'salons', id));
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in deleteSalon:', err);
    throw new Error('Failed to delete salon.');
  }
};


// ==========================================
// SERVICE FUNCTIONS
// ==========================================

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


// ==========================================
// STAFF FUNCTIONS
// ==========================================

export const getStaffBySalon = async (salonId: string): Promise<Staff[]> => {
  if (isMockMode) {
    return getLocalData<Staff>('dc_staff').filter(st => st.salonId === salonId);
  }
  try {
    const q = query(collection(db, 'staff'), where('salonId', '==', salonId));
    const querySnapshot = await getDocs(q);
    const staff: Staff[] = [];
    querySnapshot.forEach((docSnap) => {
      staff.push(mapDoc<Staff>(docSnap));
    });
    return staff;
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in getStaffBySalon:', err);
    throw new Error('Failed to fetch staff for this salon.');
  }
};

export const getAllStaff = async (): Promise<Staff[]> => {
  if (isMockMode) {
    return getLocalData<Staff>('dc_staff');
  }
  try {
    const querySnapshot = await getDocs(collection(db, 'staff'));
    const staff: Staff[] = [];
    querySnapshot.forEach((docSnap) => {
      staff.push(mapDoc<Staff>(docSnap));
    });
    return staff;
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in getAllStaff:', err);
    throw new Error('Failed to fetch all staff.');
  }
};

export const getStaffById = async (id: string): Promise<Staff | null> => {
  if (isMockMode) {
    return getLocalData<Staff>('dc_staff').find(st => st.id === id) || null;
  }
  try {
    const docSnap = await getDoc(doc(db, 'staff', id));
    if (docSnap.exists()) {
      return mapDoc<Staff>(docSnap);
    }
    return null;
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in getStaffById:', err);
    throw new Error('Failed to fetch staff details.');
  }
};

export const createStaff = async (data: Omit<Staff, 'id' | 'createdAt' | 'avgRating' | 'reviewCount'>): Promise<Staff> => {
  if (isMockMode) {
    const newStaff: Staff = {
      ...data,
      id: `staff-${generateId(8)}`,
      avgRating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };
    const staffList = getLocalData<Staff>('dc_staff');
    staffList.push(newStaff);
    setLocalData('dc_staff', staffList);
    return newStaff;
  } else {
    try {
      const dbData = {
        ...data,
        avgRating: 5.0,
        reviewCount: 0,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'staff'), dbData);
      return {
        ...data,
        id: docRef.id,
        avgRating: 5.0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
      };
    } catch (err: any) {
      console.error('[DhakaCut Service] Error in createStaff:', err);
      throw new Error(err.message || 'Failed to create staff member.');
    }
  }
};

export const updateStaff = async (id: string, updates: Partial<Staff>): Promise<void> => {
  if (isMockMode) {
    const staffList = getLocalData<Staff>('dc_staff');
    const idx = staffList.findIndex(st => st.id === id);
    if (idx !== -1) {
      staffList[idx] = { ...staffList[idx], ...updates };
      setLocalData('dc_staff', staffList);
    }
    return;
  }
  try {
    await updateDoc(doc(db, 'staff', id), updates);
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in updateStaff:', err);
    throw new Error('Failed to update staff member.');
  }
};

export const deleteStaff = async (id: string): Promise<void> => {
  if (isMockMode) {
    const staffList = getLocalData<Staff>('dc_staff');
    const filtered = staffList.filter(st => st.id !== id);
    setLocalData('dc_staff', filtered);
    
    // Clean up reviews and bookings matching staffId
    const reviews = getLocalData<Review>('dc_reviews').filter(r => r.staffId !== id);
    setLocalData('dc_reviews', reviews);
    const bookings = getLocalData<Booking>('dc_bookings').filter(b => b.staffId !== id);
    setLocalData('dc_bookings', bookings);
    return;
  }
  try {
    await deleteDoc(doc(db, 'staff', id));
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in deleteStaff:', err);
    throw new Error('Failed to delete staff member.');
  }
};


// ==========================================
// BOOKING FLOW & DATES
// ==========================================

export const createBooking = async (data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Booking> => {
  if (isMockMode) {
    const newBooking: Booking = {
      ...data,
      id: `booking-${generateId(8)}`,
      status: 'confirmed', // Automatically confirm bookings for ease of use
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const bookings = getLocalData<Booking>('dc_bookings');
    bookings.push(newBooking);
    setLocalData('dc_bookings', bookings);
    return newBooking;
  } else {
    try {
      const dbData = {
        ...data,
        status: 'confirmed' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'bookings'), dbData);
      return {
        ...data,
        id: docRef.id,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (err: any) {
      console.error('[DhakaCut Service] Error in createBooking:', err);
      throw new Error(err.message || 'Failed to create booking.');
    }
  }
};

export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  if (isMockMode) {
    const bookings = getLocalData<Booking>('dc_bookings');
    // Sort descending by date & time
    return bookings
      .filter(b => b.userId === userId)
      .sort((a, b) => b.bookingDate.localeCompare(a.bookingDate) || b.bookingTime.localeCompare(a.bookingTime));
  }
  try {
    const q = query(
      collection(db, 'bookings'), 
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];
    querySnapshot.forEach((docSnap) => {
      bookings.push(mapDoc<Booking>(docSnap));
    });
    return bookings.sort((a, b) => b.bookingDate.localeCompare(a.bookingDate) || b.bookingTime.localeCompare(a.bookingTime));
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in getUserBookings:', err);
    throw new Error('Failed to fetch user bookings.');
  }
};

export const getAllBookings = async (): Promise<Booking[]> => {
  if (isMockMode) {
    return getLocalData<Booking>('dc_bookings')
      .sort((a, b) => b.bookingDate.localeCompare(a.bookingDate) || b.bookingTime.localeCompare(a.bookingTime));
  }
  try {
    const querySnapshot = await getDocs(collection(db, 'bookings'));
    const bookings: Booking[] = [];
    querySnapshot.forEach((docSnap) => {
      bookings.push(mapDoc<Booking>(docSnap));
    });
    return bookings.sort((a, b) => b.bookingDate.localeCompare(a.bookingDate) || b.bookingTime.localeCompare(a.bookingTime));
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in getAllBookings:', err);
    throw new Error('Failed to fetch all bookings.');
  }
};

export const updateBookingStatus = async (id: string, status: Booking['status']): Promise<void> => {
  if (isMockMode) {
    const bookings = getLocalData<Booking>('dc_bookings');
    const idx = bookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      bookings[idx] = { ...bookings[idx], status, updatedAt: new Date().toISOString() };
      setLocalData('dc_bookings', bookings);
    }
    return;
  }
  try {
    await updateDoc(doc(db, 'bookings', id), {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in updateBookingStatus:', err);
    throw new Error('Failed to update booking status.');
  }
};

export const cancelBooking = async (id: string): Promise<void> => {
  await updateBookingStatus(id, 'cancelled');
};

/**
 * Returns available 30-min time slots from 09:00 to 18:30 for a specific staff on a date.
 * Excludes slots that are already booked.
 */
export const getAvailableTimeSlots = async (staffId: string, date: string): Promise<string[]> => {
  const allSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', 
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', 
    '18:00', '18:30'
  ];

  try {
    let bookedSlots: string[] = [];

    if (isMockMode) {
      const bookings = getLocalData<Booking>('dc_bookings');
      bookedSlots = bookings
        .filter(b => b.staffId === staffId && b.bookingDate === date && b.status !== 'cancelled')
        .map(b => b.bookingTime);
    } else {
      const q = query(
        collection(db, 'bookings'),
        where('staffId', '==', staffId),
        where('bookingDate', '==', date)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(docSnap => {
        const b = mapDoc<Booking>(docSnap);
        if (b.status !== 'cancelled') {
          bookedSlots.push(b.bookingTime);
        }
      });
    }

    // Filter out booked slots. Also, if date is today, filter out past slots.
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return allSlots.filter(slot => {
      // Check if slot is already booked
      if (bookedSlots.includes(slot)) return false;
      
      // Check if slot is in the past (if date is today)
      if (date === todayStr) {
        const [slotH, slotM] = slot.split(':').map(Number);
        if (slotH < currentHour || (slotH === currentHour && slotM <= currentMinute)) {
          return false;
        }
      }
      return true;
    });
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in getAvailableTimeSlots:', err);
    throw new Error('Failed to get available time slots.');
  }
};

export const isTimeSlotBooked = async (staffId: string, date: string, time: string): Promise<boolean> => {
  const available = await getAvailableTimeSlots(staffId, date);
  return !available.includes(time);
};


// ==========================================
// REVIEWS & RATINGS SYSTEM
// ==========================================

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
    
    // Re-calculate staff average rating & review count
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

export const calculateStaffAvgRating = async (staffId: string): Promise<{ avgRating: number; reviewCount: number }> => {
  try {
    let staffReviews: Review[] = [];
    
    if (isMockMode) {
      staffReviews = getLocalData<Review>('dc_reviews').filter(r => r.staffId === staffId);
    } else {
      const q = query(collection(db, 'reviews'), where('staffId', '==', staffId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(docSnap => {
        staffReviews.push(mapDoc<Review>(docSnap));
      });
    }

    const reviewCount = staffReviews.length;
    const avgRating = reviewCount > 0 
      ? parseFloat((staffReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
      : 5.0;

    // Update staff document with new scores
    await updateStaff(staffId, { avgRating, reviewCount });
    
    return { avgRating, reviewCount };
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in calculateStaffAvgRating:', err);
    throw new Error('Failed to calculate staff average rating.');
  }
};

