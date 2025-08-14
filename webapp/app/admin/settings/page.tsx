'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Database, Users, FileText, Settings as SettingsIcon } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-600 mt-2">Configure system settings and administrative options</p>
      </div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security & Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Admin Access Control</h4>
              <p className="text-sm text-gray-600">
                Manage admin user permissions and access levels.
              </p>
              <Button variant="outline" size="sm" disabled>
                Configure Access (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Database Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Database Status</h4>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Connected to Supabase</span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Schema Updates</h4>
              <p className="text-sm text-gray-600">
                Apply database schema changes for admin functionality.
              </p>
              <Button variant="outline" size="sm" disabled>
                Check for Updates
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Management Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Registration Codes</h4>
              <p className="text-sm text-gray-600">
                Manage registration codes for new user sign-ups.
              </p>
              <Button variant="outline" size="sm" disabled>
                Manage Codes (Coming Soon)
              </Button>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Default Discount</h4>
              <p className="text-sm text-gray-600">
                Set default discount percentage for new users.
              </p>
              <Button variant="outline" size="sm" disabled>
                Configure Default
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Content Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Home Page Templates</h4>
              <p className="text-sm text-gray-600">
                Create and manage templates for home page highlights.
              </p>
              <Button variant="outline" size="sm" disabled>
                Manage Templates
              </Button>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Image Storage</h4>
              <p className="text-sm text-gray-600">
                Configure image upload and storage settings.
              </p>
              <Button variant="outline" size="sm" disabled>
                Storage Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SettingsIcon className="h-5 w-5 mr-2" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2">Version Information</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Admin Dashboard: v1.0.0</div>
                <div>Backend API: Active</div>
                <div>Database: Connected</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Features</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>✅ User Management</div>
                <div>✅ Home Content Management</div>
                <div>✅ Discount Management</div>
                <div>✅ Account Approval</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Status</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Initial Setup Steps:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Apply the database schema updates using the SQL file: <code className="bg-gray-100 px-2 py-1 rounded">database/add_admin_fields.sql</code></li>
                <li>Set your admin status in the database: <code className="bg-gray-100 px-2 py-1 rounded">UPDATE profiles SET is_admin = true WHERE id = &apos;your-user-id&apos;;</code></li>
                <li>Configure your authentication token in the webapp</li>
                <li>Start managing users and home content through the admin interface</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium mb-2">API Endpoints:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• <code className="bg-gray-100 px-2 py-1 rounded">GET /api/admin/users</code> - List all users</div>
                <div>• <code className="bg-gray-100 px-2 py-1 rounded">PUT /api/admin/users/:id/status</code> - Update user status</div>
                <div>• <code className="bg-gray-100 px-2 py-1 rounded">GET /api/home-content/admin/highlights</code> - Manage highlights</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}