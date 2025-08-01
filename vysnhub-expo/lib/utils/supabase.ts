import { createClient } from '@supabase/supabase-js';
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

// Nur Supabase-Client erstellen wenn gültige URL vorhanden
let supabase: any = null;

try {
  // Prüfe ob URL gültig ist
  if (supabaseUrl && supabaseUrl !== 'https://your-project.supabase.co' && supabaseUrl.startsWith('https://')) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.warn('Supabase URL not configured properly. Using mock data.');
    // Mock-Client für Development
    supabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: [], error: null }),
            single: () => Promise.resolve({ data: null, error: { message: 'No data - using mock' } }),
            limit: () => Promise.resolve({ data: [], error: null })
          }),
          or: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: [], error: null }),
              limit: () => Promise.resolve({ data: [], error: null })
            })
          }),
          not: () => ({
            eq: () => Promise.resolve({ data: [], error: null })
          }),
          order: () => Promise.resolve({ data: [], error: null }),
          range: () => Promise.resolve({ data: [], error: null, count: 0 }),
          limit: () => Promise.resolve({ data: [], error: null }),
          single: () => Promise.resolve({ data: null, error: { message: 'No data - using mock' } })
        })
      })
    };
  }
} catch (error) {
  console.error('Failed to create Supabase client:', error);
}

export { supabase };