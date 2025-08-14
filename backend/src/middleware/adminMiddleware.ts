import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/database';

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if user is authenticated (should be handled by authenticateToken middleware first)
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'User must be authenticated to access admin features'
      });
      return;
    }

    // Check if user has admin privileges
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      res.status(500).json({
        success: false,
        error: 'Database error',
        message: 'Failed to verify admin privileges'
      });
      return;
    }

    if (!profile || !profile.is_admin) {
      res.status(403).json({
        success: false,
        error: 'Admin access required',
        message: 'This endpoint requires administrator privileges'
      });
      return;
    }

    // User is admin, proceed to next middleware
    next();

  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to verify admin access'
    });
  }
};