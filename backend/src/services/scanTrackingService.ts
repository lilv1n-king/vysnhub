import { supabase } from '../config/database';

export interface ScanData {
  scannedCode: string;
  scanType: 'barcode' | 'qr_code' | 'manual_input';
  scanSource: 'native_app' | 'web_app';
  deviceInfo?: any;
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;
  sessionId?: string;
  actionTaken?: string;
  productFound?: boolean;
  productId?: string;
  productItemNumber?: string;
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

export interface ScanStatistics {
  totalScans: number;
  successfulScans: number;
  uniqueSessions: number;
  scansBySource: { source: string; count: number }[];
  scansByType: { type: string; count: number }[];
  dailyScans: { date: string; count: number }[];
  topCodes: { code: string; count: number; successRate: number }[];
}

export class ScanTrackingService {
  
  /**
   * Neuen Scan-Record erstellen
   */
  async createScanRecord(data: ScanData): Promise<ScanRecord> {
    try {
      // Erst versuchen, Produkt-Informationen zu finden
      let productFound = false;
      let productId = null;
      let productItemNumber = null;

      if (data.scannedCode) {
        // Prüfen ob es ein Barcode ist (numerisch)
        if (/^\d+$/.test(data.scannedCode)) {
          // Nach Barcode suchen
          const { data: productByBarcode } = await supabase
            .from('products')
            .select('id, item_number_vysn')
            .eq('barcode_number', data.scannedCode)
            .eq('availability', true)
            .single();

          if (productByBarcode) {
            productFound = true;
            productId = String(productByBarcode.id); // INTEGER zu String konvertieren
            productItemNumber = productByBarcode.item_number_vysn;
          }
        }

        // Wenn kein Barcode-Match, nach Item Number suchen
        if (!productFound) {
          const { data: productByItemNumber } = await supabase
            .from('products')
            .select('id, item_number_vysn')
            .eq('item_number_vysn', data.scannedCode)
            .eq('availability', true)
            .single();

          if (productByItemNumber) {
            productFound = true;
            productId = String(productByItemNumber.id); // INTEGER zu String konvertieren
            productItemNumber = productByItemNumber.item_number_vysn;
          }
        }

        // Wenn immer noch nicht gefunden, allgemeine Suche
        if (!productFound) {
          const { data: searchResults } = await supabase
            .from('products')
            .select('id, item_number_vysn')
            .or(`vysn_name.ilike.%${data.scannedCode}%,short_description.ilike.%${data.scannedCode}%,item_number_vysn.ilike.%${data.scannedCode}%`)
            .eq('availability', true)
            .limit(1);

          if (searchResults && searchResults.length > 0) {
            productFound = true;
            productId = String(searchResults[0].id); // INTEGER zu String konvertieren
            productItemNumber = searchResults[0].item_number_vysn;
          }
        }
      }

      // Datenbank-Einfügung vorbereiten
      // WICHTIG: product_id ist UUID in DB, aber products.id ist INTEGER
      // Lösung: product_id nur speichern wenn es UUID-Format hat, sonst null
      const insertData: any = {
        scanned_code: data.scannedCode,
        scan_type: data.scanType,
        scan_source: data.scanSource,
        product_item_number: productItemNumber,
        product_found: productFound || data.productFound || false,
        device_info: data.deviceInfo || null,
        latitude: data.latitude,
        longitude: data.longitude,
        location_accuracy: data.locationAccuracy,
        session_id: data.sessionId,
        action_taken: data.actionTaken,
        search_results_count: data.searchResultsCount || 0
      };

      // HINWEIS: product_id wird NICHT gespeichert, da Typ-Inkompatibilität zwischen
      // products.id (INTEGER) und barcode_scans.product_id (UUID) besteht
      // Produkt-Referenzierung erfolgt über product_item_number und product_found
      if (productId) {
        console.log(`📝 Produkt gefunden (ID: ${productId}) - Referenzierung über item_number: ${productItemNumber}`);
      }

      // Scan-Record in Datenbank speichern
      const { data: scanRecord, error } = await supabase
        .from('barcode_scans')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Fehler beim Erstellen des Scan-Records:', error);
        console.error('Scan data being inserted:', insertData);
        throw new Error(`Scan-Record konnte nicht erstellt werden: ${error.message}`);
      }

      if (!scanRecord) {
        throw new Error('Scan-Record wurde nicht zurückgegeben');
      }

      return this.mapDbRecordToScanRecord(scanRecord);
    } catch (error) {
      console.error('Fehler in createScanRecord:', error);
      throw error;
    }
  }

