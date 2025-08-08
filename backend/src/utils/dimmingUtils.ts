/**
 * Dimmbarkeit-Utility Module
 * 
 * Dieses Modul bietet Funktionen für die Suche nach dimmbaren Produkten
 * basierend auf verschiedenen Steering-Technologien.
 * 
 * Steering-Werte aus DB-Analyse:
 * '1-10 V', 'Casambi/DALI', 'DALI', 'DALI/Triac (TED)', 'On/Off', 
 * 'Touch dimmable', 'Triac (TED)', 'Wattage selection', 'Zigbee', 
 * 'Zigbee/DALI', 'Zigbee/Triac (TED)'
 * 
 * Operating Mode: '245mA', 'Low voltage (3-48V)', 'Mains power (230V)'
 */

import { supabase, Product } from '../config/database';

export type DimmingType = 'triac' | 'dali' | 'zigbee' | 'touch' | 'voltage' | 'wattage' | 'on_off';

export interface DimmingCriteria {
  dimmable?: boolean;
  steeringType?: DimmingType;
  dimToWarm?: boolean;
  specificSteering?: string;
}

/**
 * Mapping von Steering-Werten zu Dimming-Typen
 */
export const STEERING_MAPPING = {
  triac: ['Triac (TED)', 'DALI/Triac (TED)', 'Zigbee/Triac (TED)'],
  dali: ['DALI', 'Casambi/DALI', 'DALI/Triac (TED)', 'Zigbee/DALI'],
  zigbee: ['Zigbee', 'Zigbee/DALI', 'Zigbee/Triac (TED)'],
  touch: ['Touch dimmable'],
  voltage: ['1-10 V'],
  wattage: ['Wattage selection'],
  on_off: ['On/Off']
} as const;

/**
 * Alle dimmbaren Steering-Werte (nicht On/Off)
 */
export const DIMMABLE_STEERING = [
  '1-10 V', 'Casambi/DALI', 'DALI', 'DALI/Triac (TED)', 
  'Touch dimmable', 'Triac (TED)', 'Wattage selection', 
  'Zigbee', 'Zigbee/DALI', 'Zigbee/Triac (TED)'
];

/**
 * Extrahiert Dimmbarkeits-Anforderungen aus Benutzer-Nachrichten
 * 
 * @param userMessage - Benutzer-Nachricht
 * @returns Erkannte Dimming-Kriterien
 * 
 * @example
 * extractDimmingFromMessage("dimmbare LED") // { dimmable: true }
 * extractDimmingFromMessage("Triac dimmbar") // { dimmable: true, steeringType: "triac" }
 * extractDimmingFromMessage("dim to warm") // { dimToWarm: true }
 */
export function extractDimmingFromMessage(userMessage: string): DimmingCriteria {
  const message = userMessage.toLowerCase();
  const criteria: DimmingCriteria = {};

  // Grundlegende Dimmbarkeit
  if (message.includes('dimmbar') || message.includes('dimmen') || 
      message.includes('dimmable') || message.includes('dimming')) {
    criteria.dimmable = true;
  }

  // Dim to Warm Funktion
  if (message.includes('dim to warm') || message.includes('warmton') || 
      message.includes('farbtemperatur dimmen')) {
    criteria.dimToWarm = true;
    criteria.dimmable = true;
  }

  // Spezifische Steering-Typen
  if (message.includes('triac')) {
    criteria.steeringType = 'triac';
    criteria.dimmable = true;
  } else if (message.includes('dali')) {
    criteria.steeringType = 'dali';
    criteria.dimmable = true;
  } else if (message.includes('zigbee')) {
    criteria.steeringType = 'zigbee';
    criteria.dimmable = true;
  } else if (message.includes('touch') && message.includes('dimm')) {
    criteria.steeringType = 'touch';
    criteria.dimmable = true;
  } else if (message.includes('1-10v') || message.includes('1 10v')) {
    criteria.steeringType = 'voltage';
    criteria.dimmable = true;
  }

  // On/Off explizit
  if (message.includes('on/off') || message.includes('ein/aus') || 
      message.includes('nicht dimmbar')) {
    criteria.dimmable = false;
    criteria.steeringType = 'on_off';
  }

  return criteria;
}

/**
 * Sucht Produkte nach Dimming-Kriterien
 * 
 * @param criteria - Dimming-Kriterien
 * @param limit - Maximale Anzahl Ergebnisse
 * @returns Gefilterte Produkte
 * 
 * @example
 * const dimmableProducts = await searchByDimming({ dimmable: true });
 * const triacProducts = await searchByDimming({ steeringType: "triac" });
 */
