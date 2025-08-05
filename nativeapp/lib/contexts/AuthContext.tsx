import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { AuthUser, Profile, SignUpData, SignInData } from '../types/auth';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { apiService } from '../services/apiService';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  signUp: (data: SignUpData) => Promise<{ error: AuthError | Error | null }>;
  signIn: (data: SignInData) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<{ error: AuthError | Error | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | Error | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  getApiHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType | null {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('useAuth must be used within an AuthProvider');
    // Return null instead of throwing to prevent crashes
    return null;
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
  const [initialized, setInitialized] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Load profile from database with error handling
  const loadProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      if (!supabase?.from) {
        console.warn('Supabase not available, using mock profile');
        return null;
      }

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
  }, []);

  // Create profile after successful signup with error handling
  const createProfile = useCallback(async (userId: string, userData: SignUpData): Promise<Profile | null> => {
    try {
      if (!supabase?.from) {
        console.warn('Supabase not available, skipping profile creation');
        return null;
      }

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
  }, []);

  // Sign up new user with robust error handling
  const signUp = useCallback(async (userData: SignUpData) => {
    try {
      setLoading(true);
      
      // Check if supabase auth is available
      if (!supabase?.auth) {
        return { error: new Error('Authentication service not available') };
      }

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            company_name: userData.company_name || null,
            phone: userData.phone || null
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }

      // If user was created, create profile
      if (data.user) {
        const profile = await createProfile(data.user.id, userData);
        setUser({
          id: data.user.id,
          email: data.user.email!,
          profile: profile || undefined
        });
      }

      return { error: null };
    } catch (error) {
      console.error('Sign up exception:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  }, [createProfile]);

  // Sign in existing user with robust error handling
  const signIn = useCallback(async (userData: SignInData) => {
    try {
      setLoading(true);
      
      // Check if supabase auth is available
      if (!supabase?.auth) {
        return { error: new Error('Authentication service not available') };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      if (data.user && data.session) {
        const profile = await loadProfile(data.user.id);
        setUser({
          id: data.user.id,
          email: data.user.email!,
          profile: profile || undefined
        });
        setSession(data.session);
        
        // Set token for API service
        const token = data.session?.access_token || null;
        setAccessToken(token);
        apiService.setAuthToken(token);

        // Update last login (optional, don't fail if this fails)
        if (profile && supabase?.from) {
          try {
            await supabase
              .from('profiles')
              .update({ last_login_at: new Date().toISOString() })
              .eq('id', data.user.id);
          } catch (error) {
            console.warn('Failed to update last login:', error);
          }
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in exception:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  }, [loadProfile]);

  // Sign out user with robust error handling
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!supabase?.auth) {
        console.warn('Supabase auth not available, clearing local session');
        setUser(null);
        setSession(null);
        return { error: null };
      }

      const { error } = await supabase.auth.signOut();
      
      // Always clear local state, even if remote signout fails
      setUser(null);
      setSession(null);
      setAccessToken(null);
      apiService.setAuthToken(null);

      if (error) {
        console.error('Sign out error:', error);
      }

      return { error };
    } catch (error) {
      console.error('Sign out exception:', error);
      // Still clear local state
      setUser(null);
      setSession(null);
      setAccessToken(null);
      apiService.setAuthToken(null);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset password with error handling
  const resetPassword = useCallback(async (email: string) => {
    try {
      if (!supabase?.auth) {
        return { error: new Error('Authentication service not available') };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        console.error('Reset password error:', error);
      }
      
      return { error };
    } catch (error) {
      console.error('Reset password exception:', error);
      return { error: error as Error };
    }
  }, []);

  // Update user profile with error handling
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    try {
      if (!user) {
        return { error: new Error('No user logged in') };
      }

      if (!supabase?.from) {
        return { error: new Error('Database service not available') };
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Update profile error:', error);
        return { error };
      }

      // Update local user state
      if (user.profile) {
        setUser({
          ...user,
          profile: {
            ...user.profile,
            ...updates
          }
        });
      }

      return { error: null };
    } catch (error) {
      console.error('Update profile exception:', error);
      return { error: error as Error };
    }
  }, [user]);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (!user) return;

    try {
      const profile = await loadProfile(user.id);
      if (profile) {
        setUser({
          ...user,
          profile
        });
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  }, [user, loadProfile]);

  // Get headers for API requests
  const getApiHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return headers;
  }, [accessToken]);

  // Initialize auth state and listen for changes
  useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;

    const setupAuth = async () => {
      if (!supabase?.auth) {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
        return;
      }

      try {
        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;

            console.log('Auth state changed:', event, !!session);

            try {
              setSession(session);
              
              const token = session?.access_token || null;
              setAccessToken(token);
              apiService.setAuthToken(token);
              
              if (session?.user) {
                try {
                  const profile = await loadProfile(session.user.id);
                  setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    profile: profile || undefined
                  });

                  // Create profile if missing
                  if (!profile && supabase?.from) {
                    try {
                      const basicProfile = {
                        id: session.user.id,
                        email: session.user.email!,
                        first_name: session.user.user_metadata?.first_name || '',
                        last_name: session.user.user_metadata?.last_name || '',
                        company_name: null,
                        phone: null,
                        customer_type: 'standard' as const,
                        discount_percentage: 0,
                        account_status: 'active' as const,
                        language: 'de',
                        currency: 'EUR',
                        newsletter_subscription: false,
                        marketing_emails: false,
                        country: 'Deutschland'
                      };

                      const { data: newProfile } = await supabase
                        .from('profiles')
                        .insert([basicProfile])
                        .select()
                        .single();

                      if (newProfile) {
                        setUser({
                          id: session.user.id,
                          email: session.user.email!,
                          profile: newProfile
                        });
                      }
                    } catch (createProfileError) {
                      console.warn('Failed to create profile:', createProfileError);
                    }
                  }
                } catch (profileError) {
                  console.error('Error loading profile:', profileError);
                  setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    profile: undefined
                  });
                }
              } else {
                setUser(null);
              }

              if (!initialized) {
                setLoading(false);
                setInitialized(true);
              }
            } catch (error) {
              console.error('Error handling auth state change:', error);
              if (!initialized) {
                setLoading(false);
                setInitialized(true);
              }
            }
          }
        );

        authSubscription = subscription;

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        }

        // The onAuthStateChange will handle the session, so we don't need to duplicate logic here
        if (!session && mounted) {
          setLoading(false);
          setInitialized(true);
        }

      } catch (error) {
        console.error('Error setting up auth:', error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    setupAuth();

    return () => {
      mounted = false;
      if (authSubscription?.unsubscribe) {
        try {
          authSubscription.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing:', error);
        }
      }
    };
  }, [loadProfile]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    initialized,
    isAuthenticated: !!user && !!session,
    accessToken,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
    getApiHeaders,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}