  /**
   * Scan-Record aktualisieren
   */
  async updateScanRecord(scanId: string, updateData: Partial<ScanData>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('barcode_scans')
        .update({
          action_taken: updateData.actionTaken,
          product_found: updateData.productFound,
          search_results_count: updateData.searchResultsCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', scanId);

      if (error) {
        console.error('Fehler beim Aktualisieren des Scan-Records:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Fehler in updateScanRecord:', error);
      return false;
    }
  }

  /**
   * Alle Scans abrufen (für Admin-Zwecke)
   */
  async getAllScans(limit: number = 50, offset: number = 0): Promise<ScanRecord[]> {
    try {
      const { data, error } = await supabase
        .from('barcode_scans')
        .select('*')
        .order('scanned_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Fehler beim Abrufen aller Scans:', error);
        throw new Error(`Scans konnten nicht abgerufen werden: ${error.message}`);
      }

      return data ? data.map(this.mapDbRecordToScanRecord) : [];
    } catch (error) {
      console.error('Fehler in getAllScans:', error);
      throw error;
    }
  }

  /**
   * Session-Scans abrufen
   */
  async getSessionScans(sessionId: string, limit: number = 50, offset: number = 0): Promise<ScanRecord[]> {
    try {
      const { data, error } = await supabase
        .from('barcode_scans')
        .select('*')
        .eq('session_id', sessionId)
        .order('scanned_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Fehler beim Abrufen der Session-Scans:', error);
        throw new Error(`Session-Scans konnten nicht abgerufen werden: ${error.message}`);
      }

      return data ? data.map(this.mapDbRecordToScanRecord) : [];
    } catch (error) {
      console.error('Fehler in getSessionScans:', error);
      throw error;
    }
  }

  /**
   * Scan-Statistiken abrufen
   */
  async getScanStatistics(period: string = '7d'): Promise<ScanStatistics> {
    try {
      // Zeitraum berechnen
      const now = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '1d':
          startDate.setDate(now.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        default:
          startDate.setDate(now.getDate() - 7);
      }

      // Gesamt-Statistiken
      const { data: totalStats } = await supabase
        .from('barcode_scans')
        .select('*')
        .gte('scanned_at', startDate.toISOString());

      const totalScans = totalStats?.length || 0;
      const successfulScans = totalStats?.filter(scan => scan.product_found).length || 0;
      const uniqueSessions = new Set(totalStats?.map(scan => scan.session_id).filter(Boolean)).size;

      // Scans nach Quelle
      const scansBySource = totalStats?.reduce((acc: any, scan) => {
        const source = scan.scan_source;
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});

      const scansBySourceArray = Object.entries(scansBySource || {}).map(([source, count]) => ({
        source,
        count: count as number
      }));

      // Scans nach Typ
      const scansByType = totalStats?.reduce((acc: any, scan) => {
        const type = scan.scan_type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      const scansByTypeArray = Object.entries(scansByType || {}).map(([type, count]) => ({
        type,
        count: count as number
      }));

      // Tägliche Scans
      const dailyScans = totalStats?.reduce((acc: any, scan) => {
        const date = new Date(scan.scanned_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const dailyScansArray = Object.entries(dailyScans || {})
        .map(([date, count]) => ({ date, count: count as number }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Top-Codes
      const codeStats = totalStats?.reduce((acc: any, scan) => {
        const code = scan.scanned_code;
        if (!acc[code]) {
          acc[code] = { count: 0, successful: 0 };
        }
        acc[code].count++;
        if (scan.product_found) {
          acc[code].successful++;
        }
        return acc;
      }, {});

      const topCodes = Object.entries(codeStats || {})
        .map(([code, stats]: [string, any]) => ({
          code,
          count: stats.count,
          successRate: stats.count > 0 ? (stats.successful / stats.count) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalScans,
        successfulScans,
        uniqueSessions,
        scansBySource: scansBySourceArray,
        scansByType: scansByTypeArray,
        dailyScans: dailyScansArray,
        topCodes
      };
    } catch (error) {
      console.error('Fehler in getScanStatistics:', error);
      throw error;
    }
  }

  /**
   * Populäre Codes abrufen
   */
  async getPopularCodes(limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('top_scanned_codes')
        .select('*')
        .order('scan_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Fehler beim Abrufen populärer Codes:', error);
        throw new Error(`Populäre Codes konnten nicht abgerufen werden: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Fehler in getPopularCodes:', error);
      throw error;
    }
  }

  /**
   * DB-Record zu ScanRecord konvertieren
   */
  private mapDbRecordToScanRecord(dbRecord: any): ScanRecord {
    return {
      id: dbRecord.id,
      scannedCode: dbRecord.scanned_code,
      scanType: dbRecord.scan_type,
      scanSource: dbRecord.scan_source,
      productFound: dbRecord.product_found,
      productItemNumber: dbRecord.product_item_number,
      deviceInfo: dbRecord.device_info,
      latitude: dbRecord.latitude,
      longitude: dbRecord.longitude,
      locationAccuracy: dbRecord.location_accuracy,
      sessionId: dbRecord.session_id,
      actionTaken: dbRecord.action_taken,
      searchResultsCount: dbRecord.search_results_count,
      scannedAt: dbRecord.scanned_at,
      createdAt: dbRecord.created_at
    };
  }
}