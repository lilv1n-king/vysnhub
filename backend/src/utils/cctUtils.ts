/**
 * CCT (Color Temperature) Utility Module
 * 
 * Dieses Modul behandelt alle CCT-bezogenen Operationen:
 * - Extraktion von CCT-Werten aus Nachrichten
 * - CCT-Switch Erkennung
 * - CCT-basierte Produktsuche
 */

import { supabase, Product } from '../config/database';

/**
 * Verfügbare CCT-Werte im System
 */
export const AVAILABLE_CCT_VALUES = [2700, 3000, 4000];

/**
 * CCT-Begriffe Mapping
 */
export const CCT_TERMS = {
  warmweiß: 2700,
  'warm weiß': 2700,
  warmweiss: 2700, 
  'warm weiss': 2700,
  neutralweiß: 3000,
  'neutral weiß': 3000,
  neutralweiss: 3000,
  'neutral weiss': 3000,
  kaltweiß: 4000,
  'kalt weiß': 4000,
  kaltweiss: 4000,
  'kalt weiss': 4000,
  'dim to warm': 'DTW', // Spezielle DTW-Markierung
  'dim-to-warm': 'DTW',
  'dimtowarm': 'DTW'
};

/**
 * Extrahiert CCT-Wert aus Benutzer-Nachricht
 */
export function extractCCTFromMessage(message: string): number | null {
  const lowerMessage = message.toLowerCase();
  
  // Direkte CCT-Angaben (z.B. "3000k", "3000 kelvin")
  const cctMatch = lowerMessage.match(/(\d{4})k?\s*(?:kelvin)?/i);
  if (cctMatch) {
    const cct = parseInt(cctMatch[1]);
    if (AVAILABLE_CCT_VALUES.includes(cct as any)) {
      return cct;
    }
  }
  
  // Farbtemperatur-Begriffe (außer DTW)
  for (const [term, cctValue] of Object.entries(CCT_TERMS)) {
    if (lowerMessage.includes(term) && cctValue !== 'DTW') {
      return cctValue as number;
    }
  }
  
  return null;
}

/**
 * Prüft ob CCT-Switch gefordert wird
 */
export function isCCTSwitchRequested(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return lowerMessage.includes('cct switch') || 
         lowerMessage.includes('cct-switch') ||
         lowerMessage.includes('schaltbar') || 
         lowerMessage.includes('umschaltbar') ||
         lowerMessage.includes('switchable') ||
         lowerMessage.includes('wechselbar');
}

/**
 * Prüft ob nach CCT gesucht wird (entweder spezifischer Wert oder Switch)
 */
export function isCCTRequest(message: string): boolean {
  return extractCCTFromMessage(message) !== null || isCCTSwitchRequested(message);
}

/**
 * Prüft ob "dim to warm" angefragt wird
 */
export function isDimToWarmRequested(message: string): boolean {
  const msg = message.toLowerCase();
  return msg.includes('dim to warm') || 
         msg.includes('dim-to-warm') || 
         msg.includes('dimtowarm') ||
         msg.includes('1800-3000') ||
         (msg.includes('1800') && msg.includes('3000'));
}

/**
 * Prüft ob nach dimmbaren Produkten gesucht wird
 */
export function isDimmableRequested(message: string): boolean {
  const msg = message.toLowerCase();
  return msg.includes('dimmbar') || 
         msg.includes('dimmable') ||
         msg.includes('dimming') ||
         isDimToWarmRequested(message);
}

/**
 * Sucht Produkte mit spezifischem CCT-Wert oder CCT-Switch
 */
