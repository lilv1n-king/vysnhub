import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ⚠️ SICHERHEITSVALIDIERUNG: Prüfe Umgebungsvariablen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    // During build time, return a mock client to allow builds without env vars
    if (typeof window === 'undefined') {
      console.warn('Supabase environment variables not found during build. Using mock client.');
      return {} as SupabaseClient;
    }
    throw new Error(
      'SICHERHEITSFEHLER: Supabase-Umgebungsvariablen nicht gefunden! ' +
      'Bitte .env.local mit NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY konfigurieren.'
    );
  }

  // Validiere URL-Format
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    throw new Error('SICHERHEITSFEHLER: Ungültiges Supabase URL-Format!');
  }

  // Validiere Key-Format (JWT hat 3 Teile getrennt durch Punkte)
  if (supabaseAnonKey.split('.').length !== 3) {
    throw new Error('SICHERHEITSFEHLER: Ungültiges Supabase Key-Format!');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false // Verhindert XSS über URL-Parameter
    },
    global: {
      headers: {
        'X-Client-Info': 'vysnhub-webapp',
        'X-Client-Version': '1.0.0'
      }
    }
  });
}

// Erstelle sicheren Supabase-Client
export const supabase: SupabaseClient = createSupabaseClient();