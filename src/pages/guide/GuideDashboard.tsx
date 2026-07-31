import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LogOut, CheckCircle, Star, Sparkles, MapPin, Plus, User, Edit, FileText, 
  ToggleLeft, ToggleRight, X, Calendar, DollarSign, Clock, MessageSquare, Send, ShieldAlert, Award, Globe, HelpCircle,
  Upload, ArrowDown, ArrowUp, Save, ChevronLeft, ChevronRight, MapPinned, Navigation, Image
} from 'lucide-react';
import { useListings } from '../../contexts/ListingsContext';
import { useBookings } from '../../contexts/BookingsContext';
import { useChat } from '../../contexts/ChatContext';
import { supabase } from '../../lib/supabase';
import { syncQuotations, syncTickets, syncUserProfile } from '../../lib/supabaseSync';

export default function GuideDashboard() {
  const { user, signOut, refetchUser } = useAuth();
  const navigate = useNavigate();
  const { listings, addListing, getListingsByGuide, toggleListingEnabled, updateListing } = useListings();

  // Active Tab: dashboard, bookings, payments, reviews, faq, quotations, calendar, verification, settings, packages, add_details
  const [activeTab, setActiveTab] = useState(() => {
    // Restore tab from sessionStorage so it survives HMR / soft refreshes
    try { return sessionStorage.getItem('guide_active_tab') || 'dashboard'; } catch { return 'dashboard'; }
  });
  const [successMessage, setSuccessMessage] = useState('');
  
  // Enable / Disable status for the main listing card
  const [listingEnabled, setListingEnabled] = useState(true);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);

  // Sync activeTab to sessionStorage so it survives HMR soft-reloads
  useEffect(() => {
    try { sessionStorage.setItem('guide_active_tab', activeTab); } catch {}
  }, [activeTab]);

  // Trigger listings initialization if empty
  useEffect(() => {
    if (user?.email) {
      getListingsByGuide(user.email);
    }
  }, [user?.email, listings]);

  const guideListings = listings.filter(l => l.guideEmail === (user?.email || ''));

  // ─── ADD DETAILS FORM STATE ───
  const [addDetailsForm, setAddDetailsForm] = useState({
    name: 'Shivashish Chamoli',
    contact: '+81 8705032459',
    stayingCountry: 'JAPAN',
    arrivalYear: '2021',
    nationality: 'INDIAN',
    currentAddress: 'JAPAN',
    originAddress: 'INDIA',
    city1: 'Tachikawa',
    pin1: '131-405',
    city2: 'Dehradun',
    pin2: '248001',
    locations: '1) Tokyo City\n2) Shibuya Rokko Market\n3) Sukesan Eatery\n4) Tokyo Sky Tree\n6) Abeyamakoen',
    bankName: '',
    ifsc: '',
    accNo: '',
    reAccNo: '',
    holderName: '',
    branch: '',
    description: "Hi! I'm your local guide based in Tokyo, Japan. I've been living here for 3 years and love helping travelers explore the hidden gems and rich culture of my city. Being from India, I understand the comfort of connecting with someone who speaks your language and shares your background.\n\nI offer curated tours to top attractions, lesser-known local spots, and food joints loved by locals. Whether you're a solo traveler, a family, or a group of friends — I'll make sure your experience is smooth, informative, and memorable. I also provide pickup and drop-off, and customize trips based on your preferred timing, interests, and budget.\n\nLet's make your trip unforgettable — explore like a local, with one of your own IN🤝🌍",
    price: '1450円/hr',
    pickupTime: '',
    dropTime: '',
    pickupPoint: '',
    dropPoint: ''
  });

  const [addDetailsDocs, setAddDetailsDocs] = useState<{ [key: string]: string }>({
    passportFront: '',
    passportBack: '',
    visa: '',
    passbookFront: '',
    passbookBack: '',
    localIdFront: '',
    localIdBack: '',
  });

  const [mediaImages, setMediaImages] = useState<string[]>([]);
  const [listingThumbnail, setListingThumbnail] = useState<string>('');

  // ─── SEPARATE THUMBNAIL STORE (survives localStorage quota issues) ───
  const getThumbnailStore = (): Record<string, string> => {
    try {
      return JSON.parse(localStorage.getItem('routebyroot_listing_thumbs') || '{}');
    } catch { return {}; }
  };
  const saveThumbnailToStore = (listingId: string, thumbUrl: string) => {
    if (!thumbUrl || thumbUrl.startsWith('http')) return; // only store base64 thumbnails
    try {
      const store = getThumbnailStore();
      store[listingId] = thumbUrl;
      localStorage.setItem('routebyroot_listing_thumbs', JSON.stringify(store));
    } catch (e) { console.warn('Thumbnail store save failed:', e); }
  };
  const getStoredThumbnail = (listingId: string): string => {
    return getThumbnailStore()[listingId] || '';
  };

  // Compress an image file to a smaller base64 string (max 400px, JPEG 0.7 quality)
  const compressImage = (file: File, maxDim = 400, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new (window.Image as new () => HTMLImageElement)();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > h) { if (w > maxDim) { h = Math.round(h * maxDim / w); w = maxDim; } }
        else { if (h > maxDim) { w = Math.round(w * maxDim / h); h = maxDim; } }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject('Canvas not supported'); return; }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAddDetailsForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      compressImage(file, 600, 0.7).then(compressed => {
        setAddDetailsDocs((prev: any) => ({ ...prev, [key]: compressed }));
      }).catch(() => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAddDetailsDocs((prev: any) => ({ ...prev, [key]: reader.result as string }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        compressImage(file, 600, 0.7).then(compressed => {
          setMediaImages((prev: any) => [...prev, compressed]);
        }).catch(() => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setMediaImages((prev: any) => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        });
      });
    }
  };


  const saveListingData = (isDraft: boolean) => {
    const thumbValue = listingThumbnail;
    if (editingListingId) {
      const originalListing = guideListings.find(l => l.id === editingListingId);
      const isLive = originalListing?.status === 'approved';
      
      const bankDetailsChanged = originalListing && (
        originalListing.bankName !== addDetailsForm.bankName ||
        originalListing.ifsc !== addDetailsForm.ifsc ||
        originalListing.accNo !== addDetailsForm.accNo ||
        originalListing.holderName !== addDetailsForm.holderName ||
        originalListing.branch !== addDetailsForm.branch
      );
      
      const idsChanged = !!(
        addDetailsDocs.passportFront ||
        addDetailsDocs.passportBack ||
        addDetailsDocs.visa ||
        addDetailsDocs.passbookFront ||
        addDetailsDocs.passbookBack ||
        addDetailsDocs.localIdFront ||
        addDetailsDocs.localIdBack
      );
      
      let targetStatus = originalListing?.status || 'approved';
      if (!isDraft) {
        const requiresReApproval = isLive && (bankDetailsChanged || idsChanged);
        targetStatus = requiresReApproval ? 'pending' : (originalListing?.status || 'approved');
      }

      const passportFrontUrl = addDetailsDocs.passportFront || originalListing?.passportFrontUrl;
      const passportBackUrl = addDetailsDocs.passportBack || originalListing?.passportBackUrl;
      const visaUrl = addDetailsDocs.visa || originalListing?.visaUrl;
      const localIdFrontUrl = addDetailsDocs.localIdFront || originalListing?.localIdFrontUrl;
      const localIdBackUrl = addDetailsDocs.localIdBack || originalListing?.localIdBackUrl;
      const passbookFrontUrl = addDetailsDocs.passbookFront || originalListing?.passbookFrontUrl;
      const passbookBackUrl = addDetailsDocs.passbookBack || originalListing?.passbookBackUrl;

      const finalThumb = thumbValue || originalListing?.thumbnailUrl || '';
      saveThumbnailToStore(editingListingId, finalThumb);
 
      updateListing(editingListingId, {
        guideName: addDetailsForm.name,
        contact: addDetailsForm.contact,
        stayingCountry: addDetailsForm.stayingCountry,
        arrivalYear: addDetailsForm.arrivalYear,
        nationality: addDetailsForm.nationality,
        currentAddress: addDetailsForm.currentAddress,
        originAddress: addDetailsForm.originAddress,
        city1: addDetailsForm.city1,
        pin1: addDetailsForm.pin1,
        city2: addDetailsForm.city2,
        pin2: addDetailsForm.pin2,
        locations: addDetailsForm.locations,
        bankName: addDetailsForm.bankName,
        ifsc: addDetailsForm.ifsc,
        accNo: addDetailsForm.accNo,
        holderName: addDetailsForm.holderName,
        branch: addDetailsForm.branch,
        description: addDetailsForm.description,
        price: addDetailsForm.price,
        pickupTime: addDetailsForm.pickupTime,
        dropTime: addDetailsForm.dropTime,
        pickupPoint: addDetailsForm.pickupPoint,
        dropPoint: addDetailsForm.dropPoint,
        status: targetStatus,
        thumbnailUrl: finalThumb,
        availableDates: availableDates,
        passportFrontUrl,
        passportBackUrl,
        visaUrl,
        localIdFrontUrl,
        localIdBackUrl,
        passbookFrontUrl,
        passbookBackUrl,
        galleryImages: mediaImages
      });
      setEditingListingId(null);
      setActiveTab('dashboard');
      if (isDraft) {
        setSuccessMessage('Draft saved locally!');
      } else {
        if (targetStatus === 'pending') {
          setSuccessMessage('Bank or ID details modified — listing submitted for Admin re-approval.');
        } else {
          setSuccessMessage('Listing updated successfully!');
        }
      }
      setTimeout(() => setSuccessMessage(''), 4000);
    } else {
      const passportFrontUrl = addDetailsDocs.passportFront || undefined;
      const passportBackUrl = addDetailsDocs.passportBack || undefined;
      const visaUrl = addDetailsDocs.visa || undefined;
      const localIdFrontUrl = addDetailsDocs.localIdFront || undefined;
      const localIdBackUrl = addDetailsDocs.localIdBack || undefined;
      const passbookFrontUrl = addDetailsDocs.passbookFront || undefined;
      const passbookBackUrl = addDetailsDocs.passbookBack || undefined;

      const newListingId = Date.now().toString();
      if (thumbValue) {
        saveThumbnailToStore(newListingId, thumbValue);
      }
 
      addListing({
        guideName: addDetailsForm.name,
        contact: addDetailsForm.contact,
        stayingCountry: addDetailsForm.stayingCountry,
        arrivalYear: addDetailsForm.arrivalYear,
        nationality: addDetailsForm.nationality,
        currentAddress: addDetailsForm.currentAddress,
        originAddress: addDetailsForm.originAddress,
        city1: addDetailsForm.city1,
        pin1: addDetailsForm.pin1,
        city2: addDetailsForm.city2,
        pin2: addDetailsForm.pin2,
        locations: addDetailsForm.locations,
        bankName: addDetailsForm.bankName,
        ifsc: addDetailsForm.ifsc,
        accNo: addDetailsForm.accNo,
        holderName: addDetailsForm.holderName,
        branch: addDetailsForm.branch,
        description: addDetailsForm.description,
        price: addDetailsForm.price,
        pickupTime: addDetailsForm.pickupTime,
        dropTime: addDetailsForm.dropTime,
        pickupPoint: addDetailsForm.pickupPoint,
        dropPoint: addDetailsForm.dropPoint,
        guideEmail: user?.email || '',
        thumbnailUrl: thumbValue,
        availableDates: availableDates,
        passportFrontUrl,
        passportBackUrl,
        visaUrl,
        localIdFrontUrl,
        localIdBackUrl,
        passbookFrontUrl,
        passbookBackUrl,
        galleryImages: mediaImages
      });
      setActiveTab('dashboard');
      setSuccessMessage(isDraft ? 'Draft saved locally!' : 'Listing submitted for approval!');
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  const submitAddDetails = () => {
    saveListingData(true);
  };

  const submitListingForApproval = () => {
    saveListingData(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // ─── TOUR PACKAGES STATE ───
  const [tours, setTours] = useState([
    { id: 1, title: 'Old Delhi Street Food & Spices Walk', duration: '3.5 Hours', price: '$45', active: true },
    { id: 2, title: 'Taj Mahal Sunrise Photo Tour', duration: '5 Hours', price: '$85', active: true },
    { id: 3, title: 'Hidden Baolis (Stepwells) of Delhi', duration: '4 Hours', price: '$35', active: false },
  ]);

  const [newTourTitle, setNewTourTitle] = useState('');
  const [newTourDuration, setNewTourDuration] = useState('4 Hours');
  const [newTourPrice, setNewTourPrice] = useState('45');
  const [showAddTourModal, setShowAddTourModal] = useState(false);

  const toggleTourActive = (id: number) => {
    setTours((prev: any) =>
      prev.map((t: any) => (t.id === id ? { ...t, active: !t.active } : t))
    );
  };

  const handleAddTourSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTourTitle.trim()) return;
    const item = {
      id: tours.length + 1,
      title: newTourTitle,
      duration: newTourDuration,
      price: `$${newTourPrice}`,
      active: true
    };
    setTours((prev: any) => [...prev, item]);
    setNewTourTitle('');
    setShowAddTourModal(false);
  };

  const { bookings: contextBookings, updateBookingStatus } = useBookings();
  const { messages: chatMessages, sendMessage, getMessagesForConversation } = useChat();

  // ─── BOOKINGS & REQUESTS STATE ───
  const [bookings, setBookings] = useState(() => {
    const mockBookings = [
      { 
        id: 'BK-1042', 
        traveler: 'Michael Scott', 
        date: 'June 29, 2026', 
        count: 2, 
        status: 'pending', 
        amount: 90, 
        tourName: 'Old Delhi Street Food & Spices Walk',
        pickupTime: '09:00 AM',
        places: ['Chandni Chowk', 'Spice Market', 'Jama Masjid'],
        guideNationality: 'Indian',
        touristNationality: 'American',
        paymentId: 'PAY-1042-8819',
        guideLanguages: ['Hindi', 'English']
      },
      { 
        id: 'BK-1043', 
        traveler: 'Pam Beesly', 
        date: 'July 01, 2026', 
        count: 1, 
        status: 'confirmed', 
        amount: 45, 
        tourName: 'Secrets of Rajasthan Heritage Walk',
        pickupTime: '10:00 AM',
        places: ['City Palace', 'Jantar Mantar'],
        guideNationality: 'Indian',
        touristNationality: 'American',
        paymentId: 'PAY-1043-4412',
        guideLanguages: ['Hindi', 'English']
      },
      { 
        id: 'BK-1044', 
        traveler: 'Jim Halpert', 
        date: 'July 04, 2026', 
        count: 4, 
        status: 'pending', 
        amount: 340, 
        tourName: 'Taj Mahal Sunrise Photo Tour',
        pickupTime: '05:30 AM',
        places: ['Taj Mahal', 'Agra Fort', 'Mehtab Bagh'],
        guideNationality: 'Indian',
        touristNationality: 'American',
        paymentId: 'PAY-1044-9915',
        guideLanguages: ['Hindi', 'English']
      }
    ];
    try {
      const saved = JSON.parse(localStorage.getItem('routebyroot_guide_bookings') || '[]');
      if (saved.length > 0) {
        const mappedSaved = saved.map((b: any) => ({
          ...b,
          totalCharged: b.amount,
          amount: b.guideAmount || b.amount, // Set amount to Guide's cut so earnings graphs work
        }));
        return [...mappedSaved, ...mockBookings];
      }
    } catch(e) {}
    return mockBookings;
  });

  // Listen to shared guide bookings from localStorage (populated when traveler pays for quotation)
  useEffect(() => {
    const handleStorage = (e?: StorageEvent) => {
      if (!e || e.key === 'routebyroot_guide_bookings') {
        try {
          const saved = JSON.parse(localStorage.getItem('routebyroot_guide_bookings') || '[]');
          if (saved.length > 0) {
            setBookings((prev: any[]) => {
              const existingIds = new Set(prev.map((b) => b.id));
              const newBookings = saved.filter((b: any) => !existingIds.has(b.id)).map((b: any) => ({
                ...b,
                totalCharged: b.amount,
                amount: b.guideAmount || b.amount,
              }));
              if (newBookings.length > 0) {
                // Add new bookings to the payments list as well
                setPaymentsList((pList: any[]) => [
                  ...newBookings.map((b: any) => ({
                    paymentId: b.paymentId,
                    paymentDate: new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
                    travelerName: b.traveler,
                    travelDate: b.date,
                    amount: b.amount, // Guide's cut
                    status: 'Captured'
                  })),
                  ...pList
                ]);
                return [...newBookings, ...prev];
              }
              return prev;
            });
          }
        } catch (err) {}
      }
    };
    
    // Listen for cross-tab or same-tab storage events
    window.addEventListener('storage', handleStorage);
    
    // Run once to catch any changes that happened before mount
    handleStorage();

    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const [selectedDetailedBooking, setSelectedDetailedBooking] = useState<any | null>(null);
  const [liveLocationEnabled, setLiveLocationEnabled] = useState<Record<string, boolean>>({});
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentsList, setPaymentsList] = useState([
    { paymentId: 'PAY-1042-8819', paymentDate: 'June 25, 2026', travelerName: 'Michael Scott', travelDate: 'June 29, 2026', amount: 90, status: 'Authorized (Escrow)' },
    { paymentId: 'PAY-1043-4412', paymentDate: 'June 26, 2026', travelerName: 'Pam Beesly', travelDate: 'July 01, 2026', amount: 45, status: 'Captured' },
    { paymentId: 'PAY-1044-9915', paymentDate: 'June 27, 2026', travelerName: 'Jim Halpert', travelDate: 'July 04, 2026', amount: 340, status: 'Authorized (Escrow)' }
  ]);

  const [currency, setCurrency] = useState<string>(localStorage.getItem('selected_currency_guide') || 'USD');
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

  // Base earnings amounts stored in JPY (the guide's native currency)
  const BASE_UNPAID_JPY = 94000;
  const BASE_COMPLETED_JPY = 120400;

  const formatPrice = (amount: number, baseInJPY = false) => {
    let converted: number;
    if (baseInJPY) {
      const usdAmount = amount / (rates.JPY || 155.5);
      converted = usdAmount * (rates[currency] || 1);
    } else {
      converted = amount * (rates[currency] || 1);
    }

    if (currency === 'JPY') return `¥${Math.round(converted).toLocaleString()}`;
    if (currency === 'INR') return `₹${converted.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    if (currency === 'EUR') return `€${converted.toFixed(2)}`;
    return `$${converted.toFixed(2)}`;
  };

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
Local Guide:         Shivashish Chamoli
Guide Nationality:   ${b.guideNationality || 'N/A'}
Languages Spoken:    ${(b.guideLanguages || []).join(', ')}
Travel Date:         ${b.date}
Pick-Up Time:        ${b.pickupTime || '09:00 AM'}
Pick-Up Point:       Shibuya Crossing
Drop-Off Point:      Shibuya Station
Places to Visit:     ${(b.places || []).join(', ')}

--- TRAVELER INFO ---
Lead Guest:          ${b.traveler}
Total Guests:        ${b.totalGuests || 1}
Tourist Nationality: ${b.touristNationality || 'Indian'}

--- PAYMENT DETAILS ---
Base Tour Fee (Your Earnings): ${formatPrice(b.amount)}
Platform Fee:        ${formatPrice(b.platformFee || (b.amount * 0.1))}
--------------------------------------------------
TOTAL CHARGED:       ${formatPrice(b.totalCharged || (b.amount * 1.1))}
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

  const acceptBooking = (id: string) => {
    setBookings((prev: any) => prev.map((b: any) => b.id === id ? { ...b, status: 'confirmed' } : b));
    setPaymentsList((prev: any) => prev.map((p: any) => p.paymentId.includes(id.split('-')[1]) ? { ...p, status: 'Captured' } : p));
    // Sync with BookingsContext for cross-panel updates
    updateBookingStatus(id, 'accepted');
  };

  const rejectBooking = (id: string) => {
    setBookings((prev: any) => prev.map((b: any) => b.id === id ? { ...b, status: 'rejected' } : b));
    setPaymentsList((prev: any) => prev.map((p: any) => p.paymentId.includes(id.split('-')[1]) ? { ...p, status: 'Rejected' } : p));
    // Sync with BookingsContext for cross-panel updates
    updateBookingStatus(id, 'rejected');
  };

  const modifyBooking = (id: string) => {
    setBookings((prev: any) => prev.map((b: any) => b.id === id ? { ...b, date: 'July 08, 2026', status: 'pending' } : b));
    setPaymentsList((prev: any) => prev.map((p: any) => p.paymentId.includes(id.split('-')[1]) ? { ...p, travelDate: 'July 08, 2026', status: 'Authorized (Escrow)' } : p));
  };

  // ─── CALENDAR STATE ───
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());

  useEffect(() => {
    const firstListing = guideListings[0];
    if (firstListing && firstListing.availableDates) {
      setAvailableDates(firstListing.availableDates);
    }
  }, [guideListings]);

  const toggleAvailabilityDate = (dateStr: string) => {
    let newDates: string[];
    if (availableDates.includes(dateStr)) {
      newDates = availableDates.filter(d => d !== dateStr);
    } else {
      newDates = [...availableDates, dateStr];
    }
    setAvailableDates(newDates);
    
    // Auto-update first listing if available
    const firstListing = guideListings[0];
    if (firstListing) {
      updateListing(firstListing.id, { availableDates: newDates });
    }
  };

  const [selectedPreviewListing, setSelectedPreviewListing] = useState<any | null>(null);

  // ─── MESSAGING CHAT STATE ───
  const [chatInput, setChatInput] = useState('');
  const [localChatMessages, setLocalChatMessages] = useState([
    { sender: 'traveler', text: 'Hi! Can we add Shibuya Sky to our itinerary?' },
    { sender: 'user', text: 'Yes, absolutely! We should buy tickets in advance.' }
  ]);

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setLocalChatMessages((prev: any) => [...prev, { sender: 'user', text: chatInput }]);
    setChatInput('');
    setTimeout(() => {
      setLocalChatMessages((prev: any) => [...prev, { sender: 'traveler', text: 'Great, I will book the tickets now!' }]);
    }, 1000);
  };

  // ─── QUOTATIONS STATE ───
  const [quotations, setQuotations] = useState<any[]>(() => {
    const saved = localStorage.getItem('routebyroot_quotations');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [];
  });
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);
  const [guideInputQuote, setGuideInputQuote] = useState('');
  const [guideCounterInputQuote, setGuideCounterInputQuote] = useState('');
  const [showGuideCounterInput, setShowGuideCounterInput] = useState(false);

  // Sync to localStorage and listen for changes from CustomerDashboard
  useEffect(() => {
    syncQuotations(quotations);
  }, [quotations]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'routebyroot_quotations' && e.newValue) {
        setQuotations(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ─── EARNINGS STATE ───
  const [earningsList, setEarningsList] = useState([
    { ref: 'TXN-998', type: 'Payout', amount: 450, date: 'June 18, 2026', status: 'completed' },
    { ref: 'TXN-999', type: 'Payout', amount: 320, date: 'June 22, 2026', status: 'completed' }
  ]);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const withdrawEarnings = () => {
    setWithdrawSuccess(true);
    setTimeout(() => setWithdrawSuccess(false), 2000);
  };

  // ─── VERIFICATION STATE ───
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [uploadFile, setUploadFile] = useState<string | null>(null);
  const [selectedIdType, setSelectedIdType] = useState<string>('');
  const [tempIdFile, setTempIdFile] = useState<File | null>(null);
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);

  const handleVerificationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTempIdFile(e.target.files[0]);
    }
  };

  const submitIdForApproval = () => {
    if (!selectedIdType) {
      alert('Please select an ID type first.');
      return;
    }
    if (!tempIdFile) {
      alert('Please upload a file/image of the ID.');
      return;
    }
    setUploadFile(tempIdFile.name);
    setVerificationStatus('under_review');
    setVerificationSubmitted(true);
  };

  // ─── HELP & SUPPORT TICKETS STATE ───
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [ticketFormShort, setTicketFormShort] = useState('');
  const [ticketFormDetailed, setTicketFormDetailed] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [ticketReplyInputs, setTicketReplyInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem('routebyroot_tickets');
    if (saved) {
      setSupportTickets(JSON.parse(saved));
    } else {
      const initial = [
        {
          id: 'TK-8809',
          shortDescription: 'Unable to download invoice for BK-8809',
          detailedExplanation: 'I completed my trip on June 26 and tried downloading the invoice but the download button does not seem to respond. I need the invoice for my company reimbursement.',
          status: 'in_progress',
          createdAt: 'June 26, 2026, 10:30 AM',
          messages: [
            { sender: 'user', text: 'I completed my trip on June 26 and tried downloading the invoice but the download button does not seem to respond. I need the invoice for my company reimbursement.', time: 'Jun 24, 10:30 AM' },
            { sender: 'support', text: 'Hello! We are looking into this bug. It seems the file generator failed. Could you please try again now or download it via the raw-text generator?', time: 'Jun 24, 11:15 AM' }
          ]
        }
      ];
      setSupportTickets(initial);
      syncTickets(initial);
    }
  }, []);

  const handleTicketSubmit = () => {
    if (!ticketFormShort.trim() || !ticketFormDetailed.trim()) {
      alert('Please fill out all required fields.');
      return;
    }
    setTicketSubmitting(true);
    setTimeout(() => {
      const newTicket = {
        id: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
        shortDescription: ticketFormShort,
        detailedExplanation: ticketFormDetailed,
        status: 'in_progress',
        createdAt: new Date().toLocaleString(),
        messages: [
          { sender: 'user', text: ticketFormDetailed, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
        ]
      };
      const updated = [newTicket, ...supportTickets];
      setSupportTickets(updated);
      syncTickets(updated);
      setTicketFormShort('');
      setTicketFormDetailed('');
      setTicketSubmitting(false);
    }, 800);
  };

  const handleTicketReply = (ticketId: string) => {
    const replyText = ticketReplyInputs[ticketId]?.trim();
    if (!replyText) return;

    const updated = supportTickets.map((t: any) => {
      if (t.id === ticketId) {
        return {
          ...t,
          messages: [
            ...t.messages,
            { sender: 'user', text: replyText, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
          ]
        };
      }
      return t;
    });

    setSupportTickets(updated);
    syncTickets(updated);
    setTicketReplyInputs((prev: any) => ({ ...prev, [ticketId]: '' }));
  };

  // ─── PROFILE CONFIGURATION STATE ───
  const profileKey = user?.id ? `rbr_profile_${user.id}` : 'rbr_profile_guest';
  const savedProfile = (() => {
    try { return JSON.parse(localStorage.getItem(profileKey) || '{}'); } catch { return {}; }
  })();

  const [profileName, setProfileName] = useState(savedProfile.name || user?.name || 'Guide Partner');
  const [profileBio, setProfileBio] = useState(savedProfile.bio || user?.bio || 'International student and cultural explorer living abroad. Passionate about showing travelers my local roots.');
  const [profileLanguages, setProfileLanguages] = useState(savedProfile.preferred_language || user?.preferred_language || 'English, Hindi, Japanese');
  const [profileRate, setProfileRate] = useState(savedProfile.hourly_rate || '50');
  const [profilePhone, setProfilePhone] = useState(savedProfile.phone_number || user?.phone_number || '');
  const [profileAvatar, setProfileAvatar] = useState(savedProfile.avatar_url || user?.avatar_url || '');
  const [passportFront, setPassportFront] = useState(savedProfile.passport_front || '');
  const [passportBack, setPassportBack] = useState(savedProfile.passport_back || '');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [profileCountry, setProfileCountry] = useState(savedProfile.country || user?.country || 'India');

  // Sync from user context only for DB-backed fields (not overriding local uploads)
  useEffect(() => {
    if (user) {
      const saved = (() => {
        try { return JSON.parse(localStorage.getItem(profileKey) || '{}'); } catch { return {}; }
      })();
      setProfileName(saved.name || user.name || 'Guide Partner');
      setProfileBio(saved.bio || user.bio || 'International student and cultural explorer living abroad. Passionate about showing travelers my local roots.');
      setProfileLanguages(saved.preferred_language || user.preferred_language || 'English, Hindi, Japanese');
      setProfilePhone(saved.phone_number || user.phone_number || '');
      setProfileAvatar(saved.avatar_url || user.avatar_url || '');
      setProfileCountry(saved.country || user.country || 'India');
      if (saved.passport_front) setPassportFront(saved.passport_front);
      if (saved.passport_back) setPassportBack(saved.passport_back);
    }
  }, [user, profileKey]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);

    // Save to localStorage first (always works, supports large base64 images)
    const localData = {
      name: profileName,
      bio: profileBio,
      preferred_language: profileLanguages,
      hourly_rate: profileRate,
      phone_number: profilePhone,
      avatar_url: profileAvatar,
      passport_front: passportFront,
      passport_back: passportBack,
      country: profileCountry
    };
    if (user?.id) {
      syncUserProfile(user.id, localData);
    }

    // Also attempt to save DB-safe fields to Supabase (skip large base64 data)
    try {
      if (user) {
        const dbData: any = {
          name: profileName,
          bio: profileBio,
          preferred_language: profileLanguages,
          phone_number: profilePhone,
          country: profileCountry,
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

    setProfileSuccess(true);
    if (refetchUser) {
      refetchUser().catch(err => console.warn("Failed refetching user: ", err));
    }
    setTimeout(() => setProfileSuccess(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFBFC', fontFamily: 'var(--font-body)', color: '#334155' }}>
      
      {/* ─── MOCKUP SUB-HEADER TABS BAR ─── */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #E4E7EC',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '12px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <img src="/logo.png" alt="RouteByRoot" style={{ height: 32 }} />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--navy)', fontSize: '1.15rem' }}>
                RouteByRoot
              </span>
            </Link>
            <div style={{ height: 18, width: 1, background: '#E2E8F0' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#F97316', background: 'rgba(249,115,22,0.1)', padding: '2px 8px', borderRadius: 4 }}>
              Guide Center
            </span>
          </div>

          {/* Navigation links (Mockup style) */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'bookings', label: 'Bookings' },
              { id: 'payments', label: 'Payments' },
              { id: 'reviews', label: 'Reviews' },
              { id: 'faq', label: 'FAQ' },
              { id: 'help', label: 'Help' }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: isActive ? '#06B6D4' : '#64748B',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    position: 'relative',
                    borderBottom: isActive ? '3px solid #06B6D4' : '3px solid transparent',
                    transition: 'all 0.15s'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}

            {/* Quotation Requests highlighted badge button */}
            <button
              onClick={() => setActiveTab('quotations')}
              style={{
                border: 'none',
                background: '#06B6D4',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                letterSpacing: '0.04em',
                boxShadow: '0 2px 6px rgba(6,182,212,0.2)'
              }}
            >
              ✉ Quotation Requests
            </button>
          </nav>

          {/* Right Header items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Currency:</span>
              <select
                value={currency}
                onChange={(e) => {
                  const cur = e.target.value;
                  setCurrency(cur);
                  localStorage.setItem('selected_currency_guide', cur);
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

            <Globe size={18} color="#64748B" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('settings')}  />
            


            {profileAvatar ? (
              <img
                src={profileAvatar}
                alt="Avatar"
                onClick={() => setActiveTab('settings')}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  cursor: 'pointer',
                  border: '1.5px solid #2BBCBF'
                }}
                
              />
            ) : (
              <div 
                onClick={() => setActiveTab('settings')}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F97316, #ea6c0a)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
                
              >
                {user?.name?.slice(0, 2).toUpperCase() || 'GD'}
              </div>
            )}
            
            <button
              onClick={handleSignOut}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#EF4444',
                fontSize: '0.8rem',
                fontWeight: 600,
                padding: '4px 8px'
              }}
              
            >
              <LogOut size={15} />
            </button>
          </div>

        </div>
      </header>

      {/* ─── MAIN CONTENT VIEW (SINGLE PAGE CONTAINER) ─── */}
      <main style={{ maxWidth: 1200, margin: '24px auto', padding: '0 24px' }}>
        
        {/* TAB: DASHBOARD (MOCKUP ACCURATE DESIGN) */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Title */}
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#1A1F5E', fontSize: '1.45rem', margin: 0 }}>
              Dashboard
            </h1>

            {/* Success Toast */}
            {successMessage && (
              <div style={{
                background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                color: '#FFFFFF',
                padding: '12px 20px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
                animation: 'fadeIn 0.3s ease'
              }}>
                <CheckCircle size={18} strokeWidth={3} />
                {successMessage}
              </div>
            )}
            {/* Metrics cards grid (6 cards layout) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="metrics-grid">
              
              {/* Total Bookings */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FFFFFF', padding: '16px 20px', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.01)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Total Bookings</span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#334155', margin: '8px 0 0' }}>12</h2>
              </div>

              {/* Total Earnings */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FFFFFF', padding: '16px 20px', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.01)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Total Earnings</span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#334155', margin: '8px 0 0' }}>{formatPrice(BASE_UNPAID_JPY + BASE_COMPLETED_JPY, true)}</h2>
              </div>

              {/* Active Listings */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FFFFFF', padding: '16px 20px', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.01)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Active Listings</span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#334155', margin: '8px 0 0' }}>2</h2>
              </div>

              {/* Total Views */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FFFFFF', padding: '16px 20px', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.01)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Total Views</span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#334155', margin: '8px 0 0' }}>384</h2>
              </div>

              {/* Total Shortlists */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FFFFFF', padding: '16px 20px', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.01)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Total Shortlists</span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#334155', margin: '8px 0 0' }}>28</h2>
              </div>

              {/* Total Reviews */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FFFFFF', padding: '16px 20px', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.01)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Total Reviews</span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#334155', margin: '8px 0 0' }}>57</h2>
              </div>

            </div>

            {/* Important Links Section */}
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#1A1F5E', fontSize: '1.1rem', marginBottom: 14 }}>
                Important Links
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                
                {/* Link 1: Availability */}
                <button
                  onClick={() => setActiveTab('calendar')}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    fontWeight: 700,
                    color: '#475569',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#06B6D4'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}
                >
                  <Calendar size={16} color="#64748B" />
                  Availability
                </button>

                {/* Link 2: Special Tariff */}
                <button
                  onClick={() => setActiveTab('settings')}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    fontWeight: 700,
                    color: '#475569',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#06B6D4'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}
                >
                  <Award size={16} color="#64748B" />
                  Special Tariff
                </button>

                {/* Link 3: Offers */}
                <button
                  onClick={() => setActiveTab('packages')}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    fontWeight: 700,
                    color: '#475569',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#06B6D4'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}
                >
                  <MapPin size={16} color="#64748B" />
                  Offers
                </button>

                {/* Link 4: Update Verification */}
                <button
                  onClick={() => setActiveTab('verification')}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    fontWeight: 700,
                    color: '#475569',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#06B6D4'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}
                >
                  <CheckCircle size={16} color="#64748B" />
                  Update Verification
                </button>

              </div>
            </div>

            {/* Listings Section */}
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#1A1F5E', fontSize: '1.1rem', margin: 0 }}>
                  Listings ({guideListings.length})
                </h3>
                 <button
                  onClick={() => { 
                    setEditingListingId(null); 
                    setListingThumbnail('');
                    setMediaImages([]);
                    setAddDetailsDocs({
                      passportFront: '',
                      passportBack: '',
                      visa: '',
                      passbookFront: '',
                      passbookBack: '',
                      localIdFront: '',
                      localIdBack: '',
                    });
                    setAddDetailsForm({
                      name: user?.name || '',
                      contact: '',
                      stayingCountry: '',
                      arrivalYear: '',
                      nationality: '',
                      currentAddress: '',
                      originAddress: '',
                      city1: '',
                      pin1: '',
                      city2: '',
                      pin2: '',
                      locations: '',
                      bankName: '',
                      ifsc: '',
                      accNo: '',
                      reAccNo: '',
                      holderName: '',
                      branch: '',
                      description: '',
                      price: '1000円/hr',
                      pickupTime: '',
                      dropTime: '',
                      pickupPoint: '',
                      dropPoint: ''
                    });
                    setActiveTab('add_details'); 
                  }}
                  style={{
                    background: '#06B6D4',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '50%',
                    width: 42,
                    height: 42,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(6,182,212,0.3)',
                    cursor: 'pointer',
                    transition: 'transform 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Plus size={22} strokeWidth={3} />
                </button>
              </div>

              {guideListings.length === 0 ? (
                <div style={{
                  background: '#FFFFFF',
                  border: '2px dashed #E2E8F0',
                  borderRadius: '16px',
                  padding: '40px',
                  textAlign: 'center',
                  color: '#94A3B8'
                }}>
                  <FileText size={40} strokeWidth={1.5} style={{ marginBottom: 12 }} />
                  <p style={{ fontWeight: 600, fontSize: '1rem', margin: '0 0 6px' }}>No listings yet</p>
                  <p style={{ fontSize: '0.85rem', margin: 0 }}>Click the + button to create your first listing</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {guideListings.map(listing => (
                    <div key={listing.id} style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '16px',
                      padding: '20px 24px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                      position: 'relative',
                      opacity: listing.enabled ? 1 : 0.6,
                      transition: 'opacity 0.2s'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                          {(() => {
                            const thumb = listing.thumbnailUrl || getStoredThumbnail(listing.id);
                            return (
                              <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0', flexShrink: 0 }}>
                                {thumb ? (
                                  <img src={thumb} alt="Listing Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #06B6D4, #1E3A8A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MapPin size={28} color="#FFFFFF" strokeWidth={1.5} />
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                          <div>
                            <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#1A1F5E', fontSize: '1.2rem', margin: '0 0 4px' }}>
                              {listing.guideName}
                            </h4>
                            <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
                              {listing.city1}, {listing.stayingCountry} &bull; {listing.price}
                            </p>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                background: listing.status === 'approved' ? 'rgba(34,197,94,0.1)' : listing.status === 'pending' ? 'rgba(249,115,22,0.1)' : 'rgba(239,68,68,0.1)',
                                color: listing.status === 'approved' ? '#16a34a' : listing.status === 'pending' ? '#d97706' : '#dc2626',
                                border: `1px solid ${listing.status === 'approved' ? '#16a34a30' : listing.status === 'pending' ? '#d9770630' : '#dc262630'}`,
                                borderRadius: '20px', padding: '3px 12px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize'
                              }}>
                                {listing.status === 'approved' ? <CheckCircle size={12} /> : listing.status === 'pending' ? <Clock size={12} /> : <X size={12} />}
                                {listing.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {/* Edit button */}
                          <button
                            onClick={() => {
                              setEditingListingId(listing.id);
                              setListingThumbnail(listing.thumbnailUrl || '');
                              setMediaImages((listing.galleryImages || []).filter(Boolean));
                              setAddDetailsDocs({
                                passportFront: listing.passportFrontUrl || '',
                                passportBack: listing.passportBackUrl || '',
                                visa: listing.visaUrl || '',
                                passbookFront: listing.passbookFrontUrl || '',
                                passbookBack: listing.passbookBackUrl || '',
                                localIdFront: listing.localIdFrontUrl || '',
                                localIdBack: listing.localIdBackUrl || '',
                              });
                              setAddDetailsForm({
                                name: listing.guideName || '',
                                contact: listing.contact || '',
                                stayingCountry: listing.stayingCountry || '',
                                arrivalYear: listing.arrivalYear || '',
                                nationality: listing.nationality || '',
                                currentAddress: listing.currentAddress || '',
                                originAddress: listing.originAddress || '',
                                city1: listing.city1 || '',
                                pin1: listing.pin1 || '',
                                city2: listing.city2 || '',
                                pin2: listing.pin2 || '',
                                locations: listing.locations || '',
                                bankName: listing.bankName || '',
                                ifsc: listing.ifsc || '',
                                accNo: listing.accNo || '',
                                reAccNo: listing.accNo || '',
                                holderName: listing.holderName || '',
                                branch: listing.branch || '',
                                description: listing.description || '',
                                price: listing.price || '',
                                pickupTime: listing.pickupTime || '',
                                dropTime: listing.dropTime || '',
                                pickupPoint: listing.pickupPoint || '',
                                dropPoint: listing.dropPoint || '',
                              });
                              setAvailableDates(Array.isArray(listing.availableDates) ? listing.availableDates.filter(Boolean) : []);
                              setActiveTab('add_details');
                            }}
                            style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#64748B', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#06B6D4'; e.currentTarget.style.color = '#06B6D4'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B'; }}
                            
                          >
                            <Edit size={16} />
                          </button>

                          {/* Preview button */}
                          <button
                            onClick={() => setSelectedPreviewListing(listing)}
                            style={{
                              background: 'none',
                              border: '1px solid #E2E8F0',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              color: '#0097A7',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#0097A7'; e.currentTarget.style.background = '#E0F2FE'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = 'none'; }}
                            
                          >
                            👁️ Preview
                          </button>

                          {/* Toggle enable/disable */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: listing.enabled ? '#22C55E' : '#94A3B8' }}>
                              {listing.enabled ? 'Active' : 'Disabled'}
                            </span>
                            <button
                              onClick={() => toggleListingEnabled(listing.id)}
                              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                            >
                              {listing.enabled ? <ToggleRight size={32} color="#22C55E" /> : <ToggleLeft size={32} color="#94A3B8" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>
        )}

        {/* TAB 2: BOOKINGS LIST */}
        {activeTab === 'bookings' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--navy)', marginBottom: 20 }}>
              Booking Requests & Orders
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {bookings.map((b: any) => (
                <div key={b.id} style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden', background: '#FFFFFF' }}>
                  <div style={{ padding: '16px 20px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Reference ID: {b.id}</span>
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
                      <h4 style={{ margin: '0 0 6px', fontWeight: 700 }}>Traveler: {b.traveler}</h4>
                      <div style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', gap: 16 }}>
                        <span>📅 Date: <strong>{b.date}</strong></span>
                        <span>👥 Guests: <strong>{b.totalGuests || 1}</strong></span>
                        <span>💰 Earnings: <strong>{formatPrice(b.amount)}</strong></span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setSelectedDetailedBooking(b)}
                        style={{ background: 'var(--navy)', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        🔍 View Details
                      </button>

                      {b.status === 'pending' && (
                        <>
                          <button
                            onClick={() => acceptBooking(b.id)}
                            style={{ background: '#22C55E', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => rejectBooking(b.id)}
                            style={{ background: '#FFF', border: '1px solid #EF4444', color: '#EF4444', padding: '8px 16px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENTS & EARNINGS */}
        {activeTab === 'payments' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--navy)', marginBottom: 20 }}>
              Payments & Earnings Workspace
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }} className="earnings-summary-grid">
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', background: '#FFFFFF' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Unpaid Balance</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#22C55E', margin: '8px 0 16px 0' }}>{formatPrice(BASE_UNPAID_JPY, true)}</h3>
                
                {withdrawSuccess ? (
                  <span style={{ color: '#16A34A', fontSize: '0.85rem', fontWeight: 700 }}>✓ Withdrawal request submitted!</span>
                ) : (
                  <button
                    onClick={withdrawEarnings}
                    style={{ background: '#22C55E', color: '#FFFFFF', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Withdraw Earnings
                  </button>
                )}
              </div>

              <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', background: '#FFFFFF' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Completed Payouts</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)', margin: '8px 0 16px 0' }}>{formatPrice(BASE_COMPLETED_JPY, true)}</h3>
              </div>
            </div>

            {(() => {
              const filteredPayments = paymentsList.filter((p: any) => 
                p.paymentId.toLowerCase().includes(paymentSearch.toLowerCase()) ||
                p.travelerName.toLowerCase().includes(paymentSearch.toLowerCase())
              );
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy)', margin: 0 }}>Payment Transactions</h3>
                    <input
                      type="text"
                      placeholder="🔍 Search Payment ID or Traveler Name..."
                      value={paymentSearch}
                      onChange={e => setPaymentSearch(e.target.value)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '30px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.88rem',
                        outline: 'none',
                        width: '280px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                      }}
                    />
                  </div>

                  <div style={{ overflowX: 'auto', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #F1F5F9', background: '#F8FAFC' }}>
                          <th style={{ textAlign: 'left', padding: '14px 16px', color: '#94A3B8', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Payment ID</th>
                          <th style={{ textAlign: 'left', padding: '14px 16px', color: '#94A3B8', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Payment Date</th>
                          <th style={{ textAlign: 'left', padding: '14px 16px', color: '#94A3B8', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Traveler Name</th>
                          <th style={{ textAlign: 'left', padding: '14px 16px', color: '#94A3B8', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Travel Date</th>
                          <th style={{ textAlign: 'left', padding: '14px 16px', color: '#94A3B8', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Amount</th>
                          <th style={{ textAlign: 'left', padding: '14px 16px', color: '#94A3B8', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayments.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>No payment records found matching your search.</td>
                          </tr>
                        ) : (
                          filteredPayments.map((p: any) => (
                            <tr key={p.paymentId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '14px 16px', fontWeight: 600, fontFamily: 'monospace', color: 'var(--navy)' }}>{p.paymentId}</td>
                              <td style={{ padding: '14px 16px', color: '#475569' }}>{p.paymentDate}</td>
                              <td style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>{p.travelerName}</td>
                              <td style={{ padding: '14px 16px', color: '#475569' }}>{p.travelDate}</td>
                              <td style={{ padding: '14px 16px', fontWeight: 700, color: '#22C55E' }}>{formatPrice(p.amount)}</td>
                              <td style={{ padding: '14px 16px' }}>
                                <span style={{
                                  background: p.status === 'Captured' ? '#DCFCE7' : p.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                                  color: p.status === 'Captured' ? '#15803D' : p.status === 'Rejected' ? '#B91C1C' : '#B45309',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  padding: '4px 10px',
                                  borderRadius: 20,
                                  textTransform: 'uppercase'
                                }}>
                                  {p.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* TAB 4: REVIEWS LIST */}
        {activeTab === 'reviews' && (
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', border: '1px solid #E2E8F0' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--navy)', marginBottom: 20 }}>
              Customer Reviews (57)
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { name: 'Michael Scott', rating: 5, comment: 'Amazing street food tour! Shivashish knows all local secrets.' },
                { name: 'Jim Halpert', rating: 5, comment: 'Very friendly guide. Answered all my historical questions.' }
              ].map((r, idx) => (
                <div key={idx} style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong style={{ fontSize: '0.9rem' }}>{r.name}</strong>
                    <span style={{ color: '#F97316' }}>{'★'.repeat(r.rating)}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>"{r.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: FAQ */}
        {activeTab === 'faq' && (
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', border: '1px solid #E2E8F0' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--navy)', marginBottom: 6 }}>
              Frequently Asked Questions (FAQ)
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: 24, lineHeight: 1.5 }}>
              Browse through general guide center FAQs.
            </p>

            <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', background: '#F8FAFC' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 700, color: 'var(--navy)' }}>Frequently Asked Questions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontWeight: 700, fontSize: '0.9rem' }}>How do I withdraw my earnings?</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>You can withdraw your earnings on the 'Payments' tab once your completed balance reaches 1,000円. Click 'Withdraw Earnings' and funds will settle to your bank account within 3 business days.</p>
                </div>
                <div style={{ height: 1, background: '#E2E8F0' }} />
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontWeight: 700, fontSize: '0.9rem' }}>How do I change my service rate?</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>Open the 'Special Tariff' settings on the dashboard or edit your profile details tab to adjust your hourly service fee rate at any time.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5.5: HELP SUPPORT */}
        {activeTab === 'help' && (
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', border: '1px solid #E2E8F0' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--navy)', marginBottom: 6 }}>
              Help & Support Center
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: 24, lineHeight: 1.5 }}>
              Have an issue or need assistance? Submit a support ticket below.
            </p>

            {/* ─── SUBMIT A TICKET FORM ─── */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: 14,
              border: '1px solid #E2E8F0',
              padding: '24px',
              marginBottom: 32
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
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
                  placeholder="e.g. Booking update issues"
                  value={ticketFormShort}
                  onChange={e => setTicketFormShort(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px',
                    border: '1.5px solid #CBD5E1', borderRadius: 10,
                    fontSize: '0.9rem',
                    color: '#1E293B', outline: 'none', background: '#FFFFFF',
                    boxSizing: 'border-box' as const
                  }}
                />
              </div>

              {/* Detailed Explanation */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  Detailed Explanation <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the issue in detail..."
                  value={ticketFormDetailed}
                  onChange={e => setTicketFormDetailed(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px',
                    border: '1.5px solid #CBD5E1', borderRadius: 10,
                    fontSize: '0.9rem',
                    color: '#1E293B', outline: 'none', background: '#FFFFFF',
                    boxSizing: 'border-box' as const, resize: 'vertical' as const,
                    minHeight: 100
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleTicketSubmit}
                disabled={ticketSubmitting}
                style={{
                  padding: '12px 32px', border: 'none', borderRadius: 10,
                  background: ticketSubmitting ? '#94A3B8' : 'var(--navy)',
                  color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem',
                  cursor: ticketSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(26,31,94,0.15)'
                }}
              >
                {ticketSubmitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>

            {/* ─── TICKETS LIST ─── */}
            {supportTickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
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
                      boxShadow: isExpanded ? '0 4px 20px rgba(0,0,0,0.06)' : '0 1px 4px rgba(0,0,0,0.03)'
                    }}>
                      <div
                        onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                        style={{
                          padding: '16px 20px',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          cursor: 'pointer',
                          background: isExpanded ? '#F1F5F9' : '#FAFBFC'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy)' }}>
                            {ticket.shortDescription}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: 2 }}>
                            {ticket.id} • {ticket.createdAt}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{
                            padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem',
                            fontWeight: 700, textTransform: 'uppercase' as const,
                            background: ticket.status === 'in_progress' ? '#FEF3C7' : ticket.status === 'resolved' ? '#DCFCE7' : '#F1F5F9',
                            color: ticket.status === 'in_progress' ? '#B45309' : ticket.status === 'resolved' ? '#15803D' : '#64748B'
                          }}>
                            {ticket.status === 'in_progress' ? 'In Progress' : 'Resolved'}
                          </span>
                          <span>{isExpanded ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div>
                          <div style={{
                            padding: '20px',
                            maxHeight: 360, overflowY: 'auto' as const,
                            display: 'flex', flexDirection: 'column' as const, gap: 12,
                            background: '#F8FAFC'
                          }}>
                            {ticket.messages.map((msg: any, idx: number) => (
                              <div key={idx} style={{
                                display: 'flex',
                                flexDirection: 'column' as const,
                                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                gap: 4
                              }}>
                                <div style={{
                                  fontSize: '0.72rem', fontWeight: 600,
                                  color: msg.sender === 'user' ? '#06B6D4' : '#F97316'
                                }}>
                                  {msg.sender === 'user' ? 'You' : 'Support Team'} <span style={{ color: '#94A3B8', fontWeight: 400, marginLeft: 4 }}>{msg.time}</span>
                                </div>
                                <div style={{
                                  maxWidth: '80%',
                                  padding: '10px 14px',
                                  borderRadius: msg.sender === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                  background: msg.sender === 'user' ? '#1E3A8A' : '#FFFFFF',
                                  color: msg.sender === 'user' ? '#FFFFFF' : '#334155',
                                  fontSize: '0.86rem',
                                  lineHeight: 1.55,
                                  border: msg.sender === 'user' ? 'none' : '1px solid #E2E8F0'
                                }}>
                                  {msg.text}
                                </div>
                              </div>
                            ))}
                          </div>

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
                                padding: '10px 14px', fontSize: '0.88rem', outline: 'none'
                              }}
                            />
                            <button
                              onClick={() => handleTicketReply(ticket.id)}
                              style={{
                                width: 40, height: 40, borderRadius: 10, border: 'none',
                                background: 'var(--navy)', color: '#FFFFFF',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', flexShrink: 0
                              }}
                            >
                              Send
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

        {/* TAB 6: QUOTATION REQUESTS (NEGOTIATION FLOW) */}
        {activeTab === 'quotations' && (() => {
          const myQuotations = quotations
            .filter((q: any) => q.guideName === addDetailsForm.name || q.guideName.split(' ')[0] === addDetailsForm.name.split(' ')[0])
            .sort((a: any, b: any) => {
              if (a.status === 'pending_guide' && b.status !== 'pending_guide') return -1;
              if (b.status === 'pending_guide' && a.status !== 'pending_guide') return 1;
              const timeA = parseInt(a.id.replace(/\\D/g, '')) || 0;
              const timeB = parseInt(b.id.replace(/\\D/g, '')) || 0;
              return timeB - timeA;
            });
          const selectedQ = myQuotations.find((q: any) => q.id === selectedQuotationId);

          return (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--navy)', marginBottom: 6 }}>
                Quotation Requests
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: 24 }}>
                Manage incoming quotation requests from travelers. You can quote once per request.
              </p>

              {!selectedQuotationId ? (
                /* MASTER LIST VIEW */
                <div style={{ display: 'grid', gap: 16 }}>
                  {myQuotations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: '#F8FAFC', borderRadius: 16, color: '#64748B' }}>
                      <div style={{ fontSize: '2rem', marginBottom: 10 }}>🏖️</div>
                      No quotation requests yet.
                    </div>
                  ) : (
                    myQuotations.map((q: any) => (
                      <div
                        key={q.id}
                        onClick={() => setSelectedQuotationId(q.id)}
                        style={{
                          border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px 20px',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          background: '#FFFFFF', cursor: 'pointer',
                          transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #1A1F5E 0%, #252C7A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 800, fontSize: '1.2rem' }}>
                            {q.guestName.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '1.05rem' }}>{q.guestName}</div>
                            <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: 4 }}>
                              ID: {q.id} • Date: {q.bookingDate} • Guests: {q.totalGuests || 1}
                            </div>
                          </div>
                        </div>
                        <div>
                          <span style={{
                            padding: '6px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '0.04em',
                            background:
                              q.status === 'accepted' ? '#DCFCE7' :
                              q.status === 'cancelled' ? '#FEE2E2' :
                              q.status === 'pending_guide' ? '#FEF3C7' : '#EFF6FF',
                            color:
                              q.status === 'accepted' ? '#15803D' :
                              q.status === 'cancelled' ? '#B91C1C' :
                              q.status === 'pending_guide' ? '#92400E' : '#1E40AF'
                          }}>
                            {q.status === 'pending_guide' ? '⏳ Needs Quote' :
                             q.status === 'guide_quoted' ? '📤 Quote Sent' :
                             q.status === 'traveler_countered' ? '🔄 Traveler Countered' :
                             q.status === 'guide_countered' ? '📤 Counter Sent' :
                             q.status === 'accepted' ? '✅ Deal Closed' :
                             '❌ Cancelled'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : selectedQ ? (
                /* DETAILED VIEW */
                <div>
                  <button
                    onClick={() => { setSelectedQuotationId(null); setShowGuideCounterInput(false); setGuideCounterInputQuote(''); }}
                    style={{ background: 'none', border: 'none', color: '#1E3A8A', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, padding: 0 }}
                  >
                    ← Back to All Quotations
                  </button>

                  <div style={{ border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden', background: '#FFFFFF', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    {/* Header */}
                    <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #1A1F5E 0%, #252C7A 100%)', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', fontFamily: 'var(--font-heading)' }}>Quotation #{selectedQ.id} — {selectedQ.guestName}</div>
                        <div style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: 4 }}>Date: {selectedQ.bookingDate} • Guests: {selectedQ.totalGuests || 1}</div>
                      </div>
                    </div>

                    {/* Traveler Customization Details */}
                    <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#1E293B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                        📋 Traveler Customization Details
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, fontSize: '0.85rem' }}>
                        <div>
                          <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>TRAVELER NAME</span>
                          <strong style={{ color: '#334155' }}>{selectedQ.guestName}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>TOURIST NATIONALITY</span>
                          <strong style={{ color: '#334155' }}>{selectedQ.touristNationality}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>TRAVELLING TO</span>
                          <strong style={{ color: '#334155' }}>{selectedQ.travellingTo}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>PICK-UP TIME & POINT</span>
                          <strong style={{ color: '#334155' }}>{selectedQ.pickupTime} @ {selectedQ.pickupPoint}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>DROP-OFF TIME & POINT</span>
                          <strong style={{ color: '#334155' }}>{selectedQ.dropTime} @ {selectedQ.dropPoint}</strong>
                        </div>
                      </div>
                      <div style={{ marginTop: 4, borderTop: '1px dashed #E2E8F0', paddingTop: 10 }}>
                        <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem', fontWeight: 600, marginBottom: 2 }}>🗺️ PLACES TO VISIT (ITINERARY)</span>
                        <strong style={{ color: '#475569', fontSize: '0.82rem', lineHeight: '1.4' }}>
                          {selectedQ.places || '—'}
                        </strong>
                      </div>
                    </div>

                    {/* Timeline / Flow */}
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                      
                      {/* Step 1: Traveler's Initial Request */}
                      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User size={16} color="#2563EB" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 600 }}>Traveler's Expected Budget</div>
                          <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '4px 0 0' }}>Review the customization details above and provide your quote.</p>
                        </div>
                      </div>

                      <div style={{ marginLeft: 17, width: 2, height: 16, background: '#E2E8F0' }} />

                      {/* Step 2: Guide Quotes */}
                      {selectedQ.status === 'pending_guide' && (
                        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Send size={16} color="#B45309" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 600, marginBottom: 8 }}>Your Quote (one-time only)</div>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                              <div style={{ position: 'relative', flex: 1, maxWidth: 200 }}>
                                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontWeight: 700 }}>
                                  {currency === 'JPY' ? '¥' : currency === 'EUR' ? '€' : currency === 'INR' ? '₹' : '$'}
                                </span>
                                <input
                                  type="number"
                                  value={guideInputQuote}
                                  onChange={e => setGuideInputQuote(e.target.value)}
                                  placeholder="e.g. 45"
                                  style={{
                                    width: '100%', border: '2px solid #CBD5E1', borderRadius: '10px',
                                    padding: '10px 14px 10px 28px', fontSize: '1rem', fontWeight: 700, outline: 'none'
                                  }}
                                />
                              </div>
                              <button
                                onClick={() => {
                                  const val = parseFloat(guideInputQuote);
                                  if (!val || val <= 0) { alert('Please enter a valid amount.'); return; }
                                  
                                  const rate = rates[currency] || 1;
                                  const valUsd = val / rate;
                                  const updatedQs = quotations.map(q => 
                                    q.id === selectedQ.id ? { ...q, guideQuoteUsd: valUsd, status: 'guide_quoted' } : q
                                  );
                                  setQuotations(updatedQs);
                                }}
                                style={{ background: 'var(--navy)', color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}
                              >
                                Send Quote
                              </button>
                            </div>
                            <p style={{ fontSize: '0.78rem', color: '#B45309', margin: '8px 0 0', fontWeight: 600 }}>⚠️ You can only submit one quote. Choose wisely.</p>
                          </div>
                        </div>
                      )}

                      {/* If already quoted, show the quote */}
                      {selectedQ.status !== 'pending_guide' && (
                        <>
                          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Send size={16} color="#0284C7" />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 600 }}>Your Quote</div>
                              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy)', marginTop: 2 }}>{formatPrice(selectedQ.guideQuoteUsd)}</div>
                            </div>
                          </div>
                          {selectedQ.status === 'guide_quoted' && (
                            <>
                              <div style={{ marginLeft: 17, width: 2, height: 16, background: '#E2E8F0' }} />
                              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <Clock size={16} color="#94A3B8" />
                                </div>
                                <div style={{ fontSize: '0.88rem', color: '#94A3B8', fontWeight: 600 }}>Waiting for traveler's response...</div>
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {/* Step 3: Traveler Accepted/Cancelled logic handled simply by status banners */}
                      {selectedQ.status === 'accepted' && (
                        <>
                          <div style={{ marginLeft: 17, width: 2, height: 16, background: '#E2E8F0' }} />
                          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <CheckCircle size={16} color="#15803D" />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.82rem', color: '#15803D', fontWeight: 700 }}>✅ Deal Closed</div>
                              <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '4px 0 8px' }}>The traveler accepted the quotation and is making payment.</p>
                              {/* Show the final agreed price */}
                              <div style={{
                                background: 'linear-gradient(135deg, #DCFCE7, #F0FDF4)',
                                border: '1.5px solid #86EFAC',
                                borderRadius: '10px',
                                padding: '12px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginTop: 4
                              }}>
                                <div>
                                  <div style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Final Agreed Price
                                  </div>
                                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#15803D', marginTop: 2 }}>
                                    {/* Show counter price if guide countered, else original quote */}
                                    {selectedQ.guideCounterUsd
                                      ? formatPrice(selectedQ.guideCounterUsd)
                                      : selectedQ.travelerCounterUsd
                                        ? formatPrice(selectedQ.travelerCounterUsd)
                                        : selectedQ.guideQuoteUsd
                                          ? formatPrice(selectedQ.guideQuoteUsd)
                                          : '—'}
                                  </div>
                                </div>
                                <CheckCircle size={28} color="#15803D" />
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {selectedQ.status === 'cancelled' && (
                        <>
                          <div style={{ marginLeft: 17, width: 2, height: 16, background: '#E2E8F0' }} />
                          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <X size={16} color="#B91C1C" />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.82rem', color: '#B91C1C', fontWeight: 700 }}>❌ Quotation Cancelled</div>
                              <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '4px 0 0' }}>This quotation was declined or cancelled.</p>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Step 3b: Traveler Countered */}
                      {(selectedQ.status === 'traveler_countered') && (
                        <>
                          <div style={{ marginLeft: 17, width: 2, height: 16, background: '#E2E8F0' }} />
                          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <MessageSquare size={16} color="#B45309" />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.82rem', color: '#B45309', fontWeight: 700 }}>🔄 Traveler Countered</div>
                              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#334155', marginTop: 2 }}>{formatPrice(selectedQ.travelerCounterUsd)}</div>

                              <div style={{ background: '#FFFBEB', borderLeft: '4px solid #F59E0B', padding: '8px 12px', borderRadius: '4px', fontSize: '0.78rem', color: '#92400E', fontWeight: 600, margin: '10px 0' }}>
                                ⚠️ You can only counter the quoted price <strong>one time</strong>. Use it wisely before accepting or declining.
                              </div>

                              {!showGuideCounterInput ? (
                                <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                                  <button
                                    onClick={() => {
                                      const updatedQs = quotations.map(q => q.id === selectedQ.id ? { ...q, status: 'accepted' } : q);
                                      setQuotations(updatedQs);
                                    }}
                                    style={{ background: '#22C55E', color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                                  >✓ Accept Counter</button>
                                  <button
                                    onClick={() => setShowGuideCounterInput(true)}
                                    style={{ background: '#F59E0B', color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                                  >🔄 Counter Back</button>
                                  <button
                                    onClick={() => {
                                      const updatedQs = quotations.map(q => q.id === selectedQ.id ? { ...q, status: 'cancelled' } : q);
                                      setQuotations(updatedQs);
                                    }}
                                    style={{ background: '#FFFFFF', color: '#EF4444', border: '2px solid #FCA5A5', borderRadius: '10px', padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                                  >✕ Decline</button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #CBD5E1', borderRadius: '10px', overflow: 'hidden', flex: 1, maxWidth: 220 }}>
                                    <span style={{ padding: '10px', background: '#F1F5F9', fontSize: '0.88rem', color: '#475569', fontWeight: 700 }}>{currency === 'JPY' ? '¥' : currency === 'EUR' ? '€' : currency === 'INR' ? '₹' : '$'}/hr</span>
                                    <input
                                      type="number"
                                      value={guideCounterInputQuote}
                                      onChange={e => setGuideCounterInputQuote(e.target.value)}
                                      placeholder="Your counter rate"
                                      style={{ flex: 1, border: 'none', padding: '10px', fontSize: '1rem', fontWeight: 700, outline: 'none' }}
                                      autoFocus
                                    />
                                  </div>
                                  <button
                                    onClick={() => {
                                      const val = parseFloat(guideCounterInputQuote);
                                      if (!val || val <= 0) { alert('Please enter a valid amount.'); return; }
                                      const rate = rates[currency] || 1;
                                      const valUsd = val / rate;
                                      const updatedQs = quotations.map(q => q.id === selectedQ.id ? { ...q, guideCounterUsd: valUsd, status: 'guide_countered' } : q);
                                      setQuotations(updatedQs);
                                      setShowGuideCounterInput(false);
                                    }}
                                    style={{ background: 'var(--navy)', color: '#FFF', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                                  >Send Counter</button>
                                  <button onClick={() => setShowGuideCounterInput(false)} style={{ background: '#FFF', border: '1px solid #CBD5E1', color: '#64748B', borderRadius: '10px', padding: '10px 16px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Step 4: Guide Countered Back */}
                      {(selectedQ.status === 'guide_countered') && (
                        <>
                          <div style={{ marginLeft: 17, width: 2, height: 16, background: '#E2E8F0' }} />
                          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Send size={16} color="#2563EB" />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.82rem', color: '#2563EB', fontWeight: 700 }}>🔄 Your Counter Sent</div>
                              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#334155', marginTop: 2 }}>{formatPrice(selectedQ.guideCounterUsd)}</div>
                              <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '4px 0 0' }}>Waiting for the traveler to accept or decline your final counter offer.</p>
                            </div>
                          </div>
                        </>
                      )}

                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })()}

        {/* TAB 7: CALENDAR (AVAILABILITY) */}
        {activeTab === 'calendar' && (
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', border: '1px solid #E2E8F0' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--navy)', marginBottom: 6 }}>
              Availability Calendar
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: 24 }}>
              Click on any date to toggle your availability. <span style={{ color: '#22C55E', fontWeight: 700 }}>Green</span> dates are available for travelers to book. <span style={{ color: '#EF4444', fontWeight: 700 }}>Red</span> dates are unavailable/booked.
            </p>
            
            <div style={{ maxWidth: '400px', margin: '0 auto', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <button
                  type="button"
                  onClick={() => {
                    if (calMonth === 0) {
                      setCalMonth(11);
                      setCalYear(y => y - 1);
                    } else {
                      setCalMonth(m => m - 1);
                    }
                  }}
                  style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '1.1rem' }}>
                  {new Date(calYear, calMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (calMonth === 11) {
                      setCalMonth(0);
                      setCalYear(y => y + 1);
                    } else {
                      setCalMonth(m => m + 1);
                    }
                  }}
                  style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, textAlign: 'center', marginBottom: 12 }}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <div key={d} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8' }}>{d}</div>
                ))}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
                {(() => {
                  const firstDay = new Date(calYear, calMonth, 1).getDay();
                  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
                  const cells = [];
                  
                  for (let i = 0; i < firstDay; i++) {
                    cells.push(<div key={`empty-${i}`} />);
                  }
                  
                  for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const cellDate = new Date(calYear, calMonth, day);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isPast = cellDate < today;
                    const isAvailable = availableDates.includes(dateStr);
                    
                    cells.push(
                      <button
                        key={day}
                        disabled={isPast}
                        onClick={() => toggleAvailabilityDate(dateStr)}
                        style={{
                          aspectRatio: '1',
                          borderRadius: '8px',
                          border: 'none',
                          background: isPast ? '#E2E8F0' : (isAvailable ? '#22C55E' : '#EF4444'),
                          color: isPast ? '#94A3B8' : '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          cursor: isPast ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                        onMouseEnter={e => {
                          if (!isPast) e.currentTarget.style.transform = 'scale(1.08)';
                        }}
                        onMouseLeave={e => {
                          if (!isPast) e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        {day}
                      </button>
                    );
                  }
                  return cells;
                })()}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: IDENTITY VERIFICATION */}
        {activeTab === 'verification' && (
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', border: '1px solid #E2E8F0' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--navy)', marginBottom: 20 }}>
              Identity & Background Verification
            </h2>

            <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', background: '#F8FAFC', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                <Award size={32} color={verificationStatus === 'under_review' ? '#B45309' : '#1E3A8A'} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Status: <span style={{ textTransform: 'capitalize' }}>{verificationStatus.replace('_', ' ')}</span></h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>Every guide on RouteByRoot must present national ID or passport documents to start accepting tours.</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 500, margin: '0 auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy)' }}>Step 1: Select ID Type to Verify</label>
                <select
                  value={selectedIdType}
                  onChange={e => setSelectedIdType(e.target.value)}
                  style={{ border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem', outline: 'none' }}
                >
                  <option value="">-- Choose ID Type --</option>
                  <option value="Passport">Passport</option>
                  <option value="National ID">National ID Card</option>
                  <option value="Driver's License">Driver's License</option>
                  <option value="Visa Document">Resident Visa Page</option>
                </select>
              </div>

              {selectedIdType && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy)' }}>Step 2: Upload ID Image/File</label>
                  <div style={{ border: '2px dashed #CBD5E1', borderRadius: '10px', padding: '30px', textAlign: 'center', background: '#FAFBFC' }}>
                    <input
                      type="file"
                      id="doc-upload"
                      onChange={handleVerificationUpload}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="doc-upload" style={{ background: 'var(--navy)', color: '#FFFFFF', padding: '10px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', display: 'inline-block' }}>
                      Choose File
                    </label>
                    {tempIdFile && <p style={{ marginTop: 12, fontSize: '0.85rem', color: '#22C55E' }}>✓ Selected: <strong>{tempIdFile.name}</strong></p>}
                  </div>
                </div>
              )}

              {selectedIdType && tempIdFile && (
                <button
                  onClick={submitIdForApproval}
                  style={{
                    background: '#22C55E',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s',
                    marginTop: 10
                  }}
                >
                  📤 Send for Approval
                </button>
              )}

              {verificationSubmitted && uploadFile && (
                <div style={{ background: '#DCFCE7', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '16px', textAlign: 'center', marginTop: 16 }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#15803D', fontWeight: 700 }}>
                    ✓ ID submitted for approval successfully!
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#475569' }}>
                    Document Type: <strong>{selectedIdType}</strong> ({uploadFile})
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 9: SETTINGS (PROFILE ADJUSTMENTS) */}
        {activeTab === 'settings' && (
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', border: '1px solid #E2E8F0' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--navy)', marginBottom: 20 }}>
              Profile Management & Settings
            </h2>

            {profileSuccess && (
              <div style={{ padding: '12px', background: '#DCFCE7', color: '#15803D', borderRadius: '6px', fontWeight: 600, marginBottom: 16, textAlign: 'center' }}>
                ✓ Profile updated successfully!
              </div>
            )}

            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '10px', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Preferred Languages</label>
                  <input
                    type="text"
                    value={profileLanguages}
                    onChange={e => setProfileLanguages(e.target.value)}
                    style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '10px', fontSize: '0.9rem' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Country of Origin</label>
                  <input
                    type="text"
                    value={profileCountry}
                    onChange={e => setProfileCountry(e.target.value)}
                    style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '10px', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Profile Bio & Service Description</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--orange)', fontWeight: 700 }}>Rich WYSIWYG Editor</span>
                </label>

                {/* Rich Text Editor Toolbar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  borderBottom: 'none',
                  borderRadius: '6px 6px 0 0',
                  padding: '8px 12px'
                }}>
                  <button type="button" style={{ fontWeight: 800, padding: '4px 8px', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: 4, fontSize: '0.85rem', cursor: 'pointer' }} onClick={() => setProfileBio((prev: any) => prev + ' **Bold Text**')}>B</button>
                  <button type="button" style={{ fontStyle: 'italic', padding: '4px 8px', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: 4, fontSize: '0.85rem', cursor: 'pointer' }} onClick={() => setProfileBio((prev: any) => prev + ' *Italic Text*')}>I</button>
                  <button type="button" style={{ padding: '4px 8px', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: 4, fontSize: '0.85rem', cursor: 'pointer' }} onClick={() => setProfileBio((prev: any) => prev + '\n- List Item')}>• List</button>
                  <button type="button" style={{ padding: '4px 8px', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: 4, fontSize: '0.85rem', cursor: 'pointer' }} onClick={() => setProfileBio((prev: any) => prev + ' # Heading')}>H</button>
                </div>

                <textarea
                  rows={4}
                  value={profileBio}
                  onChange={e => setProfileBio(e.target.value)}
                  placeholder="Describe your tours, your background, local tips you offer..."
                  style={{
                    border: '1px solid #CBD5E1',
                    borderRadius: '0 0 6px 6px',
                    padding: '12px',
                    fontSize: '0.9rem',
                    background: '#FAFBFD',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Default Hourly Rate (円/hr)</label>
                  <input
                    type="number"
                    value={profileRate}
                    onChange={e => setProfileRate(e.target.value)}
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
              </div>

              {/* Profile Image & Passport Upload section */}
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 16, marginTop: 8 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Documents & Identification</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                                setProfileAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80');
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
                {profileSuccess ? '✓ Saved!' : 'Save Profile Settings'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 10: OFFERS / ITINERARIES */}
        {activeTab === 'packages' && (
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--navy)', margin: 0 }}>
                Tour Packages & Itineraries
              </h2>
              <button
                onClick={() => setShowAddTourModal(true)}
                style={{ background: 'var(--navy)', color: '#FFFFFF', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}
              >
                + Add Tour Package
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {tours.map(tour => (
                <div key={tour.id} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', background: tour.active ? '#FFF' : '#F8FAFC' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontWeight: 700 }}>{tour.title}</h4>
                    <button onClick={() => toggleTourActive(tour.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      {tour.active ? <ToggleRight size={28} color="#22C55E" /> : <ToggleLeft size={28} color="#94A3B8" />}
                    </button>
                  </div>
                  <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#64748B' }}>{tour.duration} • <strong>{tour.price} / person</strong></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 11: ADD DETAILS (CREATE LISTING) */}
        {activeTab === 'add_details' && (
          <div style={{ marginBottom: 40, animation: 'fadeIn 0.3s ease-in-out' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.4rem', color: '#1E3A8A', marginBottom: 16 }}>
              Add Details
            </h2>

            <div style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '24px',
              border: '2px solid #06B6D4',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
            }}>
              
              {/* Row 1: 4 columns */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94A3B8' }}>Your Name:</label>
                  <input type="text" name="name" value={addDetailsForm.name} onChange={handleFormChange} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '0.95rem', outline: 'none', color: '#334155' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94A3B8' }}>Contact Number:</label>
                  <input type="text" name="contact" value={addDetailsForm.contact} onChange={handleFormChange} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '0.95rem', outline: 'none', color: '#334155' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94A3B8' }}>Staying Country:</label>
                  <input type="text" name="stayingCountry" value={addDetailsForm.stayingCountry} onChange={handleFormChange} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '0.95rem', outline: 'none', textAlign: 'center', color: '#334155' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94A3B8' }}>Year of coming to the country:</label>
                  <input type="text" name="arrivalYear" value={addDetailsForm.arrivalYear} onChange={handleFormChange} placeholder="e.g. 2021" style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '0.95rem', outline: 'none', textAlign: 'center', color: '#334155' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94A3B8' }}>Nationality:</label>
                  <input type="text" name="nationality" value={addDetailsForm.nationality} onChange={handleFormChange} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '0.95rem', outline: 'none', textAlign: 'center', color: '#334155' }} />
                </div>
              </div>

              {/* Row 2: Addresses */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94A3B8' }}>Current Address:</label>
                  <textarea name="currentAddress" value={addDetailsForm.currentAddress} onChange={handleFormChange} rows={3} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '0.95rem', outline: 'none', resize: 'none', color: '#334155', fontFamily: 'inherit' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94A3B8' }}>Origin Country Address:</label>
                  <textarea name="originAddress" value={addDetailsForm.originAddress} onChange={handleFormChange} rows={3} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '0.95rem', outline: 'none', resize: 'none', color: '#334155', fontFamily: 'inherit' }} />
                </div>
              </div>

              {/* Row 3: Cities & PINs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94A3B8' }}>City:</label>
                  <input type="text" name="city1" value={addDetailsForm.city1} onChange={handleFormChange} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '0.95rem', outline: 'none', textAlign: 'center', color: '#334155' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94A3B8' }}>Postal/PIN Code:</label>
                  <input type="text" name="pin1" value={addDetailsForm.pin1} onChange={handleFormChange} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '0.95rem', outline: 'none', textAlign: 'center', color: '#334155' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94A3B8' }}>City:</label>
                  <input type="text" name="city2" value={addDetailsForm.city2} onChange={handleFormChange} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '0.95rem', outline: 'none', textAlign: 'center', color: '#334155' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94A3B8' }}>Postal/PIN Code:</label>
                  <input type="text" name="pin2" value={addDetailsForm.pin2} onChange={handleFormChange} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '0.95rem', outline: 'none', textAlign: 'center', color: '#334155' }} />
                </div>
              </div>

              {/* Row 4: Upload IDs */}
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94A3B8', marginBottom: 6, display: 'block' }}>Upload ID's (Front & Back):</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                  {[
                    { key: 'passportFront', label: 'Passport (Front)' },
                    { key: 'passportBack', label: 'Passport (Back)' },
                    { key: 'visa', label: 'Visa' },
                    { key: 'passbookFront', label: 'Passbook (Front)' },
                    { key: 'passbookBack', label: 'Passbook (Back)' },
                    { key: 'localIdFront', label: 'Local ID (Front)' },
                    { key: 'localIdBack', label: 'Local ID (Back)' }
                  ].map(({ key, label }) => {
                    const file = addDetailsDocs[key];
                    return (
                      <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ border: `1px solid ${file ? '#22C55E' : '#E2E8F0'}`, borderRadius: '8px', padding: '12px', background: file ? '#F0FDF4' : '#FFFFFF', color: file ? '#15803D' : '#CBD5E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', minHeight: '46px' }}>
                          <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
                          {file ? <CheckCircle size={16} color="#22C55E" style={{ flexShrink: 0 }} /> : <Upload size={16} style={{ flexShrink: 0 }} />}
                          <input type="file" style={{ display: 'none' }} onChange={(e) => handleDocUpload(e, key)} />
                        </label>
                        {file && (
                          <div style={{ width: '100%', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <img src={file} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Row 5: Add Locations & Bank Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                
                {/* Left: Add Locations */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94A3B8' }}>Add Locations:</label>
                  <textarea 
                    name="locations"
                    value={addDetailsForm.locations}
                    onChange={handleFormChange}
                    rows={8} 
                    style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', fontSize: '0.95rem', outline: 'none', resize: 'none', color: '#334155', fontWeight: 600, height: '100%', fontFamily: 'inherit', lineHeight: 1.6 }} 
                  />
                </div>

                {/* Right: Bank Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94A3B8' }}>Add Bank Details:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <input type="text" name="bankName" value={addDetailsForm.bankName} onChange={handleFormChange} placeholder="Bank Name" style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', outline: 'none', color: '#334155', fontWeight: 600 }} />
                    <input type="text" name="ifsc" value={addDetailsForm.ifsc} onChange={handleFormChange} placeholder="IFSC Code" style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', outline: 'none', color: '#334155', fontWeight: 600 }} />
                    <input type="text" name="accNo" value={addDetailsForm.accNo} onChange={handleFormChange} placeholder="Account Number" style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', outline: 'none', color: '#334155', fontWeight: 600 }} />
                    <input type="text" name="reAccNo" value={addDetailsForm.reAccNo} onChange={handleFormChange} placeholder="Re Enter A/c No." style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', outline: 'none', color: '#334155', fontWeight: 600 }} />
                    <input type="text" name="holderName" value={addDetailsForm.holderName} onChange={handleFormChange} placeholder="Account Holder Name" style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', outline: 'none', color: '#334155', fontWeight: 600 }} />
                    <input type="text" name="branch" value={addDetailsForm.branch} onChange={handleFormChange} placeholder="Branch Name" style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', outline: 'none', color: '#334155', fontWeight: 600 }} />
                  </div>
                </div>
              </div>

              {/* Seamless continuation to second part */}
              <div style={{ height: 1, background: '#E2E8F0', margin: '16px 0' }} />
              
              {/* Detail Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94A3B8' }}>Detail Description <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 400 }}>(supports <b>bold</b>, <i>italic</i>, emojis)</span>:</label>
                {/* Rich text toolbar */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px 8px 0 0', padding: '8px 10px', alignItems: 'center' }}>
                  {[['bold','B'],['italic','I'],['underline','U']].map(([cmd, label]) => (
                    <button key={cmd} type="button"
                      onMouseDown={e => { e.preventDefault(); document.execCommand(cmd); }}
                      style={{ border: '1px solid #CBD5E1', background: '#fff', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontWeight: cmd==='bold'?700:400, fontStyle: cmd==='italic'?'italic':'normal', textDecoration: cmd==='underline'?'underline':'none', fontSize: '0.85rem', color: '#334155' }}>
                      {label}
                    </button>
                  ))}
                  <span style={{ color: '#CBD5E1', margin: '0 2px' }}>|</span>
                  {['😊','🌍','🗺️','✨','🤝','🏯','🌸','🍜','🚶','📍'].map(emoji => (
                    <button key={emoji} type="button"
                      onMouseDown={e => { e.preventDefault(); document.execCommand('insertText', false, emoji); }}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '0 2px' }}>
                      {emoji}
                    </button>
                  ))}
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  id="description-editor"
                  onInput={e => setAddDetailsForm(prev => ({...prev, description: (e.currentTarget as HTMLDivElement).innerHTML}))}
                  dangerouslySetInnerHTML={{ __html: addDetailsForm.description || '' }}
                  style={{
                    border: '1px solid #E2E8F0', borderTop: 'none', borderRadius: '0 0 8px 8px',
                    padding: '14px', minHeight: '180px', fontSize: '0.95rem',
                    lineHeight: 1.7, color: '#334155', background: '#FFFFFF',
                    outline: 'none', overflowY: 'auto'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                
                {/* Left Side: Pricing, Times, Points */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  
                  {/* Price */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94A3B8' }}>Add Package Price (hourly basis):</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#D1F5D3', borderRadius: '30px', padding: '10px 16px', border: '1px solid #BEE3F8', position: 'relative' }}>
                      <input 
                        type="text"
                        name="price"
                        value={addDetailsForm.price}
                        onChange={handleFormChange}
                        style={{ border: 'none', background: 'transparent', color: '#1E3A8A', fontSize: '1.25rem', fontWeight: 700, width: '100%', textAlign: 'center', outline: 'none' }} 
                      />
                      <div style={{ position: 'absolute', right: 10, display: 'flex', flexDirection: 'column', background: '#FCE4EC', borderRadius: '15px', overflow: 'hidden', border: '1px solid #F8B4D9' }}>
                        <button type="button" onClick={() => setAddDetailsForm((p: any) => ({...p, price: String(parseInt(p.price) + 10) + '円/hr'}))} style={{ border: 'none', background: 'transparent', padding: '4px 8px', cursor: 'pointer', fontSize: '0.7rem' }}>▲</button>
                        <button type="button" onClick={() => setAddDetailsForm((p: any) => ({...p, price: String(parseInt(p.price) - 10) + '円/hr'}))} style={{ border: 'none', background: 'transparent', padding: '4px 8px', cursor: 'pointer', fontSize: '0.7rem', borderTop: '1px solid #F8B4D9' }}>▼</button>
                      </div>
                    </div>
                  </div>

                  {/* Pick-up & Drop Time */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94A3B8' }}>Pick-up & Drop Time:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <input type="text" name="pickupTime" value={addDetailsForm.pickupTime} onChange={handleFormChange} placeholder="Pick-up Time" style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '0.95rem', outline: 'none', color: '#334155', fontWeight: 600, textAlign: 'center' }} />
                      <input type="text" name="dropTime" value={addDetailsForm.dropTime} onChange={handleFormChange} placeholder="Drop Time" style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '0.95rem', outline: 'none', color: '#334155', fontWeight: 600, textAlign: 'center' }} />
                    </div>
                  </div>

                  {/* Pick-up & Drop Point */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94A3B8' }}>Pick-up & Drop Point:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <input type="text" name="pickupPoint" value={addDetailsForm.pickupPoint} onChange={handleFormChange} placeholder="Pick-up Point" style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '0.95rem', outline: 'none', color: '#334155', fontWeight: 600, textAlign: 'center' }} />
                      <input type="text" name="dropPoint" value={addDetailsForm.dropPoint} onChange={handleFormChange} placeholder="Drop Point" style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '0.95rem', outline: 'none', color: '#334155', fontWeight: 600, textAlign: 'center' }} />
                    </div>
                  </div>

                </div>

                {/* Right Side: Uploads & Image Banner */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94A3B8' }}>Upload Thumbnail:</label>
                      <label style={{ background: listingThumbnail ? '#22C55E' : '#42C8CE', color: '#FFFFFF', borderRadius: '30px', padding: '12px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', transition: 'all 0.2s' }}>
                        {listingThumbnail ? <><CheckCircle size={14} strokeWidth={3} /> UPLOADED</> : <><Plus size={14} strokeWidth={3} /> ADD THUMBNAIL</>}
                        <input 
                          type="file" 
                          accept="image/*"
                          style={{ display: 'none' }} 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              compressImage(file, 400, 0.7).then(compressed => {
                                setListingThumbnail(compressed);
                              }).catch(() => {
                                // Fallback to raw base64 if compression fails
                                const reader = new FileReader();
                                reader.onloadend = () => setListingThumbnail(reader.result as string);
                                reader.readAsDataURL(file);
                              });
                            }
                          }} 
                        />
                      </label>
                      {listingThumbnail && (
                        <div style={{ marginTop: 8, width: '100%', height: '110px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                          <img src={listingThumbnail} alt="Thumbnail Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94A3B8' }}>Upload Images & Videos ({mediaImages.length}):</label>
                      <label style={{ background: mediaImages.length > 0 ? '#22C55E' : '#42C8CE', color: '#FFFFFF', borderRadius: '30px', padding: '12px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', transition: 'all 0.2s' }}>
                        <Plus size={14} strokeWidth={3} /> ADD MEDIA
                        <input type="file" multiple accept="image/*,video/*" style={{ display: 'none' }} onChange={handleMediaUpload} />
                      </label>
                      {mediaImages.length > 0 && (
                        <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, maxHeight: '200px', overflowY: 'auto', paddingRight: 4 }}>
                          {mediaImages.map((imgUrl, idx) => {
                            const isCurrentThumb = listingThumbnail === imgUrl;
                            return (
                              <div key={idx} style={{ position: 'relative', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                                {typeof imgUrl === 'string' && (imgUrl.startsWith('data:video') || imgUrl.match(/\.(mp4|webm|ogg)$/i)) ? (
                                  <video src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <img src={imgUrl} alt="Gallery Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                )}
                                
                                {/* Overlay Actions */}
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: 0, transition: 'opacity 0.2s', cursor: 'default' }}
                                     onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                     onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                                  
                                  {/* Set as Thumbnail */}
                                  <button
                                    type="button"
                                    onClick={() => setListingThumbnail(imgUrl)}
                                    
                                    style={{ background: isCurrentThumb ? '#EAB308' : '#FFFFFF', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.1s' }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                  >
                                    <Star size={14} color={isCurrentThumb ? '#FFFFFF' : '#EAB308'} fill={isCurrentThumb ? '#FFFFFF' : 'none'} strokeWidth={2.5} />
                                  </button>

                                  {/* Delete image */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMediaImages((prev: any) => prev.filter((_: any, i: number) => i !== idx));
                                      if (isCurrentThumb) setListingThumbnail('');
                                    }}
                                    
                                    style={{ background: '#EF4444', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.1s' }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                  >
                                    <X size={14} color="#FFFFFF" strokeWidth={2.5} />
                                  </button>

                                </div>

                                {/* Active Thumbnail Badge Indicator */}
                                {isCurrentThumb && (
                                  <div style={{ position: 'absolute', top: 4, left: 4, background: '#EAB308', color: '#FFFFFF', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Star size={8} fill="#FFFFFF" /> THUMB
                                  </div>
                                )}

                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', minHeight: '160px', background: 'url("https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80") center/cover no-repeat' }} />

                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, marginTop: 10 }}>
                <button
                  onClick={submitAddDetails}
                  style={{ background: '#94A3B8', color: '#FFFFFF', border: 'none', borderRadius: '4px', padding: '10px 24px', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#64748B'}
                  onMouseLeave={e => e.currentTarget.style.background = '#94A3B8'}
                >
                  <Save size={18} /> SAVE DRAFT
                </button>
                <button
                  onClick={submitListingForApproval}
                  style={{ background: '#1E3A8A', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '10px 28px', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1A1F5E'}
                  onMouseLeave={e => e.currentTarget.style.background = '#1E3A8A'}
                >
                  <Send size={18} /> {editingListingId ? 'RE-SUBMIT' : 'SUBMIT FOR APPROVAL'}
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* ADD TOUR MODAL */}
      {showAddTourModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '500px',
            width: '100%',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowAddTourModal(false)}
              style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 20 }}>Add Custom Tour Itinerary</h3>
            
            <form onSubmit={handleAddTourSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tour Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asakusa Historical Temple Walk"
                  value={newTourTitle}
                  onChange={e => setNewTourTitle(e.target.value)}
                  style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '10px', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Duration</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4 Hours"
                    value={newTourDuration}
                    onChange={e => setNewTourDuration(e.target.value)}
                    style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '10px', fontSize: '0.9rem' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Price per Person ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 45"
                    value={newTourPrice}
                    onChange={e => setNewTourPrice(e.target.value)}
                    style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '10px', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  background: 'var(--navy)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: 10
                }}
              >
                Create Itinerary
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TRIP DETAILS & INVOICE MODAL */}
      {selectedDetailedBooking && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '550px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            <button
              onClick={() => setSelectedDetailedBooking(null)}
              style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={20} />
            </button>

            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--orange)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
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
                  <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>TRAVELER</span>
                  <strong style={{ color: '#334155' }}>{selectedDetailedBooking.traveler}</strong>
                </div>
                <div>
                  <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>TRAVEL DATE</span>
                  <strong style={{ color: '#334155' }}>{selectedDetailedBooking.date}</strong>
                </div>
                <div>
                  <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>PICK-UP TIME</span>
                  <strong style={{ color: '#334155' }}>{selectedDetailedBooking.pickupTime || '09:00 AM'}</strong>
                </div>
                <div>
                  <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>GUIDE NATIONALITY</span>
                  <strong style={{ color: '#334155' }}>{selectedDetailedBooking.guideNationality || 'Indian'}</strong>
                </div>
                <div>
                  <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>TOURIST NATIONALITY</span>
                  <strong style={{ color: '#334155' }}>{selectedDetailedBooking.touristNationality || 'American'}</strong>
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
              </div>
            </div>

            <div style={{ height: '1px', background: '#F1F5F9' }} />

            {/* Section: Locations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#475569', fontWeight: 700 }}>Meeting Points</h4>
              <div>
                <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>📍 PICK-UP POINT</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>Shibuya Crossing</span>
              </div>
              <div style={{ marginTop: 6 }}>
                <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>🏁 DROP-OFF POINT</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>Shibuya Station</span>
              </div>
            </div>

            <div style={{ height: '1px', background: '#F1F5F9' }} />

            {/* Section: Payment Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#475569', fontWeight: 700 }}>Payment Summary</h4>
              <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Payment ID</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--navy)' }}>{selectedDetailedBooking.paymentId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Base Tour Fee</span>
                  <span>{formatPrice(selectedDetailedBooking.amount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Platform Fee</span>
                  <span>{formatPrice(selectedDetailedBooking.platformFee || (selectedDetailedBooking.amount * 0.1))}</span>
                </div>
                <div style={{ height: '1px', background: '#E2E8F0', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--navy)', fontSize: '0.95rem' }}>
                  <span>Total Paid by Traveler</span>
                  <span>{formatPrice(selectedDetailedBooking.totalCharged || (selectedDetailedBooking.amount * 1.1))}</span>
                </div>
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
                  {selectedDetailedBooking.status === 'confirmed' ? '✓ Payment Captured' : '⏳ Authorized (Escrow)'}
                </span>
              </div>
            </div>

            <div style={{ height: '1px', background: '#F1F5F9' }} />

            {/* Live Location Sharing */}
            {(() => {
              const bookingDateStr = selectedDetailedBooking.date;
              const today = new Date();
              const todayStr = today.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }).replace(/^(\w+)\s(\d+),\s(\d+)$/, '$1 $2, $3');
              // Parse booking date like "June 29, 2026" or "July 01, 2026"
              const bookingDate = new Date(bookingDateStr);
              const isTripDay = bookingDate.toDateString() === today.toDateString();
              const isLocationOn = liveLocationEnabled[selectedDetailedBooking.id] || false;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#475569', fontWeight: 700 }}>📍 Live Location Sharing</h4>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: isTripDay ? (isLocationOn ? '#F0FDF4' : '#F8FAFC') : '#F1F5F9',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    border: `1px solid ${isTripDay ? (isLocationOn ? '#BBF7D0' : '#E2E8F0') : '#E2E8F0'}`,
                    opacity: isTripDay ? 1 : 0.55,
                    transition: 'all 0.2s'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: isLocationOn ? 'linear-gradient(135deg, #22C55E, #16A34A)' : '#CBD5E1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.3s'
                      }}>
                        <Navigation size={18} color="#FFFFFF" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isLocationOn ? '#15803D' : '#475569' }}>
                          {isLocationOn ? 'Live Location Active' : 'Share Live Location'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: 2 }}>
                          {isTripDay
                            ? (isLocationOn ? `Visible to ${selectedDetailedBooking.traveler} only` : 'Enable to share your real-time location with the traveler')
                            : 'Available only on the day of the trip'
                          }
                        </div>
                      </div>
                    </div>
                    <button
                      disabled={!isTripDay}
                      onClick={() => {
                        const newState = !isLocationOn;
                        setLiveLocationEnabled((prev: any) => ({
                          ...prev,
                          [selectedDetailedBooking.id]: newState
                        }));
                        
                        try {
                          const existingLiveOps = JSON.parse(localStorage.getItem('routebyroot_admin_live_ops') || '[]');
                          const tripIndex = existingLiveOps.findIndex((op: any) => op.id === selectedDetailedBooking.id);
                          const liveOpData = {
                            id: selectedDetailedBooking.id,
                            traveler: selectedDetailedBooking.traveler,
                            guide: addDetailsForm.name || 'Guide',
                            tourName: selectedDetailedBooking.tourName,
                            date: selectedDetailedBooking.date,
                            locationSharing: newState ? 'active' : 'inactive',
                            touristLocation: newState ? 'Awaiting traveler GPS...' : 'Offline',
                            guideLocation: newState ? '35.6897° N, 139.6919° E (Mock GPS)' : 'Offline',
                            connection: newState ? 'Stable (5G)' : 'Waiting on toggle',
                            status: newState ? 'ongoing' : 'scheduled'
                          };
                          
                          if (tripIndex >= 0) {
                            existingLiveOps[tripIndex] = liveOpData;
                          } else {
                            existingLiveOps.unshift(liveOpData);
                          }
                          
                          localStorage.setItem('routebyroot_admin_live_ops', JSON.stringify(existingLiveOps));
                          window.dispatchEvent(new StorageEvent('storage', {
                            key: 'routebyroot_admin_live_ops',
                            newValue: JSON.stringify(existingLiveOps),
                            storageArea: localStorage
                          }));
                        } catch(e) { console.warn('Failed to sync live ops', e); }
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: isTripDay ? 'pointer' : 'not-allowed',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {isLocationOn
                        ? <ToggleRight size={36} color="#22C55E" />
                        : <ToggleLeft size={36} color={isTripDay ? '#94A3B8' : '#CBD5E1'} />
                      }
                    </button>
                  </div>
                  {!isTripDay && (
                    <p style={{ fontSize: '0.78rem', color: '#B45309', margin: 0, fontWeight: 600 }}>
                      ⚠️ This feature will unlock on {bookingDateStr} (the scheduled trip date).
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* TRAVELER PANEL PREVIEW MODAL */}
      {selectedPreviewListing && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050,
          padding: 24
        }}>
          <div style={{
            background: '#F8FAFC',
            borderRadius: '24px',
            maxWidth: '1050px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
          }}>
            {/* Header bar indicating it's a Preview */}
            <div style={{
              background: '#0097A7',
              color: '#FFFFFF',
              padding: '12px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                👁️ Traveler Panel Live Preview
              </span>
              <button
                onClick={() => setSelectedPreviewListing(null)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFFFFF', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '32px' }}>
              {/* IMAGE GALLERY GRID */}
              {(() => {
                const displayImages = [
                  ...(selectedPreviewListing.galleryImages || []),
                  selectedPreviewListing.thumbnailUrl,
                  'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80',
                  'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
                  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
                  'https://images.unsplash.com/photo-1498036882173-b41c28a8ba34?auto=format&fit=crop&w=800&q=80'
                ].filter(url => 
                  typeof url === 'string' && 
                  url.trim() !== '' && 
                  url !== 'undefined' && 
                  url !== 'null' &&
                  !url.startsWith('blob:')
                ).slice(0, 5);

                const totalPhotos = Math.max((selectedPreviewListing.galleryImages || []).filter(Boolean).length, 5);

                return (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr',
                    gap: 12,
                    height: '320px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    marginBottom: 24
                  }} className="photo-grid">
                    {displayImages[0]?.startsWith('data:video') || displayImages[0]?.match(/\\.(mp4|webm|ogg)$/i) ? <video src={displayImages[0]} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <img src={displayImages[0]} alt="main tour" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 12 }}>
                      {displayImages[1]?.startsWith('data:video') || displayImages[1]?.match(/\\.(mp4|webm|ogg)$/i) ? <video src={displayImages[1]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <img src={displayImages[1]} alt="sub1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      {displayImages[2]?.startsWith('data:video') || displayImages[2]?.match(/\\.(mp4|webm|ogg)$/i) ? <video src={displayImages[2]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <img src={displayImages[2]} alt="sub2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 12, position: 'relative' }}>
                      {displayImages[3]?.startsWith('data:video') || displayImages[3]?.match(/\\.(mp4|webm|ogg)$/i) ? <video src={displayImages[3]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <img src={displayImages[3]} alt="sub3" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      <div style={{ position: 'relative', overflow: 'hidden', height: '100%' }}>
                        {displayImages[4]?.startsWith('data:video') || displayImages[4]?.match(/\\.(mp4|webm|ogg)$/i) ? <video src={displayImages[4]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <img src={displayImages[4]} alt="sub4" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        {/* Dark gradient overlay on last image */}
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          gap: 8,
                        }}>
                          <div style={{
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(8px)',
                            borderRadius: '12px',
                            padding: '8px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                          }}>
                            <Image size={18} color="#1E3A8A" />
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1E3A8A' }}>See All Images</div>
                              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>{totalPhotos} photos</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* SPLIT LAYOUT */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 32 }} className="preview-split">
                {/* LEFT COLUMN: DETAILS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.6rem', color: '#1E3A8A', margin: '0 0 8px' }}>
                      {selectedPreviewListing.guideName}
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                      📍 Based in {selectedPreviewListing.city1}, {selectedPreviewListing.stayingCountry} &bull; 
                      <span style={{
                        background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700
                      }}>
                        ✓ Certified Guide
                      </span>
                    </p>
                  </div>

                  <div style={{ height: '1px', background: '#E2E8F0' }} />

                  {/* Bio */}
                  <div>
                    <h3 style={{ margin: '0 0 10px', fontSize: '1rem', fontWeight: 700, color: 'var(--navy)' }}>About the Guide</h3>
                    <div style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: selectedPreviewListing.description }} />
                  </div>

                  {/* Languages and details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, background: '#FFFFFF', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px', fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>Languages Spoken</h4>
                      <strong style={{ color: '#334155' }}>English, Hindi (Native), Japanese</strong>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px', fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>Nationality</h4>
                      <strong style={{ color: '#334155' }}>{selectedPreviewListing.nationality}</strong>
                    </div>
                    {selectedPreviewListing.arrivalYear && (
                      <div>
                        <h4 style={{ margin: '0 0 4px', fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>Living in {selectedPreviewListing.stayingCountry} Since</h4>
                        <strong style={{ color: '#334155' }}>{selectedPreviewListing.arrivalYear}</strong>
                      </div>
                    )}
                  </div>

                  {/* Tour locations / Places */}
                  <div>
                    <h3 style={{ margin: '0 0 10px', fontSize: '1rem', fontWeight: 700, color: 'var(--navy)' }}>📍 Planned Places to Visit</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {(selectedPreviewListing.locations || '').split(/[,\n]/).map((loc: string, idx: number) => {
                        const trimmed = loc.replace(/^\d+\)\s*/, '').trim();
                        if (!trimmed) return null;
                        return (
                          <span key={idx} style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                            {trimmed}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Meeting Details */}
                  <div style={{ background: '#F1F5F9', padding: 20, borderRadius: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>🛫 PICK-UP POINT</span>
                      <strong style={{ color: '#334155' }}>{selectedPreviewListing.pickupPoint || 'Not Specified'}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>🏁 DROP-OFF POINT</span>
                      <strong style={{ color: '#334155' }}>{selectedPreviewListing.dropPoint || 'Not Specified'}</strong>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: SIDEBAR */}
                <div>
                  <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '20px',
                    padding: '24px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    position: 'sticky',
                    top: 80
                  }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
                      <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy)' }}>
                        {selectedPreviewListing.price.includes('円') ? selectedPreviewListing.price : `${selectedPreviewListing.price}円/hr`}
                      </span>
                    </div>

                    <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '12px', padding: '12px 14px', marginBottom: 20 }}>
                      <span style={{ fontSize: '0.8rem', color: '#C2410C', fontWeight: 700, display: 'block', marginBottom: 2 }}>
                        🇮🇳 Tourist Native Match (Hindi)
                      </span>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: '#9A3412', lineHeight: 1.4 }}>
                        This guide speaks Hindi natively, which matches your profile!
                      </p>
                    </div>

                    <button
                      disabled
                      style={{
                        width: '100%',
                        background: '#FF385C',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '14px',
                        fontWeight: 700,
                        fontSize: '1rem',
                        cursor: 'not-allowed',
                        opacity: 0.8
                      }}
                    >
                      Book Tour (Preview Only)
                    </button>
                    
                    <button
                      onClick={() => setSelectedPreviewListing(null)}
                      style={{
                        width: '100%',
                        background: 'none',
                        border: '1px solid #CBD5E1',
                        borderRadius: '10px',
                        padding: '10px',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        color: '#64748B',
                        cursor: 'pointer',
                        marginTop: 10
                      }}
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
