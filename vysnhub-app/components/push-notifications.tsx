'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Check } from 'lucide-react';

export default function PushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSupported('Notification' in window);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return;
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        new Notification('VYSN Hub', {
          body: 'Benachrichtigungen erfolgreich aktiviert!',
          icon: '/logo.png'
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  if (!isSupported) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-6 text-center">
          <BellOff className="mx-auto h-8 w-8 text-gray-400 mb-4" />
          <p className="text-gray-600">
            Benachrichtigungen werden von diesem Browser nicht unterstützt.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push-Benachrichtigungen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-600">
            Erhalten Sie Benachrichtigungen über neue Produkte, Angebote und wichtige Updates.
          </p>
          
          {permission === 'default' && (
            <Button onClick={requestPermission} className="w-full">
              Benachrichtigungen aktivieren
            </Button>
          )}
          
          {permission === 'granted' && (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              <span>Benachrichtigungen sind aktiviert</span>
            </div>
          )}
          
          {permission === 'denied' && (
            <div className="text-center">
              <BellOff className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-600 text-sm">
                Benachrichtigungen wurden blockiert. Sie können diese in den Browser-Einstellungen aktivieren.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}