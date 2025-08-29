/**
 * ⚠️ SECURITY HEADERS für VYSN App Backend
 * 
 * Implementiert wichtige HTTP-Sicherheitsheader
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Setzt alle wichtigen Sicherheitsheader
 */
export const setSecurityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 1. Content Security Policy (CSP)
  // Verhindert XSS, Code-Injection, etc.
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://apis.google.com https://www.google.com https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', cspDirectives);

  // 2. X-Content-Type-Options
  // Verhindert MIME-Type-Sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // 3. X-Frame-Options
  // Verhindert Clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // 4. X-XSS-Protection (Legacy Browser Support)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // 5. Referrer-Policy
  // Kontrolliert Referrer-Informationen
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 6. Permissions-Policy (Feature Policy)
  // Kontrolliert Browser-Features
  const permissionsDirectives = [
    'camera=(self)',
    'microphone=()',
    'geolocation=(self)',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'fullscreen=(self)'
  ].join(', ');
  
  res.setHeader('Permissions-Policy', permissionsDirectives);

  // 7. Strict-Transport-Security (HSTS)
  // Erzwingt HTTPS (nur in Produktion)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // 8. X-Powered-By entfernen
  // Versteckt Server-Informationen
  res.removeHeader('X-Powered-By');

  // 9. Server-Header anpassen
  res.setHeader('Server', 'VYSN App API');

  // 10. Cross-Origin-Resource-Policy
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  // 11. Cross-Origin-Embedder-Policy
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

  // 12. Cross-Origin-Opener-Policy
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

  next();
};

/**
 * CORS-Konfiguration mit Sicherheitsfokus
 */
export const secureCorsPolitik = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const allowedOrigins = [
    'http://localhost:3000',  // Next.js Development
    'http://localhost:8081',  // Expo Development
    'https://vysnhub.com',    // Production Domain
    'https://www.vysnhub.com' // Production Domain mit www
  ];

  // Development: Expo-URLs mit lokaler IP erlauben
  if (process.env.NODE_ENV === 'development') {
    const origin = req.headers.origin;
    if (origin && /^exp:\/\/192\.168\.\d+\.\d+:8081$/.test(origin)) {
      allowedOrigins.push(origin);
    }
  }

  const origin = req.headers.origin;
  
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token'
  );
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 Stunden

  // Preflight-Requests behandeln
  if (req.method === 'OPTIONS') {
    res.status(204).send();
    return;
  }

  next();
};

/**
 * API-Rate-Limiting-Header
 */
export const setRateLimitHeaders = (
  limit: number,
  remaining: number,
  resetTime: number
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', resetTime.toString());
    
    if (remaining === 0) {
      res.setHeader('Retry-After', Math.ceil((resetTime - Date.now()) / 1000).toString());
    }
    
    next();
  };
};

/**
 * Response-Zeit-Header hinzufügen
 */
export const addResponseTimeHeader = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    res.setHeader('X-Response-Time', `${responseTime}ms`);
  });
  
  next();
};

/**
 * Content-Type-Validation für JSON-APIs
 */
export const validateContentType = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Nur bei POST/PUT/PATCH mit Body
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !contentType.includes('application/json')) {
      res.status(400).json({
        success: false,
        error: 'Ungültiger Content-Type',
        message: 'Content-Type muss application/json sein'
      });
      return;
    }
  }
  
  next();
};

/**
 * NoSQL-Injection-Schutz für MongoDB-ähnliche Queries
 */
export const preventNoSQLInjection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Rekursiv alle Objekte durchsuchen
  function sanitizeObject(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // MongoDB-Operatoren blockieren
      if (key.startsWith('$') || key.includes('.')) {
        continue; // Skip gefährliche Keys
      }
      
      sanitized[key] = sanitizeObject(value);
    }
    
    return sanitized;
  }
  
  // Body, Query und Params bereinigen
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

/**
 * Error-Handler mit sicheren Fehlermeldungen
 */
export const secureErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Detaillierte Fehler nur in Development
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  console.error('API Error:', {
    message: err.message,
    stack: isDevelopment ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // Status-Code bestimmen
  const statusCode = err.statusCode || err.status || 500;
  
  // Sichere Fehlermeldung
  let message = 'Ein unerwarteter Fehler ist aufgetreten';
  
  if (statusCode < 500) {
    // Client-Fehler: Originalmeldung verwenden
    message = err.message || message;
  } else if (isDevelopment) {
    // Development: Detaillierte Server-Fehler
    message = err.message || message;
  }
  
  res.status(statusCode).json({
    success: false,
    error: 'Server Error',
    message,
    ...(isDevelopment && { 
      stack: err.stack,
      details: err 
    })
  });
};

export default {
  setSecurityHeaders,
  secureCorsPolitik,
  setRateLimitHeaders,
  addResponseTimeHeader,
  validateContentType,
  preventNoSQLInjection,
  secureErrorHandler
};