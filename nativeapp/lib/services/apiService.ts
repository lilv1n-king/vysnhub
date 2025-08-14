import { API_BASE_URL, ApiResponse, ApiError, API_CONFIG } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class ApiService {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  
  // Track consecutive 401 errors to prevent infinite loops
  private consecutive401Errors = 0;
  private readonly MAX_401_RETRIES = 2;
  
  // Track refresh operation to prevent concurrent refreshes
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'X-Client-Info': 'vysnhub-expo',
    };
  }

  // Set authorization token
  setAuthToken(token: string | null) {
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  // Get current auth token
  getAuthToken(): string | null {
    const authHeader = this.defaultHeaders['Authorization'];
    return authHeader ? authHeader.replace('Bearer ', '') : null;
  }

  // Get base URL
  getBaseURL(): string {
    return this.baseURL;
  }

  // Retry logic
  private async withRetry<T>(
    operation: () => Promise<T>,
    retries: number = API_CONFIG.RETRY_ATTEMPTS
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0 && this.shouldRetry(error)) {
        await this.delay(API_CONFIG.RETRY_DELAY);
        return this.withRetry(operation, retries - 1);
      }
      throw error;
    }
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors or 5xx server errors
    return (
      error.name === 'TypeError' || // Network error
      (error.status >= 500 && error.status < 600) ||
      error.message?.includes('Network request failed')
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generic request method with automatic token refresh
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // Check if token needs refresh before making request (unless it's a refresh call)
    if (!isRetry && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
      const shouldRefresh = await this.shouldRefreshToken();
      if (shouldRefresh) {
        console.log('⏰ Token expiring soon, refreshing...');
        const refreshSuccess = await this.refreshAccessToken();
        if (!refreshSuccess) {
          console.log('❌ Auto-refresh failed, request might fail');
        }
      }
    }

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    // Debug logging
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    console.log(`📋 Headers:`, requestOptions.headers);
    if (options.body) {
      console.log(`📦 Body:`, options.body);
    }

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    requestOptions.signal = controller.signal;

    try {
      const response = await this.withRetry(async () => {
        const res = await fetch(url, requestOptions);
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error(`❌ API Error: ${res.status} ${res.statusText}`);
          console.error(`❌ Error Data:`, errorData);
          
          throw new ApiError(
            errorData.message || `HTTP ${res.status}: ${res.statusText}`,
            res.status,
            errorData
          );
        }
        
        console.log(`✅ API Success: ${res.status} ${res.statusText}`);
        return res;
      });

      const data = await response.json();
      
      // Reset 401 counter on successful response
      this.consecutive401Errors = 0;
      
      return data as ApiResponse<T>;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }
      
      if (error instanceof ApiError) {
        // Handle 401 errors with token refresh
        if (error.status === 401 && !isRetry && !endpoint.includes('/auth/refresh')) {
          this.consecutive401Errors++;
          
          if (this.consecutive401Errors <= this.MAX_401_RETRIES) {
            console.log(`🔄 401 error (#${this.consecutive401Errors}), attempting token refresh...`);
            const refreshSuccess = await this.refreshAccessToken();
            if (refreshSuccess) {
              console.log('✅ Token refreshed, retrying request...');
              // Retry the request with the new token
              return this.request<T>(endpoint, options, true);
            } else {
              console.warn(`❌ Token refresh failed. Clearing tokens and stopping retries.`);
              await this.clearStoredToken();
              this.consecutive401Errors = 0;
              // Don't retry if refresh failed
              throw new ApiError('Authentication failed - please login again', 401);
            }
          } else {
            console.warn(`❌ Too many consecutive 401 errors (${this.consecutive401Errors}). Clearing tokens.`);
            await this.clearStoredToken();
            // Reset counter after clearing tokens
            this.consecutive401Errors = 0;
            throw new ApiError('Authentication failed - please login again', 401);
          }
        }
        throw error;
      }
      
      // Network or other errors
      throw new ApiError(
        (error as Error)?.message || 'Network request failed',
        0,
        error
      );
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }

    return this.request<T>(url, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Token storage methods
  async storeToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }

  async storeRefreshToken(refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.setItem('refresh_token', refreshToken);
    } catch (error) {
      console.error('Failed to store refresh token:', error);
    }
  }

  async storeTokenExpiry(expiresAt: number): Promise<void> {
    try {
      await AsyncStorage.setItem('token_expires_at', expiresAt.toString());
    } catch (error) {
      console.error('Failed to store token expiry:', error);
    }
  }

  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Failed to get stored token:', error);
      return null;
    }
  }

  async getStoredRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('refresh_token');
    } catch (error) {
      console.error('Failed to get stored refresh token:', error);
      return null;
    }
  }

  async getStoredTokenExpiry(): Promise<number | null> {
    try {
      const expiry = await AsyncStorage.getItem('token_expires_at');
      return expiry ? parseInt(expiry, 10) : null;
    } catch (error) {
      console.error('Failed to get stored token expiry:', error);
      return null;
    }
  }

  async clearStoredToken(): Promise<void> {
    try {
      // Clear from memory
      this.setAuthToken(null);
      
      // Clear from storage
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'token_expires_at']);
      
      // Reset consecutive error counter and refresh promise
      this.consecutive401Errors = 0;
      this.refreshPromise = null;
      
      console.log('🧹 All tokens cleared successfully');
    } catch (error) {
      console.error('Failed to clear stored tokens:', error);
    }
  }

  // Token refresh callback for AuthContext synchronization
  private tokenRefreshCallback?: (newToken: string) => void;

  // Set token refresh callback
  setTokenRefreshCallback(callback: (newToken: string) => void) {
    this.tokenRefreshCallback = callback;
  }

  // Refresh access token using refresh token
  async refreshAccessToken(): Promise<boolean> {
    // If refresh is already in progress, wait for it
    if (this.refreshPromise) {
      console.log('🔄 Token refresh already in progress, waiting...');
      return await this.refreshPromise;
    }

    // Start new refresh operation
    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      // Clear the promise when done
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<boolean> {
    try {
      const refreshToken = await this.getStoredRefreshToken();
      if (!refreshToken) {
        console.log('❌ No refresh token available - clearing all tokens');
        await this.clearStoredToken();
        return false;
      }

      console.log('🔄 Refreshing access token...');
      
      // Use direct fetch to avoid recursive refresh calls
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          // Update tokens
          this.setAuthToken(data.data.token);
          await this.storeToken(data.data.token);
          await this.storeRefreshToken(data.data.refreshToken);
          await this.storeTokenExpiry(data.data.expiresAt);
          
          // Notify AuthContext about the new token
          if (this.tokenRefreshCallback) {
            this.tokenRefreshCallback(data.data.token);
          }
          
          console.log('✅ Access token refreshed successfully');
          return true;
        }
      }
      
      // If refresh failed, clear all tokens
      console.log('❌ Token refresh failed - clearing all tokens');
      await this.clearStoredToken();
      return false;
      
    } catch (error) {
      console.error('❌ Error refreshing token:', error);
      
      // Always clear tokens on any refresh error
      console.log('🧹 Clearing all tokens due to refresh error');
      await this.clearStoredToken();
      return false;
    }
  }

  // Check if token needs refresh (5 minutes before expiry)
  async shouldRefreshToken(): Promise<boolean> {
    const expiresAt = await this.getStoredTokenExpiry();
    const accessToken = await this.getStoredToken();
    const refreshToken = await this.getStoredRefreshToken();
    
    // Need all tokens to refresh
    if (!expiresAt || !accessToken || !refreshToken) {
      console.log('🔍 Missing tokens for refresh check:', { 
        hasExpiresAt: !!expiresAt, 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken 
      });
      return false;
    }
    
    // Supabase expiresAt is in seconds (Unix timestamp)
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - now;
    
    console.log('⏰ Token expiry check:', {
      expiresAt: new Date(expiresAt * 1000).toISOString(),
      now: new Date(now * 1000).toISOString(),
      timeUntilExpiry: `${timeUntilExpiry}s`,
      shouldRefresh: timeUntilExpiry < 300
    });
    
    // Refresh if less than 5 minutes remaining
    return timeUntilExpiry < 300; // 5 minutes = 300 seconds
  }

  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const apiService = new ApiService();