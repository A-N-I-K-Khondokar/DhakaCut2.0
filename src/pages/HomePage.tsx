import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, Award, Clock, ShieldAlert, ArrowRight, Star, MapPin } from 'lucide-react';
import { getAllSalons } from '../services/firestoreService';
import { Salon } from '../types';
import { Button } from '../components/Button';
import { Card, CardBody } from '../components/Card';
import { formatCurrency } from '../utils/formatters';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const data = await getAllSalons();
        setSalons(data.slice(0, 3)); // Display first 3 salons
      } catch (err) {
        console.error('Failed to load salons for home page', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSalons();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white py-24 sm:py-32 overflow-hidden flex items-center justify-center">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-primary/20 z-10" />
        <img
          src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1200"
          alt="Barbershop interior"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none opacity-40 z-0"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center sm:text-left flex flex-col gap-6 max-w-3xl">
          <span className="text-xs bg-primary text-white font-bold tracking-widest uppercase px-3 py-1.5 rounded self-center sm:self-start w-fit">
            The Ultimate Male Grooming Experience
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Precision Grooming, <br />
            <span className="text-primary-light">Tailored For You.</span>
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed max-w-xl">
            Book top-tier haircuts, hot towel shaves, skin treatments, and hair styling across our exclusive salons in Dhaka.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center sm:justify-start">
            <Button size="lg" onClick={() => navigate('/salons')} className="flex items-center gap-2">
              Book Appointment
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="white" 
              onClick={() => navigate('/map-search')} 
            >
              📍 Find Salon Near Me
            </Button>
            <Button size="lg" variant="outline-theme" onClick={() => navigate('/signup')}>
              Join DhakaCut
            </Button>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-16 sm:py-24 bg-gray-50 border-y border-gray-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">Why Choose DhakaCut?</h2>
            <p className="text-gray-500 mt-2 text-sm sm:text-base leading-relaxed">
              We combine traditional techniques with modern technology to deliver premium service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-white border border-gray-100 rounded shadow-subtle">
              <div className="h-12 w-12 rounded bg-primary-light/40 flex items-center justify-center text-primary mb-4">
                <Scissors className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Expert Stylists</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Our barbers and stylists are industry veterans trained in classic grooming and modern cuts.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white border border-gray-100 rounded shadow-subtle">
              <div className="h-12 w-12 rounded bg-primary-light/40 flex items-center justify-center text-primary mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Premium Products</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                We use organic skin serums, professional hair clays, and sanitizers of premium imported brands.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white border border-gray-100 rounded shadow-subtle">
              <div className="h-12 w-12 rounded bg-primary-light/40 flex items-center justify-center text-primary mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Instant Scheduling</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Select your preferred branch, stylist, service, and exact 30-min slot with zero wait times.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Branches */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">Our Premium Locations</h2>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">
                Discover the closest DhakaCut branches and book instantly.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/salons')} className="flex items-center gap-1.5">
              Explore All Salons
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 w-full bg-gray-50 animate-pulse rounded border border-gray-200" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {salons.map((salon) => (
                <Card key={salon.id} className="flex flex-col h-full hover:-translate-y-1 transition-transform">
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={salon.image}
                      alt={salon.name}
                      className="w-full h-full object-cover rounded-t"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-bold text-gray-800">{salon.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <CardBody className="flex-1 flex flex-col justify-between p-5">
                    <div>
                      <span className="text-xs font-bold text-primary tracking-wider uppercase mb-1 block">
                        {salon.area}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{salon.name}</h3>
                      <div className="flex items-start gap-1 text-xs text-gray-500 mb-4">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>{salon.address}</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full text-xs font-semibold"
                      onClick={() => navigate(`/salons/${salon.id}`)}
                    >
                      View Salon details
                    </Button>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-16 sm:py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Ready for a Premium Haircut?</h2>
          <p className="text-lg text-primary-light max-w-lg leading-relaxed">
            Reserve your appointment with your favorite barber in just 60 seconds. Pay at the salon.
          </p>
          <Button
            size="lg"
            variant="white"
            className="text-base font-semibold transition-all hover:scale-[1.02] shadow-md"
            onClick={() => navigate('/salons')}
          >
            Find a Salon & Book Now
          </Button>
        </div>
      </section>
    </div>
  );
};
