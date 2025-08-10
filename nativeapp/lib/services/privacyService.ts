import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './apiService';

export interface PrivacyPolicy {
  version: string;
  content: string;
  lastUpdated: string;
}

export interface PrivacyConsent {
  id: string;
  user_id: string;
  consent_version: string;
  consent_given: boolean;
  consent_date: string;
  withdrawn_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ConsentStatus {
  hasValidConsent: boolean;
  currentConsent: PrivacyConsent | null;
  updateRequired: boolean;
  currentVersion: string;
}

class PrivacyService {
  private readonly PRIVACY_CONSENT_KEY = 'privacy_consent_status';
  private readonly PRIVACY_VERSION_KEY = 'privacy_version_accepted';

  /**
   * Lädt die aktuelle Datenschutzerklärung
   */
  async getPrivacyPolicy(language: string = 'en'): Promise<PrivacyPolicy> {
    try {
      const response = await apiService.get<PrivacyPolicy>(`/api/privacy/policy?lang=${language}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.error || 'Failed to load privacy policy');
    } catch (error) {
      console.error('Error loading privacy policy:', error);
      // Fallback zu lokaler Version
      return {
        version: '1.0',
        content: this.getFallbackPrivacyPolicy(language),
        lastUpdated: '2025-01-07'
      };
    }
  }

  /**
   * Prüft den Zustimmungsstatus des aktuellen Benutzers
   */
  async getConsentStatus(): Promise<ConsentStatus | null> {
    try {
      const response = await apiService.get<ConsentStatus>('/api/privacy/consent');
      
      if (response.success && response.data) {
        // Status auch lokal speichern
        await this.storeLocalConsentStatus(response.data);
        return response.data;
      }
      
      throw new Error(response.error || 'Failed to get consent status');
    } catch (error) {
      console.error('Error getting consent status:', error);
      // Fallback zu lokalem Status
      return await this.getLocalConsentStatus();
    }
  }

  /**
   * Speichert die Datenschutz-Zustimmung
   */
  async recordConsent(consentGiven: boolean, granularConsent?: {
    analytics_consent?: boolean;
    marketing_consent?: boolean;
  }, version?: string): Promise<boolean> {
    try {
      const response = await apiService.post('/api/privacy/consent', {
        consent_given: consentGiven,
        consent_version: version || '1.0',
        // Vereinfachte Consent-Optionen
        analytics_consent: granularConsent?.analytics_consent || false,
        marketing_consent: granularConsent?.marketing_consent || false,
      });

      if (response.success) {
        // Erfolg lokal speichern
        await this.storeLocalConsent(consentGiven, version || '1.0');
        console.log(`✅ Privacy consent ${consentGiven ? 'accepted' : 'declined'}`);
        return true;
      }

      throw new Error(response.error || 'Failed to record consent');
    } catch (error) {
      console.error('Error recording consent:', error);
      
      // Als Fallback lokal speichern
      if (consentGiven) {
        await this.storeLocalConsent(consentGiven, version || '1.0');
      }
      
      throw error;
    }
  }

  /**
   * Widerruft die Datenschutz-Zustimmung
   */
  async withdrawConsent(): Promise<boolean> {
    try {
      const response = await apiService.delete('/api/privacy/consent');

      if (response.success) {
        // Lokal löschen
        await this.clearLocalConsent();
        console.log('✅ Privacy consent withdrawn');
        return true;
      }

      throw new Error(response.error || 'Failed to withdraw consent');
    } catch (error) {
      console.error('Error withdrawing consent:', error);
      // Lokal trotzdem löschen
      await this.clearLocalConsent();
      throw error;
    }
  }

  /**
   * Prüft, ob eine Zustimmung erforderlich ist
   */
  async isConsentRequired(): Promise<boolean> {
    try {
      const status = await this.getConsentStatus();
      return !status?.hasValidConsent || status.updateRequired;
    } catch (error) {
      console.error('Error checking consent requirement:', error);
      // Im Zweifelsfall Zustimmung anfordern
      return true;
    }
  }

  /**
   * Gibt die Datenschutz-Historie zurück
   */
  async getConsentHistory(): Promise<PrivacyConsent[]> {
    try {
      const response = await apiService.get<PrivacyConsent[]>('/api/privacy/consent/history');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.error || 'Failed to get consent history');
    } catch (error) {
      console.error('Error getting consent history:', error);
      return [];
    }
  }

  /**
   * Lokale Hilfsmethoden
   */
  private async storeLocalConsent(consentGiven: boolean, version: string): Promise<void> {
    try {
      const consentData = {
        consentGiven,
        version,
        timestamp: Date.now()
      };
      
      await AsyncStorage.setItem(this.PRIVACY_CONSENT_KEY, JSON.stringify(consentData));
      await AsyncStorage.setItem(this.PRIVACY_VERSION_KEY, version);
    } catch (error) {
      console.error('Error storing local consent:', error);
    }
  }

  private async storeLocalConsentStatus(status: ConsentStatus): Promise<void> {
    try {
      await AsyncStorage.setItem('privacy_status_cache', JSON.stringify(status));
    } catch (error) {
      console.error('Error storing local consent status:', error);
    }
  }

  private async getLocalConsentStatus(): Promise<ConsentStatus | null> {
    try {
      const cached = await AsyncStorage.getItem('privacy_status_cache');
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting local consent status:', error);
      return null;
    }
  }

  private async clearLocalConsent(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.PRIVACY_CONSENT_KEY,
        this.PRIVACY_VERSION_KEY,
        'privacy_status_cache'
      ]);
    } catch (error) {
      console.error('Error clearing local consent:', error);
    }
  }

  private getFallbackPrivacyPolicy(language: string = 'en'): string {
    if (language === 'de') {
      return `
# Datenschutzerklärung VYSN Hub

**Letzte Aktualisierung: Januar 2025**

## 1. Verantwortlicher
VYSN GmbH

## 2. Erhebung und Verarbeitung personenbezogener Daten

Mit der Nutzung der VYSN Hub App stimmen Sie der Verarbeitung Ihrer personenbezogenen Daten gemäß dieser Datenschutzerklärung zu.

### Erhobene Daten:
- Registrierungsdaten (E-Mail, Name)
- Nutzungsdaten (Produktsuchen, Projekte)
- Technische Daten (IP-Adresse, Geräteinformationen)

### Zweck der Verarbeitung:
- Bereitstellung der App-Funktionen
- Produktberatung und Bestellabwicklung
- Kundenservice und Support

## 3. Ihre Rechte

Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Widerspruch bezüglich Ihrer Daten.

Die vollständige Datenschutzerklärung finden Sie auf unserer Website unter: https://vysn.de/datenschutz

## 4. Kontakt

Bei Fragen zum Datenschutz: datenschutz@vysn.de
      `.trim();
    }

    // English fallback
    return `
# VYSN Hub Privacy Policy

**Last Updated: January 2025**

## 1. Data Controller
VYSN GmbH

## 2. Collection and Processing of Personal Data

By using the VYSN Hub app, you consent to the processing of your personal data in accordance with this privacy policy.

### Data Collected:
- Registration data (email, name)
- Usage data (product searches, projects)
- Technical data (IP address, device information)

### Purpose of Processing:
- Providing app functionality
- Product consultation and order processing
- Customer service and support

## 3. Your Rights

You have the right to access, rectify, delete and object to your data.

The complete privacy policy can be found on our website at: https://vysn.de/privacy

## 4. Contact

For privacy questions: privacy@vysn.de
    `.trim();
  }
}

export const privacyService = new PrivacyService();
