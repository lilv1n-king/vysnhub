import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error caught by error handler:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Standard-Statuscode, falls nicht gesetzt
  const statusCode = error.statusCode || 500;

  // Produktions- vs. Entwicklungsumgebung
  const isDevelopment = process.env.NODE_ENV === 'development';

  const errorResponse = {
    error: error.message || 'Interner Serverfehler',
    statusCode,
    ...(isDevelopment && {
      stack: error.stack,
      url: req.url,
      method: req.method
    })
  };

  res.status(statusCode).json(errorResponse);
};

// Wrapper für async Route Handler
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
}; 