import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthUser, Profile, SignUpData, SignInData } from '../types/auth';
import { apiService } from '../services/apiService';
import { API_ENDPOINTS } from '../config/api';


interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;

  signUp: (data: SignUpData) => Promise<{ error: Error | null }>;
  signIn: (data: SignInData) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  getApiHeaders: () => Record<string, string>;
  needsConsent: () => boolean;

  
  // Registration with Code
  registerWithCode: (data: {
    registrationCode: string;
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
  }) => Promise<boolean>;
  
  // Email Verification
  verifyEmailCode: (code: string, email: string) => Promise<boolean>;
  resendVerificationEmail: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType | null {
  const context = useContext(AuthContext);
  if (context === undefined) {
    if (__DEV__) console.error('useAuth must be used within an AuthProvider');
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
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(null);


  // Load profile from backend API
  const loadProfile = useCallback(async (): Promise<Profile | null> => {
    try {
      const response = await apiService.get<Profile>(API_ENDPOINTS.AUTH_PROFILE);
      if (__DEV__) {
        console.log('🔄 loadProfile: Raw response:', response);
        console.log('🔍 loadProfile: analytics_consent in response.data:', response.data?.analytics_consent);
        console.log('🔍 loadProfile: marketing_consent in response.data:', response.data?.marketing_consent);
      }
      
      if (response.success && response.data) {
        if (__DEV__) console.log('🔄 loadProfile: Returning profile data:', response.data);
        
        // Ensure the consent fields are properly mapped
        const profileData = {
          ...response.data,
          analytics_consent: response.data.analytics_consent,
          marketing_consent: response.data.marketing_consent
        };
        
        if (__DEV__) console.log('🔍 loadProfile: Final profile with consent fields:', {
          analytics_consent: profileData.analytics_consent,
          marketing_consent: profileData.marketing_consent
        });
        
        return profileData;
      }
      
      if (__DEV__) console.error('🔄 loadProfile: No data in response');
      return null;
    } catch (error) {
      if (__DEV__) console.error('Error loading profile:', error);
      return null;
    }
  }, []);


  // Sign up new user via backend API
  const signUp = useCallback(async (userData: SignUpData) => {
    try {
      setLoading(true);
      
      const response = await apiService.post('/api/auth/register', userData);
      
      if (!response.success) {
        return { error: new Error(response.error || 'Registration failed') };
      }

      // Auto-login after successful registration
      const loginResult = await signIn({ email: userData.email, password: userData.password });
      return loginResult;
    } catch (error) {
      if (__DEV__) console.error('Sign up exception:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in existing user via backend API
  const signIn = useCallback(async (userData: SignInData) => {
    try {
      setLoading(true);
      
      const response = await apiService.post('/api/auth/login', userData);
      
      if (!response.success) {
        return { error: new Error(response.error || 'Login failed') };
      }

      // Set tokens for API service
      const token = response.data?.token || null;
      const refreshTokenFromResponse = response.data?.refreshToken || null;
      const expiresAt = response.data?.expiresAt || null;
      
      setAccessToken(token);
      setRefreshToken(refreshTokenFromResponse);
      setTokenExpiresAt(expiresAt);
      apiService.setAuthToken(token);
      
      // Store tokens for persistence
      if (token && refreshTokenFromResponse) {
        await apiService.storeToken(token);
        await apiService.storeRefreshToken(refreshTokenFromResponse);
        if (expiresAt) {
          await apiService.storeTokenExpiry(expiresAt);
        }
      }

      // Load user profile
      const profile = await loadProfile();
      
      if (response.data?.user) {
        setUser({
          id: response.data.user.id,
          email: response.data.user.email,
          profile: profile || undefined
        });
      }

      return { error: null };
    } catch (error) {
      if (__DEV__) console.error('Sign in exception:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  }, [loadProfile]);

  // Sign out user
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      
      // Call backend logout endpoint (optional)
      try {
        await apiService.post('/api/auth/logout', {});
      } catch (error) {
        if (__DEV__) console.warn('Logout API call failed:', error);
      }
      
      // Always clear local state
      setUser(null);
      setAccessToken(null);
      apiService.setAuthToken(null);
      await apiService.clearStoredToken();

      return { error: null };
    } catch (error) {
      if (__DEV__) console.error('Sign out exception:', error);
      // Still clear local state
      setUser(null);
      setAccessToken(null);
      apiService.setAuthToken(null);
      await apiService.clearStoredToken();
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset password via backend API
  const resetPassword = useCallback(async (email: string) => {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH_RESET_PASSWORD, { email });
      
      if (!response.success) {
        return { error: new Error(response.error || 'Password reset failed') };
      }
      
      return { error: null };
    } catch (error) {
      if (__DEV__) console.error('Reset password exception:', error);
      return { error: error as Error };
    }
  }, []);

  // Update user profile via backend API
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    try {
      if (!user) {
        return { error: new Error('No user logged in') };
      }

      if (__DEV__) console.log('🔄 updateProfile: Sending updates:', updates);
      const response = await apiService.put(API_ENDPOINTS.AUTH_PROFILE, updates);
      if (__DEV__) console.log('🔄 updateProfile: Response:', response);
      
      if (!response.success) {
        return { error: new Error(response.error || 'Profile update failed') };
      }

      // Force a fresh profile load since backend now returns complete updated profile
      if (__DEV__) console.log('🔄 updateProfile: Loading fresh profile from backend...');
      const freshProfile = await loadProfile();
      if (freshProfile) {
        if (__DEV__) {
          console.log('🔄 updateProfile: Fresh profile loaded:', freshProfile);
          console.log('🔄 updateProfile: Setting user with fresh profile...');
        }
        setUser(currentUser => {
          const updatedUser = {
            ...currentUser,
            profile: freshProfile
          };
          if (__DEV__) console.log('🔄 updateProfile: Updated user state:', updatedUser);
          return updatedUser;
        });
      } else {
        if (__DEV__) console.error('🔄 updateProfile: Failed to load fresh profile - falling back to response data');
        // Fallback: use the response data
        if (response.data) {
          setUser(currentUser => ({
            ...currentUser,
            profile: {
              ...currentUser.profile,
              ...response.data,
              ...updates // Ensure our updates are applied
            }
          }));
        }
      }

      return { error: null };
    } catch (error) {
      if (__DEV__) console.error('Update profile exception:', error);
      return { error: error as Error };
    }
  }, [user]);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (!user) return;

    try {
      const profile = await loadProfile();
      if (profile) {
        setUser({
          ...user,
          profile
        });
      }
    } catch (error) {
      if (__DEV__) console.error('Failed to refresh profile:', error);
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

  // Handle token refresh callback
  const handleTokenRefresh = useCallback((newToken: string) => {
    if (__DEV__) console.log('🔄 AuthContext: Token refreshed, updating state...');
    setAccessToken(newToken);
  }, []);

  // Register the token refresh callback with apiService
  useEffect(() => {
    apiService.setTokenRefreshCallback(handleTokenRefresh);
    if (__DEV__) console.log('✅ Token refresh callback registered with apiService');
  }, [handleTokenRefresh]);

  // Initialize auth state by checking existing token
  useEffect(() => {
    let mounted = true;

    // Register token refresh callback
    apiService.setTokenRefreshCallback(handleTokenRefresh);

    const initializeAuth = async () => {
      try {
        // Check if we have a stored token (from AsyncStorage or similar)
        const storedToken = await apiService.getStoredToken();
        
        if (storedToken) {
          if (__DEV__) console.log('🔑 Found stored token, attempting to restore session...');
          
          // First check if we have a refresh token - if not, try direct validation
          const refreshToken = await apiService.getStoredRefreshToken();
          
          if (!refreshToken) {
            if (__DEV__) console.log('❌ No refresh token found, clearing session');
            await apiService.clearStoredToken();
            return;
          }
          
          // Try refresh token first (safer approach)
          try {
            if (__DEV__) console.log('🔄 Using refresh token to get new access token...');
            const refreshSuccess = await apiService.refreshAccessToken();
            
            if (refreshSuccess) {
              // Get the new token after refresh
              const newToken = await apiService.getStoredToken();
              if (newToken) {
                setAccessToken(newToken);
                
                // Validate the new token
                const response = await apiService.get(API_ENDPOINTS.AUTH_VALIDATE);
                
                if (response.success && response.data?.user) {
                  const profile = await loadProfile();
                  setUser({
                    id: response.data.user.id,
                    email: response.data.user.email,
                    profile: profile || undefined
                  });
                  
                  if (__DEV__) console.log('✅ Session restored with refresh token');
                  return; // Success
                }
              }
            }
            
            if (__DEV__) console.log('❌ Refresh token failed or invalid - clearing session');
            await apiService.clearStoredToken();
            setUser(null);
            setAccessToken(null);
            
          } catch (refreshError) {
            if (__DEV__) console.warn('❌ Refresh token error:', refreshError);
            
            // Clear everything on refresh error
            await apiService.clearStoredToken();
            setUser(null);
            setAccessToken(null);
          }
        }
      } catch (error) {
        if (__DEV__) console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [loadProfile, handleTokenRefresh]);

  // Registration with Code
  const registerWithCode = useCallback(async (data: {
    registrationCode: string;
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
  }): Promise<boolean> => {
    try {
      if (__DEV__) console.log('🔄 Registering with code:', data.registrationCode);
      
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/registration/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      if (__DEV__) console.log('✅ Registration with code successful');
      return true;
    } catch (error) {
      if (__DEV__) console.error('❌ Registration error:', error);
      throw error;
    }
  }, []);

  // Email Verification with Code
  const verifyEmailCode = useCallback(async (code: string, email: string): Promise<boolean> => {
    try {
      if (__DEV__) console.log('🔄 Verifying email code:', code, 'for email:', email);
      
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/registration/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Verification failed');
      }

      const result = await response.json();
      if (__DEV__) console.log('✅ Email verification successful');
      return result.success;
    } catch (error) {
      if (__DEV__) console.error('❌ Email verification error:', error);
      throw error;
    }
  }, []);

  // Resend Verification Email
  const resendVerificationEmail = useCallback(async (email: string): Promise<boolean> => {
    try {
      if (__DEV__) console.log('🔄 Resending verification email to:', email);
      
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/registration/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Resend failed');
      }

      if (__DEV__) console.log('✅ Verification email resent successfully');
      return true;
    } catch (error) {
      if (__DEV__) console.error('❌ Resend verification error:', error);
      throw error;
    }
  }, []);

  // Check if user needs to provide consent
  const needsConsent = useCallback((): boolean => {
    if (!user?.profile) {
      return false;
    }
    
    // Simple check: if analytics_consent is not explicitly set to true, need consent
    return user.profile.analytics_consent !== true;
  }, [user]);

  const value: AuthContextType = {
    user,
    loading,
    initialized,
    isAuthenticated: !!user && !!accessToken,
    accessToken,

    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
    getApiHeaders,
    needsConsent,

    registerWithCode,
    verifyEmailCode,
    resendVerificationEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}