import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Konfiguriere wie Notifications gehandhabt werden sollen
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      if (token) setIsRegistered(true);
    });

    // Listener für eingehende Notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listener für Notification responses (wenn User darauf tippt)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Hier kannst du Navigation oder andere Aktionen implementieren
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Push Token registrieren
  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        alert('Push Notifications sind deaktiviert! Bitte aktiviere sie in den Einstellungen.');
        return null;
      }
      
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId || 'your-expo-project-id';
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('📱 Expo Push Token:', token);
      } catch (error) {
        console.error('Error getting push token:', error);
        return null;
      }
    } else {
      alert('Push Notifications funktionieren nur auf echten Geräten!');
    }

    return token;
  }

  // Token an deinen Server senden
  const subscribeToPush = async (): Promise<boolean> => {
    if (!expoPushToken) return false;

    setIsLoading(true);

    try {
      const response = await fetch('https://api.vysnlighting.com/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: expoPushToken,
          deviceType: Platform.OS,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        setIsRegistered(true);
        setIsLoading(false);
        return true;
      } else {
        throw new Error('Failed to register token with server');
      }
    } catch (error) {
      console.error('Error subscribing to push:', error);
      setIsLoading(false);
      return false;
    }
  };

  // Test Notification senden
  const sendTestNotification = async () => {
    if (!expoPushToken) {
      alert('Kein Push Token verfügbar!');
      return;
    }

    try {
      const response = await fetch('https://api.vysnlighting.com/api/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: expoPushToken,
          title: 'VYSN Hub 🔔',
          body: 'Test Notification von VYSN Hub! Neue Produkte verfügbar.',
          data: { 
            type: 'test',
            url: '/products' 
          },
        }),
      });

      if (response.ok) {
        console.log('✅ Test notification sent successfully');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  // Lokale Notification senden (für Tests)
  const sendLocalNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "VYSN Hub 🔔",
        body: 'Lokale Test Notification!',
        data: { data: 'goes here' },
      },
      trigger: { seconds: 2 },
    });
  };

  return {
    expoPushToken,
    notification,
    isRegistered,
    isLoading,
    subscribeToPush,
    sendTestNotification,
    sendLocalNotification,
  };
} 