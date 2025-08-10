import { supabase } from '../config/database';
import crypto from 'crypto';

export interface EmailVerification {
  id: string;
  user_id: string;
  token: string;
  email: string;
  registration_code?: string;
  verification_code?: string; // 6-stelliger numerischer Code
  expires_at: string;
  verified_at?: string;
  created_at: string;
}

export interface CreateVerificationData {
  user_id: string;
  email: string;
  registration_code?: string;
}

class EmailVerificationService {
  /**
   * Generiert einen 6-stelligen numerischen Verifikationscode
   */
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Erstellt einen neuen E-Mail-Verification-Token und Code
   */
  async createVerification(data: CreateVerificationData): Promise<EmailVerification> {
    try {
      console.log(`📧 Creating email verification for user: ${data.user_id}`);

      // Sicheren Token generieren
      const token = this.generateSecureToken();
      
      // Verifikationscode generieren
      const verificationCode = this.generateVerificationCode();
      
      // Ablaufzeit: 24 Stunden
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      let attempts = 0;
      let verification;
      
      // Versuche einen eindeutigen Code zu erstellen
      while (attempts < 10) {
        try {
          const currentCode = attempts > 0 ? this.generateVerificationCode() : verificationCode;
          
          const { data: verificationData, error } = await supabase
            .from('email_verifications')
            .insert({
              user_id: data.user_id,
              token,
              email: data.email,
              registration_code: data.registration_code,
              verification_code: currentCode,
              expires_at: expiresAt.toISOString()
            })
            .select()
            .single();

          if (error) {
            if (error.code === '23505' && attempts < 9) { // Unique constraint violation
              attempts++;
              continue;
            }
            throw error;
          }

          verification = verificationData;
          break;
        } catch (err) {
          if (attempts >= 9) throw err;
          attempts++;
        }
      }

      if (!verification) {
        throw new Error('Failed to create email verification after multiple attempts');
      }

      console.log(`✅ Email verification created for user: ${data.user_id} with code: ${verification.verification_code}`);
      return verification;
    } catch (error) {
      console.error('Error creating email verification:', error);
      throw error;
    }
  }

  /**
   * Validiert einen 6-stelligen Verifikationscode
   */
  async verifyCode(code: string, email: string): Promise<{
    success: boolean;
    message: string;
    user_id?: string;
  }> {
    try {
      // Code normalisieren (nur Zahlen)
      const cleanCode = code.replace(/\D/g, '');
      
      if (cleanCode.length !== 6) {
        return {
          success: false,
          message: 'Code muss 6 Ziffern haben'
        };
      }

      console.log(`🔍 Verifying email code: ${cleanCode} for email: ${email}`);

      // Code und E-Mail in Datenbank suchen
      const { data: verification, error } = await supabase
        .from('email_verifications')
        .select('*')
        .eq('verification_code', cleanCode)
        .eq('email', email)
        .is('verified_at', null) // Noch nicht verifiziert
        .gt('expires_at', new Date().toISOString()) // Nicht abgelaufen
        .single();

      if (error || !verification) {
        return {
          success: false,
          message: 'Ungültiger oder abgelaufener Code'
        };
      }

      // Verifikation als abgeschlossen markieren
      const { error: updateError } = await supabase
        .from('email_verifications')
        .update({
          verified_at: new Date().toISOString()
        })
        .eq('id', verification.id);

      if (updateError) {
        console.error('Error updating verification:', updateError);
        return {
          success: false,
          message: 'Fehler beim Aktualisieren der Verifikation'
        };
      }

      // User als verifiziert markieren
      await supabase
        .from('profiles')
        .update({
          email_verified: true,
          email_verified_at: new Date().toISOString()
        })
        .eq('id', verification.user_id);

      console.log(`✅ Email verified successfully for user: ${verification.user_id}`);
      
      return {
        success: true,
        message: 'E-Mail erfolgreich verifiziert',
        user_id: verification.user_id
      };

    } catch (error) {
      console.error('Error verifying code:', error);
      return {
        success: false,
        message: 'Fehler bei der Code-Verifikation'
      };
    }
  }

  /**
   * Validiert einen Verification-Token (Legacy-Support)
   */
  async validateToken(token: string): Promise<EmailVerification | null> {
    try {
      console.log(`🔍 Validating email verification token: ${token.substring(0, 8)}...`);

      const { data: verification, error } = await supabase
        .from('email_verifications')
        .select('*')
        .eq('token', token)
        .is('verified_at', null)
        .single();

      if (error || !verification) {
        console.log(`❌ Email verification token not found: ${token.substring(0, 8)}...`);
        return null;
      }

      // Prüfe Ablaufzeit
      if (new Date(verification.expires_at) < new Date()) {
        console.log(`⏰ Email verification token expired: ${token.substring(0, 8)}...`);
        return null;
      }

      console.log(`✅ Email verification token is valid: ${token.substring(0, 8)}...`);
      return verification;
    } catch (error) {
      console.error('Error validating email verification token:', error);
      return null;
    }
  }

