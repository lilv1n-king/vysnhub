/**
 * Optimierte Chat Service Implementation
 * 
 * Performance-Optimierungen:
 * 1. Parallelisierung der GPT-Calls
 * 2. Kürzere Prompts 
 * 3. Caching für häufige Anfragen
 * 4. Streaming für längere Antworten
 */

import { GPTService } from './gptService';
import { ProductService } from './productService';
import { AgentService } from './agentService';
import { 
  extractIPFromMessage, 
  extractLuminaireType, 
  isLuminaireRequest
} from '../utils/productSearchUtils';
import { searchBySDCM, isSDCMRequest } from '../utils/sdcmUtils';
import { extractCCTFromMessage, isCCTSwitchRequested, isCCTRequest, isDimToWarmRequested, isDimmableRequested } from '../utils/cctUtils';
import { isCategoryOverviewRequest, getTrackSystemOverview, formatCategoryOverview } from '../utils/categoryUtils';
import { isLEDStripRequest, searchLEDStrips } from '../utils/ledStripUtils';


interface CachedResult {
  products: any[];
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export class OptimizedChatService {
  private gptService: GPTService;
  private productService: ProductService;
  private agentService: AgentService;
  private cache: Map<string, CachedResult> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.gptService = new GPTService();
    this.productService = new ProductService();
    this.agentService = new AgentService();
  }

  /**
   * Optimierte Nachrichtenverarbeitung
   */
  async processMessage(message: string, context?: string[]): Promise<{
    response: string;
    products?: any[];
    suggestedFollowUps?: string[];
    metadata?: any;
  }> {
    const startTime = Date.now();
    
    try {
      // 0. KONTEXT-RELEVANZ: Lass GPT entscheiden ob vorheriger Kontext relevant ist
      const relevantContext = await this.filterRelevantContext(message, context);
      console.log(`DEBUG: Original context: ${context?.length || 0} messages, Relevant: ${relevantContext.length} messages`);
      
      // 1. FAST PATH: Direkte Pattern-Erkennung ohne GPT
      const fastResult = await this.tryFastPath(message, relevantContext);
      if (fastResult) {
        console.log(`Fast path completed in ${Date.now() - startTime}ms`);
        return fastResult;
      }

      // 2. OPTIMIZED PATH: Parallele GPT-Calls  
      try {
        const optimizedResult = await this.tryOptimizedPath(message, relevantContext);
        if (optimizedResult) {
          console.log(`Optimized path completed in ${Date.now() - startTime}ms`);
          return optimizedResult;
        }
        
        // Wenn kein Result aber auch kein technischer Fehler -> versuche einfache Textsuche
        console.log('No fast path found, trying simple text search...');
        const { simpleTextSearch } = await import('../utils/productSearchUtils');
        
        // Lass GPT die relevanten Suchbegriffe aus der Frage extrahieren
        const extractedSearchTerm = await this.extractSearchTermWithGPT(message);
        console.log(`DEBUG: GPT extracted search term: "${extractedSearchTerm}" from: "${message}"`);
        
        const textSearchResult = await simpleTextSearch(extractedSearchTerm, 20, false);
        
        if (textSearchResult.products.length > 0) {
          const agentResponse = await this.agentService.processRequest(
            'produktempfehlung',
            message,
            textSearchResult.products,
            []
          );
          
          return {
            response: agentResponse.content,
            products: textSearchResult.products,
            suggestedFollowUps: agentResponse.suggestedFollowUps,
            metadata: {
              ...agentResponse.metadata,
              simpleTextSearch: true,
              requestType: 'produktempfehlung'
            }
          };
        }
        
        // Nur als letzter Ausweg einen Fehler werfen
        throw new Error('Keine passenden Produkte gefunden. Bitte präzisieren Sie Ihre Anfrage.');
        
      } catch (technicalError: any) {
        // Bei technischen Fehlern (OpenAI quota, etc.) -> Fallback verwenden
        if (technicalError.message?.includes('quota') || technicalError.message?.includes('Klassifizierung fehlgeschlagen')) {
          console.log('Technical error occurred, using fallback path:', technicalError.message);
          return this.fallbackPath(message, relevantContext);
        }
        // Andere Fehler weiterwerfen
        throw technicalError;
      }
      
    } catch (error) {
      console.error('Fehler in OptimizedChatService:', error);
      throw error;
    }
  }

