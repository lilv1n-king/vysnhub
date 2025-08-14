'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save,
  X
} from 'lucide-react';
import Image from 'next/image';

interface HomeHighlight {
  id: string;
  title_de: string;
  title_en: string;
  description_de: string;
  description_en: string;
  badge_text_de?: string;
  badge_text_en?: string;
  badge_type?: string;
  button_text_de: string;
  button_text_en: string;
  image_url?: string;
  action_type: string;
  action_params?: any;
  product_id?: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface HighlightForm {
  title_de: string;
  title_en: string;
  description_de: string;
  description_en: string;
  badge_text_de: string;
  badge_text_en: string;
  badge_type: string;
  button_text_de: string;
  button_text_en: string;
  image_url: string;
  action_type: string;
  action_params: string;
}

const badgeTypes = [
  { value: 'new_release', label: 'New Release' },
  { value: 'new_product', label: 'New Product' },
  { value: 'featured', label: 'Featured' },
  { value: 'catalog', label: 'Catalog' },
  { value: 'event', label: 'Event' },
];

const actionTypes = [
  { value: 'product', label: 'Product' },
  { value: 'external_link', label: 'External Link' },
  { value: 'internal_link', label: 'Internal Link' },
  { value: 'download', label: 'Download' },
  { value: 'none', label: 'None' },
];

export default function HomeContentManagement() {
  const [highlights, setHighlights] = useState<HomeHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<HomeHighlight | null>(null);
  const [previewLang, setPreviewLang] = useState<'de' | 'en'>('de');

  const [form, setForm] = useState<HighlightForm>({
    title_de: '',
    title_en: '',
    description_de: '',
    description_en: '',
    badge_text_de: '',
    badge_text_en: '',
    badge_type: 'featured',
    button_text_de: 'Details anzeigen',
    button_text_en: 'View Details',
    image_url: '',
    action_type: 'none',
    action_params: '{}',
  });

  useEffect(() => {
    fetchHighlights();
  }, []);

  const fetchHighlights = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Authentication required - please login first');
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/home-content/admin/highlights`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: Failed to fetch highlights`;
        
        if (response.status === 401) {
          setError('Authentication failed - please login again');
        } else if (response.status === 403) {
          setError('Admin access required - you need administrator privileges');
        } else {
          setError(errorMessage);
        }
        return;
      }

