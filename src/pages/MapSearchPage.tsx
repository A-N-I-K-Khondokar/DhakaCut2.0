import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalons } from '../hooks/useSalons';
import { useNearbySearch } from '../hooks/useNearbySearch';
import SalonMapView from '../components/SalonMapView';
import { Search, MapPin, Loader2, Star, Calendar } from 'lucide-react';
import { Button } from '../components/Button';
import { formatCurrency } from '../utils/formatters';

export const MapSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSalonId, setSelectedSalonId] = useState<string | undefined>(undefined);

  // Fetch salons list
  const { data: salons, loading: salonsLoading, error: salonsError } = useSalons();

  // Initialize nearby search hook
  const {
    userLocation,
    nearbySalons,
    isLocating,
    locationError,
    requestLocation,
  } = useNearbySearch(salons);

  // Filter salons by search term in area
  const filteredSalons = useMemo(() => {
    return nearbySalons.filter((salon) =>
      salon.area.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [nearbySalons, searchTerm]);

  const handleSalonSelect = (salon: any) => {
    navigate(`/salon/${salon.id}`);
  };

  const handleBookNow = (salonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/salon/${salonId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Page Header */}
      <header className="bg-white border-b border-gray-150 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center md:text-left">
          <h1 className="text-2xl sm:text-3.5xl font-black text-gray-900 tracking-tight">
            Find a DhakaCut Near You
          </h1>
          <p className="text-sm text-gray-500 mt-1 sm:mt-2">
            Search by area or use your live location to find the closest premium salon branch.
          </p>
        </div>
      </header>

      {/* Main Grid View */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-grow flex flex-col md:flex-row gap-6">
        {/* Left Side: Search Panel & Salon Listings */}
        <section className="w-full md:w-96 flex flex-col gap-4 flex-shrink-0">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by area (e.g. Banani, Gulshan...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {/* Geolocation Trigger Button */}
            <Button
              type="button"
              onClick={requestLocation}
              isLoading={isLocating}
              className="w-full flex items-center justify-center gap-2"
              variant={userLocation ? 'outline' : 'primary'}
            >
              {isLocating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4.5 w-4.5" />
              )}
              <span>{userLocation ? 'Update Live Location' : 'Use My Location'}</span>
            </Button>

            {/* Geolocation Status Info */}
            {userLocation && (
              <p className="text-xs text-success font-semibold text-center mt-1 animate-fade-in">
                Showing salons near you, sorted by distance
              </p>
            )}

            {/* Geolocation Errors */}
            {locationError && (
              <div className="p-3 bg-error/10 border border-error/20 text-error text-xs rounded-lg flex items-start gap-2 animate-fade-in">
                <span className="font-bold">⚠️ Error:</span>
                <span>{locationError}</span>
              </div>
            )}
          </div>

          {/* Salon Cards List */}
          <div className="flex-grow md:max-h-[calc(100vh-270px)] overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {salonsLoading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : salonsError ? (
              <div className="p-4 bg-error/10 border border-error text-error text-sm rounded-lg text-center font-medium">
                {salonsError}
              </div>
            ) : filteredSalons.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm px-4">
                <p className="text-sm text-gray-500 italic">No salon branches found in this area.</p>
              </div>
            ) : (
              filteredSalons.map((salon) => {
                const isSelected = salon.id === selectedSalonId;
                return (
                  <div
                    key={salon.id}
                    onClick={() => setSelectedSalonId(salon.id)}
                    className={`p-3.5 bg-white border rounded-xl flex gap-3.5 cursor-pointer transition-all shadow-sm ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary-light/50 bg-primary-light/5 scale-[1.01]'
                        : 'border-gray-200 hover:border-primary-light/80 hover:bg-gray-50/50'
                    }`}
                  >
                    {/* Thumbnail Image */}
                    <div className="h-16 w-16 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                      <img
                        src={salon.image}
                        alt={salon.name}
                        className="h-full w-full object-cover select-none pointer-events-none"
                      />
                    </div>

                    {/* Details Info */}
                    <div className="flex-grow flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="font-bold text-gray-900 text-sm truncate leading-tight">
                            {salon.name}
                          </h3>
                          {/* Distance Badge */}
                          {userLocation && salon.distanceKm > 0 && (
                            <span className="text-[10px] bg-primary text-white font-extrabold px-1.5 py-0.5 rounded-full flex-shrink-0">
                              {salon.distanceKm} km
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{salon.address}</p>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-2">
                        {/* Rating & Area */}
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-yellow-550 font-bold flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-550" />
                            {salon.rating.toFixed(1)}
                          </span>
                          <span className="text-gray-300">|</span>
                          <span className="text-gray-650 font-medium truncate max-w-[80px]">
                            {salon.area}
                          </span>
                        </div>

                        {/* Book Now trigger */}
                        <button
                          type="button"
                          onClick={(e) => handleBookNow(salon.id, e)}
                          className="px-3 py-1 bg-primary hover:bg-primary-hover text-white text-[11px] font-extrabold rounded-lg shadow-sm flex items-center gap-1 transition-all"
                        >
                          <Calendar className="h-3 w-3" />
                          <span>Book Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right Side: Map Viewer */}
        <section className="flex-grow min-h-[350px] md:h-auto rounded-xl overflow-hidden border border-gray-200 shadow-sm relative">
          <SalonMapView
            salons={filteredSalons}
            selectedSalonId={selectedSalonId}
            onSalonSelect={handleSalonSelect}
            userLocation={userLocation || undefined}
            height="100%"
          />
        </section>
      </main>
    </div>
  );
};

export default MapSearchPage;
