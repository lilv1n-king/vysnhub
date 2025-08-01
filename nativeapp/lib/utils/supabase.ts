import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Für Development/Testing - später durch echte Credentials ersetzen
const SUPABASE_URL = 'https://cajkiixyxznfuieeuqqh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhamtpaXh5eHpuZnVpZWV1cXFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzY1MDYsImV4cCI6MjA2OTA1MjUwNn0.TKGaRkHYfWBb_TK0abr_CyfRPQgaUejm7foMrxbdMdM';

// Versuche Umgebungsvariablen zu laden, fallback auf Development-Werte
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 
                   process.env.EXPO_PUBLIC_SUPABASE_URL || 
                   SUPABASE_URL;

const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 
                        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
                        SUPABASE_ANON_KEY;

// Error boundary für Supabase-Operationen
class SupabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'SupabaseError';
  }
}

// Sichere Supabase-Client Erstellung mit Error Handling
let supabase: SupabaseClient | null = null;
let isSupabaseAvailable = false;

try {
  // Validate URL format
  if (supabaseUrl && supabaseUrl !== 'https://your-project.supabase.co' && supabaseUrl.startsWith('https://')) {
    // Validate Supabase URL format
    const urlPattern = /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/;
    if (!urlPattern.test(supabaseUrl)) {
      throw new SupabaseError('Invalid Supabase URL format');
    }

    // Validate anon key format (should be a JWT)
    if (!supabaseAnonKey || supabaseAnonKey.split('.').length !== 3) {
      throw new SupabaseError('Invalid Supabase anon key format');
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          'X-Client-Info': 'vysnhub-expo',
        },
      },
    });

    isSupabaseAvailable = true;
  } else {
    isSupabaseAvailable = false;
  }
} catch (error) {
  console.error('Failed to create Supabase client:', error);
  isSupabaseAvailable = false;
  supabase = null;
}

// Safe wrapper für Supabase-Operationen
export function withSupabaseErrorHandling<T>(
  operation: () => Promise<T>,
  fallbackValue: T,
  operationName: string = 'Supabase operation'
): Promise<T> {
  if (!isSupabaseAvailable || !supabase) {
    return Promise.resolve(fallbackValue);
  }

  return operation().catch((error) => {
    throw new SupabaseError(`${operationName} failed`, error);
  });
}

// Health check für Supabase-Verbindung
export async function checkSupabaseHealth(): Promise<boolean> {
  if (!isSupabaseAvailable || !supabase) {
    return false;
  }

  try {
    // Simple health check - try to get session
    await supabase.auth.getSession();
    return true;
  } catch (error) {
    return false;
  }
}

export { supabase, isSupabaseAvailable, SupabaseError };