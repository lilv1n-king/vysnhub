import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { CreateUserData, UpdateUserData } from '../models/User';
import { emailVerificationService } from '../services/emailVerificationService';
import { emailService } from '../services/emailService';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // POST /api/auth/register  
  // Registriert einen neuen Benutzer und sendet Willkommens-E-Mail
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { marketing_consent, ...userData }: CreateUserData & { marketing_consent?: boolean } = req.body;
      const user = await this.authService.register(userData);

      // Marketing-Consent verarbeiten wenn bereitgestellt
      if (user.id && marketing_consent !== undefined) {
        await this.authService.updateUserConsent(user.id, { marketing_consent });
      }

      // E-Mail-Verification erstellen (nur wenn User erfolgreich erstellt wurde)
      if (user.id && user.email) {
        try {
          const verification = await emailVerificationService.createVerification({
            user_id: user.id,
            email: user.email
          });

          // Willkommens-E-Mail senden
          const emailSent = await emailService.sendWelcomeEmail({
            email: user.email,
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            verificationToken: verification.token,
            verificationCode: verification.verification_code!
          });

          if (!emailSent) {
            console.warn('⚠️ Welcome email could not be sent, but registration was successful');
          }

          res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email to verify your account.',
            data: { 
              user,
              emailSent,
              verificationRequired: true
            }
          });
        } catch (emailError) {
          console.error('Error sending welcome email:', emailError);
          // Registrierung war erfolgreich, nur Email-Versand fehlgeschlagen
          res.status(201).json({
            success: true,
            message: 'User registered successfully, but email could not be sent.',
            data: { 
              user,
              emailSent: false,
              verificationRequired: true
            }
          });
        }
      } else {
        res.status(201).json({
          success: true,
          message: 'User registered successfully.',
          data: { user }
        });
      }
    } catch (error) {
      console.error('Registration controller error:', error);
      res.status(400).json({
        success: false,
        error: 'Registration failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

  // POST /api/auth/login
  // Login with email and password
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: 'Email and password are required'
        });
        return;
      }

      const result = await this.authService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      console.error('Login controller error:', error);
      res.status(401).json({
        success: false,
        error: 'Login failed',
        message: error instanceof Error ? error.message : 'Invalid credentials'
      });
    }
  };

  // GET /api/auth/validate
  // Validiert aktuellen Token aus Authorization Header
  validateCurrentToken = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Token validation failed',
          message: 'No valid user found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: { user: req.user }
      });
    } catch (error) {
      console.error('Current token validation error:', error);
      res.status(401).json({
        success: false,
        error: 'Token validation failed',
        message: error instanceof Error ? error.message : 'Invalid token'
      });
    }
  };

  // POST /api/auth/validate
  // Validiert Supabase Token (für Frontend)
  validateToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;
      
      if (!token) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: 'Token is required'
        });
        return;
      }

      const user = await this.authService.validateToken(token);

      res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: { user }
      });
    } catch (error) {
      console.error('Token validation controller error:', error);
      res.status(401).json({
        success: false,
        error: 'Token validation failed',
        message: error instanceof Error ? error.message : 'Invalid token'
      });
    }
  };

  // POST /api/auth/refresh
  // Erneuert Access Token mit Refresh Token
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: 'Token refresh failed',
          message: 'Refresh token is required'
        });
        return;
      }

      const result = await this.authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        error: 'Token refresh failed',
        message: error instanceof Error ? error.message : 'Invalid refresh token'
      });
    }
  };

  // GET /api/auth/profile
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
        return;
      }

      const user = await this.authService.getUserProfile(req.user.id);

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: user
      });
    } catch (error) {
      console.error('Get profile controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get profile',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

  // PUT /api/auth/profile
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
        return;
      }

      const updateData: UpdateUserData = req.body;
      const updatedUser = await this.authService.updateUserProfile(req.user.id, updateData);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Update profile controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

  // POST /api/auth/reset-password
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: 'Email is required'
        });
        return;
      }

      await this.authService.resetPassword(email);

      res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } catch (error) {
      console.error('Reset password controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send reset email',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

  // Info endpoint - erklärt wie Auth funktioniert
  getAuthInfo = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      message: 'VYSN API Authentication Info',
      data: {
        authMethod: 'Supabase JWT Tokens',
        howToAuth: {
          step1: 'Login/Register directly with Supabase in your frontend',
          step2: 'Get the access_token from Supabase session',
          step3: 'Send requests with header: Authorization: Bearer <token>',
          note: 'Token refresh is handled automatically by Supabase client'
        },
        endpoints: {
          protected: 'All /api/user-projects/* endpoints require authentication',
          public: '/api/products/* and /api/chat/* are public'
        }
      }
    });
  };

  // POST /api/auth/logout
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      // In einem JWT-basierten System ist Logout meist client-seitig
      // Hier könnten wir Token zu einer Blacklist hinzufügen, wenn gewünscht
      
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

  // Check if user has admin privileges
  checkAdminStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id, email } = req.body;
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        res.status(401).json({
          success: false,
          error: 'Authorization required'
        });
        return;
      }

      // Verify the token with Supabase
      const user = await this.authService.verifyAuthHeader(authHeader);
      
      // Check if the verified user matches the requested user
      if (user.id !== user_id) {
        res.status(403).json({
          success: false,
          error: 'User ID mismatch'
        });
        return;
      }

      // Check admin status using service role (bypasses RLS)
      const { data: profile, error } = await this.authService.getAdminClient()
        .from('profiles')
        .select('is_admin, email, first_name, last_name, account_status')
        .eq('id', user_id)
        .single();

      if (error) {
        console.error('Admin check error:', error);
        
        // If user doesn't exist in profiles, create them
        if (error.code === 'PGRST116') {
          console.log('Creating profile for user:', user_id);
          const { data: newProfile, error: createError } = await this.authService.getAdminClient()
            .from('profiles')
            .insert({
              id: user_id,
              email: email || user.email,
              first_name: '',
              last_name: '',
              is_admin: true, // First user becomes admin
              account_status: 'active'
            })
            .select('is_admin')
            .single();

          if (createError) {
            throw new Error(`Failed to create profile: ${createError.message}`);
          }

          res.json({
            success: true,
            is_admin: newProfile.is_admin,
            profile_created: true
          });
          return;
        }

        throw new Error(`Profile query failed: ${error.message}`);
      }

      res.json({
        success: true,
        is_admin: profile.is_admin || false,
        profile: {
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          account_status: profile.account_status
        }
      });

    } catch (error) {
      console.error('Check admin status error:', error);
      res.status(500).json({
        success: false,
        error: 'Admin check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}