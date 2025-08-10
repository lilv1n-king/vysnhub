import { supabase } from '../config/database';

export interface PrivacyConsent {
  id: string;
  user_id: string;
  consent_version: string;
  consent_given: boolean;
  consent_date: string;
  withdrawn_date?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface ConsentRequest {
  consent_given: boolean;
  consent_version?: string;
  ip_address?: string;
  user_agent?: string;
}

class PrivacyService {
  private readonly CURRENT_PRIVACY_VERSION = '1.0';

  /**
   * Gibt die aktuelle Datenschutzerklärung zurück
   */
  async getPrivacyPolicy(): Promise<{
    version: string;
    content: string;
    lastUpdated: string;
  }> {
    // In einer realen Anwendung würde dies aus einer Datenbank oder CMS kommen
    return {
      version: this.CURRENT_PRIVACY_VERSION,
      content: await this.getPrivacyPolicyContent(),
      lastUpdated: '2025-01-07'
    };
  }

  /**
   * Prüft, ob ein Benutzer der aktuellen Datenschutzerklärung zugestimmt hat
   */
  async hasValidConsent(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('privacy_consents')
        .select('*')
        .eq('user_id', userId)
        .eq('consent_version', this.CURRENT_PRIVACY_VERSION)
        .eq('consent_given', true)
        .is('withdrawn_date', null)
        .order('consent_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking consent:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking valid consent:', error);
      return false;
    }
  }

  /**
   * Gibt die Datenschutz-Zustimmung eines Benutzers zurück
   */
  async getUserConsent(userId: string): Promise<PrivacyConsent | null> {
    try {
      const { data, error } = await supabase
        .from('privacy_consents')
        .select('*')
        .eq('user_id', userId)
        .order('consent_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user consent:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error getting user consent:', error);
      return null;
    }
  }

  /**
   * Speichert die Datenschutz-Zustimmung eines Benutzers
   */
  async recordConsent(userId: string, consentData: ConsentRequest): Promise<PrivacyConsent | null> {
    try {
      console.log(`📋 Recording privacy consent for user ${userId}: ${consentData.consent_given ? 'ACCEPTED' : 'DECLINED'}`);

      const { data, error } = await supabase
        .from('privacy_consents')
        .insert({
          user_id: userId,
          consent_version: consentData.consent_version || this.CURRENT_PRIVACY_VERSION,
          consent_given: consentData.consent_given,
          consent_date: new Date().toISOString(),
          ip_address: consentData.ip_address,
          user_agent: consentData.user_agent,
          withdrawn_date: null
        })
        .select()
        .single();

      if (error) {
        console.error('Error recording consent:', error);
        throw new Error(`Failed to record consent: ${error.message}`);
      }

      console.log(`✅ Privacy consent recorded successfully for user ${userId}`);
      return data;
    } catch (error) {
      console.error('Error recording consent:', error);
      throw error;
    }
  }

  /**
   * Widerruft die Datenschutz-Zustimmung eines Benutzers
   */
  async withdrawConsent(userId: string, ipAddress?: string, userAgent?: string): Promise<boolean> {
    try {
      console.log(`❌ Withdrawing privacy consent for user ${userId}`);

      // Aktuelle Zustimmung finden und als widerrufen markieren
      const { data: currentConsent } = await supabase
        .from('privacy_consents')
        .select('id')
        .eq('user_id', userId)
        .eq('consent_given', true)
        .is('withdrawn_date', null)
        .order('consent_date', { ascending: false })
        .limit(1)
        .single();

      if (currentConsent) {
        const { error: updateError } = await supabase
          .from('privacy_consents')
          .update({
            withdrawn_date: new Date().toISOString()
          })
          .eq('id', currentConsent.id);

        if (updateError) {
          throw updateError;
        }
      }

      // Neuen Widerruf-Eintrag erstellen
      const { error } = await supabase
        .from('privacy_consents')
        .insert({
          user_id: userId,
          consent_version: this.CURRENT_PRIVACY_VERSION,
          consent_given: false,
          consent_date: new Date().toISOString(),
          ip_address: ipAddress,
          user_agent: userAgent
        });

      if (error) {
        console.error('Error withdrawing consent:', error);
        throw new Error(`Failed to withdraw consent: ${error.message}`);
      }

      console.log(`✅ Privacy consent withdrawn successfully for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error withdrawing consent:', error);
      throw error;
    }
  }

  /**
   * Gibt die vollständige Datenschutz-Historie eines Benutzers zurück
   */
  async getConsentHistory(userId: string): Promise<PrivacyConsent[]> {
    try {
      const { data, error } = await supabase
        .from('privacy_consents')
        .select('*')
        .eq('user_id', userId)
        .order('consent_date', { ascending: false });

      if (error) {
        console.error('Error fetching consent history:', error);
        throw new Error(`Failed to fetch consent history: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting consent history:', error);
      throw error;
    }
  }

  /**
   * Prüft, ob eine neue Zustimmung erforderlich ist (z.B. nach Aktualisierung der Datenschutzerklärung)
   */
  async isConsentUpdateRequired(userId: string): Promise<boolean> {
    try {
      const currentConsent = await this.getUserConsent(userId);
      
      if (!currentConsent) {
        return true; // Keine Zustimmung vorhanden
      }

      if (!currentConsent.consent_given) {
        return true; // Zustimmung wurde verweigert
      }

      if (currentConsent.withdrawn_date) {
        return true; // Zustimmung wurde widerrufen
      }

      if (currentConsent.consent_version !== this.CURRENT_PRIVACY_VERSION) {
        return true; // Veraltete Version
      }

      return false;
    } catch (error) {
      console.error('Error checking consent update requirement:', error);
      return true; // Im Zweifelsfall neue Zustimmung anfordern
    }
  }

  /**
   * Lädt den Inhalt der Datenschutzerklärung
   */
  private async getPrivacyPolicyContent(): Promise<string> {
    // In einer realen Anwendung würde dies aus einer Datei oder Datenbank geladen
    return `
# Datenschutzerklärung VYSN Hub

**Letzte Aktualisierung: Januar 2025**

## 1. Verantwortlicher
VYSN GmbH

Mit der Nutzung der VYSN Hub App stimmen Sie der Verarbeitung Ihrer personenbezogenen Daten gemäß dieser Datenschutzerklärung zu.

## 2. Erhebung und Verarbeitung personenbezogener Daten

Wir erheben und verarbeiten folgende Daten:
- Registrierungsdaten (E-Mail, Name)
- Nutzungsdaten (Produktsuchen, Projekte)
- Technische Daten (IP-Adresse, Geräteinformationen)

## 3. Zweck der Datenverarbeitung

- Bereitstellung der App-Funktionen
- Produktberatung und Bestellabwicklung
- Kundenservice und Support

## 4. Ihre Rechte

Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Widerspruch bezüglich Ihrer Daten.

Die vollständige Datenschutzerklärung finden Sie in der App oder auf unserer Website.
    `.trim();
  }
}

export const privacyService = new PrivacyService();
