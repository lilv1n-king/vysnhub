import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  User, 
  CreateUserData, 
  UpdateUserData 
} from '../models/User';

export class AuthService {
  private supabase: SupabaseClient;
  private supabaseAdmin: SupabaseClient;

  constructor() {
    // 🔒 SICHERHEITS-UPDATE: Sichere Environment Variable Verwaltung
    const { envConfig } = require('../config/env');
    
    // Regular client for auth operations
    this.supabase = createClient(envConfig.supabaseUrl, envConfig.supabaseKey);
    
    // Admin client for service operations (profiles, admin APIs)
    this.supabaseAdmin = createClient(envConfig.supabaseUrl, envConfig.supabaseServiceRole);
  }

  // Getter for admin client (bypasses RLS)
  getAdminClient(): SupabaseClient {
    return this.supabaseAdmin;
  }

  // Login mit Email und Password
  async login(email: string, password: string): Promise<{ 
    user: User; 
    token: string; 
    refreshToken: string;
    expiresAt: number;
  }> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user || !data.session) {
        throw new Error(error?.message || 'Invalid credentials');
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        first_name: data.user.user_metadata?.first_name || '',
        last_name: data.user.user_metadata?.last_name || '',
        company_name: data.user.user_metadata?.company_name,
        phone: data.user.user_metadata?.phone,
        customer_type: 'standard',
        discount_percentage: 0,
        account_status: 'active',
        language: 'de',
        currency: 'EUR',
        newsletter_subscription: false,
        marketing_emails: false,
        created_at: data.user.created_at,
        updated_at: data.user.updated_at || data.user.created_at
      };

      console.log(`🔐 Login successful for ${email}`);
      console.log(`⏰ Token expires at: ${new Date(data.session.expires_at! * 1000).toLocaleString()}`);

      return {
        user,
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at!
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  }

  // Registrierung - Backend erstellt nur User für Admin-Zwecke
  async register(userData: CreateUserData): Promise<User> {
    try {
      // User in Supabase Auth erstellen
      const { data: authData, error: authError } = await this.supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          company_name: userData.company_name,
          phone: userData.phone,
          address_line_1: userData.address_line_1,
          address_line_2: userData.address_line_2,
          city: userData.city,
          postal_code: userData.postal_code,
          country: userData.country,
          vat_number: userData.vat_number
        },
        email_confirm: true // Auto-confirm für API
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Failed to create user');
      }

      const user: User = {
        id: authData.user.id,
        email: authData.user.email!,
        first_name: userData.first_name,
        last_name: userData.last_name,
        company_name: userData.company_name,
        phone: userData.phone,
        address_line_1: userData.address_line_1,
        address_line_2: userData.address_line_2,
        city: userData.city,
        postal_code: userData.postal_code,
        country: userData.country,
        vat_number: userData.vat_number,
        customer_type: 'standard',
        discount_percentage: 0,
        account_status: 'active',
        language: 'de',
        currency: 'EUR',
        newsletter_subscription: false,
        marketing_emails: false,
        created_at: authData.user.created_at,
        updated_at: authData.user.updated_at || authData.user.created_at
      };

      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    }
  }

  // Token validieren - für Backend Auth Middleware
  async validateToken(token: string): Promise<User> {
    try {
      // Token mit Supabase validieren
      const { data: { user }, error } = await this.supabase.auth.getUser(token);

      if (error || !user) {
        throw new Error('Invalid or expired token');
      }

      return {
        id: user.id,
        email: user.email!,
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        company_name: user.user_metadata?.company_name,
        phone: user.user_metadata?.phone,
        customer_type: 'standard',
        discount_percentage: 0,
        account_status: 'active',
        language: 'de',
        currency: 'EUR',
        newsletter_subscription: false,
        marketing_emails: false,
        created_at: user.created_at,
        updated_at: user.updated_at || user.created_at
      };
    } catch (error) {
      console.error('Token validation error:', error);
      throw new Error(error instanceof Error ? error.message : 'Token validation failed');
    }
  }

  // Token mit Refresh Token erneuern
  async refreshToken(refreshToken: string): Promise<{
    user: User;
    token: string;
    refreshToken: string;
    expiresAt: number;
  }> {
    try {
      console.log('🔄 Refreshing access token...');
      
      const { data, error } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error || !data.session || !data.user) {
        throw new Error(error?.message || 'Failed to refresh token');
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        first_name: data.user.user_metadata?.first_name || '',
        last_name: data.user.user_metadata?.last_name || '',
        company_name: data.user.user_metadata?.company_name,
        phone: data.user.user_metadata?.phone,
        customer_type: 'standard',
        discount_percentage: 0,
        account_status: 'active',
        language: 'de',
        currency: 'EUR',
        newsletter_subscription: false,
        marketing_emails: false,
        created_at: data.user.created_at,
        updated_at: data.user.updated_at || data.user.created_at
      };

      console.log(`✅ Token refreshed successfully for ${user.email}`);
      console.log(`⏰ New token expires at: ${new Date(data.session.expires_at! * 1000).toLocaleString()}`);

      return {
        user,
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at!
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new Error(error instanceof Error ? error.message : 'Token refresh failed');
    }
  }

  // User Profile abrufen aus profiles Tabelle (mit Auto-Create wenn fehlt)  
  async getUserProfile(userId: string): Promise<User> {
    try {
      console.log('🔍 Searching for profile with User ID:', userId);
      
      // Erst versuchen, Profil aus profiles Tabelle zu laden (mit Admin-Client)
      const { data: profileData, error: profileError } = await this.supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      console.log('📋 Profile query result:', { profileData, profileError });

      if (profileError && profileError.code === 'PGRST116') {
        // Debug: Show all existing profile IDs
        const { data: allProfiles } = await this.supabaseAdmin
          .from('profiles')
          .select('id, email')
          .limit(10);
        
        console.log('📊 Existing profiles in DB:');
        allProfiles?.forEach(profile => {
          console.log(`  - ID: ${profile.id}, Email: ${profile.email}`);
        });
        console.log('🔄 Profile not found for User ID:', userId);
        
        // Profil nicht gefunden - erstelle es aus Auth-Daten
        const { data: authData, error: authError } = await this.supabaseAdmin.auth.admin.getUserById(userId);
        
        if (authError || !authData.user) {
          throw new Error('User not found in auth system');
        }
        
        const user = authData.user;
        const newProfile = {
          id: user.id,
          email: user.email!,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          company_name: user.user_metadata?.company_name || null,
          phone: user.user_metadata?.phone || null,
          customer_type: 'standard' as const,
          discount_percentage: 0,
          account_status: 'active' as const,
          language: 'de',
          currency: 'EUR',
          newsletter_subscription: false,
          marketing_emails: false,
          country: 'Deutschland',
          created_at: user.created_at,
          updated_at: user.updated_at || user.created_at
        };

        // Profil in DB erstellen
        const { data: createdProfile, error: createError } = await this.supabaseAdmin
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
          console.error('❌ Failed to create profile:', createError);
          throw new Error('Failed to create user profile');
        }

        console.log('✅ Profile created successfully');
        return {
          id: createdProfile.id,
          email: createdProfile.email,
          first_name: createdProfile.first_name || '',
          last_name: createdProfile.last_name || '',
          company_name: createdProfile.company_name,
          phone: createdProfile.phone,
          address_line_1: createdProfile.address_line_1,
          address_line_2: createdProfile.address_line_2,
          city: createdProfile.city,
          postal_code: createdProfile.postal_code,
          country: createdProfile.country,
          vat_number: createdProfile.vat_number,
          customer_number: createdProfile.customer_number,
          customer_type: createdProfile.customer_type,
          discount_percentage: createdProfile.discount_percentage || 0,
          discount_reason: createdProfile.discount_reason,
          discount_valid_until: createdProfile.discount_valid_until,
          account_status: createdProfile.account_status,
          verified_at: createdProfile.verified_at,
          language: createdProfile.language,
          currency: createdProfile.currency,
          newsletter_subscription: createdProfile.newsletter_subscription,
          marketing_emails: createdProfile.marketing_emails,
          analytics_consent: createdProfile.analytics_consent,
          marketing_consent: createdProfile.marketing_consent,
          created_at: createdProfile.created_at,
          updated_at: createdProfile.updated_at,
          last_login_at: createdProfile.last_login_at
        };
      } else if (profileError) {
        console.error('Profile query error:', profileError);
        throw new Error('Database error while fetching profile');
      }

      if (!profileData) {
        throw new Error('User profile not found');
      }

      // Return vollständige Profile-Daten
      return {
        id: profileData.id,
        email: profileData.email,
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        company_name: profileData.company_name,
        phone: profileData.phone,
        address_line_1: profileData.address_line_1,
        address_line_2: profileData.address_line_2,
        city: profileData.city,
        postal_code: profileData.postal_code,
        country: profileData.country,
        vat_number: profileData.vat_number,
        customer_number: profileData.customer_number,
        customer_type: profileData.customer_type,
        discount_percentage: profileData.discount_percentage || 0,
        discount_reason: profileData.discount_reason,
        discount_valid_until: profileData.discount_valid_until,
        account_status: profileData.account_status,
        verified_at: profileData.verified_at,
        language: profileData.language,
        currency: profileData.currency,
        newsletter_subscription: profileData.newsletter_subscription,
        marketing_emails: profileData.marketing_emails,
        analytics_consent: profileData.analytics_consent,
        marketing_consent: profileData.marketing_consent,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at,
        last_login_at: profileData.last_login_at
      };
    } catch (error) {
      console.error('Get user profile error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get user profile');
    }
  }

  // User Profile aktualisieren
  async updateUserProfile(userId: string, updateData: UpdateUserData): Promise<User> {
    try {
      console.log('🔄 updateUserProfile: Updating user ID:', userId, 'with data:', updateData);
      
      // Update both user_metadata AND profiles table
      const { data: userData, error: authError } = await this.supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...updateData
        }
      });

      if (authError || !userData.user) {
        console.error('❌ Auth update failed:', authError);
        throw new Error('Failed to update user auth metadata');
      }

      console.log('✅ Auth metadata updated successfully');

      // Also update the profiles table (this is where getUserProfile reads from!)
      const { data: profileData, error: profileError } = await this.supabaseAdmin
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (profileError) {
        console.error('❌ Profile table update failed:', profileError);
        throw new Error('Failed to update profile table');
      }

      console.log('✅ Profile table updated successfully:', profileData);

      // Return the actual updated profile from the database
      return await this.getUserProfile(userId);
    } catch (error) {
      console.error('Update user profile error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update user profile');
    }
  }

  // Password Reset
  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await this.supabaseAdmin.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to send password reset email');
    }
  }

  // Token von Header extrahieren und validieren
  async verifyAuthHeader(authHeader: string | undefined): Promise<User> {
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    
    if (!token) {
      throw new Error('Token not found in authorization header');
    }

    return await this.validateToken(token);
  }

  // Benutzer-Consent aktualisieren
  async updateUserConsent(userId: string, consent: { marketing_consent?: boolean }): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('profiles')
        .update({
          marketing_consent: consent.marketing_consent,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw new Error(error.message);
      }

      console.log(`✅ Updated marketing consent for user ${userId}: ${consent.marketing_consent}`);
    } catch (error) {
      console.error('Error updating user consent:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update user consent');
    }
  }
}