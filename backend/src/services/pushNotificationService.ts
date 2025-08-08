import { Expo, ExpoPushMessage, ExpoPushTicket, ExpoPushReceiptError } from 'expo-server-sdk';

interface PushTokenData {
  token: string;
  deviceType: 'ios' | 'android';
  userId?: string;
  timestamp: string;
}

interface NotificationData {
  title: string;
  body: string;
  data?: any;
  sound?: 'default' | null;
  badge?: number;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
}

class PushNotificationService {
  private expo: Expo;
  private pushTokens: Map<string, PushTokenData> = new Map();

  constructor() {
    this.expo = new Expo();
  }

  /**
   * Registriert einen neuen Push Token
   */
  registerToken(tokenData: PushTokenData): boolean {
    if (!Expo.isExpoPushToken(tokenData.token)) {
      console.error('Invalid Expo push token:', tokenData.token);
      return false;
    }

    this.pushTokens.set(tokenData.token, tokenData);
    console.log(`📱 Push token registered for ${tokenData.deviceType}:`, tokenData.token);
    return true;
  }

  /**
   * Entfernt einen Push Token
   */
  unregisterToken(token: string): boolean {
    const removed = this.pushTokens.delete(token);
    if (removed) {
      console.log('🗑️ Push token unregistered:', token);
    }
    return removed;
  }

