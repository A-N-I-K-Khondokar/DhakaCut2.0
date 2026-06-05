import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, DollarSign, UserCheck, ShieldAlert, Award, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useBookings, useCancelBooking } from '../hooks/useBooking';
import { updateBookingStatus, getSalonById, getStaffById, getServiceById, isMockMode } from '../services/firestoreService';
import { useToast } from '../hooks/useToast';
import { Card, CardBody, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Booking, Salon, Staff, Service } from '../types';
import { formatCurrency, formatDuration, formatLongDate, formatDate } from '../utils/formatters';
import { getUpcomingDates, formatDateKey } from '../utils/helpers';
import { TimeSlotPicker } from '../components/TimeSlotPicker';
import { getAvailableTimeSlots } from '../services/firestoreService';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Queries
  const { data: bookings, loading, error, refetch } = useBookings(user?.id);
  const { mutate: cancelBookingItem, loading: cancelLoading } = useCancelBooking();

  // Tabs
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Modal states
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  
  // Reschedule states
  const [rescheduleBookingItem, setRescheduleBookingItem] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTime, setRescheduleTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState<boolean>(false);

  // Hydrated details cache
  const [hydratedDetails, setHydratedDetails] = useState<Record<string, { salon: Salon | null; staff: Staff | null; service: Service | null }>>({});

  // Protect route
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=dashboard');
    }
  }, [user, navigate]);

  // Load hydrated data (salon, staff, service details) for bookings
  useEffect(() => {
    const hydrateData = async () => {
      const cache = { ...hydratedDetails };
      let changed = false;

      for (const booking of bookings) {
        const cacheKey = `${booking.salonId}-${booking.staffId}-${booking.serviceId}`;
        if (!cache[cacheKey]) {
          try {
            const [salon, staff, service] = await Promise.all([
              getSalonById(booking.salonId),
              getStaffById(booking.staffId),
              getServiceById(booking.serviceId)
            ]);
            cache[cacheKey] = { salon, staff, service };
            changed = true;
          } catch (err) {
            console.error('Failed to hydrate booking details', err);
          }
        }
      }

      if (changed) {
        setHydratedDetails(cache);
      }
    };

    if (bookings.length > 0) {
      hydrateData();
    }
  }, [bookings]);

  // Load slots when reschedule settings change
  useEffect(() => {
    const loadSlots = async () => {
      if (rescheduleBookingItem && rescheduleDate) {
        setSlotsLoading(true);
        try {
          const slots = await getAvailableTimeSlots(rescheduleBookingItem.staffId, rescheduleDate);
          setAvailableSlots(slots);
        } catch (err) {
          console.error(err);
        } finally {
          setSlotsLoading(false);
        }
      }
    };
    loadSlots();
  }, [rescheduleBookingItem, rescheduleDate]);

  const handleCancelClick = (id: string) => {
    setCancelBookingId(id);
  };

  const handleConfirmCancel = async () => {
    if (!cancelBookingId) return;
    try {
      await cancelBookingItem(cancelBookingId);
      toast('Appointment cancelled successfully.', 'success');
      setCancelBookingId(null);
      refetch();
    } catch (err: any) {
      toast(err.message || 'Failed to cancel appointment.', 'error');
    }
  };

  const handleRescheduleClick = (booking: Booking) => {
    setRescheduleBookingItem(booking);
    setRescheduleDate(booking.bookingDate);
    setRescheduleTime(booking.bookingTime);
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleBookingItem || !rescheduleDate || !rescheduleTime) {
      toast('Please select a date and time.', 'error');
      return;
    }

    try {
      // Direct update mock logic or Firebase logic
      if (isMockMode) {
        const localBookings = localStorage.getItem('dc_bookings');
        if (localBookings) {
          const parsed = JSON.parse(localBookings) as Booking[];
          const idx = parsed.findIndex(b => b.id === rescheduleBookingItem.id);
          if (idx !== -1) {
            parsed[idx].bookingDate = rescheduleDate;
            parsed[idx].bookingTime = rescheduleTime;
            parsed[idx].updatedAt = new Date().toISOString();
            localStorage.setItem('dc_bookings', JSON.stringify(parsed));
          }
        }
      } else {
        // Dynamic update call
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../services/firebase');
        await updateDoc(doc(db, 'bookings', rescheduleBookingItem.id), {
          bookingDate: rescheduleDate,
          bookingTime: rescheduleTime,
          updatedAt: new Date().toISOString(),
        });
      }

      toast('Appointment rescheduled successfully!', 'success');
      setRescheduleBookingItem(null);
      refetch();
    } catch (err: any) {
      toast(err.message || 'Failed to reschedule appointment.', 'error');
    }
  };

  const upcomingDates = getUpcomingDates(14);

  // Filter bookings
  const upcomingBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  const getHydratedData = (booking: Booking) => {
    const key = `${booking.salonId}-${booking.staffId}-${booking.serviceId}`;
    return hydratedDetails[key] || { salon: null, staff: null, service: null };
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-white">
      <div className="flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-150 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Client Panel</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage and review your reservation appointments.</p>
          </div>
          <Button size="sm" onClick={() => navigate('/salons')}>
            Book New
          </Button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-gray-150 gap-4">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
              activeTab === 'upcoming'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
              activeTab === 'past'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Past & Cancelled ({pastBookings.length})
          </button>
        </div>

        {/* Grid List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <div className="p-4 bg-error-light/20 border border-error text-error rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : (activeTab === 'upcoming' ? upcomingBookings : pastBookings).length === 0 ? (
          <div className="text-center py-16 bg-gray-50 border border-gray-150 rounded-lg">
            <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 font-medium">No appointments found in this tab.</p>
            {activeTab === 'upcoming' && (
              <Button size="sm" className="mt-3 text-xs" onClick={() => navigate('/salons')}>
                Make a Booking Now
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).map((booking) => {
              const { salon, staff, service } = getHydratedData(booking);
              const statusStyles = {
                pending: 'bg-yellow-100 text-yellow-800 border-yellow-250',
                confirmed: 'bg-green-100 text-green-800 border-green-250',
                completed: 'bg-gray-100 text-gray-800 border-gray-250',
                cancelled: 'bg-red-100 text-red-800 border-red-250',
              };

              return (
                <Card key={booking.id} className="flex flex-col hover:-translate-y-0.5 transition-transform">
                  <CardHeader className="flex justify-between items-center py-3">
                    <span className="text-xs font-bold text-gray-550 truncate max-w-[150px]">
                      {salon?.name || 'Loading Salon...'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusStyles[booking.status]}`}>
                      {booking.status}
                    </span>
                  </CardHeader>
                  <CardBody className="p-4 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        <span><strong>Service:</strong> {service?.name || 'Loading...'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-gray-500" />
                        <span><strong>Barber:</strong> {staff?.name || 'Loading...'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span><strong>Date:</strong> {formatLongDate(booking.bookingDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span><strong>Time:</strong> {booking.bookingTime}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                      <span className="text-xs text-gray-400 font-medium">Price paid</span>
                      <span className="font-bold text-gray-900 text-base">{formatCurrency(booking.totalPrice)}</span>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-1.5 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDetailBooking(booking)}
                        className="text-[11px] px-1 font-semibold"
                      >
                        Details
                      </Button>
                      
                      {activeTab === 'upcoming' && booking.status !== 'cancelled' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRescheduleClick(booking)}
                            className="text-[11px] px-1 font-semibold text-primary border-primary/30 hover:bg-primary-light/20"
                          >
                            Reschedule
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelClick(booking.id)}
                            className="text-[11px] px-1 font-semibold text-error border-error/30 hover:bg-error-light/20"
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}

        {/* DETAILS MODAL */}
        <Modal
          isOpen={!!detailBooking}
          onClose={() => setDetailBooking(null)}
          title="Appointment details"
          size="sm"
        >
          {detailBooking && (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-150 p-4 rounded-lg space-y-3.5 text-sm text-gray-700">
                <div>
                  <span className="text-xs text-gray-400 font-medium block">Salon Branch</span>
                  <span className="font-bold text-gray-900">{getHydratedData(detailBooking).salon?.name}</span>
                  <p className="text-xs text-gray-500">{getHydratedData(detailBooking).salon?.address}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-medium block">Service Reserved</span>
                  <span className="font-bold text-gray-900">{getHydratedData(detailBooking).service?.name}</span>
                  <span className="text-xs text-gray-500 block">Duration: {getHydratedData(detailBooking).service ? formatDuration(getHydratedData(detailBooking).service!.duration) : ''}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-medium block">Stylist / Barber</span>
                  <span className="font-bold text-gray-900">{getHydratedData(detailBooking).staff?.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-400 font-medium block">Appointment Date</span>
                    <span className="font-bold text-gray-900">{formatDate(detailBooking.bookingDate)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-medium block">Reserved Time</span>
                    <span className="font-bold text-gray-900">{detailBooking.bookingTime}</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-gray-400 font-medium block">Total Price</span>
                    <span className="text-lg font-black text-primary">{formatCurrency(detailBooking.totalPrice)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-medium block">Status</span>
                    <span className="text-xs font-bold text-gray-750 uppercase">{detailBooking.status}</span>
                  </div>
                </div>
              </div>
              <Button size="sm" onClick={() => setDetailBooking(null)} className="w-full">
                Close Details
              </Button>
            </div>
          )}
        </Modal>

        {/* CANCELLATION DIALOG */}
        <Modal
          isOpen={!!cancelBookingId}
          onClose={() => setCancelBookingId(null)}
          title="Cancel Appointment?"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-error-light/10 border border-error text-error rounded-lg">
              <ShieldAlert className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Warning</h4>
                <p className="text-xs leading-relaxed mt-0.5">
                  Are you sure you want to cancel this appointment? This action cannot be undone and your slot will be made available to other clients.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end border-t border-gray-150 pt-4">
              <Button variant="outline" size="sm" onClick={() => setCancelBookingId(null)}>
                Keep Appointment
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmCancel}
                isLoading={cancelLoading}
              >
                Cancel Appointment
              </Button>
            </div>
          </div>
        </Modal>

        {/* RESCHEDULE MODAL */}
        <Modal
          isOpen={!!rescheduleBookingItem}
          onClose={() => setRescheduleBookingItem(null)}
          title="Reschedule Appointment"
          size="lg"
        >
          {rescheduleBookingItem && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="p-3 bg-gray-50 border border-gray-150 rounded text-sm text-gray-750">
                <p>Rescheduling: <strong>{getHydratedData(rescheduleBookingItem).service?.name}</strong> with <strong>{getHydratedData(rescheduleBookingItem).staff?.name}</strong></p>
                <p className="text-xs text-gray-400 mt-1">Current: {formatDate(rescheduleBookingItem.bookingDate)} at {rescheduleBookingItem.bookingTime}</p>
              </div>

              {/* Day Grid Picker */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-650 block">Select New Date</label>
                <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-100">
                  {upcomingDates.map((d) => {
                    const dateKey = formatDateKey(d);
                    const isSelected = rescheduleDate === dateKey;
                    return (
                      <button
                        key={dateKey}
                        type="button"
                        onClick={() => { setRescheduleDate(dateKey); setRescheduleTime(''); }}
                        className={`py-2.5 px-3 border rounded text-xs flex flex-col items-center flex-shrink-0 transition-all ${
                          isSelected 
                            ? 'border-primary bg-primary text-white' 
                            : 'border-gray-200 bg-white hover:border-primary text-gray-700'
                        }`}
                      >
                        <span className="font-semibold text-[9px] uppercase opacity-75">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="text-base font-bold">{d.getDate()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots grid */}
              <div>
                {slotsLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                ) : (
                  <TimeSlotPicker
                    availableSlots={availableSlots}
                    selectedSlot={rescheduleTime}
                    onSelectSlot={setRescheduleTime}
                  />
                )}
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 border-t border-gray-150 pt-4">
                <Button variant="outline" size="sm" onClick={() => setRescheduleBookingItem(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmReschedule}
                  disabled={!rescheduleDate || !rescheduleTime || (rescheduleDate === rescheduleBookingItem.bookingDate && rescheduleTime === rescheduleBookingItem.bookingTime)}
                  className="bg-primary text-white"
                >
                  Reschedule Appointment
                </Button>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </div>
  );
};
