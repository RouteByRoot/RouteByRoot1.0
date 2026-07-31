import { useState, useEffect } from 'react';
import { Home, Search, Star, CheckCircle, Heart, Share2, Calendar, Clock, MapPin, Globe, HelpCircle, ArrowLeft, ArrowRight, Plus, Check, MessageSquare, Send, X, User, Eye, Image, ChevronLeft, ChevronRight, Shield, BadgeCheck, FileText, Upload, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useListings } from '../contexts/ListingsContext';
import { useBookings } from '../contexts/BookingsContext';

interface GuideItem {
  id: string;
  name: string;
  country: string;
  city: string;
  price: number;
  placesCount: number;
  rating: number;
  totalRatings: number;
  avatar: string;
  tourImage: string;
  galleryImages: string[];
  nationality: string;
  arrivalYear?: string;
  languages: string[];
  bio: string;
  richDescription: string;
  places: string[];
  pickupTime: string;
  dropTime: string;
  pickupPoint: string;
  dropPoint: string;
  unavailableDates: string[];
  verification: {
    identityVerified: boolean;
    backgroundCheck: boolean;
    localKnowledge: boolean;
    documentsSubmitted: string[];
    verifiedSince: string;
    badgeLevel: string;
  };
  reviews: Array<{ name: string; location: string; city: string; rating: number; comment: string }>;
  availableDates?: string[];
}

