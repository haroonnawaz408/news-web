import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  demoLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'pulse_admin_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const createAdminUser = (username: string): User => ({
    id: `admin-${username}`,
    app_metadata: {},
    user_metadata: { role: 'admin', name: 'Haroon (Super Admin)' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email: `${username}@pulsenews.pk`,
  });

  useEffect(() => {
    // 1. Check local session for direct credentials (haroon409)
    const storedAdmin = localStorage.getItem(ADMIN_STORAGE_KEY) || sessionStorage.getItem(ADMIN_STORAGE_KEY);
    if (storedAdmin === 'haroon409') {
      setUser(createAdminUser('haroon409'));
      setIsAdmin(true);
      setIsLoading(false);
      return;
    }

    // 2. Check Supabase session if configured
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsAdmin(Boolean(session?.user));
        setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsAdmin(Boolean(session?.user));
        setIsLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (usernameOrEmail: string, password: string): Promise<{ error: Error | null }> => {
    const trimmedUser = usernameOrEmail.trim().toLowerCase();
    const trimmedPass = password.trim();

    // Direct requested credentials
    if (trimmedUser === 'haroon409' && trimmedPass === 'haroon409') {
      localStorage.setItem(ADMIN_STORAGE_KEY, 'haroon409');
      const adminUser = createAdminUser('haroon409');
      setUser(adminUser);
      setIsAdmin(true);
      return { error: null };
    }

    // Supabase auth fallback if configured
    if (isSupabaseConfigured() && supabase && trimmedUser.includes('@')) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedUser,
        password: trimmedPass,
      });
      if (error) return { error };
      setUser(data.user);
      setIsAdmin(Boolean(data.user));
      return { error: null };
    }

    return {
      error: new Error('Invalid username or password. Access is restricted to authorized personnel.'),
    };
  };

  const demoLogin = () => {
    localStorage.setItem(ADMIN_STORAGE_KEY, 'haroon409');
    setUser(createAdminUser('haroon409'));
    setIsAdmin(true);
  };

  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Continue
      }
    }
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, isLoading, login, logout, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

