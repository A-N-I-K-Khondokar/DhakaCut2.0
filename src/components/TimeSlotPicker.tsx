import React from 'react';
import { cn } from '../utils/helpers';

interface TimeSlotPickerProps {
  availableSlots: string[];
  selectedSlot: string;
  onSelectSlot: (slot: string) => void;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  availableSlots,
  selectedSlot,
  onSelectSlot,
}) => {
  // All possible slots in the salon day
  const allSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', 
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', 
    '18:00', '18:30'
  ];

  const format12Hour = (time24: string): string => {
    const [hoursStr, minutesStr] = time24.split(':');
    const hours = parseInt(hoursStr);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutesStr} ${ampm}`;
  };

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Select Appointment Time</h4>
      
      {allSlots.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No slots available for this day.</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {allSlots.map((slot) => {
            const isAvailable = availableSlots.includes(slot);
            const isSelected = selectedSlot === slot;
            
            return (
              <button
                key={slot}
                type="button"
                disabled={!isAvailable}
                onClick={() => onSelectSlot(slot)}
                className={cn(
                  'py-2.5 px-2 border rounded text-xs font-semibold text-center transition-all focus:outline-none focus:ring-1 focus:ring-primary',
                  isAvailable 
                    ? isSelected 
                      ? 'border-primary bg-primary text-white ring-1 ring-primary' 
                      : 'border-gray-200 text-gray-800 bg-white hover:border-primary hover:text-primary'
                    : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                )}
              >
                {format12Hour(slot)}
              </button>
            );
          })}
        </div>
      )}
      
      <div className="flex gap-4 mt-4 text-xs font-medium text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-gray-200 bg-white block" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-primary bg-primary block" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-gray-100 bg-gray-50 block" />
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
};
