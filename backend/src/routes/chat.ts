import { Router, Request, Response } from 'express';
import { GPTService } from '../services/gptService';
import { AgentService } from '../services/agentService';
import { ProductService } from '../services/productService';
import { ChatService } from '../services/chatService';
import { Product } from '../config/database';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateChatMessage, userRateLimit } from '../middleware/securityValidation';

const router = Router();

// ⚠️ SICHERHEIT: Alle Chat-Endpunkte benötigen jetzt Authentifizierung
router.use(authenticateToken);

const gptService = new GPTService();
const agentService = new AgentService();
const productService = new ProductService();
const chatService = new ChatService();

interface ChatRequest {
  message: string;
  sessionId?: string;
}

interface ChatResponse {
  response: string;
  sessionId: string;
  requestType: string;
  suggestedFollowUps?: string[];
  metadata?: Record<string, any>;
}

/**
 * POST /api/chat/message
 * Hauptendpoint für Chat-Nachrichten
 */
router.post('/message', userRateLimit(50, 15 * 60 * 1000), validateChatMessage, async (req: Request, res: Response) => {
  try {
    const { message, sessionId: inputSessionId }: ChatRequest = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Nachricht darf nicht leer sein'
      });
    }

    // Session-Management
    let sessionId = inputSessionId;
    if (!sessionId || !(await chatService.sessionExists(sessionId))) {
      sessionId = await chatService.createSession();
    }

    // Chat-Verlauf laden für Kontext
    const chatHistory = await chatService.getChatHistory(sessionId);
    const context = chatService.extractContext(chatHistory);

    // Benutzer-Nachricht speichern
    await chatService.saveMessage({
      session_id: sessionId,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    // 1. Anfrage klassifizieren
    console.log('Klassifiziere Anfrage...');
    const classification = await gptService.classifyRequest(message, context);
    console.log('Klassifizierung:', classification);

    // 2. SQL-Query generieren
    console.log('Generiere SQL-Query...');
    const sqlResult = await gptService.generateSQLQuery(message, classification.type, context);
    console.log('SQL-Query:', sqlResult);

    // 3. Produkte suchen
    console.log('Suche Produkte...');
    let products: Product[] = [];
    try {
      products = await productService.searchProducts(sqlResult.query, sqlResult.parameters, message);
    } catch (dbError) {
      console.warn('SQL-Query fehlgeschlagen, verwende einfache Suche:', dbError);
      // Fallback: Einfache Textsuche
      const searchTerms = message.toLowerCase().split(' ').filter(term => term.length > 2);
      if (searchTerms.length > 0) {
        products = await productService.simpleSearch(searchTerms[0]);
      }
    }
    console.log(`${products.length} Produkte gefunden`);

    // 4. Agent-Antwort generieren
    console.log('Generiere Agent-Antwort...');
    const agentResponse = await agentService.processRequest(
      classification.type,
      message,
      products,
      context
    );

    // 5. Assistant-Antwort speichern
    await chatService.saveMessage({
      session_id: sessionId,
      role: 'assistant',
      content: agentResponse.content,
      timestamp: new Date().toISOString(),
      request_type: classification.type,
      sql_query: sqlResult.query,
      metadata: {
        ...agentResponse.metadata,
        classification: classification,
        sqlExplanation: sqlResult.explanation
      }
    });

    // Session-Aktivität aktualisieren
    await chatService.updateSessionActivity(sessionId);

    const response: ChatResponse = {
      response: agentResponse.content,
      sessionId: sessionId,
      requestType: classification.type,
      suggestedFollowUps: agentResponse.suggestedFollowUps,
      metadata: {
        confidence: classification.confidence,
        productCount: products.length,
        reasoning: classification.reasoning
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Fehler bei der Chat-Verarbeitung:', error);
    
    // Benutzerfreundliche Fehlermeldung speichern
    try {
      await chatService.saveMessage({
        session_id: 'error-session',
        role: 'assistant',
        content: 'Entschuldigung, ich kann Ihre Anfrage gerade nicht bearbeiten. Bitte kontaktieren Sie unseren Support für weitere Hilfe.',
        timestamp: new Date().toISOString(),
        request_type: 'produktfrage',
        metadata: {
          error: true,
          supportContact: true,
          originalError: error instanceof Error ? error.message : 'Unbekannter Fehler'
        }
      });
    } catch (saveError) {
      console.error('Fehler beim Speichern der Fehlermeldung:', saveError);
    }

    // Benutzerfreundliche API-Antwort
    res.status(200).json({
      response: 'Entschuldigung, ich kann Ihre Anfrage gerade nicht bearbeiten. Bitte kontaktieren Sie unseren Support für weitere Hilfe.',
      sessionId: 'error-session',
      requestType: 'error',
      supportContact: true,
      metadata: {
        error: true,
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * POST /api/chat/session
 * Erstellt eine neue Chat-Session
 */
router.post('/session', async (req: Request, res: Response) => {
  try {
    const sessionId = await chatService.createSession();
    res.json({ sessionId });
  } catch (error) {
    console.error('Fehler beim Erstellen der Session:', error);
    res.status(500).json({
      error: 'Session konnte nicht erstellt werden'
    });
  }
});

/**
 * GET /api/chat/history/:sessionId
 * Lädt den Chat-Verlauf für eine Session
 */
router.get('/history/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!(await chatService.sessionExists(sessionId))) {
      return res.status(404).json({
        error: 'Session nicht gefunden'
      });
    }

    const history = await chatService.getChatHistory(sessionId, limit);
    res.json({ history });
  } catch (error) {
    console.error('Fehler beim Laden des Chat-Verlaufs:', error);
    res.status(500).json({
      error: 'Chat-Verlauf konnte nicht geladen werden'
    });
  }
});

export { router as chatRouter }; 