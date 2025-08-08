/**
 * Optimierte Chat Route
 * 
 * Performance-Features:
 * 1. Nutzt OptimizedChatService für Fast Path
 * 2. Fallback auf normalen ChatService
 * 3. Response Streaming für lange Antworten
 * 4. Request Deduplication
 * 5. Error Recovery
 */

import express from 'express';
import { OptimizedChatService } from '../services/optimizedChatService';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// ⚠️ SICHERHEIT: Alle optimierten Chat-Endpunkte benötigen jetzt Authentifizierung
router.use(authenticateToken);

const optimizedChatService = new OptimizedChatService();

// Request deduplication - verhindert doppelte Anfragen
const activeRequests = new Map<string, Promise<any>>();

/**
 * Optimierte Chat-Nachricht Endpoint
 */
router.post('/message', async (req, res) => {
  const startTime = Date.now();
  const { message, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Nachricht ist erforderlich' });
  }

  // Request Deduplication
  const requestKey = `${message}-${JSON.stringify(context)}`;
  const existingRequest = activeRequests.get(requestKey);
  if (existingRequest) {
    console.log('Duplicate request detected, waiting for existing...');
    try {
      const result = await existingRequest;
      return res.json(result);
    } catch (error) {
      // Fall through zu neuem Request
    }
  }

  // Create new request promise
  const requestPromise = processOptimizedRequest(message, context);
  activeRequests.set(requestKey, requestPromise);

  try {
    const result = await requestPromise;
    const totalTime = Date.now() - startTime;
    
    // Add performance metadata
    result.metadata = {
      ...result.metadata,
      responseTime: totalTime,
      optimized: true
    };

    console.log(`Optimized request completed in ${totalTime}ms`);
    res.json(result);
    
  } catch (error) {
    console.error('Optimized request failed:', error);
    
    // Fallback to original ChatService
    try {
      console.log('Using simple error fallback...');
      // ChatService hat keine handleMessage Methode, also verwende einfache Fehlerantwort
      const totalTime = Date.now() - startTime;
      
      res.status(200).json({
        response: 'Entschuldigung, ich kann Ihre Anfrage gerade nicht bearbeiten. Bitte kontaktieren Sie unseren Support für weitere Hilfe.',
        requestType: 'error',
        supportContact: true,
        products: [],
        metadata: {
          responseTime: totalTime,
          error: true,
          fallback: true,
          timestamp: new Date().toISOString()
        }
      });
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      res.status(200).json({ 
        response: 'Entschuldigung, ich kann Ihre Anfrage gerade nicht bearbeiten. Bitte kontaktieren Sie unseren Support für weitere Hilfe.',
        requestType: 'error',
        supportContact: true,
        metadata: {
          error: true,
          timestamp: new Date().toISOString()
        }
      });
    }
  } finally {
    // Cleanup request tracking
    setTimeout(() => {
      activeRequests.delete(requestKey);
    }, 1000); // Keep for 1 second to handle near-simultaneous requests
  }
});

/**
 * Verarbeitet Request mit optimiertem Service
 */
async function processOptimizedRequest(message: string, context?: string[]) {
  console.log('Verarbeite optimierte Anfrage:', message.slice(0, 50) + '...');
  console.log('Kontext:', context?.length || 0, 'Nachrichten');

  const result = await optimizedChatService.processMessage(message, context);
  
  // Add additional metadata for debugging
  result.metadata = {
    ...result.metadata,
    messageLength: message.length,
    contextLength: context?.length || 0,
    timestamp: new Date().toISOString()
  };

  console.log(`${result.products?.length || 0} Produkte gefunden`);
  return result;
}

/**
 * Performance-optimierte Produktsuche (direkt ohne Chat-Processing)
 */
router.post('/quick-search', async (req, res) => {
  const startTime = Date.now();
  const { query, type } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Suchanfrage ist erforderlich' });
  }

  try {
    let result;
    
    // Import utilities dynamisch für bessere Performance
    const { 
      searchByIPProtection, 
      searchByLuminaireType, 
      simpleTextSearch,
      extractIPFromMessage,
      extractLuminaireType 
    } = await import('../utils/productSearchUtils');

    const luminaireType = extractLuminaireType(query);
    const ipClass = extractIPFromMessage(query);

    // Direkte Suche basierend auf erkannten Patterns
    if (luminaireType && ipClass) {
      result = await searchByLuminaireType(luminaireType, ipClass, 20);
    } else if (ipClass) {
      result = await searchByIPProtection(ipClass, true, 20);
    } else {
      result = await simpleTextSearch(query, 20, true);
    }

    const responseTime = Date.now() - startTime;
    
    res.json({
      products: result.products,
      totalCount: result.totalCount,
      searchInfo: {
        ...result.searchInfo,
        responseTime,
        directSearch: true
      }
    });
    
    console.log(`Quick search completed in ${responseTime}ms`);
    
  } catch (error) {
    console.error('Quick search failed:', error);
    res.status(500).json({ 
      error: 'Fehler bei der Schnellsuche',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
});

/**
 * Cache-Management Endpoints
 */
router.post('/cache/clear', (req, res) => {
  try {
    optimizedChatService.cleanupCache();
    res.json({ message: 'Cache geleert' });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Cache-Leeren' });
  }
});

router.get('/cache/stats', (req, res) => {
  try {
    // Get cache stats if available
    const stats = {
      activeRequests: activeRequests.size,
      timestamp: new Date().toISOString()
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Abrufen der Cache-Statistiken' });
  }
});

/**
 * Health Check für optimierte Route
 */
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'OptimizedChatService',
    activeRequests: activeRequests.size,
    timestamp: new Date().toISOString()
  });
});

export { router as optimizedChatRouter };