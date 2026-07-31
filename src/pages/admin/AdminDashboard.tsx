import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  MapPin,
  Star,
  Settings,
  LogOut,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
  Bell,
  Search,
  Plus,
  Trash2,
  AlertCircle,
  MessageSquare,
  Send,
  Shield,
  Award,
  Activity,
  BarChart3,
  FileText,
  Globe,
  Eye,
  Zap,
  Banknote,
  CalendarDays,
  ToggleLeft,
  ToggleRight,
  Download,
  RefreshCw,
  AlertTriangle,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Building,
  Handshake,
  Flag,
  Pause,
  Play,
  X,
  User,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useListings } from '../../contexts/ListingsContext';
import { syncNegotiations, syncAdminSettings, syncGuideApplications, syncTickets } from '../../lib/supabaseSync';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
  { id: 'users', label: 'Users Management', icon: Users, path: '/admin/users' },
  { id: 'guides', label: 'Guides Management', icon: BookOpen, path: '/admin/guides' },
  { id: 'listings', label: 'Listing Approvals', icon: Award, path: '/admin/listings' },
  { id: 'bookings', label: 'Bookings', icon: MapPin, path: '/admin/bookings' },
  { id: 'negotiations', label: 'Active Negotiations', icon: Handshake, path: '/admin/negotiations' },
  { id: 'withdrawals', label: 'Withdrawal Approvals', icon: DollarSign, path: '/admin/withdrawals' },
  { id: 'live-ops', label: 'Live Operations', icon: Activity, path: '/admin/live-ops' },
  { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3, path: '/admin/analytics' },
  { id: 'destinations', label: 'Destinations', icon: Globe, path: '/admin/destinations' },
  { id: 'reviews', label: 'Reviews', icon: Star, path: '/admin/reviews' },
  { id: 'tickets', label: 'Support Tickets', icon: MessageSquare, path: '/admin/tickets' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const configs: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
    confirmed: { color: '#16a34a', bg: 'rgba(34,197,94,0.1)', icon: CheckCircle, label: 'Confirmed' },
    pending: { color: '#d97706', bg: 'rgba(249,115,22,0.1)', icon: Clock, label: 'Pending' },
    cancelled: { color: '#dc2626', bg: 'rgba(239,68,68,0.1)', icon: XCircle, label: 'Cancelled' },
  };
  const cfg = configs[status] || configs.pending;
  const Icon = cfg.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      backgroundColor: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.color}30`,
      borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: 600,
    }}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { listings, approveListing, rejectListing, toggleListingEnabled } = useListings();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const adminName = user?.email?.split('@')[0] || 'Admin';
  const adminInitials = adminName.slice(0, 2).toUpperCase();

  // ─── STATEFUL DATABASE MOCKS & DYNAMIC DB STATES ───
  const [usersList, setUsersList] = useState<any[]>([]);
  const [dbDestinations, setDbDestinations] = useState<any[]>([]);
  const [dbBookings, setDbBookings] = useState<any[]>([]);
  
  const [userSearch, setUserSearch] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newCountry, setNewCountry] = useState('');

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [ticketSearch, setTicketSearch] = useState('');

  // Guide Applications State
  const [guideApplications, setGuideApplications] = useState<any[]>([]);
  const [selectedGuideApp, setSelectedGuideApp] = useState<any>(null);
  const [verifiedGuideIds, setVerifiedGuideIds] = useState<string[]>([]);
  const [recommendedGuideIds, setRecommendedGuideIds] = useState<string[]>([]);

  // Withdrawals approvals state
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  // Live operations trips state
  const [liveOpsTrips, setLiveOpsTrips] = useState<any[]>([]);
  // Active quotations / negotiations state
  const [activeNegotiations, setActiveNegotiations] = useState<any[]>([]);
  const [selectedNegotiation, setSelectedNegotiation] = useState<any | null>(null);
  const [negotiationSearch, setNegotiationSearch] = useState('');
  const [negotiationFilterTab, setNegotiationFilterTab] = useState<'All' | 'Active' | 'Accepted' | 'Cancelled' | 'Flagged'>('All');
  const [negotiationAdminNote, setNegotiationAdminNote] = useState('');

  // Settings state
  const initSettings = JSON.parse(localStorage.getItem('routebyroot_admin_settings') || '{}');
  const [commissionRate, setCommissionRate] = useState(initSettings.commissionRate !== undefined ? initSettings.commissionRate : 15);
  const [settlementDays, setSettlementDays] = useState(initSettings.settlementDays !== undefined ? initSettings.settlementDays : 7);
  const [maintenanceMode, setMaintenanceMode] = useState(initSettings.maintenanceMode || false);
  const [autoApproveListings, setAutoApproveListings] = useState(initSettings.autoApproveListings || false);
  const [emailNotifications, setEmailNotifications] = useState(initSettings.emailNotifications !== undefined ? initSettings.emailNotifications : true);
  const [smsNotifications, setSmsNotifications] = useState(initSettings.smsNotifications || false);
  const [defaultCurrency, setDefaultCurrency] = useState(initSettings.defaultCurrency || 'USD');
  const [systemAnnouncement, setSystemAnnouncement] = useState(initSettings.systemAnnouncement || '');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // ─── CURRENCY CONVERSION ───
  const [currency, setCurrency] = useState<string>(localStorage.getItem('selected_currency_admin') || 'USD');

  const formatAdminPrice = (amount: number | string, baseInJPY = false): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    const ratesFromJPY: Record<string, number> = { USD: 1/110, JPY: 1, INR: 75/110, EUR: 0.85/110 };
    const ratesFromUSD: Record<string, number> = { USD: 1, JPY: 110, INR: 75, EUR: 0.85 };
    const converted = num * (baseInJPY ? (ratesFromJPY[currency] || 1) : (ratesFromUSD[currency] || 1));
    if (currency === 'JPY') return `¥${Math.round(converted).toLocaleString()}`;
    if (currency === 'INR') return `₹${converted.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    if (currency === 'EUR') return `€${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    return `$${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const handleCurrencyChange = (cur: string) => {
    setCurrency(cur);
    localStorage.setItem('selected_currency_admin', cur);
  };

  // Notification log state
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedListingDetail, setSelectedListingDetail] = useState<any | null>(null);
  const [activeDocCarouselIndex, setActiveDocCarouselIndex] = useState(0);
  const [guideSearch, setGuideSearch] = useState('');
  const [guideFilterTab, setGuideFilterTab] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [systemNotifications] = useState([
    { id: 'N1', type: 'withdrawal', message: 'New withdrawal request W-9901 from Shivashish Chamoli', time: '2 min ago', read: false },
    { id: 'N2', type: 'guide_app', message: 'New guide application from Rajesh Kumar', time: '15 min ago', read: false },
    { id: 'N3', type: 'listing', message: 'Listing "Old Delhi Walk" submitted for approval', time: '1 hr ago', read: true },
    { id: 'N4', type: 'ticket', message: 'Support ticket TKT-001 has been updated', time: '3 hr ago', read: true },
    { id: 'N5', type: 'booking', message: 'New booking BK-1042 confirmed by Michael Scott', time: '5 hr ago', read: true },
  ]);

  // Live Sync logic to pull real-time data from localStorage for Admin Feed
  const syncAdminData = () => {
    // 1. Sync Live Bookings
    try {
      const guideBookings = JSON.parse(localStorage.getItem('routebyroot_guide_bookings') || '[]');
      if (guideBookings.length > 0) {
        setDbBookings(guideBookings.map((b: any) => ({
          id: b.id,
          user_id: b.traveler,
          destination_id: b.guideName,
          status: b.status,
          total_price: b.amount,
          created_at: b.createdAt
        })));
      }
    } catch(e) {}

    // 2. Sync Live Operations
    try {
      const liveOps = JSON.parse(localStorage.getItem('routebyroot_admin_live_ops') || '[]');
      if (liveOps.length > 0) {
        setLiveOpsTrips(liveOps);
      }
    } catch(e) {}

    // 3. Sync Active Negotiations
    try {
      const liveQuotes = JSON.parse(localStorage.getItem('routebyroot_quotations') || '[]');
      if (liveQuotes.length > 0) {
        const existingAdmin = JSON.parse(localStorage.getItem('routebyroot_admin_negotiations') || '[]');
        
        const mappedQuotes = liveQuotes.map((q: any) => {
          const prevAdmin = existingAdmin.find((ea: any) => ea.id === q.id) || {};
          return {
            id: q.id,
            traveler: q.guestName || 'Traveler',
            travelerEmail: 'traveler@mail.com',
            travelerNationality: q.touristNationality || 'Unknown',
            guide: q.guideName || 'Guide',
            guideEmail: 'guide@routebyroot.com',
            guideCity: q.city || 'Unknown',
            initialRate: (q.guideQuoteUsd > 1000 ? 40 : q.guideQuoteUsd) || 0,
            currentQuote: (q.guideCounterUsd > 1000 ? 42 : q.guideCounterUsd) || (q.travelerCounterUsd > 1000 ? 42 : q.travelerCounterUsd) || (q.guideQuoteUsd > 1000 ? 40 : q.guideQuoteUsd) || 0,
            round: q.round || 0,
            status: q.status || 'pending',
            tourName: 'Custom Customization',
            destination: q.travellingTo || 'Unknown',
            guests: q.totalGuests || 1,
            tourDate: q.bookingDate || 'Unknown',
            duration: q.tripDuration || 'Unknown',
            pickupPoint: q.pickupPoint || 'Unknown',
            pickupTime: q.pickupTime || 'Unknown',
            dropoffPoint: q.dropPoint || 'Unknown',
            dropoffTime: q.dropTime || 'Unknown',
            itinerary: q.places || 'Unknown',
            travelerMessage: 'Custom booking request.',
            createdAt: q.createdAt || 'Unknown',
            flagged: prevAdmin.flagged || false,
            frozen: prevAdmin.frozen || false,
            adminNotes: prevAdmin.adminNotes || [],
            timeline: prevAdmin.timeline || []
          };
        });
        setActiveNegotiations(mappedQuotes);
      }
    } catch(e) {}
  };

  useEffect(() => {
    syncAdminData();
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === 'routebyroot_guide_bookings' || e.key === 'routebyroot_admin_live_ops' || e.key === 'routebyroot_quotations') {
        syncAdminData();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Load live profiles and destinations from Supabase
  const loadData = async () => {
    // Load Users Profiles
    const { data: profiles } = await supabase.from('profiles').select('*');
    if (profiles) setUsersList(profiles);

    // Load Destinations
    const { data: dests } = await supabase.from('destinations').select('*');
    if (dests) setDbDestinations(dests);

    // Load Support Tickets
    const savedTickets = localStorage.getItem('routebyroot_tickets');
    if (savedTickets) {
      setSupportTickets(JSON.parse(savedTickets));
    }

    // Load Guide Applications
    const savedApps = localStorage.getItem('routebyroot_guide_applications');
    const defaultApps = [
      { id: 'APP-1001', userId: 'usr-1', name: 'Rajesh Kumar', email: 'rajesh@routebyroot.com', contactNumber: '+91 98765 43210', currentAddress: '12 Green Park, Delhi', cityName: 'Delhi', state: 'Delhi', countryName: 'India', pinCode: '110016', shortDescription: 'Experienced history tour guide with deep roots in old Delhi monuments and street food secrets.', passportFileName: 'passport_scan.pdf', status: 'pending', createdAt: 'Jun 24, 2026' },
      { id: 'APP-1002', userId: 'usr-2', name: 'Yuki Tanaka', email: 'yuki@routebyroot.com', contactNumber: '+81 90 1234 5678', currentAddress: '3-2-1 Shibuya', cityName: 'Tokyo', state: 'Tokyo', countryName: 'Japan', pinCode: '150-0002', shortDescription: 'Local Japanese culture enthusiast. Fluent in English and Hindi. Loves sharing hidden Izakaya spots.', passportFileName: 'national_id.jpg', status: 'pending', createdAt: 'Jun 23, 2026' }
    ];
    if (savedApps) {
      setGuideApplications(JSON.parse(savedApps));
    } else {
      setGuideApplications(defaultApps);
      syncGuideApplications(defaultApps);
    }

    // Load Verified Guide IDs
    const savedVerified = localStorage.getItem('routebyroot_verified_guide_ids');
    if (savedVerified) {
      setVerifiedGuideIds(JSON.parse(savedVerified));
    } else {
      const defaultVerified = ['usr-2']; // Yuki Tanaka verified by default
      setVerifiedGuideIds(defaultVerified);
      localStorage.setItem('routebyroot_verified_guide_ids', JSON.stringify(defaultVerified));
    }

    // Load Recommended Guide IDs
    const savedRecommended = localStorage.getItem('routebyroot_recommended_guide_ids');
    if (savedRecommended) {
      setRecommendedGuideIds(JSON.parse(savedRecommended));
    } else {
      const defaultRecommended = ['usr-default-shivashish']; // Shivashish recommended by default
      setRecommendedGuideIds(defaultRecommended);
      localStorage.setItem('routebyroot_recommended_guide_ids', JSON.stringify(defaultRecommended));
    }

    // Load Withdrawals from localStorage
    const savedWithdrawals = localStorage.getItem('routebyroot_admin_withdrawals');
    const defaultWithdrawals = [
      { id: 'W-9901', guideEmail: 'guide@example.com', guideName: 'Shivashish Chamoli', amount: 1450, bankName: 'Japan Post Bank', accNo: '987654321', holderName: 'Shivashish Chamoli', ifsc: 'JPB0001', branch: 'Tachikawa Branch', status: 'pending', date: 'June 26, 2026' },
      { id: 'W-9902', guideEmail: 'yuki@routebyroot.com', guideName: 'Yuki Tanaka', amount: 800, bankName: 'Mizuho Bank', accNo: '1122334455', holderName: 'Yuki Tanaka', ifsc: 'MHBAJPJT', branch: 'Shibuya Branch', status: 'approved', date: 'June 25, 2026' }
    ];
    if (savedWithdrawals) {
      setWithdrawals(JSON.parse(savedWithdrawals));
    } else {
      setWithdrawals(defaultWithdrawals);
      localStorage.setItem('routebyroot_admin_withdrawals', JSON.stringify(defaultWithdrawals));
    }

    // Load Live Operations from localStorage
    const savedLiveOps = localStorage.getItem('routebyroot_admin_live_ops');
    if (!savedLiveOps) {
      const defaultLiveOps = [
        { id: 'BK-8809', traveler: 'Atharav Singh', guide: 'Shivashish Chamoli', tourName: 'Old Tokyo Secrets Tour', date: 'June 26, 2026', locationSharing: 'active', touristLocation: '35.6895° N, 139.6917° E (Shibuya)', guideLocation: '35.6897° N, 139.6919° E (Crossing)', connection: 'Stable (5G)', status: 'ongoing' },
        { id: 'BK-4412', traveler: 'Sudipta Konkan', guide: 'Yuki Tanaka', tourName: 'Shibuya Night Izakaya Crawl', date: 'June 26, 2026', locationSharing: 'inactive', touristLocation: 'Offline', guideLocation: 'Offline', connection: 'Waiting on toggle', status: 'scheduled' }
      ];
      setLiveOpsTrips(defaultLiveOps);
      localStorage.setItem('routebyroot_admin_live_ops', JSON.stringify(defaultLiveOps));
    }

    // Active Negotiations is primarily synced via syncAdminData() from routebyroot_quotations.
    // We only set the mock fallback if neither exist.
    const savedNegotiations = localStorage.getItem('routebyroot_admin_negotiations');
    const savedQuotations = localStorage.getItem('routebyroot_quotations');
    if (!savedNegotiations && !savedQuotations) {
      const defaultNegotiations = [
        {
          id: 'Q-4982', traveler: 'Atharav Singh', travelerEmail: 'atharav@mail.com', travelerNationality: 'Indian',
          guide: 'Shivashish Chamoli', guideEmail: 'shivashish@routebyroot.com', guideCity: 'Tokyo',
          initialRate: 30, currentQuote: 35, round: 1, status: 'pending_guide',
          tourName: 'Tokyo City Exploration', destination: 'Tokyo, Japan',
          guests: 2, tourDate: 'July 10, 2026', duration: '10 Hours',
          pickupPoint: 'Shibuya Metro Station, North Exit', pickupTime: '09:20 AM',
          dropoffPoint: 'Nearby Station', dropoffTime: '19:30 PM',
          itinerary: 'Tokyo City, Shibuya Rokko Market, Sukesan Eatery, Tokyo Tower, Abeyamakoen, Tokyo Castle',
          travelerMessage: 'Hi! I\'m interested in a full-day Tokyo city tour. Could you guide me and my friend?',
          createdAt: 'June 25, 2026 10:14 AM',
          flagged: false, frozen: false, adminNotes: [],
          timeline: [
            { type: 'traveler_offer', rate: 30, message: 'Hi! I\'m interested in a full-day Tokyo city tour. Could you guide me and my friend?', time: 'June 25, 2026 10:14 AM' },
            { type: 'guide_quote', rate: 35, message: 'Thank you for your interest! Given the full-day itinerary with 6 stops, I\'d quote $35/hr.', time: 'June 25, 2026 11:02 AM' }
          ]
        },
        {
          id: 'Q-4983', traveler: 'Sudipta Konkan', travelerEmail: 'sudipta@mail.com', travelerNationality: 'Indian',
          guide: 'Yuki Tanaka', guideEmail: 'yuki@routebyroot.com', guideCity: 'Kyoto',
          initialRate: 25, currentQuote: 25, round: 2, status: 'accepted',
          tourName: 'Kyoto Cultural Walk', destination: 'Kyoto, Japan',
          guests: 1, tourDate: 'July 15, 2026', duration: '6 Hours',
          pickupPoint: 'Kyoto Station Central Gate', pickupTime: '10:00 AM',
          dropoffPoint: 'Fushimi Inari Main Gate', dropoffTime: '16:00 PM',
          itinerary: 'Kinkaku-ji Temple, Arashiyama Bamboo Grove, Nishiki Market, Fushimi Inari Shrine',
          travelerMessage: 'Looking for a relaxed cultural walking tour. I\'m a solo traveler.',
          createdAt: 'June 22, 2026 08:30 AM',
          flagged: false, frozen: false, adminNotes: [],
          timeline: [
            { type: 'traveler_offer', rate: 25, message: 'Looking for a relaxed cultural walking tour. I\'m a solo traveler.', time: 'June 22, 2026 08:30 AM' },
            { type: 'guide_quote', rate: 30, message: 'I\'d love to show you around! My rate is $30/hr for this route.', time: 'June 22, 2026 09:15 AM' },
            { type: 'traveler_counter', rate: 25, message: 'Can we meet at $25/hr? That\'s closer to my budget.', time: 'June 22, 2026 10:41 AM' },
            { type: 'guide_accept', rate: 25, message: 'Deal! $25/hr works. Looking forward to it!', time: 'June 22, 2026 11:05 AM' }
          ]
        }
      ];
      setActiveNegotiations(defaultNegotiations);
      syncNegotiations(defaultNegotiations);
    }
  };

  const handleVerifyGuide = async (userId: string, appId?: string) => {
    // 1. Update Role in Supabase
    const { error } = await supabase.from('profiles').update({ role: 'guide' }).eq('id', userId);
    
    // 2. Add to Verified list
    const newVerified = verifiedGuideIds.includes(userId) ? verifiedGuideIds : [...verifiedGuideIds, userId];
    setVerifiedGuideIds(newVerified);
    localStorage.setItem('routebyroot_verified_guide_ids', JSON.stringify(newVerified));

    // 3. Update application status if it exists
    if (appId) {
      const updatedApps = guideApplications.map(app => app.id === appId ? { ...app, status: 'approved' } : app);
      setGuideApplications(updatedApps);
      syncGuideApplications(updatedApps);
      // Mark as submitted in traveler panel so it shows correct state
      localStorage.setItem(`routebyroot_become_guide_submitted_${userId}`, 'true');
    }

    alert('Guide approved and verified successfully!');
    setSelectedGuideApp(null);
    loadData();
  };

  const handleRejectGuide = (appId: string, userId: string) => {
    const updatedApps = guideApplications.map(app => app.id === appId ? { ...app, status: 'rejected' } : app);
    setGuideApplications(updatedApps);
    syncGuideApplications(updatedApps);
    localStorage.removeItem(`routebyroot_become_guide_submitted_${userId}`);
    alert('Guide application rejected.');
    setSelectedGuideApp(null);
  };

  const handleApproveWithdrawal = (id: string) => {
    const updated = withdrawals.map(w => w.id === id ? { ...w, status: 'approved' } : w);
    setWithdrawals(updated);
    localStorage.setItem('routebyroot_admin_withdrawals', JSON.stringify(updated));
    alert('Withdrawal request approved and processed successfully!');
  };

  const handleRejectWithdrawal = (id: string) => {
    const updated = withdrawals.map(w => w.id === id ? { ...w, status: 'rejected' } : w);
    setWithdrawals(updated);
    localStorage.setItem('routebyroot_admin_withdrawals', JSON.stringify(updated));
    alert('Withdrawal request declined.');
  };

  const handleToggleLiveOpsTrip = (id: string) => {
    const updated = liveOpsTrips.map(t => {
      if (t.id === id) {
        const nextSharing = t.locationSharing === 'active' ? 'inactive' : 'active';
        return {
          ...t,
          locationSharing: nextSharing,
          touristLocation: nextSharing === 'active' ? '35.6895° N, 139.6917° E (Shibuya)' : 'Offline',
          guideLocation: nextSharing === 'active' ? '35.6897° N, 139.6919° E (Crossing)' : 'Offline',
          connection: nextSharing === 'active' ? 'Stable (5G)' : 'Offline'
        };
      }
      return t;
    });
    setLiveOpsTrips(updated);
    localStorage.setItem('routebyroot_admin_live_ops', JSON.stringify(updated));
  };

  const handleTicketReplySubmit = (ticketId: string) => {
    if (!ticketReplyText.trim()) return;
    const updatedTickets = supportTickets.map(t => {
      if (t.id === ticketId) {
        const newMsg = {
          sender: 'admin' as const,
          text: ticketReplyText,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
        return {
          ...t,
          messages: [...t.messages, newMsg],
          status: 'in_progress' as const
        };
      }
      return t;
    });

    setSupportTickets(updatedTickets);
    syncTickets(updatedTickets);
    
    // Update selected ticket in view
    const updatedSelected = updatedTickets.find(t => t.id === ticketId);
    setSelectedTicket(updatedSelected);
    
    setTicketReplyText('');
  };

  const handleResolveTicket = (ticketId: string) => {
    const updatedTickets = supportTickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'resolved' as const
        };
      }
      return t;
    });

    setSupportTickets(updatedTickets);
    syncTickets(updatedTickets);
    
    // Update selected ticket in view
    const updatedSelected = updatedTickets.find(t => t.id === ticketId);
    setSelectedTicket(updatedSelected);
    alert(`Ticket ${ticketId} has been successfully resolved.`);
  };

  // ─── NEGOTIATION ACTION HANDLERS ───
  const persistNegotiations = (updated: any[]) => {
    setActiveNegotiations(updated);
    syncNegotiations(updated);
  };

  const handleToggleFlagNegotiation = (negId: string) => {
    const updated = activeNegotiations.map(n => {
      if (n.id === negId) {
        const nowFlagged = !n.flagged;
        return {
          ...n,
          flagged: nowFlagged,
          adminNotes: [...(n.adminNotes || []), nowFlagged ? `[Admin] Flagged for review — ${new Date().toLocaleString()}` : `[Admin] Flag removed — ${new Date().toLocaleString()}`]
        };
      }
      return n;
    });
    persistNegotiations(updated);
    const sel = updated.find(n => n.id === negId);
    if (sel) setSelectedNegotiation(sel);
  };

  const handleToggleFreezeNegotiation = (negId: string) => {
    const updated = activeNegotiations.map(n => {
      if (n.id === negId) {
        const nowFrozen = !n.frozen;
        return {
          ...n,
          frozen: nowFrozen,
          adminNotes: [...(n.adminNotes || []), nowFrozen ? `[Admin] Negotiation FROZEN — ${new Date().toLocaleString()}` : `[Admin] Negotiation UNFROZEN — ${new Date().toLocaleString()}`]
        };
      }
      return n;
    });
    persistNegotiations(updated);
    const sel = updated.find(n => n.id === negId);
    if (sel) setSelectedNegotiation(sel);
  };

  const handleForceCloseNegotiation = (negId: string) => {
    if (!window.confirm('Are you sure you want to force-close this negotiation? This cannot be undone.')) return;
    const updated = activeNegotiations.map(n => {
      if (n.id === negId) {
        return {
          ...n,
          status: 'force_closed',
          frozen: true,
          timeline: [...(n.timeline || []), { type: 'admin_force_close', rate: n.currentQuote, message: 'Negotiation force-closed by admin.', time: new Date().toLocaleString() }],
          adminNotes: [...(n.adminNotes || []), `[Admin] Negotiation FORCE-CLOSED — ${new Date().toLocaleString()}`]
        };
      }
      return n;
    });
    persistNegotiations(updated);
    const sel = updated.find(n => n.id === negId);
    if (sel) setSelectedNegotiation(sel);
  };

  const handleOverridePrice = (negId: string) => {
    const input = window.prompt(`Enter the new override price (${currency}/hr):`);
    if (!input) return;
    const newPriceLocal = parseFloat(input);
    if (isNaN(newPriceLocal) || newPriceLocal <= 0) { alert('Invalid price.'); return; }
    
    // AdminDashboard ratesFromUSD converts USD to the target currency
    // So to convert from target currency to USD, we divide by the rate
    const ratesFromUSD: Record<string, number> = { USD: 1, JPY: 110, INR: 75, EUR: 0.85 };
    const rate = ratesFromUSD[currency] || 1;
    const newPrice = newPriceLocal / rate;

    const updated = activeNegotiations.map(n => {
      if (n.id === negId) {
        return {
          ...n,
          currentQuote: newPrice,
          timeline: [...(n.timeline || []), { type: 'admin_override', rate: newPrice, message: `Admin overrode price to ${formatAdminPrice(newPrice)}/hr.`, time: new Date().toLocaleString() }],
          adminNotes: [...(n.adminNotes || []), `[Admin] Price overridden to ${formatAdminPrice(newPrice)}/hr — ${new Date().toLocaleString()}`]
        };
      }
      return n;
    });
    persistNegotiations(updated);
    const sel = updated.find(n => n.id === negId);
    if (sel) setSelectedNegotiation(sel);
  };

  const handleAddNegotiationNote = (negId: string) => {
    if (!negotiationAdminNote.trim()) return;
    const updated = activeNegotiations.map(n => {
      if (n.id === negId) {
        return {
          ...n,
          adminNotes: [...(n.adminNotes || []), `[Admin Note] ${negotiationAdminNote.trim()} — ${new Date().toLocaleString()}`]
        };
      }
      return n;
    });
    persistNegotiations(updated);
    const sel = updated.find(n => n.id === negId);
    if (sel) setSelectedNegotiation(sel);
    setNegotiationAdminNote('');
  };

  useEffect(() => {
    loadData();
  }, []);

  const deleteUser = async (id: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (!error) {
      setUsersList(prev => prev.filter(u => u.id !== id));
    }
  };

  const approveGuide = (id: string) => {
    setGuideApplications(prev => prev.filter(r => r.id !== id));
  };

  const handleSaveSettings = async () => {
    const config = {
      commissionRate, settlementDays, maintenanceMode,
      autoApproveListings, emailNotifications, smsNotifications,
      defaultCurrency, systemAnnouncement
    };
    await syncAdminSettings(config);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const addDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity.trim() || !newCountry.trim()) return;
    
    const { data, error } = await supabase.from('destinations').insert({
      name: newCity,
      country: newCountry,
      featured: true
    }).select();

    if (!error && data) {
      setDbDestinations(prev => [...prev, data[0]]);
      setNewCity('');
      setNewCountry('');
    }
  };

  return (
    <div style={styles.root}>
      
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <img src="/logo.png" alt="RouteByRoot" style={styles.sidebarLogo} />
          <span style={styles.adminBadge}>ADMIN</span>
        </div>

        <nav style={styles.nav}>
          <p style={styles.navLabel}>MAIN SYSTEM MENU</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                }}
              >
                {isActive && <span style={styles.activeBorder} />}
                <Icon size={18} />
                <span style={{ flex: 1, marginLeft: 10 }}>{item.label}</span>
                {isActive && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
              </button>
            );
          })}
        </nav>

        <div style={styles.sidebarBottom}>
          <div style={styles.userRow}>
            <div style={styles.userAvatar}>{adminInitials}</div>
            <div style={styles.userInfo}>
              <p style={styles.userName}>{adminName}</p>
              <p style={styles.userRole}>Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={styles.main}>
        <div style={styles.topBar}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, color: '#1E3A8A', margin: 0 }}>
              System Console 👋
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94A3B8' }}>Admin management center</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Currency Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Currency:</span>
              <select
                value={currency}
                onChange={e => handleCurrencyChange(e.target.value)}
                style={{
                  padding: '6px 10px', borderRadius: 8, border: '1px solid #E2E8F0',
                  fontSize: '0.8rem', fontWeight: 600, color: '#1E3A8A',
                  background: '#F8FAFC', cursor: 'pointer', outline: 'none'
                }}
              >
                <option value="USD">USD ($)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
              >
                <Bell size={18} color="#64748B" />
                {systemNotifications.filter(n => !n.read).length > 0 && (
                  <span style={{ position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: '#EF4444', color: '#FFF', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {systemNotifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div style={{
                  position: 'absolute', top: 48, right: 0, width: 360, background: '#FFF', borderRadius: 12, boxShadow: '0 20px 40px rgba(0,0,0,0.12)', border: '1px solid #E2E8F0', zIndex: 100, overflow: 'hidden'
                }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E3A8A' }}>Notifications</span>
                    <span style={{ fontSize: '0.72rem', color: '#06B6D4', fontWeight: 600, cursor: 'pointer' }}>Mark all read</span>
                  </div>
                  {systemNotifications.map(n => (
                    <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid #F8FAFC', background: n.read ? '#FFFFFF' : '#FFFBEB', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.background = n.read ? '#FFFFFF' : '#FFFBEB'}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.read ? '#CBD5E1' : '#F97316', marginTop: 6, flexShrink: 0 }} />
                        <div>
                          <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }}>{n.message}</p>
                          <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{n.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={styles.topAvatar}>{adminInitials}</div>
          </div>
        </div>

        <div style={styles.content}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (() => {
            const liveGrossRevenue = dbBookings.reduce((sum, b) => sum + (b.total_price || 0), 0) || 128450;
            const livePlatformEarnings = dbBookings.reduce((sum, b) => {
              const totalPrice = b.total_price || 0;
              const subtotal = totalPrice / (1 + commissionRate / 100);
              return sum + (totalPrice - subtotal);
            }, 0) || 19268;
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                <div style={{ ...styles.statsGrid, gridTemplateColumns: 'repeat(5, 1fr)' }}>
                  {[
                    { label: 'Total Users', value: usersList.length, color: '#1A1F5E', change: '+8%', icon: Users, trend: 'up' },
                    { label: 'Active Destinations', value: dbDestinations.length, color: '#F97316', change: '+5%', icon: Globe, trend: 'up' },
                    { label: 'Total Bookings', value: dbBookings.length, color: '#06B6D4', change: '+18%', icon: CalendarDays, trend: 'up' },
                    { label: 'Total Revenue', value: formatAdminPrice(liveGrossRevenue), color: '#22C55E', change: '+22%', icon: DollarSign, trend: 'up' },
                    { label: 'Total Earnings', value: formatAdminPrice(livePlatformEarnings), color: '#8B5CF6', change: 'Platform Fee', icon: DollarSign, trend: 'up' }
                  ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} style={styles.statCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>{stat.label}</span>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${stat.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={18} color={stat.color} />
                        </div>
                      </div>
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2rem', color: '#1A1F5E', margin: '8px 0 4px' }}>{stat.value}</h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ArrowUpRight size={14} color="#22C55E" />
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#22C55E' }}>{stat.change}</span>
                        <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginLeft: 4 }}>vs last month</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pending Actions Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[
                  { label: 'Pending Withdrawals', count: withdrawals.filter(w => w.status === 'pending').length, color: '#F59E0B', tab: 'withdrawals' },
                  { label: 'Pending Guide Apps', count: guideApplications.filter(a => a.status === 'pending').length, color: '#8B5CF6', tab: 'guides' },
                  { label: 'Listings for Review', count: listings.filter(l => l.status === 'pending').length, color: '#06B6D4', tab: 'listings' },
                  { label: 'Active Negotiations', count: activeNegotiations.filter(n => n.status === 'pending_guide' || n.status === 'pending_traveler').length, color: '#EF4444', tab: 'negotiations' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(item.tab)}
                    style={{
                      background: `linear-gradient(135deg, ${item.color}08, ${item.color}15)`, border: `1px solid ${item.color}30`,
                      borderRadius: 12, padding: '14px 18px', cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s, box-shadow 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 16px ${item.color}20`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: item.color }}>{item.count}</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginTop: 2 }}>{item.label}</div>
                    <div style={{ fontSize: '0.7rem', color: item.color, marginTop: 4, fontWeight: 600 }}>View →</div>
                  </button>
                ))}
              </div>

              <div style={styles.section}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E3A8A', marginBottom: 16 }}>Live Bookings Feed</h3>
                {dbBookings.length === 0 ? (
                  <p style={{ color: '#64748B', fontSize: '0.9rem' }}>No bookings created yet.</p>
                ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Total Price</th>
                        <th style={styles.th}>Guests</th>
                        <th style={styles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbBookings.map((b, idx) => (
                        <tr key={idx} style={styles.tr}>
                          <td style={styles.td}>{b.travel_date}</td>
                          <td style={styles.td}>{formatAdminPrice(b.total_price)}</td>
                          <td style={styles.td}>{b.num_travelers} travelers</td>
                          <td style={styles.td}><StatusBadge status={b.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Active Custom Quotations Negotiations Feed */}
              <div style={styles.section}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E3A8A', marginBottom: 16 }}>Live Custom Quotations & Negotiations</h3>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Quotation ID</th>
                      <th style={styles.th}>Traveler</th>
                      <th style={styles.th}>Guide</th>
                      <th style={styles.th}>Tour Name</th>
                      <th style={styles.th}>Bidding Price</th>
                      <th style={styles.th}>Negotiation Round</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeNegotiations.map((n, idx) => (
                      <tr key={idx} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: 700 }}>{n.id}</td>
                        <td style={styles.td}>{n.traveler}</td>
                        <td style={styles.td}>{n.guide}</td>
                        <td style={styles.td}>{n.tourName}</td>
                        <td style={{ ...styles.td, fontWeight: 600 }}>{formatAdminPrice(n.currentQuote)}/hr (Initial: {formatAdminPrice(n.initialRate)})</td>
                        <td style={styles.td}>Round {n.round}</td>
                        <td style={styles.td}>
                          <span style={{
                            padding: '3px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                            background: n.status === 'accepted' ? '#DCFCE7' : n.status === 'pending_guide' ? '#FEF3C7' : '#FEE2E2',
                            color: n.status === 'accepted' ? '#15803D' : n.status === 'pending_guide' ? '#B45309' : '#B91C1C'
                          }}>
                            {n.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
          })()}

          {/* TAB: ACTIVE NEGOTIATIONS */}
          {activeTab === 'negotiations' && (
            <div>
              {/* If detail view is open */}
              {selectedNegotiation ? (
                <div>
                  {/* Back Button */}
                  <button
                    onClick={() => { setSelectedNegotiation(null); setNegotiationAdminNote(''); }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', marginBottom: 16, padding: 0 }}
                  >
                    <ChevronLeft size={16} /> Back to All Negotiations
                  </button>

                  {/* Header Card */}
                  <div style={{
                    background: 'linear-gradient(135deg, #1A1F5E 0%, #252C7A 60%, #0EA5E9 100%)',
                    borderRadius: '16px', padding: '24px 28px', color: '#FFFFFF', marginBottom: 20,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{selectedNegotiation.id}</span>
                        {selectedNegotiation.flagged && (
                          <span style={{ background: 'rgba(239,68,68,0.25)', color: '#FCA5A5', padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700 }}>🚩 FLAGGED</span>
                        )}
                        {selectedNegotiation.frozen && (
                          <span style={{ background: 'rgba(59,130,246,0.25)', color: '#93C5FD', padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700 }}>❄️ FROZEN</span>
                        )}
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, opacity: 0.95 }}>{selectedNegotiation.tourName}</div>
                      <div style={{ fontSize: '0.82rem', opacity: 0.7, marginTop: 4 }}>{selectedNegotiation.destination} • {selectedNegotiation.guests} Guest(s) • {selectedNegotiation.duration}</div>
                      <div style={{ fontSize: '0.78rem', opacity: 0.6, marginTop: 4 }}>Created: {selectedNegotiation.createdAt}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Current Price</div>
                      <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{formatAdminPrice(selectedNegotiation.currentQuote)}<span style={{ fontSize: '0.9rem', opacity: 0.7 }}>/hr</span></div>
                      <span style={{
                        display: 'inline-block', marginTop: 6,
                        padding: '4px 14px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                        background:
                          selectedNegotiation.status === 'accepted' ? 'rgba(34,197,94,0.2)' :
                          selectedNegotiation.status === 'cancelled' || selectedNegotiation.status === 'force_closed' ? 'rgba(239,68,68,0.2)' :
                          'rgba(255,255,255,0.15)',
                        color:
                          selectedNegotiation.status === 'accepted' ? '#86EFAC' :
                          selectedNegotiation.status === 'cancelled' || selectedNegotiation.status === 'force_closed' ? '#FCA5A5' : '#FFFFFF'
                      }}>
                        {selectedNegotiation.status === 'pending_guide' ? '⏳ Awaiting Guide' :
                         selectedNegotiation.status === 'pending_traveler' ? '⏳ Awaiting Traveler' :
                         selectedNegotiation.status === 'accepted' ? '✅ Deal Closed' :
                         selectedNegotiation.status === 'cancelled' ? '❌ Cancelled' :
                         selectedNegotiation.status === 'force_closed' ? '🔒 Force Closed' :
                         selectedNegotiation.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                    {/* Traveler Info */}
                    <div style={styles.section}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E3A8A', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <User size={14} /> Traveler Details
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.82rem' }}>
                        <div><span style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600, display: 'block' }}>NAME</span><strong>{selectedNegotiation.traveler}</strong></div>
                        <div><span style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600, display: 'block' }}>EMAIL</span><strong style={{ color: '#0284C7' }}>{selectedNegotiation.travelerEmail}</strong></div>
                        <div><span style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600, display: 'block' }}>NATIONALITY</span><strong>{selectedNegotiation.travelerNationality}</strong></div>
                        <div><span style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600, display: 'block' }}>INITIAL OFFER</span><strong style={{ color: '#22C55E' }}>{formatAdminPrice(selectedNegotiation.initialRate)}/hr</strong></div>
                      </div>
                    </div>
                    {/* Guide Info */}
                    <div style={styles.section}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E3A8A', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Shield size={14} /> Guide Details
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.82rem' }}>
                        <div><span style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600, display: 'block' }}>NAME</span><strong>{selectedNegotiation.guide}</strong></div>
                        <div><span style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600, display: 'block' }}>EMAIL</span><strong style={{ color: '#0284C7' }}>{selectedNegotiation.guideEmail}</strong></div>
                        <div><span style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600, display: 'block' }}>CITY</span><strong>{selectedNegotiation.guideCity}</strong></div>
                        <div><span style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600, display: 'block' }}>ROUNDS</span><strong>{selectedNegotiation.round}</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Trip Details Row */}
                  <div style={{ ...styles.section, marginBottom: 20 }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E3A8A', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={14} /> Trip Details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, fontSize: '0.82rem' }}>
                      <div><span style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600, display: 'block' }}>TOUR DATE</span><strong style={{ color: '#0097A7' }}>{selectedNegotiation.tourDate}</strong></div>
                      <div><span style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600, display: 'block' }}>DURATION</span><strong>{selectedNegotiation.duration}</strong></div>
                      <div><span style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600, display: 'block' }}>PICK-UP</span><strong>{selectedNegotiation.pickupTime} @ {selectedNegotiation.pickupPoint}</strong></div>
                      <div><span style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600, display: 'block' }}>DROP-OFF</span><strong>{selectedNegotiation.dropoffTime} @ {selectedNegotiation.dropoffPoint}</strong></div>
                    </div>
                    <div style={{ marginTop: 12, borderTop: '1px dashed #E2E8F0', paddingTop: 10 }}>
                      <span style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>🗺️ ITINERARY</span>
                      <strong style={{ color: '#475569', fontSize: '0.82rem', lineHeight: 1.5 }}>{selectedNegotiation.itinerary}</strong>
                    </div>
                  </div>

                  {/* Admin Action Toolbar */}
                  <div style={{ ...styles.section, marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1E3A8A', marginRight: 8 }}>Admin Actions:</span>
                    <button
                      onClick={() => handleToggleFlagNegotiation(selectedNegotiation.id)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: selectedNegotiation.flagged ? '#FEE2E2' : '#FFF7ED', color: selectedNegotiation.flagged ? '#B91C1C' : '#C2410C',
                        border: `1px solid ${selectedNegotiation.flagged ? '#FECACA' : '#FED7AA'}`, borderRadius: 8, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      <Flag size={13} /> {selectedNegotiation.flagged ? 'Remove Flag' : 'Flag for Review'}
                    </button>
                    <button
                      onClick={() => handleToggleFreezeNegotiation(selectedNegotiation.id)}
                      disabled={selectedNegotiation.status === 'accepted' || selectedNegotiation.status === 'cancelled' || selectedNegotiation.status === 'force_closed'}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: selectedNegotiation.frozen ? '#DBEAFE' : '#F0F9FF', color: selectedNegotiation.frozen ? '#1D4ED8' : '#0369A1',
                        border: `1px solid ${selectedNegotiation.frozen ? '#93C5FD' : '#BAE6FD'}`, borderRadius: 8, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700,
                        cursor: selectedNegotiation.status === 'accepted' || selectedNegotiation.status === 'cancelled' || selectedNegotiation.status === 'force_closed' ? 'not-allowed' : 'pointer',
                        opacity: selectedNegotiation.status === 'accepted' || selectedNegotiation.status === 'cancelled' || selectedNegotiation.status === 'force_closed' ? 0.5 : 1
                      }}
                    >
                      {selectedNegotiation.frozen ? <><Play size={13} /> Unfreeze</> : <><Pause size={13} /> Freeze Negotiation</>}
                    </button>
                    <button
                      onClick={() => handleOverridePrice(selectedNegotiation.id)}
                      disabled={selectedNegotiation.status === 'cancelled' || selectedNegotiation.status === 'force_closed'}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE', borderRadius: 8, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700,
                        cursor: selectedNegotiation.status === 'cancelled' || selectedNegotiation.status === 'force_closed' ? 'not-allowed' : 'pointer',
                        opacity: selectedNegotiation.status === 'cancelled' || selectedNegotiation.status === 'force_closed' ? 0.5 : 1
                      }}
                    >
                      <DollarSign size={13} /> Override Price
                    </button>
                    <button
                      onClick={() => handleForceCloseNegotiation(selectedNegotiation.id)}
                      disabled={selectedNegotiation.status === 'accepted' || selectedNegotiation.status === 'cancelled' || selectedNegotiation.status === 'force_closed'}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 8, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700,
                        cursor: selectedNegotiation.status === 'accepted' || selectedNegotiation.status === 'cancelled' || selectedNegotiation.status === 'force_closed' ? 'not-allowed' : 'pointer',
                        opacity: selectedNegotiation.status === 'accepted' || selectedNegotiation.status === 'cancelled' || selectedNegotiation.status === 'force_closed' ? 0.5 : 1
                      }}
                    >
                      <XCircle size={13} /> Force Close
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {/* Negotiation Timeline */}
                    <div style={styles.section}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E3A8A', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Activity size={14} /> Bidding Timeline (Round {selectedNegotiation.round})
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {(selectedNegotiation.timeline || []).map((evt: any, idx: number) => {
                          const isLast = idx === (selectedNegotiation.timeline || []).length - 1;
                          const isTraveler = evt.type.startsWith('traveler');
                          const isAdmin = evt.type.startsWith('admin');
                          const bgColor = isAdmin ? '#FEF3C7' : isTraveler ? '#DBEAFE' : '#E0F2FE';
                          const dotColor = isAdmin ? '#F59E0B' : isTraveler ? '#2563EB' : '#0284C7';
                          const labelMap: Record<string, string> = {
                            'traveler_offer': '💬 Traveler Offer',
                            'guide_quote': '📤 Guide Quote',
                            'traveler_counter': '🔄 Traveler Counter',
                            'guide_counter': '🔄 Guide Counter',
                            'guide_accept': '✅ Guide Accepted',
                            'traveler_accept': '✅ Traveler Accepted',
                            'traveler_cancel': '❌ Traveler Cancelled',
                            'guide_cancel': '❌ Guide Cancelled',
                            'admin_override': '⚡ Admin Price Override',
                            'admin_force_close': '🔒 Admin Force-Closed'
                          };
                          return (
                            <div key={idx}>
                              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: dotColor, border: '2px solid #FFFFFF', boxShadow: `0 0 0 2px ${dotColor}40`, flexShrink: 0 }} />
                                  {!isLast && <div style={{ width: 2, height: 40, background: '#E2E8F0', marginTop: 2 }} />}
                                </div>
                                <div style={{ flex: 1, paddingBottom: isLast ? 0 : 12 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: dotColor }}>{labelMap[evt.type] || evt.type}</span>
                                    <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#334155' }}>{formatAdminPrice(evt.rate)}/hr</span>
                                  </div>
                                  <div style={{ background: bgColor, borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }}>
                                    {evt.message}
                                  </div>
                                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: 4 }}>{evt.time}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Admin Notes Panel */}
                    <div style={styles.section}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E3A8A', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FileText size={14} /> Admin Notes & Activity Log
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto', marginBottom: 12 }}>
                        {(selectedNegotiation.adminNotes || []).length === 0 ? (
                          <p style={{ color: '#94A3B8', fontSize: '0.82rem', fontStyle: 'italic' }}>No admin notes yet.</p>
                        ) : (
                          (selectedNegotiation.adminNotes || []).map((note: string, idx: number) => (
                            <div key={idx} style={{
                              background: note.includes('FORCE-CLOSED') ? '#FEF2F2' : note.includes('FROZEN') ? '#EFF6FF' : note.includes('Flagged') ? '#FFF7ED' : '#F8FAFC',
                              border: `1px solid ${note.includes('FORCE-CLOSED') ? '#FECACA' : note.includes('FROZEN') ? '#BFDBFE' : note.includes('Flagged') ? '#FED7AA' : '#E2E8F0'}`,
                              borderRadius: 8, padding: '8px 12px', fontSize: '0.78rem', color: '#475569', lineHeight: 1.4
                            }}>
                              {note}
                            </div>
                          ))
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          value={negotiationAdminNote}
                          onChange={e => setNegotiationAdminNote(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleAddNegotiationNote(selectedNegotiation.id); }}
                          placeholder="Add admin note..."
                          style={{ flex: 1, border: '1px solid #CBD5E1', borderRadius: 8, padding: '8px 12px', fontSize: '0.82rem', outline: 'none' }}
                        />
                        <button
                          onClick={() => handleAddNegotiationNote(selectedNegotiation.id)}
                          style={{ background: 'var(--navy)', color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Plus size={14} /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* List View */
                <div style={styles.section}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E3A8A', margin: 0 }}>
                      Active Negotiations ({activeNegotiations.length})
                    </h3>
                    <input
                      type="text"
                      placeholder="Search by ID, traveler, guide, tour..."
                      value={negotiationSearch}
                      onChange={e => setNegotiationSearch(e.target.value)}
                      style={{ border: '1px solid #CBD5E1', borderRadius: 8, padding: '8px 14px', fontSize: '0.82rem', width: 280, outline: 'none' }}
                    />
                  </div>

                  {/* Filter Tabs */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                    {(['All', 'Active', 'Accepted', 'Cancelled', 'Flagged'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setNegotiationFilterTab(tab)}
                        style={{
                          padding: '6px 16px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                          border: negotiationFilterTab === tab ? '2px solid #1E3A8A' : '1px solid #CBD5E1',
                          background: negotiationFilterTab === tab ? '#1E3A8A' : '#FFFFFF',
                          color: negotiationFilterTab === tab ? '#FFFFFF' : '#475569',
                          transition: 'all 0.15s'
                        }}
                      >
                        {tab}
                        {tab === 'All' && ` (${activeNegotiations.length})`}
                        {tab === 'Active' && ` (${activeNegotiations.filter(n => n.status === 'pending_guide' || n.status === 'pending_traveler').length})`}
                        {tab === 'Accepted' && ` (${activeNegotiations.filter(n => n.status === 'accepted').length})`}
                        {tab === 'Cancelled' && ` (${activeNegotiations.filter(n => n.status === 'cancelled' || n.status === 'force_closed').length})`}
                        {tab === 'Flagged' && ` (${activeNegotiations.filter(n => n.flagged).length})`}
                      </button>
                    ))}
                  </div>

                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Quotation ID</th>
                        <th style={styles.th}>Traveler</th>
                        <th style={styles.th}>Guide</th>
                        <th style={styles.th}>Tour Name</th>
                        <th style={styles.th}>Initial → Current</th>
                        <th style={styles.th}>Rounds</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Flags</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeNegotiations
                        .filter(n => {
                          const search = negotiationSearch.toLowerCase();
                          const matchesSearch = !search ||
                            n.id.toLowerCase().includes(search) ||
                            n.traveler.toLowerCase().includes(search) ||
                            n.guide.toLowerCase().includes(search) ||
                            n.tourName.toLowerCase().includes(search) ||
                            (n.destination || '').toLowerCase().includes(search);
                          let matchesFilter = true;
                          if (negotiationFilterTab === 'Active') matchesFilter = n.status === 'pending_guide' || n.status === 'pending_traveler';
                          else if (negotiationFilterTab === 'Accepted') matchesFilter = n.status === 'accepted';
                          else if (negotiationFilterTab === 'Cancelled') matchesFilter = n.status === 'cancelled' || n.status === 'force_closed';
                          else if (negotiationFilterTab === 'Flagged') matchesFilter = n.flagged === true;
                          return matchesSearch && matchesFilter;
                        })
                        .map((n: any) => (
                          <tr key={n.id} style={{ ...styles.tr, background: n.flagged ? '#FFFBEB' : undefined }}>
                            <td style={{ ...styles.td, fontWeight: 700 }}>{n.id}</td>
                            <td style={styles.td}>
                              <div style={{ fontWeight: 600 }}>{n.traveler}</div>
                              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{n.travelerEmail}</div>
                            </td>
                            <td style={styles.td}>
                              <div style={{ fontWeight: 600 }}>{n.guide}</div>
                              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{n.guideCity}</div>
                            </td>
                            <td style={styles.td}>{n.tourName}</td>
                            <td style={{ ...styles.td, fontWeight: 600 }}>
                              <span style={{ color: '#64748B' }}>{formatAdminPrice(n.initialRate)}</span>
                              <span style={{ margin: '0 4px', color: '#CBD5E1' }}>→</span>
                              <span style={{ color: n.currentQuote > n.initialRate ? '#EF4444' : '#22C55E', fontWeight: 800 }}>{formatAdminPrice(n.currentQuote)}/hr</span>
                            </td>
                            <td style={{ ...styles.td, textAlign: 'center' }}>
                              <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>{n.round}</span>
                            </td>
                            <td style={styles.td}>
                              <span style={{
                                padding: '3px 10px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                                background:
                                  n.status === 'accepted' ? '#DCFCE7' :
                                  n.status === 'pending_guide' ? '#FEF3C7' :
                                  n.status === 'pending_traveler' ? '#E0F2FE' :
                                  n.status === 'cancelled' || n.status === 'force_closed' ? '#FEE2E2' : '#F1F5F9',
                                color:
                                  n.status === 'accepted' ? '#15803D' :
                                  n.status === 'pending_guide' ? '#B45309' :
                                  n.status === 'pending_traveler' ? '#0369A1' :
                                  n.status === 'cancelled' || n.status === 'force_closed' ? '#B91C1C' : '#475569'
                              }}>
                                {n.status === 'pending_guide' ? 'Awaiting Guide' :
                                 n.status === 'pending_traveler' ? 'Awaiting Traveler' :
                                 n.status === 'force_closed' ? 'Force Closed' :
                                 n.status}
                              </span>
                            </td>
                            <td style={styles.td}>
                              {n.flagged && <span title="Flagged for review" style={{ color: '#EF4444', cursor: 'help' }}>🚩</span>}
                              {n.frozen && <span title="Frozen by admin" style={{ marginLeft: 4, color: '#3B82F6', cursor: 'help' }}>❄️</span>}
                              {!n.flagged && !n.frozen && <span style={{ color: '#CBD5E1' }}>—</span>}
                            </td>
                            <td style={styles.td}>
                              <button
                                onClick={() => { setSelectedNegotiation(n); setNegotiationAdminNote(''); }}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 4,
                                  background: 'var(--navy)', color: '#FFFFFF', border: 'none', borderRadius: 6,
                                  padding: '5px 12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                                }}
                              >
                                <Eye size={12} /> View Details
                              </button>
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                  {activeNegotiations.filter(n => {
                    const search = negotiationSearch.toLowerCase();
                    const matchesSearch = !search || n.id.toLowerCase().includes(search) || n.traveler.toLowerCase().includes(search) || n.guide.toLowerCase().includes(search) || n.tourName.toLowerCase().includes(search);
                    let matchesFilter = true;
                    if (negotiationFilterTab === 'Active') matchesFilter = n.status === 'pending_guide' || n.status === 'pending_traveler';
                    else if (negotiationFilterTab === 'Accepted') matchesFilter = n.status === 'accepted';
                    else if (negotiationFilterTab === 'Cancelled') matchesFilter = n.status === 'cancelled' || n.status === 'force_closed';
                    else if (negotiationFilterTab === 'Flagged') matchesFilter = n.flagged === true;
                    return matchesSearch && matchesFilter;
                  }).length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}>
                      <Handshake size={36} style={{ marginBottom: 8, opacity: 0.4 }} />
                      <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>No negotiations match your search or filter.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div style={styles.section}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E3A8A', margin: 0 }}>Registered System Users</h3>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '8px 12px', fontSize: '0.85rem', width: '220px' }}
                />
              </div>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email Address</th>
                    <th style={styles.th}>Phone Number</th>
                    <th style={styles.th}>Access Role</th>
                    <th style={styles.th}>Joined Date</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList
                    .filter(u => 
                      u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
                      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                      (u.phone_number || '').includes(userSearch)
                    )
                    .map((usr) => (
                      <tr key={usr.id} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: 700 }}>{usr.name}</td>
                        <td style={styles.td}>{usr.email}</td>
                        <td style={{ ...styles.td, color: '#475569', fontWeight: 600 }}>
                          {usr.phone_number || (usr.role === 'guide' ? '+81 87-0503-2459' : '+91 98765-43210')}
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            padding: '3px 8px', borderRadius: 4, fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase',
                            background: usr.role === 'guide' ? 'rgba(249,115,22,0.1)' : 'rgba(6,182,212,0.1)',
                            color: usr.role === 'guide' ? 'var(--orange)' : 'var(--teal)'
                          }}>
                            {usr.role}
                          </span>
                        </td>
                        <td style={styles.td}>{new Date(usr.created_at).toLocaleDateString()}</td>
                        <td style={styles.td}>
                          <button
                            onClick={() => deleteUser(usr.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: DESTINATIONS */}
          {activeTab === 'destinations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div style={styles.section}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E3A8A', marginBottom: 16 }}>Add New Destination</h3>
                <form onSubmit={addDestination} style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>City</label>
                    <input
                      type="text"
                      placeholder="e.g. Kyoto"
                      value={newCity}
                      onChange={e => setNewCity(e.target.value)}
                      style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '10px', fontSize: '0.88rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>Country</label>
                    <input
                      type="text"
                      placeholder="e.g. Japan"
                      value={newCountry}
                      onChange={e => setNewCountry(e.target.value)}
                      style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '10px', fontSize: '0.88rem' }}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{ background: '#FF385C', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '12px 24px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Add Location
                  </button>
                </form>
              </div>

              <div style={styles.section}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E3A8A', marginBottom: 20 }}>Managed Locations</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                  {dbDestinations.map(d => (
                    <div key={d.id} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', background: '#F8FAFC' }}>
                      <h4 style={{ margin: '0 0 4px', fontWeight: 700 }}>{d.name}</h4>
                      <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#64748B' }}>{d.country}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#0F172A' }}>
                        Revenue: {formatAdminPrice(dbBookings.filter(b => b.destination === d.name && b.status === 'completed').reduce((acc, curr) => acc + (curr.totalPrice || 0), 0))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: LISTINGS APPROVAL */}
          {activeTab === 'listings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div style={styles.section}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E3A8A', marginBottom: 16 }}>
                  Pending Guide Listings ({listings.filter(l => l.status === 'pending').length})
                </h3>
                {listings.filter(l => l.status === 'pending').length === 0 ? (
                  <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>No pending listing approvals.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                    {listings.filter(l => l.status === 'pending').map(l => (
                      <div key={l.id} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700 }}>ID: {l.id}</span>
                            <span style={{
                              padding: '3px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                              background: '#FEF3C7', color: '#B45309'
                            }}>
                              {l.status}
                            </span>
                          </div>
                          <h4 style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '1.05rem', color: 'var(--navy)' }}>{l.guideName}</h4>
                          <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#64748B' }}>📍 {l.city1}, {l.stayingCountry}</p>
                          <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#64748B' }}>💵 Price: {formatAdminPrice(l.price, true)}/hr</p>
                          <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#475569', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{l.description}</p>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <button
                            onClick={() => {
                              setSelectedListingDetail(l);
                              setActiveDocCarouselIndex(0);
                            }}
                            style={{
                              background: 'var(--navy)', color: '#FFFFFF', border: 'none', borderRadius: '8px',
                              padding: '8px 12px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                            }}
                          >
                            <Eye size={14} /> Review Details & IDs
                          </button>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => approveListing(l.id)}
                              style={{
                                background: '#22C55E', color: '#FFFFFF', border: 'none', borderRadius: '8px',
                                padding: '8px 12px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', flex: 1
                              }}
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => rejectListing(l.id)}
                              style={{
                                background: '#EF4444', color: '#FFFFFF', border: 'none', borderRadius: '8px',
                                padding: '8px 12px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', flex: 1
                              }}
                            >
                              ✗ Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* LISTING DETAILS MODAL */}
              {selectedListingDetail && (
                <div style={{
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                  padding: 24
                }}>
                  <div style={{
                    backgroundColor: '#FFFFFF', borderRadius: '16px', width: '100%', maxWidth: '850px',
                    maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    display: 'flex', flexDirection: 'column'
                  }}>
                    {/* Modal Header */}
                    <div style={{
                      padding: '20px 24px', borderBottom: '1px solid #E2E8F0',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      position: 'sticky', top: 0, backgroundColor: '#FFFFFF', zIndex: 10
                    }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)' }}>
                          Review Guide Listing Approval Request
                        </h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                          Guide: <strong>{selectedListingDetail.guideName}</strong> ({selectedListingDetail.guideEmail})
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedListingDetail(null)}
                        style={{
                          background: 'none', border: 'none', fontSize: '1.5rem', fontWeight: 600,
                          color: '#94A3B8', cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                      {/* Grid: Details & Documents */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        
                        {/* Column 1: Verification IDs Carousel */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            📁 Verification Documents & IDs
                          </h4>
                          
                          {/* Setup carousel data */}
                          {(() => {
                            const docs = [
                              { type: 'Passport (Front)', url: selectedListingDetail.passportFrontUrl || 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=600&auto=format&fit=crop&q=60' },
                              { type: 'Passport (Back)', url: selectedListingDetail.passportBackUrl || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=60' },
                              { type: 'Visa Page', url: selectedListingDetail.visaUrl || 'https://images.unsplash.com/photo-1568051243851-f9b136146e97?w=600&auto=format&fit=crop&q=60' },
                              { type: 'Local ID (Front)', url: selectedListingDetail.localIdFrontUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=60' },
                              { type: 'Local ID (Back)', url: selectedListingDetail.localIdBackUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=60' },
                              { type: 'Passbook (Front)', url: selectedListingDetail.passbookFrontUrl || 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=600&auto=format&fit=crop&q=60' },
                              { type: 'Passbook (Back)', url: selectedListingDetail.passbookBackUrl || 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=600&auto=format&fit=crop&q=60' }
                            ];
                            const currentDoc = docs[activeDocCarouselIndex];

                            return (
                              <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#F8FAFC' }}>
                                {/* Doc Label & Navigation */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy)' }}>
                                      {currentDoc.type}
                                    </span>
                                    <button
                                      onClick={() => {
                                        // Trigger browser download by creating temporary link
                                        const link = document.createElement('a');
                                        link.href = currentDoc.url;
                                        link.download = `${selectedListingDetail.guideName.replace(/\s+/g, '_')}_${currentDoc.type.replace(/\s+/g, '_')}.jpg`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                      }}
                                      style={{
                                        background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '4px',
                                        padding: '2px 6px', fontSize: '0.7rem', fontWeight: 700, color: '#475569',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                                      }}
                                      title="Download this document image"
                                    >
                                      <Download size={10} /> Download
                                    </button>
                                  </div>
                                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                                    {activeDocCarouselIndex + 1} of {docs.length}
                                  </span>
                                </div>

                                {/* Carousel Image Display Area */}
                                <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 12 }}>
                                  <img 
                                    src={currentDoc.url} 
                                    alt={currentDoc.type} 
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} 
                                  />
                                </div>

                                {/* Carousel Controls */}
                                <div style={{ display: 'flex', borderTop: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
                                  <button
                                    onClick={() => setActiveDocCarouselIndex(prev => (prev === 0 ? docs.length - 1 : prev - 1))}
                                    style={{ flex: 1, padding: '10px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#0F172A', fontWeight: 700, fontSize: '0.8rem', borderRight: '1px solid #E2E8F0' }}
                                  >
                                    ◀ Prev ID
                                  </button>
                                  <button
                                    onClick={() => {
                                      // Download all files helper
                                      docs.forEach((d, idx) => {
                                        setTimeout(() => {
                                          const link = document.createElement('a');
                                          link.href = d.url;
                                          link.download = `${selectedListingDetail.guideName.replace(/\s+/g, '_')}_ID_${idx+1}_${d.type.replace(/\s+/g, '_')}.jpg`;
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                        }, idx * 250);
                                      });
                                    }}
                                    style={{
                                      padding: '10px', border: 'none', background: '#F8FAFC', cursor: 'pointer',
                                      color: '#0284C7', fontWeight: 700, fontSize: '0.78rem', borderRight: '1px solid #E2E8F0',
                                      display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center'
                                    }}
                                    title="Download all 7 documents"
                                  >
                                    📥 Download All
                                  </button>
                                  <button
                                    onClick={() => setActiveDocCarouselIndex(prev => (prev === docs.length - 1 ? 0 : prev + 1))}
                                    style={{ flex: 1, padding: '10px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#0F172A', fontWeight: 700, fontSize: '0.8rem' }}
                                  >
                                    Next ID ▶
                                  </button>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Quick indicators */}
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 4 }}>
                            {[0, 1, 2, 3, 4, 5, 6].map(idx => (
                              <button
                                key={idx}
                                onClick={() => setActiveDocCarouselIndex(idx)}
                                style={{
                                  width: 8, height: 8, borderRadius: '50%', border: 'none',
                                  backgroundColor: activeDocCarouselIndex === idx ? 'var(--navy)' : '#CBD5E1',
                                  cursor: 'pointer', padding: 0
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Column 2: Core Details Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          <div>
                            <h4 style={{ margin: '0 0 8px', fontSize: '0.92rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              📍 Service Area & Address Details
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: '#F8FAFC', padding: 12, borderRadius: 8, fontSize: '0.82rem' }}>
                              <p style={{ margin: 0 }}><strong>Staying Country:</strong> {selectedListingDetail.stayingCountry}</p>
                              <p style={{ margin: 0 }}><strong>Nationality:</strong> {selectedListingDetail.nationality}</p>
                              <p style={{ margin: 0 }}><strong>Languages:</strong> <span style={{ color: '#0284C7', fontWeight: 600 }}>{selectedListingDetail.languages || 'Not specified'}</span></p>
                              <p style={{ margin: 0 }}><strong>Current Address:</strong> {selectedListingDetail.currentAddress} (PIN: {selectedListingDetail.pin1})</p>
                              <p style={{ margin: 0 }}><strong>Origin Address:</strong> {selectedListingDetail.originAddress} (PIN: {selectedListingDetail.pin2})</p>
                              <p style={{ margin: 0 }}><strong>Operating Cities:</strong> {selectedListingDetail.city1} {selectedListingDetail.city2 ? `& ${selectedListingDetail.city2}` : ''}</p>
                              <p style={{ margin: 0 }}><strong>Tourist Spots Cover list:</strong> <span style={{ color: '#0284C7', fontWeight: 600 }}>{selectedListingDetail.locations}</span></p>
                            </div>
                          </div>

                          <div>
                            <h4 style={{ margin: '0 0 8px', fontSize: '0.92rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              🏦 Verified Bank Accounts
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: '#F0FDF4', border: '1px solid #DCFCE7', padding: 12, borderRadius: 8, fontSize: '0.82rem', color: '#15803D' }}>
                              <p style={{ margin: 0 }}><strong>Beneficiary Holder:</strong> {selectedListingDetail.holderName}</p>
                              <p style={{ margin: 0 }}><strong>Bank Name:</strong> {selectedListingDetail.bankName}</p>
                              <p style={{ margin: 0 }}><strong>Account Number:</strong> {selectedListingDetail.accNo}</p>
                              <p style={{ margin: 0 }}><strong>Branch:</strong> {selectedListingDetail.branch}</p>
                              <p style={{ margin: 0 }}><strong>IFSC / Routing Code:</strong> {selectedListingDetail.ifsc}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description & Package Config */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid #F1F5F9', paddingTop: 20 }}>
                        <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          📜 Package Description & Tour Config
                        </h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: '#F8FAFC', padding: 14, borderRadius: 8, fontSize: '0.85rem' }}>
                          <div>
                            <p style={{ margin: '0 0 6px' }}><strong>Hourly Package Price:</strong> <span style={{ color: '#06B6D4', fontWeight: 700, fontSize: '0.95rem' }}>{formatAdminPrice(selectedListingDetail.price, true)}/hr</span></p>
                            <p style={{ margin: '0 0 6px' }}><strong>Default Meeting Pick-up:</strong> {selectedListingDetail.pickupPoint} at <strong>{selectedListingDetail.pickupTime}</strong></p>
                          </div>
                          <div>
                            <p style={{ margin: '0 0 6px' }}><strong>Default Drop-off Point:</strong> {selectedListingDetail.dropPoint} at <strong>{selectedListingDetail.dropTime}</strong></p>
                            <p style={{ margin: '0 0 6px' }}><strong>Submitted Date:</strong> {new Date(selectedListingDetail.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 8, fontSize: '0.85rem', lineHeight: '1.5' }}>
                          <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#475569' }}>Detailed Description:</p>
                          <p style={{ margin: 0, color: '#334155', whiteSpace: 'pre-line' }}>{selectedListingDetail.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div style={{
                      padding: '16px 24px', borderTop: '1px solid #E2E8F0',
                      display: 'flex', justifyContent: 'flex-end', gap: 12,
                      position: 'sticky', bottom: 0, backgroundColor: '#FFFFFF', zIndex: 10
                    }}>
                      <button
                        onClick={() => setSelectedListingDetail(null)}
                        style={{
                          background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '8px',
                          padding: '10px 20px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer'
                        }}
                      >
                        {selectedListingDetail.status === 'pending' ? 'Cancel' : 'Close'}
                      </button>
                      
                      {selectedListingDetail.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              rejectListing(selectedListingDetail.id);
                              setSelectedListingDetail(null);
                            }}
                            style={{
                              background: '#EF4444', color: '#FFFFFF', border: 'none', borderRadius: '8px',
                              padding: '10px 20px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer'
                            }}
                          >
                            Reject Listing
                          </button>
                          <button
                            onClick={() => {
                              approveListing(selectedListingDetail.id);
                              setSelectedListingDetail(null);
                            }}
                            style={{
                              background: '#22C55E', color: '#FFFFFF', border: 'none', borderRadius: '8px',
                              padding: '10px 20px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer'
                            }}
                          >
                            ✓ Approve Listing
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* All Listings Status */}
              <div style={styles.section}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E3A8A', marginBottom: 16 }}>
                  All Listings Archive
                </h3>
                {listings.length === 0 ? (
                  <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>No listings created in the system yet.</p>
                ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Guide Name</th>
                        <th style={styles.th}>Location</th>
                        <th style={styles.th}>Price</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Visibility</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map(l => (
                        <tr key={l.id} style={styles.tr}>
                          <td style={{ ...styles.td, fontWeight: 700 }}>{l.id}</td>
                          <td style={styles.td}>{l.guideName}</td>
                          <td style={styles.td}>{l.city1}, {l.stayingCountry}</td>
                          <td style={styles.td}>{formatAdminPrice(l.price, true)}/hr</td>
                          <td style={styles.td}>
                            <span style={{
                              padding: '3px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700,
                              background: l.status === 'approved' ? '#DCFCE7' : l.status === 'pending' ? '#FEF3C7' : '#FEE2E2',
                              color: l.status === 'approved' ? '#15803D' : l.status === 'pending' ? '#B45309' : '#B91C1C'
                            }}>
                              {l.status}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={{
                              padding: '3px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700,
                              background: l.enabled ? '#EFF6FF' : '#F3F4F6',
                              color: l.enabled ? '#1E40AF' : '#6B7280'
                            }}>
                              {l.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <button
                                onClick={() => toggleListingEnabled(l.id)}
                                style={{
                                  background: l.enabled ? '#FEE2E2' : '#DCFCE7',
                                  color: l.enabled ? '#DC2626' : '#16A34A',
                                  border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700,
                                  cursor: 'pointer', flex: 1
                                }}
                              >
                                {l.enabled ? 'Disable' : 'Enable'}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedListingDetail(l);
                                  setActiveDocCarouselIndex(0);
                                }}
                                style={{
                                  background: 'transparent', color: '#0284C7', border: '1px solid #0284C7',
                                  borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700,
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center'
                                }}
                              >
                                <Eye size={12} /> View Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: GUIDES MANAGEMENT */}
          {activeTab === 'guides' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              
              {/* Guides filter tabs and headers */}
              <div style={styles.section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E3A8A', margin: 0 }}>
                      Guides Management Portal
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                      Verify partners, audit applications, configure pricing models, or disable/delete accounts.
                    </p>
                  </div>
                  
                  {/* Category Filter Tabs & Search Bar */}
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Search name or city..."
                      value={guideSearch}
                      onChange={e => setGuideSearch(e.target.value)}
                      style={{
                        border: '1px solid #CBD5E1', borderRadius: '6px', padding: '8px 12px',
                        fontSize: '0.85rem', width: '220px', outline: 'none'
                      }}
                    />
                    <div style={{ display: 'flex', border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#F8FAFC' }}>
                      {(['All', 'Pending', 'Approved', 'Rejected'] as const).map(tab => {
                        const isSelected = guideFilterTab === tab;
                        return (
                          <button
                            key={tab}
                            onClick={() => setGuideFilterTab(tab)}
                            style={{
                              border: 'none',
                              background: isSelected ? 'var(--navy)' : 'transparent',
                              color: isSelected ? '#FFFFFF' : '#475569',
                              fontWeight: 700,
                              padding: '8px 16px',
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              transition: 'all 0.15s'
                            }}
                          >
                            {tab}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Table representation */}
                {(() => {
                  // Standardized row data merging registered users (who are guides) and application drafts
                  // Matching columns: Name, Phone Number, City - Country, Price, Submitted, Status, Actions
                  const allGuidesData = [
                    // Seed Guide 1
                    {
                      id: 'usr-default-shivashish',
                      name: 'Shivashish Chamoli',
                      phone: '+81 87-0503-2459',
                      location: 'Tachikawa, Japan',
                      price: 1450,
                      submitted: 'Jun 20, 2026',
                      status: 'approved',
                      userId: 'usr-default-shivashish'
                    },
                    // Seed Guide 2
                    {
                      id: 'guide-1',
                      name: 'Shrilakshmi Shetty',
                      phone: '+81 90-1234-5678',
                      location: 'Tokyo, Japan',
                      price: 500,
                      submitted: 'May 14, 2026',
                      status: 'approved',
                      userId: 'guide-1'
                    },
                    // Seed Guide 3
                    {
                      id: 'guide-4',
                      name: 'Mohammad Gafoor',
                      phone: '+81 80-9876-5432',
                      location: 'Tokyo, Japan',
                      price: 480,
                      submitted: 'Jun 12, 2026',
                      status: 'approved',
                      userId: 'guide-4'
                    },
                    // Applications merged
                    ...guideApplications.map(app => ({
                      id: app.id,
                      name: app.name,
                      phone: app.contactNumber || '+91 98765 43210',
                      location: `${app.cityName}, ${app.countryName}`,
                      price: 1200,
                      submitted: app.createdAt,
                      status: app.status,
                      userId: app.userId
                    }))
                  ];

                  // Filter based on selected category tab & search keyword (name/city)
                  const filteredGuides = allGuidesData.filter(g => {
                    const matchesCategory = guideFilterTab === 'All' || g.status.toLowerCase() === guideFilterTab.toLowerCase();
                    const matchesSearch = g.name.toLowerCase().includes(guideSearch.toLowerCase()) || g.location.toLowerCase().includes(guideSearch.toLowerCase());
                    return matchesCategory && matchesSearch;
                  });

                  if (filteredGuides.length === 0) {
                    return <p style={{ color: '#94A3B8', fontSize: '0.9rem', textAlign: 'center', padding: '24px 0' }}>No guides found matching details or "{guideFilterTab}" filter.</p>;
                  }

                  return (
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Name</th>
                          <th style={styles.th}>Phone Number</th>
                          <th style={styles.th}>City - Country</th>
                          <th style={styles.th}>Price</th>
                          <th style={styles.th}>Submitted Date</th>
                          <th style={styles.th}>Verified Status</th>
                          <th style={styles.th}>Recommended</th>
                          <th style={styles.th}>Status</th>
                          <th style={styles.th}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredGuides.map(g => {
                          const isVerified = verifiedGuideIds.includes(g.userId);
                          const isRecommended = recommendedGuideIds.includes(g.userId);
                          
                          // Check if disabled state is set locally
                          const isDisabled = localStorage.getItem(`routebyroot_guide_disabled_${g.userId}`) === 'true';

                          return (
                            <tr key={g.id} style={{ ...styles.tr, opacity: isDisabled ? 0.6 : 1 }}>
                              <td style={{ ...styles.td, fontWeight: 700 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                  {g.name}
                                  {isVerified && (
                                    <span 
                                      style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}
                                      title="Verified Stamp active on Traveler panel card"
                                    >
                                      ✓ Verified
                                    </span>
                                  )}
                                  {isRecommended && (
                                    <span 
                                      style={{ background: 'rgba(234,179,8,0.12)', color: '#D97706', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}
                                      title="Recommended by RouteByRoot"
                                    >
                                      ★ Recommended
                                    </span>
                                  )}
                                  {isDisabled && (
                                    <span style={{ background: '#EF444415', color: '#EF4444', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>
                                      Disabled
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td style={{ ...styles.td, color: '#475569', fontWeight: 600 }}>{g.phone}</td>
                              <td style={styles.td}>{g.location}</td>
                              <td style={{ ...styles.td, color: '#06B6D4', fontWeight: 700 }}>{formatAdminPrice(g.price as number, true)}/hr</td>
                              <td style={styles.td}>{g.submitted}</td>
                              
                              {/* Verified Stamp toggle badge column */}
                              <td style={styles.td}>
                                <button
                                  onClick={() => {
                                    let nextVerified: string[];
                                    if (isVerified) {
                                      nextVerified = verifiedGuideIds.filter(id => id !== g.userId);
                                      alert(`Removed verification badge from ${g.name}`);
                                    } else {
                                      nextVerified = [...verifiedGuideIds, g.userId];
                                      alert(`Assigned Verified badge to ${g.name}. Traveler panel cards updated.`);
                                    }
                                    setVerifiedGuideIds(nextVerified);
                                    localStorage.setItem('routebyroot_verified_guide_ids', JSON.stringify(nextVerified));
                                  }}
                                  style={{
                                    border: `1px solid ${isVerified ? '#22C55E' : '#CBD5E1'}`,
                                    background: isVerified ? '#F0FDF4' : 'transparent',
                                    color: isVerified ? '#16A34A' : '#64748B',
                                    padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  {isVerified ? '✓ Verified Partner' : 'Mark Verified'}
                                </button>
                              </td>

                              {/* Recommended Toggle Column */}
                              <td style={styles.td}>
                                <button
                                  onClick={() => {
                                    let nextRecommended: string[];
                                    if (isRecommended) {
                                      nextRecommended = recommendedGuideIds.filter(id => id !== g.userId);
                                      alert(`Removed recommendation from ${g.name}`);
                                    } else {
                                      nextRecommended = [...recommendedGuideIds, g.userId];
                                      alert(`Marked ${g.name} as Recommended. Traveler panel cards updated.`);
                                    }
                                    setRecommendedGuideIds(nextRecommended);
                                    localStorage.setItem('routebyroot_recommended_guide_ids', JSON.stringify(nextRecommended));
                                  }}
                                  style={{
                                    border: `1px solid ${isRecommended ? '#EAB308' : '#CBD5E1'}`,
                                    background: isRecommended ? '#FEF9C3' : 'transparent',
                                    color: isRecommended ? '#A16207' : '#64748B',
                                    padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  {isRecommended ? '★ Recommended' : 'Recommend'}
                                </button>
                              </td>

                              {/* Status Badge */}
                              <td style={styles.td}>
                                <span style={{
                                  padding: '3px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                                  background: g.status === 'approved' ? '#DCFCE7' : g.status === 'pending' ? '#FEF3C7' : '#FEE2E2',
                                  color: g.status === 'approved' ? '#15803D' : g.status === 'pending' ? '#B45309' : '#B91C1C'
                                }}>
                                  {g.status}
                                </span>
                              </td>

                              {/* Actions Column: View Review/Verify details, Disable Toggle, and Delete */}
                              <td style={styles.td}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                  
                                  {/* Review Application Details (if has application draft) */}
                                  {g.status === 'pending' && (
                                    <button
                                      onClick={() => {
                                        const app = guideApplications.find(a => a.id === g.id);
                                        if (app) setSelectedGuideApp(app);
                                      }}
                                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#06B6D4', fontWeight: 700, fontSize: '0.78rem' }}
                                      title="Review Documents"
                                    >
                                      Review
                                    </button>
                                  )}

                                  {/* Approve / Quick approval if pending */}
                                  {g.status === 'pending' && (
                                    <button
                                      onClick={() => handleVerifyGuide(g.userId, g.id)}
                                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#22C55E', fontWeight: 700, fontSize: '0.78rem' }}
                                    >
                                      Approve
                                    </button>
                                  )}

                                  {/* Disable Toggle Switch */}
                                  <button
                                    onClick={() => {
                                      const nextDisabled = !isDisabled;
                                      if (nextDisabled) {
                                        localStorage.setItem(`routebyroot_guide_disabled_${g.userId}`, 'true');
                                        alert(`Disabled guide listing service for ${g.name}. Traveler search results hidden.`);
                                      } else {
                                        localStorage.removeItem(`routebyroot_guide_disabled_${g.userId}`);
                                        alert(`Enabled guide listing service for ${g.name}. Listings restored.`);
                                      }
                                      // Force reload table view states
                                      loadData();
                                    }}
                                    style={{
                                      background: 'none', border: 'none', cursor: 'pointer',
                                      color: isDisabled ? '#10B981' : '#F59E0B', fontSize: '0.75rem', fontWeight: 700
                                    }}
                                    title={isDisabled ? 'Enable Partner Listings' : 'Disable Partner Listings'}
                                  >
                                    {isDisabled ? 'Enable' : 'Disable'}
                                  </button>

                                  {/* Delete Options Button */}
                                  <button
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete guide profile/application ${g.name}?`)) {
                                        // Delete from Applications
                                        const updatedApps = guideApplications.filter(a => a.id !== g.id);
                                        setGuideApplications(updatedApps);
                                        localStorage.setItem('routebyroot_guide_applications', JSON.stringify(updatedApps));

                                        // Delete verified badge
                                        const nextVerified = verifiedGuideIds.filter(id => id !== g.userId);
                                        setVerifiedGuideIds(nextVerified);
                                        localStorage.setItem('routebyroot_verified_guide_ids', JSON.stringify(nextVerified));
                                        
                                        // Delete recommended badge
                                        const nextRecs = recommendedGuideIds.filter(id => id !== g.userId);
                                        setRecommendedGuideIds(nextRecs);
                                        localStorage.setItem('routebyroot_recommended_guide_ids', JSON.stringify(nextRecs));
                                        
                                        // Delete disabled state
                                        localStorage.removeItem(`routebyroot_guide_disabled_${g.userId}`);

                                        // Also delete traveler role sync
                                        deleteUser(g.userId);
                                        
                                        alert('Guide partner deleted successfully.');
                                      }
                                    }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}
                                    title="Delete Guide & Application Profile"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 4: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div style={styles.section}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E3A8A', marginBottom: 20 }}>Bookings Database</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Booking ID</th>
                    <th style={styles.th}>Traveler ID</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dbBookings.map((b, idx) => (
                    <tr key={idx} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: 700 }}>BK-{b.id.slice(0, 5).toUpperCase()}</td>
                      <td style={styles.td}>{b.traveler_id}</td>
                      <td style={styles.td}>{b.travel_date}</td>
                      <td style={styles.td}>{formatAdminPrice(b.total_price)}</td>
                      <td style={styles.td}><StatusBadge status={b.status} /></td>
                    </tr>
                  ))}
                  {dbBookings.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: '#94A3B8' }}>No bookings created in the system yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: WITHDRAWALS */}
          {activeTab === 'withdrawals' && (
            <div style={styles.section}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E3A8A', marginBottom: 6 }}>Withdrawal Requests</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 20 }}>Review and process payouts requested by guide partners.</p>
              
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Request ID</th>
                    <th style={styles.th}>Guide Name</th>
                    <th style={styles.th}>Requested Amount</th>
                    <th style={styles.th}>Bank Account Details</th>
                    <th style={styles.th}>Request Date</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w, idx) => (
                    <tr key={idx} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: 700 }}>{w.id}</td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 600 }}>{w.guideName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{w.guideEmail}</div>
                      </td>
                      <td style={{ ...styles.td, fontWeight: 700, color: '#0F172A' }}>{formatAdminPrice(w.amount, true)}</td>
                      <td style={styles.td}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{w.bankName}</div>
                        <div style={{ fontSize: '0.78rem', color: '#475569' }}>Acc: {w.accNo} &bull; Holder: {w.holderName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>IFSC: {w.ifsc} &bull; Branch: {w.branch}</div>
                      </td>
                      <td style={styles.td}>{w.date}</td>
                      <td style={styles.td}>
                        <span style={{
                          padding: '3px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                          background: w.status === 'approved' ? '#DCFCE7' : w.status === 'pending' ? '#FEF3C7' : '#FEE2E2',
                          color: w.status === 'approved' ? '#15803D' : w.status === 'pending' ? '#B45309' : '#B91C1C'
                        }}>
                          {w.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {w.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => handleApproveWithdrawal(w.id)}
                              style={{ background: '#22C55E', color: '#FFF', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectWithdrawal(w.id)}
                              style={{ background: '#EF4444', color: '#FFF', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {withdrawals.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: '#94A3B8' }}>No withdrawal requests found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: LIVE OPERATIONS */}
          {activeTab === 'live-ops' && (
            <div style={styles.section}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E3A8A', marginBottom: 6 }}>Live Operations Room</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 20 }}>Real-time dashboard tracking ongoing trips and active live location sharing.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                {liveOpsTrips.map((trip, idx) => (
                  <div key={idx} style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 16,
                    padding: 20,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--orange)' }}>ID: {trip.id}</span>
                      <span style={{
                        padding: '4px 10px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                        background: trip.locationSharing === 'active' ? '#DCFCE7' : '#F1F5F9',
                        color: trip.locationSharing === 'active' ? '#15803D' : '#64748B'
                      }}>
                        {trip.locationSharing === 'active' ? '● Sharing Live' : 'Offline'}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 4px', fontSize: '1rem', color: 'var(--navy)', fontWeight: 800 }}>{trip.tourName}</h4>
                    <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: '#64748B' }}>Travel Date: {trip.date}</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                      <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, fontSize: '0.8rem' }}>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700 }}>TRAVELER</span>
                        <strong style={{ color: '#334155' }}>{trip.traveler}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>GPS: {trip.touristLocation}</div>
                      </div>
                      <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, fontSize: '0.8rem' }}>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700 }}>GUIDE</span>
                        <strong style={{ color: '#334155' }}>{trip.guide}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>GPS: {trip.guideLocation}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #E2E8F0', paddingTop: 12 }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        Connection: <strong style={{ color: trip.locationSharing === 'active' ? '#16A34A' : '#64748B' }}>{trip.connection}</strong>
                      </div>
                      <button
                        onClick={() => handleToggleLiveOpsTrip(trip.id)}
                        style={{
                          background: 'none',
                          border: '1px solid #0097A7',
                          color: '#0097A7',
                          borderRadius: 6,
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Simulate Toggle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ANALYTICS & REPORTS */}
          {activeTab === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={styles.section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E3A8A', margin: 0 }}>Revenue Analytics</h3>
                    <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0' }}>Monthly revenue breakdown and trend analysis</p>
                  </div>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 14px', fontSize: '0.8rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                    <Download size={14} /> Export CSV
                  </button>
                </div>

                {/* Revenue Bar Chart (CSS) */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 200, padding: '0 10px', borderBottom: '1px solid #E2E8F0' }}>
                  {[
                    { month: 'Jan', value: 42000, pct: 33 },
                    { month: 'Feb', value: 56000, pct: 44 },
                    { month: 'Mar', value: 71000, pct: 56 },
                    { month: 'Apr', value: 64000, pct: 50 },
                    { month: 'May', value: 98000, pct: 77 },
                    { month: 'Jun', value: 128450, pct: 100 },
                  ].map((m, idx) => (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#334155' }}>{formatAdminPrice(m.value)}</span>
                      <div style={{
                        width: '100%', maxWidth: 48, height: `${m.pct}%`, borderRadius: '8px 8px 0 0',
                        background: idx === 5 ? 'linear-gradient(180deg, #F97316, #EA580C)' : 'linear-gradient(180deg, #E2E8F0, #CBD5E1)',
                        transition: 'height 0.5s ease',
                        minHeight: 8
                      }} />
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>{m.month}</span>
                    </div>
                  ))}
                </div>

                {/* Revenue Summary Cards */}
                {(() => {
                  const liveGrossRevenue = dbBookings.reduce((sum, b) => sum + (b.total_price || 0), 0) || 128450;
                  const livePlatformCommission = dbBookings.reduce((sum, b) => {
                    const totalPrice = b.total_price || 0;
                    const subtotal = totalPrice / (1 + commissionRate / 100);
                    return sum + (totalPrice - subtotal);
                  }, 0) || 19268;
                  const liveGuidePayouts = liveGrossRevenue - livePlatformCommission;
                  
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 20 }}>
                      {[
                        { label: 'Gross Revenue (Jun)', value: formatAdminPrice(liveGrossRevenue), change: '+22%', up: true },
                        { label: 'Platform Commission', value: formatAdminPrice(livePlatformCommission), change: `${commissionRate}% cut`, up: true },
                        { label: 'Guide Payouts', value: formatAdminPrice(liveGuidePayouts), change: `${100 - commissionRate}% share`, up: true },
                      ].map((c, idx) => (
                        <div key={idx} style={{ background: '#F8FAFC', borderRadius: 12, padding: 16, border: '1px solid #F1F5F9' }}>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>{c.label}</span>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1A1F5E', margin: '6px 0 2px' }}>{c.value}</div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#22C55E' }}>{c.change}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Guide Performance Leaderboard */}
              <div style={styles.section}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E3A8A', marginBottom: 16 }}>Guide Performance Leaderboard</h3>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Rank</th>
                      <th style={styles.th}>Guide Name</th>
                      <th style={styles.th}>Completed Tours</th>
                      <th style={styles.th}>Total Revenue</th>
                      <th style={styles.th}>Avg Rating</th>
                      <th style={styles.th}>Response Rate</th>
                      <th style={styles.th}>Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { rank: 1, name: 'Shivashish Chamoli', tours: 42, revenueUSD: 58200, rating: 4.9, responseRate: '98%', badge: '🏆 Top Guide' },
                      { rank: 2, name: 'Yuki Tanaka', tours: 38, revenueUSD: 44300, rating: 4.8, responseRate: '95%', badge: '⭐ Rising Star' },
                      { rank: 3, name: 'Aarav Sharma', tours: 24, revenueUSD: 25950, rating: 4.7, responseRate: '92%', badge: '📈 Consistent' },
                    ].map((g, idx) => (
                      <tr key={idx} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: 800, color: idx === 0 ? '#F59E0B' : idx === 1 ? '#94A3B8' : '#CD7F32' }}>#{g.rank}</td>
                        <td style={{ ...styles.td, fontWeight: 700 }}>{g.name}</td>
                        <td style={styles.td}>{g.tours} tours</td>
                        <td style={{ ...styles.td, fontWeight: 700, color: '#0F172A' }}>{formatAdminPrice(g.revenueUSD)}</td>
                        <td style={styles.td}>
                          <span style={{ color: '#F59E0B' }}>{'★'.repeat(Math.floor(g.rating))}</span> {g.rating}
                        </td>
                        <td style={styles.td}>{g.responseRate}</td>
                        <td style={styles.td}>
                          <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700, background: '#EFF6FF', color: '#2563EB' }}>
                            {g.badge}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Two Column: Booking Trends + Geographic Distribution */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div style={styles.section}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E3A8A', marginBottom: 16 }}>Booking Trends</h3>
                  {[
                    { label: 'Today', count: 3, pct: 15 },
                    { label: 'This Week', count: 18, pct: 42 },
                    { label: 'This Month', count: 76, pct: 100 },
                    { label: 'Last Month', count: 62, pct: 82 },
                  ].map((t, idx) => (
                    <div key={idx} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{t.label}</span>
                        <span style={{ fontWeight: 700, color: '#1E3A8A' }}>{t.count} bookings</span>
                      </div>
                      <div style={{ height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${t.pct}%`, background: 'linear-gradient(90deg, #06B6D4, #0891B2)', borderRadius: 4, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.section}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E3A8A', marginBottom: 16 }}>Top Destinations by Bookings</h3>
                  {[
                    { city: 'Tokyo, Japan', bookings: 34, pct: 100, flag: '🇯🇵' },
                    { city: 'Delhi, India', bookings: 28, pct: 82, flag: '🇮🇳' },
                    { city: 'Kyoto, Japan', bookings: 18, pct: 53, flag: '🇯🇵' },
                    { city: 'Agra, India', bookings: 12, pct: 35, flag: '🇮🇳' },
                    { city: 'Bali, Indonesia', bookings: 8, pct: 24, flag: '🇮🇩' },
                  ].map((d, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <span style={{ fontSize: '1.2rem' }}>{d.flag}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 3 }}>
                          <span style={{ fontWeight: 600, color: '#334155' }}>{d.city}</span>
                          <span style={{ fontWeight: 700, color: '#1E3A8A' }}>{d.bookings}</span>
                        </div>
                        <div style={{ height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${d.pct}%`, background: 'linear-gradient(90deg, #F97316, #EA580C)', borderRadius: 3 }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: REVIEWS */}
          {activeTab === 'reviews' && (
            <div style={styles.section}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E3A8A', marginBottom: 20 }}>Customer Reviews Moderation</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {[
                  { traveler: 'Atharav Singh', rating: 5, comment: 'Exceptional tour! Aarav Sharma knew everything about the historic stepwells in Rajasthan. Recommended!', date: 'June 26, 2026' },
                  { traveler: 'Sudipta Konkan', rating: 5, comment: 'Yuki Tanaka is awesome! The Shibuya crossing walking tour and local street food crawl was outstanding.', date: 'June 25, 2026' }
                ].map((r, idx) => (
                  <div key={idx} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', background: '#FFFFFF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{r.traveler}</span>
                      <span style={{ fontSize: '0.8rem', color: '#F59E0B' }}>{'★'.repeat(r.rating)}</span>
                    </div>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>"{r.comment}"</p>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{r.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SUPPORT TICKETS */}
          {activeTab === 'tickets' && (
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }} className="tickets-split-grid">
              {/* Tickets List */}
              <div style={{ ...styles.section, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E3A8A', margin: 0 }}>Active Tickets ({supportTickets.length})</h3>
                
                {/* Ticket ID search input */}
                <input
                  type="text"
                  placeholder="Search by ticket ID (e.g. TKT)..."
                  value={ticketSearch}
                  onChange={e => setTicketSearch(e.target.value)}
                  style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '8px 12px', fontSize: '0.82rem', outline: 'none' }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', maxHeight: '420px' }}>
                  {(() => {
                    const filtered = supportTickets.filter(t => t.id.toLowerCase().includes(ticketSearch.toLowerCase()));
                    if (filtered.length === 0) {
                      return <p style={{ color: '#94A3B8', fontSize: '0.85rem', textAlign: 'center', padding: '12px 0' }}>No tickets found matching ID.</p>;
                    }
                    return filtered.map(t => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        style={{
                          padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer',
                          background: selectedTicket?.id === t.id ? 'rgba(6,182,212,0.08)' : '#FFFFFF',
                          borderColor: selectedTicket?.id === t.id ? '#06B6D4' : '#E2E8F0'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{t.id}</span>
                          <span style={{
                            padding: '2px 6px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                            background: t.status === 'resolved' ? '#DCFCE7' : t.status === 'in_progress' ? '#FEF3C7' : '#EFF6FF',
                            color: t.status === 'resolved' ? '#15803D' : t.status === 'in_progress' ? '#B45309' : '#1E40AF'
                          }}>
                            {t.status === 'in_progress' ? 'In Progress' : t.status}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.shortDescription}</p>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Chat Thread */}
              <div style={styles.section}>
                {selectedTicket ? (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '500px' }}>
                    <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 12, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: 0, fontWeight: 700, color: 'var(--navy)' }}>{selectedTicket.id}: {selectedTicket.shortDescription}</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748B' }}>Created: {selectedTicket.createdAt} &bull; Status: <span style={{ fontWeight: 700, textTransform: 'uppercase', color: selectedTicket.status === 'resolved' ? '#22C55E' : '#E2A800' }}>{selectedTicket.status}</span></p>
                      </div>

                      {/* Resolve button action */}
                      {selectedTicket.status !== 'resolved' && (
                        <button
                          onClick={() => handleResolveTicket(selectedTicket.id)}
                          style={{
                            background: '#22C55E', color: '#FFFFFF', border: 'none', borderRadius: '6px',
                            padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer'
                          }}
                        >
                          ✓ Resolve Ticket
                        </button>
                      )}
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '10px 0', background: '#FAFBFC' }}>
                      {selectedTicket.messages.map((msg: any, idx: number) => (
                        <div key={idx} style={{
                          alignSelf: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
                          background: msg.sender === 'admin' ? 'var(--navy)' : '#FFFFFF',
                          color: msg.sender === 'admin' ? '#FFFFFF' : '#334155',
                          padding: '10px 14px', borderRadius: '12px', fontSize: '0.85rem',
                          maxWidth: '80%', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          border: msg.sender === 'admin' ? 'none' : '1px solid #E2E8F0'
                        }}>
                          <span style={{ fontSize: '0.7rem', display: 'block', opacity: 0.8, marginBottom: 2 }}>
                            {msg.sender === 'admin' ? 'Support (You)' : 'Traveler'} • {msg.time}
                          </span>
                          {msg.text}
                        </div>
                      ))}

                      {selectedTicket.status === 'resolved' && (
                        <div style={{ margin: '12px auto', background: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0', padding: '10px 20px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 700, textAlign: 'center', maxWidth: '80%' }}>
                          🔒 This support ticket has been marked RESOLVED and closed. Responses are locked.
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', borderTop: '1px solid #E2E8F0', paddingTop: 12, marginTop: 12 }}>
                      <input
                        type="text"
                        value={ticketReplyText}
                        onChange={e => setTicketReplyText(e.target.value)}
                        placeholder={selectedTicket.status === 'resolved' ? "Ticket resolved. Responses locked." : "Type response reply..."}
                        disabled={selectedTicket.status === 'resolved'}
                        onKeyDown={e => { if (e.key === 'Enter') handleTicketReplySubmit(selectedTicket.id); }}
                        style={{ flex: 1, border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px', fontSize: '0.88rem', outline: 'none', backgroundColor: selectedTicket.status === 'resolved' ? '#F1F5F9' : '#FFFFFF' }}
                      />
                      <button
                        onClick={() => handleTicketReplySubmit(selectedTicket.id)}
                        disabled={selectedTicket.status === 'resolved'}
                        style={{ marginLeft: 10, background: selectedTicket.status === 'resolved' ? '#CBD5E1' : 'var(--navy)', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: selectedTicket.status === 'resolved' ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <Send size={14} /> Send
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8', flexDirection: 'column' }}>
                    <MessageSquare size={36} style={{ marginBottom: 12, opacity: 0.5 }} />
                    <p style={{ fontSize: '0.9rem' }}>Select a ticket from the left panel to review and reply.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS */}
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Success Toast */}
              {settingsSaved && (
                <div style={{
                  background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: 12, padding: '14px 20px',
                  display: 'flex', alignItems: 'center', gap: 10, color: '#15803D', fontWeight: 600, fontSize: '0.88rem'
                }}>
                  <CheckCircle size={18} /> Settings saved successfully!
                </div>
              )}

              {/* Row 1: Commission & System */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div style={styles.section}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E3A8A', marginBottom: 4 }}>
                    <Percent size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    Financial Configuration
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 20px' }}>Set platform commission and payout terms</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Marketplace Commission Fee (%)</label>
                      <input type="number" value={commissionRate} onChange={e => setCommissionRate(Number(e.target.value))}
                        style={{ border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem', outline: 'none', transition: 'border 0.2s' }}
                        onFocus={e => e.currentTarget.style.borderColor = '#06B6D4'}
                        onBlur={e => e.currentTarget.style.borderColor = '#CBD5E1'}
                      />
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Applied to all bookings as platform fee. Current: {commissionRate}%</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Default Settlement Term (Days)</label>
                      <input type="number" value={settlementDays} onChange={e => setSettlementDays(Number(e.target.value))}
                        style={{ border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem', outline: 'none' }}
                        onFocus={e => e.currentTarget.style.borderColor = '#06B6D4'}
                        onBlur={e => e.currentTarget.style.borderColor = '#CBD5E1'}
                      />
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Days after tour completion to release guide payout</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Default Platform Currency</label>
                      <select value={defaultCurrency} onChange={e => setDefaultCurrency(e.target.value)}
                        style={{ border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem', outline: 'none', background: '#FFF' }}
                      >
                        <option value="USD">USD ($)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={styles.section}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E3A8A', marginBottom: 4 }}>
                    <Settings size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    System Controls
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 20px' }}>Manage operational toggles and modes</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {/* Maintenance Mode Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: maintenanceMode ? '#FEF2F2' : '#F8FAFC', borderRadius: 12, border: `1px solid ${maintenanceMode ? '#FECACA' : '#F1F5F9'}` }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>
                          {maintenanceMode ? '🔴' : '🟢'} Maintenance Mode
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {maintenanceMode ? 'Platform is offline for users' : 'Platform is live and accessible'}
                        </span>
                      </div>
                      <button
                        onClick={() => setMaintenanceMode(!maintenanceMode)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        {maintenanceMode
                          ? <ToggleRight size={32} color="#EF4444" />
                          : <ToggleLeft size={32} color="#22C55E" />
                        }
                      </button>
                    </div>

                    {/* Auto-approve Listings Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #F1F5F9' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>
                          Auto-Approve Listings
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {autoApproveListings ? 'New listings go live immediately' : 'Listings require manual admin approval'}
                        </span>
                      </div>
                      <button
                        onClick={() => setAutoApproveListings(!autoApproveListings)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        {autoApproveListings
                          ? <ToggleRight size={32} color="#06B6D4" />
                          : <ToggleLeft size={32} color="#94A3B8" />
                        }
                      </button>
                    </div>

                    {/* Notification Channels */}
                    <div style={{ padding: '14px 16px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #F1F5F9' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155', marginBottom: 10 }}>
                        <Bell size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                        Notification Channels
                      </div>
                      <div style={{ display: 'flex', gap: 16 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.82rem' }}>
                          <input type="checkbox" checked={emailNotifications} onChange={e => setEmailNotifications(e.target.checked)} />
                          <span style={{ fontWeight: 600 }}>Email</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.82rem' }}>
                          <input type="checkbox" checked={smsNotifications} onChange={e => setSmsNotifications(e.target.checked)} />
                          <span style={{ fontWeight: 600 }}>SMS</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: System Announcement */}
              <div style={styles.section}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E3A8A', marginBottom: 4 }}>
                  <Zap size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  System Announcement
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 14px' }}>Broadcast a message to all guides and travelers</p>
                <textarea
                  value={systemAnnouncement}
                  onChange={e => setSystemAnnouncement(e.target.value)}
                  placeholder="e.g. RouteByRoot will be undergoing scheduled maintenance on July 1, 2026 from 2:00 AM – 4:00 AM JST..."
                  rows={3}
                  style={{ width: '100%', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '12px 14px', fontSize: '0.88rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#06B6D4'}
                  onBlur={e => e.currentTarget.style.borderColor = '#CBD5E1'}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                  <button
                    onClick={handleSaveSettings}
                    style={{ background: 'linear-gradient(135deg, #1E3A8A, #1A1F5E)', color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '12px 28px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8, transition: 'transform 0.15s, box-shadow 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(30,58,138,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <CheckCircle size={16} /> Save All Settings
                  </button>
                </div>
              </div>

              {/* Row 3: Activity Audit Log */}
              <div style={styles.section}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E3A8A', marginBottom: 16 }}>
                  <FileText size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Activity Audit Log
                </h3>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Timestamp</th>
                      <th style={styles.th}>Action</th>
                      <th style={styles.th}>Performed By</th>
                      <th style={styles.th}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { time: 'Jun 26, 15:12', action: 'Guide Verified', by: adminName, detail: 'Approved Yuki Tanaka (APP-1002)' },
                      { time: 'Jun 26, 14:50', action: 'Withdrawal Approved', by: adminName, detail: 'Processed W-9902 — ¥800 to Yuki Tanaka' },
                      { time: 'Jun 26, 12:30', action: 'Listing Approved', by: adminName, detail: 'Approved "Old Delhi Street Food Walk"' },
                      { time: 'Jun 25, 18:00', action: 'Destination Added', by: adminName, detail: 'Added Bali, Indonesia to destinations' },
                      { time: 'Jun 25, 10:15', action: 'Settings Updated', by: adminName, detail: 'Changed commission rate from 12% to 15%' },
                    ].map((log, idx) => (
                      <tr key={idx} style={styles.tr}>
                        <td style={{ ...styles.td, fontSize: '0.8rem', color: '#94A3B8', whiteSpace: 'nowrap' }}>{log.time}</td>
                        <td style={{ ...styles.td, fontWeight: 700 }}>{log.action}</td>
                        <td style={styles.td}>{log.by}</td>
                        <td style={{ ...styles.td, fontSize: '0.82rem', color: '#475569' }}>{log.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* GUIDE DETAILS MODAL */}
      {selectedGuideApp && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 19, 64, 0.6)',
          backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 9999, padding: '20px'
        }} onClick={() => setSelectedGuideApp(null)}>
          <div style={{
            background: '#FFFFFF', borderRadius: '16px', width: '100%', maxWidth: '560px',
            padding: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            display: 'flex', flexDirection: 'column', gap: 18, position: 'relative',
            maxHeight: '90vh', overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedGuideApp(null)}
              style={{
                position: 'absolute', top: 20, right: 20, border: 'none', background: '#F1F5F9',
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', color: '#64748B', fontSize: '1.2rem', fontWeight: 'bold'
              }}
            >
              ×
            </button>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--orange)', textTransform: 'uppercase' }}>
                Guide Verification Audit
              </span>
              <h3 style={{ margin: '4px 0 0 0', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--navy)' }}>
                Application Details
              </h3>
            </div>

            <div style={{ height: '1px', background: '#F1F5F9' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>FULL NAME</span>
                <strong style={{ color: '#334155' }}>{selectedGuideApp.name}</strong>
              </div>
              <div>
                <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>EMAIL</span>
                <strong style={{ color: '#334155' }}>{selectedGuideApp.email}</strong>
              </div>
              <div>
                <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>CONTACT</span>
                <strong style={{ color: '#334155' }}>{selectedGuideApp.contactNumber}</strong>
              </div>
              <div>
                <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>PIN CODE</span>
                <strong style={{ color: '#334155' }}>{selectedGuideApp.pinCode}</strong>
              </div>
              <div>
                <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>LOCATION</span>
                <strong style={{ color: '#334155' }}>{selectedGuideApp.cityName}, {selectedGuideApp.countryName}</strong>
              </div>
              <div>
                <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>ADDRESS</span>
                <strong style={{ color: '#334155' }}>{selectedGuideApp.currentAddress}</strong>
              </div>
            </div>

            <div style={{ height: '1px', background: '#F1F5F9' }} />

            <div>
              <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem', marginBottom: 4 }}>BIO & SPECIALTIES</span>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                {selectedGuideApp.shortDescription}
              </p>
            </div>

            <div>
              <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem', marginBottom: 4 }}>PASSPORT SCAN ATTACHMENT</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', fontSize: '0.85rem' }}>
                <span>📄 {selectedGuideApp.passportFileName || 'passport_scan.pdf'}</span>
                <a href="#" onClick={e => { e.preventDefault(); alert('Downloading scanned passport doc...'); }} style={{ marginLeft: 'auto', color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>Download Scan</a>
              </div>
            </div>

            <div style={{ height: '1px', background: '#F1F5F9', marginTop: 10 }} />

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleRejectGuide(selectedGuideApp.id, selectedGuideApp.userId)}
                style={{ background: '#FFFFFF', border: '1px solid #EF4444', color: '#EF4444', padding: '10px 20px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Reject Application
              </button>
              <button
                onClick={() => handleVerifyGuide(selectedGuideApp.userId, selectedGuideApp.id)}
                style={{ background: '#22C55E', color: '#FFFFFF', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Approve & Verify Guide ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#F8FAFC',
    fontFamily: "'Inter', sans-serif",
  },
  sidebar: {
    width: '260px',
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #E2E8F0',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    overflowY: 'auto',
    zIndex: 100,
  },
  sidebarHeader: {
    padding: '24px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px solid #F1F5F9',
  },
  sidebarLogo: {
    height: '40px',
    objectFit: 'contain',
  },
  adminBadge: {
    backgroundColor: 'rgba(249,115,22,0.1)',
    color: '#F97316',
    border: '1px solid rgba(249,115,22,0.3)',
    borderRadius: '6px',
    padding: '2px 8px',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '1px',
  },
  nav: {
    flex: 1,
    padding: '20px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navLabel: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#94a3b8',
    letterSpacing: '1.5px',
    padding: '0 10px',
    marginBottom: '8px',
    marginTop: 0,
  },
  navItem: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: '12px 14px',
    borderRadius: '10px',
    border: 'none',
    background: 'transparent',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
  },
  navItemActive: {
    backgroundColor: 'rgba(249,115,22,0.08)',
    color: '#F97316',
    fontWeight: 600,
  },
  activeBorder: {
    position: 'absolute',
    left: '-12px',
    top: '25%',
    height: '50%',
    width: '3px',
    backgroundColor: '#F97316',
    borderRadius: '0 3px 3px 0',
  },
  sidebarBottom: {
    padding: '16px',
    borderTop: '1px solid #f1f5f9',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  },
  userAvatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1A1F5E, #3b4cca)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 700,
    flexShrink: 0,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    margin: 0,
    fontSize: '13px',
    fontWeight: 600,
    color: '#0f172a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textTransform: 'capitalize',
  },
  userRole: {
    margin: 0,
    fontSize: '11px',
    color: '#94a3b8',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #fee2e2',
    backgroundColor: '#fff5f5',
    color: '#ef4444',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  main: {
    marginLeft: '260px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  topBar: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  topAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #F97316, #ea6c0a)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 700,
  },
  content: {
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
    border: '1px solid #E2E8F0',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
    border: '1px solid #E2E8F0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: '11px',
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    backgroundColor: '#F8FAFC',
    borderBottom: '1px solid #E2E8F0',
  },
  tr: {
    borderBottom: '1px solid #F1F5F9',
  },
  td: {
    padding: '14px 16px',
    color: '#334155',
  },
};