  /**
   * Fast Path: Direkte Pattern-Erkennung ohne GPT-Klassifizierung
   */
  private async tryFastPath(message: string, context?: string[]): Promise<any> {
    const cacheKey = this.generateCacheKey(message, context);
    
    // 1. Cache Check (temporär deaktiviert für Debugging)
    // const cached = this.getFromCache(cacheKey);
    // if (cached) {
    //   console.log('Cache hit!');
    //   return cached;
    // }

    const messageLower = message.toLowerCase();
    
    // 2. Direkte Pattern-Erkennung für häufige Anfragen
    // Erweitere Nachricht um Kontext für bessere Erkennung
    const contextString = context && context.length > 0 
      ? context.slice(-2).join(' ') // Letzten 2 Kontext-Nachrichten
      : '';
    
    // Extrahiere aus aktueller Nachricht UND Kontext
    console.log('DEBUG: About to call extractLuminaireType with:', message);
    let luminaireType = extractLuminaireType(message) || extractLuminaireType(contextString);
    console.log('DEBUG: extractLuminaireType result:', luminaireType);
    
    let ipClass = extractIPFromMessage(message) || extractIPFromMessage(contextString);
    let isLuminaireReq = isLuminaireRequest(message) || isLuminaireRequest(contextString);
    let cct = extractCCTFromMessage(message) || extractCCTFromMessage(contextString);
    let cctSwitchRequested = isCCTSwitchRequested(message) || isCCTSwitchRequested(contextString);
    
    // LED Strip und spezielle CCT-Features
    let isLEDStripReq = isLEDStripRequest(message) || isLEDStripRequest(contextString);
    let dimToWarm = isDimToWarmRequested(message) || isDimToWarmRequested(contextString);
    let dimmable = isDimmableRequested(message) || isDimmableRequested(contextString);
    
    console.log('DEBUG: Message:', message);
    console.log('DEBUG: Context:', contextString);
    console.log('DEBUG: Extracted - luminaire:', luminaireType, 'cct:', cct, 'ip:', ipClass);
    console.log('DEBUG: Special features - ledStrip:', isLEDStripReq, 'dimToWarm:', dimToWarm, 'dimmable:', dimmable);
    
    // Produktfrage Pattern (z.B. "ist salsa lid dimmbar", "ist mezy s gut fürs wohnzimmer")
    // WICHTIG: Produktfragen sind kontextlos - ignoriere vorherigen Kontext
    const { isProductQuestion } = await import('../utils/productQuestionUtils');
    const productQuestion = isProductQuestion(message);
    if (productQuestion.isQuestion) {
      console.log('Fast path: Product question detected (context-free):', productQuestion);
      // Bei Produktfragen KEINEN Kontext verwenden - das ist eine neue, spezifische Frage
      return this.handleProductQuestion(productQuestion, message, [], cacheKey);
    }
    
    // LED Strip Pattern (z.B. "led strip", "led strip dim to warm")
    if (isLEDStripReq) {
      console.log('Fast path: LED Strip request detected');
      return this.handleLEDStripRequest(message, context, cacheKey);
    }

    
    // Kategorie-Übersicht Pattern (z.B. "habt ihr schienensysteme", "welche track systems")
    const categoryType = isCategoryOverviewRequest(message);
    if (categoryType) {
      console.log('Fast path: Category overview request detected:', categoryType);
      return this.handleCategoryOverviewRequest(categoryType, message, context, cacheKey);
    }
    
    // PRIORITÄT 1: Dim to Warm Pattern (höchste Priorität wenn explizit erwähnt)
    if (dimToWarm) {
      console.log('Fast path: Dim to Warm request detected');
      return this.handleDimToWarmRequest(message, context, cacheKey);
    }
    
    // PRIORITÄT 2: Spezifischer Leuchtentyp + CCT/CCT-Switch Pattern (z.B. "wandleuchte 3000k", "deckenleuchte cct switch")
    // Nur bei wirklich spezifischen Leuchtentypen, nicht bei generischen Begriffen
    if (luminaireType && luminaireType !== 'generic' && (cct || cctSwitchRequested)) {
      console.log('Fast path: Specific luminaire + CCT pattern detected');
      return this.handleLuminaireCCTRequest(luminaireType, cct || undefined, cctSwitchRequested, ipClass || undefined, message, context, cacheKey);
    }
    
    // PRIORITÄT 3: Nur spezifischer Leuchtentyp Pattern (z.B. "wandleuchte", "deckenleuchte") 
    // NICHT für generische "leuchte" - das ist zu unspezifisch
    if (luminaireType && luminaireType !== 'generic') {
      console.log('Fast path: Specific luminaire pattern detected');
      return this.handleSimpleLuminaireRequest(luminaireType, message, context, cacheKey);
    }
    
    // PRIORITÄT 4: IP + Spezifischer Leuchtentyp Pattern (z.B. "deckenleuchte ip44") - NUR wenn IP explizit erwähnt
    if (luminaireType && luminaireType !== 'generic' && ipClass) {
      console.log('Fast path: Specific luminaire + IP pattern detected');
      return this.handleLuminaireIPRequest(luminaireType, ipClass, message, context, cacheKey);
    }
    
    // PRIORITÄT 5: Nur IP Pattern (z.B. "ip44 leuchten") - NUR wenn IP explizit erwähnt
    if (ipClass && isLuminaireReq) {
      console.log('Fast path: General luminaire + IP pattern detected');
      return this.handleGeneralIPRequest(ipClass, message, context, cacheKey);
    }
    
    // Häufige Standardfragen
    if (this.isStandardQuestion(messageLower)) {
      console.log('Fast path: Standard question detected');
      return this.handleStandardQuestion(messageLower, cacheKey);
    }
    
    return null; // Kein Fast Path möglich
  }

