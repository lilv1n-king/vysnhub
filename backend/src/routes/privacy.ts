import express from 'express';
import { privacyController } from '../controllers/privacyController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Öffentliche Endpunkte (keine Authentifizierung erforderlich)
router.get('/policy', privacyController.getPrivacyPolicy);

// Authentifizierte Endpunkte
router.get('/consent', authenticateToken, privacyController.getConsentStatus);
router.post('/consent', authenticateToken, privacyController.recordConsent);
router.delete('/consent', authenticateToken, privacyController.withdrawConsent);
router.get('/consent/history', authenticateToken, privacyController.getConsentHistory);

export default router;
