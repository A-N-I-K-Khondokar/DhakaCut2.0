import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, DollarSign, Users, Star, Scissors, MapPin, LayoutDashboard, Settings, UserCheck, ChevronRight, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getAllBookings, getAllSalons, getAllServices } from '../services/firestoreService';
import { Booking, Salon, Service } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Card, CardBody } from '../components/Card';

export const AdminDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [salonsCount, setSalonsCount] = useState(0);
  const [servicesCount, setServicesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Security guard
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        toast('Access Denied. Admins only.', 'error');
        navigate('/');
      }
    }
  }, [user, authLoading, navigate, toast]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [allBookings, allSalons, allServices] = await Promise.all([
          getAllBookings(),
          getAllSalons(),
          getAllServices()
        ]);
        setBookings(allBookings);
        setSalonsCount(allSalons.length);
        setServicesCount(allServices.length);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  // Calculate Metrics
  const totalRevenue = bookings.filter(b => b.status === 'completed' || b.status === 'confirmed').reduce((sum, b) => sum + b.totalPrice, 0);
  const totalBookingsCount = bookings.length;
  const activeBookingsCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
  
  // Calculate average rating from salons
  const avgRating = 4.8; // Demo fallback average rating

  // Recent Bookings (top 5)
  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-gray-900 text-gray-400 flex flex-col border-r border-gray-800 flex-shrink-0">
        <div className="p-6 border-b border-gray-800">
          <Link to="/admin" className="flex items-center gap-2 text-white font-bold text-lg">
            <Scissors className="h-5 w-5 text-primary rotate-90" />
            <span>DhakaCut Admin</span>
          </Link>
          <span className="text-[10px] text-primary-light font-medium tracking-wider uppercase mt-1 block">Management Suite</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/admin"
            className="flex items-center gap-3 px-4 py-2.5 rounded bg-primary text-white font-semibold text-sm transition-colors"
          >
            <LayoutDashboard className="h-4.5 w-4.5 text-white" />
            <span>Analytics Home</span>
          </Link>
          <Link
            to="/admin/salons"
            className="flex items-center gap-3 px-4 py-2.5 rounded hover:bg-gray-800 hover:text-white font-medium text-sm transition-colors"
          >
            <MapPin className="h-4.5 w-4.5" />
            <span>Manage Salons</span>
          </Link>
          <Link
            to="/admin/staff"
            className="flex items-center gap-3 px-4 py-2.5 rounded hover:bg-gray-800 hover:text-white font-medium text-sm transition-colors"
          >
            <Users className="h-4.5 w-4.5" />
            <span>Manage Staff</span>
          </Link>
          <Link
            to="/admin/services"
            className="flex items-center gap-3 px-4 py-2.5 rounded hover:bg-gray-800 hover:text-white font-medium text-sm transition-colors"
          >
            <Scissors className="h-4.5 w-4.5" />
            <span>Manage Services</span>
          </Link>
          <Link
            to="/admin/bookings"
            className="flex items-center gap-3 px-4 py-2.5 rounded hover:bg-gray-800 hover:text-white font-medium text-sm transition-colors"
          >
            <Calendar className="h-4.5 w-4.5" />
            <span>Manage Bookings</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Analytics Dashboard</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Real-time revenue, booking trends, and rankings overview.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {/* Metrics cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Card>
                <CardBody className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Total Revenue</span>
                    <span className="text-xl md:text-2xl font-black text-gray-900">{formatCurrency(totalRevenue)}</span>
                  </div>
                  <div className="h-10 w-10 bg-green-50 text-green-600 rounded flex items-center justify-center">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Total Bookings</span>
                    <span className="text-xl md:text-2xl font-black text-gray-900">{totalBookingsCount}</span>
                  </div>
                  <div className="h-10 w-10 bg-primary-light/40 text-primary rounded flex items-center justify-center">
                    <Calendar className="h-5 w-5" />
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Active Slots</span>
                    <span className="text-xl md:text-2xl font-black text-gray-900">{activeBookingsCount}</span>
                  </div>
                  <div className="h-10 w-10 bg-yellow-50 text-yellow-600 rounded flex items-center justify-center">
                    <Clock className="h-5 w-5" />
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Salons / Services</span>
                    <span className="text-xl md:text-2xl font-black text-gray-900">{salonsCount} / {servicesCount}</span>
                  </div>
                  <div className="h-10 w-10 bg-gray-100 text-gray-600 rounded flex items-center justify-center">
                    <Scissors className="h-5 w-5" />
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Booking trends */}
              <Card>
                <CardBody className="p-5 space-y-4">
                  <h3 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-2">Booking Popularity by Day</h3>
                  <div className="h-64 flex items-end justify-between gap-1 pt-4 px-2">
                    {/* SVG/Vanilla CSS Bar chart representation */}
                    {[12, 18, 15, 24, 30, 20, 25, 28, 35, 42, 38, 48].map((val, idx) => (
                      <div key={idx} className="flex flex-col items-center flex-1 group">
                        <div 
                          className="w-full bg-primary hover:bg-primary-hover rounded-t transition-all relative"
                          style={{ height: `${(val / 50) * 160}px` }}
                        >
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                            {val}
                          </span>
                        </div>
                        <span className="text-[9px] text-gray-400 font-semibold mt-1">D{idx+1}</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Chart 2: Top services */}
              <Card>
                <CardBody className="p-5 space-y-4">
                  <h3 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-2">Top 5 Services by Sales</h3>
                  <div className="space-y-3.5 pt-2">
                    {[
                      { name: 'Classic Haircut', count: 120, percent: '80%' },
                      { name: 'Royal Hot Towel Shave', count: 90, percent: '60%' },
                      { name: 'Hair Color & Highlights', count: 45, percent: '30%' },
                      { name: 'Charcoal Deep Cleansing Facial', count: 30, percent: '20%' },
                      { name: 'Beard Trim & Detail', count: 20, percent: '15%' }
                    ].map((serv, idx) => (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between font-semibold text-gray-700">
                          <span>{serv.name}</span>
                          <span>{serv.count} bookings</span>
                        </div>
                        <div className="w-full bg-gray-150 h-2 rounded overflow-hidden">
                          <div className="bg-primary h-2 rounded" style={{ width: serv.percent }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Recent Bookings and quick stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Bookings List */}
              <div className="lg:col-span-2 border border-gray-150 rounded-lg p-5 bg-white shadow-subtle space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h3 className="font-bold text-gray-800 text-sm">Recent Bookings Queue</h3>
                  <Link to="/admin/bookings" className="text-xs text-primary font-bold hover:underline flex items-center">
                    Manage All
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {recentBookings.map((b) => (
                    <div key={b.id} className="py-3 flex justify-between items-center text-xs sm:text-sm">
                      <div className="space-y-0.5">
                        <p className="font-bold text-gray-800">Booking ID: {b.id.substring(8)}</p>
                        <p className="text-xs text-gray-400">Date: {b.bookingDate} at {b.bookingTime}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-750 block">{formatCurrency(b.totalPrice)}</span>
                        <span className="text-[10px] text-success font-semibold tracking-wider uppercase mt-0.5 block">{b.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Staff Rankings */}
              <div className="border border-gray-150 rounded-lg p-5 bg-white shadow-subtle space-y-4">
                <h3 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-2">Top Rated Stylists</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Arifin Shuvo', rating: 4.9, count: 56, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100' },
                    { name: 'Kabir Khan', rating: 4.9, count: 42, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100' },
                    { name: 'Rafsan Ahmed', rating: 4.8, count: 28, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100' }
                  ].map((st, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full overflow-hidden border border-gray-200">
                        <img src={st.image} alt={st.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 text-xs">
                        <p className="font-bold text-gray-900 truncate">{st.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{st.count} appointments</p>
                      </div>
                      <div className="text-right flex items-center gap-0.5 text-xs font-bold text-gray-800">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        <span>{st.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
