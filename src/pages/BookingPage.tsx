import React, { useEffect, useContext, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, AlertCircle } from 'lucide-react';
import { BookingContext } from '../context/BookingContext';
import { getSalonById, getAllSalons } from '../services/firestoreService';
import { Salon } from '../types';
import { Button } from '../components/Button';
import { Card, CardBody } from '../components/Card';

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingCtx = useContext(BookingContext);
  
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const urlSalonId = searchParams.get('salonId');

  useEffect(() => {
    const initBooking = async () => {
      setLoading(true);
      try {
        if (urlSalonId && bookingCtx) {
          const targetSalon = await getSalonById(urlSalonId);
          if (targetSalon) {
            bookingCtx.openBooking(targetSalon);
            navigate('/salons', { replace: true }); // Clear search param by redirecting to list
            return;
          }
        }
        
        // Otherwise load all salons to display selector
        const data = await getAllSalons();
        setSalons(data);
      } catch (err: any) {
        setError(err.message || 'Failed to initialize booking');
      } finally {
        setLoading(false);
      }
    };
    
    initBooking();
  }, [urlSalonId, bookingCtx, navigate]);

  const handleStartBooking = (salon: Salon) => {
    if (bookingCtx) {
      bookingCtx.openBooking(salon);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen bg-white">
      <div className="text-center max-w-xl mx-auto mb-10 flex flex-col items-center gap-2">
        <Calendar className="h-12 w-12 text-primary bg-primary-light/40 rounded-full p-2 mb-2" />
        <h1 className="text-3xl font-extrabold text-gray-900">Schedule an Appointment</h1>
        <p className="text-sm text-gray-500">
          Select a DhakaCut salon branch to begin choosing your stylist and service slot.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="p-4 bg-error-light/20 border border-error text-error rounded-lg flex items-center gap-2 max-w-md mx-auto">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {salons.map((salon) => (
            <Card key={salon.id} className="flex flex-col h-full hover:border-primary transition-all">
              <div className="h-40 bg-gray-100">
                <img
                  src={salon.image}
                  alt={salon.name}
                  className="w-full h-full object-cover rounded-t"
                  loading="lazy"
                />
              </div>
              <CardBody className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-primary uppercase">{salon.area}</span>
                  <h3 className="font-bold text-gray-900 mt-0.5">{salon.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{salon.address}</p>
                </div>
                <Button onClick={() => handleStartBooking(salon)} className="w-full text-xs font-semibold">
                  Start Booking
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
