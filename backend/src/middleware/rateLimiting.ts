/**
 * ⚠️ RATE LIMITING für VYSN App Backend
 * 
 * Implementiert verschiedene Rate-Limiting-Strategien zum Schutz vor:
 * - DDoS-Angriffen
 * - Brute-Force-Attacken  
 * - API-Missbrauch
 * - Resource-Erschöpfung
 */

import { Request, Response, NextFunction } from 'express';
import { setRateLimitHeaders } from './securityHeaders';

// In-Memory-Store (in Produktion: Redis verwenden!)
interface RateLimitData {
  count: number;
  resetTime: number;
  firstRequestTime: number;
}

const rateLimitStore = new Map<string, RateLimitData>();
const suspiciousIPs = new Set<string>();

/**
 * Generisches Rate-Limiting
 */
export function createRateLimit(options: {
  windowMs: number;     // Zeitfenster in Millisekunden
  maxRequests: number;  // Max. Requests pro Zeitfenster
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  onLimitReached?: (req: Request, res: Response) => void;
  message?: string;
}) {
  const {
    windowMs,
    maxRequests,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (req) => req.ip || 'unknown',
    message = 'Zu viele Anfragen. Versuchen Sie es später erneut.'
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyGenerator(req);
    const now = Date.now();
    
    // Hole oder erstelle Rate-Limit-Daten
    let data = rateLimitStore.get(key);
    
    if (!data || now > data.resetTime) {
      // Neues Zeitfenster
      data = {
        count: 0,
        resetTime: now + windowMs,
        firstRequestTime: now
      };
    }

    // Zähle Request
    data.count++;
    rateLimitStore.set(key, data);

    // Rate-Limit-Header setzen
    const remaining = Math.max(0, maxRequests - data.count);
    setRateLimitHeaders(maxRequests, remaining, data.resetTime)(req, res, () => {});

    // Limit überschritten?
    if (data.count > maxRequests) {
      // IP als verdächtig markieren
      if (req.ip) suspiciousIPs.add(req.ip);
      
      if (options.onLimitReached) {
        options.onLimitReached(req, res);
      }

      res.status(429).json({
        success: false,
        error: 'Rate Limit Exceeded',
        message,
        retryAfter: Math.ceil((data.resetTime - now) / 1000)
      });
      return;
    }

    // Response-Handler für Skip-Optionen
    if (skipSuccessfulRequests || skipFailedRequests) {
      const originalSend = res.send;
      res.send = function(body: any) {
        const statusCode = res.statusCode;
        
        if (
          (skipSuccessfulRequests && statusCode < 400) ||
          (skipFailedRequests && statusCode >= 400)
        ) {
          // Request nicht zählen
          data!.count--;
          rateLimitStore.set(key, data!);
        }
        
        return originalSend.call(this, body);
      };
    }

    next();
  };
}

/**
 * Standard-Rate-Limits für verschiedene Endpunkt-Typen
 */

// Allgemeines API-Rate-Limit
export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  maxRequests: 1000,
  message: 'Zu viele API-Anfragen. Limit: 1000 pro 15 Minuten.'
});

// Strenge Limits für sensible Endpunkte
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten  
  maxRequests: 10,
  skipSuccessfulRequests: true,
  message: 'Zu viele Login-Versuche. Limit: 10 pro 15 Minuten.'
});

// Chat/AI-Endpunkte (rechenintensiv)
export const chatRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 Minute
  maxRequests: 30,
  message: 'Zu viele Chat-Anfragen. Limit: 30 pro Minute.'
});

// Produktsuche (häufig verwendet)
export const searchRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 Minute
  maxRequests: 100,
  message: 'Zu viele Suchanfragen. Limit: 100 pro Minute.'
});

/**
 * Progressive Rate-Limiting
 * Erhöht Beschränkungen bei wiederholten Verstößen
 */
const violationCount = new Map<string, number>();

export const progressiveRateLimit = (baseLimit: number = 100) => {
  return createRateLimit({
    windowMs: 15 * 60 * 1000,
    maxRequests: baseLimit,
    keyGenerator: (req) => req.ip || 'unknown',
    onLimitReached: (req, res) => {
      const violations = violationCount.get(req.ip || 'unknown') || 0;
      violationCount.set(req.ip || 'unknown', violations + 1);
      
      // Log verdächtige Aktivität
      console.warn(`Rate limit violation #${violations + 1} for IP: ${req.ip || 'unknown'}`);
      
      // Nach 3 Verstößen: Längere Sperre
      if (violations >= 2) {
        if (req.ip) suspiciousIPs.add(req.ip);
        res.setHeader('Retry-After', '3600'); // 1 Stunde
      }
    }
  });
};

/**
 * Adaptive Rate-Limiting basierend auf Server-Last
 */
let currentServerLoad = 0; // 0-100

export const adaptiveRateLimit = createRateLimit({
  windowMs: 60 * 1000,
  get maxRequests() {
    // Reduziere Limits bei hoher Server-Last
    const baseLimit = 200;
    const loadFactor = Math.max(0.1, 1 - (currentServerLoad / 100));
    return Math.floor(baseLimit * loadFactor);
  },
  message: 'Server überlastet. Reduziertes Rate-Limit aktiv.'
});

/**
 * User-basiertes Rate-Limiting (für authentifizierte Requests)
 */
