import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { User } from '../models/User';

// Erweitere Request interface für User
declare global {
  namespace Express {
    interface Request {
      user?: User;
      accessToken?: string;
    }
  }
}

const authService = new AuthService();

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ 
        success: false,
        error: 'Authorization required',
        message: 'Authorization header is required' 
      });
      return;
    }

    // Extract token from header
    const token = authHeader.replace('Bearer ', '');
    
    // Token mit Supabase validieren
    const user = await authService.verifyAuthHeader(authHeader);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Authenticated User ID:', user.id);
      console.log('👤 Authenticated User:', { id: user.id, email: user.email });
    }
    
    // User und Token zum Request hinzufügen
    req.user = user;
    req.accessToken = token;
    next();

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Auth middleware error:', error);
    }
    
    let message = 'Authentication failed';
    if (error instanceof Error) {
      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        message = 'Invalid or expired token';
      } else if (error.message.includes('Authorization header')) {
        message = 'Authorization header required';
      } else if (error.message.includes('Token not found')) {
        message = 'Bearer token required';
      }
    }

    res.status(401).json({ 
      success: false,
      error: 'Authentication failed',
      message
    });
  }
};

// Optional auth - für Routes die sowohl auth als auch unauth User unterstützen
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // Kein Token, aber das ist OK
      next();
      return;
    }

    // Token vorhanden, versuche zu authentifizieren
    await authenticateToken(req, res, next);
  } catch (error) {
    // Fehler bei optionaler Auth ignorieren
    next();
  }
};