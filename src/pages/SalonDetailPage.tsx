import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Phone, Clock, Users, Scissors, MessageSquare, AlertCircle, Calendar } from 'lucide-react';
import { useSalon } from '../hooks/useSalons';
import { useStaff } from '../hooks/useStaff';
import { useServices } from '../hooks/useServices';
import { useReviews } from '../hooks/useReviews';
import { useBookings } from '../hooks/useBooking';
import { useAuth } from '../hooks/useAuth';
import { BookingContext } from '../context/BookingContext';
import { StaffCard } from '../components/StaffCard';
import { ReviewForm } from '../components/ReviewForm';
import { Button } from '../components/Button';
import { formatCurrency, formatDuration, formatDate } from '../utils/formatters';

export const SalonDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openBooking } = useContext(BookingContext) || {};
  
  // Data queries
  const { data: salon, loading: salonLoading, error: salonError } = useSalon(id);
  const { data: staffList, loading: staffLoading } = useStaff(id);
  const { data: servicesList, loading: servicesLoading } = useServices();
  const salonServices = servicesList.filter((s) => s.salonId === id);
  const { data: reviews, loading: reviewsLoading, refetch: refetchReviews } = useReviews(undefined, id);
  const { data: userBookings } = useBookings(user?.id);

  // Tabs: 'staff' | 'services' | 'reviews'
  const [activeTab, setActiveTab] = useState<'staff' | 'services' | 'reviews'>('staff');
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Check if user has past bookings at this salon
  const hasPastBooking = userBookings.some(
    (b) => b.salonId === id && (b.status === 'completed' || b.status === 'confirmed')
  );

  if (salonLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (salonError || !salon) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="p-4 bg-error-light/20 border border-error text-error rounded-lg flex items-center gap-2 max-w-md mx-auto">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{salonError || 'Salon not found.'}</span>
        </div>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/salons')}>
          Back to Salons
        </Button>
      </div>
    );
  }

  const handleBookNow = () => {
    if (openBooking) {
      openBooking(salon);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <div className="relative h-64 sm:h-96 w-full bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
        <img
          src={salon.image}
          alt={salon.name}
          className="w-full h-full object-cover select-none pointer-events-none opacity-80"
        />
        
        {/* Salon Details Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20 text-white p-4 sm:p-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs bg-primary text-white font-bold tracking-wider uppercase px-2 py-1 rounded">
                {salon.area}
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{salon.name}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-300">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-primary-light" />
                  {salon.address}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4 text-primary-light" />
                  {salon.phone}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded border border-white/20 flex flex-col items-center">
                <span className="text-xs text-gray-350">Rating</span>
                <span className="text-xl sm:text-2xl font-black text-white flex items-center gap-1 mt-0.5">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  {salon.rating.toFixed(1)}
                </span>
              </div>
              <Button size="lg" onClick={handleBookNow} className="shadow-lg h-fit">
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Branch Description & Tabs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-gray-900">About the branch</h2>
              <p className="text-sm sm:text-base text-gray-650 leading-relaxed">
                {salon.description}
              </p>
            </div>

            {/* Tabs Selector */}
            <div className="border-b border-gray-150 flex gap-2">
              <button
                onClick={() => setActiveTab('staff')}
                className={`flex items-center gap-1.5 pb-3 font-semibold text-sm transition-colors border-b-2 ${
                  activeTab === 'staff'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Users className="h-4 w-4" />
                Stylists & Barbers
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`flex items-center gap-1.5 pb-3 font-semibold text-sm transition-colors border-b-2 ${
                  activeTab === 'services'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Scissors className="h-4 w-4" />
                Services Offered
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex items-center gap-1.5 pb-3 font-semibold text-sm transition-colors border-b-2 ${
                  activeTab === 'reviews'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                Reviews ({reviews.length})
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div>
              {/* STAFF TAB */}
              {activeTab === 'staff' && (
                <div>
                  {staffLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  ) : staffList.length === 0 ? (
                    <p className="text-sm text-gray-500 italic py-6">No stylists currently listed at this branch.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {staffList.map((staff) => (
                        <StaffCard key={staff.id} staff={staff} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SERVICES TAB */}
              {activeTab === 'services' && (
                <div>
                  {servicesLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  ) : salonServices.length === 0 ? (
                    <p className="text-sm text-gray-500 italic py-6">No services currently offered.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {salonServices.map((service) => (
                        <div
                          key={service.id}
                          className="p-4 border border-gray-150 rounded flex justify-between items-center bg-gray-50/50 hover:bg-gray-50 transition-colors"
                        >
                          <div>
                            <h4 className="font-bold text-gray-900">{service.name}</h4>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-[85%]">
                              {service.description}
                            </p>
                            <span className="text-[11px] text-gray-400 mt-1 block">
                              Duration: {formatDuration(service.duration)}
                            </span>
                          </div>
                          <span className="font-bold text-primary text-base sm:text-lg">
                            {formatCurrency(service.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* REVIEWS TAB */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Summary & Review Form Button */}
                  <div className="flex justify-between items-center p-4 bg-gray-55 border border-gray-150 rounded-lg">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">Average Rating</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <span className="text-xl font-bold text-gray-900">{salon.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-400">({reviews.length} reviews)</span>
                      </div>
                    </div>

                    {user && hasPastBooking && (
                      <Button
                        size="sm"
                        onClick={() => setShowReviewForm(!showReviewForm)}
                      >
                        {showReviewForm ? 'Cancel Review' : 'Leave a Review'}
                      </Button>
                    )}
                  </div>

                  {/* Review Form */}
                  {showReviewForm && staffList.length > 0 && (
                    <div className="animate-fade-in">
                      <ReviewForm
                        salonId={salon.id}
                        staffId={staffList[0].id} // Default to first staff member
                        onSuccess={() => {
                          setShowReviewForm(false);
                          refetchReviews();
                        }}
                      />
                    </div>
                  )}

                  {/* Reviews List */}
                  {reviewsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  ) : reviews.length === 0 ? (
                    <p className="text-sm text-gray-500 italic py-6 text-center">No reviews submitted yet. Be the first to review!</p>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="p-4 border border-gray-100 rounded-lg bg-white space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-bold text-gray-900 text-sm">{rev.userName}</h5>
                              <div className="flex items-center gap-0.5 mt-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3.5 w-3.5 ${
                                      star <= rev.rating
                                        ? 'text-yellow-500 fill-yellow-500'
                                        : 'text-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium">
                              {formatDate(rev.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-660 leading-relaxed italic">
                            "{rev.comment}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Branch Info & Schedule */}
          <div className="space-y-6">
            <div className="border border-gray-150 rounded-lg p-5 bg-gray-50 space-y-4">
              <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2">Salon Info</h3>
              
              <ul className="space-y-3.5 text-sm text-gray-700">
                <li className="flex gap-2">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-800">Address</span>
                    <p className="text-xs text-gray-500 mt-0.5">{salon.address}</p>
                  </div>
                </li>
                
                <li className="flex gap-2">
                  <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-800">Phone</span>
                    <p className="text-xs text-gray-500 mt-0.5">{salon.phone}</p>
                  </div>
                </li>

                <li className="flex gap-2">
                  <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-800">Operating Hours</span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Saturday - Friday: {salon.operatingHours.open} - {salon.operatingHours.close}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            
            {/* Quick Booking Promo Card */}
            <div className="border border-primary-light bg-primary-light/5 rounded-lg p-5 flex flex-col justify-center items-center text-center gap-4">
              <Calendar className="h-10 w-10 text-primary" />
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Need a Fresh Cut?</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-[200px]">
                  Confirm a 30-min slot in seconds. Pay at the shop.
                </p>
              </div>
              <Button size="sm" onClick={handleBookNow} className="w-full">
                Book Appointment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