  /**
   * Verifiziert eine E-Mail-Adresse
   */
  async verifyEmail(token: string): Promise<{
    success: boolean;
    user_id?: string;
    email?: string;
    message: string;
  }> {
    try {
      console.log(`✉️ Verifying email with token: ${token.substring(0, 8)}...`);

      // Token validieren
      const verification = await this.validateToken(token);
      if (!verification) {
        return {
          success: false,
          message: 'Invalid or expired verification token'
        };
      }

      // Verification als verwendet markieren
      const { error: verificationError } = await supabase
        .from('email_verifications')
        .update({
          verified_at: new Date().toISOString()
        })
        .eq('id', verification.id);

      if (verificationError) {
        console.error('Error updating verification:', verificationError);
        throw new Error(`Failed to update verification: ${verificationError.message}`);
      }

      // User-Profile als verifiziert markieren
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          email_verified: true,
          email_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', verification.user_id);

      if (profileError) {
        console.error('Error updating profile verification:', profileError);
        throw new Error(`Failed to update profile: ${profileError.message}`);
      }

      console.log(`✅ Email verified successfully for user: ${verification.user_id}`);
      return {
        success: true,
        user_id: verification.user_id,
        email: verification.email,
        message: 'Email verified successfully'
      };
    } catch (error) {
      console.error('Error verifying email:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  /**
   * Prüft ob eine E-Mail-Adresse bereits verifiziert ist
   */
  async isEmailVerified(userId: string): Promise<boolean> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('email_verified')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        return false;
      }

      return profile.email_verified === true;
    } catch (error) {
      console.error('Error checking email verification status:', error);
      return false;
    }
  }

  /**
   * Lädt die Verification-Details für einen User
   */
  async getUserVerification(userId: string): Promise<EmailVerification | null> {
    try {
      const { data: verification, error } = await supabase
        .from('email_verifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !verification) {
        return null;
      }

      return verification;
    } catch (error) {
      console.error('Error getting user verification:', error);
      return null;
    }
  }

  /**
   * Erstellt einen neuen Verification-Token für einen User (Resend)
   */
  async resendVerification(userId: string): Promise<EmailVerification> {
    try {
      console.log(`🔄 Resending email verification for user: ${userId}`);

      // User-Daten laden
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, registration_code_used')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        throw new Error('User profile not found');
      }

      // Alte Verifications für diesen User deaktivieren (optional)
      await supabase
        .from('email_verifications')
        .update({ expires_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('verified_at', null);

      // Neue Verification erstellen
      const verification = await this.createVerification({
        user_id: userId,
        email: profile.email,
        registration_code: profile.registration_code_used
      });

      console.log(`✅ Email verification resent for user: ${userId}`);
      return verification;
    } catch (error) {
      console.error('Error resending email verification:', error);
      throw error;
    }
  }

  /**
   * Bereinigt abgelaufene Verification-Tokens
   */
  async cleanupExpiredVerifications(): Promise<number> {
    try {
      console.log('🧹 Cleaning up expired email verifications...');

      const { data, error } = await supabase
        .from('email_verifications')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .is('verified_at', null)
        .select('id');

      if (error) {
        console.error('Error cleaning up email verifications:', error);
        return 0;
      }

      const cleanedCount = data?.length || 0;
      console.log(`✅ Cleaned up ${cleanedCount} expired email verifications`);
      return cleanedCount;
    } catch (error) {
      console.error('Error during email verification cleanup:', error);
      return 0;
    }
  }

  /**
   * Generiert einen sicheren Verification-Token
   */
  private generateSecureToken(): string {
    // 32 Bytes = 256 Bit Zufallstoken, als Hex-String = 64 Zeichen
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generiert eine Verification-URL
   */
  generateVerificationUrl(token: string, baseUrl?: string): string {
    const base = baseUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${base}/verify-email?token=${token}`;
  }

  /**
   * Lädt Verification-Statistiken
   */
  async getVerificationStats(): Promise<{
    total: number;
    verified: number;
    pending: number;
    expired: number;
  }> {
    try {
      const { data: stats, error } = await supabase
        .from('email_verifications')
        .select('verified_at, expires_at');

      if (error) {
        throw new Error(`Failed to get verification stats: ${error.message}`);
      }

      const now = new Date();
      const total = stats?.length || 0;
      const verified = stats?.filter(s => s.verified_at).length || 0;
      const expired = stats?.filter(s => !s.verified_at && new Date(s.expires_at) < now).length || 0;
      const pending = total - verified - expired;

      return { total, verified, pending, expired };
    } catch (error) {
      console.error('Error getting verification stats:', error);
      return { total: 0, verified: 0, pending: 0, expired: 0 };
    }
  }
}

export const emailVerificationService = new EmailVerificationService();
