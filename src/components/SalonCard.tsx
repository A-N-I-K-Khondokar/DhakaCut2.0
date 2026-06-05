import React from 'react';
import { Star, MapPin, Phone, ArrowRight } from 'lucide-react';
import { Salon } from '../types';
import { Card, CardBody } from './Card';
import { Button } from './Button';

interface SalonCardProps {
  salon: Salon;
  onBookClick: (salon: Salon) => void;
  onViewDetailClick: (id: string) => void;
}

export const SalonCard: React.FC<SalonCardProps> = ({
  salon,
  onBookClick,
  onViewDetailClick,
}) => {
  const { id, name, area, address, image, rating, description } = salon;

  return (
    <Card className="flex flex-col h-full hover:-translate-y-1 transition-transform duration-350">
      {/* Salon Image */}
      <div className="relative h-48 overflow-hidden rounded-t bg-gray-100">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-bold text-gray-800">{rating.toFixed(1)}</span>
        </div>
        <div className="absolute bottom-2 left-2 bg-primary text-white text-xs font-semibold px-2 py-1 rounded">
          {area}
        </div>
      </div>

      {/* Salon Details */}
      <CardBody className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-1">{name}</h3>
          
          <div className="flex items-start gap-1 text-xs text-gray-500 mb-2">
            <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">{address}</span>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-3 mb-2">
            <span className="text-gray-500 font-medium">Services starting at</span>
            <span className="text-primary font-bold text-sm">৳150</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetailClick(id)}
              className="text-xs"
            >
              View Details
            </Button>
            <Button
              size="sm"
              onClick={() => onBookClick(salon)}
              className="text-xs flex items-center justify-center gap-1"
            >
              Book Now
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
