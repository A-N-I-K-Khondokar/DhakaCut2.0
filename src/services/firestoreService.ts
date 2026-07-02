// DhakaCut 2.0 Firestore & LocalStorage Seeding Services
// Refactored & Code-Split into dedicated modules for maximum codebase maintainability.
// All exports are preserved to ensure 100% backwards compatibility.

export { 
  isMockMode, 
  emitBookingChange, 
  seedFirestoreData 
} from './firestore/core';

export { 
  signUp, 
  logIn, 
  signInWithGoogle, 
  logOut, 
  getCurrentUser, 
  resetPassword, 
  updateUserProfile 
} from './firestore/auth';

export { 
  getAllSalons, 
  getSalonById, 
  getSalonsByArea, 
  createSalon, 
  updateSalon, 
  deleteSalon 
} from './firestore/salons';

export { 
  getStaffBySalon,
  getAllStaff, 
  getStaffById, 
  createStaff, 
  updateStaff, 
  deleteStaff, 
  calculateStaffAvgRating 
} from './firestore/staff';

export { 
  getAllServices, 
  getServiceById, 
  createService, 
  updateService, 
  deleteService 
} from './firestore/services';

export { 
  createBooking, 
  getUserBookings, 
  getAllBookings, 
  updateBookingStatus, 
  cancelBooking, 
  getAvailableTimeSlots, 
  isTimeSlotBooked 
} from './firestore/bookings';

export { 
  createReview, 
  getReviewsByStaff, 
  getReviewsBySalon, 
  getReviewsByUser, 
  deleteReview 
} from './firestore/reviews';
