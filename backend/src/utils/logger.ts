/**
 * 🔒 SICHERHEITS-UPDATE: Sichere Logging-Utility
 * 
 * Implementiert umgebungsbasierte Logging-Level um:
 * - Sensitive Daten in Produktion zu schützen
 * - Debug-Informationen nur in Development zu zeigen
 * - Structured Logging für bessere Monitoring
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

interface LogContext {
  userId?: string;
  ip?: string;
  endpoint?: string;
  duration?: number;
  [key: string]: any;
}

class Logger {
  private currentLevel: LogLevel;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.currentLevel = this.isProduction ? LogLevel.WARN : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.currentLevel;
  }

  private sanitizeForProduction(data: any): any {
    if (!this.isProduction) return data;
    
    // In Produktion: Sensitive Daten entfernen
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data };
      
      // Entferne sensitive Felder
      const sensitiveFields = ['password', 'token', 'api_key', 'secret', 'authorization'];
      sensitiveFields.forEach(field => {
        if (field in sanitized) {
          sanitized[field] = '[REDACTED]';
        }
      });
      
      return sanitized;
    }
    
    return data;
  }

  private formatLog(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const sanitizedContext = this.sanitizeForProduction(context);
    
    if (this.isProduction) {
      // Structured JSON für Produktion
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...sanitizedContext
      });
    } else {
      // Lesbare Logs für Development
      const contextStr = sanitizedContext ? JSON.stringify(sanitizedContext, null, 2) : '';
      return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr ? '\n' + contextStr : ''}`;
    }
  }

  error(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatLog('error', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatLog('warn', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatLog('info', message, context));
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatLog('debug', message, context));
    }
  }

  // Sichere API-Logging-Methoden
  apiRequest(endpoint: string, method: string, userId?: string, ip?: string): void {
    this.info('API Request', { endpoint, method, userId, ip });
  }

  apiResponse(endpoint: string, statusCode: number, duration: number, userId?: string): void {
    this.info('API Response', { endpoint, statusCode, duration, userId });
  }

  securityEvent(event: string, details: LogContext): void {
    this.warn(`Security Event: ${event}`, details);
  }

  performance(operation: string, duration: number, context?: LogContext): void {
    if (duration > 1000) { // Log slow operations
      this.warn(`Slow Operation: ${operation}`, { duration, ...context });
    } else {
      this.debug(`Performance: ${operation}`, { duration, ...context });
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience functions for backward compatibility
export const logError = (message: string, context?: LogContext) => logger.error(message, context);
export const logWarn = (message: string, context?: LogContext) => logger.warn(message, context);
export const logInfo = (message: string, context?: LogContext) => logger.info(message, context);
export const logDebug = (message: string, context?: LogContext) => logger.debug(message, context);