  /**
   * Sendet eine Push Notification an einen spezifischen Token
   */
  async sendToToken(token: string, notification: NotificationData): Promise<boolean> {
    if (!Expo.isExpoPushToken(token)) {
      console.error('Invalid push token:', token);
      return false;
    }

    try {
      const message: ExpoPushMessage = {
        to: token,
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: notification.sound || 'default',
        badge: notification.badge,
        priority: notification.priority || 'default',
        channelId: notification.channelId || 'default',
      };

      const ticket = await this.expo.sendPushNotificationsAsync([message]);
      console.log('📤 Push notification sent:', ticket);
      
      return this.handleTicket(ticket[0], token);
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  /**
   * Sendet Push Notifications an mehrere Tokens
   */
  async sendToMultipleTokens(tokens: string[], notification: NotificationData): Promise<{ success: number; failed: number }> {
    const validTokens = tokens.filter(token => Expo.isExpoPushToken(token));
    
    if (validTokens.length === 0) {
      console.error('No valid push tokens provided');
      return { success: 0, failed: tokens.length };
    }

    try {
      const messages: ExpoPushMessage[] = validTokens.map(token => ({
        to: token,
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: notification.sound || 'default',
        badge: notification.badge,
        priority: notification.priority || 'default',
        channelId: notification.channelId || 'default',
      }));

      // Chunke die Nachrichten (Expo erlaubt max 100 pro Request)
      const chunks = this.expo.chunkPushNotifications(messages);
      let successCount = 0;
      let failedCount = 0;

      for (const chunk of chunks) {
        try {
          const tickets = await this.expo.sendPushNotificationsAsync(chunk);
          
          for (let i = 0; i < tickets.length; i++) {
            const ticket = tickets[i];
            const token = chunk[i].to as string;
            
            if (this.handleTicket(ticket, token)) {
              successCount++;
            } else {
              failedCount++;
            }
          }
        } catch (error) {
          console.error('Error sending push notification chunk:', error);
          failedCount += chunk.length;
        }
      }

      console.log(`📊 Push notifications sent: ${successCount} success, ${failedCount} failed`);
      return { success: successCount, failed: failedCount };

    } catch (error) {
      console.error('Error sending bulk push notifications:', error);
      return { success: 0, failed: tokens.length };
    }
  }

  /**
   * Sendet Broadcast Notification an alle registrierten Tokens
   */
  async sendBroadcast(notification: NotificationData): Promise<{ success: number; failed: number }> {
    const tokens = Array.from(this.pushTokens.keys());
    return this.sendToMultipleTokens(tokens, notification);
  }

  /**
   * Sendet Notification an alle iOS Geräte
   */
  async sendToiOS(notification: NotificationData): Promise<{ success: number; failed: number }> {
    const iosTokens = Array.from(this.pushTokens.values())
      .filter(tokenData => tokenData.deviceType === 'ios')
      .map(tokenData => tokenData.token);
    
    return this.sendToMultipleTokens(iosTokens, notification);
  }

  /**
   * Sendet Notification an alle Android Geräte
   */
  async sendToAndroid(notification: NotificationData): Promise<{ success: number; failed: number }> {
    const androidTokens = Array.from(this.pushTokens.values())
      .filter(tokenData => tokenData.deviceType === 'android')
      .map(tokenData => tokenData.token);
    
    return this.sendToMultipleTokens(androidTokens, notification);
  }

  /**
   * Prüft die Receipts für gesendete Notifications
   */
  async checkReceipts(receiptIds: string[]): Promise<void> {
    try {
      const receiptIdChunks = this.expo.chunkPushNotificationReceiptIds(receiptIds);
      
      for (const chunk of receiptIdChunks) {
        const receipts = await this.expo.getPushNotificationReceiptsAsync(chunk);
        
        for (const receiptId in receipts) {
          const receipt = receipts[receiptId];
          
          if (receipt.status === 'error') {
            const error = receipt as ExpoPushReceiptError;
            console.error(`Push notification error for receipt ${receiptId}:`, error);
            
            // Token ist ungültig - entfernen
            if (error.details?.error === 'DeviceNotRegistered') {
              // TODO: Token aus Datenbank entfernen
              console.log('🗑️ Device not registered, should remove token');
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking receipts:', error);
    }
  }

  /**
   * Erstellt verschiedene Notification Templates
   */
  createNotificationTemplates() {
    return {
      welcome: (userName: string): NotificationData => ({
        title: '🎉 Willkommen bei VYSN Hub!',
        body: `Hallo ${userName}! Entdecke unsere neuesten Beleuchtungslösungen.`,
        data: { type: 'welcome', screen: 'home' },
        sound: 'default',
        priority: 'high'
      }),

      newProduct: (productName: string): NotificationData => ({
        title: '💡 Neues Produkt verfügbar!',
        body: `${productName} ist jetzt in unserem Katalog verfügbar.`,
        data: { type: 'new_product', screen: 'products' },
        sound: 'default',
        priority: 'default'
      }),

      orderUpdate: (orderStatus: string): NotificationData => ({
        title: '📦 Bestellung aktualisiert',
        body: `Deine Bestellung ist jetzt: ${orderStatus}`,
        data: { type: 'order_update', screen: 'orders' },
        sound: 'default',
        priority: 'high'
      }),

      promotion: (title: string, description: string): NotificationData => ({
        title: `🔥 ${title}`,
        body: description,
        data: { type: 'promotion', screen: 'products' },
        sound: 'default',
        priority: 'normal'
      }),

      reminder: (message: string): NotificationData => ({
        title: '⏰ Erinnerung',
        body: message,
        data: { type: 'reminder' },
        sound: 'default',
        priority: 'default'
      }),

      projectUpdate: (projectName: string): NotificationData => ({
        title: '📋 Projekt aktualisiert',
        body: `Änderungen in Projekt "${projectName}" verfügbar.`,
        data: { type: 'project_update', screen: 'projects' },
        sound: 'default',
        priority: 'default'
      })
    };
  }

  /**
   * Behandelt Ticket Response von Expo
   */
  private handleTicket(ticket: ExpoPushTicket, token: string): boolean {
    if (ticket.status === 'error') {
      console.error(`Push notification error for token ${token}:`, ticket.message);
      
      // Bei Device-nicht-registriert Fehler, Token entfernen
      if (ticket.details?.error === 'DeviceNotRegistered') {
        this.unregisterToken(token);
      }
      
      return false;
    }
    
    console.log(`✅ Push notification queued for token ${token}:`, ticket.id);
    return true;
  }

  /**
   * Gibt Statistiken über registrierte Tokens zurück
   */
  getStats() {
    const tokens = Array.from(this.pushTokens.values());
    const iosCount = tokens.filter(t => t.deviceType === 'ios').length;
    const androidCount = tokens.filter(t => t.deviceType === 'android').length;
    
    return {
      total: tokens.length,
      ios: iosCount,
      android: androidCount,
      tokensWithUserId: tokens.filter(t => t.userId).length
    };
  }
}

export default new PushNotificationService();