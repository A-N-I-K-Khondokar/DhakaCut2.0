import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, DollarSign, Users, Star, Scissors, MapPin, LayoutDashboard, ChevronRight, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getAllBookings, getAllSalons, getAllServices, getAllStaff } from '../services/firestoreService';
import { Booking, Service } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Card, CardBody } from '../components/Card';

export const AdminDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [salonsCount, setSalonsCount] = useState(0);
  const [servicesCount, setServicesCount] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
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
        const [allBookings, allSalons, allServices, allStaff] = await Promise.all([
          getAllBookings(),
          getAllSalons(),
          getAllServices(),
          getAllStaff(),
        ]);
        setBookings(allBookings);
        setSalonsCount(allSalons.length);
        setServicesCount(allServices.length);
        setServices(allServices);
        setStaff(allStaff);
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

  // Booking Popularity by Day of Week (Mon–Sun) from real bookings
  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const bookingsByDay = DAY_LABELS.map((_, i) =>
    bookings.filter(b => {
      if (!b.bookingDate) return false;
      const d = new Date(b.bookingDate);
      // getDay(): 0=Sun,1=Mon...6=Sat — map to Mon=0 index
      return (d.getDay() + 6) % 7 === i;
    }).length
  );
  const maxDayCount = Math.max(...bookingsByDay, 1);

  // Top 5 Services by booking count (real data)
  const serviceBookingCount: Record<string, number> = {};
  bookings.forEach(b => {
    if (b.serviceId) serviceBookingCount[b.serviceId] = (serviceBookingCount[b.serviceId] || 0) + 1;
  });
  const topServices = Object.entries(serviceBookingCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([serviceId, count]) => {
      const svc = services.find(s => s.id === serviceId);
      return { name: svc?.name || serviceId, count };
    });
  const maxServiceCount = Math.max(...topServices.map(s => s.count), 1);

  // Top 3 Rated Stylists from real staff data
  const topStaff = [...staff]
    .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
    .slice(0, 3);

  // Recent Bookings (top 5)
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);

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
              {/* Chart 1: Booking trends by day of week */}
              <Card>
                <CardBody className="p-5 space-y-4">
                  <h3 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-2">Booking Popularity by Day</h3>
                  {bookingsByDay.every(v => v === 0) ? (
                    <p className="text-xs text-gray-400 text-center py-8">No booking data yet.</p>
                  ) : (
                    <div className="h-64 flex items-end justify-between gap-1 pt-4 px-2">
                      {bookingsByDay.map((val, idx) => (
                        <div key={idx} className="flex flex-col items-center flex-1 group">
                          <div
                            className="w-full bg-primary hover:bg-primary-hover rounded-t transition-all relative"
                            style={{ height: `${(val / maxDayCount) * 160}px`, minHeight: val > 0 ? '4px' : '0' }}
                          >
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                              {val}
                            </span>
                          </div>
                          <span className="text-[9px] text-gray-400 font-semibold mt-1">{DAY_LABELS[idx]}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Chart 2: Top services by real booking count */}
              <Card>
                <CardBody className="p-5 space-y-4">
                  <h3 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-2">Top 5 Services by Bookings</h3>
                  {topServices.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-8">No booking data yet.</p>
                  ) : (
                    <div className="space-y-3.5 pt-2">
                      {topServices.map((serv, idx) => (
                        <div key={idx} className="space-y-1 text-xs">
                          <div className="flex justify-between font-semibold text-gray-700">
                            <span>{serv.name}</span>
                            <span>{serv.count} bookings</span>
                          </div>
                          <div className="w-full bg-gray-150 h-2 rounded overflow-hidden">
                            <div
                              className="bg-primary h-2 rounded"
                              style={{ width: `${(serv.count / maxServiceCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

              {/* Top Rated Stylists — real staff sorted by avgRating */}
              <div className="border border-gray-150 rounded-lg p-5 bg-white shadow-subtle space-y-4">
                <h3 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-2">Top Rated Stylists</h3>
                {topStaff.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No staff data yet.</p>
                ) : (
                  <div className="space-y-4">
                    {topStaff.map((st, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                          {st.image ? (
                            <img src={st.image} alt={st.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-gray-500">{st.name?.[0]}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-xs">
                          <p className="font-bold text-gray-900 truncate">{st.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{st.reviewCount || 0} reviews</p>
                        </div>
                        <div className="text-right flex items-center gap-0.5 text-xs font-bold text-gray-800">
                          <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                          <span>{(st.avgRating || 0).toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