export const userRateLimit = (maxRequests: number = 500) => {
  return createRateLimit({
    windowMs: 60 * 60 * 1000, // 1 Stunde
    maxRequests,
    keyGenerator: (req) => {
      // Authentifizierte User: User-ID verwenden
      if (req.user?.id) {
        return `user:${req.user.id}`;
      }
      // Unauthentifiziert: IP verwenden
      return `ip:${req.ip || 'unknown'}`;
    },
    message: 'Benutzer-Limit erreicht. Limit: 500 Anfragen pro Stunde.'
  });
};

/**
 * Endpoint-spezifisches Rate-Limiting
 */
export const endpointRateLimit = (endpoint: string, maxRequests: number) => {
  return createRateLimit({
    windowMs: 60 * 1000, // 1 Minute
    maxRequests,
    keyGenerator: (req) => `${req.ip || 'unknown'}:${endpoint}`,
    message: `Zu viele Anfragen an ${endpoint}. Limit: ${maxRequests} pro Minute.`
  });
};

/**
 * Geografisches Rate-Limiting (vereinfacht)
 */
const highRiskCountries = ['CN', 'RU', 'KP']; // Beispiel

export const geoRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 Minuten
  maxRequests: 50,
  keyGenerator: (req) => {
    const country = req.headers['cf-ipcountry'] as string; // Cloudflare-Header
    const isHighRisk = highRiskCountries.includes(country);
    return isHighRisk ? `high-risk:${req.ip || 'unknown'}` : req.ip || 'unknown';
  }
});

/**
 * Brute-Force-Schutz für spezifische Endpunkte
 */
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

export const bruteForceProtection = (
  maxAttempts: number = 5,
  blockDurationMs: number = 30 * 60 * 1000 // 30 Minuten
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = `${req.ip || 'unknown'}:${req.path}`;
    const now = Date.now();
    
    const attempts = failedAttempts.get(key);
    
    // Prüfe ob IP noch gesperrt ist
    if (attempts && attempts.count >= maxAttempts) {
      const timeSinceLastAttempt = now - attempts.lastAttempt;
      
      if (timeSinceLastAttempt < blockDurationMs) {
        res.status(429).json({
          success: false,
          error: 'IP temporär gesperrt',
          message: `Zu viele fehlgeschlagene Versuche. Gesperrt für ${Math.ceil((blockDurationMs - timeSinceLastAttempt) / 60000)} Minuten.`,
          retryAfter: Math.ceil((blockDurationMs - timeSinceLastAttempt) / 1000)
        });
        return;
      } else {
        // Sperre abgelaufen
        failedAttempts.delete(key);
      }
    }
    
    // Middleware für Response-Überwachung
    const originalSend = res.send;
    res.send = function(body: any) {
      const statusCode = res.statusCode;
      
      // Fehlgeschlagener Versuch?
      if (statusCode === 401 || statusCode === 403) {
        const current = failedAttempts.get(key) || { count: 0, lastAttempt: 0 };
        current.count++;
        current.lastAttempt = now;
        failedAttempts.set(key, current);
        
        console.warn(`Failed attempt ${current.count}/${maxAttempts} for ${key}`);
      } else if (statusCode === 200) {
        // Erfolgreicher Login: Zähler zurücksetzen
        failedAttempts.delete(key);
      }
      
      return originalSend.call(this, body);
    };
    
    next();
  };
};

/**
 * Cleanup-Funktionen für Memory-Management
 */
export function cleanupRateLimitData(): void {
  const now = Date.now();
  
  // Abgelaufene Rate-Limit-Daten entfernen
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
  
  // Alte Failed-Attempts entfernen
  for (const [key, data] of failedAttempts.entries()) {
    if (now - data.lastAttempt > 60 * 60 * 1000) { // 1 Stunde
      failedAttempts.delete(key);
    }
  }
  
  // Violation-Counts zurücksetzen
  violationCount.clear();
}

// Automatische Bereinigung alle 10 Minuten
setInterval(cleanupRateLimitData, 10 * 60 * 1000);

/**
 * Rate-Limit-Status für Monitoring
 */
export function getRateLimitStatus(): {
  activeRateLimits: number;
  suspiciousIPs: number;
  failedAttempts: number;
  memoryUsage: string;
} {
  return {
    activeRateLimits: rateLimitStore.size,
    suspiciousIPs: suspiciousIPs.size,
    failedAttempts: failedAttempts.size,
    memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
  };
}

export default {
  generalRateLimit,
  authRateLimit,
  chatRateLimit,
  searchRateLimit,
  progressiveRateLimit,
  adaptiveRateLimit,
  userRateLimit,
  endpointRateLimit,
  bruteForceProtection,
  cleanupRateLimitData,
  getRateLimitStatus
};

/**
 * 📧 EMAIL Rate Limiting
 * Verhindert Spam und Missbrauch des Email-Services
 */
export const rateLimitEmail = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 Stunde
  maxRequests: 10, // Max 10 Emails pro Stunde pro User
  keyGenerator: (req: Request) => `email:${req.user?.id || req.ip || 'unknown'}`,
  message: 'Email-Limit erreicht. Maximal 10 E-Mails pro Stunde erlaubt.',
  onLimitReached: (req: Request, res: Response) => {
    console.warn(`🚨 Email rate limit reached for user: ${req.user?.id || req.ip || 'unknown'}`);
  }
});