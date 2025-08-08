/**
 * ⚠️ CSRF-Schutz für VYSN Hub Backend
 * 
 * Implementiert Cross-Site Request Forgery Schutz
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// CSRF-Token-Store (in Produktion: Redis verwenden!)
const csrfTokens = new Map<string, { token: string; expires: number }>();

// Token-Gültigkeit (15 Minuten)
const TOKEN_EXPIRY = 15 * 60 * 1000;

/**
 * Generiert einen sicheren CSRF-Token
 */
function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Middleware: CSRF-Token generieren und senden
 */
export const generateCsrfTokenMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Benutzer-ID oder Session-ID als Key verwenden
  const sessionKey = req.user?.id || req.session?.id || req.ip;
  
  const token = generateCsrfToken();
  const expires = Date.now() + TOKEN_EXPIRY;
  
  // Token speichern
  csrfTokens.set(sessionKey, { token, expires });
  
  // Token im Response-Header senden
  res.setHeader('X-CSRF-Token', token);
  
  // Token auch in res.locals für Views verfügbar machen
  res.locals.csrfToken = token;
  
  next();
};

/**
 * Middleware: CSRF-Token validieren
 */
export const validateCsrfToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // GET, HEAD, OPTIONS sind Safe-Methods - kein CSRF-Schutz nötig
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  const sessionKey = req.user?.id || req.session?.id || req.ip;
  
  // Token aus Header oder Body holen
  const clientToken = req.headers['x-csrf-token'] || 
                     req.headers['csrf-token'] ||
                     req.body._csrf ||
                     req.query._csrf;

  if (!clientToken) {
    res.status(403).json({
      success: false,
      error: 'CSRF-Token fehlt',
      message: 'CSRF-Schutz: Token ist erforderlich'
    });
    return;
  }

  // Gespeicherten Token abrufen
  const storedTokenData = csrfTokens.get(sessionKey);
  
  if (!storedTokenData) {
    res.status(403).json({
      success: false,
      error: 'CSRF-Token ungültig',
      message: 'Kein gültiger Token für diese Session'
    });
    return;
  }

  // Token-Ablauf prüfen
  if (Date.now() > storedTokenData.expires) {
    csrfTokens.delete(sessionKey);
    res.status(403).json({
      success: false,
      error: 'CSRF-Token abgelaufen',
      message: 'Token ist abgelaufen'
    });
    return;
  }

  // Token vergleichen (constant-time comparison gegen Timing-Attacks)
  if (!crypto.timingSafeEqual(
    Buffer.from(clientToken as string, 'hex'),
    Buffer.from(storedTokenData.token, 'hex')
  )) {
    res.status(403).json({
      success: false,
      error: 'CSRF-Token ungültig',
      message: 'Token stimmt nicht überein'
    });
    return;
  }

  // Token erfolgreich validiert
  next();
};

/**
 * API-Endpunkt: Neuen CSRF-Token anfordern
 */
export const getCsrfToken = (req: Request, res: Response): void => {
  const sessionKey = req.user?.id || req.session?.id || req.ip;
  
  const token = generateCsrfToken();
  const expires = Date.now() + TOKEN_EXPIRY;
  
  csrfTokens.set(sessionKey, { token, expires });
  
  res.json({
    success: true,
    csrfToken: token,
    expiresIn: TOKEN_EXPIRY / 1000 // Sekunden
  });
};

/**
 * Cleanup: Abgelaufene Token entfernen
 */
export const cleanupExpiredTokens = (): void => {
  const now = Date.now();
  for (const [key, data] of csrfTokens.entries()) {
    if (now > data.expires) {
      csrfTokens.delete(key);
    }
  }
};

// Automatische Bereinigung alle 5 Minuten
setInterval(cleanupExpiredTokens, 5 * 60 * 1000);

/**
 * Double Submit Cookie Pattern (alternative Implementierung)
 */
export const doubleSubmitCookieProtection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // GET-Requests sind sicher
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  const cookieToken = req.cookies?.['csrf-token'];
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken) {
    res.status(403).json({
      success: false,
      error: 'CSRF Double Submit Cookie Schutz fehlgeschlagen',
      message: 'Cookie und Header Token sind erforderlich'
    });
    return;
  }

  if (cookieToken !== headerToken) {
    res.status(403).json({
      success: false,
      error: 'CSRF Token-Mismatch',
      message: 'Cookie und Header Token stimmen nicht überein'
    });
    return;
  }

  next();
};

/**
 * SameSite Cookie Helper
 */
export const setSameSiteCookies = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Überschreibe Cookie-Settings für CSRF-Schutz
  const originalCookie = res.cookie;
  
  res.cookie = function(name: string, value: any, options: any = {}) {
    // Setze sichere Cookie-Optionen
    const secureOptions = {
      ...options,
      httpOnly: true,     // Verhindert XSS
      secure: process.env.NODE_ENV === 'production', // HTTPS in Produktion
      sameSite: 'strict' as const,  // CSRF-Schutz
      maxAge: 15 * 60 * 1000 // 15 Minuten
    };
    
    return originalCookie.call(this, name, value, secureOptions);
  };
  
  next();
};