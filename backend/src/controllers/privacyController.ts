import { Request, Response } from 'express';
import { privacyServiceSimple as privacyService } from '../services/privacyServiceSimple';

class PrivacyController {
  /**
   * GET /api/privacy/policy?lang=de|en
   * Gibt die aktuelle Datenschutzerklärung zurück
   */
  getPrivacyPolicy = async (req: Request, res: Response): Promise<void> => {
    try {
      const language = req.query.lang as string || 'en';
      const policy = await privacyService.getPrivacyPolicy(language);
      
      res.status(200).json({
        success: true,
        data: policy
      });
    } catch (error) {
      console.error('Error fetching privacy policy:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch privacy policy',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/privacy/consent
   * Prüft den Datenschutz-Zustimmungsstatus des aktuellen Benutzers
   */
  getConsentStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const consentStatus = await privacyService.getConsentStatus(userId);

      res.status(200).json({
        success: true,
        data: consentStatus
      });
    } catch (error) {
      console.error('Error fetching consent status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch consent status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * POST /api/privacy/consent
   * Speichert die Datenschutz-Zustimmung des Benutzers
   */
  recordConsent = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { consent_given, consent_version } = req.body;

      if (typeof consent_given !== 'boolean') {
        res.status(400).json({
          success: false,
          error: 'Invalid consent data',
          message: 'consent_given must be a boolean'
        });
        return;
      }

      const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
      const userAgent = req.headers['user-agent'];

      await privacyService.recordConsent(userId, {
        consent_given,
        consent_version,
        ip_address: Array.isArray(clientIP) ? clientIP[0] : clientIP,
        user_agent: userAgent
      });

      res.status(200).json({
        success: true,
        message: `Privacy consent ${consent_given ? 'accepted' : 'declined'}`
      });
    } catch (error) {
      console.error('Error recording consent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record consent',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * DELETE /api/privacy/consent
   * Widerruft die Datenschutz-Zustimmung des Benutzers
   */
  withdrawConsent = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
      const userAgent = req.headers['user-agent'];

      await privacyService.withdrawConsent(
        userId,
        Array.isArray(clientIP) ? clientIP[0] : clientIP,
        userAgent
      );

      res.status(200).json({
        success: true,
        message: 'Privacy consent withdrawn successfully'
      });
    } catch (error) {
      console.error('Error withdrawing consent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to withdraw consent',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/privacy/consent/history
   * Gibt die Datenschutz-Historie des Benutzers zurück
   */
  getConsentHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const history = await privacyService.getConsentHistory(userId);

      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Error fetching consent history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch consent history',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

export const privacyController = new PrivacyController();
