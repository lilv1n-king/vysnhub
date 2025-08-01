import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { AuthUser, Profile, SignUpData, SignInData } from '../types/auth';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<{ error: Error | null }>;
  signIn: (data: SignInData) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile from database
  const loadProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error loading profile:', error);
      return null;
    }
  };

  // Create profile after successful signup
  const createProfile = async (userId: string, userData: SignUpData): Promise<Profile | null> => {
    try {
      const profileData = {
        id: userId,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        company_name: userData.company_name || null,
        phone: userData.phone || null,
        customer_type: 'standard' as const,
        discount_percentage: 0,
        account_status: 'active' as const,
        language: 'de',
        currency: 'EUR',
        newsletter_subscription: false,
        marketing_emails: false,
        country: 'Deutschland'
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  };

  // Sign up new user
  const signUp = async (userData: SignUpData) => {
    try {
      setLoading(true);
      
      // Check if supabase is available
      if (!supabase.auth) {
        return { error: new Error('Authentication service not available') };
      }

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (error) {
        return { error };
      }

      // If user was created, create profile
      if (data.user) {
        const profile = await createProfile(data.user.id, userData);
        if (profile) {
          setUser({
            id: data.user.id,
            email: data.user.email!,
            profile
          });
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  // Sign in existing user
  const signIn = async (userData: SignInData) => {
    try {
      setLoading(true);
      
      // Check if supabase is available
      if (!supabase.auth) {
        return { error: new Error('Authentication service not available') };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        const profile = await loadProfile(data.user.id);
        setUser({
          id: data.user.id,
          email: data.user.email!,
          profile: profile || undefined
        });

        // Update last login
        if (profile) {
          await supabase
            .from('profiles')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', data.user.id);
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  // Sign out user
  const signOut = async () => {
    try {
      setLoading(true);
      
      if (!supabase.auth) {
        return { error: new Error('Authentication service not available') };
      }

      const { error } = await supabase.auth.signOut();
      
      if (!error) {
        setUser(null);
        setSession(null);
      }

      return { error };
    } catch (error) {
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      if (!supabase.auth) {
        return { error: new Error('Authentication service not available') };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) {
        return { error: new Error('No user logged in') };
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (!error && user.profile) {
        // Update local user state
        setUser({
          ...user,
          profile: {
            ...user.profile,
            ...updates
          }
        });
      }

      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (!user) return;

    const profile = await loadProfile(user.id);
    if (profile) {
      setUser({
        ...user,
        profile
      });
    }
  };

  // Initialize auth state and listen for changes
  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        if (!supabase.auth) {
          setLoading(false);
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (mounted) {
          setSession(session);
          
          if (session?.user) {
            const profile = await loadProfile(session.user.id);
            setUser({
              id: session.user.id,
              email: session.user.email!,
              profile: profile || undefined
            });
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth?.onAuthStateChange?.(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);

        if (session?.user) {
          const profile = await loadProfile(session.user.id);
          setUser({
            id: session.user.id,
            email: session.user.email!,
            profile: profile || undefined
          });
        } else {
          setUser(null);
        }

        setLoading(false);
      }
    ) || { data: { subscription: null } };

    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}