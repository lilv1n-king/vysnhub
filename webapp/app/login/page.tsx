'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/utils/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Supabase authentication
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data.user || !data.session) {
        throw new Error(authError?.message || 'Login fehlgeschlagen');
      }

      // Check admin status via backend API (bypasses RLS issues)
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        const adminCheckResponse = await fetch(`${backendUrl}/api/auth/check-admin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.session.access_token}`
          },
          body: JSON.stringify({
            user_id: data.user.id,
            email: data.user.email
          })
        });

        const adminCheckResult = await adminCheckResponse.json();
        console.log('Admin check result:', adminCheckResult);

        if (!adminCheckResponse.ok) {
          throw new Error(adminCheckResult.message || 'Admin-Status konnte nicht geprüft werden');
        }

        if (!adminCheckResult.is_admin) {
          throw new Error('Admin-Berechtigung erforderlich');
        }
      } catch (apiError) {
        console.error('Backend admin check failed, trying direct Supabase:', apiError);
        
        // Fallback: Direct Supabase check
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin, email, first_name, last_name')
          .eq('id', data.user.id)
          .single();

        console.log('Profile query result:', { profile, profileError, userId: data.user.id });

        if (profileError) {
          console.error('Profile check error:', profileError);
          throw new Error(`Profil-Fehler: ${profileError.message || 'Unbekannter Fehler'}`);
        }

        if (!profile?.is_admin) {
          throw new Error('Admin-Berechtigung erforderlich');
        }
      }

      // Store authentication
      sessionStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('auth_token', data.session.access_token);
      localStorage.setItem('user_role', 'admin');
      localStorage.setItem('refresh_token', data.session.refresh_token);
      
      // Redirect to admin dashboard
      router.push('/admin');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            VYSN Hub Login
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                E-Mail-Adresse
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="E-Mail-Adresse"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Anmelden...' : 'Anmelden'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}