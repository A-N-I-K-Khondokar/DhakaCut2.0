import React from 'react';
import { Star, Award } from 'lucide-react';
import { Staff } from '../types';
import { Card, CardBody } from './Card';

interface StaffCardProps {
  staff: Staff;
  onSelect?: () => void;
  isSelected?: boolean;
}

export const StaffCard: React.FC<StaffCardProps> = ({
  staff,
  onSelect,
  isSelected = false,
}) => {
  const { name, experience, specialization, avgRating, reviewCount, image } = staff;

  return (
    <Card 
      onClick={onSelect}
      className={`h-full flex items-center p-4 gap-4 transition-all ${
        onSelect ? 'cursor-pointer hover:border-primary' : ''
      } ${isSelected ? 'border-primary ring-2 ring-primary-light bg-primary-light/10' : ''}`}
    >
      <div className="h-16 w-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
        <img 
          src={image} 
          alt={name} 
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-900 truncate text-sm sm:text-base">{name}</h4>
        
        <div className="flex items-center gap-2 text-xs text-gray-500 my-1">
          <span className="flex items-center gap-0.5 font-semibold text-gray-700">
            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
            {avgRating.toFixed(1)}
          </span>
          <span>({reviewCount} reviews)</span>
          <span className="text-gray-300">•</span>
          <span className="flex items-center gap-0.5">
            <Award className="h-3.5 w-3.5 text-primary" />
            {experience} yrs exp
          </span>
        </div>

        {/* Specialization Badges */}
        <div className="flex flex-wrap gap-1 mt-1">
          {specialization.map((spec, i) => (
            <span 
              key={i} 
              className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium truncate max-w-[100px]"
            >
              {spec}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
};