  /**
   * Optimized Path: Parallelisierte GPT-Calls mit kürzeren Prompts
   */
  private async tryOptimizedPath(message: string, context?: string[]): Promise<any> {
    try {
      // Parallelisiere Klassifizierung und SQL-Generierung
      const [classification, products] = await Promise.all([
        this.gptService.classifyRequest(message, context),
        this.tryDirectDatabaseSearch(message) // Versuche direkte DB-Suche
      ]);

      if (products && products.length > 0) {
        // Wenn direkte DB-Suche erfolgreich, generiere nur die Antwort
        const agentResponse = await this.agentService.processRequest(
          classification.type,
          message,
          products,
          context
        );

        return {
          response: agentResponse.content,
          products: products,
          suggestedFollowUps: agentResponse.suggestedFollowUps,
          metadata: {
            ...agentResponse.metadata,
            optimizedPath: true,
            requestType: classification.type
          }
        };
      }
    } catch (error) {
      console.warn('Optimized path failed, falling back:', error instanceof Error ? error.message : error);
    }
    
    return null;
  }

  /**
   * Fallback: Originaler Weg (langsam aber sicher)
   */
  private async fallbackPath(message: string, context?: string[]): Promise<any> {
    console.log('Using fallback path (full GPT pipeline)');
    
    // Original implementation
    const classification = await this.gptService.classifyRequest(message, context);
    const sqlResult = await this.gptService.generateSQLQuery(message, classification.type, context);
    const products = await this.productService.searchProducts(sqlResult.query, sqlResult.parameters, message);
    
    const agentResponse = await this.agentService.processRequest(
      classification.type,
      message,
      products,
      context
    );

    return {
      response: agentResponse.content,
      products: products,
      suggestedFollowUps: agentResponse.suggestedFollowUps,
      metadata: {
        ...agentResponse.metadata,
        fallbackPath: true,
        requestType: classification.type,
        sqlQuery: sqlResult.query
      }
    };
  }

  /**
   * Versucht direkte Datenbanksuche ohne SQL-Generierung
   */
  private async tryDirectDatabaseSearch(message: string): Promise<any[]> {
    const luminaireType = extractLuminaireType(message);
    const ipClass = extractIPFromMessage(message);
    const isLuminaireReq = isLuminaireRequest(message);
    const cct = extractCCTFromMessage(message);
    const cctSwitchRequested = isCCTSwitchRequested(message);
    
    // Leuchtentyp + CCT/CCT-Switch (häufigste Anfrage)
    if (luminaireType && (cct || cctSwitchRequested)) {
      const { searchByLuminaireType } = await import('../utils/productSearchUtils');
      const result = await searchByLuminaireType(
        luminaireType, 
        ipClass || undefined, // nur wenn explizit gefordert
        cct || undefined, 
        cctSwitchRequested ? '3000' : undefined // Fallback für Switch
      );
      return result.products;
    }
    
    // Leuchtentyp + IP (nur wenn IP explizit gefordert)
    if (luminaireType && ipClass) {
      const { searchByLuminaireType } = await import('../utils/productSearchUtils');
      const result = await searchByLuminaireType(luminaireType, ipClass);
      return result.products;
    }
    
    // Nur Leuchtentyp (häufigste Anfrage)
    if (luminaireType) {
      const { searchByLuminaireType } = await import('../utils/productSearchUtils');
      const result = await searchByLuminaireType(luminaireType);
      return result.products;
    }
    
    // IP-only (nur wenn explizit gefordert)
    if (ipClass && isLuminaireReq) {
      const { searchByIPProtection } = await import('../utils/productSearchUtils');
      const result = await searchByIPProtection(ipClass, true);
      return result.products;
    }
    
    return [];
  }

