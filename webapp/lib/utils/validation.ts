/**
 * Sicherheits-Validierungsutilities für VYSN Hub
 * 
 * Schützt vor:
 * - XSS (Cross-Site Scripting)
 * - SQL Injection
 * - CSRF (Cross-Site Request Forgery)
 * - Input-basierte Angriffe
 */

// HTML-Tags und gefährliche Zeichen escapen
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// SQL Injection-gefährliche Zeichen escapen
export function sanitizeSQL(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '\\;')
    .replace(/--/g, '\\--')
    .replace(/\/\*/g, '\\/*')
    .replace(/\*\//g, '\\*/');
}

// JavaScript-Code entfernen (XSS-Schutz)
export function removeScripts(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/eval\s*\(/gi, '')
    .replace(/expression\s*\(/gi, '');
}

// E-Mail-Validierung
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Telefonnummer-Validierung (international)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 Format
  return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
}

// URL-Validierung (nur HTTPS erlaubt)
export function isValidHttpsUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

// Starke Passwort-Validierung
export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[a-z]/.test(password)) return false; // Kleinbuchstabe
  if (!/[A-Z]/.test(password)) return false; // Großbuchstabe
  if (!/\d/.test(password)) return false;    // Zahl
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false; // Sonderzeichen
  return true;
}

// Numerische ID-Validierung
export function isValidId(id: string | number): boolean {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  return Number.isInteger(numId) && numId > 0;
}

// UUID-Validierung
export function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Längen-Validierung mit Trimming
export function isValidLength(
  input: string, 
  minLength: number = 0, 
  maxLength: number = 1000
): boolean {
  const trimmed = input.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
}

// Gefährliche Dateinamen prüfen
export function isSafeFilename(filename: string): boolean {
  // Keine Pfad-Traversal-Zeichen
  if (/\.\.\/|\.\.\\|\/\.\.|\\\.\./.test(filename)) return false;
  
  // Keine ausführbaren Dateierweiterungen
  const dangerousExtensions = /\.(exe|bat|cmd|scr|pif|vbs|js|jar|com|scr)$/i;
  if (dangerousExtensions.test(filename)) return false;
  
  // Keine speziellen Zeichen
  if (/[<>:"|?*]/.test(filename)) return false;
  
  return filename.length > 0 && filename.length <= 255;
}

// Content-Type-Validierung für Uploads
export function isAllowedMimeType(mimeType: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(mimeType);
}

// Rate Limiting Helper (IP-basiert)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 100, 
  windowMs: number = 15 * 60 * 1000 // 15 Minuten
): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false; // Rate limit erreicht
  }
  
  record.count++;
  return true;
}

// CSRF-Token-Validierung (für API-Calls)
export function validateCsrfToken(token: string, expectedToken: string): boolean {
  return token === expectedToken && token.length >= 32;
}

// Allgemeine Input-Bereinigung
export function sanitizeUserInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  let sanitized = input.trim();
  sanitized = removeScripts(sanitized);
  sanitized = sanitizeHtml(sanitized);
  
  // Mehrfache Leerzeichen reduzieren
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  return sanitized;
}

// Validierungs-Schema-Typ
export interface ValidationSchema {
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'phone' | 'url' | 'uuid';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
}

// Schema-basierte Validierung
export function validateInput(value: any, schema: ValidationSchema): {
  isValid: boolean;
  error?: string;
  sanitizedValue?: any;
} {
  // Required-Check
  if (schema.required && (value === undefined || value === null || value === '')) {
    return { isValid: false, error: 'Feld ist erforderlich' };
  }
  
  // Wenn nicht required und leer, ist es gültig
  if (!schema.required && (!value || value === '')) {
    return { isValid: true, sanitizedValue: '' };
  }
  
  let sanitizedValue = value;
  
  // String-Sanitization
  if (typeof value === 'string') {
    sanitizedValue = sanitizeUserInput(value);
  }
  
  // Typ-Validierung
  switch (schema.type) {
    case 'email':
      if (!isValidEmail(sanitizedValue)) {
        return { isValid: false, error: 'Ungültige E-Mail-Adresse' };
      }
      break;
      
    case 'phone':
      if (!isValidPhone(sanitizedValue)) {
        return { isValid: false, error: 'Ungültige Telefonnummer' };
      }
      break;
      
    case 'url':
      if (!isValidHttpsUrl(sanitizedValue)) {
        return { isValid: false, error: 'Ungültige HTTPS-URL' };
      }
      break;
      
    case 'uuid':
      if (!isValidUuid(sanitizedValue)) {
        return { isValid: false, error: 'Ungültige UUID' };
      }
      break;
      
    case 'number':
      const num = Number(sanitizedValue);
      if (isNaN(num)) {
        return { isValid: false, error: 'Muss eine Zahl sein' };
      }
      sanitizedValue = num;
      break;
  }
  
  // Längen-Validierung
  if (schema.minLength !== undefined || schema.maxLength !== undefined) {
    if (!isValidLength(String(sanitizedValue), schema.minLength, schema.maxLength)) {
      return { 
        isValid: false, 
        error: `Länge muss zwischen ${schema.minLength || 0} und ${schema.maxLength || 1000} Zeichen liegen` 
      };
    }
  }
  
  // Pattern-Validierung
  if (schema.pattern && !schema.pattern.test(String(sanitizedValue))) {
    return { isValid: false, error: 'Ungültiges Format' };
  }
  
  // Custom-Validierung
  if (schema.custom && !schema.custom(sanitizedValue)) {
    return { isValid: false, error: 'Benutzerdefinierte Validierung fehlgeschlagen' };
  }
  
  return { isValid: true, sanitizedValue };
}

// Batch-Validierung für Objekte
export function validateObject(
  data: Record<string, any>,
  schemas: Record<string, ValidationSchema>
): {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData: Record<string, any>;
} {
  const errors: Record<string, string> = {};
  const sanitizedData: Record<string, any> = {};
  
  for (const [field, schema] of Object.entries(schemas)) {
    const result = validateInput(data[field], schema);
    
    if (!result.isValid) {
      errors[field] = result.error || 'Validierungsfehler';
    } else {
      sanitizedData[field] = result.sanitizedValue;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
}