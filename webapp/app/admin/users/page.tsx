'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Check, 
  X, 
  Edit3, 
  Search
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  phone?: string;
  email_verified: boolean;
  account_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  standard_discount: number;
  registration_code_used?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingDiscount, setEditingDiscount] = useState<string | null>(null);
  const [discountValue, setDiscountValue] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    company_name: '',
    phone: '',
    account_status: 'approved',
    standard_discount: 0,
    admin_notes: '',
    is_admin: false
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const authToken = localStorage.getItem('auth_token');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${backendUrl}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load users: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      } else {
        throw new Error(result.message || 'Failed to load users');
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
      
      // Fallback to mock data for development
      const mockUsers = [
      {
        id: 'user-1',
        email: 'john@example.com',
        first_name: 'John',
        last_name: 'Doe',
        company_name: 'ABC Elektro GmbH',
        phone: '+49 123 456789',
        email_verified: true,
        account_status: 'approved',
        standard_discount: 5.00,
        registration_code_used: '123456',
        admin_notes: null,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T15:30:00Z'
      },
      {
        id: 'user-2',
        email: 'maria@techfirma.de',
        first_name: 'Maria',
        last_name: 'Schmidt',
        company_name: 'TechFirma GmbH',
        phone: '+49 987 654321',
        email_verified: true,
        account_status: 'pending',
        standard_discount: 0.00,
        registration_code_used: '987654',
        admin_notes: null,
        created_at: '2024-01-18T14:00:00Z',
        updated_at: '2024-01-18T14:00:00Z'
      },
      {
        id: 'user-3',
        email: 'peter@elektro-peter.com',
        first_name: 'Peter',
        last_name: 'Müller',
        company_name: 'Elektro Peter',
        phone: '+49 555 123456',
        email_verified: false,
        account_status: 'pending',
        standard_discount: 0.00,
        registration_code_used: '555000',
        admin_notes: 'Needs email verification',
        created_at: '2024-01-20T09:00:00Z',
        updated_at: '2024-01-20T09:00:00Z'
      }
    ];
    
    setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter]);

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        return user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
               fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (user.company_name && user.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.account_status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const updateUserStatus = async (userId: string, status: string, notes?: string) => {
    try {
      const authToken = localStorage.getItem('auth_token');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${backendUrl}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_status: status,
          admin_notes: notes
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // Update local state
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, account_status: status as any, admin_notes: notes || user.admin_notes }
            : user
        ));
        alert(`User status updated to ${status}`);
      } else {
        throw new Error(result.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const updateUserDiscount = async (userId: string, discount: number) => {
    try {
      const authToken = localStorage.getItem('auth_token');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${backendUrl}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          standard_discount: discount
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user discount: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // Update local state
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, standard_discount: discount }
            : user
        ));
        setEditingDiscount(null);
        alert(`User discount updated to ${discount}%`);
      } else {
        throw new Error(result.message || 'Failed to update user discount');
      }
    } catch (error) {
      console.error('Error updating user discount:', error);
      alert('Failed to update user discount: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDiscountEdit = (userId: string, currentDiscount: number) => {
    setEditingDiscount(userId);
    setDiscountValue(currentDiscount.toString());
  };

  const handleDiscountSave = (userId: string) => {
    const discount = parseFloat(discountValue);
    if (isNaN(discount) || discount < 0 || discount >= 100) {
      alert('Please enter a valid discount between 0 and 99.99');
      return;
    }
    updateUserDiscount(userId, discount);
  };

  const createUser = async () => {
    setCreating(true);
    try {
      const authToken = localStorage.getItem('auth_token');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      // Validate required fields
      if (!createForm.email || !createForm.password) {
        alert('Email and password are required');
        return;
      }

      const response = await fetch(`${backendUrl}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || `Failed to create user: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // Add new user to local state
        setUsers(prev => [result.data, ...prev]);
        
        // Reset form and close modal
        setCreateForm({
          email: '',
          password: '',
          first_name: '',
          last_name: '',
          company_name: '',
          phone: '',
          account_status: 'approved',
          standard_discount: 0,
          admin_notes: '',
          is_admin: false
        });
        setShowCreateForm(false);
        alert(`User ${result.data.email} created successfully!`);
      } else {
        throw new Error(result.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setCreating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <Check className="h-4 w-4 text-green-600" />;
      case 'rejected': return <X className="h-4 w-4 text-red-600" />;
      case 'suspended': return <div className="h-4 w-4 bg-gray-600 rounded-full" />;
      default: return <div className="h-4 w-4 bg-orange-600 rounded-full" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'suspended': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-orange-100 text-orange-800 border-orange-200';
    }
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage user accounts, approvals, and discounts</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by email, name, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create New User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users found matching your criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
                    {/* User Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(user.account_status)}
                        <span className="font-medium text-gray-900">{user.email}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(user.account_status)}`}>
                          {user.account_status}
                        </span>
                      </div>
                      {(user.first_name || user.last_name) && (
                        <p className="text-sm text-gray-600">Name: {`${user.first_name || ''} ${user.last_name || ''}`.trim()}</p>
                      )}
                      {user.company_name && (
                        <p className="text-sm text-gray-600">Company: {user.company_name}</p>
                      )}
                      {user.registration_code_used && (
                        <p className="text-sm text-gray-600">Registration Code: {user.registration_code_used}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Registered: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Discount Management */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Discount
                      </label>
                      {editingDiscount === user.id ? (
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(e.target.value)}
                            className="w-20 text-sm"
                            min="0"
                            max="99.99"
                            step="0.01"
                          />
                          <Button
                            onClick={() => handleDiscountSave(user.id)}
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => setEditingDiscount(null)}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{user.standard_discount}%</span>
                          <Button
                            onClick={() => handleDiscountEdit(user.id, user.standard_discount)}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {user.account_status === 'pending' && (
                        <>
                          <Button
                            onClick={() => updateUserStatus(user.id, 'approved')}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => updateUserStatus(user.id, 'rejected')}
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {user.account_status === 'approved' && (
                        <Button
                          onClick={() => updateUserStatus(user.id, 'suspended')}
                          size="sm"
                          variant="outline"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Suspend
                        </Button>
                      )}
                      {(user.account_status === 'rejected' || user.account_status === 'suspended') && (
                        <Button
                          onClick={() => updateUserStatus(user.id, 'approved')}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Create New User</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@example.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <Input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <Input
                  value={createForm.first_name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="John"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <Input
                  value={createForm.last_name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Doe"
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <Input
                  value={createForm.company_name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="ABC Elektro GmbH"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <Input
                  value={createForm.phone}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+49 123 456789"
                />
              </div>

              {/* Account Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Status
                </label>
                <select
                  value={createForm.account_status}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, account_status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Standard Discount (%)
                </label>
                <Input
                  type="number"
                  value={createForm.standard_discount}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, standard_discount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                  min="0"
                  max="99.99"
                  step="0.01"
                />
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes
                </label>
                <textarea
                  value={createForm.admin_notes}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, admin_notes: e.target.value }))}
                  placeholder="Optional notes about this user..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              {/* Is Admin */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_admin"
                  checked={createForm.is_admin}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, is_admin: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="is_admin" className="text-sm font-medium text-gray-700">
                  Admin User
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={createUser}
                disabled={creating || !createForm.email || !createForm.password}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {creating ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}