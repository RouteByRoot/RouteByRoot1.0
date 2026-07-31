/**
 * supabaseSync.ts
 * 
 * Write-through cache layer between localStorage and Supabase.
 * - Writes go to BOTH localStorage (instant) and Supabase (async/durable).
 * - Reads hydrate from Supabase on app mount, falling back to localStorage.
 */

import { supabase } from './supabase';

// ─── Generic Helpers ────────────────────────────────────────────

/** Upsert a single row into a Supabase table */
export async function upsertRow(table: string, row: Record<string, any>) {
  try {
    const { error } = await supabase.from(table).upsert(row, { onConflict: 'id' });
    if (error) console.warn(`[supabaseSync] upsert ${table} error:`, error.message);
  } catch (e) {
    console.warn(`[supabaseSync] upsert ${table} failed:`, e);
  }
}

/** Upsert an array of rows into a Supabase table */
export async function upsertRows(table: string, rows: Record<string, any>[]) {
  if (!rows.length) return;
  try {
    const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
    if (error) console.warn(`[supabaseSync] bulk upsert ${table} error:`, error.message);
  } catch (e) {
    console.warn(`[supabaseSync] bulk upsert ${table} failed:`, e);
  }
}

/** Fetch all rows from a Supabase table */
export async function fetchAll<T = any>(table: string): Promise<T[]> {
  try {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.warn(`[supabaseSync] fetch ${table} error:`, error.message);
      return [];
    }
    return (data || []) as T[];
  } catch (e) {
    console.warn(`[supabaseSync] fetch ${table} failed:`, e);
    return [];
  }
}

/** Delete a row from a Supabase table */
export async function deleteRow(table: string, id: string) {
  try {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) console.warn(`[supabaseSync] delete ${table} error:`, error.message);
  } catch (e) {
    console.warn(`[supabaseSync] delete ${table} failed:`, e);
  }
}

// ─── Quotations ─────────────────────────────────────────────────

/** Map a localStorage quotation object to a Supabase row */
function mapQuotationToRow(q: any): Record<string, any> {
  return {
    id: q.id,
    guest_name: q.guestName || null,
    guide_name: q.guideName || null,
    guide_email: q.guideEmail || null,
    guide_id: q.guideId || null,
    city: q.city || null,
    travelling_to: q.travellingTo || null,
    booking_date: q.bookingDate || null,
    trip_duration: q.tripDuration || null,
    total_guests: q.totalGuests || 1,
    pickup_point: q.pickupPoint || null,
    pickup_time: q.pickupTime || null,
    drop_point: q.dropPoint || null,
    drop_time: q.dropTime || null,
    places: q.places || null,
    tourist_nationality: q.touristNationality || null,
    guide_nationality: q.guideNationality || null,
    status: q.status || 'pending_guide',
    guide_quote_usd: q.guideQuoteUsd || null,
    traveler_counter_usd: q.travelerCounterUsd || null,
    guide_counter_usd: q.guideCounterUsd || null,
    round: q.round || 0,
    traveler_message: q.travelerMessage || null,
    data: q,
    updated_at: new Date().toISOString(),
  };
}

/** Map a Supabase row back to a localStorage quotation object */
function mapRowToQuotation(row: any): any {
  // The `data` JSONB column stores the full original object
  if (row.data && typeof row.data === 'object' && Object.keys(row.data).length > 1) {
    return { ...row.data, id: row.id };
  }
  return {
    id: row.id,
    guestName: row.guest_name,
    guideName: row.guide_name,
    guideEmail: row.guide_email,
    guideId: row.guide_id,
    city: row.city,
    travellingTo: row.travelling_to,
    bookingDate: row.booking_date,
    tripDuration: row.trip_duration,
    totalGuests: row.total_guests,
    pickupPoint: row.pickup_point,
    pickupTime: row.pickup_time,
    dropPoint: row.drop_point,
    dropTime: row.drop_time,
    places: row.places,
    touristNationality: row.tourist_nationality,
    guideNationality: row.guide_nationality,
    status: row.status,
    guideQuoteUsd: row.guide_quote_usd,
    travelerCounterUsd: row.traveler_counter_usd,
    guideCounterUsd: row.guide_counter_usd,
    round: row.round,
    travelerMessage: row.traveler_message,
  };
}