  /**
   * Behandelt spezifische Leuchtentyp + IP Anfragen
   */
  private async handleLuminaireIPRequest(
    luminaireType: string, 
    ipClass: string, 
    message: string, 
    context?: string[],
    cacheKey?: string
  ): Promise<any> {
    const { searchByLuminaireType } = await import('../utils/productSearchUtils');
    const result = await searchByLuminaireType(luminaireType, ipClass);
    
    // Schnelle Template-basierte Antwort
    const response = this.generateQuickResponse(luminaireType, ipClass, result.products);
    
    const finalResult = {
      response,
      products: result.products,
      suggestedFollowUps: [
        `Zeigen Sie mir Details zu einem dieser ${luminaireType} Produkte`,
        `Gibt es günstigere Alternativen?`,
        `Was sind die wichtigsten Unterschiede?`
      ],
      metadata: {
        fastPath: true,
        luminaireType,
        ipClass,
        productCount: result.products.length
      }
    };

    if (cacheKey) {
      this.setCache(cacheKey, finalResult);
    }

    return finalResult;
  }

  /**
   * Behandelt allgemeine IP-Anfragen
   */
  private async handleGeneralIPRequest(
    ipClass: string, 
    message: string, 
    context?: string[],
    cacheKey?: string
  ): Promise<any> {
    const { searchByIPProtection } = await import('../utils/productSearchUtils');
    const result = await searchByIPProtection(ipClass, true);
    
    const response = this.generateQuickIPResponse(ipClass, result.products);
    
    const finalResult = {
      response,
      products: result.products,
      suggestedFollowUps: [
        `Welche dieser Leuchten eignen sich für ${ipClass === 'IP44' ? 'Badezimmer' : 'Außenbereich'}?`,
        `Zeigen Sie mir die günstigsten Optionen`,
        `Was sind die beliebtesten Modelle?`
      ],
      metadata: {
        fastPath: true,
        ipClass,
        productCount: result.products.length
      }
    };

    if (cacheKey) {
      this.setCache(cacheKey, finalResult);
    }

    return finalResult;
  }

  /**
   * Behandelt Produktfragen (spezifische Fragen zu konkreten Produkten)
   */
  private async handleProductQuestion(
    productQuestion: { productName?: string; questionType?: string },
    message?: string, 
    context?: string[],
    cacheKey?: string
  ): Promise<any> {
    try {
      if (!productQuestion.productName) {
        return null;
      }
      
      console.log(`Suche Produkt: ${productQuestion.productName} für Frage-Typ: ${productQuestion.questionType}`);
      
      const { findSpecificProduct } = await import('../utils/productQuestionUtils');
      const result = await findSpecificProduct(productQuestion.productName);
      
      if (!result.found || result.products.length === 0) {
        return {
          response: `Entschuldigung, ich konnte kein Produkt namens "${productQuestion.productName}" finden. Können Sie den Namen nochmal prüfen?`,
          products: [],
          suggestedFollowUps: [
            'Zeig mir ähnliche Produkte',
            'Wie heißt das Produkt genau?',
            'Welche Produktkategorien gibt es?'
          ],
          metadata: {
            fastPath: true,
            productQuestion: true,
            searchTerm: productQuestion.productName,
            found: false,
            questionType: productQuestion.questionType,
            timestamp: new Date().toISOString(),
            optimized: true
          }
        };
      }
      
      // Nehme das beste Match (erstes Ergebnis)
      const product = result.products[0];
      const { answerProductQuestion } = await import('../utils/productQuestionUtils');
      const answer = answerProductQuestion(
        product, 
        productQuestion.questionType || 'general', 
        message || ''
      );
      
      return {
        response: answer,
        products: [product], // Zeige das gefundene Produkt
        suggestedFollowUps: [
          'Weitere Eigenschaften zeigen',
          'Ähnliche Produkte finden',
          'Preisvergleich anzeigen'
        ],
        metadata: {
          fastPath: true,
          productQuestion: true,
          searchTerm: productQuestion.productName,
          found: true,
          questionType: productQuestion.questionType,
          productName: product.vysn_name,
          timestamp: new Date().toISOString(),
          optimized: true
        }
      };
      
    } catch (error) {
      console.error('Fehler bei Produktfrage:', error);
      return null;
    }
  }

