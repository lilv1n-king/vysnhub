import { Router } from 'express';
import { EmailController } from '../controllers/emailController';
import { authenticateToken } from '../middleware/authMiddleware';
import { rateLimitEmail } from '../middleware/rateLimiting';

const router = Router();
const emailController = new EmailController();

// Alle Email-Routen erfordern Authentifizierung
router.use(authenticateToken);

// Rate Limiting für Email-Versand (max 10 Emails pro Stunde pro User)
router.use(rateLimitEmail);

/**
 * POST /api/email/order
 * Sendet eine Bestell-E-Mail für ein Projekt
 * 
 * Body:
 * {
 *   "projectId": "abc-123",
 *   "customerInfo": {
 *     "name": "Max Mustermann",
 *     "email": "max@example.com",
 *     "company": "Mustermann GmbH" // optional
 *   },
 *   "orderNotes": "Lieferung bitte bis Ende des Monats" // optional
 * }
 */
router.post('/order', emailController.sendOrderEmail);

/**
 * POST /api/email/cart-order
 * Sendet eine Bestell-E-Mail für einen Warenkorb
 * 
 * Body:
 * {
 *   "customerInfo": {
 *     "name": "Max Mustermann",
 *     "email": "max@example.com",
 *     "company": "Mustermann GmbH" // optional
 *   },
 *   "cartItems": [
 *     {
 *       "productId": 123,
 *       "productName": "LED Spot",
 *       "itemNumber": "VS-LED-001",
 *       "quantity": 2,
 *       "unitPrice": 29.99,
 *       "totalPrice": 59.98
 *     }
 *   ],
 *   "orderNotes": "Lieferung bitte bis Ende des Monats", // optional
 *   "totalAmount": 59.98 // optional, wird automatisch berechnet
 * }
 */
router.post('/cart-order', emailController.sendCartOrderEmail);

/**
 * POST /api/email/test
 * Sendet eine Test-E-Mail (nur für Development/Testing)
 */
router.post('/test', emailController.sendTestEmail);

export { router as emailRouter };