      const result = await response.json();
      setHighlights(result.data || []);
    } catch (err) {
      console.error('Error fetching highlights:', err);
      setError(err instanceof Error ? err.message : 'Failed to load highlights');
    } finally {
      setLoading(false);
    }
  };

  const toggleHighlightStatus = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/home-content/admin/highlights/${id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle highlight status');
      }

      await fetchHighlights();
    } catch (err) {
      console.error('Error toggling highlight:', err);
      alert('Failed to toggle highlight status');
    }
  };

  const deleteHighlight = async (id: string) => {
    if (!confirm('Are you sure you want to delete this highlight?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/home-content/admin/highlights/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete highlight');
      }

      await fetchHighlights();
    } catch (err) {
      console.error('Error deleting highlight:', err);
      alert('Failed to delete highlight');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('auth_token');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const url = editingHighlight 
        ? `${backendUrl}/api/home-content/admin/highlights/${editingHighlight.id}`
        : `${backendUrl}/api/home-content/admin/highlights`;
      
      const method = editingHighlight ? 'PUT' : 'POST';

      // Parse action_params as JSON
      let parsedActionParams;
      try {
        parsedActionParams = JSON.parse(form.action_params);
      } catch {
        parsedActionParams = {};
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          action_params: parsedActionParams,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingHighlight ? 'update' : 'create'} highlight`);
      }

      await fetchHighlights();
      handleFormCancel();
    } catch (err) {
      console.error('Error saving highlight:', err);
      alert(`Failed to ${editingHighlight ? 'update' : 'create'} highlight`);
    }
  };

  const handleEdit = (highlight: HomeHighlight) => {
    setEditingHighlight(highlight);
    setForm({
      title_de: highlight.title_de,
      title_en: highlight.title_en,
      description_de: highlight.description_de,
      description_en: highlight.description_en,
      badge_text_de: highlight.badge_text_de || '',
      badge_text_en: highlight.badge_text_en || '',
      badge_type: highlight.badge_type || 'featured',
      button_text_de: highlight.button_text_de,
      button_text_en: highlight.button_text_en,
      image_url: highlight.image_url || '',
      action_type: highlight.action_type,
      action_params: JSON.stringify(highlight.action_params || {}, null, 2),
    });
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingHighlight(null);
    setForm({
      title_de: '',
      title_en: '',
      description_de: '',
      description_en: '',
      badge_text_de: '',
      badge_text_en: '',
      badge_type: 'featured',
      button_text_de: 'Details anzeigen',
      button_text_en: 'View Details',
      image_url: '',
      action_type: 'none',
      action_params: '{}',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
        {error.includes('Authentication') && (
          <div className="mt-3">
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Go to Login
            </button>
          </div>
        )}
        {error.includes('Admin access') && (
          <div className="mt-2">
            <p className="text-sm text-red-600">
              Contact an administrator to get admin privileges for your account.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Home Content Management</h1>
          <p className="text-gray-600 mt-2">Manage highlights displayed on the home screen</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Highlight
        </Button>
      </div>

      {/* Preview Language Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="font-medium">Preview Language:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setPreviewLang('de')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  previewLang === 'de' 
                    ? 'bg-white text-black shadow-sm' 
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Deutsch
              </button>
              <button
                onClick={() => setPreviewLang('en')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  previewLang === 'en' 
                    ? 'bg-white text-black shadow-sm' 
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Modal */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingHighlight ? 'Edit Highlight' : 'Add New Highlight'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title (German)
                  </label>
                  <Input
                    value={form.title_de}
                    onChange={(e) => setForm({ ...form, title_de: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title (English)
                  </label>
                  <Input
                    value={form.title_en}
                    onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (German)
                  </label>
                  <textarea
                    value={form.description_de}
                    onChange={(e) => setForm({ ...form, description_de: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (English)
                  </label>
                  <textarea
                    value={form.description_en}
                    onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Badge Type
                  </label>
                  <select
                    value={form.badge_type}
                    onChange={(e) => setForm({ ...form, badge_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {badgeTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action Type
                  </label>
                  <select
                    value={form.action_type}
                    onChange={(e) => setForm({ ...form, action_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {actionTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <Input
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action Parameters (JSON)
                </label>
                <textarea
                  value={form.action_params}
                  onChange={(e) => setForm({ ...form, action_params: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                  placeholder='{"url": "https://example.com"}'
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingHighlight ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={handleFormCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Highlights List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Highlights ({highlights.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {highlights.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No highlights found. Create your first highlight to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {highlights.map((highlight) => (
                <div key={highlight.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    {/* Drag Handle */}
                    <div className="flex-shrink-0 pt-2">
                      <div className="h-5 w-5 text-gray-400">⋮⋮</div>
                    </div>

                    {/* Image */}
                    <div className="flex-shrink-0">
                      {highlight.image_url ? (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden relative">
                          <Image
                            src={highlight.image_url}
                            alt="Highlight"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900">
                          {previewLang === 'de' ? highlight.title_de : highlight.title_en}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded border ${
                            highlight.is_active 
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {highlight.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-xs text-gray-500">
                            Order: {highlight.sort_order}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {previewLang === 'de' ? highlight.description_de : highlight.description_en}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Type: {highlight.badge_type}</span>
                        <span>Action: {highlight.action_type}</span>
                        <span>Updated: {new Date(highlight.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => toggleHighlightStatus(highlight.id)}
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                      >
                        {highlight.is_active ? '👁️‍🗨️' : '👁️'}
                      </Button>
                      <Button
                        onClick={() => handleEdit(highlight)}
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => deleteHighlight(highlight.id)}
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}