  /**
   * Behandelt Dim to Warm Anfragen
   */
  private async handleDimToWarmRequest(
    message?: string, 
    context?: string[],
    cacheKey?: string
  ): Promise<any> {
    try {
      console.log('Handling Dim to Warm request');
      
      // Suche nach dim to warm Produkten
      const { searchByCCT } = await import('../utils/cctUtils');
      const result = await searchByCCT(undefined, false, { dimToWarm: true, dimmable: true }); // dimToWarm = true
      
      // Intelligente Produktauswahl
      let finalProducts = result.products;
      let productLimit = Math.min(8, result.products.length);
      
      if (message?.toLowerCase().includes('günstig')) {
        finalProducts = result.products.sort((a, b) => (a.gross_price || 999999) - (b.gross_price || 999999));
        productLimit = Math.min(6, result.products.length);
      }
      
      const selectedProducts = finalProducts.slice(0, productLimit);
      
      console.log(`DEBUG: Dim to Warm search - found ${result.products.length}, showing ${selectedProducts.length}`);
      
      if (selectedProducts.length === 0) {
        return {
          response: 'Entschuldigung, wir haben derzeit keine Dim-to-Warm Leuchten im Sortiment. Diese Funktion ermöglicht es, die Farbtemperatur beim Dimmen von kaltweiß zu warmweiß zu ändern.',
          products: [],
          suggestedFollowUps: [
            'Zeig mir dimmbare Leuchten',
            'Welche CCT-Switch Leuchten gibt es?',
            'Was bedeutet Dim to Warm?'
          ],
          metadata: {
            fastPath: true,
            dimToWarm: true,
            productCount: 0,
            timestamp: new Date().toISOString(),
            optimized: true
          }
        };
      }
      
      const response = await this.agentService.processRequest(
        'produktempfehlung',
        message || 'Dim to Warm Leuchten',
        selectedProducts,
        context
      );

      const result_obj = {
        response: response.content,
        products: selectedProducts,
        suggestedFollowUps: response.suggestedFollowUps,
        metadata: {
          ...response.metadata,
          fastPath: true,
          dimToWarm: true,
          productCount: result.products.length,
          messageLength: message?.length || 0,
          contextLength: context?.length || 0,
          timestamp: new Date().toISOString(),
          responseTime: result.responseTime,
          optimized: true
        }
      };

      if (cacheKey) {
        this.setCache(cacheKey, result_obj);
      }

      return result_obj;
      
    } catch (error) {
      console.error('Fehler bei Dim to Warm Anfrage:', error);
      return null;
    }
  }

  /**
   * Behandelt Kategorie-Übersicht Anfragen
   */
  private async handleCategoryOverviewRequest(
    categoryType: string,
    message?: string, 
    context?: string[],
    cacheKey?: string
  ): Promise<any> {
    try {
      let overview;
      
      if (categoryType === 'track_systems') {
        overview = await getTrackSystemOverview();
      } else {
        // Weitere Kategorie-Typen können hier hinzugefügt werden
        return null;
      }
      
      const response = formatCategoryOverview(overview);
      
      const result = {
        response,
        products: [], // Keine spezifischen Produkte, da es eine Übersicht ist
        suggestedFollowUps: [
          'Zeig mir 1-Phasen Schienensysteme',
          'Zeig mir 3-Phasen Schienensysteme',
          'Was sind die Unterschiede?'
        ],
        metadata: {
          fastPath: true,
          categoryType,
          totalCategories: overview.categories.length,
          totalProducts: overview.totalProducts,
          messageLength: message?.length || 0,
          contextLength: context?.length || 0,
          timestamp: new Date().toISOString(),
          optimized: true
        }
      };

      if (cacheKey) {
        this.setCache(cacheKey, result);
      }

      return result;
      
    } catch (error) {
      console.error('Fehler bei Kategorie-Übersicht:', error);
      return null;
    }
  }

