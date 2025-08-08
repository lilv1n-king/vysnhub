import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { authenticateToken } from '../middleware/authMiddleware';
import { userRateLimit } from '../middleware/rateLimiting';

const router = Router();
const orderController = new OrderController();

// Alle Order-Routen erfordern Authentifizierung
router.use(authenticateToken);

// Rate Limiting für Order-Operationen
router.use(userRateLimit);

/**
 * GET /api/orders
 * Lädt alle Bestellungen des Users
 */
router.get('/', orderController.getUserOrders);

/**
 * GET /api/orders/:id
 * Lädt eine spezifische Bestellung mit Items
 */
router.get('/:id', orderController.getOrderById);

/**
 * PUT /api/orders/:id/status
 * Aktualisiert den Status einer Bestellung
 * 
 * Body:
 * {
 *   "status": "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded",
 *   "notes": "Optional internal notes"
 * }
 */
router.put('/:id/status', orderController.updateOrderStatus);

export { router as ordersRouter };