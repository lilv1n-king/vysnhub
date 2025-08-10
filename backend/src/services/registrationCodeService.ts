import { supabase } from '../config/database';

export interface RegistrationCode {
  id: string;
  code: string;
  description?: string;
  max_uses: number;
  current_uses: number;
  valid_until?: string;
  created_by?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  used_by: string[];
}

export interface CreateRegistrationCodeData {
  code?: string; // Optional - wird automatisch generiert wenn leer
  description?: string;
  max_uses?: number;
  valid_until?: string;
  created_by?: string;
}

export interface CodeValidationResult {
  isValid: boolean;
  code?: RegistrationCode;
  reason?: string;
}

class RegistrationCodeService {
  /**
   * Validiert einen Registrierungscode
   */
  async validateCode(code: string): Promise<CodeValidationResult> {
    try {
      // Code normalisieren (nur Zahlen, 6-8 Stellen)
      const cleanCode = code.replace(/\D/g, ''); // Entferne alle Nicht-Zahlen
      
      if (cleanCode.length < 6 || cleanCode.length > 8) {
        return {
          isValid: false,
          reason: 'Code muss 6-8 Ziffern haben'
        };
      }

      console.log(`🎟️ Validating registration code: ${cleanCode}`);

      const { data: codeData, error } = await supabase
        .from('registration_codes')
        .select('*')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .single();

      if (error || !codeData) {
        console.log(`❌ Registration code not found: ${cleanCode}`);
        return {
          isValid: false,
          reason: 'Code not found or inactive'
        };
      }

      // Prüfe Ablaufdatum
      if (codeData.valid_until && new Date(codeData.valid_until) < new Date()) {
        console.log(`⏰ Registration code expired: ${cleanCode}`);
        return {
          isValid: false,
          reason: 'Code has expired'
        };
      }

      // Prüfe Nutzungslimit
      if (codeData.current_uses >= codeData.max_uses) {
        console.log(`🚫 Registration code usage limit reached: ${cleanCode}`);
        return {
          isValid: false,
          reason: 'Code usage limit reached'
        };
      }

      console.log(`✅ Registration code is valid: ${cleanCode}`);
      return {
        isValid: true,
        code: codeData
      };
    } catch (error) {
      console.error('Error validating registration code:', error);
      return {
        isValid: false,
        reason: 'Validation error'
      };
    }
  }