  /**
   * Behandelt LED Strip Anfragen
   */
  private async handleLEDStripRequest(
    message?: string, 
    context?: string[],
    cacheKey?: string
  ): Promise<any> {
    try {
      const { extractLEDStripParams } = await import('../utils/ledStripUtils');
      const params = extractLEDStripParams(message || '');
      
      const result = await searchLEDStrips(
        params.searchTerm,
        params.dimToWarm,
        params.dimmable,
        params.cct
      );
      
      // Intelligente Produktauswahl
      let finalProducts = result.products;
      let productLimit = Math.min(8, result.products.length);
      
      if (message?.toLowerCase().includes('günstig')) {
        finalProducts = result.products.sort((a, b) => (a.gross_price || 999999) - (b.gross_price || 999999));
        productLimit = Math.min(6, result.products.length);
      }
      
      const selectedProducts = finalProducts.slice(0, productLimit);
      
      console.log(`DEBUG: LED Strip search - found ${result.products.length}, showing ${selectedProducts.length}`);
      
      const response = await this.agentService.processRequest(
        'produktempfehlung',
        message || 'LED Strip request',
        selectedProducts,
        context
      );

      return {
        response: response.content,
        products: selectedProducts,
        suggestedFollowUps: response.suggestedFollowUps,
        metadata: {
          ...response.metadata,
          fastPath: true,
          ledStripRequest: true,
          ...params,
          productCount: result.products.length,
          messageLength: message?.length || 0,
          contextLength: context?.length || 0,
          timestamp: new Date().toISOString(),
          responseTime: 0,
          optimized: true
        }
      };
      
    } catch (error) {
      console.error('Fehler bei LED Strip Anfrage:', error);
      return null;
    }
  }

  /**
   * Behandelt Leuchtentyp + CCT/CCT-Switch Anfragen
   */
  private async handleLuminaireCCTRequest(
    luminaireType: string, 
    cct?: number,
    cctSwitchRequested?: boolean,
    ipClass?: string,
    message?: string, 
    context?: string[],
    cacheKey?: string
  ): Promise<any> {
    const { searchByLuminaireType } = await import('../utils/productSearchUtils');
    
    const result = await searchByLuminaireType(
      luminaireType, 
      ipClass, // nur wenn explizit gefordert
      cct, 
      cctSwitchRequested ? '3000' : undefined // Fallback für Switch-Anfragen
    );
    
    // Intelligente Produktauswahl und Sortierung
    let finalProducts = result.products;
    let productLimit = Math.min(8, result.products.length);
    
    if (message?.toLowerCase().includes('günstig')) {
      finalProducts = result.products.sort((a, b) => (a.gross_price || 999999) - (b.gross_price || 999999));
      productLimit = Math.min(6, result.products.length);
    }
    
    const selectedProducts = finalProducts.slice(0, productLimit);
    
    console.log(`DEBUG: Calling agentService with ${selectedProducts.length} of ${result.products.length} products`);
    
    const response = await this.agentService.processRequest(
      'produktempfehlung',
      message || 'CCT luminaire request',
      selectedProducts,
      context
    );

    return {
      response: response.content, // AgentService gibt { content, suggestedFollowUps, metadata } zurück
      products: selectedProducts, // Zeige die tatsächlich verwendeten Produkte
      suggestedFollowUps: response.suggestedFollowUps,
      metadata: {
        ...response.metadata,
        fastPath: true,
        luminaireType,
        cct,
        cctSwitchRequested,
        ipClass,
        productCount: result.products.length,
        messageLength: message?.length || 0,
        contextLength: context?.length || 0,
        timestamp: new Date().toISOString(),
        responseTime: 0,
        optimized: true
      }
    };
  }

  /**
   * Behandelt einfache Leuchtentyp-Anfragen ohne spezielle Filter
   */
  private async handleSimpleLuminaireRequest(
    luminaireType: string, 
    message?: string, 
    context?: string[],
    cacheKey?: string
  ): Promise<any> {
    const { searchByLuminaireType } = await import('../utils/productSearchUtils');
    
    const result = await searchByLuminaireType(luminaireType);
    
    // Intelligente Produktauswahl
    let finalProducts = result.products;
    let productLimit = Math.min(8, result.products.length);
    
    if (message?.toLowerCase().includes('günstig')) {
      finalProducts = result.products.sort((a, b) => (a.gross_price || 999999) - (b.gross_price || 999999));
      productLimit = Math.min(6, result.products.length);
    }
    
    const selectedProducts = finalProducts.slice(0, productLimit);
    
    console.log(`DEBUG: Calling agentService with ${selectedProducts.length} of ${result.products.length} products`);
    
    const response = await this.agentService.processRequest(
      'produktempfehlung',
      message || 'Simple luminaire request',
      selectedProducts,
      context
    );

    return {
      response: response.content, // AgentService gibt { content, suggestedFollowUps, metadata } zurück
      products: selectedProducts,
      suggestedFollowUps: response.suggestedFollowUps,
      metadata: {
        ...response.metadata,
        fastPath: true,
        luminaireType,
        productCount: result.products.length,
        messageLength: message?.length || 0,
        contextLength: context?.length || 0,
        timestamp: new Date().toISOString(),
        responseTime: 0,
        optimized: true
      }
    };
  }