const guidesData: GuideItem[] = [
  {
    id: 'guide-1',
    name: 'Shrilakshmi Shetty',
    country: 'JAPAN',
    city: 'TOKYO',
    price: 500,
    placesCount: 5,
    rating: 5.0,
    totalRatings: 715,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    tourImage: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1498036882173-b41c28a8ba34?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=800&q=80',
    ],
    nationality: 'Indian',
    languages: ['Hindi', 'English', 'Japanese'],
    bio: 'Traveling to Japan was always a dream. I love showing visitors the traditional streets, neon skylines, and hidden temples where you can connect with our own culture.',
    richDescription: `<h3>🌸 About My Tour Experience</h3>
<p>Having lived in Tokyo for over <strong>5 years</strong>, I've developed an intimate knowledge of this incredible city. My tours are designed to blend the <em>traditional</em> and the <em>ultra-modern</em> — from ancient temples to neon-lit streets.</p>
<h3>🎯 What Makes My Tour Special</h3>
<ul>
<li><strong>Cultural Immersion:</strong> I take you beyond the tourist spots into genuine local neighborhoods where you can experience authentic Japanese daily life.</li>
<li><strong>Language Support:</strong> Fluent in Hindi, English & Japanese — no language barrier for Indian travelers!</li>
<li><strong>Photography Spots:</strong> I know every hidden Instagrammable corner of Tokyo.</li>
<li><strong>Food Adventures:</strong> Vegetarian/Halal-friendly options are always part of the plan.</li>
</ul>
<h3>📋 Tour Includes</h3>
<p>Local metro passes, temple entrance tickets, a traditional tea ceremony experience, and a personalized digital photo album of your trip.</p>
<blockquote>
"I don't just show you Tokyo — I help you <strong>feel</strong> it. Every street has a story, and I'm here to tell you each one." — Shrilakshmi
</blockquote>`,
    places: ['Senso-ji Temple', 'Shibuya Crossing', 'Harajuku Takeshita', 'Shinjuku Gyoen', 'Meiji Shrine'],
    unavailableDates: ['2025-12-25', '2025-12-31', '2026-01-01', '2026-01-05', '2026-01-12', '2026-07-04', '2026-07-10', '2026-07-15'],
    pickupTime: '09:00 AM',
    dropTime: '19:00 PM',
    pickupPoint: 'Shibuya Station, Hachiko Exit',
    dropPoint: 'Shibuya Station',
    verification: {
      identityVerified: true,
      backgroundCheck: true,
      localKnowledge: true,
      documentsSubmitted: ['Government ID (Aadhaar)', 'Passport', 'Local Residence Proof', 'First Aid Certificate'],
      verifiedSince: 'January 2024',
      badgeLevel: 'Gold Verified'
    },
    reviews: [
      { name: 'Rohan Gupta', location: 'Delhi, India', city: 'Tokyo, Japan', rating: 5.0, comment: 'Incredible guide! Feels like a friend from home showing you around Tokyo.' },
      { name: 'Kavita Iyer', location: 'Bangalore, India', city: 'Osaka, Japan', rating: 5.0, comment: 'Very attentive and speaks Hindi fluently. It was so helpful in navigating!' }
    ]
  },
  {
    id: 'guide-2',
    name: 'Prakhar Gupta',
    country: 'JAPAN',
    city: 'TOKYO',
    price: 550,
    placesCount: 5,
    rating: 4.8,
    totalRatings: 146,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    tourImage: 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=800&q=80',
    ],
    nationality: 'Indian',
    languages: ['Hindi', 'English'],
    bio: 'Specialized in photography and historical walks. I will help you capture the best views and take you to places only local photographers know about.',
    richDescription: `<h3>📷 Photography & Heritage Specialist</h3>
<p>I'm a professional travel photographer turned guide. Every tour with me is a <strong>visual adventure</strong> — you'll walk away with stunning photos and unforgettable memories.</p>
<h3>🏛️ Historical Walking Tours</h3>
<ul>
<li><strong>Kyoto Temple Circuit:</strong> Experience the mystical atmosphere of ancient Buddhist temples at golden hour.</li>
<li><strong>Bamboo Grove Photography:</strong> Expert tips for capturing the perfect bamboo forest shot.</li>
<li><strong>Night Photography:</strong> Tokyo neon lights, reflections, and long-exposure cityscapes.</li>
</ul>
<h3>📦 What's Included</h3>
<p>Camera tips & tutorials, edited highlight photos delivered within 48 hours, all entrance fees, and local snack stops.</p>
<blockquote>
"Photography is the art of frozen time — let me help you freeze your best moments in Japan." — Prakhar
</blockquote>`,
    places: ['Fushimi Inari Outer Path', 'Arashiyama Bamboo Grove', 'Kiyomizu-dera', 'Gion District', 'Nishiki Market'],
    unavailableDates: ['2025-12-24', '2025-12-26', '2026-01-02', '2026-01-08', '2026-07-01', '2026-07-07', '2026-07-20'],
    pickupTime: '08:30 AM',
    dropTime: '18:30 PM',
    pickupPoint: 'Tokyo Station, Marunouchi Exit',
    dropPoint: 'Nearby Central Subway',
    verification: {
      identityVerified: true,
      backgroundCheck: true,
      localKnowledge: true,
      documentsSubmitted: ['Government ID (PAN Card)', 'Passport', 'Photography License'],
      verifiedSince: 'March 2024',
      badgeLevel: 'Silver Verified'
    },
    reviews: [
      { name: 'Aman Verma', location: 'Mumbai, India', city: 'Tokyo, Japan', rating: 4.8, comment: 'Excellent photography guidance and custom spots. Highly recommend Prakhar!' }
    ]
  },
  {
    id: 'guide-3',
    name: 'Shivashish Chamoli',
    country: 'JAPAN',
    city: 'TOKYO',
    price: 750,
    placesCount: 5,
    rating: 4.7,
    totalRatings: 237,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    tourImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1498036882173-b41c28a8ba34?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    ],
    nationality: 'Indian',
    languages: ['Hindi', 'English', 'Japanese'],
    bio: 'Traveling to Japan was always a dream, but we were quite anxious because of the language barrier and cultural differences. Finding someone from our own country was such a relief! Let me guide you to the absolute best spots.',
    richDescription: `<h3>🗾 Complete Tokyo Experience</h3>
<p>I offer the most <strong>comprehensive Tokyo tour</strong> available on RouteByRoot. With <em>6 unique stops</em> carefully selected over years of exploration, you'll experience both the iconic landmarks and secret local gems.</p>
<h3>✨ Tour Highlights</h3>
<ul>
<li><strong>Tokyo Tower Sunset:</strong> Timed visits for the most breathtaking golden hour views of the entire city skyline.</li>
<li><strong>Local Market Experience:</strong> Explore the vibrant Shibuya Rokko Market with a local's perspective — street food, crafts, and hidden stalls.</li>
<li><strong>Traditional Eateries:</strong> Authentic Japanese dining at Sukesan Eatery, a 100+ year old family restaurant.</li>
<li><strong>Hidden Gardens:</strong> Peaceful escape to Abeyamakoen, a garden most tourists never discover.</li>
</ul>
<h3>🎒 What's Included</h3>
<p>All transportation passes, lunch at a local restaurant, entrance fees to Tokyo Tower & Castle, a souvenir gift bag, and a personalized travel itinerary PDF.</p>
<h3>⚡ Why Choose Me</h3>
<p>Having guided over <strong>200+ travelers</strong>, I understand exactly what first-time visitors need. My tours are designed to be <em>stress-free, well-paced, and deeply cultural</em>.</p>
<blockquote>
"The best way to experience a foreign land is through the eyes of someone who knows it like home." — Shivashish
</blockquote>`,
    places: ['Tokyo City', 'Shibuya Rokko Market', 'Sukesan Eatery', 'Tokyo Tower', 'Abeyamakoen', 'Tokyo Castle'],
    unavailableDates: ['2025-12-28', '2026-01-03', '2026-01-10', '2026-07-06', '2026-07-14', '2026-07-22'],
    pickupTime: '09:20 AM',
    dropTime: '19:30 PM',
    pickupPoint: 'Shibuya Metro Station, North Exit',
    dropPoint: 'Nearby Station',
    verification: {
      identityVerified: true,
      backgroundCheck: true,
      localKnowledge: true,
      documentsSubmitted: ['Government ID (Aadhaar)', 'Passport', 'Tourism Certification', 'Local Residence Proof', 'First Aid Certificate'],
      verifiedSince: 'November 2023',
      badgeLevel: 'Platinum Verified'
    },
    reviews: [
      { name: 'Aarav Mehta', location: 'Mumbai, India', city: 'Osaka, Japan', rating: 4.9, comment: 'Incredible experience! Rohan was not just a guide, but felt like a friend from home. He helped us discover hidden shrines and took us to a local ramen shop I would never have found alone.' },
      { name: 'Sarah Ahmed', location: 'Dubai, UAE', city: 'Busan, South Korea', rating: 4.7, comment: 'Really grateful for this platform! It was such a relief to explore the city with someone who understood my language and preferences. Very well-planned itinerary.' },
      { name: 'Carlos Ruiz', location: 'Mexico City, Mexico', city: 'Hanoi, Vietnam', rating: 5.0, comment: 'Amazing time, very thorough and respectful. Showed us amazing local foods!' }
    ]
  },
  {
    id: 'guide-4',
    name: 'Mohammad Gafoor',
    country: 'JAPAN',
    city: 'TOKYO',
    price: 480,
    placesCount: 5,
    rating: 3.8,
    totalRatings: 412,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    tourImage: 'https://images.unsplash.com/photo-1452421820064-e2869df4a5f6?auto=format&fit=crop&w=600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1452421820064-e2869df4a5f6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1498036882173-b41c28a8ba34?auto=format&fit=crop&w=800&q=80',
    ],
    nationality: 'Indian',
    languages: ['Urdu', 'Hindi', 'English'],
    bio: 'Avid culinary traveler. Let me take you to Halal-friendly food places, vintage electronics shops in Akihabara, and peaceful parks.',
    richDescription: `<h3>🍜 Halal Food & Culture Tour Specialist</h3>
<p>As a <strong>culinary-focused guide</strong>, I specialize in Halal-friendly dining experiences across Tokyo. My tours are perfect for travelers who want to experience authentic Japanese cuisine without dietary concerns.</p>
<h3>🎮 Unique Experiences</h3>
<ul>
<li><strong>Akihabara Tech Tour:</strong> Explore the world-famous electronics district with insider knowledge on the best deals and hidden floors.</li>
<li><strong>Halal Ramen Trail:</strong> Visit certified Halal ramen shops, including the famous Ouka Ramen.</li>
<li><strong>Park & Garden Walks:</strong> Peaceful strolls through Ueno and Sumida parks with cultural commentary.</li>
<li><strong>Street Food Safari:</strong> Asakusa's best street food spots, all verified Halal-friendly.</li>
</ul>
<h3>🕌 Dietary Accommodation</h3>
<p>I maintain an updated list of over <strong>50 Halal-certified restaurants</strong> across Tokyo. Every food stop is pre-verified for dietary compliance.</p>
<blockquote>
"Great food brings people together — no matter where you're from or what you eat." — Mohammad
</blockquote>`,
    places: ['Akihabara Electric Town', 'Ueno Park', 'Asakusa Street Food Alley', 'Sumida Park', 'Halal Ramen Ouka'],
    unavailableDates: ['2025-12-23', '2025-12-29', '2026-01-06', '2026-01-13', '2026-07-02', '2026-07-11', '2026-07-18', '2026-07-25'],
    pickupTime: '10:00 AM',
    dropTime: '20:00 PM',
    pickupPoint: 'Akihabara Station Central Exit',
    dropPoint: 'Local Station',
    verification: {
      identityVerified: true,
      backgroundCheck: true,
      localKnowledge: false,
      documentsSubmitted: ['Government ID (Aadhaar)', 'Passport'],
      verifiedSince: 'June 2024',
      badgeLevel: 'Verified'
    },
    reviews: [
      { name: 'Zeeshan Khan', location: 'Lucknow, India', city: 'Tokyo, Japan', rating: 4.0, comment: 'Very helpful guide who understands dietary preferences perfectly!' }
    ]
  }
];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getApprovedListings } = useListings();
  const { createBooking } = useBookings();
  const approvedListings = getApprovedListings();
  
  const approvedListingsFiltered = approvedListings.filter(l => {
    // Exclude disabled guides
    const isDisabled = localStorage.getItem(`routebyroot_guide_disabled_${l.id}`) === 'true' || 
                       localStorage.getItem(`routebyroot_guide_disabled_${l.guideEmail}`) === 'true' ||
                       localStorage.getItem(`routebyroot_guide_disabled_usr-default-shivashish`) === 'true' && l.id === 'L-default-1';
    return !isDisabled;
  });

  // Get active verified list from localStorage
  const activeVerifiedList: string[] = JSON.parse(localStorage.getItem('routebyroot_verified_guide_ids') || '["usr-2"]');

  const allGuides: GuideItem[] = [
    ...guidesData.filter(g => {
      const isDisabled = localStorage.getItem(`routebyroot_guide_disabled_${g.id}`) === 'true';
      return !isDisabled;
    }).map(g => {
      // Map verification status from list
      const verified = activeVerifiedList.includes(g.id) || g.id === 'guide-3' || g.id === 'guide-4' || g.id === 'usr-default-shivashish';
      return {
        ...g,
        verification: {
          ...g.verification,
          identityVerified: verified,
          backgroundCheck: verified,
          localKnowledge: verified
        }
      };
    }),
    ...approvedListingsFiltered.map(l => {
      const isGuideVerified = activeVerifiedList.includes(l.id) || activeVerifiedList.includes(l.guideEmail) || activeVerifiedList.includes('usr-default-shivashish') && l.id === 'L-default-1';
      const profileKey = `rbr_profile_${l.guideEmail}`;
      let profileAvatar = '';
      try {
        const savedProfile = JSON.parse(localStorage.getItem(profileKey) || '{}');
        profileAvatar = savedProfile.avatar || '';
      } catch (e) {}

      const activeThumb = l.thumbnailUrl || '';

      return {
        id: l.id,
        name: l.guideName,
        country: l.stayingCountry,
        city: l.city1,
        price: parseInt(l.price) || 500,
        placesCount: l.locations.split('\n').filter(Boolean).length,
        rating: 5.0,
        totalRatings: 1,
        avatar: profileAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        tourImage: activeThumb || 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80',
        galleryImages: l.galleryImages && l.galleryImages.length > 0 
          ? l.galleryImages 
          : [activeThumb || 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80'],
        nationality: l.nationality,
        arrivalYear: l.arrivalYear,
        languages: ['English'],
        bio: l.description,
        richDescription: `<h3>🌸 About My Tour Experience</h3><p>${l.description.replace(/\n/g, '<br/>')}</p>`,
        places: l.locations.split('\n').filter(Boolean).map(line => line.replace(/^\d+[\)\.]\s*/, '')),
        pickupTime: l.pickupTime || '09:00 AM',
        dropTime: l.dropTime || '19:00 PM',
        pickupPoint: l.pickupPoint || 'Central Station',
        dropPoint: l.dropPoint || 'Central Station',
        unavailableDates: [],
        availableDates: l.availableDates,
        verification: {
          identityVerified: isGuideVerified,
          backgroundCheck: isGuideVerified,
          localKnowledge: isGuideVerified,
          documentsSubmitted: ['Passport', 'Local ID'],
          verifiedSince: 'June 2026',
          badgeLevel: 'Verified Guide'
        },
        reviews: []
      };
    })
  ];

  // ─── TABS & FLOW STATE ───
  const [activeView, setActiveView] = useState<'listings' | 'details' | 'verification' | 'booking' | 'success' | 'become-partner' | 'customize'>('listings');
  const [selectedGuide, setSelectedGuide] = useState<GuideItem>(guidesData[2]);
  const [bookedGuides, setBookedGuides] = useState<string[]>([]);
  
  // Search Inputs
  const [country, setCountry] = useState('JAPAN');
  const [date, setDate]       = useState('2025-12-24');
  const [city, setCity]       = useState('TOKYO');
  const [time, setTime]       = useState('10:00');

  // Filter Toggles
  const [myOrigin, setMyOrigin]     = useState(false);
  const [myLanguage, setMyLanguage] = useState(false);
  const [recommended, setRecommended] = useState(false);

  // Shortlist State
  const [shortlistedIds, setShortlistedIds] = useState<string[]>(['guide-3']);
  const [showShortlistOnly, setShowShortlistOnly] = useState(false);

  // Bookings Form
  const [guestName, setGuestName] = useState('Atharav Singh');
  const [guestName2, setGuestName2] = useState('Sudipta Konkan');
  const [nationality, setNationality] = useState('Indian');
  const [pickupPoint, setPickupPoint] = useState('Shibuya Metro Station, North Exit');
  const [dropPoint, setDropPoint] = useState('Shibuya Station');
  const [guestsCount, setGuestsCount] = useState(2);

  // Overlay Screens
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [activeLang, setActiveLang] = useState('English');

  // Photo Gallery Modal
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Verification Modal
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Availability Calendar
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  // Help Panel Messages Mock
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hi! How can I help you find your local roots guide today?' }
  ]);

  // Customize Trip States
  const [customDate, setCustomDate] = useState('');
  const [customPickupTime, setCustomPickupTime] = useState('');
  const [customDropTime, setCustomDropTime] = useState('');
  const [customPickupPoint, setCustomPickupPoint] = useState('');
  const [customDropPoint, setCustomDropPoint] = useState('');
  const [customDestinations, setCustomDestinations] = useState('');
  const [customGuestsCount, setCustomGuestsCount] = useState(1);

  // Supabase dynamic lists
  const [dbDestinations, setDbDestinations] = useState<any[]>([]);

  // Currency Conversion States
  const [currency, setCurrency] = useState<string>(localStorage.getItem('selected_currency') || 'USD');
  const [rates, setRates] = useState<any>({ USD: 1, JPY: 155.5, INR: 83.5, EUR: 0.92 });

  // ─── BECOME A PARTNER FORM STATE ───
  const [partnerForm, setPartnerForm] = useState({
    guideName: '', contactNumber: '', currentAddress: '', cityName: '',
    state: '', countryName: '', pinCode: '', shortDescription: ''
  });
  const [partnerPassportFile, setPartnerPassportFile] = useState<File | null>(null);
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [partnerSaving, setPartnerSaving] = useState(false);

  const handlePartnerInputChange = (field: string, value: string) => {
    setPartnerForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePartnerSubmit = async () => {
    // Validate required fields
    const { guideName, contactNumber, currentAddress, cityName, state, countryName, pinCode, shortDescription } = partnerForm;
    if (!guideName || !contactNumber || !currentAddress || !cityName || !state || !countryName || !pinCode || !shortDescription) {
      alert('Please fill in all required fields.');
      return;
    }
    if (!partnerPassportFile) {
      alert('Please upload your passport document.');
      return;
    }
    setPartnerSaving(true);
    // Simulate submission delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setPartnerSaving(false);
    setPartnerSubmitted(true);
  };

  const handlePartnerSave = () => {
    localStorage.setItem('partnerFormDraft', JSON.stringify(partnerForm));
    alert('Draft saved successfully!');
  };

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('partnerFormDraft');
    if (draft) {
      try { setPartnerForm(JSON.parse(draft)); } catch {}
    }
  }, []);

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

  useEffect(() => {
    // Load Destinations from Supabase
    const fetchDestinations = async () => {
      const { data, error } = await supabase.from('destinations').select('*');
      if (!error && data && data.length > 0) {
        setDbDestinations(data);
      }
    };
    fetchDestinations();
  }, []);

  const toggleShortlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShortlistedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBookingsClick = () => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'guide') navigate('/guide/dashboard');
      else navigate('/dashboard');
    } else {
      navigate('/signin');
    }
  };

  const handleHelpMessageSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    setTimeout(() => {
      let reply = "Our support team usually replies within 5 minutes. You can also view available guides directly on the homepage!";
      if (chatInput.toLowerCase().includes('guide') || chatInput.toLowerCase().includes('tokyo')) {
        reply = "We currently have 4 verified guides available in Tokyo, Japan. Shivashish Chamoli is highly recommended!";
      } else if (chatInput.toLowerCase().includes('payment') || chatInput.toLowerCase().includes('refund')) {
        reply = "Payments are securely processed on RouteByRoot. You can cancel free of charge up to 24 hours before your trip.";
      }
      setChatMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 800);
  };

  const handleSearch = () => {
    setActiveView('listings');
  };


  const handleSelectGuide = (guide: GuideItem) => {
    setSelectedGuide(guide);
    setPickupPoint(guide.pickupPoint || '');
    setDropPoint(guide.dropPoint || '');
    setActiveView('details');
  };

  // Perform Local Storage Booking Insert (Decoupled from Supabase)
  const handleMakePayment = async () => {
    if (user && selectedGuide) {
      const rate = rates[currency] || 1;
      const convertedPrice = Math.round(selectedGuide.price * rate * 100) / 100;
      
      // Create local mock booking
      createBooking({
        traveler_id: user.id,
        guide_id: selectedGuide.id,
        tour_name: `Tour with ${selectedGuide.name} in ${selectedGuide.city}`,
        traveler_name: user.name || 'Traveler',
        booking_date: date,
        amount: convertedPrice,
        currency: currency,
        notes: `Pickup: ${pickupPoint}. Guests: ${guestName}, ${guestName2}`,
        totalGuests: guestsCount
      });

      // Enable chat seamlessly
      setBookedGuides(prev => [...prev, selectedGuide.id]);
    } else {
      // Non-authenticated demo flow — still mark as booked locally
      if (selectedGuide) setBookedGuides(prev => [...prev, selectedGuide.id]);
    }
    setActiveView('success');
  };

  const handleRequestQuotation = () => {
    if (!user) {
      navigate('/signin');
      return;
    }
    const quotation = {
      id: `Q-${Math.floor(Math.random() * 10000)}`,
      guideName: selectedGuide?.name || '',
      city: `${selectedGuide?.city}, ${selectedGuide?.country}`,
      bookingDate: customDate || date,
      guideNationality: selectedGuide?.nationality || 'Indian',
      pickupTime: customPickupTime || selectedGuide?.pickupTime || '09:00 AM',
      pickupPoint: customPickupPoint || pickupPoint || 'Hotel',
      dropTime: customDropTime || selectedGuide?.dropTime || '18:00 PM',
      dropPoint: customDropPoint || dropPoint || 'Hotel',
      places: customDestinations || selectedGuide?.places?.join(', ') || '',
      guestName: (() => { const n = user.name || 'Traveler'; if (n.includes('@')) return n.split('@')[0]; return n.split(' ')[0] || n; })(),
      totalGuests: customGuestsCount,
      travellingTo: `${selectedGuide?.city}, ${selectedGuide?.country}`,
      touristNationality: user.country || 'Indian',
      status: 'pending_guide',
      guideQuoteUsd: null,
      travelerCounterUsd: null,
      round: 0
    };

    import('../lib/supabaseSync').then(({ loadQuotations, syncQuotations }) => {
      loadQuotations().then((existingQs: any[]) => {
        existingQs.push(quotation);
        syncQuotations(existingQs);
      });
    });
    
    navigate('/dashboard?tab=quotations');
  };

  const travelerCountry = user?.country || nationality || 'Indian';
  const travelerLanguage = user?.preferred_language || activeLang || 'English';

  const normalizeCountryName = (c: string) => {
    const val = (c || '').toLowerCase().trim();
    if (val.includes('india')) return 'india';
    if (val.includes('japan')) return 'japan';
    if (val.includes('usa') || val.includes('america') || val.includes('united states')) return 'usa';
    return val;
  };

  const isOriginMatch = (g: GuideItem) => {
    const gNat = normalizeCountryName(g.nationality);
    const tNat = normalizeCountryName(travelerCountry);
    const hasLanguage = g.languages.some(lang => lang.toLowerCase() === travelerLanguage.toLowerCase());
    return gNat === tNat && hasLanguage;
  };

  const isLanguageMatch = (g: GuideItem) => {
    return g.languages.some(lang => lang.toLowerCase() === travelerLanguage.toLowerCase());
  };

  const isRecommendedMatch = (g: GuideItem) => {
    const recommendedList: string[] = JSON.parse(localStorage.getItem('routebyroot_recommended_guide_ids') || '["usr-default-shivashish"]');
    return recommendedList.includes(g.id) || recommendedList.includes(g.name) || g.id === 'usr-default-shivashish';
  };

  const baseGuides = allGuides.filter(g => {
    if (showShortlistOnly && !shortlistedIds.includes(g.id)) return false;
    if (country && g.country.toLowerCase() !== country.toLowerCase()) return false;
    if (city && g.city.toLowerCase() !== city.toLowerCase()) return false;
    return true;
  });

  let filteredGuides = baseGuides;

  if (myOrigin) {
    const originMatches = baseGuides.filter(isOriginMatch);
    if (originMatches.length > 0) {
      filteredGuides = originMatches;
    }
  }

  if (myLanguage) {
    const languageMatches = filteredGuides.filter(isLanguageMatch);
    if (languageMatches.length > 0) {
      filteredGuides = languageMatches;
    }
  }

  if (recommended) {
    const recommendedMatches = filteredGuides.filter(isRecommendedMatch);
    if (recommendedMatches.length > 0) {
      filteredGuides = recommendedMatches;
    }
  }

  // Dropdown lists computed from allGuides
  const countriesList = Array.from(new Set(allGuides.map(g => g.country.toUpperCase()))).filter(Boolean);
  const citiesList = Array.from(new Set(
    allGuides
      .filter(g => !country || g.country.toUpperCase() === country.toUpperCase())
      .map(g => g.city.toUpperCase())
  )).filter(Boolean);

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'var(--font-body)', color: '#334155' }}>
      
      {/* ─── GLOBAL HEADER (LIGHT STYLE) ─── */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '12px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div onClick={() => { setActiveView('listings'); setShowShortlistOnly(false); }} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <img src="/logo.png" alt="RouteByRoot" style={{ height: 38 }} />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#1E3A8A', fontSize: '1.25rem' }}>
              RouteByRoot
            </span>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }} className="desktop-nav">
            <span onClick={() => { setActiveView('listings'); setShowShortlistOnly(false); }} style={{ cursor: 'pointer', color: !showShortlistOnly ? 'var(--navy)' : '#64748B', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Home size={16} /> Home
            </span>
            <span onClick={() => setShowFaqModal(true)} style={{ color: '#64748B', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <HelpCircle size={16} /> FAQ
            </span>
            <span onClick={handleBookingsClick} style={{ color: '#64748B', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={16} /> Bookings
            </span>
            <span
              onClick={() => {
                if (user) {
                  setActiveView('become-partner');
                  setPartnerSubmitted(false);
                  setShowShortlistOnly(false);
                } else {
                  navigate('/signup?role=guide');
                }
              }}
              style={{ color: activeView === 'become-partner' ? 'var(--teal)' : '#64748B', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: activeView === 'become-partner' ? 700 : 500 }}
            >
              <User size={16} /> Become a Guide
            </span>
            <span onClick={() => { setShowShortlistOnly(true); setActiveView('listings'); }} style={{ color: showShortlistOnly ? 'var(--pink)' : '#64748B', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: showShortlistOnly ? 700 : 500 }}>
              <Heart size={16} fill={showShortlistOnly ? 'var(--pink)' : 'none'} /> Shortlist ({shortlistedIds.length})
            </span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <select
                value={currency}
                onChange={(e) => {
                  const cur = e.target.value;
                  setCurrency(cur);
                  localStorage.setItem('selected_currency', cur);
                }}
                style={{
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.85rem',
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

            <div style={{
              background: '#0F4C81',
              color: '#FFFFFF',
              borderRadius: '24px',
              padding: '6px 16px',
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '0.05em'
            }}>
              {city.toUpperCase()} - {country.toUpperCase()}
            </div>
            
            <div style={{ position: 'relative' }}>
              <Globe size={18} color="#64748B" style={{ cursor: 'pointer' }} onClick={() => setShowLangDropdown(!showLangDropdown)} />
              {showLangDropdown && (
                <div style={{
                  position: 'absolute',
                  top: 26,
                  right: 0,
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  padding: '8px 0',
                  minWidth: 120,
                  zIndex: 100
                }}>
                  {['English', 'Hindi', 'Japanese', 'Spanish'].map(lang => (
                    <div
                      key={lang}
                      onClick={() => { setActiveLang(lang); setShowLangDropdown(false); }}
                      style={{
                        padding: '8px 16px',
                        fontSize: '0.85rem',
                        color: '#334155',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: activeLang === lang ? '#F1F5F9' : 'transparent'
                      }}
                    >
                      {lang}
                      {activeLang === lang && <Check size={14} color="#1E3A8A" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <span onClick={() => {
              if (user) {
                navigate('/dashboard?tab=help');
              } else {
                navigate('/signin');
              }
            }} style={{
              border: '1px solid #CBD5E1',
              borderRadius: '20px',
              padding: '4px 14px',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer'
            }}>
              HELP
            </span>

            {user ? (() => {
              const localProfile = (() => {
                try { return JSON.parse(localStorage.getItem(`rbr_profile_${user.id}`) || '{}'); } catch { return {}; }
              })();
              const avatarSrc = localProfile.avatar_url || user.avatar_url;
              return (
                <div
                  onClick={handleBookingsClick}
                  style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#F97316', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                      {user.name[0].toUpperCase()}
                    </div>
                  )}
                </div>
              );
            })() : (
              <Link to="/signin" style={{ textDecoration: 'none' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #CBD5E1', cursor: 'pointer' }}>
                  <User size={16} color="#64748B" />
                </div>
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* ─── VIEW 1: LISTINGS VIEW ─── */}
      {activeView === 'listings' && (
        <div>
          <section style={{
            backgroundColor: '#2BBCBF',
            height: '280px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 24px'
          }}>
            
            <div style={{
              background: '#FFFFFF',
              borderRadius: '40px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              maxWidth: '900px',
              padding: '6px 8px 6px 16px',
              height: '66px',
              border: '1px solid #E2E8F0',
              boxSizing: 'border-box'
            }} className="search-bar-container">
              
              <div style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Country</span>
                <select
                  value={country}
                  onChange={e => {
                    setCountry(e.target.value);
                    setCity(''); // reset city when country changes
                  }}
                  style={{ border: 'none', outline: 'none', color: '#1E3A8A', fontWeight: 700, fontSize: '0.95rem', background: 'transparent', width: '100%', cursor: 'pointer' }}
                >
                  <option value="">Select Country</option>
                  {countriesList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ width: 1, height: 32, background: '#E2E8F0' }} />

              <div style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Date</span>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{ border: 'none', outline: 'none', color: '#334155', fontWeight: 600, fontSize: '0.95rem', background: 'transparent', width: '100%', cursor: 'pointer' }}
                />
              </div>

              <div style={{ width: 1, height: 32, background: '#E2E8F0' }} />

              <div style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>City / Destination</span>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  style={{ border: 'none', outline: 'none', color: '#334155', fontWeight: 600, fontSize: '0.95rem', background: 'transparent', width: '100%', cursor: 'pointer' }}
                >
                  <option value="">Select City</option>
                  {citiesList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ width: 1, height: 32, background: '#E2E8F0' }} />

              <div style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Time</span>
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  style={{ border: 'none', outline: 'none', color: '#334155', fontWeight: 600, fontSize: '0.95rem', background: 'transparent', width: '100%', cursor: 'pointer' }}
                />
              </div>

              <button
                onClick={handleSearch}
                style={{
                  background: 'linear-gradient(135deg, var(--orange) 0%, var(--orange-dark) 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '0 28px',
                  height: '54px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
                }}
              >
                <Search size={16} /> SEARCH
              </button>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.45)',
              borderRadius: '24px',
              padding: '8px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 36,
              marginTop: 20,
              backdropFilter: 'blur(10px)'
            }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.85rem' }}>My Origin</span>
                <button
                  onClick={() => setMyOrigin(!myOrigin)}
                  style={{
                    width: 38,
                    height: 20,
                    borderRadius: 10,
                    background: myOrigin ? '#FF385C' : '#E2E8F0',
                    border: 'none',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    position: 'absolute',
                    top: 3,
                    left: myOrigin ? 21 : 3,
                  }} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.85rem' }}>My Language</span>
                <button
                  onClick={() => setMyLanguage(!myLanguage)}
                  style={{
                    width: 38,
                    height: 20,
                    borderRadius: 10,
                    background: myLanguage ? '#FF385C' : '#E2E8F0',
                    border: 'none',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    position: 'absolute',
                    top: 3,
                    left: myLanguage ? 21 : 3,
                  }} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.85rem' }}>Recommended</span>
                <button
                  onClick={() => setRecommended(!recommended)}
                  style={{
                    width: 38,
                    height: 20,
                    borderRadius: 10,
                    background: recommended ? '#FF385C' : '#E2E8F0',
                    border: 'none',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    position: 'absolute',
                    top: 3,
                    left: recommended ? 21 : 3,
                  }} />
                </button>
              </div>

            </div>

          </section>

          <main style={{ maxWidth: 1200, margin: '40px auto', padding: '0 24px' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#1E3A8A', marginBottom: 24 }}>
              {showShortlistOnly ? 'Your Shortlisted Guides' : `Available guides in ${city} on selected date`}
            </h2>

            {filteredGuides.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed #CBD5E1', borderRadius: 12 }}>
                <p style={{ color: '#64748B', fontSize: '1rem' }}>No guides found. Try searching "JAPAN" and "TOKYO" or add items to your shortlist.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 24
              }}>
                {filteredGuides.map((guide) => (
                  <div
                    key={guide.id}
                    onClick={() => handleSelectGuide(guide)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                      border: '1px solid #F1F5F9',
                      background: '#FFFFFF',
                      transition: 'transform 0.25s, box-shadow 0.25s'
                    }}
                  >
                    <div style={{ height: '170px', position: 'relative', overflow: 'hidden' }}>
                      <img
                        src={guide.tourImage}
                        alt={guide.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) {
                            parent.style.background = 'linear-gradient(135deg, var(--navy) 0%, var(--teal) 100%)';
                            parent.style.display = 'flex';
                            parent.style.alignItems = 'center';
                            parent.style.justifyContent = 'center';
                            
                            const label = document.createElement('div');
                            label.innerText = 'RouteByRoot Partner Tour';
                            label.style.color = '#FFFFFF';
                            label.style.fontFamily = 'var(--font-heading)';
                            label.style.fontWeight = '700';
                            label.style.fontSize = '0.9rem';
                            parent.appendChild(label);
                          }
                        }}
                      />
                      <button
                        onClick={(e) => toggleShortlist(guide.id, e)}
                        style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.9)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <Heart size={16} color={shortlistedIds.includes(guide.id) ? '#E91E8C' : '#94A3B8'} fill={shortlistedIds.includes(guide.id) ? '#E91E8C' : 'none'} />
                      </button>
                    </div>

                    <div style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#1E3A8A' }}>{guide.name.split(' ')[0]}</span>
                        <CheckCircle size={15} color="#3B82F6" fill="#FFFFFF" />
                      </div>

                      <div style={{ fontSize: '0.88rem', color: '#0F4C81', fontWeight: 700, marginBottom: 6 }}>
                        {formatPrice(guide.price)} <span style={{ color: '#64748B', fontWeight: 500 }}>includes {guide.placesCount} places</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>{guide.rating.toFixed(1)} Stars</span>
                        <Star size={12} fill="#FFC107" stroke="none" />
                        <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>({guide.totalRatings} total ratings)</span>
                      </div>

                      {/* Guide description box */}
                      <div style={{
                        padding: '8px 10px',
                        background: '#F8FAFC',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        color: '#64748B',
                        borderLeft: '3px solid var(--orange)',
                        lineHeight: 1.4,
                        maxHeight: '58px',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {guide.bio}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      )}

      {/* ─── VIEW 2: GUIDE DETAILS VIEW ─── */}
      {activeView === 'details' && (
        <main style={{ maxWidth: 1100, margin: '30px auto', padding: '0 24px' }}>
          
          <button
            onClick={() => setActiveView('listings')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.9rem',
              color: '#64748B',
              marginBottom: 20,
              fontWeight: 600
            }}
          >
            <ArrowLeft size={16} /> Back to Search
          </button>

          {/* IMAGE GALLERY GRID */}
          {(() => {
            const displayImages = [
              ...(selectedGuide.galleryImages || []),
              selectedGuide.tourImage,
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

            const totalPhotos = Math.max((selectedGuide.galleryImages || []).filter(Boolean).length, 5);

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
                <img src={displayImages[0]} alt="main tour" style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} onClick={() => { setGalleryIndex(0); setShowGalleryModal(true); }} />
                <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 12 }}>
                  <img src={displayImages[1]} alt="sub1" style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} onClick={() => { setGalleryIndex(1); setShowGalleryModal(true); }} />
                  <img src={displayImages[2]} alt="sub2" style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} onClick={() => { setGalleryIndex(2); setShowGalleryModal(true); }} />
                </div>
                <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 12, position: 'relative' }}>
                  <img src={displayImages[3]} alt="sub3" style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} onClick={() => { setGalleryIndex(3); setShowGalleryModal(true); }} />
                  <div style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', height: '100%' }} onClick={() => { setGalleryIndex(4); setShowGalleryModal(true); }}>
                    <img src={displayImages[4]} alt="sub4" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

          {/* GUIDE DETAILS HEADER */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 20,
            borderBottom: '1px solid #E2E8F0',
            paddingBottom: 24,
            marginBottom: 24
          }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <img
                src={selectedGuide.avatar}
                alt={selectedGuide.name}
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #F1F5F9' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1E3A8A', margin: 0 }}>
                    {selectedGuide.name.split(' ')[0]}
                  </h1>
                  <span title="Identity Verified by RouteByRoot" style={{ cursor: 'help', display: 'flex', alignItems: 'center' }}>
                    <CheckCircle size={18} color="#3B82F6" fill="#FFFFFF" />
                  </span>
                  <button
                    onClick={(e) => toggleShortlist(selectedGuide.id, e)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}
                  >
                    <Heart size={18} color={shortlistedIds.includes(selectedGuide.id) ? '#E91E8C' : '#64748B'} fill={shortlistedIds.includes(selectedGuide.id) ? '#E91E8C' : 'none'} />
                  </button>
                  <Share2 size={18} color="#64748B" style={{ cursor: 'pointer' }} onClick={() => { const url = window.location.origin + '/guide/' + selectedGuide.id; if (navigator.share) { navigator.share({ title: selectedGuide.name + ' - RouteByRoot Guide', text: 'Check out ' + selectedGuide.name + ', a verified local guide on RouteByRoot!', url }); } else { navigator.clipboard.writeText(url); alert('Guide profile link copied to clipboard!'); } }} />
                </div>
                
                <p style={{ color: '#64748B', margin: '4px 0', fontSize: '0.9rem', fontWeight: 500 }}>
                  City : Tachikawa, {selectedGuide.city}
                </p>

                <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: '0.85rem', color: '#475569', marginTop: 6 }}>
                  <span>⭐ <strong>{selectedGuide.rating.toFixed(1)} Stars</strong> (Total Clients - {selectedGuide.totalRatings})</span>
                  <span>🌍 Nationality: <strong>{selectedGuide.nationality}</strong></span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.9rem', color: '#64748B' }}>Nationality: <strong>{selectedGuide.nationality}</strong></span>
                <span style={{ fontSize: '0.9rem', color: '#64748B' }}>🗣️ Languages Spoken: <strong>{selectedGuide.languages.join(', ')}</strong></span>
                {selectedGuide.languages.map(l => l.toLowerCase()).includes('hindi') ? (
                  <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: '0.75rem', padding: '3px 8px', borderRadius: 12, fontWeight: 700 }}>
                    🗣️ Speaks Hindi (Matches your native language!)
                  </span>
                ) : (
                  <span style={{ background: '#FEF3C7', color: '#B45309', fontSize: '0.75rem', padding: '3px 8px', borderRadius: 12, fontWeight: 700 }}>
                    ⚠️ English / Local Support Only (No Hindi)
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button
                  onClick={() => setActiveView('verification')}
                  style={{
                    background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 22px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.88rem',
                    boxShadow: '0 4px 12px rgba(30,58,138,0.25)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Shield size={16} />
                  View Verification
                </button>
              </div>
            </div>
          </div>

          {/* TAB BAR */}
          <div style={{ display: 'flex', gap: 20, borderBottom: '2px solid #E2E8F0', marginBottom: 24 }}>
            <button
              onClick={() => setActiveView('details')}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 8px',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#0097A7',
                borderBottom: '3px solid #0097A7',
                cursor: 'pointer'
              }}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('verification')}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 8px',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#64748B',
                cursor: 'pointer'
              }}
            >
              View Verification
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40, alignItems: 'start' }} className="details-split">
            
            <div>
              {/* ─── RICH TEXT DESCRIPTION BOX ─── */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '28px 30px',
                marginBottom: 30,
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, var(--orange) 0%, #FBBF24 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={18} color="#FFFFFF" />
                  </div>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--navy)', fontWeight: 800, margin: 0 }}>Detail Description</h4>
                </div>
                <div
                  className="rich-description-content"
                  style={{
                    fontSize: '0.92rem',
                    lineHeight: 1.75,
                    color: '#475569',
                  }}
                  dangerouslySetInnerHTML={{ __html: selectedGuide.richDescription }}
                />
              </div>

              <div style={{ marginBottom: 40 }}>
                <h3 style={{ fontSize: '1.2rem', color: '#1E3A8A', marginBottom: 16, fontWeight: 700 }}>Places to Visit:</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {selectedGuide.places.map((place, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.95rem' }}>
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: '#E0F2FE',
                        color: '#0369A1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.8rem'
                      }}>
                        {idx + 1}
                      </div>
                      <span style={{ fontWeight: 555 }}>{place}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#1E3A8A', marginBottom: 20, fontWeight: 700 }}>Ratings & Reviews</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {selectedGuide.reviews.map((rev, idx) => (
                    <div key={idx} style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: '#FFB020' }}>⭐ {rev.rating} / 5.0</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 6 }}>
                        <strong>Name:</strong> {rev.name} ({rev.location})
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 8 }}>
                        <strong>City:</strong> {rev.city}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6, color: '#475569' }}>
                        💬 "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── SIMILAR PLACES TO VISIT IN COUNTRY ─── */}
              <div style={{ marginTop: 40 }}>
                <h3 style={{ fontSize: '1.25rem', color: '#1E3A8A', marginBottom: 8, fontWeight: 700 }}>
                  🗺️ Similar Places to Visit in {selectedGuide.country}
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.88rem', marginBottom: 20 }}>
                  Explore other popular destinations travelers love in {selectedGuide.country}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                  {(selectedGuide.country === 'JAPAN' ? [
                    { name: 'Kyoto', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80', desc: 'Ancient temples & gardens' },
                    { name: 'Osaka', image: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=400&q=80', desc: 'Street food capital' },
                    { name: 'Hiroshima', image: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?auto=format&fit=crop&w=400&q=80', desc: 'Peace memorial & history' },
                    { name: 'Nara', image: 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=400&q=80', desc: 'Deer park & big Buddha' },
                    { name: 'Hakone', image: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=400&q=80', desc: 'Mt. Fuji views & hot springs' },
                    { name: 'Okinawa', image: 'https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?auto=format&fit=crop&w=400&q=80', desc: 'Tropical beaches & culture' },
                  ] : [
                    { name: 'Explore More', image: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=400&q=80', desc: 'Discover hidden gems' },
                  ]).map((place, idx) => (
                    <div
                      key={idx}
                      style={{
                        borderRadius: '14px',
                        overflow: 'hidden',
                        position: 'relative',
                        height: 160,
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)'; }}
                    >
                      <img src={place.image} alt={place.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.7) 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '14px',
                      }}>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{place.name}</div>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem' }}>{place.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div style={{ position: 'sticky', top: 90, alignSelf: 'flex-start' }}>
              <div style={{
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
                background: '#FFFFFF',
              }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#1E3A8A', fontWeight: 700 }}>Book {selectedGuide.name.split(' ')[0]}</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                  <div style={{ fontSize: '0.9rem', color: '#64748B' }}>
                    Pickup Point: <strong style={{ color: '#334155' }}>Shibuya Station</strong>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#64748B' }}>
                    Service Fee: <strong style={{ color: '#0F4C81' }}>{formatPrice(selectedGuide.price)} total</strong>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#64748B' }}>
                    Hours: <strong style={{ color: '#334155' }}>10 Hours (09:20 AM - 19:30 PM)</strong>
                  </div>
                </div>

                <button
                  onClick={() => setActiveView('booking')}
                  style={{
                    width: '100%',
                    background: '#FF385C',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '14px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    marginBottom: 10
                  }}
                >
                  Book Tour Now
                </button>

                {/* Customize Button on Overview */}
                <button
                  onClick={() => setActiveView('customize')}
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    border: '2px solid #0097A7',
                    color: '#0097A7',
                    borderRadius: '10px',
                    padding: '12px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#0097A7'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF'; (e.currentTarget as HTMLButtonElement).style.color = '#0097A7'; }}
                >
                  ✏️ Customize Trip
                </button>
              </div>

              {/* ─── AVAILABILITY CALENDAR ─── */}
              <div style={{
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                background: '#FFFFFF',
                marginTop: 20
              }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#1E3A8A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={18} color="#0097A7" /> Availability Calendar
                </h4>
                <p style={{ color: '#94A3B8', fontSize: '0.78rem', margin: '0 0 14px 0' }}>
                  <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#22C55E', marginRight: 4, verticalAlign: 'middle' }} /> Available
                  <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#CBD5E1', marginLeft: 12, marginRight: 4, verticalAlign: 'middle' }} /> Unavailable
                </p>

                {/* Month Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <button
                    onClick={() => {
                      if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
                      else setCalendarMonth(m => m - 1);
                    }}
                    style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1E3A8A' }}>
                    {new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => {
                      if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
                      else setCalendarMonth(m => m + 1);
                    }}
                    style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Day Headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: 6 }}>
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', padding: '4px 0' }}>{d}</div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
                  {(() => {
                    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
                    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const cells = [];

                    // Empty cells for days before the 1st
                    for (let i = 0; i < firstDay; i++) {
                      cells.push(<div key={`empty-${i}`} />);
                    }

                    for (let day = 1; day <= daysInMonth; day++) {
                      const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const cellDate = new Date(calendarYear, calendarMonth, day);
                      const isPast = cellDate < today;
                      const isUnavailable = selectedGuide.availableDates 
                        ? !selectedGuide.availableDates.includes(dateStr) 
                        : selectedGuide.unavailableDates.includes(dateStr);
                      const isSelected = dateStr === date;

                      let bg = '#ECFDF5'; // available green tint
                      let color = '#059669';
                      let border = '1px solid #A7F3D0';
                      let fontWt = 600;
                      let cursor = 'pointer' as string;

                      if (isPast || isUnavailable) {
                        bg = '#F1F5F9';
                        color = '#94A3B8';
                        border = '1px solid #E2E8F0';
                        fontWt = 500;
                        cursor = 'not-allowed';
                      }
                      if (isSelected) {
                        bg = '#0097A7';
                        color = '#FFFFFF';
                        border = '2px solid #00838F';
                        fontWt = 800;
                      }

                      cells.push(
                        <div
                          key={day}
                          onClick={() => {
                            if (!isPast && !isUnavailable) {
                              setDate(dateStr);
                            }
                          }}
                          title={
                            isPast ? 'Past date' :
                            isUnavailable ? 'Guide unavailable' :
                            isSelected ? 'Selected date' : 'Available — click to select'
                          }
                          style={{
                            textAlign: 'center',
                            padding: '6px 2px',
                            borderRadius: 8,
                            fontSize: '0.8rem',
                            fontWeight: fontWt,
                            background: bg,
                            color: color,
                            border: border,
                            cursor: cursor,
                            transition: 'all 0.15s ease',
                            lineHeight: '1.4',
                          }}
                        >
                          {day}
                        </div>
                      );
                    }
                    return cells;
                  })()}
                </div>

                {/* Selected Date Display */}
                <div style={{ marginTop: 14, padding: '10px 14px', background: '#F0FDFA', borderRadius: 10, border: '1px solid #99F6E4', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
                  <Calendar size={15} color="#0D9488" />
                  <span style={{ color: '#0F766E', fontWeight: 600 }}>Selected: {date ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : 'None'}</span>
                </div>
              </div>
            </div>

          </div>

        </main>
      )}

      {/* ─── VIEW 2.5: VIEW GUIDE VERIFICATION SCREEN (PRD SCR-GV-001) ─── */}
      {activeView === 'verification' && (
        <main style={{ maxWidth: 1100, margin: '30px auto', padding: '0 24px' }}>
          
          <button
            onClick={() => setActiveView('details')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.9rem',
              color: '#64748B',
              marginBottom: 20,
              fontWeight: 600
            }}
          >
            <ArrowLeft size={16} /> Back to Details
          </button>

          {/* ZONE B — PAGE TITLE */}
          <div style={{ padding: '0 0 16px 0', borderBottom: '1px solid #E2E8F0', marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: '#0097A7', fontSize: '24px', fontWeight: 700, margin: 0 }}>
              View Guide Verification
            </h2>
          </div>

          {/* TAB BAR FOR EASY TOGGLING BACK */}
          <div style={{ display: 'flex', gap: 20, borderBottom: '2px solid #E2E8F0', marginBottom: 24 }}>
            <button
              onClick={() => setActiveView('details')}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 8px',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#64748B',
                cursor: 'pointer'
              }}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('verification')}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 8px',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#0097A7',
                borderBottom: '3px solid #0097A7',
                cursor: 'pointer'
              }}
            >
              View Verification
            </button>
          </div>

          {/* ZONE C — MAIN VERIFICATION CARD */}
          <div style={{
            maxWidth: '960px',
            margin: '0 auto 40px auto',
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            border: '1px solid #E2E8F0',
            padding: '32px',
            position: 'relative'
          }}>
            
            {/* C1 — Guide Identity Row (Top of card) */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 20,
              paddingBottom: 24,
              borderBottom: '1px solid #F1F5F9'
            }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <img
                  src={selectedGuide.avatar}
                  alt={selectedGuide.name}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid #F59E0B' // Gold/yellow ring border
                  }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
                      {selectedGuide.name.split(' ')[0]}
                    </h3>
                    <span title="Identity Verified by RouteByRoot" style={{ cursor: 'help', display: 'flex', alignItems: 'center' }}>
                      <CheckCircle size={18} color="#0097A7" fill="#FFFFFF" />
                    </span>
                    <button
                      onClick={(e) => toggleShortlist(selectedGuide.id, e)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}
                    >
                      <Heart size={18} color={shortlistedIds.includes(selectedGuide.id) ? '#E91E8C' : '#64748B'} fill={shortlistedIds.includes(selectedGuide.id) ? '#E91E8C' : 'none'} />
                    </button>
                    <Share2 size={18} color="#64748B" style={{ cursor: 'pointer' }} onClick={() => { const url = window.location.origin + '/guide/' + selectedGuide.id; if (navigator.share) { navigator.share({ title: selectedGuide.name + ' - RouteByRoot Guide', text: 'Check out ' + selectedGuide.name + ', a verified local guide on RouteByRoot!', url }); } else { navigator.clipboard.writeText(url); alert('Guide profile link copied to clipboard!'); } }} />
                  </div>
                  
                  <p style={{ color: '#64748B', margin: '4px 0', fontSize: '14px' }}>
                    Age: 32 years • Experience Level: Excellent
                  </p>

                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: '14px', color: 'var(--orange)', fontWeight: 600 }}>
                    <span>★ Ratings: {selectedGuide.rating ? selectedGuide.rating.toFixed(1) : '0.0'}/5 - {selectedGuide.totalRatings} ratings</span>
                  </div>
                </div>
              </div>

              {/* Verified stamp (right) */}
              {selectedGuide.verification.identityVerified && selectedGuide.verification.backgroundCheck && (
                <div style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  border: '3px dashed #0097A7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  transform: 'rotate(-10deg)',
                  background: 'rgba(0, 151, 167, 0.04)',
                  color: '#0097A7',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: '0.62rem',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  boxShadow: '0 0 0 4px #FFFFFF, inset 0 0 0 2px #0097A7'
                }}>
                  <span style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>VERIFIED</span>
                  <span style={{ fontSize: '0.52rem', opacity: 0.8 }}>ROUTE BY ROOT</span>
                  <span style={{ fontSize: '0.5rem', fontWeight: 600, marginTop: 2 }}>{selectedGuide.name.split(' ')[0]}</span>
                </div>
              )}
            </div>

            {/* C2 — Verification Badges Row */}
            <div style={{ marginTop: 24 }}>
              <h4 style={{ color: '#0097A7', fontSize: '16px', fontWeight: 700, marginBottom: 12 }}>
                {selectedGuide.name.split(' ')[0]} has a Verified Profile
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }} className="trust-badges-grid">
                {[
                  { label: "Verified ID's", verified: selectedGuide.verification.identityVerified, desc: "Government ID approved" },
                  { label: "Confirmed email", verified: true, desc: "Primary email verified" },
                  { label: "Confirmed phone number", verified: selectedGuide.verification.backgroundCheck, desc: "OTP phone verified" }
                ].map((badge, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    background: badge.verified ? '#F0FDF4' : '#F8FAFC',
                    border: `1px solid ${badge.verified ? '#BBF7D0' : '#E2E8F0'}`,
                    borderRadius: '8px'
                  }}>
                    {badge.verified ? (
                      <Shield size={18} color="#22C55E" fill="#DCFCE7" />
                    ) : (
                      <Clock size={18} color="#94A3B8" />
                    )}
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: badge.verified ? '#15803D' : '#64748B' }}>
                        {badge.verified ? badge.label : 'Pending Verification'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94A3B8' }}>{badge.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* C3 — About Section */}
            <div style={{ marginTop: 28 }}>
              <h4 style={{ color: '#0097A7', fontSize: '16px', fontWeight: 700, marginBottom: 12 }}>
                About the Guide: Describe yourself in detail
              </h4>
              
              {/* Bio Card */}
              <div style={{
                background: '#F5F7FA',
                borderRadius: '8px',
                padding: '16px',
                position: 'relative',
                marginBottom: 20
              }}>
                <p style={{ margin: '0 0 8px 0', fontStyle: 'italic', fontSize: '14px', color: '#64748B' }}>
                  "Local expert with years of experience showing travelers authentic cultural roots."
                </p>
                <div style={{
                  fontSize: '14px',
                  color: '#334155',
                  lineHeight: 1.6,
                  maxHeight: isBioExpanded ? 'none' : '96px',
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease'
                }}>
                  {selectedGuide.bio}
                </div>
                <button
                  onClick={() => setIsBioExpanded(!isBioExpanded)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0097A7',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    padding: '8px 0 0 0',
                    display: 'block'
                  }}
                >
                  {isBioExpanded ? 'Read less' : 'Read more'}
                </button>
              </div>
            </div>

            {/* Places to Visit */}
            <div style={{ marginBottom: 28 }}>
              <h4 style={{ fontSize: '15px', color: 'var(--navy)', marginBottom: 12, fontWeight: 700 }}>Places to Visit:</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {selectedGuide.places.map((place, idx) => (
                  <span key={idx} style={{
                    background: '#E0F2FE',
                    color: '#0369A1',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 600
                  }}>
                    📍 {place}
                  </span>
                ))}
              </div>
            </div>

            {/* C4 — Guide Stats Row (Bottom of card) */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              paddingTop: 20,
              borderTop: '1px solid #F1F5F9',
              color: '#64748B',
              fontSize: '13px'
            }}>
              <div>• {selectedGuide.totalRatings + 12} published and completed trips</div>
              <div>• Member since {selectedGuide.verification.verifiedSince || 'August 2025'}</div>
              <div>• Living in {selectedGuide.city}, {selectedGuide.country} since {selectedGuide.arrivalYear || '2021'}</div>
            </div>

          </div>

          {/* ZONE D — ACTION BUTTONS */}
          <div style={{
            maxWidth: '960px',
            margin: '0 auto 40px auto',
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap'
          }}>
            {/* Primary Book Now CTA */}
            <button
              onClick={() => {
                if (selectedGuide.verification.identityVerified && selectedGuide.verification.backgroundCheck) {
                  setActiveView('booking');
                }
              }}
              disabled={!(selectedGuide.verification.identityVerified && selectedGuide.verification.backgroundCheck)}
              title={!(selectedGuide.verification.identityVerified && selectedGuide.verification.backgroundCheck) ? "Guide verification in progress" : ""}
              style={{
                flex: 2,
                minWidth: '200px',
                background: (selectedGuide.verification.identityVerified && selectedGuide.verification.backgroundCheck) ? '#F57C00' : '#CBD5E1',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                height: '48px',
                fontWeight: 700,
                fontSize: '16px',
                cursor: (selectedGuide.verification.identityVerified && selectedGuide.verification.backgroundCheck) ? 'pointer' : 'not-allowed',
                boxShadow: (selectedGuide.verification.identityVerified && selectedGuide.verification.backgroundCheck) ? '0 4px 12px rgba(245,124,0,0.2)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {(selectedGuide.verification.identityVerified && selectedGuide.verification.backgroundCheck) ? 'Book Now' : 'Verification Pending'}
            </button>

            {/* Secondary Customize Itinerary CTA */}
            <button
              onClick={() => {
                navigate('/dashboard');
              }}
              style={{
                flex: 1,
                minWidth: '150px',
                background: '#FFFFFF',
                border: '2px solid #0097A7',
                color: '#0097A7',
                borderRadius: '10px',
                height: '48px',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Customize Trip
            </button>

            {/* Tertiary Chat CTA — enabled only after booking */}
            <button
              onClick={() => {
                if (selectedGuide && bookedGuides.includes(selectedGuide.id)) {
                  navigate('/dashboard');
                }
              }}
              disabled={!selectedGuide || !bookedGuides.includes(selectedGuide.id)}
              title={
                !selectedGuide || !bookedGuides.includes(selectedGuide.id)
                  ? 'Book this guide first to start a chat'
                  : 'Chat with your guide'
              }
              style={{
                flex: 1,
                minWidth: '150px',
                background: 'transparent',
                border: 'none',
                color: 'var(--navy)',
                borderRadius: '10px',
                height: '48px',
                fontWeight: 700,
                fontSize: '15px',
                cursor: (!selectedGuide || !bookedGuides.includes(selectedGuide.id)) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: (!selectedGuide || !bookedGuides.includes(selectedGuide.id)) ? 0.45 : 1,
                transition: 'opacity 0.3s ease',
              }}
            >
              <MessageSquare size={18} />
              Chat with Guide
            </button>
          </div>

        </main>
      )}

      {/* ─── VIEW 3: REVIEW & PAYMENT ─── */}
      {activeView === 'booking' && (
        <main style={{ maxWidth: 1100, margin: '30px auto', padding: '0 24px' }}>
          
          <button
            onClick={() => setActiveView('details')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.9rem',
              color: '#64748B',
              marginBottom: 20,
              fontWeight: 600
            }}
          >
            <ArrowLeft size={16} /> Back to Details
          </button>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1E3A8A', marginBottom: 28 }}>
            Review & Payment
          </h2>

          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.02)'
          }}>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 48,
              alignItems: 'start'
            }} className="booking-form-split">
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>👥</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block' }}>Guide Name:</span>
                    <span style={{ fontWeight: 700, color: '#334155' }}>{selectedGuide.name.split(' ')[0]}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>📍</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block' }}>City:</span>
                    <span style={{ fontWeight: 700, color: '#334155' }}>{pickupPoint}, {selectedGuide.city}, {selectedGuide.country}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>📅</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block' }}>Booking Date:</span>
                    <input
                      type="text"
                      value={date}
                      readOnly
                      style={{ border: '1px solid #E2E8F0', borderRadius: '4px', padding: '4px 8px', width: '100%', maxWidth: '240px', fontWeight: 600, color: '#64748B', background: '#F8FAFC', cursor: 'not-allowed' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>🏳️</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block' }}>Nationality:</span>
                    <input
                      type="text"
                      value={nationality}
                      readOnly
                      style={{ border: '1px solid #E2E8F0', borderRadius: '4px', padding: '4px 8px', width: '100%', maxWidth: '240px', fontWeight: 600, color: '#64748B', background: '#F8FAFC', cursor: 'not-allowed' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>🗣️</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block' }}>Guide Spoken Languages:</span>
                    <span style={{ fontWeight: 700, color: '#334155', display: 'block' }}>{selectedGuide.languages.join(', ')}</span>
                    {selectedGuide.languages.map(l => l.toLowerCase()).includes('hindi') ? (
                      <span style={{ color: '#16A34A', fontSize: '0.78rem', fontWeight: 700 }}>✓ Speaks Hindi (Matches your native language!)</span>
                    ) : (
                      <span style={{ color: '#D97706', fontSize: '0.78rem', fontWeight: 700 }}>⚠️ English / Local Support Only (No Hindi)</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>🕒</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block' }}>Pick-Up Time:</span>
                    <span style={{ fontWeight: 700, color: '#334155' }}>{selectedGuide.pickupTime}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>📍</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block' }}>Pick-Up Point:</span>
                    <input
                      type="text"
                      value={pickupPoint}
                      onChange={e => setPickupPoint(e.target.value)}
                      style={{ border: '1px solid #CBD5E1', borderRadius: '4px', padding: '4px 8px', width: '100%', fontWeight: 600, color: '#334155' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>⏳</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block' }}>Trip Duration:</span>
                    <span style={{ fontWeight: 700, color: '#334155' }}>10 Hours</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>💵</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block' }}>Service Fee:</span>
                    <span style={{ fontWeight: 800, color: '#22C55E' }}>{formatPrice(selectedGuide.price)} total</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>🗺️</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block' }}>Places:</span>
                    <span style={{ fontSize: '0.88rem', color: '#475569' }}>{selectedGuide.places.join(', ')}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>👤</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block' }}>Guest Name(s):</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                      <input
                        type="text"
                        value={guestName}
                        onChange={e => setGuestName(e.target.value)}
                        style={{ border: '1px solid #CBD5E1', borderRadius: '4px', padding: '4px 8px', width: '100%', fontWeight: 600, color: '#334155' }}
                      />
                      <input
                        type="text"
                        value={guestName2}
                        onChange={e => setGuestName2(e.target.value)}
                        style={{ border: '1px solid #CBD5E1', borderRadius: '4px', padding: '4px 8px', width: '100%', fontWeight: 600, color: '#334155' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>🗺️</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block' }}>Travelling To:</span>
                    <span style={{ fontWeight: 700, color: '#334155' }}>{selectedGuide.city}, {selectedGuide.country}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>🕒</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block' }}>Drop Time:</span>
                    <span style={{ fontWeight: 700, color: '#334155' }}>{selectedGuide.dropTime}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>📍</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block' }}>Drop Point:</span>
                    <input
                      type="text"
                      value={dropPoint}
                      onChange={e => setDropPoint(e.target.value)}
                      placeholder="Enter drop point"
                      style={{ border: '1px solid #CBD5E1', borderRadius: '4px', padding: '4px 8px', width: '100%', fontWeight: 600, color: '#334155' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>👥</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block' }}>Total Guests:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <button
                        onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                        style={{ border: '1px solid #CBD5E1', width: 28, height: 28, borderRadius: 4, background: '#FFF', cursor: 'pointer', fontWeight: 700 }}
                      >
                        -
                      </button>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: '#334155' }}>{guestsCount}</span>
                      <button
                        onClick={() => setGuestsCount(guestsCount + 1)}
                        style={{ border: '1px solid #CBD5E1', width: 28, height: 28, borderRadius: 4, background: '#FFF', cursor: 'pointer', fontWeight: 700 }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #F1F5F9', marginTop: 40, paddingTop: 24 }}>
              <button
                onClick={handleMakePayment}
                style={{
                  background: '#23C1C6',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '16px 36px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 4px 15px rgba(35, 193, 198, 0.3)'
                }}
              >
                💳 MAKE PAYMENT
              </button>
            </div>

          </div>

        </main>
      )}

      {/* ─── VIEW 4: SUCCESS CONFIRMATION ─── */}
      {activeView === 'success' && (
        <main style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#DCFCE7',
            color: '#16A34A',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            marginBottom: 24
          }}>
            ✓
          </div>
          
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1E3A8A', marginBottom: 12 }}>
            Booking Confirmed! 🎉
          </h2>
          
          <p style={{ color: '#64748B', lineHeight: 1.6, marginBottom: 32 }}>
            Your booking with <strong>{selectedGuide.name.split(' ')[0]}</strong> for {date} has been confirmed successfully.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <button
              onClick={() => setActiveView('listings')}
              style={{
                background: '#FF385C',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Go to Home
            </button>
            
            <button
              onClick={handleBookingsClick}
              style={{
                background: '#FFFFFF',
                color: '#1E3A8A',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '12px 24px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Go to Dashboard
            </button>
          </div>
        </main>
      )}

      {/* ─── VIEW 5: CUSTOMIZE TRIP ─── */}
      {activeView === 'customize' && selectedGuide && (
        <main style={{ maxWidth: 800, margin: '80px auto', padding: '0 24px' }}>
          <button
            onClick={() => setActiveView('details')}
            style={{
              background: 'none', border: 'none', color: '#1E3A8A', fontSize: '0.95rem', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, padding: 0
            }}
          >
            ← Back to Guide Profile
          </button>
          
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1E3A8A', margin: '0 0 8px 0' }}>Customize Trip with {selectedGuide.name.split(' ')[0]}</h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', marginBottom: 24 }}>Tell us how you want to customize your experience. The guide will review your request and send a tailored quotation.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Booking Date</label>
                <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Destinations / Spots</label>
                <input type="text" placeholder="e.g. Kyoto Temples, Bamboo Grove" value={customDestinations} onChange={e => setCustomDestinations(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Pickup Time</label>
                <input type="time" value={customPickupTime} onChange={e => setCustomPickupTime(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Pickup Point</label>
                <input type="text" placeholder="e.g. My Hotel Name" value={customPickupPoint} onChange={e => setCustomPickupPoint(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Drop-off Time</label>
                <input type="time" value={customDropTime} onChange={e => setCustomDropTime(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Drop-off Point</label>
                <input type="text" placeholder="e.g. Nearby Subway" value={customDropPoint} onChange={e => setCustomDropPoint(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Total Guests</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => setCustomGuestsCount(Math.max(1, customGuestsCount - 1))}
                    style={{ border: '1px solid #CBD5E1', width: 40, height: 40, borderRadius: 8, background: '#FFF', cursor: 'pointer', fontWeight: 700, fontSize: '1.2rem' }}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#334155', minWidth: 20, textAlign: 'center' }}>{customGuestsCount}</span>
                  <button
                    onClick={() => setCustomGuestsCount(customGuestsCount + 1)}
                    style={{ border: '1px solid #CBD5E1', width: 40, height: 40, borderRadius: 8, background: '#FFF', cursor: 'pointer', fontWeight: 700, fontSize: '1.2rem' }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div style={{ background: '#FFFBEB', borderLeft: '4px solid #F59E0B', padding: '12px 16px', borderRadius: '4px', marginBottom: 32 }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#B45309', fontWeight: 600 }}>
                ⚠️ Security Note: Please do not share your personal information (e.g., phone numbers, bank details) due to security reasons.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #F1F5F9', paddingTop: 24 }}>
              <button
                onClick={handleRequestQuotation}
                style={{
                  background: '#0097A7',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '16px 36px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 4px 15px rgba(0, 151, 167, 0.3)'
                }}
              >
                Send Request & Get Quotation
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ─── FAQ MODAL ─── */}
      {showFaqModal && (
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
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowFaqModal(false)}
              style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={20} />
            </button>
            
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E3A8A', marginBottom: 20 }}>Frequently Asked Questions</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h4 style={{ fontWeight: 700, color: '#334155', fontSize: '0.95rem', marginBottom: 6 }}>1. How do I book a local guide?</h4>
                <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>Simply enter your destination country and city at the homepage search. Browse the available verified guides, pick one that matches your preferences, click "Book Tour", review the details, and make a payment.</p>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, color: '#334155', fontSize: '0.95rem', marginBottom: 6 }}>2. Are the local guides verified?</h4>
                <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>Yes! Every guide on RouteByRoot undergoes an identity verification, criminal background check, and local knowledge check. You will see a blue checkmark badge on their profiles.</p>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, color: '#334155', fontSize: '0.95rem', marginBottom: 6 }}>3. What is the cancellation policy?</h4>
                <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>You can cancel any booking up to 24 hours prior to the start time of the tour for a full 100% refund. Cancellations made within 24 hours receive a 50% refund.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── HELP MODAL (CHAT BOT) ─── */}
      {showHelpModal && (
        <div style={{
          position: 'fixed',
          bottom: 30,
          right: 30,
          width: '380px',
          height: '500px',
          background: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden',
          border: '1px solid #E2E8F0'
        }}>
          <div style={{
            background: '#1E3A8A',
            color: '#FFFFFF',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MessageSquare size={20} />
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', display: 'block' }}>RouteByRoot Support</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>Online | Replies instantly</span>
              </div>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FFFFFF' }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, background: '#F8FAFC' }}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                background: msg.sender === 'user' ? '#1E3A8A' : '#FFFFFF',
                color: msg.sender === 'user' ? '#FFFFFF' : '#334155',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '0.88rem',
                maxWidth: '80%',
                boxShadow: msg.sender === 'user' ? 'none' : '0 2px 4px rgba(0,0,0,0.05)',
                border: msg.sender === 'user' ? 'none' : '1px solid #E2E8F0'
              }}>
                {msg.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleHelpMessageSend} style={{ display: 'flex', borderTop: '1px solid #E2E8F0', padding: 8, background: '#FFFFFF' }}>
            <input
              type="text"
              placeholder="Ask support..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              style={{ flex: 1, border: 'none', padding: '10px', fontSize: '0.88rem', outline: 'none' }}
            />
            <button
              type="submit"
              style={{ background: '#1E3A8A', color: '#FFFFFF', border: 'none', borderRadius: '8px', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Send size={16} />
            </button>
          </form>

        </div>
      )}

      {/* ─── PHOTO GALLERY MODAL ─── */}
      {showGalleryModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.92)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: 20,
        }}>
          {/* Close */}
          <button
            onClick={() => setShowGalleryModal(false)}
            style={{
              position: 'absolute',
              top: 20,
              right: 24,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFFFFF',
              zIndex: 10,
            }}
          >
            <X size={22} />
          </button>

          {/* Image Counter */}
          <div style={{
            position: 'absolute',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
            borderRadius: '24px',
            padding: '8px 20px',
            color: '#FFFFFF',
            fontSize: '0.9rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
          }}>
            {galleryIndex + 1} / {selectedGuide.galleryImages.length}
          </div>

          {/* Navigation Left */}
          <button
            onClick={() => setGalleryIndex((galleryIndex - 1 + selectedGuide.galleryImages.length) % selectedGuide.galleryImages.length)}
            style={{
              position: 'absolute',
              left: 24,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: 52,
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFFFFF',
              fontSize: '1.2rem',
              transition: 'all 0.2s ease',
            }}
          >
            <ChevronLeft size={26} />
          </button>

          {selectedGuide.galleryImages[galleryIndex].startsWith('data:video') || selectedGuide.galleryImages[galleryIndex].match(/\.(mp4|webm|ogg)$/i) ? (
            <video
              src={selectedGuide.galleryImages[galleryIndex]}
              controls
              style={{
                maxWidth: '85vw',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            />
          ) : (
            <img
              src={selectedGuide.galleryImages[galleryIndex]}
              alt={`Gallery ${galleryIndex + 1}`}
              style={{
                maxWidth: '85vw',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            />
          )}

          {/* Navigation Right */}
          <button
            onClick={() => setGalleryIndex((galleryIndex + 1) % selectedGuide.galleryImages.length)}
            style={{
              position: 'absolute',
              right: 24,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: 52,
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFFFFF',
              fontSize: '1.2rem',
              transition: 'all 0.2s ease',
            }}
          >
            <ChevronRight size={26} />
          </button>

          {/* Thumbnail Strip */}
          <div style={{
            display: 'flex',
            gap: 10,
            marginTop: 20,
            overflowX: 'auto',
            maxWidth: '90vw',
            padding: '8px 4px',
          }}>
            {selectedGuide.galleryImages.map((img, idx) => (
              img.startsWith('data:video') || img.match(/\\.(mp4|webm|ogg)$/i) ? (
                <video
                  key={idx}
                  src={img}
                  onClick={() => setGalleryIndex(idx)}
                  style={{
                    width: 72,
                    height: 52,
                    objectFit: 'cover',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: idx === galleryIndex ? '3px solid #F97316' : '3px solid transparent',
                    opacity: idx === galleryIndex ? 1 : 0.6,
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <img
                  key={idx}
                  src={img}
                  alt={`thumb-${idx}`}
                  onClick={() => setGalleryIndex(idx)}
                  style={{
                    width: 72,
                    height: 52,
                    objectFit: 'cover',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: idx === galleryIndex ? '3px solid #F97316' : '3px solid transparent',
                    opacity: idx === galleryIndex ? 1 : 0.6,
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                />
              )
            ))}
          </div>
        </div>
      )}

      {/* ─── VERIFICATION MODAL ─── */}
      {showVerificationModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: 20,
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '0',
            maxWidth: '560px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            position: 'relative',
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
              borderRadius: '20px 20px 0 0',
              padding: '28px 30px',
              color: '#FFFFFF',
              position: 'relative',
            }}>
              <button
                onClick={() => setShowVerificationModal(false)}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#FFFFFF',
                }}
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Shield size={26} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.3rem', fontWeight: 800 }}>
                    Verification Details
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>
                    {selectedGuide.name.split(' ')[0]} - {selectedGuide.verification.badgeLevel}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '28px 30px' }}>

              {/* Badge Level */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 20px',
                background: selectedGuide.verification.badgeLevel.includes('Platinum') ? 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)' :
                             selectedGuide.verification.badgeLevel.includes('Gold') ? 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)' :
                             'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                borderRadius: '14px',
                marginBottom: 24,
                border: '1px solid ' + (selectedGuide.verification.badgeLevel.includes('Platinum') ? '#DDD6FE' :
                         selectedGuide.verification.badgeLevel.includes('Gold') ? '#FDE68A' : '#BAE6FD'),
              }}>
                <BadgeCheck size={28} color={
                  selectedGuide.verification.badgeLevel.includes('Platinum') ? '#7C3AED' :
                  selectedGuide.verification.badgeLevel.includes('Gold') ? '#D97706' : '#0284C7'
                } />
                <div>
                  <div style={{
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    color: selectedGuide.verification.badgeLevel.includes('Platinum') ? '#7C3AED' :
                           selectedGuide.verification.badgeLevel.includes('Gold') ? '#D97706' : '#0284C7',
                  }}>
                    {selectedGuide.verification.badgeLevel}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
                    Verified since {selectedGuide.verification.verifiedSince}
                  </div>
                </div>
              </div>

              {/* Verification Checks */}
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Verification Checks
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {[
                  { label: 'Identity Verified', desc: 'Government-issued photo ID verified by our team', status: selectedGuide.verification.identityVerified },
                  { label: 'Background Check', desc: 'Criminal background screening completed', status: selectedGuide.verification.backgroundCheck },
                  { label: 'Local Knowledge Test', desc: 'Passed destination knowledge assessment', status: selectedGuide.verification.localKnowledge },
                ].map((check, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 18px',
                    background: check.status ? '#F0FDF4' : '#FEF2F2',
                    borderRadius: '12px',
                    border: `1px solid ${check.status ? '#BBF7D0' : '#FECACA'}`,
                  }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: check.status ? '#22C55E' : '#EF4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {check.status ? <CheckCircle size={18} color="#FFFFFF" /> : <X size={18} color="#FFFFFF" />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#334155' }}>{check.label}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{check.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Documents Submitted */}
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Documents Submitted
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                {selectedGuide.verification.documentsSubmitted.map((doc, idx) => (
                  <span key={idx} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    background: '#F1F5F9',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#475569',
                    border: '1px solid #E2E8F0',
                  }}>
                    <FileText size={13} color="#64748B" />
                    {doc}
                  </span>
                ))}
              </div>

              {/* Trust Note */}
              <div style={{
                padding: '16px 20px',
                background: '#FFFBEB',
                borderRadius: '12px',
                border: '1px solid #FDE68A',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}>
                <Shield size={20} color="#D97706" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#92400E', marginBottom: 4 }}>Trust & Safety Note</div>
                  <div style={{ fontSize: '0.82rem', color: '#78716C', lineHeight: 1.5 }}>
                    All RouteByRoot guides undergo a rigorous multi-step verification process. Documents are reviewed by our Trust & Safety team and re-verified annually.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── VIEW: BECOME A PARTNER FORM ─── */}
      {activeView === 'become-partner' && (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 60px' }}>
          {!partnerSubmitted ? (
            <div style={{
              background: '#FFFFFF',
              borderRadius: 16,
              boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
              padding: '40px 44px',
              border: '1px solid #E2E8F0'
            }}>
              {/* Header */}
              <h2 style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 800,
                fontSize: '1.75rem',
                color: 'var(--teal)',
                margin: '0 0 6px'
              }}>
                Become a Partner
              </h2>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.95rem',
                color: '#64748B',
                margin: '0 0 32px',
                lineHeight: 1.6
              }}>
                Fill in the below form, we will get back to you shortly
              </p>

              {/* Form Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px 24px',
                marginBottom: 20
              }}>
                {/* Guide Name */}
                <div>
                  <input
                    type="text"
                    placeholder="Guide Name*"
                    value={partnerForm.guideName}
                    onChange={(e) => handlePartnerInputChange('guideName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: 10,
                      fontSize: '0.92rem',
                      fontFamily: "'Inter', sans-serif",
                      color: '#1E293B',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      background: '#FAFBFC',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#06B6D4'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.12)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                {/* Contact Number */}
                <div>
                  <input
                    type="tel"
                    placeholder="Contact Number*"
                    value={partnerForm.contactNumber}
                    onChange={(e) => handlePartnerInputChange('contactNumber', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: 10,
                      fontSize: '0.92rem',
                      fontFamily: "'Inter', sans-serif",
                      color: '#1E293B',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      background: '#FAFBFC',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#06B6D4'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.12)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                {/* Current Address */}
                <div>
                  <input
                    type="text"
                    placeholder="Current Address*"
                    value={partnerForm.currentAddress}
                    onChange={(e) => handlePartnerInputChange('currentAddress', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: 10,
                      fontSize: '0.92rem',
                      fontFamily: "'Inter', sans-serif",
                      color: '#1E293B',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      background: '#FAFBFC',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#06B6D4'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.12)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                {/* City Name */}
                <div>
                  <input
                    type="text"
                    placeholder="City Name*"
                    value={partnerForm.cityName}
                    onChange={(e) => handlePartnerInputChange('cityName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: 10,
                      fontSize: '0.92rem',
                      fontFamily: "'Inter', sans-serif",
                      color: '#1E293B',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      background: '#FAFBFC',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#06B6D4'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.12)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                {/* State */}
                <div>
                  <input
                    type="text"
                    placeholder="State*"
                    value={partnerForm.state}
                    onChange={(e) => handlePartnerInputChange('state', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: 10,
                      fontSize: '0.92rem',
                      fontFamily: "'Inter', sans-serif",
                      color: '#1E293B',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      background: '#FAFBFC',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#06B6D4'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.12)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                {/* Country */}
                <div>
                  <input
                    type="text"
                    placeholder="Country*"
                    value={partnerForm.countryName}
                    onChange={(e) => handlePartnerInputChange('countryName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: 10,
                      fontSize: '0.92rem',
                      fontFamily: "'Inter', sans-serif",
                      color: '#1E293B',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      background: '#FAFBFC',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#06B6D4'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.12)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                {/* PIN Code */}
                <div>
                  <input
                    type="text"
                    placeholder="PIN Code*"
                    value={partnerForm.pinCode}
                    onChange={(e) => handlePartnerInputChange('pinCode', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: 10,
                      fontSize: '0.92rem',
                      fontFamily: "'Inter', sans-serif",
                      color: '#1E293B',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      background: '#FAFBFC',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#06B6D4'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.12)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                {/* Upload Passport */}
                <div>
                  <label
                    htmlFor="passport-upload"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: 10,
                      fontSize: '0.92rem',
                      fontFamily: "'Inter', sans-serif",
                      color: partnerPassportFile ? '#1E293B' : '#94A3B8',
                      background: '#FAFBFC',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {partnerPassportFile ? partnerPassportFile.name : 'Upload Passport*'}
                    </span>
                    <Upload size={18} color="#64748B" />
                  </label>
                  <input
                    id="passport-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setPartnerPassportFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Short Description */}
              <div style={{ marginBottom: 32 }}>
                <textarea
                  placeholder="Short Description (in 100 words)*"
                  value={partnerForm.shortDescription}
                  onChange={(e) => handlePartnerInputChange('shortDescription', e.target.value)}
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: 10,
                    fontSize: '0.92rem',
                    fontFamily: "'Inter', sans-serif",
                    color: '#1E293B',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: 120,
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    background: '#FAFBFC',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#06B6D4'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.12)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none'; }}
                />
                <div style={{ textAlign: 'right', marginTop: 6, fontSize: '0.78rem', color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>
                  {partnerForm.shortDescription.trim().split(/\s+/).filter(Boolean).length} / 100 words
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 24,
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={handlePartnerSave}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '14px 40px',
                    border: 'none',
                    borderRadius: 30,
                    background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
                    color: '#FFFFFF',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
                    boxShadow: '0 4px 16px rgba(6,182,212,0.35)',
                    transition: 'transform 0.15s, box-shadow 0.15s'
                  }}
                  onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(6,182,212,0.45)'; }}
                  onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(6,182,212,0.35)'; }}
                >
                  <Save size={18} /> SAVE
                </button>
                <button
                  onClick={handlePartnerSubmit}
                  disabled={partnerSaving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '14px 40px',
                    border: 'none',
                    borderRadius: 30,
                    background: partnerSaving ? '#94A3B8' : 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
                    color: '#FFFFFF',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: partnerSaving ? 'not-allowed' : 'pointer',
                    letterSpacing: '0.04em',
                    boxShadow: partnerSaving ? 'none' : '0 4px 16px rgba(6,182,212,0.35)',
                    transition: 'transform 0.15s, box-shadow 0.15s'
                  }}
                  onMouseOver={(e) => { if (!partnerSaving) { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(6,182,212,0.45)'; } }}
                  onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(6,182,212,0.35)'; }}
                >
                  {partnerSaving ? (
                    <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Submitting...</>
                  ) : (
                    <><Send size={18} /> SEND</>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* ─── SUCCESS / APPROVAL PENDING MESSAGE ─── */
            <div style={{
              textAlign: 'center',
              padding: '60px 40px',
              background: '#FFFFFF',
              borderRadius: 20,
              boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
              border: '1px solid #E2E8F0',
              maxWidth: 600,
              margin: '40px auto'
            }}>
              {/* Animated Success Icon */}
              <div style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #06B6D4 0%, #22C55E 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 8px 32px rgba(6,182,212,0.3)',
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                <CheckCircle2 size={44} color="#FFFFFF" strokeWidth={2.5} />
              </div>

              <h2 style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 800,
                fontSize: '1.6rem',
                color: 'var(--navy)',
                margin: '0 0 12px'
              }}>
                Application Submitted!
              </h2>

              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '1rem',
                color: '#475569',
                lineHeight: 1.7,
                margin: '0 0 8px',
                maxWidth: 450,
                marginLeft: 'auto',
                marginRight: 'auto'
              }}>
                Thank you for applying to become a <strong style={{ color: 'var(--teal)' }}>RouteByRoot Partner</strong>!
              </p>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.92rem',
                color: '#64748B',
                lineHeight: 1.7,
                margin: '0 0 28px',
                maxWidth: 450,
                marginLeft: 'auto',
                marginRight: 'auto'
              }}>
                Our Admin team will carefully review your details and verify your passport document.
                You will receive an <strong>email notification</strong> once your application is approved.
                This usually takes <strong>1–3 business days</strong>.
              </p>

              {/* Status Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 24px',
                borderRadius: 30,
                background: 'linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)',
                border: '1px solid #FCD34D',
                marginBottom: 28
              }}>
                <Clock size={16} color="#D97706" />
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  color: '#92400E'
                }}>
                  Pending Admin Approval
                </span>
              </div>

              <div style={{ marginBottom: 8 }}>
                <button
                  onClick={() => {
                    setActiveView('listings');
                    setPartnerSubmitted(false);
                    setPartnerForm({
                      guideName: '', contactNumber: '', currentAddress: '', cityName: '',
                      state: '', countryName: '', pinCode: '', shortDescription: ''
                    });
                    setPartnerPassportFile(null);
                    localStorage.removeItem('partnerFormDraft');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 32px',
                    border: 'none',
                    borderRadius: 30,
                    background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)',
                    color: '#FFFFFF',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(26,31,94,0.3)',
                    transition: 'transform 0.15s, box-shadow 0.15s'
                  }}
                  onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
                  onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
                >
                  <Home size={16} /> Back to Home
                </button>
              </div>
            </div>
          )}

          {/* Pulse animation for success icon */}
          <style>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
          `}</style>
        </div>
      )}

    </div>
  );
}
