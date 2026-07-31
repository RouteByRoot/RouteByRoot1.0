import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string, role?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error || !data) return null;
    return data as User;
  };

  useEffect(() => {
    // Check for mock user first to support UI demo without backend
    const mockUserStr = localStorage.getItem('routebyroot_mock_user');
    if (mockUserStr) {
      try {
        setUser(JSON.parse(mockUserStr));
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('routebyroot_mock_user');
      }
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (localStorage.getItem('routebyroot_mock_user')) return; // ignore real auth if using mock

      setLoading(true);
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const createMockSession = (email: string, password?: string, roleOverride?: string) => {
    let role = roleOverride || 'traveler';
    // Let's guess role from email if no override provided for sign in
    if (!roleOverride) {
      if (email.includes('guide') || email === 'akshaytechditen@gmail.com') role = 'guide';
      if (email.includes('admin') || email === 'akkikashyap.kashyap@gmail.com') role = 'admin';
    }

    const mockUser = {
      id: `mock-${role}-${Date.now()}`,
      email,
      name: email.split('@')[0].replace(/[._]/g, ' '),
      role: role as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localStorage.setItem('routebyroot_mock_user', JSON.stringify(mockUser));
    setUser(mockUser);
    return { error: null };
  };

  // Known real Supabase users mapped to roles
  const KNOWN_REAL_USERS: Record<string, string> = {
    'akshaytechditen@gmail.com': 'guide',
    'akkikashyap.kashyap@gmail.com': 'admin',
  };

  const signIn = async (email: string, password: string) => {
    // If it's a demo shortcut email, skip Supabase entirely
    if (email === 'guide@routebyroot.com' || email === 'traveler@routebyroot.com' || email === 'admin@routebyroot.com') {
      return createMockSession(email, password);
    }

    // For known real Supabase users, try real auth first
    const knownRole = KNOWN_REAL_USERS[email];

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Fallback to mock login if backend is unreachable
        if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
          console.warn('Backend unreachable. Falling back to mock session.');
          return createMockSession(email, password);
        }
        // For known real users, return the actual error (wrong password etc.)
        if (knownRole) {
          return { error: error.message };
        }
        // For unknown emails in demo mode, fall back to mock session
        console.warn('Auth failed. Falling back to mock session for demo.', error.message);
        return createMockSession(email, password);
      }

      // Auth succeeded — try to fetch profile from Supabase
      if (data.user) {
        const profile = await fetchProfile(data.user.id);
        if (profile) {
          // Profile exists in Supabase — use it directly
          setUser(profile);
          return { error: null };
        }
        // No profile row yet — create a local session with the correct role
        const roleToUse = knownRole || 'traveler';
        const mockUser = {
          id: data.user.id,
          email: data.user.email || email,
          name: (data.user.user_metadata?.name as string) || email.split('@')[0].replace(/[._]/g, ' '),
          role: roleToUse as any,
          created_at: data.user.created_at,
          updated_at: data.user.updated_at || new Date().toISOString(),
        };
        localStorage.setItem('routebyroot_mock_user', JSON.stringify(mockUser));
        setUser(mockUser);
      }
      return { error: null };
    } catch (e: any) {
      return createMockSession(email, password);
    }
  };

  const signUp = async (email: string, password: string, name: string, role = 'traveler') => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role } },
      });
      if (error) {
        if (error.message.includes('Failed to fetch')) {
          return createMockSession(email, password, role);
        }
        return { error: error.message };
      }
      return { error: null };
    } catch (e) {
      return createMockSession(email, password, role);
    }
  };

  const signOut = async () => {
    localStorage.removeItem('routebyroot_mock_user');
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    setUser(null);
  };

  const refetchUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await fetchProfile(session.user.id);
      setUser(profile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
