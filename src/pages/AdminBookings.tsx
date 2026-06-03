import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Scissors, LayoutDashboard, AlertCircle, Eye } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { 
  getAllBookings, 
  getAllSalons, 
  getStaffById, 
  getServiceById, 
  getSalonById,
  updateBookingStatus 
} from '../services/firestoreService';
import { Booking, Salon, Staff, Service, User } from '../types';
import { AdminTable, TableColumn } from '../components/AdminTable';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { formatCurrency, formatDuration, formatDate } from '../utils/formatters';

export const AdminBookings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);

  // Detailed Modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Cached hydrations
  const [hydratedDetails, setHydratedDetails] = useState<Record<string, { salon: Salon | null; staff: Staff | null; service: Service | null }>>({});

  // Security check
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsData, salonsData] = await Promise.all([
        getAllBookings(),
        getAllSalons()
      ]);
      setBookings(bookingsData);
      setSalons(salonsData);

      // Hydrate all booking relations
      const cache: Record<string, { salon: Salon | null; staff: Staff | null; service: Service | null }> = {};
      for (const booking of bookingsData) {
        const cacheKey = `${booking.salonId}-${booking.staffId}-${booking.serviceId}`;
        if (!cache[cacheKey]) {
          const [salon, staff, service] = await Promise.all([
            getSalonById(booking.salonId),
            getStaffById(booking.staffId),
            getServiceById(booking.serviceId)
          ]);
          cache[cacheKey] = { salon, staff, service };
        }
      }
      setHydratedDetails(cache);

      // In mock mode, load the user database so we can resolve emails
      const isMockMode = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_PROJECT_ID === 'dhakacut-mock';
      if (isMockMode) {
        const mockUsers = localStorage.getItem('dc_users');
        if (mockUsers) setUsersList(JSON.parse(mockUsers));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Bookings
  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(b => b.status === statusFilter));
    }
  }, [bookings, statusFilter]);

  const handleStatusChange = async (id: string, newStatus: Booking['status']) => {
    try {
      await updateBookingStatus(id, newStatus);
      toast('Booking status updated successfully.', 'success');
      
      // Update local state
      setBookings(prev => 
        prev.map(b => b.id === id ? { ...b, status: newStatus, updatedAt: new Date().toISOString() } : b)
      );
    } catch (err: any) {
      toast(err.message || 'Failed to update booking status.', 'error');
    }
  };

  const getClientEmail = (booking: Booking) => {
    const matched = usersList.find(u => u.id === booking.userId);
    return matched ? matched.email : 'client@dhacut.com'; // Fallback
  };

  const getHydratedData = (booking: Booking) => {
    const key = `${booking.salonId}-${booking.staffId}-${booking.serviceId}`;
    return hydratedDetails[key] || { salon: null, staff: null, service: null };
  };

  const columns: TableColumn<Booking>[] = [
    {
      header: 'Booking ID',
      render: (item) => <span className="font-bold text-gray-900">{item.id.substring(8)}</span>
    },
    {
      header: 'Client Email',
      render: (item) => getClientEmail(item)
    },
    {
      header: 'Branch Location',
      render: (item) => getHydratedData(item).salon?.name || 'Loading Branch...'
    },
    {
      header: 'Stylist / Barber',
      render: (item) => getHydratedData(item).staff?.name || 'Loading Staff...'
    },
    {
      header: 'Date & Time',
      render: (item) => `${item.bookingDate} at ${item.bookingTime}`
    },
    {
      header: 'Status',
      render: (item) => (
        <select
          value={item.status}
          onChange={(e) => handleStatusChange(item.id, e.target.value as Booking['status'])}
          className={`text-xs font-semibold px-2 py-1 rounded border bg-white focus:outline-none focus:ring-1 focus:ring-primary ${
            item.status === 'confirmed' 
              ? 'text-green-800 border-green-300' 
              : item.status === 'cancelled' 
              ? 'text-red-800 border-red-300' 
              : item.status === 'pending'
              ? 'text-yellow-800 border-yellow-300'
              : 'text-gray-800 border-gray-300'
          }`}
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      )
    },
    {
      header: 'Actions',
      render: (item) => (
        <button
          onClick={() => setSelectedBooking(item)}
          className="p-1 hover:bg-gray-150 rounded text-primary transition-colors flex items-center gap-1 text-xs font-semibold border border-primary/20"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </button>
      )
    }
  ];

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar navigation */}
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
            className="flex items-center gap-3 px-4 py-2.5 rounded hover:bg-gray-800 hover:text-white font-medium text-sm transition-colors"
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
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
            className="flex items-center gap-3 px-4 py-2.5 rounded bg-primary text-white font-semibold text-sm transition-colors"
          >
            <Calendar className="h-4.5 w-4.5 text-white" />
            <span>Manage Bookings</span>
          </Link>
        </nav>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-4 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Client Bookings Queue</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Approve, cancel, or mark booking slots as completed.</p>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2.5 py-1.5 text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-36"
            >
              <option value="All">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <AdminTable
          columns={columns}
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          loading={loading}
          emptyMessage="No reservations registered."
        />

        {/* DETAILED VIEW MODAL */}
        <Modal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title="Reservation Ticket Details"
          size="sm"
        >
          {selectedBooking && (
            <div className="space-y-4 text-sm text-gray-700">
              <div className="bg-gray-50 border border-gray-150 rounded-lg p-4 space-y-3">
                <div>
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Booking Identifier</span>
                  <span className="font-bold text-gray-950">{selectedBooking.id}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Client Details</span>
                  <span className="font-semibold text-gray-900">{getClientEmail(selectedBooking)}</span>
                  <span className="text-xs text-gray-500 block">ID: {selectedBooking.userId}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Branch Location</span>
                  <span className="font-semibold text-gray-900">{getHydratedData(selectedBooking).salon?.name}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Stylist / Barber</span>
                  <span className="font-semibold text-gray-900">{getHydratedData(selectedBooking).staff?.name}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Reserved Service</span>
                  <span className="font-semibold text-gray-900">{getHydratedData(selectedBooking).service?.name}</span>
                  <span className="text-xs text-gray-500 block">
                    Duration: {getHydratedData(selectedBooking).service ? formatDuration(getHydratedData(selectedBooking).service!.duration) : ''}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-2.5">
                  <div>
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Appointment Slot</span>
                    <span className="font-bold text-gray-900">{formatDate(selectedBooking.bookingDate)}</span>
                    <span className="text-xs text-gray-500 block">Time: {selectedBooking.bookingTime}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Total Price</span>
                    <span className="text-lg font-black text-primary">{formatCurrency(selectedBooking.totalPrice)}</span>
                  </div>
                </div>
              </div>
              
              <Button size="sm" onClick={() => setSelectedBooking(null)} className="w-full">
                Dismiss Ticket
              </Button>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
};
