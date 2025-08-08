import express from 'express';
import cartService from '../services/cartService';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * GET /api/cart
 * Holt aktuellen Warenkorb des Benutzers
 */
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const sessionId = req.headers['x-session-id'] as string;

    if (!userId && !sessionId) {
      return res.status(400).json({
        error: 'User ID oder Session ID erforderlich'
      });
    }

    // Hole oder erstelle Warenkorb
    const cart = await cartService.getOrCreateCart(userId, sessionId);
    if (!cart) {
      return res.status(500).json({
        error: 'Warenkorb konnte nicht erstellt werden'
      });
    }

    // Lade Warenkorb mit Items
    const cartWithItems = await cartService.getCartWithItems(cart.id);
    
    res.json({
      success: true,
      cart: cartWithItems
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      error: 'Interner Server Fehler'
    });
  }
});

/**
 * POST /api/cart/add
 * Fügt Produkt zum Warenkorb hinzu
 */
router.post('/add', async (req, res) => {
  try {
    const { productId, quantity, unitPrice } = req.body;
    const userId = (req as any).user?.id;
    const sessionId = req.headers['x-session-id'] as string;

    if (!productId || !quantity || !unitPrice) {
      return res.status(400).json({
        error: 'productId, quantity und unitPrice sind erforderlich'
      });
    }

    if (!userId && !sessionId) {
      return res.status(400).json({
        error: 'User ID oder Session ID erforderlich'
      });
    }

    // Hole oder erstelle Warenkorb
    const cart = await cartService.getOrCreateCart(userId, sessionId);
    if (!cart) {
      return res.status(500).json({
        error: 'Warenkorb konnte nicht erstellt werden'
      });
    }

    // Füge Produkt hinzu
    const cartItem = await cartService.addToCart(
      cart.id,
      parseInt(productId),
      parseInt(quantity),
      parseFloat(unitPrice)
    );

    if (!cartItem) {
      return res.status(500).json({
        error: 'Produkt konnte nicht hinzugefügt werden'
      });
    }

    // Hole aktualisierte Warenkorb-Daten
    const updatedCart = await cartService.getCartWithItems(cart.id);

    res.json({
      success: true,
      message: 'Produkt zum Warenkorb hinzugefügt',
      cartItem,
      cart: updatedCart
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      error: 'Interner Server Fehler'
    });
  }
});

/**
 * PUT /api/cart/update/:itemId
 * Aktualisiert Menge eines Warenkorb-Items
 */
router.put('/update/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        error: 'Gültige quantity ist erforderlich'
      });
    }

    const success = await cartService.updateQuantity(itemId, parseInt(quantity));

    if (!success) {
      return res.status(500).json({
        error: 'Menge konnte nicht aktualisiert werden'
      });
    }

    res.json({
      success: true,
      message: 'Menge aktualisiert'
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      error: 'Interner Server Fehler'
    });
  }
});

/**
 * DELETE /api/cart/remove/:itemId
 * Entfernt Item aus Warenkorb
 */
router.delete('/remove/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;

    const success = await cartService.removeFromCart(itemId);

    if (!success) {
      return res.status(500).json({
        error: 'Item konnte nicht entfernt werden'
      });
    }

    res.json({
      success: true,
      message: 'Item aus Warenkorb entfernt'
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({
      error: 'Interner Server Fehler'
    });
  }
});

/**
 * DELETE /api/cart/clear
 * Leert kompletten Warenkorb
 */
router.delete('/clear', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const sessionId = req.headers['x-session-id'] as string;

    if (!userId && !sessionId) {
      return res.status(400).json({
        error: 'User ID oder Session ID erforderlich'
      });
    }

    // Hole aktuellen Warenkorb
    const cart = await cartService.getOrCreateCart(userId, sessionId);
    if (!cart) {
      return res.status(404).json({
        error: 'Warenkorb nicht gefunden'
      });
    }

    const success = await cartService.clearCart(cart.id);

    if (!success) {
      return res.status(500).json({
        error: 'Warenkorb konnte nicht geleert werden'
      });
    }

    res.json({
      success: true,
      message: 'Warenkorb geleert'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      error: 'Interner Server Fehler'
    });
  }
});

/**
 * POST /api/cart/migrate
 * Migriert Session-Cart zu User-Cart beim Login
 */
router.post('/migrate', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { sessionId } = req.body;

    if (!userId || !sessionId) {
      return res.status(400).json({
        error: 'User ID und Session ID erforderlich'
      });
    }

    const success = await cartService.migrateSessionCartToUser(sessionId, userId);

    if (!success) {
      return res.status(500).json({
        error: 'Migration fehlgeschlagen'
      });
    }

    // Hole neuen User-Cart
    const userCart = await cartService.getOrCreateCart(userId);
    const cartWithItems = userCart ? await cartService.getCartWithItems(userCart.id) : null;

    res.json({
      success: true,
      message: 'Warenkorb erfolgreich migriert',
      cart: cartWithItems
    });
  } catch (error) {
    console.error('Error migrating cart:', error);
    res.status(500).json({
      error: 'Interner Server Fehler'
    });
  }
});

/**
 * POST /api/cart/convert/:cartId
 * Markiert Warenkorb als konvertiert (nach Bestellung)
 */
router.post('/convert/:cartId', authenticateToken, async (req, res) => {
  try {
    const { cartId } = req.params;

    const success = await cartService.markCartAsConverted(cartId);

    if (!success) {
      return res.status(500).json({
        error: 'Warenkorb konnte nicht als konvertiert markiert werden'
      });
    }

    res.json({
      success: true,
      message: 'Warenkorb als konvertiert markiert'
    });
  } catch (error) {
    console.error('Error converting cart:', error);
    res.status(500).json({
      error: 'Interner Server Fehler'
    });
  }
});

/**
 * GET /api/cart/stats
 * Holt Warenkorb-Statistiken
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    const stats = await cartService.getCartStats(userId);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching cart stats:', error);
    res.status(500).json({
      error: 'Interner Server Fehler'
    });
  }
});

/**
 * POST /api/cart/cleanup
 * Admin: Bereinigt abgelaufene Warenkörbe
 */
router.post('/cleanup', authenticateToken, async (req, res) => {
  try {
    // TODO: Add admin role check here
    
    const deletedCount = await cartService.cleanupExpiredCarts();

    res.json({
      success: true,
      message: `${deletedCount} abgelaufene Warenkörbe bereinigt`
    });
  } catch (error) {
    console.error('Error cleaning up carts:', error);
    res.status(500).json({
      error: 'Interner Server Fehler'
    });
  }
});

export default router;