  /**
   * Generiert schnelle Template-basierte Antworten
   */
  private generateQuickResponse(luminaireType: string, ipClass: string, products: any[], userMessage?: string): string {
    const typeNames = {
      ceiling: 'Deckenleuchten',
      wall: 'Wandleuchten', 
      floor: 'Stehleuchten',
      pendant: 'Pendelleuchten',
      table: 'Tischleuchten',
      outdoor: 'Außenleuchten'
    };

    const typeName = typeNames[luminaireType as keyof typeof typeNames] || 'Leuchten';
    
    if (products.length === 0) {
      return `Leider habe ich keine ${typeName} mit mindestens ${ipClass} Schutz gefunden. Möchten Sie nach ähnlichen Produkten suchen?`;
    }

    // Analysiere die Anfrage für intelligente Produktauswahl
    let productSelection = products;
    let productLimit = 8; // Zeige mehr Produkte
    
    // Wenn nach "günstigere" gefragt wird, nach Preis sortieren
    if (userMessage && userMessage.toLowerCase().includes('günstig')) {
      productSelection = products.sort((a, b) => (a.gross_price || 999999) - (b.gross_price || 999999));
      productLimit = Math.min(6, products.length); // Mehr günstige Optionen zeigen
    }
    
    const topProducts = productSelection.slice(0, productLimit);
    let response = `Hier sind ${products.length} ${typeName} mit mindestens ${ipClass} Schutz:\n\n`;
    
    topProducts.forEach((product, index) => {
      const price = product.gross_price ? `${product.gross_price}€` : 'Preis auf Anfrage';
      const ip = product.ingress_protection || 'IP nicht angegeben';
      
      response += `${index + 1}. **${product.vysn_name || product.short_description}** (${ip}) - ${price}\n`;
      if (product.short_description) {
        response += `   ${product.short_description}\n`;
      }
      response += '\n';
    });

    if (products.length > 3) {
      response += `... und ${products.length - 3} weitere Optionen.`;
    }

    return response;
  }

  /**
   * Generiert schnelle IP-basierte Antworten
   */
  private generateQuickIPResponse(ipClass: string, products: any[]): string {
    if (products.length === 0) {
      return `Leider habe ich keine Leuchten mit mindestens ${ipClass} Schutz gefunden.`;
    }

    // Intelligente Produktauswahl basierend auf Anfrage
    let displayProducts = products;
    let displayLimit = Math.min(6, products.length);
    
    // Preis-Sortierung (falls verfügbar)
    displayProducts = products.sort((a, b) => (a.gross_price || 999999) - (b.gross_price || 999999));
    
    return `Ich habe ${products.length} Leuchten mit mindestens ${ipClass} Schutz gefunden. Diese eignen sich für ${ipClass === 'IP44' ? 'Feuchträume wie Badezimmer' : 'den Außenbereich'}.\n\n${displayProducts.slice(0, displayLimit).map((p, i) => 
      `${i + 1}. ${p.vysn_name || p.short_description} (${p.ingress_protection}) - ${p.gross_price || 'Preis'}€`
    ).join('\n')}`;
  }

  /**
   * Prüft auf häufige Standardfragen
   */
  private isStandardQuestion(message: string): boolean {
    const standardPatterns = [
      'was ist', 'was bedeutet', 'erkläre mir', 'unterschied zwischen',
      'welche', 'warum', 'wie funktioniert', 'wo verwende ich'
    ];
    
    return standardPatterns.some(pattern => message.includes(pattern));
  }

  /**
   * Behandelt Standardfragen mit vorgefertigten Antworten
   */
  private async handleStandardQuestion(message: string, cacheKey?: string): Promise<any> {
    // Hier könnten vorgefertigte Antworten für häufige Fragen stehen
    const standardAnswers = {
      'ip schutzklasse': 'IP-Schutzklassen geben an, wie gut ein Gerät gegen Eindringen von Fremdkörpern und Feuchtigkeit geschützt ist...',
      'unterschied warmweiß kaltweiß': 'Warmweiß (2700-3500K) erzeugt eine gemütliche Atmosphäre, Kaltweiß (5000-6500K) ist heller und konzentrationsfördernder...'
    };

    // Pattern matching für Standardantworten
    for (const [pattern, answer] of Object.entries(standardAnswers)) {
      if (message.includes(pattern)) {
        const result = {
          response: answer,
          metadata: { standardAnswer: true, pattern },
          suggestedFollowUps: ['Haben Sie weitere Fragen?', 'Soll ich Ihnen passende Produkte zeigen?']
        };
        
        if (cacheKey) {
          this.setCache(cacheKey, result);
        }
        
        return result;
      }
    }
    
    return null;
  }

