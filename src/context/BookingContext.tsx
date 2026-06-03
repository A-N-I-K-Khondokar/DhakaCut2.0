import React, { createContext, useState, ReactNode } from 'react';
import { Salon, Staff, Service } from '../types';

interface BookingContextType {
  salon: Salon | null;
  staff: Staff | null;
  service: Service | null;
  date: string;
  time: string;
  paymentMethod: string;
  step: number;
  isOpen: boolean;
  setSalon: (salon: Salon | null) => void;
  setStaff: (staff: Staff | null) => void;
  setService: (service: Service | null) => void;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setPaymentMethod: (method: string) => void;
  setStep: (step: number | ((prev: number) => number)) => void;
  openBooking: (salon: Salon) => void;
  closeBooking: () => void;
  resetBooking: () => void;
}

export const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [step, setStep] = useState<number>(1);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openBooking = (targetSalon: Salon) => {
    setSalon(targetSalon);
    setStep(1);
    setIsOpen(true);
  };

  const closeBooking = () => {
    setIsOpen(false);
  };

  const resetBooking = () => {
    setStaff(null);
    setService(null);
    setDate('');
    setTime('');
    setPaymentMethod('cash');
    setStep(1);
  };

  const updateStep = (nextStep: number | ((prev: number) => number)) => {
    if (typeof nextStep === 'function') {
      setStep(nextStep);
    } else {
      setStep(nextStep);
    }
  };

  return (
    <BookingContext.Provider
      value={{
        salon,
        staff,
        service,
        date,
        time,
        paymentMethod,
        step,
        isOpen,
        setSalon,
        setStaff,
        setService,
        setDate,
        setTime,
        setPaymentMethod,
        setStep: updateStep,
        openBooking,
        closeBooking,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
