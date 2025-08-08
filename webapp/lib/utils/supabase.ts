import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ⚠️ SICHERHEITSVALIDIERUNG: Prüfe Umgebungsvariablen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
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

// Erstelle sicheren Supabase-Client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
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