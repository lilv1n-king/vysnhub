/**
 * ⚠️ SICHERHEITS-VALIDIERUNG für VYSN Hub Backend
 * 
 * Zusätzliche Validierungs-Middleware für kritische Endpunkte
 */

import { Request, Response, NextFunction } from 'express';

// HTML-Escape für XSS-Schutz
const sanitizeHtml = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// Script-Tags entfernen
const removeScripts = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

// Allgemeine Input-Bereinigung
const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  let sanitized = input.trim();
  sanitized = removeScripts(sanitized);
  sanitized = sanitizeHtml(sanitized);
  return sanitized.substring(0, 1000); // Längen-Begrenzung
};

// ⚠️ Chat-Nachrichten Validierung
export const validateChatMessage = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { message, sessionId } = req.body;

  const errors: string[] = [];

  // Message-Validierung
  const sanitizedMessage = sanitizeInput(message || '');
  if (!sanitizedMessage || sanitizedMessage.trim().length === 0) {
    errors.push('Nachricht darf nicht leer sein');
  }

  if (sanitizedMessage && sanitizedMessage.length > 5000) {
    errors.push('Nachricht darf maximal 5000 Zeichen enthalten');
  }

  // Gefährliche Patterns blockieren
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\(/i,
    /document\./i,
    /window\./i
  ];

  if (dangerousPatterns.some(pattern => pattern.test(message || ''))) {
    errors.push('Nachricht enthält nicht erlaubte Inhalte');
  }

  // SessionId-Validierung (UUID-Format)
  if (sessionId) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
      errors.push('Ungültige Session-ID');
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ 
      success: false,
      error: 'Chat-Validierung fehlgeschlagen',
      details: errors 
    });
    return;
  }

  // Sanitierte Werte zurückschreiben
  req.body.message = sanitizedMessage;

  next();
};

// ⚠️ Produktsuche Validierung
export const validateProductSearch = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { q, limit } = req.query;

  const errors: string[] = [];

  if (q) {
    const sanitizedQuery = sanitizeInput(q as string);
    if (sanitizedQuery.length > 200) {
      errors.push('Suchbegriff darf maximal 200 Zeichen enthalten');
    }

    // SQL-Injection-Patterns blockieren
    const sqlPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /delete\s+from/i,
      /insert\s+into/i,
      /update\s+set/i,
      /'|\"|;|--/
    ];

    if (sqlPatterns.some(pattern => pattern.test(q as string))) {
      errors.push('Suchbegriff enthält nicht erlaubte Zeichen');
    }

    // Überschreibe mit sanitiertem Wert
    req.query.q = sanitizedQuery;
  }

  if (limit) {
    const numLimit = parseInt(limit as string, 10);
    if (isNaN(numLimit) || numLimit < 1 || numLimit > 100) {
      errors.push('Limit muss zwischen 1 und 100 liegen');
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ 
      success: false,
      error: 'Produktsuch-Validierung fehlgeschlagen',
      details: errors 
    });
    return;
  }

  next();
};

// ⚠️ Datei-Upload Validierung
export const validateFileUpload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png', 
    'image/webp',
    'application/pdf',
    'text/plain'
  ];

  const maxFileSize = 5 * 1024 * 1024; // 5MB

  if (req.file) {
    const { mimetype, size, originalname } = req.file;

    const errors: string[] = [];

    // MIME-Type prüfen
    if (!allowedMimeTypes.includes(mimetype)) {
      errors.push('Dateityp nicht erlaubt');
    }

    // Dateigröße prüfen
    if (size > maxFileSize) {
      errors.push('Datei zu groß (max. 5MB)');
    }

    // Dateiname validieren
    if (!/^[a-zA-Z0-9._-]+$/.test(originalname)) {
      errors.push('Ungültiger Dateiname');
    }

    // Doppelte Dateiendungen blockieren (.jpg.exe)
    if ((originalname.match(/\./g) || []).length > 1) {
      errors.push('Mehrfache Dateiendungen nicht erlaubt');
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Datei-Upload-Validierung fehlgeschlagen',
        details: errors
      });
      return;
    }
  }

  next();
};

// ⚠️ ID-Parameter Validierung
export const validateIdParam = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params[paramName];

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID-Parameter fehlt'
      });
      return;
    }

    // UUID-Format prüfen
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isUuid = uuidRegex.test(id);

    // Numerische ID prüfen
    const numericId = parseInt(id, 10);
    const isNumeric = !isNaN(numericId) && numericId > 0;

    if (!isUuid && !isNumeric) {
      res.status(400).json({
        success: false,
        error: 'Ungültiges ID-Format'
      });
      return;
    }

    next();
  };
};

// ⚠️ Rate Limiting pro Benutzer
const userRequestCounts = new Map<string, { count: number; resetTime: number }>();

export const userRateLimit = (
  maxRequests: number = 100, 
  windowMs: number = 15 * 60 * 1000 // 15 Minuten
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Benutzer-ID aus auth context
    const userId = req.user?.id || req.ip;
    
    const now = Date.now();
    const record = userRequestCounts.get(userId);
    
    if (!record || now > record.resetTime) {
      userRequestCounts.set(userId, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }
    
    if (record.count >= maxRequests) {
      res.status(429).json({
        success: false,
        error: 'Zu viele Anfragen',
        message: 'Rate Limit erreicht. Versuchen Sie es später erneut.'
      });
      return;
    }
    
    record.count++;
    next();
  };
};