import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';
import { 
  validateRegistration, 
  validateUserUpdate 
} from '../middleware/validationMiddleware';

const router = Router();
const authController = new AuthController();

// Public routes (no auth required)
router.get('/', authController.getAuthInfo); // Info über Auth-System
router.post('/login', authController.login); // User login
router.post('/register', validateRegistration, authController.register); // Admin registration
router.post('/validate', authController.validateToken); // Token validation
router.post('/refresh', authController.refreshToken); // Token refresh
router.post('/reset-password', authController.resetPassword);
router.post('/check-admin', authController.checkAdminStatus); // Check if user is admin

// Protected routes (auth required) 
router.get('/validate', authenticateToken, authController.validateCurrentToken); // GET token validation
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, validateUserUpdate, authController.updateProfile);
router.post('/logout', authenticateToken, authController.logout);

export { router as authRouter };