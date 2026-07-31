export type UserRole = 'admin' | 'guide' | 'traveler';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  country?: string;
  city?: string;
  preferred_language?: string;
  bio?: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Guide extends User {
  role: 'guide';
  rating?: number;
  total_reviews?: number;
  languages?: string[];
  specialties?: string[];
  verified?: boolean;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  image_url?: string;
  featured: boolean;
  created_at: string;
}

export interface Tour {
  id: string;
  guide_id: string;
  destination_id: string;
  title: string;
  description: string;
  duration_hours: number;
  max_group_size: number;
  price_per_person: number;
  currency: string;
  language: string;
  meeting_point: string;
  included: string[];
  excluded: string[];
  images: string[];
  is_active: boolean;
  rating?: number;
  total_reviews?: number;
  created_at: string;
  updated_at: string;
  guide?: Guide;
  destination?: Destination;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  tour_id: string;
  traveler_id: string;
  guide_id: string;
  status: BookingStatus;
  travel_date: string;
  num_travelers: number;
  total_price: number;
  currency: string;
  special_requests?: string;
  created_at: string;
  updated_at: string;
  tour?: Tour;
  guide?: Guide;
}

export interface Review {
  id: string;
  booking_id: string;
  tour_id: string;
  traveler_id: string;
  rating: number;
  comment: string;
  created_at: string;
  traveler?: User;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
