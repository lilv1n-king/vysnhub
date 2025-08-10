import express from 'express';
import { registrationController } from '../controllers/registrationController';
// import { authMiddleware } from '../middleware/authMiddleware'; // Nicht benötigt für public endpoints

const router = express.Router();

// Öffentliche Endpunkte (keine Authentifizierung erforderlich)
router.post('/validate-code', registrationController.validateCode);
router.post('/register', registrationController.register);
router.post('/verify-code', registrationController.verifyEmailCode); // Neue Code-basierte Verifikation
router.get('/verify-email', registrationController.verifyEmail); // Legacy Token-Support
router.post('/resend-verification', registrationController.resendVerification);

// Admin-Endpunkte (Authentifizierung erforderlich)
// TODO: Admin-spezifische Middleware hinzufügen
router.get('/codes', registrationController.getCodes);
router.post('/codes', registrationController.createCode);

export default router;
