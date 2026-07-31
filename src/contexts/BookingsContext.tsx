import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface Booking {
  id: string;
  traveler_id: string;
  guide_id: string; // The ID of the listing or guide
  tour_name: string;
  traveler_name: string;
  booking_date: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  amount: number;
  currency: string;
  notes?: string;
  totalGuests?: number;
  created_at: string;
}

interface BookingsContextType {
  bookings: Booking[];
  createBooking: (booking: Omit<Booking, 'id' | 'created_at' | 'status'>) => void;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  getBookingsForTraveler: (travelerId: string) => Booking[];
  getBookingsForGuide: (guideId: string) => Booking[];
}

const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('routebyroot_bookings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse bookings:', e);
      }
    }
    return [
      {
        id: 'mock-b-1',
        traveler_id: 'mock-traveler-1',
        guide_id: 'L-default-1',
        tour_name: 'Tokyo Night Exploration',
        traveler_name: 'Mock Traveler',
        booking_date: '2026-08-15',
        status: 'accepted',
        amount: 1450,
        currency: 'JPY',
        created_at: new Date().toISOString()
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('routebyroot_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const createBooking = (bookingData: Omit<Booking, 'id' | 'created_at' | 'status'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: `booking-${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    setBookings(prev => [...prev, newBooking]);
  };

  const updateBookingStatus = (id: string, status: Booking['status']) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const getBookingsForTraveler = (travelerId: string) => bookings.filter(b => b.traveler_id === travelerId);
  
  const getBookingsForGuide = (guideId: string) => bookings.filter(b => b.guide_id === guideId);

  return (
    <BookingsContext.Provider value={{ bookings, createBooking, updateBookingStatus, getBookingsForTraveler, getBookingsForGuide }}>
      {children}
    </BookingsContext.Provider>
  );
}

export function useBookings() {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error('useBookings must be used within BookingsProvider');
  return ctx;
}