export async function searchByCCT(
  cctValue?: number,
  cctSwitchRequested: boolean = false,
  additionalFilters: Record<string, any> = {},
  limit: number = 50
): Promise<{ products: Product[], responseTime: number, filters: string[] }> {
  const startTime = Date.now();
  const filters: string[] = [];

  try {
    let products: Product[] = [];

    if (cctValue) {
      // Suche nach exaktem CCT-Wert ODER CCT-Switch der den Wert enthält
      const [directCCT, switchCCT] = await Promise.all([
        // Direkte CCT-Suche
        supabase
          .from('products')
          .select('*')
          .eq('availability', true)
          .eq('cct', cctValue)
          .limit(limit),
        
        // CCT-Switch Suche
        supabase
          .from('products')
          .select('*')
          .eq('availability', true)
          .ilike('cct_switch_value', `%${cctValue}%`)
          .limit(limit)
      ]);

      const directProducts = directCCT.data || [];
      const switchProducts = switchCCT.data || [];

      // Kombiniere Ergebnisse und entferne Duplikate
      const productMap = new Map();
      [...directProducts, ...switchProducts].forEach(product => {
        productMap.set(product.id, product);
      });
      
      products = Array.from(productMap.values());
      filters.push(`CCT: ${cctValue}K (direct or switch)`);
      
    } else if (cctSwitchRequested) {
      // Nur CCT-Switch Produkte
      const result = await supabase
        .from('products')
        .select('*')
        .eq('availability', true)
        .not('cct_switch_value', 'is', null)
        .limit(limit);

      products = result.data || [];
      filters.push('CCT switch capable');
    } else if (additionalFilters.dimToWarm) {
      // Spezielle Dim-to-Warm Suche wenn kein CCT-Wert angegeben
      console.log('DEBUG: Searching for dim-to-warm products');
      
      // Optimierte Dim-to-Warm Suche - kombiniere verschiedene Ansätze
      const results = await Promise.all([
        // Primär: CCT Switch mit 1800-3000 (dim to warm)
        supabase
          .from('products')
          .select('*')
          .eq('availability', true)
          .ilike('cct_switch_value', '%1800%')
          .limit(limit),
          
        // Sekundär: Produktname mit "dim to warm"
        supabase
          .from('products')
          .select('*')
          .eq('availability', true)
          .ilike('vysn_name', '%dim to warm%')
          .limit(limit)
      ]);
      
      console.log('DEBUG: CCT Switch mit 1800:', results[0].data?.length || 0);
      console.log('DEBUG: Produktname dim to warm:', results[1].data?.length || 0);
      
      // Kombiniere Ergebnisse und entferne Duplikate
      const dimToWarmProducts = new Map();
      results.forEach(result => {
        result.data?.forEach(product => {
          dimToWarmProducts.set(product.id, product);
        });
      });
      
      const result = { data: Array.from(dimToWarmProducts.values()) };

      console.log('DEBUG: Dim-to-warm DB query result:', result.data?.length || 0, 'products');

      products = result.data || [];
      filters.push('Dim to Warm (1800-3000K)');
    }

    // Spezielle zusätzliche Filter anwenden (nur wenn nicht schon in der DB-Query behandelt)
    if (Object.keys(additionalFilters).length > 0 && products.length > 0 && !additionalFilters.dimToWarm) {
      if (additionalFilters.dimmable) {
        // Dimmbar Spezialfilter
        products = products.filter(product => 
          product.operating_mode?.toLowerCase().includes('dimmbar') ||
          product.power_switch_value?.toLowerCase().includes('dimmbar') ||
          product.vysn_name?.toLowerCase().includes('dimmbar')
        );
        filters.push('Dimmable');
      }
      
      // Andere Filter (normale Product-Properties)
      const { dimToWarm, dimmable, ...normalFilters } = additionalFilters;
      if (Object.keys(normalFilters).length > 0) {
        products = products.filter(product => {
          return Object.entries(normalFilters).every(([key, value]) => {
            if (Array.isArray(value)) {
              return value.includes(product[key as keyof Product]);
            }
            return product[key as keyof Product] === value;
          });
        });
      }
    }

    const responseTime = Date.now() - startTime;
    
    return {
      products: products.slice(0, limit),
      responseTime,
      filters
    } as any;

  } catch (error) {
    console.error('Error in searchByCCT:', error);
    throw error;
  }
}

/**
 * Gibt alle verfügbaren CCT-Switch Optionen zurück
 */
export async function getAvailableCCTSwitchOptions(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('cct_switch_value')
      .not('cct_switch_value', 'is', null);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    const uniqueOptions = [...new Set(data.map(item => item.cct_switch_value))];
    return uniqueOptions.sort();
    
  } catch (error) {
    console.error('Error getting CCT switch options:', error);
    throw error;
  }
}

/**
 * Formatiert CCT-Informationen für Benutzeranzeige
 */
export function formatCCTInfo(product: Product): string {
  const cct = product.cct;
  const cctSwitch = product.cct_switch_value;
  
  if (cct && cctSwitch) {
    return `${cct}K (Switch: ${cctSwitch})`;
  } else if (cct) {
    return `${cct}K`;
  } else if (cctSwitch) {
    return `CCT Switch: ${cctSwitch}`;
  }
  
  return 'N/A';
} 