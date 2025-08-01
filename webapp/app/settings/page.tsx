
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Bell, 
  User, 
  Shield, 
  HelpCircle,
  Settings as SettingsIcon,
  ExternalLink,
  ChevronRight,
  ArrowUp
} from 'lucide-react';
import Header from '@/components/header';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-36 pb-6 md:pb-8">
        {/* Simple Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-black flex items-center justify-center gap-3">
            <SettingsIcon className="h-10 w-10" />
            Settings
          </h1>
          <p className="text-gray-600 text-lg mt-2">
            Manage your VYSN App preferences
          </p>
          
          {/* Settings Icon Reference */}
          <div className="mt-4 inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <SettingsIcon className="h-4 w-4" />
            <span>You can always access Settings via the</span>
            <SettingsIcon className="h-4 w-4" />
            <span>icon in the top right corner</span>
            <ArrowUp className="h-4 w-4 rotate-45" />
          </div>
        </div>

        <div className="space-y-8">
          {/* Support Section */}
          <div>
            <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
              <Phone className="h-6 w-6" />
              Support & Contact
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">Technical Support</h3>
                    <p className="text-sm text-gray-600">+49 (0) 123 456 789</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-600 text-white rounded-lg flex items-center justify-center">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">Email Support</h3>
                    <p className="text-sm text-gray-600">support@vysn.com</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-800 text-white rounded-lg flex items-center justify-center">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">Live Chat</h3>
                    <p className="text-sm text-gray-600">Instant support via chat</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div>
            <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
              <Bell className="h-6 w-6" />
              Notifications
            </h2>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center">
                  <Bell className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-black">Push Notifications</h3>
                  <p className="text-sm text-gray-600">Product updates and news</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Enable
              </Button>
            </div>
          </div>

          {/* Account Section */}
          <div>
            <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
              <User className="h-6 w-6" />
              Account & Profile
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-600 text-white rounded-lg flex items-center justify-center">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">Edit Profile</h3>
                    <p className="text-sm text-gray-600">Name, email, preferences</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">Privacy</h3>
                    <p className="text-sm text-gray-600">Privacy settings</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div>
            <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
              <HelpCircle className="h-6 w-6" />
              Help & Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">FAQ & Help</h3>
                    <p className="text-sm text-gray-600">Frequently asked questions</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-800 text-white rounded-lg flex items-center justify-center">
                    <ExternalLink className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">VYSN Website</h3>
                    <p className="text-sm text-gray-600">Visit our website</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* App Info */}
          <div className="pt-8 border-t border-gray-200 text-center">
            <div className="text-gray-500 text-sm space-y-1">
              <p>VYSN Hub App</p>
              <p>Version 1.0.0</p>
              <p className="mt-4 text-xs">© 2024 VYSN. All rights reserved.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 