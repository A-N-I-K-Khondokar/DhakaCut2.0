import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Star, AlertCircle } from 'lucide-react';
import { useSalons } from '../hooks/useSalons';
import { BookingContext } from '../context/BookingContext';
import { SalonCard } from '../components/SalonCard';
import { Button } from '../components/Button';
import { Salon } from '../types';

export const SalonListingPage: React.FC = () => {
  const { data: salons, loading, error } = useSalons();
  const bookingCtx = useContext(BookingContext);
  const navigate = useNavigate();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('All');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState('rating'); // 'rating' | 'name' | 'area'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [filteredSalons, setFilteredSalons] = useState<Salon[]>([]);

  // Collect all unique areas for the filter dropdown
  const areas = ['All', ...new Set(salons.map((s) => s.area))];

  useEffect(() => {
    let result = [...salons];

    // Filter by name
    if (searchQuery.trim() !== '') {
      result = result.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by area
    if (selectedArea !== 'All') {
      result = result.filter((s) => s.area === selectedArea);
    }

    // Filter by rating
    if (minRating > 0) {
      result = result.filter((s) => s.rating >= minRating);
    }

    // Sort
    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'area') {
      result.sort((a, b) => a.area.localeCompare(b.area));
    }

    setFilteredSalons(result);
    setCurrentPage(1); // Reset page on filter
  }, [salons, searchQuery, selectedArea, minRating, sortBy]);

  // Pagination helper
  const totalPages = Math.ceil(filteredSalons.length / itemsPerPage);
  const paginatedSalons = filteredSalons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleBookNow = (salon: Salon) => {
    if (bookingCtx) {
      bookingCtx.openBooking(salon);
    }
  };

  const handleViewDetails = (id: string) => {
    navigate(`/salons/${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-white">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Our Salons</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Browse and schedule with Dhaka's top hair and beard specialists.
          </p>
        </div>

        {/* Query Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 border border-gray-150 rounded-lg p-5 bg-gray-50 self-start">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-250 pb-2">
              <SlidersHorizontal className="h-4.5 w-4.5 text-gray-600" />
              <h3 className="font-bold text-gray-800 text-sm sm:text-base">Filters</h3>
            </div>

            <div className="space-y-4">
              {/* Area select */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Select Area</label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2.5 py-1.5 text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">Minimum Rating</label>
                <div className="flex flex-col gap-1">
                  {[
                    { label: 'Any Rating', value: 0 },
                    { label: '4.5+ ★ Superior', value: 4.5 },
                    { label: '4.8+ ★ Executive', value: 4.8 },
                  ].map((rate) => (
                    <label key={rate.value} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="radio"
                        name="rating-filter"
                        checked={minRating === rate.value}
                        onChange={() => setMinRating(rate.value)}
                        className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                      />
                      <span>{rate.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort selector */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2.5 py-1.5 text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="rating">Average Rating (High to Low)</option>
                  <option value="name">Name (Alphabetical)</option>
                  <option value="area">Area Location</option>
                </select>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedArea('All');
                  setMinRating(0);
                  setSortBy('rating');
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search salons by branch name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-350 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary text-sm shadow-subtle"
              />
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
              </div>
            ) : error ? (
              <div className="p-4 bg-error-light/20 border border-error text-error rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ) : paginatedSalons.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 border border-gray-150 rounded-lg">
                <p className="text-gray-500 font-medium">No salons match your search criteria.</p>
                <p className="text-sm text-gray-400 mt-1">Try resetting the filters or typing a different name.</p>
              </div>
            ) : (
              <>
                {/* Salons Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedSalons.map((salon) => (
                    <SalonCard
                      key={salon.id}
                      salon={salon}
                      onBookClick={handleBookNow}
                      onViewDetailClick={handleViewDetails}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-sm font-semibold text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
