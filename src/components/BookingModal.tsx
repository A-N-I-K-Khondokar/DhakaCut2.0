import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, DollarSign, UserCheck, ShieldCheck, ArrowLeft, ArrowRight } from 'lucide-react';
import { BookingContext } from '../context/BookingContext';
import { useAuth } from '../hooks/useAuth';
import { useStaff } from '../hooks/useStaff';
import { useServices } from '../hooks/useServices';
import { useAvailableSlots, useCreateBooking } from '../hooks/useBooking';
import { useToast } from '../hooks/useToast';
import { Modal } from './Modal';
import { Button } from './Button';
import { StaffCard } from './StaffCard';
import { TimeSlotPicker } from './TimeSlotPicker';
import { formatCurrency, formatDuration, formatLongDate } from '../utils/formatters';
import { getUpcomingDates, formatDateKey } from '../utils/helpers';

export const BookingModal: React.FC = () => {
  const context = useContext(BookingContext);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate: makeBooking, loading: bookingLoading } = useCreateBooking();

  if (!context) {
    throw new Error('BookingModal must be used within a BookingProvider');
  }

  const {
    salon,
    staff,
    service,
    date,
    time,
    paymentMethod,
    step,
    isOpen,
    setStaff,
    setService,
    setDate,
    setTime,
    setPaymentMethod,
    setStep,
    closeBooking,
    resetBooking,
  } = context;

  // Fetch staff and services for the selected salon
  const { data: staffList, loading: staffLoading } = useStaff(salon?.id);
  const { data: servicesList, loading: servicesLoading } = useServices();
  const { data: availableSlots, loading: slotsLoading } = useAvailableSlots(staff?.id, date);

  // Reset booking state when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetBooking();
    }
  }, [isOpen, resetBooking]);

  if (!salon) return null;

  const handleNext = () => {
    if (step < 5) setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleConfirm = async () => {
    if (!user) {
      toast('Please sign in to complete your booking.', 'error');
      closeBooking();
      navigate('/login');
      return;
    }

    if (!staff || !service || !date || !time) {
      toast('Booking details are incomplete.', 'error');
      return;
    }

    try {
      await makeBooking({
        userId: user.id,
        salonId: salon.id,
        staffId: staff.id,
        serviceId: service.id,
        bookingDate: date,
        bookingTime: time,
        totalPrice: service.price,
      });

      toast('Appointment booked successfully!', 'success');
      closeBooking();
      navigate('/dashboard');
    } catch (err: any) {
      toast(err.message || 'Failed to book appointment', 'error');
    }
  };

  const upcomingDates = getUpcomingDates(14); // Next 14 days

  const isNextDisabled = () => {
    if (step === 1 && !staff) return true;
    if (step === 2 && !service) return true;
    if (step === 3 && !date) return true;
    if (step === 4 && !time) return true;
    return false;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeBooking}
      title={`Book at ${salon.name}`}
      size="lg"
    >
      {/* Step Indicators */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex flex-col items-center flex-1">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  s === step
                    ? 'bg-primary text-white ring-4 ring-primary-light'
                    : s < step
                    ? 'bg-success text-white'
                    : 'bg-gray-150 text-gray-400 border border-gray-200'
                }`}
              >
                {s}
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500 mt-1 font-semibold">
                {s === 1 && 'Stylist'}
                {s === 2 && 'Service'}
                {s === 3 && 'Date'}
                {s === 4 && 'Time'}
                {s === 5 && 'Confirm'}
              </span>
            </div>
          ))}
        </div>
        <div className="relative mt-2 h-1 bg-gray-100 rounded">
          <div
            className="absolute top-0 left-0 h-1 bg-primary rounded transition-all duration-300"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps Content */}
      <div className="min-h-[280px]">
        {/* STEP 1: SELECT STAFF */}
        {step === 1 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Choose a Hair Stylist / Barber</h4>
            {staffLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : staffList.length === 0 ? (
              <p className="text-sm text-gray-500 italic py-6 text-center">No stylists available at this branch.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {staffList.map((st) => (
                  <StaffCard
                    key={st.id}
                    staff={st}
                    isSelected={staff?.id === st.id}
                    onSelect={() => setStaff(st)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: SELECT SERVICE */}
        {step === 2 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Select Service</h4>
            {servicesLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {servicesList.map((se) => (
                  <div
                    key={se.id}
                    onClick={() => setService(se)}
                    className={`p-4 border rounded cursor-pointer transition-colors flex items-center justify-between ${
                      service?.id === se.id
                        ? 'border-primary bg-primary-light/10 ring-1 ring-primary'
                        : 'border-gray-200 hover:border-primary'
                    }`}
                  >
                    <div>
                      <h5 className="font-bold text-gray-900 text-sm sm:text-base">{se.name}</h5>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-[85%]">{se.description}</p>
                      <span className="text-xs text-gray-400 mt-1 block">Duration: {formatDuration(se.duration)}</span>
                    </div>
                    <span className="font-bold text-primary">{formatCurrency(se.price)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: PICK DATE */}
        {step === 3 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Select Appointment Date</h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 overflow-x-auto pb-2">
              {upcomingDates.map((d) => {
                const dateKey = formatDateKey(d);
                const isSelected = date === dateKey;
                const isToday = formatDateKey(new Date()) === dateKey;

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => setDate(dateKey)}
                    className={`py-3 px-2 border rounded flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 bg-white hover:border-primary hover:text-primary'
                    }`}
                  >
                    <span className={`text-[10px] uppercase font-bold ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                      {d.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="text-lg font-bold my-0.5">{d.getDate()}</span>
                    <span className={`text-[9px] font-semibold ${isSelected ? 'text-white/95' : 'text-gray-500'}`}>
                      {d.toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    {isToday && (
                      <span className={`text-[8px] px-1 py-0.5 rounded font-bold mt-1 ${isSelected ? 'bg-white text-primary' : 'bg-primary-light text-primary'}`}>
                        Today
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: PICK TIME */}
        {step === 4 && (
          <div>
            {slotsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <TimeSlotPicker
                availableSlots={availableSlots}
                selectedSlot={time}
                onSelectSlot={setTime}
              />
            )}
          </div>
        )}

        {/* STEP 5: CONFIRM */}
        {step === 5 && staff && service && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Confirm Appointment Summary</h4>
            <div className="bg-gray-55 rounded-lg border border-gray-150 p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Details */}
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-success" />
                    <span><strong>Salon:</strong> {salon.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-primary" />
                    <span><strong>Barber/Stylist:</strong> {staff.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span><strong>Date:</strong> {formatLongDate(date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span><strong>Time:</strong> {time} ({formatDuration(service.duration)})</span>
                  </div>
                </div>

                {/* Price card */}
                <div className="border border-gray-200 bg-white p-3 rounded flex flex-col justify-center items-center">
                  <span className="text-xs text-gray-400 font-medium">Total Price</span>
                  <span className="text-2xl font-black text-primary">{formatCurrency(service.price)}</span>
                  <span className="text-xs text-gray-500 mt-1">Pay at the salon</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Select Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded px-2.5 py-1.5 text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="cash">Pay with Cash at Salon (Recommended)</option>
                  <option value="bkash">bKash Mobile Wallet</option>
                  <option value="nagad">Nagad Mobile Wallet</option>
                  <option value="card">Credit / Debit Card</option>
                </select>
              </div>
            </div>

            {!user && (
              <div className="mt-4 p-3 bg-error-light/10 border border-error-light text-error text-xs rounded font-medium text-center">
                Please note: You must log in or sign up before you can confirm this booking.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Actions */}
      <div className="mt-6 flex justify-between border-t border-gray-150 pt-4">
        {step > 1 ? (
          <Button variant="outline" size="sm" onClick={handleBack} className="flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <Button
            size="sm"
            onClick={handleNext}
            disabled={isNextDisabled()}
            className="flex items-center gap-1.5"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleConfirm}
            isLoading={bookingLoading}
            disabled={!user && step === 5}
            className="bg-success hover:bg-success-hover text-white flex items-center gap-1.5"
          >
            Confirm Booking
          </Button>
        )}
      </div>
    </Modal>
  );
};