export async function syncQuotations(quotations: any[]) {
  localStorage.setItem('routebyroot_quotations', JSON.stringify(quotations));
  const rows = quotations.map(mapQuotationToRow);
  await upsertRows('quotations', rows);
}

export async function loadQuotations(): Promise<any[]> {
  const rows = await fetchAll('quotations');
  if (rows.length > 0) {
    const quotations = rows.map(mapRowToQuotation);
    localStorage.setItem('routebyroot_quotations', JSON.stringify(quotations));
    return quotations;
  }
  // Fallback to localStorage
  try {
    return JSON.parse(localStorage.getItem('routebyroot_quotations') || '[]');
  } catch { return []; }
}

// ─── Bookings ───────────────────────────────────────────────────

function mapBookingToRow(b: any): Record<string, any> {
  return {
    id: b.id,
    tour_name: b.tourName || null,
    guide_name: b.guideName || null,
    traveler: b.traveler || null,
    date: b.date || null,
    status: b.status || 'confirmed',
    amount: b.amount || null,
    guide_amount: b.guideAmount || null,
    platform_fee: b.platformFee || null,
    total_guests: b.totalGuests || b.count || 1,
    pickup_time: b.pickupTime || null,
    places: Array.isArray(b.places) ? b.places : null,
    guide_nationality: b.guideNationality || null,
    tourist_nationality: b.touristNationality || null,
    payment_id: b.paymentId || null,
    guide_languages: Array.isArray(b.guideLanguages) ? b.guideLanguages : null,
    data: b,
    created_at: b.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function mapRowToBooking(row: any): any {
  if (row.data && typeof row.data === 'object' && Object.keys(row.data).length > 1) {
    return { ...row.data, id: row.id };
  }
  return {
    id: row.id,
    tourName: row.tour_name,
    guideName: row.guide_name,
    traveler: row.traveler,
    date: row.date,
    status: row.status,
    amount: row.amount,
    guideAmount: row.guide_amount,
    platformFee: row.platform_fee,
    totalGuests: row.total_guests,
    pickupTime: row.pickup_time,
    places: row.places,
    guideNationality: row.guide_nationality,
    touristNationality: row.tourist_nationality,
    paymentId: row.payment_id,
    guideLanguages: row.guide_languages,
    createdAt: row.created_at,
  };
}

export async function syncBookings(bookings: any[], storageKey = 'routebyroot_guide_bookings') {
  localStorage.setItem(storageKey, JSON.stringify(bookings));
  const rows = bookings.map(mapBookingToRow);
  await upsertRows('app_bookings', rows);
}

export async function loadBookings(storageKey = 'routebyroot_guide_bookings'): Promise<any[]> {
  const rows = await fetchAll('app_bookings');
  if (rows.length > 0) {
    const bookings = rows.map(mapRowToBooking);
    localStorage.setItem(storageKey, JSON.stringify(bookings));
    return bookings;
  }
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  } catch { return []; }
}

// ─── Support Tickets ────────────────────────────────────────────

function mapTicketToRow(t: any): Record<string, any> {
  return {
    id: t.id,
    subject: t.subject || null,
    message: t.message || null,
    status: t.status || 'open',
    priority: t.priority || 'medium',
    category: t.category || null,
    sender: t.sender || null,
    replies: t.replies || [],
    data: t,
    created_at: t.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function mapRowToTicket(row: any): any {
  if (row.data && typeof row.data === 'object' && Object.keys(row.data).length > 1) {
    return { ...row.data, id: row.id };
  }
  return {
    id: row.id,
    subject: row.subject,
    message: row.message,
    status: row.status,
    priority: row.priority,
    category: row.category,
    sender: row.sender,
    replies: row.replies,
    createdAt: row.created_at,
  };
}

export async function syncTickets(tickets: any[]) {
  localStorage.setItem('routebyroot_tickets', JSON.stringify(tickets));
  const rows = tickets.map(mapTicketToRow);
  await upsertRows('support_tickets', rows);
}

export async function loadTickets(): Promise<any[]> {
  const rows = await fetchAll('support_tickets');
  if (rows.length > 0) {
    const tickets = rows.map(mapRowToTicket);
    localStorage.setItem('routebyroot_tickets', JSON.stringify(tickets));
    return tickets;
  }
  try {
    return JSON.parse(localStorage.getItem('routebyroot_tickets') || '[]');
  } catch { return []; }
}

// ─── Guide Applications ────────────────────────────────────────

function mapApplicationToRow(a: any): Record<string, any> {
  return {
    id: a.id,
    user_id: a.userId || null,
    full_name: a.fullName || null,
    email: a.email || null,
    phone: a.phone || null,
    nationality: a.nationality || null,
    country_name: a.countryName || null,
    city_name: a.cityName || null,
    languages: a.languages || null,
    experience: a.experience || null,
    short_description: a.shortDescription || null,
    status: a.status || 'pending',
    passport_file_name: a.passportFileName || null,
    data: a,
    created_at: a.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function mapRowToApplication(row: any): any {
  if (row.data && typeof row.data === 'object' && Object.keys(row.data).length > 1) {
    return { ...row.data, id: row.id };
  }
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    nationality: row.nationality,
    countryName: row.country_name,
    cityName: row.city_name,
    languages: row.languages,
    experience: row.experience,
    shortDescription: row.short_description,
    status: row.status,
    passportFileName: row.passport_file_name,
    createdAt: row.created_at,
  };
}

export async function syncGuideApplications(apps: any[]) {
  localStorage.setItem('routebyroot_guide_applications', JSON.stringify(apps));
  const rows = apps.map(mapApplicationToRow);
  await upsertRows('guide_applications', rows);
}

export async function loadGuideApplications(): Promise<any[]> {
  const rows = await fetchAll('guide_applications');
  if (rows.length > 0) {
    const apps = rows.map(mapRowToApplication);
    localStorage.setItem('routebyroot_guide_applications', JSON.stringify(apps));
    return apps;
  }
  try {
    return JSON.parse(localStorage.getItem('routebyroot_guide_applications') || '[]');
  } catch { return []; }
}

// ─── Admin Negotiations ─────────────────────────────────────────

function mapNegotiationToRow(n: any): Record<string, any> {
  return {
    id: n.id,
    traveler: n.traveler || null,
    traveler_email: n.travelerEmail || null,
    traveler_nationality: n.travelerNationality || null,
    guide: n.guide || null,
    guide_email: n.guideEmail || null,
    guide_city: n.guideCity || null,
    initial_rate: n.initialRate || null,
    current_quote: n.currentQuote || null,
    round: n.round || 0,
    status: n.status || null,
    tour_name: n.tourName || null,
    destination: n.destination || null,
    guests: n.guests || 1,
    tour_date: n.tourDate || null,
    duration: n.duration || null,
    flagged: n.flagged || false,
    frozen: n.frozen || false,
    admin_notes: n.adminNotes || [],
    timeline: n.timeline || [],
    data: n,
    updated_at: new Date().toISOString(),
  };
}

function mapRowToNegotiation(row: any): any {
  if (row.data && typeof row.data === 'object' && Object.keys(row.data).length > 1) {
    return { ...row.data, id: row.id };
  }
  return {
    id: row.id,
    traveler: row.traveler,
    travelerEmail: row.traveler_email,
    travelerNationality: row.traveler_nationality,
    guide: row.guide,
    guideEmail: row.guide_email,
    guideCity: row.guide_city,
    initialRate: row.initial_rate,
    currentQuote: row.current_quote,
    round: row.round,
    status: row.status,
    tourName: row.tour_name,
    destination: row.destination,
    guests: row.guests,
    tourDate: row.tour_date,
    duration: row.duration,
    flagged: row.flagged,
    frozen: row.frozen,
    adminNotes: row.admin_notes,
    timeline: row.timeline,
  };
}

export async function syncNegotiations(negotiations: any[]) {
  localStorage.setItem('routebyroot_admin_negotiations', JSON.stringify(negotiations));
  const rows = negotiations.map(mapNegotiationToRow);
  await upsertRows('admin_negotiations', rows);
}

export async function loadNegotiations(): Promise<any[]> {
  const rows = await fetchAll('admin_negotiations');
  if (rows.length > 0) {
    const negotiations = rows.map(mapRowToNegotiation);
    localStorage.setItem('routebyroot_admin_negotiations', JSON.stringify(negotiations));
    return negotiations;
  }
  try {
    return JSON.parse(localStorage.getItem('routebyroot_admin_negotiations') || '[]');
  } catch { return []; }
}

// ─── Admin Settings ─────────────────────────────────────────────

export async function syncAdminSettings(settings: any) {
  localStorage.setItem('routebyroot_admin_settings', JSON.stringify(settings));
  await upsertRow('admin_settings', {
    id: 'global',
    commission_rate: settings.commissionRate ?? 10,
    settlement_days: settings.settlementDays ?? 7,
    default_currency: settings.defaultCurrency ?? 'USD',
    maintenance_mode: settings.maintenanceMode ?? false,
    auto_approve_listings: settings.autoApproveListings ?? false,
    notification_email: settings.notificationEmail ?? true,
    notification_sms: settings.notificationSms ?? false,
    data: settings,
    updated_at: new Date().toISOString(),
  });
}

export async function loadAdminSettings(): Promise<any> {
  try {
    const { data, error } = await supabase.from('admin_settings').select('*').eq('id', 'global').single();
    if (!error && data) {
      const settings = data.data && typeof data.data === 'object' && Object.keys(data.data).length > 0
        ? data.data
        : {
            commissionRate: data.commission_rate,
            settlementDays: data.settlement_days,
            defaultCurrency: data.default_currency,
            maintenanceMode: data.maintenance_mode,
            autoApproveListings: data.auto_approve_listings,
            notificationEmail: data.notification_email,
            notificationSms: data.notification_sms,
          };
      localStorage.setItem('routebyroot_admin_settings', JSON.stringify(settings));
      return settings;
    }
  } catch (e) {
    console.warn('[supabaseSync] loadAdminSettings failed:', e);
  }
  try {
    return JSON.parse(localStorage.getItem('routebyroot_admin_settings') || '{}');
  } catch { return {}; }
}

// ─── User Profiles ──────────────────────────────────────────────

export async function syncUserProfile(userId: string, profile: any) {
  const profileKey = `rbr_profile_${userId}`;
  localStorage.setItem(profileKey, JSON.stringify(profile));
  await upsertRow('user_profiles', {
    id: userId,
    user_id: userId,
    full_name: profile.full_name || profile.fullName || null,
    email: profile.email || null,
    phone: profile.phone || null,
    avatar_url: profile.avatar_url || null,
    nationality: profile.nationality || null,
    address: profile.address || null,
    emergency_contact: profile.emergency_contact || null,
    data: profile,
    updated_at: new Date().toISOString(),
  });
}

export async function loadUserProfile(userId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', userId).single();
    if (!error && data) {
      const profile = data.data && typeof data.data === 'object' ? data.data : data;
      const profileKey = `rbr_profile_${userId}`;
      localStorage.setItem(profileKey, JSON.stringify(profile));
      return profile;
    }
  } catch (e) {
    console.warn('[supabaseSync] loadUserProfile failed:', e);
  }
  try {
    const profileKey = `rbr_profile_${userId}`;
    return JSON.parse(localStorage.getItem(profileKey) || 'null');
  } catch { return null; }
}

// ─── Full Hydration (call on app startup) ───────────────────────

export async function hydrateFromSupabase() {
  console.log('[supabaseSync] Hydrating from Supabase...');
  try {
    await Promise.allSettled([
      loadQuotations(),
      loadBookings(),
      loadTickets(),
      loadGuideApplications(),
      loadNegotiations(),
      loadAdminSettings(),
    ]);
    console.log('[supabaseSync] Hydration complete.');
  } catch (e) {
    console.warn('[supabaseSync] Hydration failed, using localStorage fallback:', e);
  }
}
