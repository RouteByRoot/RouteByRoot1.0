import React, { createContext, useContext, useState, type ReactNode } from 'react';

export interface GuideListing {
  id: string;
  guideName: string;
  contact: string;
  stayingCountry: string;
  arrivalYear?: string;
  nationality: string;
  currentAddress: string;
  originAddress: string;
  city1: string;
  pin1: string;
  city2: string;
  pin2: string;
  locations: string;
  bankName: string;
  ifsc: string;
  accNo: string;
  holderName: string;
  branch: string;
  description: string;
  languages?: string;
  price: string;
  pickupTime: string;
  dropTime: string;
  pickupPoint: string;
  dropPoint: string;
  status: 'pending' | 'approved' | 'rejected';
  enabled: boolean;
  createdAt: string;
  guideEmail: string;
  thumbnailUrl?: string;
  availableDates?: string[];
  passportFrontUrl?: string;
  passportBackUrl?: string;
  visaUrl?: string;
  localIdFrontUrl?: string;
  localIdBackUrl?: string;
  passbookFrontUrl?: string;
  passbookBackUrl?: string;
  galleryImages?: string[];
}

interface ListingsContextType {
  listings: GuideListing[];
  addListing: (listing: Omit<GuideListing, 'id' | 'status' | 'enabled' | 'createdAt'>) => void;
  updateListing: (id: string, updates: Partial<GuideListing>) => void;
  approveListing: (id: string) => void;
  rejectListing: (id: string) => void;
  toggleListingEnabled: (id: string) => void;
  getListingsByGuide: (email: string) => GuideListing[];
  getPendingListings: () => GuideListing[];
  getApprovedListings: () => GuideListing[];
}

const ListingsContext = createContext<ListingsContextType | undefined>(undefined);

