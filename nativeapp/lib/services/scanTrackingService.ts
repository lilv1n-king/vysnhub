import { apiService } from './apiService';
import { Platform } from 'react-native';
import * as Location from 'expo-location';

export interface ScanTrackingData {
  scannedCode: string;
  scanType?: 'barcode' | 'qr_code' | 'manual_input';
  scanSource?: 'native_app' | 'web_app';
  sessionId?: string;
  deviceInfo?: any;
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;
  actionTaken?: string;
  productFound?: boolean;
  searchResultsCount?: number;
}

export interface ScanRecord {
  id: string;
  scannedCode: string;
  scanType: string;
  scanSource: string;
  productFound: boolean;
  productItemNumber?: string;
  deviceInfo?: any;
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;
  sessionId?: string;
  actionTaken?: string;
  searchResultsCount: number;
  scannedAt: string;
  createdAt: string;
}

export class ScanTrackingService {
  private sessionId: string;
  private deviceInfo: any;

  constructor() {
    // Generate unique session ID
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Collect device info
    this.deviceInfo = {
      platform: Platform.OS,
      version: Platform.Version,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Scan-Event tracken
   */
  async trackScan(data: ScanTrackingData): Promise<boolean> {
    try {
      // Skip location for now to avoid issues
      let locationData: { latitude?: number; longitude?: number; locationAccuracy?: number } = {};

      const scanData = {
        scannedCode: data.scannedCode,
        scanType: data.scanType || 'barcode',
        scanSource: data.scanSource || 'native_app',
        sessionId: data.sessionId || this.sessionId,
        deviceInfo: data.deviceInfo || this.deviceInfo,
        actionTaken: data.actionTaken,
        productFound: data.productFound,
        searchResultsCount: data.searchResultsCount,
        ...locationData
      };

      const response = await apiService.post('/api/scan-tracking', scanData);
      
      if (response && typeof response === 'object' && 'success' in response) {
        return response.success;
      } else {
        console.error('❌ Invalid scan tracking response format:', response);
        return false;
      }
    } catch (error) {
      console.error('❌ Error tracking scan:', error);
      // Don't fail the app if tracking fails
      return false;
    }
  }

  /**
   * Session-Scans abrufen
   */
  async getSessionScans(sessionId?: string): Promise<ScanRecord[]> {
    try {
      const id = sessionId || this.sessionId;
      const response = await apiService.get<{ scans: ScanRecord[] }>(`/scan-tracking/session/${id}`);
      
      if (response.success && response.data?.scans) {
        return response.data.scans;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting session scans:', error);
      return [];
    }
  }

  /**
   * Scan-Record aktualisieren
   */
  async updateScanRecord(scanId: string, updateData: {
    actionTaken?: string;
    productFound?: boolean;
    searchResultsCount?: number;
  }): Promise<boolean> {
    try {
      const response = await apiService.put(`/scan-tracking/${scanId}`, updateData);
      return response.success;
    } catch (error) {
      console.error('Error updating scan record:', error);
      return false;
    }
  }

  /**
   * Aktuelle Session-ID abrufen
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Neue Session starten
   */
  startNewSession(): string {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.deviceInfo = {
      ...this.deviceInfo,
      timestamp: new Date().toISOString()
    };
    return this.sessionId;
  }

  /**
   * Device-Info abrufen
   */
  getDeviceInfo(): any {
    return this.deviceInfo;
  }

  /**
   * Convenience-Methoden für verschiedene Scan-Typen
   */
  
  async trackBarcodeScan(scannedCode: string, options: Partial<ScanTrackingData> = {}): Promise<boolean> {
    return this.trackScan({
      scannedCode,
      scanType: 'barcode',
      ...options
    });
  }

  async trackQRCodeScan(scannedCode: string, options: Partial<ScanTrackingData> = {}): Promise<boolean> {
    return this.trackScan({
      scannedCode,
      scanType: 'qr_code',
      ...options
    });
  }

  async trackManualInput(scannedCode: string, options: Partial<ScanTrackingData> = {}): Promise<boolean> {
    return this.trackScan({
      scannedCode,
      scanType: 'manual_input',
      ...options
    });
  }

  /**
   * Batch-Tracking für mehrere Scans
   */
  async trackMultipleScans(scans: ScanTrackingData[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const scan of scans) {
      const result = await this.trackScan(scan);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }
}

// Singleton instance
export const scanTrackingService = new ScanTrackingService();