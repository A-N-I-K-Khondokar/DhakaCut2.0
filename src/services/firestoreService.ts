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
  addDoc
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, Salon, Service, Staff, Booking, Review } from '../types';
import { generateId } from '../utils/helpers';

// Determine if we are in mock mode (i.e. no Firebase configuration provided, or default mock IDs)
const isMockMode = (() => {
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
    name: 'Dhaka Cut Prime',
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
    name: 'Dhaka Cut Premium',
    area: 'Gulshan',
    address: 'Building 12, Madani Avenue, Gulshan 2, Dhaka 1212',
    phone: '+880 1711 122244',
    lat: 23.7925,
    lng: 90.4150,
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600',
    rating: 4.8,
    description: 'Located in the heart of Gulshan, Dhaka Cut Premium delivers custom hairstyles, expert beard grooming, and facial therapies tailored for the modern gentleman.',
    operatingHours: { open: '10:00', close: '21:00' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'salon-3',
    name: 'Dhaka Cut Express',
    area: 'Dhanmondi',
    address: 'Sanmar Tower, Satmasjid Road, Dhanmondi, Dhaka 1209',
    phone: '+880 1711 122255',
    lat: 23.7461,
    lng: 90.3742,
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600',
    rating: 4.6,
    description: 'Fast, efficient, and affordable premium grooming. Perfect for busy professionals who need a quick refresh without compromising on style.',
    operatingHours: { open: '09:00', close: '19:00' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const MOCK_SERVICES: Service[] = [
  {
    id: 'service-1',
    name: 'Classic Haircut',
    description: 'Personalized haircut with premium shampoo, relaxing scalp massage, and precision styling.',
    price: 15.00,
    duration: 30,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-2',
    name: 'Royal Hot Towel Shave',
    description: 'Traditional straight razor shave with pre-shave oil, hot steaming towels, and soothing aftershave balm.',
    price: 10.00,
    duration: 25,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-3',
    name: 'Hair Color & Highlights',
    description: 'Premium organic ammonia-free hair coloring, root touch-up, or custom highlights by color specialists.',
    price: 35.00,
    duration: 60,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-4',
    name: 'Charcoal Deep Cleansing Facial',
    description: 'Exfoliating activated charcoal treatment to detoxify skin, clear pores, and refresh the face.',
    price: 20.00,
    duration: 45,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'service-5',
    name: 'Beard Trim & Detail',
    description: 'Beard shaping, line cleanups with clippers, and conditioning beard oils.',
    price: 8.00,
    duration: 20,
    createdAt: new Date().toISOString(),
  }
];

const MOCK_STAFF: Staff[] = [
  {
    id: 'staff-1',
    salonId: 'salon-1',
    name: 'Kabir Khan',
    phone: '01811223344',
    experience: 8,
    specialization: ['Classic Haircut', 'Hair Color & Highlights'],
    avgRating: 4.9,
    reviewCount: 42,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'staff-2',
    salonId: 'salon-1',
    name: 'Rafsan Ahmed',
    phone: '01811223345',
    experience: 5,
    specialization: ['Royal Hot Towel Shave', 'Beard Trim & Detail'],
    avgRating: 4.8,
    reviewCount: 28,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'staff-3',
    salonId: 'salon-2',
    name: 'Arifin Shuvo',
    phone: '01811223346',
    experience: 10,
    specialization: ['Classic Haircut', 'Hair Color & Highlights', 'Charcoal Deep Cleansing Facial'],
    avgRating: 4.9,
    reviewCount: 56,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'staff-4',
    salonId: 'salon-2',
    name: 'Imran Khan',
    phone: '01811223347',
    experience: 6,
    specialization: ['Royal Hot Towel Shave', 'Beard Trim & Detail'],
    avgRating: 4.7,
    reviewCount: 19,
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'staff-5',
    salonId: 'salon-3',
    name: 'Zayed Khan',
    phone: '01811223348',
    experience: 4,
    specialization: ['Classic Haircut', 'Beard Trim & Detail'],
    avgRating: 4.5,
    reviewCount: 12,
    image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
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
  if (!localStorage.getItem('dc_salons')) {
    localStorage.setItem('dc_salons', JSON.stringify(MOCK_SALONS));
  }
  if (!localStorage.getItem('dc_services')) {
    localStorage.setItem('dc_services', JSON.stringify(MOCK_SERVICES));
  }
  if (!localStorage.getItem('dc_staff')) {
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
    localStorage.setItem('dc_current_user', JSON.stringify(newUser));
    return newUser;
  } else {
    // Standard Firebase Auth Flow
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;
    
    // Update profile display name
    await updateProfile(fbUser, { displayName: name });
    
    const role = email.toLowerCase().includes('admin') ? 'admin' : 'customer';
    const newUser: User = {
      id: fbUser.uid,
      email,
      displayName: name,
      phone,
      role,
      createdAt: new Date().toISOString(),
    };

    // Save user details to firestore
    await setDoc(doc(db, 'users', fbUser.uid), newUser);
    localStorage.setItem('dc_current_user', JSON.stringify(newUser));
    return newUser;
  }
};

export const logIn = async (email: string, password: string): Promise<User> => {
  if (isMockMode) {
    const users = getLocalData<User>('dc_users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('User not found. Try signing up or check credentials.');
    
    // Mock simple password validation: matching length at least
    if (password.length < 6) throw new Error('Invalid credentials (password too short).');

    localStorage.setItem('dc_current_user', JSON.stringify(user));
    return user;
  } else {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;
    
    // Fetch profile details from firestore
    const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      localStorage.setItem('dc_current_user', JSON.stringify(userData));
      return userData;
    } else {
      // In case user exists in Auth but not inside Firestore users collection
      const fallbackUser: User = {
        id: fbUser.uid,
        email: fbUser.email || email,
        displayName: fbUser.displayName || 'Client',
        phone: '',
        role: (fbUser.email && fbUser.email.toLowerCase().includes('admin')) ? 'admin' : 'customer',
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', fbUser.uid), fallbackUser);
      localStorage.setItem('dc_current_user', JSON.stringify(fallbackUser));
      return fallbackUser;
    }
  }
};

export const logOut = async (): Promise<void> => {
  localStorage.removeItem('dc_current_user');
  if (!isMockMode) {
    await signOut(auth);
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  const localCached = localStorage.getItem('dc_current_user');
  if (localCached) {
    return JSON.parse(localCached);
  }
  
  if (isMockMode) return null;

  const fbUser = auth.currentUser;
  if (!fbUser) return null;

  try {
    const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
    if (userDoc.exists()) {
      const data = userDoc.data() as User;
      localStorage.setItem('dc_current_user', JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.error('Error fetching current user from Firestore: ', err);
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
  await sendPasswordResetEmail(auth, email);
};

export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
  if (isMockMode) {
    const users = getLocalData<User>('dc_users');
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found.');
    
    users[idx] = { ...users[idx], ...updates };
    setLocalData('dc_users', users);
    
    // Update local cache if updating current logged in user
    const cur = localStorage.getItem('dc_current_user');
    if (cur) {
      const parsed = JSON.parse(cur) as User;
      if (parsed.id === userId) {
        localStorage.setItem('dc_current_user', JSON.stringify(users[idx]));
      }
    }
    return;
  }
  await updateDoc(doc(db, 'users', userId), updates);
  
  const cur = localStorage.getItem('dc_current_user');
  if (cur) {
    const parsed = JSON.parse(cur) as User;
    if (parsed.id === userId) {
      localStorage.setItem('dc_current_user', JSON.stringify({ ...parsed, ...updates }));
    }
  }
};


// ==========================================
// SALON FUNCTIONS
// ==========================================

export const getAllSalons = async (): Promise<Salon[]> => {
  if (isMockMode) {
    return getLocalData<Salon>('dc_salons');
  }
  const querySnapshot = await getDocs(collection(db, 'salons'));
  const salons: Salon[] = [];
  querySnapshot.forEach((docSnap) => {
    salons.push({ id: docSnap.id, ...docSnap.data() } as Salon);
  });
  return salons;
};

export const getSalonById = async (id: string): Promise<Salon | null> => {
  if (isMockMode) {
    return getLocalData<Salon>('dc_salons').find(s => s.id === id) || null;
  }
  const docSnap = await getDoc(doc(db, 'salons', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Salon;
  }
  return null;
};

export const getSalonsByArea = async (area: string): Promise<Salon[]> => {
  if (isMockMode) {
    return getLocalData<Salon>('dc_salons').filter(s => s.area.toLowerCase() === area.toLowerCase());
  }
  const q = query(collection(db, 'salons'), where('area', '==', area));
  const querySnapshot = await getDocs(q);
  const salons: Salon[] = [];
  querySnapshot.forEach((docSnap) => {
    salons.push({ id: docSnap.id, ...docSnap.data() } as Salon);
  });
  return salons;
};

export const createSalon = async (data: Omit<Salon, 'id' | 'createdAt' | 'updatedAt' | 'rating'>): Promise<Salon> => {
  const newSalon: Salon = {
    ...data,
    id: isMockMode ? `salon-${generateId(8)}` : '',
    rating: 5.0, // Initial rating
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isMockMode) {
    const salons = getLocalData<Salon>('dc_salons');
    salons.push(newSalon);
    setLocalData('dc_salons', salons);
    return newSalon;
  } else {
    const docRef = await addDoc(collection(db, 'salons'), newSalon);
    newSalon.id = docRef.id;
    return newSalon;
  }
};

export const updateSalon = async (id: string, updates: Partial<Salon>): Promise<void> => {
  const updatedData = { ...updates, updatedAt: new Date().toISOString() };
  if (isMockMode) {
    const salons = getLocalData<Salon>('dc_salons');
    const idx = salons.findIndex(s => s.id === id);
    if (idx !== -1) {
      salons[idx] = { ...salons[idx], ...updatedData };
      setLocalData('dc_salons', salons);
    }
    return;
  }
  await updateDoc(doc(db, 'salons', id), updatedData);
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
  await deleteDoc(doc(db, 'salons', id));
};


// ==========================================
// SERVICE FUNCTIONS
// ==========================================

export const getAllServices = async (): Promise<Service[]> => {
  if (isMockMode) {
    return getLocalData<Service>('dc_services');
  }
  const querySnapshot = await getDocs(collection(db, 'services'));
  const services: Service[] = [];
  querySnapshot.forEach((docSnap) => {
    services.push({ id: docSnap.id, ...docSnap.data() } as Service);
  });
  return services;
};

export const getServiceById = async (id: string): Promise<Service | null> => {
  if (isMockMode) {
    return getLocalData<Service>('dc_services').find(s => s.id === id) || null;
  }
  const docSnap = await getDoc(doc(db, 'services', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Service;
  }
  return null;
};

export const createService = async (data: Omit<Service, 'id' | 'createdAt'>): Promise<Service> => {
  const newService: Service = {
    ...data,
    id: isMockMode ? `service-${generateId(8)}` : '',
    createdAt: new Date().toISOString(),
  };

  if (isMockMode) {
    const services = getLocalData<Service>('dc_services');
    services.push(newService);
    setLocalData('dc_services', services);
    return newService;
  } else {
    const docRef = await addDoc(collection(db, 'services'), newService);
    newService.id = docRef.id;
    return newService;
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
  await updateDoc(doc(db, 'services', id), updates);
};

export const deleteService = async (id: string): Promise<void> => {
  if (isMockMode) {
    const services = getLocalData<Service>('dc_services');
    const filtered = services.filter(s => s.id !== id);
    setLocalData('dc_services', filtered);
    return;
  }
  await deleteDoc(doc(db, 'services', id));
};


// ==========================================
// STAFF FUNCTIONS
// ==========================================

export const getStaffBySalon = async (salonId: string): Promise<Staff[]> => {
  if (isMockMode) {
    return getLocalData<Staff>('dc_staff').filter(st => st.salonId === salonId);
  }
  const q = query(collection(db, 'staff'), where('salonId', '==', salonId));
  const querySnapshot = await getDocs(q);
  const staff: Staff[] = [];
  querySnapshot.forEach((docSnap) => {
    staff.push({ id: docSnap.id, ...docSnap.data() } as Staff);
  });
  return staff;
};

export const getStaffById = async (id: string): Promise<Staff | null> => {
  if (isMockMode) {
    return getLocalData<Staff>('dc_staff').find(st => st.id === id) || null;
  }
  const docSnap = await getDoc(doc(db, 'staff', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Staff;
  }
  return null;
};

export const createStaff = async (data: Omit<Staff, 'id' | 'createdAt' | 'avgRating' | 'reviewCount'>): Promise<Staff> => {
  const newStaff: Staff = {
    ...data,
    id: isMockMode ? `staff-${generateId(8)}` : '',
    avgRating: 5.0,
    reviewCount: 0,
    createdAt: new Date().toISOString(),
  };

  if (isMockMode) {
    const staffList = getLocalData<Staff>('dc_staff');
    staffList.push(newStaff);
    setLocalData('dc_staff', staffList);
    return newStaff;
  } else {
    const docRef = await addDoc(collection(db, 'staff'), newStaff);
    newStaff.id = docRef.id;
    return newStaff;
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
  await updateDoc(doc(db, 'staff', id), updates);
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
  await deleteDoc(doc(db, 'staff', id));
};


// ==========================================
// BOOKING FLOW & DATES
// ==========================================

export const createBooking = async (data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Booking> => {
  const newBooking: Booking = {
    ...data,
    id: isMockMode ? `booking-${generateId(8)}` : '',
    status: 'confirmed', // Automatically confirm bookings for ease of use
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isMockMode) {
    const bookings = getLocalData<Booking>('dc_bookings');
    bookings.push(newBooking);
    setLocalData('dc_bookings', bookings);
    return newBooking;
  } else {
    const docRef = await addDoc(collection(db, 'bookings'), newBooking);
    newBooking.id = docRef.id;
    return newBooking;
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
  const q = query(
    collection(db, 'bookings'), 
    where('userId', '==', userId)
  );
  const querySnapshot = await getDocs(q);
  const bookings: Booking[] = [];
  querySnapshot.forEach((docSnap) => {
    bookings.push({ id: docSnap.id, ...docSnap.data() } as Booking);
  });
  return bookings.sort((a, b) => b.bookingDate.localeCompare(a.bookingDate) || b.bookingTime.localeCompare(a.bookingTime));
};

export const getAllBookings = async (): Promise<Booking[]> => {
  if (isMockMode) {
    return getLocalData<Booking>('dc_bookings')
      .sort((a, b) => b.bookingDate.localeCompare(a.bookingDate) || b.bookingTime.localeCompare(a.bookingTime));
  }
  const querySnapshot = await getDocs(collection(db, 'bookings'));
  const bookings: Booking[] = [];
  querySnapshot.forEach((docSnap) => {
    bookings.push({ id: docSnap.id, ...docSnap.data() } as Booking);
  });
  return bookings.sort((a, b) => b.bookingDate.localeCompare(a.bookingDate) || b.bookingTime.localeCompare(a.bookingTime));
};

export const updateBookingStatus = async (id: string, status: Booking['status']): Promise<void> => {
  const updatedData = { status, updatedAt: new Date().toISOString() };
  if (isMockMode) {
    const bookings = getLocalData<Booking>('dc_bookings');
    const idx = bookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      bookings[idx] = { ...bookings[idx], ...updatedData };
      setLocalData('dc_bookings', bookings);
    }
    return;
  }
  await updateDoc(doc(db, 'bookings', id), updatedData);
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
      const b = docSnap.data() as Booking;
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
};

export const isTimeSlotBooked = async (staffId: string, date: string, time: string): Promise<boolean> => {
  const available = await getAvailableTimeSlots(staffId, date);
  return !available.includes(time);
};


// ==========================================
// REVIEWS & RATINGS SYSTEM
// ==========================================

export const createReview = async (data: Omit<Review, 'id' | 'createdAt'>): Promise<Review> => {
  const newReview: Review = {
    ...data,
    id: isMockMode ? `review-${generateId(8)}` : '',
    createdAt: new Date().toISOString(),
  };

  if (isMockMode) {
    const reviews = getLocalData<Review>('dc_reviews');
    reviews.push(newReview);
    setLocalData('dc_reviews', reviews);
    
    // Re-calculate staff average rating & review count
    await calculateStaffAvgRating(data.staffId);
    return newReview;
  } else {
    const docRef = await addDoc(collection(db, 'reviews'), newReview);
    newReview.id = docRef.id;
    await calculateStaffAvgRating(data.staffId);
    return newReview;
  }
};

export const getReviewsByStaff = async (staffId: string): Promise<Review[]> => {
  if (isMockMode) {
    return getLocalData<Review>('dc_reviews')
      .filter(r => r.staffId === staffId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  const q = query(collection(db, 'reviews'), where('staffId', '==', staffId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  const reviews: Review[] = [];
  querySnapshot.forEach((docSnap) => {
    reviews.push({ id: docSnap.id, ...docSnap.data() } as Review);
  });
  return reviews;
};

export const getReviewsBySalon = async (salonId: string): Promise<Review[]> => {
  if (isMockMode) {
    return getLocalData<Review>('dc_reviews')
      .filter(r => r.salonId === salonId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  const q = query(collection(db, 'reviews'), where('salonId', '==', salonId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  const reviews: Review[] = [];
  querySnapshot.forEach((docSnap) => {
    reviews.push({ id: docSnap.id, ...docSnap.data() } as Review);
  });
  return reviews;
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
  
  const docSnap = await getDoc(doc(db, 'reviews', id));
  if (docSnap.exists()) {
    staffId = (docSnap.data() as Review).staffId;
    await deleteDoc(doc(db, 'reviews', id));
    await calculateStaffAvgRating(staffId);
  }
};

export const calculateStaffAvgRating = async (staffId: string): Promise<{ avgRating: number; reviewCount: number }> => {
  let staffReviews: Review[] = [];
  
  if (isMockMode) {
    staffReviews = getLocalData<Review>('dc_reviews').filter(r => r.staffId === staffId);
  } else {
    const q = query(collection(db, 'reviews'), where('staffId', '==', staffId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(docSnap => {
      staffReviews.push(docSnap.data() as Review);
    });
  }

  const reviewCount = staffReviews.length;
  const avgRating = reviewCount > 0 
    ? parseFloat((staffReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
    : 5.0;

  // Update staff document with new scores
  await updateStaff(staffId, { avgRating, reviewCount });
  
  return { avgRating, reviewCount };
};