export async function searchByDimming(
  criteria: DimmingCriteria,
  limit: number = 50
): Promise<{ products: Product[]; filters: string[]; totalCount: number }> {
  const filters: string[] = [];
  
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('availability', true);

    // Spezifischer Steering-Typ
    if (criteria.steeringType) {
      const steeringValues = STEERING_MAPPING[criteria.steeringType];
      query = query.in('steering', steeringValues);
      filters.push(`steering type: ${criteria.steeringType}`);
    }
    // Allgemeine Dimmbarkeit
    else if (criteria.dimmable === true) {
      query = query.in('steering', DIMMABLE_STEERING);
      filters.push('dimmable products');
    }
    // Explizit nicht dimmbar
    else if (criteria.dimmable === false) {
      query = query.eq('steering', 'On/Off');
      filters.push('non-dimmable (On/Off)');
    }

    // Dim to Warm Funktionalität
    if (criteria.dimToWarm) {
      query = query.or(`cct_switch_value.ilike.%1800-3000%,vysn_name.ilike.%dim to warm%`);
      filters.push('dim to warm capability');
    }

    query = query.order('gross_price', { ascending: true }).limit(limit);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Fehler bei der Dimming-Suche: ${error.message}`);
    }

    const products = data || [];

    return {
      products,
      filters,
      totalCount: products.length
    };

  } catch (error) {
    console.error('Fehler bei der Dimming-Suche:', error);
    throw error;
  }
}

/**
 * Prüft ob ein Produkt dimmbar ist
 * 
 * @param product - Produkt
 * @returns true wenn dimmbar
 */
export function isDimmable(product: Product): boolean {
  if (!product.steering) return false;
  return DIMMABLE_STEERING.includes(product.steering);
}

/**
 * Bestimmt Dimming-Typ eines Produkts
 * 
 * @param product - Produkt
 * @returns Dimming-Typ oder null
 */
export function getDimmingType(product: Product): DimmingType | null {
  if (!product.steering) return null;
  
  for (const [type, steeringValues] of Object.entries(STEERING_MAPPING)) {
    if ((steeringValues as readonly string[]).includes(product.steering)) {
      return type as DimmingType;
    }
  }
  
  return null;
}

/**
 * Prüft ob Produkt Dim-to-Warm Funktion hat
 * 
 * @param product - Produkt
 * @returns true wenn Dim-to-Warm verfügbar
 */
export function hasDimToWarm(product: Product): boolean {
  if (product.cct_switch_value?.includes('1800-3000')) return true;
  if (product.vysn_name?.toLowerCase().includes('dim to warm')) return true;
  return false;
}

/**
 * Formatiert Steering-Information für Anzeige
 * 
 * @param steering - Steering-Wert
 * @returns Benutzerfreundliche Beschreibung
 */
export function formatSteering(steering: string): string {
  const steeringDescriptions: Record<string, string> = {
    'On/Off': 'Ein/Aus (nicht dimmbar)',
    'Triac (TED)': 'Triac dimmbar',
    'DALI': 'DALI dimmbar',
    'Touch dimmable': 'Touch dimmbar',
    '1-10 V': '1-10V dimmbar',
    'Zigbee': 'Zigbee smart dimmbar',
    'Wattage selection': 'Wattage schaltbar',
    'DALI/Triac (TED)': 'DALI/Triac kompatibel',
    'Casambi/DALI': 'Casambi/DALI smart',
    'Zigbee/DALI': 'Zigbee/DALI kompatibel',
    'Zigbee/Triac (TED)': 'Zigbee/Triac kompatibel'
  };

  return steeringDescriptions[steering] || steering;
}

/**
 * Prüft ob eine Nachricht nach Dimming-Funktionen sucht
 * 
 * @param userMessage - Benutzer-Nachricht
 * @returns true wenn nach Dimming gesucht wird
 */
export function isDimmingRequest(userMessage: string): boolean {
  const dimmingKeywords = [
    'dimmbar', 'dimmen', 'dimmable', 'dimming', 'triac', 'dali',
    'zigbee', 'touch', 'dim to warm', 'helligkeit', 'brightness',
    'steuerung', '1-10v', 'on/off', 'ein/aus'
  ];
  
  const message = userMessage.toLowerCase();
  return dimmingKeywords.some(keyword => message.includes(keyword));
}

/**
 * Berechnet Dimming-Statistiken für Produktliste
 * 
 * @param products - Produktliste
 * @returns Dimming-Statistiken
 */
export function calculateDimmingStats(products: Product[]): {
  dimmable: number;
  nonDimmable: number;
  steeringTypes: Record<string, number>;
  total: number;
} {
  const stats = {
    dimmable: 0,
    nonDimmable: 0,
    steeringTypes: {} as Record<string, number>,
    total: products.length
  };

  products.forEach(product => {
    if (product.steering) {
      stats.steeringTypes[product.steering] = 
        (stats.steeringTypes[product.steering] || 0) + 1;
      
      if (isDimmable(product)) {
        stats.dimmable++;
      } else {
        stats.nonDimmable++;
      }
    }
  });

  return stats;
}