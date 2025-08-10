import { Request, Response } from 'express';
import { registrationCodeService } from '../services/registrationCodeService';
import { emailVerificationService } from '../services/emailVerificationService';
import { emailService } from '../services/emailService';
import { supabase } from '../config/database';

class RegistrationController {
  /**
   * POST /api/registration/validate-code
   * Validiert einen Registrierungscode
   */
  validateCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.body;

      if (!code) {
        res.status(400).json({
          success: false,
          error: 'Registration code is required'
        });
        return;
      }

      const validation = await registrationCodeService.validateCode(code);

      res.status(200).json({
        success: true,
        data: {
          isValid: validation.isValid,
          reason: validation.reason,
          codeInfo: validation.code ? {
            description: validation.code.description,
            maxUses: validation.code.max_uses,
            currentUses: validation.code.current_uses,
            validUntil: validation.code.valid_until
          } : null
        }
      });
    } catch (error) {
      console.error('Error validating registration code:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate registration code',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * POST /api/registration/register
   * Registriert einen neuen Benutzer mit Code
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        email, 
        password, 
        firstName, 
        lastName, 
        companyName, 
        phone, 
        registrationCode 
      } = req.body;

      // Validierung
      if (!email || !password || !firstName || !registrationCode) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'Email, password, firstName, and registrationCode are required'
        });
        return;
      }

      // Registrierungscode validieren
      const codeValidation = await registrationCodeService.validateCode(registrationCode);
      if (!codeValidation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Invalid registration code',
          message: codeValidation.reason
        });
        return;
      }

      // Benutzer in Supabase erstellen (ohne E-Mail-Bestätigung)
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: false, // Wir machen die E-Mail-Bestätigung selbst
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          company_name: companyName,
          phone,
          registration_code: registrationCode
        }
      });

      if (authError || !authData.user) {
        console.error('Error creating user in Supabase:', authError);
        res.status(400).json({
          success: false,
          error: 'Failed to create user account',
          message: authError?.message || 'User creation failed'
        });
        return;
      }

      console.log(`✅ User created in Supabase: ${authData.user.id}`);

      // Profil in der profiles Tabelle erstellen
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          company_name: companyName,
          phone,
          customer_type: 'standard',
          discount_percentage: 0,
          account_status: 'pending', // Bis zur E-Mail-Verifikation
          language: 'de',
          currency: 'EUR',
          newsletter_subscription: false,
          marketing_emails: false,
          email_verified: false,
          registration_code_used: registrationCode.toUpperCase()
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        
        // Supabase User wieder löschen wenn Profil-Erstellung fehlschlägt
        await supabase.auth.admin.deleteUser(authData.user.id);
        
        res.status(500).json({
          success: false,
          error: 'Failed to create user profile',
          message: profileError.message
        });
        return;
      }

      // Registrierungscode als verwendet markieren
      try {
        await registrationCodeService.useCode(registrationCode, authData.user.id);
      } catch (codeError) {
        console.error('Error marking registration code as used:', codeError);
        // Nicht kritisch - weiter mit E-Mail-Versand
      }

      // E-Mail-Verification erstellen
      const verification = await emailVerificationService.createVerification({
        user_id: authData.user.id,
        email,
        registration_code: registrationCode
      });

      // Willkommens-E-Mail senden
      const emailSent = await emailService.sendWelcomeEmail({
        email,
        firstName,
        lastName,
        verificationToken: verification.token,
        verificationCode: verification.verification_code!,
        registrationCode
      });

      if (!emailSent) {
        console.warn('⚠️ Welcome email could not be sent, but registration was successful');
      }

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          userId: authData.user.id,
          email,
          emailSent,
          verificationRequired: true
        }
      });

    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * POST /api/registration/verify-code
   * Verifiziert eine E-Mail-Adresse über 6-stelligen Code
   */
  verifyEmailCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, email } = req.body;

      if (!code || !email) {
        res.status(400).json({
          success: false,
          message: 'Code und E-Mail sind erforderlich'
        });
        return;
      }

      console.log(`🔍 Verifying email code for: ${email}`);

      const result = await emailVerificationService.verifyCode(code, email);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: {
            user_id: result.user_id,
            verified: true
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }

    } catch (error) {
      console.error('Error verifying email code:', error);
      res.status(500).json({
        success: false,
        message: 'Fehler bei der Code-Verifikation'
      });
    }
  };

  /**
   * GET /api/registration/verify-email
   * Verifiziert eine E-Mail-Adresse über Token (Legacy-Support)
   */
  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Verification token is required'
        });
        return;
      }

      const result = await emailVerificationService.verifyEmail(token);

      if (result.success) {
        // Account-Status auf aktiv setzen
        if (result.user_id) {
          await supabase
            .from('profiles')
            .update({
              account_status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('id', result.user_id);

          // Erfolgreiche Verifikation E-Mail senden
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('id', result.user_id)
            .single();

          // Erfolgs-E-Mail würde hier gesendet (TODO: implementieren)
          if (profile && result.email) {
            console.log(`✅ Email verified for: ${profile.first_name} (${result.email})`);
          }
        }

        res.status(200).json({
          success: true,
          message: result.message,
          data: {
            email: result.email,
            verified: true
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Email verification failed',
          message: result.message
        });
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      res.status(500).json({
        success: false,
        error: 'Email verification failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * POST /api/registration/resend-verification
   * Sendet Verifikations-E-Mail erneut
   */
  resendVerification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: 'Email is required'
        });
        return;
      }

      // User über E-Mail finden
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email_verified')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
        res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'No user found with this email address'
        });
        return;
      }

      if (profile.email_verified) {
        res.status(400).json({
          success: false,
          error: 'Email already verified',
          message: 'This email address is already verified'
        });
        return;
      }

      // Neue Verification erstellen
      const verification = await emailVerificationService.resendVerification(profile.id);

      // Verifikations-E-Mail senden
      const emailSent = await emailService.sendVerificationEmail(
        email,
        profile.first_name,
        verification.verification_code!
      );

      res.status(200).json({
        success: true,
        message: 'Verification email sent',
        data: {
          email,
          emailSent
        }
      });

    } catch (error) {
      console.error('Error resending verification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to resend verification',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/registration/codes (Admin only)
   * Lädt alle Registrierungscodes
   */
  getCodes = async (req: Request, res: Response): Promise<void> => {
    try {
      // TODO: Admin-Authentifizierung prüfen
      const codes = await registrationCodeService.getAllCodes();

      res.status(200).json({
        success: true,
        data: codes
      });
    } catch (error) {
      console.error('Error fetching registration codes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch registration codes',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * POST /api/registration/codes (Admin only)
   * Erstellt einen neuen Registrierungscode
   */
  createCode = async (req: Request, res: Response): Promise<void> => {
    try {
      // TODO: Admin-Authentifizierung prüfen
      const { code, description, maxUses, validUntil } = req.body;

      if (!code) {
        res.status(400).json({
          success: false,
          error: 'Code is required'
        });
        return;
      }

      const newCode = await registrationCodeService.createCode({
        code,
        description,
        max_uses: maxUses,
        valid_until: validUntil,
        created_by: req.user?.id // Wenn Admin-Auth implementiert ist
      });

      res.status(201).json({
        success: true,
        message: 'Registration code created',
        data: newCode
      });
    } catch (error) {
      console.error('Error creating registration code:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create registration code',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

export const registrationController = new RegistrationController();
