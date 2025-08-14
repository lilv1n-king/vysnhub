'use client';

import { useEffect, useState } from 'react';

interface DashboardStats {
  total_users: number;
  pending_users: number;
  approved_users: number;
  rejected_users: number;
  suspended_users: number;
  total_reg_codes: number;
  active_reg_codes: number;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    // Check authentication
    const authToken = localStorage.getItem('auth_token');
    const userRole = localStorage.getItem('user_role');
    const sessionAuth = sessionStorage.getItem('isAuthenticated');
    
    if (authToken && userRole === 'admin' && sessionAuth === 'true') {
      setIsAuthenticated(true);
      loadDashboardStats();
    }
    setLoading(false);
  }, []);

  const loadDashboardStats = async () => {
    setStatsLoading(true);
    try {
      const authToken = localStorage.getItem('auth_token');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      
      const response = await fetch(`${backendUrl}/api/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load dashboard stats');
      }

      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      } else {
        console.error('Dashboard stats error:', result.message);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-center text-red-600 mb-4">
            Zugang verweigert
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Sie müssen sich anmelden, um auf das Admin-Dashboard zuzugreifen.
          </p>
          <div className="text-center">
            <a 
              href="/login" 
              className="inline-block bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
            >
              Zum Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-black text-white rounded flex items-center justify-center font-bold">
                A
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">VYSN Hub Admin</h1>
            </div>
            <button
              onClick={async () => {
                // Import supabase dynamically to avoid SSR issues
                const { supabase } = await import('@/lib/utils/supabase');
                
                // Sign out from Supabase
                await supabase.auth.signOut();
                
                // Clear local storage
                sessionStorage.removeItem('isAuthenticated');
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_role');
                localStorage.removeItem('refresh_token');
                
                window.location.href = '/login';
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Admin-Bereich für VYSN Hub</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gesamt Benutzer</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statsLoading ? '...' : (stats?.total_users || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <div className="w-6 h-6 bg-yellow-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Wartend</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statsLoading ? '...' : (stats?.pending_users || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="w-6 h-6 bg-green-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Genehmigt</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statsLoading ? '...' : (stats?.approved_users || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <div className="w-6 h-6 bg-purple-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reg-Codes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statsLoading ? '...' : (stats?.total_reg_codes || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Benutzer-Verwaltung</h3>
            <p className="text-gray-600 text-sm mb-4">Accounts genehmigen und Rabatte verwalten</p>
            <a 
              href="/admin/users"
              className="block w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-center"
            >
              Benutzer verwalten
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Home-Content</h3>
            <p className="text-gray-600 text-sm mb-4">Startseiten-Highlights bearbeiten</p>
            <a 
              href="/admin/home-content"
              className="block w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-center"
            >
              Content bearbeiten
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Einstellungen</h3>
            <p className="text-gray-600 text-sm mb-4">System-Konfiguration</p>
            <a 
              href="/admin/settings"
              className="block w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors text-center"
            >
              Einstellungen
            </a>
          </div>
        </div>

        {/* Success Message */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Admin-Dashboard erfolgreich geladen!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Sie sind erfolgreich als Administrator angemeldet.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}