export function ListingsProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<GuideListing[]>(() => {
    const saved = localStorage.getItem('routebyroot_listings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    
    // Default initial listing for Shivashish Chamoli (guide@example.com)
    return [
      {
        id: 'L-default-1',
        guideName: 'Shivashish Chamoli',
        contact: '+81 8705032459',
        stayingCountry: 'JAPAN',
        nationality: 'INDIAN',
        currentAddress: 'Tachikawa, Tokyo, JAPAN',
        originAddress: 'Dehradun, Uttarakhand, India',
        city1: 'Tachikawa',
        pin1: '131-405',
        city2: 'Dehradun',
        pin2: '248001',
        locations: 'Tokyo City, Shibuya Rokko Market, Sukesan Eatery, Tokyo Sky Tree, Abeyamakoen',
        bankName: 'Japan Post Bank',
        ifsc: 'JPB0001',
        accNo: '987654321',
        holderName: 'Shivashish Chamoli',
        branch: 'Tachikawa Branch',
        description: "Hi! I'm your local guide based in Tokyo, Japan. I've been living here for 3 years and love helping travelers explore the hidden gems and rich culture of my city. Being from India, I understand the comfort of connecting with someone who speaks your language and shares your background. I offer curated tours to top attractions, lesser-known local spots, and food joints loved by locals.",
        languages: 'English, Hindi, Japanese',
        price: '1450',
        pickupTime: '09:00 AM',
        dropTime: '19:00 PM',
        pickupPoint: 'Shibuya Crossing',
        dropPoint: 'Shibuya Station',
        status: 'approved',
        enabled: true,
        createdAt: new Date().toISOString(),
        guideEmail: 'guide@example.com',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=600',
        availableDates: ['2026-06-26', '2026-06-27', '2026-06-28'],
        passportFrontUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=600&auto=format&fit=crop&q=60', // Mock Passport Front
        passportBackUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=60', // Mock Passport Back
        visaUrl: 'https://images.unsplash.com/photo-1568051243851-f9b136146e97?w=600&auto=format&fit=crop&q=60', // Mock Visa
        localIdFrontUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=60', // Mock Local ID Front
        localIdBackUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=60', // Mock Local ID Back
        passbookFrontUrl: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=600&auto=format&fit=crop&q=60', // Mock Passbook Front
        passbookBackUrl: 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=600&auto=format&fit=crop&q=60', // Mock Passbook Back
      },
      // Srilakshmi Shetty
      {
        id: 'guide-1',
        guideName: 'Shrilakshmi Shetty',
        contact: '+81 9012345678',
        stayingCountry: 'JAPAN',
        nationality: 'INDIAN',
        currentAddress: 'Shinjuku, Tokyo, JAPAN',
        originAddress: 'Mumbai, Maharashtra, India',
        city1: 'Tokyo',
        pin1: '160-0022',
        city2: 'Mumbai',
        pin2: '400001',
        locations: 'Senso-ji Temple, Shibuya Crossing, Harajuku Takeshita, Shinjuku Gyoen, Meiji Shrine',
        bankName: 'Sumitomo Mitsui Bank',
        ifsc: 'SMBC001',
        accNo: '1122334455',
        holderName: 'Shrilakshmi Shetty',
        branch: 'Shinjuku Branch',
        description: "Namaste! I'm Shrilakshmi, an Indian expat living in Tokyo. I specialize in family-friendly tours, shopping guidance, and cultural deep dives. Whether you want to explore ancient temples, shop for electronics in Akihabara, or find the best Indian food in Tokyo, I can customize the perfect itinerary for you and your family.",
        languages: 'English, Hindi, Marathi',
        price: '500',
        pickupTime: '08:30 AM',
        dropTime: '17:30 PM',
        pickupPoint: 'Hotel Lobby / Nearest Station',
        dropPoint: 'As per itinerary',
        status: 'approved',
        enabled: true,
        createdAt: new Date('2026-05-14T10:00:00Z').toISOString(),
        guideEmail: 'srilakshmi@example.com',
        thumbnailUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80',
        availableDates: ['2026-06-26', '2026-06-27', '2026-06-28'],
        passportFrontUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=600&auto=format&fit=crop&q=60',
        passportBackUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=60',
        visaUrl: 'https://images.unsplash.com/photo-1568051243851-f9b136146e97?w=600&auto=format&fit=crop&q=60',
        localIdFrontUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=60',
        localIdBackUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=60',
        passbookFrontUrl: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=600&auto=format&fit=crop&q=60',
        passbookBackUrl: 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=600&auto=format&fit=crop&q=60',
      },
      // Mohammad Gafoor
      {
        id: 'guide-4',
        guideName: 'Mohammad Gafoor',
        contact: '+81 8098765432',
        stayingCountry: 'JAPAN',
        nationality: 'INDIAN',
        currentAddress: 'Ueno, Tokyo, JAPAN',
        originAddress: 'Hyderabad, Telangana, India',
        city1: 'Tokyo',
        pin1: '110-0005',
        city2: 'Hyderabad',
        pin2: '500001',
        locations: 'Akihabara Electric Town, Ueno Park, Asakusa Street Food Alley, Sumida Park, Halal Ramen Ouka',
        bankName: 'Mizuho Bank',
        ifsc: 'MIZ0001',
        accNo: '5566778899',
        holderName: 'Mohammad Gafoor',
        branch: 'Ueno Branch',
        description: "As a culinary-focused guide, I specialize in Halal-friendly dining experiences across Tokyo. My tours are perfect for travelers who want to experience authentic Japanese cuisine without dietary concerns. I maintain an updated list of over 50 Halal-certified restaurants across Tokyo.",
        price: '480',
        pickupTime: '10:00 AM',
        dropTime: '20:00 PM',
        pickupPoint: 'Akihabara Station Central Exit',
        dropPoint: 'Local Station',
        status: 'approved',
        enabled: true,
        createdAt: new Date('2026-06-12T10:00:00Z').toISOString(),
        guideEmail: 'gafoor@example.com',
        thumbnailUrl: 'https://images.unsplash.com/photo-1452421820064-e2869df4a5f6?auto=format&fit=crop&w=600&q=80',
        availableDates: ['2026-06-26', '2026-06-27', '2026-06-28'],
        passportFrontUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=600&auto=format&fit=crop&q=60',
        passportBackUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=60',
        visaUrl: 'https://images.unsplash.com/photo-1568051243851-f9b136146e97?w=600&auto=format&fit=crop&q=60',
        localIdFrontUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=60',
        localIdBackUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=60',
        passbookFrontUrl: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=600&auto=format&fit=crop&q=60',
        passbookBackUrl: 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=600&auto=format&fit=crop&q=60',
      }
    ];
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('routebyroot_listings', JSON.stringify(listings));
    } catch (e) {
      console.warn('localStorage save failed (possibly quota exceeded):', e);
    }
  }, [listings]);

  const addListing = (listing: Omit<GuideListing, 'id' | 'status' | 'enabled' | 'createdAt'>) => {
    const newListing: GuideListing = {
      ...listing,
      id: Date.now().toString(),
      status: 'approved', // Auto-approved for high-fidelity demo purposes
      enabled: true,
      createdAt: new Date().toISOString(),
    };
    setListings(prev => [newListing, ...prev]);
  };

  const updateListing = (id: string, updates: Partial<GuideListing>) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const approveListing = (id: string) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'approved' as const } : l));
  };

  const rejectListing = (id: string) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'rejected' as const } : l));
  };

  const toggleListingEnabled = (id: string) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, enabled: !l.enabled } : l));
  };

  const getListingsByGuide = (email: string) => {
    if (!email) return [];
    const filtered = listings.filter(l => l.guideEmail === email);
    if (filtered.length === 0) {
      const defaultListing: GuideListing = {
        id: `L-default-${email.replace(/[^a-zA-Z0-9]/g, '')}`,
        guideName: 'Shivashish Chamoli',
        contact: '+81 8705032459',
        stayingCountry: 'JAPAN',
        nationality: 'INDIAN',
        currentAddress: 'Tachikawa, Tokyo, JAPAN',
        originAddress: 'Dehradun, Uttarakhand, India',
        city1: 'Tachikawa',
        pin1: '131-405',
        city2: 'Dehradun',
        pin2: '248001',
        locations: 'Tokyo City, Shibuya Rokko Market, Sukesan Eatery, Tokyo Sky Tree, Abeyamakoen',
        bankName: 'Japan Post Bank',
        ifsc: 'JPB0001',
        accNo: '987654321',
        holderName: 'Shivashish Chamoli',
        branch: 'Tachikawa Branch',
        description: "Hi! I'm your local guide based in Tokyo, Japan. I've been living here for 3 years and love helping travelers explore the hidden gems and rich culture of my city. Being from India, I understand the comfort of connecting with someone who speaks your language and shares your background. I offer curated tours to top attractions, lesser-known local spots, and food joints loved by locals.",
        price: '1450',
        pickupTime: '09:00 AM',
        dropTime: '19:00 PM',
        pickupPoint: 'Shibuya Crossing',
        dropPoint: 'Shibuya Station',
        status: 'approved',
        enabled: true,
        createdAt: new Date().toISOString(),
        guideEmail: email,
        thumbnailUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=600',
        availableDates: ['2026-06-26', '2026-06-27', '2026-06-28']
      };

      // Add to listings state in background
      setTimeout(() => {
        setListings(prev => {
          if (prev.some(l => l.guideEmail === email)) return prev;
          const next = [defaultListing, ...prev];
          localStorage.setItem('routebyroot_listings', JSON.stringify(next));
          return next;
        });
      }, 0);

      return [defaultListing];
    }
    return filtered;
  };

  const getPendingListings = () => {
    return listings.filter(l => l.status === 'pending');
  };

  const getApprovedListings = () => {
    return listings.filter(l => l.status === 'approved' && l.enabled);
  };

  return (
    <ListingsContext.Provider value={{
      listings,
      addListing,
      updateListing,
      approveListing,
      rejectListing,
      toggleListingEnabled,
      getListingsByGuide,
      getPendingListings,
      getApprovedListings,
    }}>
      {children}
    </ListingsContext.Provider>
  );
}

export function useListings() {
  const context = useContext(ListingsContext);
  if (!context) {
    throw new Error('useListings must be used within a ListingsProvider');
  }
  return context;
}
