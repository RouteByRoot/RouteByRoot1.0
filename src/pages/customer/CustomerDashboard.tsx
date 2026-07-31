import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  MapPin, Calendar, Star, Compass, User, LogOut, ArrowRight, CheckCircle, 
  MessageSquare, Heart, Settings, Bell, FileText, Send, Shield, Info, DollarSign, Clock,
  HelpCircle, AlertCircle, ChevronDown, ChevronUp, TicketCheck, Award, Upload, Save
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useBookings } from '../../contexts/BookingsContext';
import { useChat } from '../../contexts/ChatContext';
import { syncQuotations, syncTickets, syncGuideApplications, syncUserProfile } from '../../lib/supabaseSync';

export default function CustomerDashboard() {
  const { user, signOut, refetchUser } = useAuth();
  const navigate = useNavigate();
  const { bookings: contextBookings, getBookingsForTraveler } = useBookings();
  const { messages: chatMessages, sendMessage, getMessagesForConversation, getUserConversations } = useChat();

  // Redirect admins and guides to their respective dashboards
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'guide') {
        navigate('/guide/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  // Active Tab: bookings, chat, wishlist, reviews, help, notifications, settings, become_guide
  const location = useLocation();
  const initialTab = new URLSearchParams(location.search).get('tab') || 'bookings';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sign out
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Currency Conversion States
  const [currency, setCurrency] = useState<string>(localStorage.getItem('selected_currency_tourist') || 'USD');
  const [rates, setRates] = useState<any>({ USD: 1, JPY: 155.5, INR: 83.5, EUR: 0.92 });

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        if (data && data.rates) {
          setRates(data.rates);
        }
      } catch (err) {
        console.error("Failed to fetch live currency rates:", err);
      }
    };
    fetchRates();
  }, []);

  const formatPrice = (usdAmount: number) => {
    const rate = rates[currency] || 1;
    const converted = usdAmount * rate;
    let symbol = '$';
    if (currency === 'JPY') symbol = '¥';
    else if (currency === 'INR') symbol = '₹';
    else if (currency === 'EUR') symbol = '€';
    
    if (currency === 'JPY') {
      return `${symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${symbol}${converted.toFixed(2)}`;
  };

  const [selectedDetailedBooking, setSelectedDetailedBooking] = useState<any | null>(null);
  const [isSharingLocation, setIsSharingLocation] = useState(false);

  // Quotation States
  const [quotations, setQuotations] = useState<any[]>(() => {
    const saved = localStorage.getItem('routebyroot_quotations');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    // Fallback mock quotation array
    return [{
      id: 'Q-4982',
      guideName: 'Shivashish Chamoli',
      city: 'Tachikawa, Tokyo, JAPAN',
      bookingDate: '26/07/2025',
      guideNationality: 'Indian',
      pickupTime: '09:20 AM',
      pickupPoint: 'Shibuya Metro Station, North Exit',
      tripDuration: '10 Hours',
      places: 'Tokyo City, Shibuya Rokko Market, Sukesan Eatery, Tokyo Tower, Abeyamakoen, Tokyo Castle',
      guestName: 'Atharav Singh\nSudipta Konkan',
      travellingTo: 'Tokyo, JAPAN',
      touristNationality: 'Indian',
      dropTime: '19:30 PM',
      dropPoint: 'Nearby Station',
      guideQuoteUsd: null,
      status: 'pending_guide',
      travelerCounterUsd: null,
      round: 0
    }];
  });

  const [selectedQuotation, setSelectedQuotation] = useState<any | null>(null);

  // Sync back any changes to quotations to localStorage
  useEffect(() => {
    syncQuotations(quotations);
  }, [quotations]);

  const [showCounterInput, setShowCounterInput] = useState(false);
  const [counterValue, setCounterValue] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const getQuotedFeeString = (usdHourly: number) => {
    const rate = rates[currency] || 1;
    const converted = usdHourly * rate;
    let symbol = '$';
    if (currency === 'JPY') symbol = '¥';
    else if (currency === 'INR') symbol = '₹';
    else if (currency === 'EUR') symbol = '€';
    
    if (currency === 'JPY') {
      return `${symbol}${Math.round(converted)}/hr`;
    }
    return `${symbol}${converted.toFixed(2)}/hr`;
  };

  const isBookingToday = (dateStr: string) => {
    if (!dateStr) return false;
    try {
      const today = new Date();
      const bDate = new Date(dateStr);
      if (!isNaN(bDate.getTime())) {
        return (
          bDate.getFullYear() === today.getFullYear() &&
          bDate.getMonth() === today.getMonth() &&
          bDate.getDate() === today.getDate()
        );
      }
      
      const normalizedBookingStr = dateStr.replace(/\s+/g, ' ').toLowerCase();
      const todayStr1 = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toLowerCase();
      const todayStr2 = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toLowerCase();
      const todayStr3 = today.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toLowerCase();
      const isoToday = today.toISOString().split('T')[0];
      
      return (
        normalizedBookingStr.includes(todayStr1) ||
        normalizedBookingStr.includes(todayStr2) ||
        normalizedBookingStr.includes(todayStr3) ||
        normalizedBookingStr.includes(isoToday)
      );
    } catch (e) {
      return false;
    }
  };

  const handleSelectDetailedBooking = (b: any) => {
    setSelectedDetailedBooking(b);
    setIsSharingLocation(false);
  };

  const [bookings, setBookings] = useState<any[]>([
    {
      id: 'BK-8809',
      tourName: 'Secrets of Rajasthan Heritage Walk',
      guideName: 'Aarav Sharma',
      date: 'June 26, 2026',
      status: 'confirmed',
      amount: 420,
      pickupTime: '09:00 AM',
      places: ['Hawa Mahal', 'City Palace', 'Jantar Mantar'],
      guideNationality: 'Indian',
      touristNationality: 'Indian',
      paymentId: 'PAY-8809-5561',
      guideLanguages: ['Hindi', 'English']
    },
    {
      id: 'BK-9122',
      tourName: 'Tokyo Hidden Izakayas Food Crawl',
      guideName: 'Yuki Tanaka',
      date: 'Aug 02, 2026',
      status: 'pending',
      amount: 285,
      pickupTime: '06:00 PM',
      places: ['Shibuya Crossing', 'Omoide Yokocho', 'Golden Gai'],
      guideNationality: 'Japanese',
      touristNationality: 'Indian',
      paymentId: 'PAY-9122-1082',
      guideLanguages: ['Japanese', 'English', 'Hindi']
    }
  ]);


  // Load bookings from local BookingsContext
  useEffect(() => {
    if (user) {
      const userBookings = getBookingsForTraveler(user.id);
      if (userBookings.length > 0) {
        const formatted = userBookings.map((b: any) => ({
          id: b.id.slice(0, 7).toUpperCase(),
          tourName: b.tour_name || 'Local Cultural Guided Walk',
          guideName: b.guide_name || 'Local Guide Partner',
          date: b.booking_date,
          status: b.status === 'accepted' ? 'confirmed' : b.status,
          amount: b.amount,
          raw: b,
          pickupTime: '09:00 AM',
          places: ['Senso-ji Temple', 'Shibuya Crossing', 'Meiji Shrine'],
          guideNationality: 'Japanese',
          touristNationality: 'Indian',
          paymentId: `PAY-${b.id.slice(0, 7).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
          guideLanguages: ['Hindi', 'English', 'Japanese'],
          totalGuests: b.totalGuests || 1
        }));
        setBookings((prev: any[]) => {
          // Merge: keep existing mock bookings, add new context-based ones
          const existingIds = new Set(prev.map((p: any) => p.id));
          const newOnes = formatted.filter((f: any) => !existingIds.has(f.id));
          return [...prev, ...newOnes];
        });
      }
    }
  }, [user, contextBookings]);

  // Cancel Booking
  const cancelBooking = async (id: string) => {
    setBookings((prev: any) => prev.map((b: any) => b.id === id ? { ...b, status: 'cancelled' } : b));
  };

  // Download invoice utility
  const downloadInvoice = (b: any) => {
    const content = `
==================================================
              ROUTEBYROOT TRIP INVOICE
==================================================
Booking ID:          ${b.id}
Payment ID:          ${b.paymentId || 'PAY-' + b.id + '-SECURE'}
Status:              ${b.status.toUpperCase()}
Date Issued:         ${new Date().toLocaleDateString()}

--- TOUR DETAILS ---
Tour Name:           ${b.tourName}
Local Guide:         ${b.guideName}
Guide Nationality:   ${b.guideNationality || 'N/A'}
Languages Spoken:    ${(b.guideLanguages || []).join(', ')}
Travel Date:         ${b.date}
Pick-Up Time:        ${b.pickupTime || '09:00 AM'}
Pick-Up Point:       ${b.raw?.special_requests?.includes('Pickup:') ? b.raw.special_requests.split('Pickup:')[1].split('Guests:')[0].trim() : 'Shibuya Crossing'}
Drop-Off Point:      ${b.raw?.special_requests?.includes('Drop:') ? b.raw.special_requests.split('Drop:')[1].trim() : 'Shibuya Station'}
Places to Visit:     ${(b.places || []).join(', ')}

--- TRAVELER INFO ---
Lead Guest:          ${b.raw?.special_requests?.includes('Guests:') ? b.raw.special_requests.split('Guests:')[1].trim() : 'Atharav Singh'}
Total Guests:        ${b.totalGuests || 1}
Tourist Nationality: ${b.touristNationality || 'Indian'}

--- PAYMENT DETAILS ---
Base Tour Fee:       ${formatPrice(b.amount)}
Platform Fee (${(() => { try { const s = JSON.parse(localStorage.getItem('routebyroot_admin_settings') || '{}'); return s.commissionRate !== undefined ? s.commissionRate : 10; } catch { return 10; } })()}%):   ${formatPrice(b.amount * ((() => { try { const s = JSON.parse(localStorage.getItem('routebyroot_admin_settings') || '{}'); return s.commissionRate !== undefined ? s.commissionRate : 10; } catch { return 10; } })() / 100))}
--------------------------------------------------
TOTAL CHARGED:       ${formatPrice(b.amount * (1 + (() => { try { const s = JSON.parse(localStorage.getItem('routebyroot_admin_settings') || '{}'); return s.commissionRate !== undefined ? s.commissionRate : 10; } catch { return 10; } })() / 100))}
==================================================
Thank you for exploring with RouteByRoot!
`;
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Invoice-${b.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };



  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ CHAT STATE Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const [chatInput, setChatInput] = useState('');
  const [localChatMessages, setLocalChatMessages] = useState([
    { sender_role: 'guide', content: 'Hello! I am preparing our itinerary. Do you have any specific pickup point in mind?' },
    { sender_role: 'traveler', content: 'Yes, Shibuya Station Metro Exit 3 would be ideal.' }
  ]);

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setLocalChatMessages((prev: any) => [...prev, { sender_role: 'traveler', content: chatInput }]);
    setChatInput('');
    setTimeout(() => {
      setLocalChatMessages((prev: any) => [...prev, { sender_role: 'guide', content: 'Perfect! I will note that down. See you there!' }]);
    }, 1000);
  };

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ LEAVE REVIEW STATE Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const [reviewGuide, setReviewGuide] = useState('Shivashish Chamoli');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSuccess(true);
    setReviewComment('');
    setTimeout(() => setReviewSuccess(false), 2000);
  };

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ PROFILE SETTINGS STATE Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const profileKey = user?.id ? `rbr_profile_${user.id}` : 'rbr_profile_guest';
  const savedProfile = (() => {
    try { return JSON.parse(localStorage.getItem(profileKey) || '{}'); } catch { return {}; }
  })();

  const [profileName, setProfileName] = useState(savedProfile.name || user?.name || 'Traveler User');
  const [profileLang, setProfileLang] = useState(savedProfile.preferred_language || user?.preferred_language || 'English');
  const [profileCountry, setProfileCountry] = useState(savedProfile.country || user?.country || 'India');
  const [profileCity, setProfileCity] = useState(savedProfile.city || user?.city || '');
  const [profileBio, setProfileBio] = useState(savedProfile.bio || user?.bio || 'Travel lover always seeking authentic local food markets.');
  const [profilePhone, setProfilePhone] = useState(savedProfile.phone_number || user?.phone_number || '');
  const [profileAvatar, setProfileAvatar] = useState(savedProfile.avatar_url || user?.avatar_url || '');
  const [passportFront, setPassportFront] = useState(savedProfile.passport_front || '');
  const [passportBack, setPassportBack] = useState(savedProfile.passport_back || '');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);

  // Sync from user context only for DB-backed fields (not overriding local uploads)
  useEffect(() => {
    if (user) {
      const saved = (() => {
        try { return JSON.parse(localStorage.getItem(profileKey) || '{}'); } catch { return {}; }
      })();
      setProfileName(saved.name || user.name || 'Traveler User');
      setProfileLang(saved.preferred_language || user.preferred_language || 'English');
      setProfileCountry(saved.country || user.country || 'India');
      setProfileCity(saved.city || user.city || '');
      setProfileBio(saved.bio || user.bio || '');
      setProfilePhone(saved.phone_number || user.phone_number || '');
      setProfileAvatar(saved.avatar_url || user.avatar_url || '');
      if (saved.passport_front) setPassportFront(saved.passport_front);
      if (saved.passport_back) setPassportBack(saved.passport_back);
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);

    // Save to localStorage first (always works, supports large base64 images)
    const localData = {
      name: profileName,
      preferred_language: profileLang,
      country: profileCountry,
      city: profileCity,
      bio: profileBio,
      phone_number: profilePhone,
      avatar_url: profileAvatar,
      passport_front: passportFront,
      passport_back: passportBack
    };
    if (user?.id) {
      await syncUserProfile(user.id, localData);
    } else {
      localStorage.setItem(profileKey, JSON.stringify(localData));
    }

    // Also attempt to save DB-safe fields to Supabase (skip large base64 data)
    try {
      if (user) {
        const dbData: any = {
          name: profileName,
          preferred_language: profileLang,
          country: profileCountry,
          city: profileCity,
          bio: profileBio,
          phone_number: profilePhone,
        };
        // Only send avatar_url to DB if it's a normal URL (not a huge base64 string)
        if (profileAvatar && !profileAvatar.startsWith('data:')) {
          dbData.avatar_url = profileAvatar;
        }
        await supabase
          .from('profiles')
          .update(dbData)
          .eq('id', user.id);
      }
    } catch (err) {
      console.warn("DB save error: ", err);
    }

    // Set success indicator
    setProfileSuccess(true);
    if (refetchUser) {
      refetchUser().catch(err => console.warn("Failed refetching user: ", err));
    }
    setTimeout(() => setProfileSuccess(false), 2000);
  };

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ HELP & SUPPORT TICKET STATE Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  interface TicketMessage {
    sender_role: 'traveler' | 'admin';
    content: string;
    time: string;
  }
  interface SupportTicket {
    id: string;
    shortDescription: string;
    detailedExplanation: string;
    status: 'in_progress' | 'resolved' | 'closed';
    createdAt: string;
    messages: TicketMessage[];
  }

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('routebyroot_tickets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'TKT-1001',
        shortDescription: 'Unable to download invoice for BK-8809',
        detailedExplanation: 'I completed my trip on June 26 and tried downloading the invoice but the download button does not seem to respond. I need the invoice for my company reimbursement.',
        status: 'in_progress',
        createdAt: 'Jun 24, 2026 Ã¢â‚¬Â¢ 10:30 AM',
        messages: [
          { sender_role: 'traveler', content: 'I completed my trip on June 26 and tried downloading the invoice but the download button does not seem to respond. I need the invoice for my company reimbursement.', time: 'Jun 24, 10:30 AM' },
          { sender_role: 'admin', content: 'Hi there! Thank you for reaching out. We are looking into this issue. Could you please try clearing your browser cache and retry? We will also push a fix shortly.', time: 'Jun 24, 11:15 AM' },
          { sender_role: 'traveler', content: 'I cleared the cache but still facing the same issue on Chrome.', time: 'Jun 24, 11:45 AM' },
          { sender_role: 'admin', content: 'Thank you for confirming. Our engineering team has been notified and a fix is being deployed. You should be able to download within the next 2 hours. Apologies for the inconvenience!', time: 'Jun 24, 12:00 PM' },
        ]
      }
    ];
  });

  useEffect(() => {
    syncTickets(supportTickets);
  }, [supportTickets]);

  const [ticketFormShort, setTicketFormShort] = useState('');
  const [ticketFormDetailed, setTicketFormDetailed] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>('TKT-1001');
  const [ticketReplyInputs, setTicketReplyInputs] = useState<Record<string, string>>({});

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ BECOME A GUIDE STATE Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const [becomeGuideForm, setBecomeGuideForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    contactNumber: '',
    currentAddress: '',
    cityName: '',
    state: '',
    countryName: '',
    pinCode: '',
    shortDescription: ''
  });
  const [becomeGuidePassport, setBecomeGuidePassport] = useState<any>(null);
  const [becomeGuideSubmitted, setBecomeGuideSubmitted] = useState(() => {
    return localStorage.getItem(`routebyroot_become_guide_submitted_${user?.id}`) === 'true';
  });
  const [becomeGuideSaving, setBecomeGuideSaving] = useState(false);

  const handleTicketSubmit = async () => {
    if (!ticketFormShort.trim() || !ticketFormDetailed.trim()) {
      alert('Please fill in both fields.');
      return;
    }
    setTicketSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    const newTicket: SupportTicket = {
      id: `TKT-${1000 + supportTickets.length + 1}`,
      shortDescription: ticketFormShort,
      detailedExplanation: ticketFormDetailed,
      status: 'in_progress',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' Ã¢â‚¬Â¢ ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      messages: [
        { sender_role: 'traveler', content: ticketFormDetailed, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
      ]
    };
    setSupportTickets((prev: any) => [newTicket, ...prev]);
    setExpandedTicketId(newTicket.id);
    setTicketFormShort('');
    setTicketFormDetailed('');
    setTicketSubmitting(false);
  };

  const handleTicketReply = (ticketId: string) => {
    const replyText = ticketReplyInputs[ticketId]?.trim();
    if (!replyText) return;
    setSupportTickets((prev: any) => prev.map((t: any) => {
      if (t.id === ticketId) {
        const newMsg: TicketMessage = { sender_role: 'traveler', content: replyText, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) };
        const updatedMessages = [...t.messages, newMsg];
        // Simulate admin auto-reply after 1.5s
        setTimeout(() => {
          setSupportTickets(prev2 => prev2.map(t2 => {
            if (t2.id === ticketId) {
              return { ...t2, messages: [...t2.messages, { sender_role: 'admin' as const, content: 'Thank you for your update. Our team is reviewing this and will get back to you shortly.', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }] };
            }
            return t2;
          }));
        }, 1500);
        return { ...t, messages: updatedMessages };
      }
      return t;
    }));
    setTicketReplyInputs((prev: any) => ({ ...prev, [ticketId]: '' }));
  };

  const handleBecomeGuideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!becomeGuideForm.contactNumber.trim() || !becomeGuideForm.currentAddress.trim() || !becomeGuideForm.cityName.trim() || !becomeGuideForm.countryName.trim() || !becomeGuideForm.shortDescription.trim()) {
      alert('Please fill in all required fields.');
      return;
    }
    setBecomeGuideSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const app = {
      id: `APP-${Date.now().toString().slice(-4)}`,
      userId: user?.id,
      userEmail: user?.email,
      ...becomeGuideForm,
      passportFileName: becomeGuidePassport ? becomeGuidePassport.name : 'passport_scan.pdf',
      status: 'pending',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const existingApps = JSON.parse(localStorage.getItem('routebyroot_guide_applications') || '[]');
    await syncGuideApplications([app, ...existingApps]);
    localStorage.setItem(`routebyroot_become_guide_submitted_${user?.id}`, 'true');

    setBecomeGuideSubmitted(true);
    setBecomeGuideSaving(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'var(--font-body)', color: '#334155' }}>
      
      {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ HEADER Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid #E2E8F0',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        padding: '16px 24px'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <img src="/logo.png" alt="RouteByRoot" style={{ height: 32 }} />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--navy)', fontSize: '1.15rem' }}>
                RouteByRoot
              </span>
            </Link>
            <div style={{ height: 20, width: 1, background: '#E2E8F0' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--teal)', background: 'rgba(6,182,212,0.1)', padding: '4px 10px', borderRadius: 6 }}>
              Traveler Panel
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 8 }}>
              <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Currency:</span>
              <select
                value={currency}
                onChange={(e) => {
                  const cur = e.target.value;
                  setCurrency(cur);
                  localStorage.setItem('selected_currency_tourist', cur);
                }}
                style={{
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  background: '#FFFFFF',
                  outline: 'none'
                }}
              >
                <option value="USD">USD ($)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <Link
              to="/"
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--navy)',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              → Go to Homepage
            </Link>
            
            <button
              onClick={handleSignOut}
              style={{
                background: 'none',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: '#475569',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* ——— DUAL ROW LAYOUT: SIDEBAR + MAIN AREA ——— */}
      <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32 }} className="dashboard-grid">
        
        {/* SIDEBAR TABS */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { id: 'bookings', label: 'My Bookings', icon: FileText },
            { id: 'quotations', label: 'Quotation', icon: DollarSign },
            { id: 'chat', label: 'Guide Chat', icon: MessageSquare },
            { id: 'wishlist', label: 'Wishlist', icon: Heart },
            { id: 'reviews', label: 'Leave Review', icon: Star },
            { id: 'help', label: 'Help & Support', icon: HelpCircle },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'settings', label: 'Profile Settings', icon: Settings },
            { id: 'become_guide', label: 'Become a Guide', icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? 'var(--navy)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#64748B',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </aside>

        {/* MAIN PANEL CONTENT */}
        <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '32px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          
          {/* TAB 1: MY BOOKINGS */}
          {activeTab === 'bookings' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--navy)', marginBottom: 20 }}>
                My Trips & Booking Requests
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {bookings.map((b: any) => (
                  <div
                    key={b.id}
                    onClick={() => handleSelectDetailedBooking(b)}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      background: '#FFFFFF',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.04)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ padding: '16px 20px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--navy)' }}>Booking ID: {b.id}</span>
                      <span style={{
                        padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                        background: b.status === 'confirmed' ? '#DCFCE7' : b.status === 'pending' ? '#FEF3C7' : '#FEE2E2',
                        color: b.status === 'confirmed' ? '#15803D' : b.status === 'pending' ? '#B45309' : '#B91C1C'
                      }}>
                        {b.status}
                      </span>
                    </div>

                    <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                      <div>
                        <h4 style={{ margin: '0 0 6px', fontWeight: 700, color: 'var(--navy)' }}>{b.tourName}</h4>
                        <div style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', gap: 16 }}>
                          <span>Guide: <strong>{(b.guideName || '').split(' ')[0]}</strong></span>
                          <span>Date: <strong>{b.date}</strong></span>
                          <span>Guests: <strong>{b.totalGuests || 1}</strong></span>
                          <span>Payout: <strong>{formatPrice(b.amount)}</strong></span>
                          {b.createdAt && <span>Booked: <strong>{new Date(b.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} {new Date(b.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</strong></span>}
                        </div>
                      </div>
                      
                      {b.status !== 'cancelled' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelBooking(b.id);
                          }}
                          style={{ background: '#FFF', border: '1px solid #EF4444', color: '#EF4444', padding: '8px 16px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* BOOKING DETAILS MODAL */}
              {selectedDetailedBooking && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(15, 19, 64, 0.6)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 9999,
                  padding: '20px'
                }} onClick={() => setSelectedDetailedBooking(null)}>
                  <div style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    width: '100%',
                    maxWidth: '540px',
                    padding: '28px',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 18,
                    position: 'relative',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                  }} onClick={e => e.stopPropagation()}>
                    
                    {/* Close Button */}
                    <button 
                      onClick={() => setSelectedDetailedBooking(null)}
                      style={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        border: 'none',
                        background: '#F1F5F9',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#64748B',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
                      onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
                    >
                      ×
                    </button>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Trip Invoice & Confirmation
                      </span>
                      <h3 style={{ margin: '4px 0 0 0', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--navy)' }}>
                        Booking Details
                      </h3>
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>ID: {selectedDetailedBooking.id}</span>
                        <span style={{
                          padding: '3px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                          background: selectedDetailedBooking.status === 'confirmed' ? '#DCFCE7' : selectedDetailedBooking.status === 'pending' ? '#FEF3C7' : '#FEE2E2',
                          color: selectedDetailedBooking.status === 'confirmed' ? '#15803D' : selectedDetailedBooking.status === 'pending' ? '#B45309' : '#B91C1C'
                        }}>
                          {selectedDetailedBooking.status}
                        </span>
                      </div>
                    </div>

                    <div style={{ height: '1px', background: '#F1F5F9' }} />

                    {/* Section: Overview */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#475569', fontWeight: 700 }}>Tour Overview</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.85rem' }}>
                        <div>
                          <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>TOUR NAME</span>
                          <strong style={{ color: '#334155' }}>{selectedDetailedBooking.tourName}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>LOCAL GUIDE</span>
                          <strong style={{ color: '#334155' }}>{(selectedDetailedBooking.guideName || '').split(' ')[0]}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>TRAVEL DATE</span>
                          <strong style={{ color: '#334155' }}>{selectedDetailedBooking.date}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>BOOKING CREATED</span>
                          <strong style={{ color: '#334155' }}>{selectedDetailedBooking.createdAt ? new Date(selectedDetailedBooking.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>PICK-UP TIME</span>
                          <strong style={{ color: '#334155' }}>{selectedDetailedBooking.pickupTime || '09:00 AM'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>GUIDE NATIONALITY</span>
                          <strong style={{ color: '#334155' }}>{selectedDetailedBooking.guideNationality || 'Japanese'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>TOURIST NATIONALITY</span>
                          <strong style={{ color: '#334155' }}>{selectedDetailedBooking.touristNationality || 'Indian'}</strong>
                        </div>
                      </div>

                      <div style={{ marginTop: 6, fontSize: '0.85rem' }}>
                        <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>🗺️ PLACES TO VISIT</span>
                        <strong style={{ color: '#334155' }}>{(selectedDetailedBooking.places || []).join(', ')}</strong>
                      </div>
                    </div>

                    <div style={{ height: '1px', background: '#F1F5F9' }} />

                    {/* Section: Languages spoken */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem' }}>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#475569', fontWeight: 700 }}>Language Support</h4>
                      <div>
                        <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>LANGUAGES SPOKEN BY GUIDE</span>
                        <strong style={{ color: '#334155' }}>{(selectedDetailedBooking.guideLanguages || []).join(', ')}</strong>
                        {(selectedDetailedBooking.guideLanguages || []).map((l: string) => l.toLowerCase()).includes('hindi') ? (
                          <span style={{ color: '#16A34A', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginTop: 4 }}>
                            🗣️ Speaks Hindi (Matches your native language!)
                          </span>
                        ) : (
                          <span style={{ color: '#D97706', fontSize: '0.78rem', fontWeight: 700, display: 'block', marginTop: 4 }}>
                            ⚠️ English / Local Support Only (No Hindi speaker)
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ height: '1px', background: '#F1F5F9' }} />

                    {/* Section: Live Location Sharing */}
                    <div style={{
                      background: '#F8FAFC',
                      borderRadius: '12px',
                      padding: '16px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: '#1E3A8A', display: 'block' }}>Share Live Location</strong>
                          <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Allow guide to view your real-time position</span>
                        </div>
                        
                        {/* Custom Toggle Switch */}
                        <div 
                          onClick={() => {
                            if (isBookingToday(selectedDetailedBooking.date)) {
                              setIsSharingLocation(!isSharingLocation);
                            }
                          }}
                          style={{
                            width: 50,
                            height: 26,
                            borderRadius: 13,
                            background: isBookingToday(selectedDetailedBooking.date) 
                              ? (isSharingLocation ? '#22C55E' : '#CBD5E1') 
                              : '#E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: isBookingToday(selectedDetailedBooking.date) ? 'pointer' : 'not-allowed',
                            position: 'relative',
                            transition: 'background 0.2s',
                            opacity: isBookingToday(selectedDetailedBooking.date) ? 1 : 0.6
                          }}
                        >
                          <div style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: '#FFFFFF',
                            position: 'absolute',
                            left: isSharingLocation && isBookingToday(selectedDetailedBooking.date) ? 27 : 3,
                            transition: 'left 0.2s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                          }} />
                        </div>
                      </div>

                      <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        {!isBookingToday(selectedDetailedBooking.date) ? (
                          <span style={{ color: '#94A3B8', fontWeight: 600 }}>
                            🚫 Disabled: Only available on the day of travel ({selectedDetailedBooking.date})
                          </span>
                        ) : isSharingLocation ? (
                          <span style={{ color: '#16A34A', fontWeight: 700 }}>
                            🟢 Live Location Sharing is Active
                          </span>
                        ) : (
                          <span style={{ color: '#64748B', fontWeight: 600 }}>
                            🔴 Live Location Sharing is Off (Click toggle to enable)
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ height: '1px', background: '#F1F5F9' }} />

                    {/* Section: Locations */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#475569', fontWeight: 700 }}>Meeting Points</h4>
                      <div>
                        <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>📍 PICK-UP POINT</span>
                        <span style={{ fontWeight: 600, color: '#334155' }}>
                          {selectedDetailedBooking.raw?.special_requests?.includes('Pickup:') 
                            ? selectedDetailedBooking.raw.special_requests.split('Pickup:')[1].split('Guests:')[0].trim() 
                            : 'Shibuya Station, Hachiko Exit'}
                        </span>
                      </div>
                      <div style={{ marginTop: 6 }}>
                        <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>🏁 DROP-OFF POINT</span>
                        <span style={{ fontWeight: 600, color: '#334155' }}>
                          {selectedDetailedBooking.raw?.special_requests?.includes('Drop:') 
                            ? selectedDetailedBooking.raw.special_requests.split('Drop:')[1].trim() 
                            : 'Shibuya Station'}
                        </span>
                      </div>
                    </div>

                    <div style={{ height: '1px', background: '#F1F5F9' }} />

                    {/* Section: Payment Breakdown */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#475569', fontWeight: 700 }}>Payment Summary</h4>
                      <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                          <span>Payment ID</span>
                          <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--navy)' }}>{selectedDetailedBooking.paymentId || ('PAY-' + selectedDetailedBooking.id + '-SECURE')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                          <span>Base Tour Fee</span>
                          <span>{formatPrice(selectedDetailedBooking.amount)}</span>
                        </div>
                        {(() => {
                          const adminS = JSON.parse(localStorage.getItem('routebyroot_admin_settings') || '{}');
                          const pfRate = adminS.commissionRate !== undefined ? adminS.commissionRate : 10;
                          const pfAmount = selectedDetailedBooking.amount * (pfRate / 100);
                          return (
                            <>
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                                <span>Platform Fee ({pfRate}%)</span>
                                <span>{formatPrice(pfAmount)}</span>
                              </div>
                              <div style={{ height: '1px', background: '#E2E8F0', margin: '4px 0' }} />
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--navy)', fontSize: '0.95rem' }}>
                                <span>Total Paid / Charged</span>
                                <span>{formatPrice(selectedDetailedBooking.amount + pfAmount)}</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      <button
                        onClick={() => downloadInvoice(selectedDetailedBooking)}
                        style={{
                          background: 'var(--orange)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: '0.88rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          boxShadow: '0 4px 10px rgba(249,115,22,0.2)'
                        }}
                      >
                        📥 Download Plain-Text Invoice
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#64748B', marginTop: 4 }}>
                        <span>🔒 Secured with Stripe Partner Network</span>
                        <span>•</span>
                        <span style={{ color: selectedDetailedBooking.status === 'confirmed' ? '#15803D' : '#B45309', fontWeight: 600 }}>
                          {selectedDetailedBooking.status === 'confirmed' ? '✅ Payment Captured' : '⏳ Authorized (Escrow)'}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: QUOTATIONS */}
          {activeTab === 'quotations' && (
            <div>
              {selectedQuotation ? (
                /* ─── DETAIL VIEW ─── */
                (() => {
                  const q = selectedQuotation;
                  const updateQ = (patch: any) => {
                    const updated = { ...q, ...patch };
                    setSelectedQuotation(updated);
                    setQuotations((prev: any[]) => {
                      const newArr = prev.map((x: any) => x.id === updated.id ? updated : x);
                      return newArr;
                    });
                  };
                  const hasGuoteQuoted = q.guideQuoteUsd !== null && q.guideQuoteUsd !== undefined;
                  // Final agreed price priority: guide's counter > traveler's counter > guide's original quote
                  const acceptedFinalRate =
                    q.guideCounterUsd != null ? q.guideCounterUsd :
                    q.travelerCounterUsd != null ? q.travelerCounterUsd :
                    q.guideQuoteUsd;

                  return (
                    <div>
                      {/* Back Button */}
                      <button
                        onClick={() => { setSelectedQuotation(null); setShowCounterInput(false); setCounterValue(''); }}
                        style={{ background: 'none', border: 'none', color: '#1E3A8A', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, padding: 0 }}
                      >
                        ← Back to All Quotations
                      </button>

                      <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--navy)', marginBottom: 20 }}>
                        Quotation #{q.id} — {(q.guideName || '').split(' ')[0]}
                      </h2>

                      {/* Status Banner */}
                      <div style={{
                        background: q.status === 'accepted' ? '#DCFCE7' : q.status === 'cancelled' ? '#FEE2E2' : q.status === 'guide_quoted' ? '#EFF6FF' : '#FFFBEB',
                        color: q.status === 'accepted' ? '#15803D' : q.status === 'cancelled' ? '#B91C1C' : q.status === 'guide_quoted' ? '#1E40AF' : '#92400E',
                        padding: '12px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem', marginBottom: 24,
                        border: '1px solid ' + (q.status === 'accepted' ? '#BBF7D0' : q.status === 'cancelled' ? '#FECACA' : q.status === 'guide_quoted' ? '#BFDBFE' : '#FDE68A')
                      }}>
                        {q.status === 'pending_guide' && '⏳ Awaiting quote from the guide. We\'ll notify you once they respond.'}
                        {q.status === 'guide_quoted' && `💬 Guide ${(q.guideName || '').split(' ')[0]} has sent you a quotation! Review and respond below.`}
                        {q.status === 'traveler_countered' && '⏳ Counter offer sent. Waiting for the guide\'s decision...'}
                        {q.status === 'accepted' && '🎉 Quotation Accepted! Please proceed to secure payment below.'}
                        {q.status === 'cancelled' && '❌ This quotation request has been cancelled or declined.'}
                      </div>

                      {/* Payment Card (when accepted) */}
                      {q.status === 'accepted' && acceptedFinalRate && (
                        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '32px', boxShadow: '0 8px 30px rgba(0,0,0,0.02)', maxWidth: '600px', margin: '0 0 24px 0' }}>
                          {paymentSuccess ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                              <span style={{ fontSize: '3rem' }}>🎉</span>
                              <h3 style={{ color: '#15803D', fontFamily: 'var(--font-heading)', fontWeight: 800, margin: '16px 0 8px' }}>Payment Successful!</h3>
                              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Your customized booking with {(q.guideName || '').split(' ')[0]} is confirmed.</p>
                              <button
                                onClick={() => { setPaymentSuccess(false); setSelectedQuotation(null); setActiveTab('bookings'); }}
                                style={{ background: 'var(--navy)', color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', marginTop: 12 }}
                              >
                                View My Bookings
                              </button>
                            </div>
                          ) : (() => {
                            const adminSettings = JSON.parse(localStorage.getItem('routebyroot_admin_settings') || '{}');
                                  const platformFeeRate = adminSettings.commissionRate !== undefined ? adminSettings.commissionRate : 10;
                                  const subtotal = acceptedFinalRate * 10;
                                  const platformFee = subtotal * (platformFeeRate / 100);
                                  const totalCharged = subtotal + platformFee;
                                  return (
                                    <div>
                                      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--navy)', marginBottom: 20 }}>Secure Checkout & Payout</h3>
                                      <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem', marginBottom: 20 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                                          <span>Agreed Hourly Rate</span>
                                          <strong>{getQuotedFeeString(acceptedFinalRate)}</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                                          <span>Trip Duration</span><span>{q.tripDuration || '10 Hours'}</span>
                                        </div>
                                        <div style={{ height: '1px', background: '#E2E8F0', margin: '4px 0' }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                                          <span>Subtotal Tour Fee (Guide's Charge)</span>
                                          <span>{formatPrice(subtotal)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                                          <span>Platform Fee ({platformFeeRate}%)</span>
                                          <span>{formatPrice(platformFee)}</span>
                                        </div>
                                        <div style={{ height: '1px', background: '#E2E8F0', margin: '4px 0' }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--navy)', fontSize: '1rem' }}>
                                          <span>Total Amount Charged</span>
                                          <span>{formatPrice(totalCharged)}</span>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => {
                                          const newB = {
                                            id: 'BK-' + Math.floor(1000 + Math.random() * 9000),
                                            tourName: `Custom Tour with ${(q.guideName || '').split(' ')[0]}`,
                                            guideName: q.guideName,
                                            traveler: profileName ? profileName.split(' ')[0] : (q.guestName || 'Traveler').split(' ')[0],
                                            date: q.bookingDate,
                                            status: 'confirmed',
                                            amount: totalCharged,
                                            guideAmount: subtotal,
                                            platformFee: platformFee,
                                            totalGuests: q.totalGuests || 1,
                                            count: q.totalGuests || 1,
                                            pickupTime: q.pickupTime || '09:00 AM',
                                            places: (q.places || '').split(', '),
                                            guideNationality: q.guideNationality || 'Local',
                                            touristNationality: q.touristNationality || 'International',
                                            paymentId: 'PAY-' + Math.floor(100000 + Math.random() * 900000),
                                            guideLanguages: ['English'],
                                            createdAt: new Date().toISOString()
                                          };
                                          setBookings((prev: any) => [newB, ...prev]);
                                          setQuotations((prev: any) => prev.filter((qq: any) => qq.id !== q.id));

                                          // Write to shared guide bookings store so Guide Panel picks it up in real-time
                                          try {
                                            const existing = JSON.parse(localStorage.getItem('routebyroot_guide_bookings') || '[]');
                                            const updated = [newB, ...existing];
                                            localStorage.setItem('routebyroot_guide_bookings', JSON.stringify(updated));
                                            window.dispatchEvent(new StorageEvent('storage', {
                                              key: 'routebyroot_guide_bookings',
                                              newValue: JSON.stringify(updated),
                                              storageArea: localStorage
                                            }));
                                          } catch (e) { console.warn('Guide booking sync failed', e); }

                                          setPaymentSuccess(true);
                                        }}
                                        style={{ width: '100%', background: '#0097A7', color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '14px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(0,151,167,0.2)' }}
                                      >
                                        Pay Now ({formatPrice(totalCharged)})
                                      </button>
                                    </div>
                                  );
                                })()}
                        </div>
                      )}

                      {/* Trip Details Card */}
                      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '32px', boxShadow: '0 8px 30px rgba(0,0,0,0.02)', position: 'relative' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40, alignItems: 'start' }}>
                          {/* LEFT */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            {[
                              { icon: '👤', label: 'Guide Name', val: (q.guideName || '').split(' ')[0] },
                              { icon: '📍', label: 'City', val: q.city || q.travellingTo },
                              { icon: '📅', label: 'Booking Date', val: q.bookingDate },
                              { icon: '🕒', label: 'Pick-Up Time', val: q.pickupTime },
                              { icon: '📍', label: 'Pick-Up Point', val: q.pickupPoint },
                              { icon: '🕒', label: 'Drop-Off Time', val: q.dropTime },
                              { icon: '📍', label: 'Drop-Off Point', val: q.dropPoint },
                            ].map((item, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>{item.icon}</div>
                                <div style={{ flex: 1 }}>
                                  <span style={{ fontSize: '0.82rem', color: '#94A3B8', display: 'block' }}>{item.label}:</span>
                                  <span style={{ fontWeight: 700, color: '#334155', fontSize: '0.93rem' }}>{item.val || '—'}</span>
                                </div>
                              </div>
                            ))}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>🗺️</div>
                              <div style={{ flex: 1 }}>
                                <span style={{ fontSize: '0.82rem', color: '#94A3B8', display: 'block' }}>Places:</span>
                                <span style={{ fontWeight: 600, color: '#475569', fontSize: '0.88rem', lineHeight: '1.5' }}>{q.places || '—'}</span>
                              </div>
                            </div>
                          </div>

                          {/* RIGHT */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            {[
                              { icon: '👤', label: 'Guest Name', val: profileName ? profileName.split(' ')[0] : (q.guestName || 'Traveler').split(' ')[0] },
                              { icon: '👥', label: 'Total Guests', val: q.totalGuests || 1 },
                              { icon: '🏳️', label: 'Travelling To', val: q.travellingTo },
                              { icon: '🏳️', label: 'Tourist Nationality', val: q.touristNationality },
                            ].map((item, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>{item.icon}</div>
                                <div style={{ flex: 1 }}>
                                  <span style={{ fontSize: '0.82rem', color: '#94A3B8', display: 'block' }}>{item.label}:</span>
                                  <span style={{ fontWeight: 700, color: '#334155', fontSize: '0.93rem', whiteSpace: 'pre-line' }}>{item.val}</span>
                                </div>
                              </div>
                            ))}

                            {/* Quoted Fee — only shown after guide quotes */}
                            {hasGuoteQuoted && (
                              <div>
                                <div style={{ background: '#FCE7F3', borderRadius: '24px', padding: '14px 24px', display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                                  <span style={{ fontSize: '0.88rem', color: '#64748B' }}>Guide's Quoted Fee:</span>
                                  <strong style={{ fontSize: '1.3rem', color: '#D946EF', fontFamily: 'monospace' }}>{getQuotedFeeString(q.guideQuoteUsd)}</strong>
                                </div>
                                {q.travelerCounterUsd && (
                                  <div style={{ marginTop: 10, fontSize: '0.85rem', color: '#475569' }}>
                                    Your Counter Offer: <strong>{getQuotedFeeString(q.travelerCounterUsd)}</strong>
                                  </div>
                                )}
                                {q.guideCounterUsd && (
                                  <div style={{ marginTop: 10, background: '#EFF6FF', borderRadius: '16px', padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: '0.85rem', color: '#1E40AF' }}>Guide's Final Counter:</span>
                                    <strong style={{ fontSize: '1.15rem', color: '#1E3A8A', fontFamily: 'monospace' }}>{getQuotedFeeString(q.guideCounterUsd)}</strong>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Counter Note */}
                            {hasGuoteQuoted && q.status === 'guide_quoted' && (
                              <div style={{ background: '#FFFBEB', borderLeft: '4px solid #F59E0B', padding: '10px 14px', borderRadius: '4px', fontSize: '0.82rem', color: '#92400E', fontWeight: 600 }}>
                                ⚠️ You can only counter the quoted price <strong>one time</strong>. Use it wisely before accepting or declining.
                              </div>
                            )}

                            {/* Action Buttons: guide_quoted -> Tourist can Accept / Counter / Decline */}
                            {hasGuoteQuoted && q.status === 'guide_quoted' && !showCounterInput && (
                              <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                                <button
                                  onClick={() => updateQ({ status: 'accepted' })}
                                  style={{ background: '#14B8A6', color: '#FFF', border: 'none', borderRadius: '24px', padding: '11px 24px', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', boxShadow: '0 4px 10px rgba(20,184,166,0.2)' }}
                                >
                                  ✔ ACCEPT
                                </button>
                                <button
                                  onClick={() => setShowCounterInput(true)}
                                  style={{ background: '#F59E0B', color: '#FFF', border: 'none', borderRadius: '24px', padding: '11px 24px', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}
                                >
                                  🔄 COUNTER
                                </button>
                                <button
                                  onClick={() => updateQ({ status: 'cancelled' })}
                                  style={{ background: '#EF4444', color: '#FFF', border: 'none', borderRadius: '24px', padding: '11px 24px', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}
                                >
                                  ✖ DECLINE
                                </button>
                              </div>
                            )}

                            {/* guide_countered -> Tourist can only Accept or Decline (no more counter) */}
                            {q.status === 'guide_countered' && (
                              <div>
                                <div style={{ background: '#FFFBEB', borderLeft: '4px solid #F59E0B', padding: '10px 14px', borderRadius: '4px', fontSize: '0.82rem', color: '#92400E', fontWeight: 600, marginBottom: 12 }}>
                                  ⚠️ The guide has sent their final counter offer. You can <strong>Accept</strong> or <strong>Decline</strong> — no further countering is allowed.
                                </div>
                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                  <button
                                    onClick={() => updateQ({ status: 'accepted' })}
                                    style={{ background: '#14B8A6', color: '#FFF', border: 'none', borderRadius: '24px', padding: '11px 24px', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', boxShadow: '0 4px 10px rgba(20,184,166,0.2)' }}
                                  >
                                    ✔ ACCEPT FINAL OFFER
                                  </button>
                                  <button
                                    onClick={() => updateQ({ status: 'cancelled' })}
                                    style={{ background: '#EF4444', color: '#FFF', border: 'none', borderRadius: '24px', padding: '11px 24px', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}
                                  >
                                    ✖ DECLINE
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Waiting messages */}
                            {q.status === 'traveler_countered' && (
                              <span style={{ fontSize: '0.88rem', fontStyle: 'italic', color: '#94A3B8' }}>
                                ⏱️ Counter offer sent. Awaiting guide's decision...
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Counter Quote Overlay */}
                        {showCounterInput && (
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.96)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 10 }}>
                            <div style={{ maxWidth: '340px', width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
                              <h4 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--navy)', textAlign: 'center' }}>Submit Counter Quote</h4>
                              <p style={{ fontSize: '0.82rem', color: '#64748B', textAlign: 'center', margin: 0 }}>
                                You have <strong>1 counter option</strong>. Propose your preferred hourly rate:
                              </p>
                              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: '6px', overflow: 'hidden' }}>
                                <span style={{ padding: '10px', background: '#F1F5F9', fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
                                  {currency === 'JPY' ? '¥/hr' : currency === 'EUR' ? '€/hr' : currency === 'INR' ? '₹/hr' : '$/hr'}
                                </span>
                                <input
                                  type="number"
                                  value={counterValue}
                                  onChange={e => setCounterValue(e.target.value)}
                                  placeholder="e.g. 10"
                                  style={{ flex: 1, border: 'none', padding: '10px', fontSize: '1rem', outline: 'none', fontWeight: 600 }}
                                />
                              </div>
                              <div style={{ display: 'flex', gap: 10 }}>
                                <button onClick={() => { setShowCounterInput(false); setCounterValue(''); }} style={{ flex: 1, background: '#FFF', border: '1px solid #CBD5E1', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                <button
                                  onClick={() => {
                                    const val = parseFloat(counterValue);
                                    if (!isNaN(val) && val > 0) {
                                      const rate = rates[currency] || 1;
                                      const valUsd = val / rate;
                                      updateQ({ travelerCounterUsd: valUsd, status: 'traveler_countered', round: 1 });
                                      setShowCounterInput(false);
                                      setCounterValue('');
                                    }
                                  }}
                                  style={{ flex: 1, background: 'var(--navy)', color: '#FFF', border: 'none', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                  Send Counter
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : (
                /* ─── LIST VIEW ─── */
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--navy)', marginBottom: 6 }}>My Quotation Requests</h2>
                  <p style={{ color: '#64748B', fontSize: '0.88rem', marginBottom: 24 }}>Click on any request to view full details and respond to a guide's quote.</p>

                  {quotations.length === 0 ? (
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '48px', textAlign: 'center', color: '#94A3B8' }}>
                      <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 12 }}>📋</span>
                      <p style={{ margin: 0, fontSize: '0.95rem' }}>No quotation requests yet. Customize a trip from any guide's profile to get started.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {quotations.map((q: any) => {
                        const statusColor = q.status === 'accepted' ? '#15803D' : q.status === 'cancelled' ? '#B91C1C' : (q.status === 'guide_quoted' || q.status === 'guide_countered') ? '#1E40AF' : '#92400E';
                        const statusBg = q.status === 'accepted' ? '#DCFCE7' : q.status === 'cancelled' ? '#FEE2E2' : (q.status === 'guide_quoted' || q.status === 'guide_countered') ? '#DBEAFE' : '#FEF3C7';
                        const statusLabel = q.status === 'pending_guide' ? 'Awaiting Guide Quote' : q.status === 'guide_quoted' ? 'Quote Received - Action Required' : q.status === 'traveler_countered' ? 'Counter Sent' : q.status === 'guide_countered' ? 'Guide Countered - Action Required' : q.status === 'accepted' ? 'Accepted' : 'Cancelled';
                        return (
                          <div
                            key={q.id}
                            onClick={() => { setSelectedQuotation(q); setShowCounterInput(false); setCounterValue(''); }}
                            style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.15s', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'; e.currentTarget.style.transform = 'none'; }}
                          >
                            <div style={{ padding: '14px 20px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--navy)' }}>Request #{q.id}</span>
                              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: statusBg, color: statusColor }}>{statusLabel}</span>
                            </div>
                            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                              <div>
                                <h4 style={{ margin: '0 0 6px', fontWeight: 700, color: 'var(--navy)' }}>Guide: {(q.guideName || '').split(' ')[0]}</h4>
                                <div style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                  <span>Date: <strong>{q.bookingDate || '-'}</strong></span>
                                  <span>📍 To: <strong>{q.travellingTo || "—"}</strong></span>
                                  {/* Show final agreed price - counter takes priority over original quote */}
                                  {(q.guideCounterUsd || q.guideQuoteUsd) && (
                                    <span>
                                      {q.guideCounterUsd
                                        ? <>🔄 Counter: <strong style={{ color: '#1E40AF' }}>{getQuotedFeeString(q.guideCounterUsd)}</strong></>
                                        : <>💰 Quote: <strong>{getQuotedFeeString(q.guideQuoteUsd)}</strong></>}
                                    </span>
                                  )}
                                  {q.status === 'accepted' && (q.guideCounterUsd || q.travelerCounterUsd || q.guideQuoteUsd) && (
                                    <span style={{ background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                                      ✅ Agreed: {getQuotedFeeString(q.guideCounterUsd || q.travelerCounterUsd || q.guideQuoteUsd)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span style={{ color: "#94A3B8", fontSize: "1.2rem" }}>›</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CHAT */}
          {activeTab === "chat" && (
            <div>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.4rem", color: "var(--navy)", marginBottom: 20 }}>
                Chat with Guide
              </h2>
              <div style={{ border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", fontWeight: 700, color: "var(--navy)" }}>
                  💬 Shivashish Chamoli (Local Partner)
                </div>
                <div style={{ height: "240px", padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, background: "#FAFAFA" }}>
                  {localChatMessages.map((msg, idx) => (
                    <div key={idx} style={{
                      alignSelf: msg.sender_role === "traveler" ? "flex-end" : "flex-start",
                      background: msg.sender_role === "traveler" ? "var(--navy)" : "#FFFFFF",
                      color: msg.sender_role === "traveler" ? "#FFFFFF" : "#334155",
                      padding: "10px 14px",
                      borderRadius: "12px",
                      fontSize: "0.88rem",
                      maxWidth: "75%",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
                      border: msg.sender_role === "traveler" ? "none" : "1px solid #E2E8F0"
                    }}>
                      {msg.content}
                    </div>
                  ))}
                </div>
                <form onSubmit={sendChatMessage} style={{ display: "flex", borderTop: "1px solid #E2E8F0", padding: 10 }}>
                  <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type your message..." style={{ flex: 1, border: "none", padding: "10px", outline: "none", fontSize: "0.9rem" }} />
                  <button type="submit" style={{ background: "var(--navy)", color: "#FFFFFF", border: "none", borderRadius: "8px", padding: "8px 16px", fontWeight: 700, cursor: "pointer" }}>Send</button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--navy)', marginBottom: 20 }}>
                Your Wishlist
              </h2>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#64748B' }}>
                <Compass size={40} style={{ margin: '0 auto 12px' }} />
                <p style={{ margin: '0 0 16px 0', fontSize: '0.95rem' }}>View and manage guides you shortlisted for future bookings.</p>
                <Link to="/" style={{ background: 'var(--navy)', color: '#FFFFFF', textDecoration: 'none', padding: '10px 20px', borderRadius: '8px', display: 'inline-block', fontWeight: 600, fontSize: '0.85rem' }}>
                  Browse Local Guides
                </Link>
              </div>
            </div>
          )}

          {/* TAB 5: LEAVE REVIEW */}
          {activeTab === 'reviews' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--navy)', marginBottom: 20 }}>
                Leave Feedback & Reviews
              </h2>

              {reviewSuccess ? (
                <div style={{ padding: '20px', background: '#DCFCE7', color: '#15803D', borderRadius: '8px', fontWeight: 600, textAlign: 'center' }}>
                  Ã¢Å“â€œ Review submitted! Thank you for helping the community.
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Select Completed Guide</label>
                    <select
                      value={reviewGuide}
                      onChange={e => setReviewGuide(e.target.value)}
                      style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '10px', fontSize: '0.9rem' }}
                    >
                      <option>Shivashish Chamoli (Tokyo)</option>
                      <option>Aarav Sharma (Rajasthan)</option>
                      <option>Yuki Tanaka (Tokyo)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Rating (1 - 5 Stars)</label>
                    <select
                      value={reviewRating}
                      onChange={e => setReviewRating(Number(e.target.value))}
                      style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '10px', fontSize: '0.9rem', width: '100px' }}
                    >
                      <option>5</option>
                      <option>4</option>
                      <option>3</option>
                      <option>2</option>
                      <option>1</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Comment / Feedback</label>
                    <textarea
                      rows={4}
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      placeholder="Write your tour experience here..."
                      style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '10px', fontSize: '0.9rem' }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{ background: 'var(--navy)', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Submit Review
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 6: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--navy)', marginBottom: 20 }}>
                My Notifications
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { content: 'Your booking request #BK-9122 is currently pending guide approval.', time: '2 hours ago' },
                  { content: 'Tour guide Shivashish Chamoli left you a chat message.', time: '1 day ago' },
                  { content: 'Booking request #BK-8809 has been successfully confirmed!', time: '3 days ago' }
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: '#475569' }}>{item.content}</span>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: PROFILE SETTINGS */}
          {activeTab === 'settings' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--navy)', marginBottom: 20 }}>
                Profile Settings & Settings
              </h2>

              {profileSuccess && (
                <div style={{ padding: '12px', background: '#DCFCE7', color: '#15803D', borderRadius: '6px', fontWeight: 600, marginBottom: 16, textAlign: 'center' }}>
                  Ã¢Å“â€œ Profile updated successfully!
                </div>
              )}

              <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                      style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '10px', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email Address</label>
                    <input
                      type="text"
                      value={user?.email || ''}
                      readOnly
                      style={{ border: '1px solid #E2E8F0', borderRadius: '6px', padding: '10px', fontSize: '0.9rem', background: '#F8FAFC', color: '#64748B', cursor: 'not-allowed' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Language(s) Spoken <span style={{fontSize: '0.75rem', fontWeight: 400, color: '#94A3B8'}}>(comma separated)</span></label>
                  <input
                    type="text"
                    value={profileLang}
                    onChange={e => setProfileLang(e.target.value)}
                    placeholder="e.g. English, Spanish, Hindi"
                    style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '10px', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>City of Origin</label>
                    <input
                      type="text"
                      value={profileCity}
                      onChange={e => setProfileCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '10px', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Country of Origin</label>
                    <input
                      type="text"
                      value={profileCountry}
                      onChange={e => setProfileCountry(e.target.value)}
                      placeholder="e.g. India"
                      style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '10px', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Bio / Description</label>
                  <textarea
                    rows={3}
                    value={profileBio}
                    onChange={e => setProfileBio(e.target.value)}
                    style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '10px', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={profilePhone}
                    onChange={e => setProfilePhone(e.target.value)}
                    style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '10px', fontSize: '0.9rem' }}
                  />
                </div>

                {/* Profile Image & Passport Upload section */}
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 16, marginTop: 8 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Documents & Identification</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                    {/* Profile Image */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Profile Image</label>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                        {profileAvatar && (
                          <img 
                            src={profileAvatar} 
                            alt="Avatar Preview" 
                            style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', border: '2px solid #2BBCBF' }} 
                          />
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ fontSize: '0.85rem' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadingAvatar(true);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setProfileAvatar(reader.result as string);
                                  setUploadingAvatar(false);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                            <input
                              type="text"
                              placeholder="Or paste an image URL..."
                              value={profileAvatar}
                              onChange={e => setProfileAvatar(e.target.value)}
                              style={{ flex: 1, border: '1px solid #CBD5E1', borderRadius: '6px', padding: '6px 10px', fontSize: '0.8rem' }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setUploadingAvatar(true);
                                setTimeout(() => {
                                  setProfileAvatar('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80');
                                  setUploadingAvatar(false);
                                }, 1000);
                              }}
                              disabled={uploadingAvatar}
                              style={{ padding: '6px 12px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              {uploadingAvatar ? 'Loading...' : 'Sample'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Passport Front */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Passport Front Side</label>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                        {passportFront && passportFront.startsWith('data:') && (
                          <img 
                            src={passportFront} 
                            alt="Passport Front Preview" 
                            style={{ width: 70, height: 45, borderRadius: '4px', objectFit: 'cover', border: '1px solid #CBD5E1' }} 
                          />
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ fontSize: '0.85rem' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadingFront(true);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setPassportFront(reader.result as string);
                                  setUploadingFront(false);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          {passportFront && !passportFront.startsWith('data:') && (
                            <span style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: 500 }}>
                              Current: {passportFront}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Passport Back */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Passport Back Side</label>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                        {passportBack && passportBack.startsWith('data:') && (
                          <img 
                            src={passportBack} 
                            alt="Passport Back Preview" 
                            style={{ width: 70, height: 45, borderRadius: '4px', objectFit: 'cover', border: '1px solid #CBD5E1' }} 
                          />
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ fontSize: '0.85rem' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadingBack(true);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setPassportBack(reader.result as string);
                                  setUploadingBack(false);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          {passportBack && !passportBack.startsWith('data:') && (
                            <span style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: 500 }}>
                              Current: {passportBack}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  style={{ background: '#2BBCBF', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: 700, cursor: 'pointer', marginTop: 10 }}
                >
                  {profileSuccess ? 'Ã¢Å“â€œ Saved!' : 'Save Settings'}
                </button>
              </form>
            </div>
          )}

          {/* TAB: HELP & SUPPORT */}
          {activeTab === 'help' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--navy)', marginBottom: 6 }}>
                Help & Support
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: 28, lineHeight: 1.5 }}>
                Have an issue or need assistance? Submit a ticket below and our support team will respond.
              </p>

              {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ SUBMIT A TICKET FORM Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
              <div style={{
                background: '#F8FAFC',
                borderRadius: 14,
                border: '1px solid #E2E8F0',
                padding: '28px 28px 24px',
                marginBottom: 32
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--teal), #0891B2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <TicketCheck size={18} color="#FFFFFF" />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--navy)', margin: 0 }}>
                    Submit a Ticket
                  </h3>
                </div>

                {/* Short Description */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                    Short Description <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Invoice download not working"
                    value={ticketFormShort}
                    onChange={e => setTicketFormShort(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 14px',
                      border: '1.5px solid #CBD5E1', borderRadius: 10,
                      fontSize: '0.9rem', fontFamily: "'Inter', sans-serif",
                      color: '#1E293B', outline: 'none', background: '#FFFFFF',
                      boxSizing: 'border-box' as const,
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    onFocus={e => { e.target.style.borderColor = '#06B6D4'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Detailed Explanation */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                    Detailed Explanation <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Please describe your issue in detail so our team can assist you quickly..."
                    value={ticketFormDetailed}
                    onChange={e => setTicketFormDetailed(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 14px',
                      border: '1.5px solid #CBD5E1', borderRadius: 10,
                      fontSize: '0.9rem', fontFamily: "'Inter', sans-serif",
                      color: '#1E293B', outline: 'none', background: '#FFFFFF',
                      boxSizing: 'border-box' as const, resize: 'vertical' as const,
                      minHeight: 100,
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    onFocus={e => { e.target.style.borderColor = '#06B6D4'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleTicketSubmit}
                  disabled={ticketSubmitting}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 32px', border: 'none', borderRadius: 10,
                    background: ticketSubmitting ? '#94A3B8' : 'var(--navy)',
                    color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem',
                    cursor: ticketSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    boxShadow: '0 4px 12px rgba(26,31,94,0.25)'
                  }}
                  onMouseOver={e => { if (!ticketSubmitting) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {ticketSubmitting ? (
                    <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Submitting...</>
                  ) : (
                    <><Send size={16} /> Submit Ticket</>
                  )}
                </button>
              </div>

              {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ TICKETS LIST Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
              {supportTickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                  <HelpCircle size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
                  <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>No tickets yet. Submit a ticket above if you need help.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--navy)', margin: '0 0 4px' }}>
                    Your Tickets ({supportTickets.length})
                  </h3>

                  {supportTickets.map(ticket => {
                    const isExpanded = expandedTicketId === ticket.id;
                    return (
                      <div key={ticket.id} style={{
                        border: '1px solid #E2E8F0',
                        borderRadius: 14,
                        overflow: 'hidden',
                        background: '#FFFFFF',
                        boxShadow: isExpanded ? '0 4px 20px rgba(0,0,0,0.06)' : '0 1px 4px rgba(0,0,0,0.03)',
                        transition: 'box-shadow 0.2s'
                      }}>
                        {/* Ticket Card Header */}
                        <div
                          onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                          style={{
                            padding: '16px 20px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            cursor: 'pointer',
                            background: isExpanded ? '#F1F5F9' : '#FAFBFC',
                            borderBottom: isExpanded ? '1px solid #E2E8F0' : 'none',
                            transition: 'background 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                              background: ticket.status === 'in_progress' ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                                : ticket.status === 'resolved' ? 'linear-gradient(135deg, #22C55E, #16A34A)'
                                : 'linear-gradient(135deg, #94A3B8, #64748B)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {ticket.status === 'in_progress' ? <AlertCircle size={16} color="#FFF" /> : <CheckCircle size={16} color="#FFF" />}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {ticket.shortDescription}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: 2 }}>
                                {ticket.id} Ã¢â‚¬Â¢ {ticket.createdAt}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                            <span style={{
                              padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem',
                              fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.04em',
                              background: ticket.status === 'in_progress' ? '#FEF3C7' : ticket.status === 'resolved' ? '#DCFCE7' : '#F1F5F9',
                              color: ticket.status === 'in_progress' ? '#B45309' : ticket.status === 'resolved' ? '#15803D' : '#64748B'
                            }}>
                              {ticket.status === 'in_progress' ? 'In Progress' : ticket.status === 'resolved' ? 'Resolved' : 'Closed'}
                            </span>
                            {isExpanded ? <ChevronUp size={18} color="#64748B" /> : <ChevronDown size={18} color="#64748B" />}
                          </div>
                        </div>

                        {/* Expanded Chat Thread */}
                        {isExpanded && (
                          <div>
                            {/* Messages */}
                            <div style={{
                              padding: '20px',
                              maxHeight: 360, overflowY: 'auto' as const,
                              display: 'flex', flexDirection: 'column' as const, gap: 12,
                              background: '#F8FAFC'
                            }}>
                              {ticket.messages.map((msg, idx) => (
                                <div key={idx} style={{
                                  display: 'flex',
                                  flexDirection: 'column' as const,
                                  alignItems: msg.sender_role === 'traveler' ? 'flex-end' : 'flex-start',
                                  gap: 4
                                }}>
                                  <div style={{
                                    fontSize: '0.72rem', fontWeight: 600,
                                    color: msg.sender_role === 'traveler' ? '#06B6D4' : '#F97316',
                                    display: 'flex', alignItems: 'center', gap: 4
                                  }}>
                                    {msg.sender_role === 'traveler' ? (
                                      <><User size={12} /> You</>
                                    ) : (
                                      <><Shield size={12} /> Support Team</>
                                    )}
                                    <span style={{ color: '#94A3B8', fontWeight: 400, marginLeft: 4 }}>{msg.time}</span>
                                  </div>
                                  <div style={{
                                    maxWidth: '80%',
                                    padding: '10px 14px',
                                    borderRadius: msg.sender_role === 'traveler' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                    background: msg.sender_role === 'traveler' ? '#1E3A8A' : '#FFFFFF',
                                    color: msg.sender_role === 'traveler' ? '#FFFFFF' : '#334155',
                                    fontSize: '0.86rem',
                                    lineHeight: 1.55,
                                    boxShadow: msg.sender_role === 'traveler' ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
                                    border: msg.sender_role === 'traveler' ? 'none' : '1px solid #E2E8F0'
                                  }}>
                                    {msg.content}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Reply Input */}
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '12px 20px',
                              borderTop: '1px solid #E2E8F0',
                              background: '#FFFFFF'
                            }}>
                              <input
                                type="text"
                                placeholder="Write a reply..."
                                value={ticketReplyInputs[ticket.id] || ''}
                                onChange={e => setTicketReplyInputs((prev: any) => ({ ...prev, [ticket.id]: e.target.value }))}
                                onKeyDown={e => { if (e.key === 'Enter') handleTicketReply(ticket.id); }}
                                style={{
                                  flex: 1, border: '1.5px solid #E2E8F0', borderRadius: 10,
                                  padding: '10px 14px', fontSize: '0.88rem', outline: 'none',
                                  fontFamily: "'Inter', sans-serif",
                                  transition: 'border-color 0.2s'
                                }}
                                onFocus={e => { e.target.style.borderColor = '#06B6D4'; }}
                                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; }}
                              />
                              <button
                                onClick={() => handleTicketReply(ticket.id)}
                                style={{
                                  width: 40, height: 40, borderRadius: 10, border: 'none',
                                  background: 'var(--navy)', color: '#FFFFFF',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  cursor: 'pointer', flexShrink: 0,
                                  transition: 'transform 0.15s'
                                }}
                                onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                                onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                              >
                                <Send size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: BECOME A GUIDE */}
          {activeTab === 'become_guide' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--navy)', marginBottom: 6 }}>
                Become a Local Guide
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: 28, lineHeight: 1.5 }}>
                Share your roots, guide travelers, and earn money doing what you love. Apply below.
              </p>

              {becomeGuideSubmitted ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 30px',
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: '#FEF3C7', color: '#D97706',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', marginBottom: 18
                  }}>
                    Ã¢ÂÂ³
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--navy)', margin: '0 0 10px' }}>
                    Application Under Review
                  </h3>
                  <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 auto', maxWidth: 460 }}>
                    Thank you for applying to become a RouteByRoot guide! Your verification document and details are being reviewed by the Admin team. Please wait for approval from the Admin. We will notify you here once your account is upgraded.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBecomeGuideSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="become-guide-grid">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Full Name</label>
                      <input
                        type="text"
                        value={becomeGuideForm.fullName}
                        onChange={e => setBecomeGuideForm((prev: any) => ({ ...prev, fullName: e.target.value }))}
                        style={{ border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem' }}
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email Address</label>
                      <input
                        type="email"
                        value={becomeGuideForm.email}
                        onChange={e => setBecomeGuideForm((prev: any) => ({ ...prev, email: e.target.value }))}
                        style={{ border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem' }}
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Contact Number</label>
                      <input
                        type="tel"
                        value={becomeGuideForm.contactNumber}
                        onChange={e => setBecomeGuideForm((prev: any) => ({ ...prev, contactNumber: e.target.value }))}
                        style={{ border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem' }}
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>PIN Code</label>
                      <input
                        type="text"
                        value={becomeGuideForm.pinCode}
                        onChange={e => setBecomeGuideForm((prev: any) => ({ ...prev, pinCode: e.target.value }))}
                        style={{ border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem' }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Current Address</label>
                    <input
                      type="text"
                      value={becomeGuideForm.currentAddress}
                      onChange={e => setBecomeGuideForm((prev: any) => ({ ...prev, currentAddress: e.target.value }))}
                      style={{ border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }} className="become-guide-loc-grid">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>City</label>
                      <input
                        type="text"
                        value={becomeGuideForm.cityName}
                        onChange={e => setBecomeGuideForm((prev: any) => ({ ...prev, cityName: e.target.value }))}
                        style={{ border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem' }}
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>State</label>
                      <input
                        type="text"
                        value={becomeGuideForm.state}
                        onChange={e => setBecomeGuideForm((prev: any) => ({ ...prev, state: e.target.value }))}
                        style={{ border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem' }}
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Country</label>
                      <input
                        type="text"
                        value={becomeGuideForm.countryName}
                        onChange={e => setBecomeGuideForm((prev: any) => ({ ...prev, countryName: e.target.value }))}
                        style={{ border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem' }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Upload Passport Scan (PDF or Image)</label>
                    <label
                      htmlFor="become-guide-passport-upload"
                      style={{
                        padding: '12px 16px', border: '1.5px dashed #CBD5E1', borderRadius: '8px',
                        fontSize: '0.9rem', color: becomeGuidePassport ? '#334155' : '#64748B',
                        background: '#F8FAFC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                      }}
                    >
                      <span>{becomeGuidePassport ? becomeGuidePassport.name : 'Choose file...'}</span>
                      <Upload size={18} color="#64748B" />
                    </label>
                    <input
                      id="become-guide-passport-upload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      style={{ display: 'none' }}
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setBecomeGuidePassport(e.target.files[0]);
                        }
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Bio & Specialties (What makes you a great guide?)</label>
                    <textarea
                      rows={4}
                      value={becomeGuideForm.shortDescription}
                      onChange={e => setBecomeGuideForm((prev: any) => ({ ...prev, shortDescription: e.target.value }))}
                      placeholder="Share details about yourself..."
                      style={{ border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem', resize: 'vertical' }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={becomeGuideSaving}
                    style={{
                      background: 'var(--navy)', color: '#FFFFFF', border: 'none', borderRadius: '8px',
                      padding: '14px', fontWeight: 700, fontSize: '0.95rem', cursor: becomeGuideSaving ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                    }}
                  >
                    {becomeGuideSaving ? (
                      <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Submitting application...</>
                    ) : (
                      <><Send size={16} /> Submit Guide Application</>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