  /**
   * Markiert einen Code als verwendet
   */
  async useCode(code: string, userId: string): Promise<boolean> {
    try {
      // Code normalisieren
      const cleanCode = code.replace(/\D/g, '');
      console.log(`🎯 Using registration code: ${cleanCode} for user: ${userId}`);

      // Code validieren
      const validation = await this.validateCode(cleanCode);
      if (!validation.isValid || !validation.code) {
        throw new Error(`Invalid registration code: ${validation.reason}`);
      }

      // Prüfen ob User den Code bereits verwendet hat
      if (validation.code.used_by.includes(userId)) {
        console.log(`⚠️ User ${userId} already used code ${cleanCode}`);
        return true; // Bereits verwendet, aber nicht als Fehler behandeln
      }

      // Code-Nutzung incrementieren und User hinzufügen
      const newUsedBy = [...validation.code.used_by, userId];
      const newCurrentUses = validation.code.current_uses + 1;

      const { error } = await supabase
        .from('registration_codes')
        .update({
          current_uses: newCurrentUses,
          used_by: newUsedBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', validation.code.id);

      if (error) {
        console.error('Error updating registration code usage:', error);
        throw new Error(`Failed to use registration code: ${error.message}`);
      }

      // User-Profile mit verwendetem Code aktualisieren
      await supabase
        .from('profiles')
        .update({
          registration_code_used: cleanCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      console.log(`✅ Registration code used successfully: ${cleanCode} by ${userId}`);
      return true;
    } catch (error) {
      console.error('Error using registration code:', error);
      throw error;
    }
  }

  /**
   * Generiert einen zufälligen 6-stelligen Zahlencode
   */
  private generateNumericCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Prüft ob ein Code bereits existiert
   */
  private async codeExists(code: string): Promise<boolean> {
    const { data } = await supabase
      .from('registration_codes')
      .select('id')
      .eq('code', code)
      .single();
    
    return !!data;
  }

  /**
   * Erstellt einen neuen Registrierungscode (automatisch generiert oder manuell)
   */
  async createCode(codeData: CreateRegistrationCodeData): Promise<RegistrationCode> {
    try {
      // Code automatisch generieren wenn nicht angegeben
      let finalCode = codeData.code;
      if (!finalCode) {
        let attempts = 0;
        do {
          finalCode = this.generateNumericCode();
          const exists = await this.codeExists(finalCode);
          if (!exists) break;
          attempts++;
        } while (attempts < 10);
        
        if (attempts >= 10) {
          throw new Error('Could not generate unique code');
        }
      } else {
        // Code normalisieren wenn manuell eingegeben
        finalCode = finalCode.replace(/\D/g, '');
        if (finalCode.length < 6 || finalCode.length > 8) {
          throw new Error('Code muss 6-8 Ziffern haben');
        }
      }

      console.log(`🆕 Creating registration code: ${finalCode}`);

      const { data, error } = await supabase
        .from('registration_codes')
        .insert({
          code: finalCode,
          description: codeData.description,
          max_uses: codeData.max_uses || 1,
          valid_until: codeData.valid_until,
          created_by: codeData.created_by,
          current_uses: 0,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating registration code:', error);
        throw new Error(`Failed to create registration code: ${error.message}`);
      }

      console.log(`✅ Registration code created: ${data.code}`);
      return data;
    } catch (error) {
      console.error('Error creating registration code:', error);
      throw error;
    }
  }

  /**
   * Lädt alle Registrierungscodes (für Admin)
   */
  async getAllCodes(): Promise<RegistrationCode[]> {
    try {
      const { data, error } = await supabase
        .from('registration_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching registration codes:', error);
        throw new Error(`Failed to fetch registration codes: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting registration codes:', error);
      throw error;
    }
  }

  /**
   * Aktualisiert einen Registrierungscode
   */
  async updateCode(codeId: string, updates: Partial<RegistrationCode>): Promise<RegistrationCode> {
    try {
      console.log(`🔄 Updating registration code: ${codeId}`);

      const { data, error } = await supabase
        .from('registration_codes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', codeId)
        .select()
        .single();

      if (error) {
        console.error('Error updating registration code:', error);
        throw new Error(`Failed to update registration code: ${error.message}`);
      }

      console.log(`✅ Registration code updated: ${data.code}`);
      return data;
    } catch (error) {
      console.error('Error updating registration code:', error);
      throw error;
    }
  }

  /**
   * Deaktiviert einen Registrierungscode
   */
  async deactivateCode(codeId: string): Promise<boolean> {
    try {
      console.log(`🚫 Deactivating registration code: ${codeId}`);

      const { error } = await supabase
        .from('registration_codes')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', codeId);

      if (error) {
        console.error('Error deactivating registration code:', error);
        throw new Error(`Failed to deactivate registration code: ${error.message}`);
      }

      console.log(`✅ Registration code deactivated: ${codeId}`);
      return true;
    } catch (error) {
      console.error('Error deactivating registration code:', error);
      throw error;
    }
  }

  /**
   * Generiert einen zufälligen Registrierungscode
   */
  generateRandomCode(prefix: string = 'VH'): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = 3;
    const segmentLength = 4;

    let code = prefix + '-';
    
    for (let i = 0; i < segments; i++) {
      if (i > 0) code += '-';
      
      for (let j = 0; j < segmentLength; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }

    return code;
  }

  /**
   * Bereinigt abgelaufene/verbrauchte Codes
   */
  async cleanupCodes(): Promise<number> {
    try {
      console.log('🧹 Cleaning up expired registration codes...');

      const { data, error } = await supabase
        .from('registration_codes')
        .update({ is_active: false })
        .or('valid_until.lt.' + new Date().toISOString() + ',current_uses.gte.max_uses')
        .eq('is_active', true)
        .select('id');

      if (error) {
        console.error('Error cleaning up registration codes:', error);
        return 0;
      }

      const cleanedCount = data?.length || 0;
      console.log(`✅ Cleaned up ${cleanedCount} registration codes`);
      return cleanedCount;
    } catch (error) {
      console.error('Error during registration code cleanup:', error);
      return 0;
    }
  }
}

export const registrationCodeService = new RegistrationCodeService();
