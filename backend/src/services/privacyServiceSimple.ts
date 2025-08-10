import { supabase } from '../config/database';
import { User } from '../models/User';

export interface ConsentRequest {
  consent_given: boolean;
  consent_version?: string;
  ip_address?: string;
  user_agent?: string;
  // Vereinfachte Consent-Optionen
  analytics_consent?: boolean;
  marketing_consent?: boolean;
}

export interface ConsentStatus {
  hasValidConsent: boolean;
  currentConsent: {
    given: boolean;
    version: string;
    date: string;
    withdrawn: boolean;
  } | null;
  updateRequired: boolean;
  currentVersion: string;
}

class PrivacyServiceSimple {
  private readonly CURRENT_PRIVACY_VERSION = '1.0';

  /**
   * Gibt die aktuelle Datenschutzerklärung zurück
   */
  async getPrivacyPolicy(language: string = 'en'): Promise<{
    version: string;
    content: string;
    lastUpdated: string;
  }> {
    return {
      version: this.CURRENT_PRIVACY_VERSION,
      content: await this.getPrivacyPolicyContent(language),
      lastUpdated: '2025-01-07'
    };
  }

  /**
   * Prüft, ob ein Benutzer der aktuellen Datenschutzerklärung zugestimmt hat
   */
  async hasValidConsent(userId: string): Promise<boolean> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('privacy_consent_given, privacy_consent_version, privacy_withdrawn_date')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking consent:', error);
        return false;
      }

      if (!profile) {
        return false;
      }

      // Prüfungen für gültige Zustimmung
      const hasConsent = profile.privacy_consent_given === true;
      const isCurrentVersion = profile.privacy_consent_version === this.CURRENT_PRIVACY_VERSION;
      const notWithdrawn = !profile.privacy_withdrawn_date;

      return hasConsent && isCurrentVersion && notWithdrawn;
    } catch (error) {
      console.error('Error checking valid consent:', error);
      return false;
    }
  }

  /**
   * Gibt den Datenschutz-Zustimmungsstatus eines Benutzers zurück
   */
  async getConsentStatus(userId: string): Promise<ConsentStatus> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('privacy_consent_given, privacy_consent_version, privacy_consent_date, privacy_withdrawn_date')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        return {
          hasValidConsent: false,
          currentConsent: null,
          updateRequired: true,
          currentVersion: this.CURRENT_PRIVACY_VERSION
        };
      }

      const hasValidConsent = await this.hasValidConsent(userId);
      const updateRequired = !hasValidConsent;

      const currentConsent = profile.privacy_consent_date ? {
        given: profile.privacy_consent_given || false,
        version: profile.privacy_consent_version || '',
        date: profile.privacy_consent_date,
        withdrawn: !!profile.privacy_withdrawn_date
      } : null;

      return {
        hasValidConsent,
        currentConsent,
        updateRequired,
        currentVersion: this.CURRENT_PRIVACY_VERSION
      };
    } catch (error) {
      console.error('Error getting consent status:', error);
      return {
        hasValidConsent: false,
        currentConsent: null,
        updateRequired: true,
        currentVersion: this.CURRENT_PRIVACY_VERSION
      };
    }
  }

  /**
   * Speichert die Datenschutz-Zustimmung eines Benutzers
   */
  async recordConsent(userId: string, consentData: ConsentRequest): Promise<boolean> {
    try {
      console.log(`📋 Recording privacy consent for user ${userId}: ${consentData.consent_given ? 'ACCEPTED' : 'DECLINED'}`);

      const updateData: Partial<User> = {
        privacy_consent_given: consentData.consent_given,
        privacy_consent_version: consentData.consent_version || this.CURRENT_PRIVACY_VERSION,
        privacy_consent_date: new Date().toISOString(),
        privacy_consent_ip: consentData.ip_address,
        privacy_consent_user_agent: consentData.user_agent,
        privacy_withdrawn_date: consentData.consent_given ? undefined : new Date().toISOString(),
        // Vereinfachte Consent-Felder
        analytics_consent: consentData.analytics_consent || false,
        marketing_consent: consentData.marketing_consent || false,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        console.error('Error recording consent:', error);
        throw new Error(`Failed to record consent: ${error.message}`);
      }

      console.log(`✅ Privacy consent recorded successfully for user ${userId}`);
      return true;
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

      const updateData: Partial<User> = {
        privacy_consent_given: false,
        privacy_withdrawn_date: new Date().toISOString(),
        privacy_consent_ip: ipAddress,
        privacy_consent_user_agent: userAgent,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

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
   * Prüft, ob eine neue Zustimmung erforderlich ist
   */
  async isConsentUpdateRequired(userId: string): Promise<boolean> {
    try {
      const status = await this.getConsentStatus(userId);
      return status.updateRequired;
    } catch (error) {
      console.error('Error checking consent update requirement:', error);
      return true; // Im Zweifelsfall neue Zustimmung anfordern
    }
  }

  /**
   * Gibt die vereinfachte Datenschutz-Historie zurück
   */
  async getConsentHistory(userId: string): Promise<Array<{
    action: string;
    date: string;
    version: string;
    ip_address?: string;
  }>> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('privacy_consent_given, privacy_consent_version, privacy_consent_date, privacy_withdrawn_date, privacy_consent_ip')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        return [];
      }

      const history: Array<{
        action: string;
        date: string;
        version: string;
        ip_address?: string;
      }> = [];

      // Zustimmung
      if (profile.privacy_consent_date) {
        history.push({
          action: profile.privacy_consent_given ? 'consent_given' : 'consent_declined',
          date: profile.privacy_consent_date,
          version: profile.privacy_consent_version || '',
          ip_address: profile.privacy_consent_ip
        });
      }

      // Widerruf
      if (profile.privacy_withdrawn_date) {
        history.push({
          action: 'consent_withdrawn',
          date: profile.privacy_withdrawn_date,
          version: profile.privacy_consent_version || '',
          ip_address: profile.privacy_consent_ip
        });
      }

      return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error getting consent history:', error);
      return [];
    }
  }

  /**
   * Lädt den Inhalt der Datenschutzerklärung
   */
  private async getPrivacyPolicyContent(language: string = 'en'): Promise<string> {
    if (language === 'de') {
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

Die vollständige Datenschutzerklärung finden Sie auf unserer Website unter: https://vysn.de/datenschutz

## 5. Kontakt

Bei Fragen zum Datenschutz: datenschutz@vysn.de
      `.trim();
    }

    // English version
    return `
# VYSN Hub Privacy Policy

**Last Updated: January 2025**

## 1. Data Controller
VYSN GmbH

By using the VYSN Hub app, you consent to the processing of your personal data in accordance with this privacy policy.

## 2. Collection and Processing of Personal Data

We collect and process the following data:
- Registration data (email, name)
- Usage data (product searches, projects)
- Technical data (IP address, device information)

## 3. Purpose of Data Processing

- Providing app functionality
- Product consultation and order processing
- Customer service and support

## 4. Your Rights

You have the right to access, rectify, delete and object to your data.

The complete privacy policy can be found on our website at: https://vysn.de/privacy

## 5. Contact

For privacy questions: privacy@vysn.de
    `.trim();
  }
}

export const privacyServiceSimple = new PrivacyServiceSimple();
