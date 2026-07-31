-- RouteByRoot Database Schema
-- Run this in Supabase SQL Editor

-- ============ TYPES ============
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'guide', 'traveler');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name                TEXT NOT NULL DEFAULT 'User',
  email               TEXT NOT NULL UNIQUE,
  role                user_role NOT NULL DEFAULT 'traveler',
  avatar_url          TEXT,
  country             TEXT NOT NULL DEFAULT 'Global',
  preferred_language  TEXT NOT NULL DEFAULT 'English',
  bio                 TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
CREATE POLICY "System can insert profiles"
  ON public.profiles FOR INSERT WITH CHECK (true);

-- ============ DESTINATIONS ============
CREATE TABLE IF NOT EXISTS public.destinations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  country     TEXT NOT NULL,
  description TEXT,
  image_url   TEXT,
  featured    BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view destinations" ON public.destinations;
CREATE POLICY "Anyone can view destinations"
  ON public.destinations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage destinations" ON public.destinations;
CREATE POLICY "Admins manage destinations"
  ON public.destinations FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============ TOURS ============
CREATE TABLE IF NOT EXISTS public.tours (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  destination_id  UUID REFERENCES public.destinations(id),
  title           TEXT NOT NULL,
  description     TEXT,
  duration_hours  INTEGER NOT NULL DEFAULT 4,
  max_group_size  INTEGER NOT NULL DEFAULT 10,
  price_per_person DECIMAL(10,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'USD',
  language        TEXT NOT NULL DEFAULT 'English',
  meeting_point   TEXT,
  included        TEXT[] DEFAULT '{}',
  excluded        TEXT[] DEFAULT '{}',
  images          TEXT[] DEFAULT '{}',
  is_active       BOOLEAN DEFAULT true,
  rating          DECIMAL(3,2),
  total_reviews   INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active tours" ON public.tours;
CREATE POLICY "Anyone can view active tours"
  ON public.tours FOR SELECT USING (is_active = true OR guide_id = auth.uid());
DROP POLICY IF EXISTS "Guides manage own tours" ON public.tours;
CREATE POLICY "Guides manage own tours"
  ON public.tours FOR ALL USING (guide_id = auth.uid());

-- ============ BOOKINGS ============
CREATE TABLE IF NOT EXISTS public.bookings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id          UUID REFERENCES public.tours(id),
  traveler_id      UUID REFERENCES public.profiles(id),
  guide_id         UUID REFERENCES public.profiles(id),
  status           booking_status NOT NULL DEFAULT 'pending',
  travel_date      DATE NOT NULL,
  num_travelers    INTEGER NOT NULL DEFAULT 1,
  total_price      DECIMAL(10,2) NOT NULL,
  currency         TEXT NOT NULL DEFAULT 'USD',
  special_requests TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Travelers view own bookings" ON public.bookings;
CREATE POLICY "Travelers view own bookings"
  ON public.bookings FOR SELECT USING (
    traveler_id = auth.uid() OR guide_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
DROP POLICY IF EXISTS "Travelers create bookings" ON public.bookings;
CREATE POLICY "Travelers create bookings"
  ON public.bookings FOR INSERT WITH CHECK (traveler_id = auth.uid());
DROP POLICY IF EXISTS "Update own bookings" ON public.bookings;
CREATE POLICY "Update own bookings"
  ON public.bookings FOR UPDATE USING (
    traveler_id = auth.uid() OR guide_id = auth.uid()
  );

-- ============ REVIEWS ============
CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID REFERENCES public.bookings(id),
  tour_id     UUID REFERENCES public.tours(id),
  traveler_id UUID REFERENCES public.profiles(id),
  rating      INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Travelers create reviews" ON public.reviews;
CREATE POLICY "Travelers create reviews"
  ON public.reviews FOR INSERT WITH CHECK (traveler_id = auth.uid());

-- ============ TRIGGER: AUTO-CREATE PROFILE ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_val public.user_role;
BEGIN
  BEGIN
    user_role_val := COALESCE(new.raw_user_meta_data->>'role', 'traveler')::public.user_role;
  EXCEPTION WHEN OTHERS THEN
    user_role_val := 'traveler'::public.user_role;
  END;

  INSERT INTO public.profiles (id, name, email, role, country, preferred_language, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'User'),
    new.email,
    user_role_val,
    COALESCE(new.raw_user_meta_data->>'country', 'Global'),
    COALESCE(new.raw_user_meta_data->>'preferred_language', 'English'),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ SEED: SAMPLE DESTINATIONS ============
INSERT INTO public.destinations (name, country, description, featured) VALUES
  ('Bali',       'Indonesia', 'Island of the Gods with stunning temples and rice terraces', true),
  ('Paris',      'France',    'The City of Light, romance, and world-class cuisine', true),
  ('Tokyo',      'Japan',     'A perfect blend of ancient tradition and cutting-edge modernity', true),
  ('Rajasthan',  'India',     'Land of kings with majestic forts and vibrant culture', true),
  ('Santorini',  'Greece',    'Iconic white-washed buildings and breathtaking sunsets', true),
  ('Marrakech',  'Morocco',   'A sensory journey through ancient medinas and souks', true)
ON CONFLICT DO NOTHING;
