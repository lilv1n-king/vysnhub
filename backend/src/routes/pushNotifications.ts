import express from 'express';
import pushNotificationService from '../services/pushNotificationService';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * POST /api/push/subscribe
 * Registriert einen neuen Push Token
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { token, deviceType, userId } = req.body;

    if (!token || !deviceType) {
      return res.status(400).json({
        error: 'Token und deviceType sind erforderlich'
      });
    }

    const tokenData = {
      token,
      deviceType,
      userId,
      timestamp: new Date().toISOString()
    };

    const success = pushNotificationService.registerToken(tokenData);
    
    if (success) {
      res.json({
        success: true,
        message: 'Push Token erfolgreich registriert'
      });
    } else {
      res.status(400).json({
        error: 'Ungültiger Push Token'
      });
    }
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    res.status(500).json({
      error: 'Interner Server Fehler'
    });
  }
});

/**
 * POST /api/push/unsubscribe
 * Entfernt einen Push Token
 */
router.post('/unsubscribe', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token ist erforderlich'
      });
    }

    const success = pushNotificationService.unregisterToken(token);
    
    res.json({
      success: true,
      message: success ? 'Token entfernt' : 'Token war nicht registriert'
    });
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    res.status(500).json({
      error: 'Interner Server Fehler'
    });
  }
});

/**
 * POST /api/push/send
 * Sendet eine Push Notification
 */
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { to, title, body, data, type = 'single' } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        error: 'Title und Body sind erforderlich'
      });
    }

    const notification = {
      title,
      body,
      data,
      sound: 'default' as const,
      priority: 'default' as const
    };

    let result;

    switch (type) {
      case 'single':
        if (!to) {
          return res.status(400).json({
            error: 'Ziel-Token ist erforderlich für single notifications'
          });
        }
        result = await pushNotificationService.sendToToken(to, notification);
        res.json({
          success: result,
          message: result ? 'Notification gesendet' : 'Fehler beim Senden'
        });
        break;

      case 'broadcast':
        result = await pushNotificationService.sendBroadcast(notification);
        res.json({
          success: result.success > 0,
          message: `Broadcast gesendet: ${result.success} erfolgreich, ${result.failed} fehlgeschlagen`,
          stats: result
        });
        break;

      case 'ios':
        result = await pushNotificationService.sendToiOS(notification);
        res.json({
          success: result.success > 0,
          message: `iOS Notification gesendet: ${result.success} erfolgreich, ${result.failed} fehlgeschlagen`,
          stats: result
        });
        break;

      case 'android':
        result = await pushNotificationService.sendToAndroid(notification);
        res.json({
          success: result.success > 0,
          message: `Android Notification gesendet: ${result.success} erfolgreich, ${result.failed} fehlgeschlagen`,
          stats: result
        });
        break;

      default:
        res.status(400).json({
          error: 'Ungültiger Notification Type. Erlaubt: single, broadcast, ios, android'
        });
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
    res.status(500).json({
      error: 'Interner Server Fehler'
    });
  }
});

/**
 * POST /api/push/send-template
 * Sendet eine vorgefertigte Template Notification
 */
router.post('/send-template', authenticateToken, async (req, res) => {
  try {
    const { template, params, target, targetToken } = req.body;

    if (!template) {
      return res.status(400).json({
        error: 'Template ist erforderlich'
      });
    }

    const templates = pushNotificationService.createNotificationTemplates();
    
    let notification;
    switch (template) {
      case 'welcome':
        notification = templates.welcome(params?.userName || 'User');
        break;
      case 'newProduct':
        notification = templates.newProduct(params?.productName || 'Neues Produkt');
        break;
      case 'orderUpdate':
        notification = templates.orderUpdate(params?.orderStatus || 'aktualisiert');
        break;
      case 'promotion':
        notification = templates.promotion(params?.title || 'Angebot', params?.description || 'Schaue dir unser Angebot an!');
        break;
      case 'reminder':
        notification = templates.reminder(params?.message || 'Du hast eine Erinnerung');
        break;
      case 'projectUpdate':
        notification = templates.projectUpdate(params?.projectName || 'Projekt');
        break;
      default:
        return res.status(400).json({
          error: 'Unbekanntes Template. Verfügbar: welcome, newProduct, orderUpdate, promotion, reminder, projectUpdate'
        });
    }

    let result;
    if (targetToken) {
      result = await pushNotificationService.sendToToken(targetToken, notification);
      res.json({
        success: result,
        message: result ? 'Template Notification gesendet' : 'Fehler beim Senden',
        template
      });
    } else {
      switch (target) {
        case 'broadcast':
          result = await pushNotificationService.sendBroadcast(notification);
          break;
        case 'ios':
          result = await pushNotificationService.sendToiOS(notification);
          break;
        case 'android':
          result = await pushNotificationService.sendToAndroid(notification);
          break;
        default:
          result = await pushNotificationService.sendBroadcast(notification);
      }
      
      res.json({
        success: result.success > 0,
        message: `Template "${template}" gesendet: ${result.success} erfolgreich, ${result.failed} fehlgeschlagen`,
        template,
        stats: result
      });
    }
  } catch (error) {
    console.error('Error sending template notification:', error);
    res.status(500).json({
      error: 'Interner Server Fehler'
    });
  }
});

/**
 * GET /api/push/stats
 * Gibt Statistiken über registrierte Push Tokens zurück
 */
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const stats = pushNotificationService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting push stats:', error);
    res.status(500).json({
      error: 'Interner Server Fehler'
    });
  }
});

/**
 * POST /api/push/test
 * Sendet eine Test Notification
 */
router.post('/test', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token ist erforderlich für Test'
      });
    }

    const testNotification = {
      title: 'VYSN Hub Test 🔔',
      body: 'Das ist eine Test Push Notification! Push Notifications funktionieren korrekt.',
      data: { 
        type: 'test',
        timestamp: new Date().toISOString(),
        screen: 'home'
      },
      sound: 'default' as const,
      priority: 'high' as const
    };

    const result = await pushNotificationService.sendToToken(token, testNotification);
    
    res.json({
      success: result,
      message: result ? 'Test Notification gesendet!' : 'Fehler beim Senden der Test Notification',
      notification: testNotification
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      error: 'Interner Server Fehler'
    });
  }
});

export default router;