  /**
   * Cache-Management
   */
  private generateCacheKey(message: string, context?: string[]): string {
    const contextKey = context ? context.slice(-2).join('|') : '';
    return `${message.toLowerCase().slice(0, 50)}:${contextKey}`;
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.products;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      products: data,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL
    });
  }

  /**
   * Cache-Cleanup (sollte regelmäßig aufgerufen werden)
   */
  public cleanupCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Verwendet GPT um zu entscheiden welcher Kontext noch relevant ist
   */
  private async filterRelevantContext(message: string, context?: string[]): Promise<string[]> {
    if (!context || context.length === 0) {
      return [];
    }

    // Nur die letzten 3 Nachrichten betrachten für Performance
    const recentContext = context.slice(-3);
    
    const prompt = `Analysiere ob der vorherige Kontext für die neue Frage relevant ist.

NEUE FRAGE: "${message}"

VORHERIGER KONTEXT:
${recentContext.map((msg, i) => `${i + 1}. ${msg}`).join('\n')}

Entscheide für jede Kontext-Nachricht:
- RELEVANT: Wenn sie mit der neuen Frage zusammenhängt
- IRRELEVANT: Wenn sie ein komplett anderes Thema behandelt

Beispiele:
- Kontext "LED Strips" + Neue Frage "ist mezy s gut" → IRRELEVANT (verschiedene Produkte)
- Kontext "Deckenleuchten" + Neue Frage "welche sind dimmbar" → RELEVANT (gleiches Thema)
- Kontext "3000K Leuchten" + Neue Frage "gibt es auch 4000K" → RELEVANT (ähnliches Thema)

Antworte nur mit den NUMMERN der relevanten Nachrichten (z.B. "1,3" oder "keine"):`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 20,
          temperature: 0.1
        })
      });

      const data = await response.json();
      const relevantNumbers = data.choices?.[0]?.message?.content?.trim() || '';
      
      console.log(`DEBUG: GPT context relevance decision: "${relevantNumbers}"`);
      
      if (relevantNumbers.toLowerCase().includes('keine')) {
        return [];
      }
      
              // Parse Nummern (z.B. "1,3" → [0,2] für Array-Indizes) 
        const numbers = relevantNumbers.split(',')
          .map((n: string) => parseInt(n.trim()) - 1)
          .filter((n: number) => n >= 0 && n < recentContext.length);
        
        return numbers.map((i: number) => recentContext[i]);
      
    } catch (error) {
      console.error('GPT context filtering failed:', error);
      // Fallback: Verwende nur die letzte Nachricht wenn GPT fehlschlägt
      return context.slice(-1);
    }
  }

  /**
   * Verwendet GPT um relevante Suchbegriffe aus einer Nachricht zu extrahieren
   */
  private async extractSearchTermWithGPT(message: string): Promise<string> {
    const prompt = `Extrahiere die wichtigsten Suchbegriffe aus dieser Nachricht für eine Produktsuche.

Beispiele:
- "ist mezy s gut fürs wohnzimer" → "mezy s"
- "wie ist das neue produkt xyz" → "xyz" 
- "kennt ihr den tevo downlight?" → "tevo downlight"
- "was haltet ihr von salsa lid" → "salsa lid"
- "ich brauche eine deckenleuchte" → "deckenleuchte"
- "LED strips für indirektes licht" → "LED strips"
- "gibt es wandleuchten in weiß" → "wandleuchten weiß"

Regel: Extrahiere NUR die relevanten Produkt-/Suchbegriffe, keine Füllwörter.

Nachricht: "${message}"
Suchbegriffe:`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 50,
          temperature: 0.1
        })
      });

      const data = await response.json();
      const extractedTerm = data.choices?.[0]?.message?.content?.trim() || message;
      
      return extractedTerm;
    } catch (error) {
      console.error('GPT search term extraction failed:', error);
      // Fallback auf ursprüngliche Message
      return message;
    }
  }
}