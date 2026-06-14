import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/Toast';
import { BookingModal } from './components/BookingModal';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { SalonListingPage } from './pages/SalonListingPage';
import { SalonDetailPage } from './pages/SalonDetailPage';
import { BookingPage } from './pages/BookingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminSalons } from './pages/AdminSalons';
import { AdminStaff } from './pages/AdminStaff';
import { AdminServices } from './pages/AdminServices';
import { AdminBookings } from './pages/AdminBookings';
import { MapSearchPage } from './pages/MapSearchPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Stylesheets
import './styles/globals.css';
import './styles/theme.css';
import './styles/animations.css';

// Layout wrapper for standard customer-facing pages (renders Header & Footer)
const CustomerLayout: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && <Navbar />}
      <div className="flex-grow">
        <Outlet />
      </div>
      {!isAuthPage && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <BookingProvider>
          <BrowserRouter>
            {/* Global UI Components */}
            <ToastContainer />
            <BookingModal />

            <Routes>
              {/* Customer Facing Pages */}
              <Route element={<CustomerLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/salons" element={<SalonListingPage />} />
                <Route path="/salons/:id" element={<SalonDetailPage />} />
                <Route path="/salon/:id" element={<SalonDetailPage />} />
                <Route path="/map" element={<MapSearchPage />} />
                <Route path="/map-search" element={<MapSearchPage />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
              </Route>

              {/* Admin Management Pages (Omit customer layouts) */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/salons" element={<AdminSalons />} />
              <Route path="/admin/staff" element={<AdminStaff />} />
              <Route path="/admin/services" element={<AdminServices />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />

              {/* Fallback Page */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </BookingProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
