import { useState, useMemo } from 'react';
import { Salon } from '../types';

// Private helper for distance calculation via Haversine formula
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return parseFloat(distance.toFixed(2));
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export const useNearbySearch = (salons: Salon[]) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (error) => {
        let msg = 'Failed to retrieve location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Location permission denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            msg = 'Location request timed out.';
            break;
        }
        setLocationError(msg);
        setIsLocating(false);
      }
    );
  };

  const nearbySalons = useMemo(() => {
    if (!userLocation) {
      return salons.map((s) => ({ ...s, distanceKm: 0 }));
    }

    return salons
      .map((s) => {
        const distance = haversineKm(userLocation.lat, userLocation.lng, s.lat, s.lng);
        return { ...s, distanceKm: distance };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [salons, userLocation]);

  return {
    userLocation,
    nearbySalons,
    isLocating,
    locationError,
    requestLocation,
  };
};
