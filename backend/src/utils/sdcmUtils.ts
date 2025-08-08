/**
 * SDCM-Utility Module
 * 
 * SDCM (Standard Deviation of Color Matching) ist ein Maß für die Farbkonsistenz von LEDs.
 * Niedrigere SDCM-Werte bedeuten bessere Farbkonsistenz.
 * 
 * Typische SDCM-Werte:
 * - < 3: Sehr hohe Farbkonsistenz (Premium)
 * - < 4: Hohe Farbkonsistenz 
 * - < 5: Gute Farbkonsistenz
 * - < 6: Standard Farbkonsistenz
 */

import { supabase, Product } from '../config/database';

export type SDCMCategory = 'premium' | 'hoch' | 'gut' | 'standard';

export interface SDCMCriteria {
  maxSDCM?: number; // z.B. < 6
  minSDCM?: number; 
  sdcmCategory?: SDCMCategory;
  highColorConsistency?: boolean; // < 4
}

/**
 * SDCM-Kategorien
 */
export const SDCM_CATEGORIES = {
  premium: { max: 3 },
  hoch: { max: 4 },
  gut: { max: 5 },
  standard: { max: 6 }
} as const;

/**
 * Bestimmt SDCM-Kategorie basierend auf Wert
 * 
 * @param sdcmValue - SDCM-Wert
 * @returns SDCM-Kategorie
 */
export function getSDCMCategory(sdcmValue: number): SDCMCategory {
  if (sdcmValue <= SDCM_CATEGORIES.premium.max) return 'premium';
  if (sdcmValue <= SDCM_CATEGORIES.hoch.max) return 'hoch';
  if (sdcmValue <= SDCM_CATEGORIES.gut.max) return 'gut';
  return 'standard';
}

/**
 * Extrahiert SDCM-Anforderungen aus Benutzer-Nachrichten
 * 
 * @param userMessage - Benutzer-Nachricht
 * @returns Erkannte SDCM-Kriterien
 * 
 * @example
 * extractSDCMFromMessage("SDCM unter 6") // { maxSDCM: 6 }
 * extractSDCMFromMessage("mindestens SDCM 4") // { minSDCM: 4 }
 * extractSDCMFromMessage("hohe Farbkonsistenz") // { highColorConsistency: true }
 */
export function extractSDCMFromMessage(userMessage: string): SDCMCriteria {
  const message = userMessage.toLowerCase();
  const criteria: SDCMCriteria = {};

  // SDCM-Werte extrahieren - verschiedene Patterns
  const sdcmMatch = message.match(/(?:mit\s+)?sdcm\s*[<>≤≥]?\s*(\d+(?:[.,]\d+)?)/i);
  if (sdcmMatch) {
    const sdcmValue = parseFloat(sdcmMatch[1].replace(',', '.'));
    
    // Analysiere den Kontext um SDCM herum
    const beforeSDCM = message.substring(0, message.indexOf('sdcm')).toLowerCase();
    const afterSDCM = message.substring(message.indexOf('sdcm') + 4).toLowerCase();
    
    // Bestimme ob es min oder max ist basierend auf Kontext
    if (beforeSDCM.includes('mindestens') || beforeSDCM.includes('min') || 
        afterSDCM.includes('mindestens') || message.includes('>') ||
        message.includes('≥')) {
      criteria.minSDCM = sdcmValue;
    } else if (beforeSDCM.includes('unter') || beforeSDCM.includes('max') || 
               beforeSDCM.includes('höchstens') || message.includes('<') ||
               message.includes('≤')) {
      criteria.maxSDCM = sdcmValue;
    } else {
      // Standard-Interpretation: SDCM X bedeutet meist "maximal SDCM X"
      criteria.maxSDCM = sdcmValue;
    }
  }

  // Alternative Schreibweisen
  const sdcmUnderMatch = message.match(/(?:unter|<)\s*(\d+)\s*sdcm/i);
  if (sdcmUnderMatch) {
    criteria.maxSDCM = parseInt(sdcmUnderMatch[1]);
  }

  const sdcmOverMatch = message.match(/(?:über|mindestens|>)\s*(\d+)\s*sdcm/i);
  if (sdcmOverMatch) {
    criteria.minSDCM = parseInt(sdcmOverMatch[1]);
  }

  // Farbkonsistenz-Begriffe
  if (message.includes('hohe farbkonsistenz') || message.includes('high color consistency')) {
    criteria.highColorConsistency = true;
    criteria.maxSDCM = 4;
  }

  if (message.includes('sehr hohe farbkonsistenz') || message.includes('premium farbkonsistenz')) {
    criteria.sdcmCategory = 'premium';
    criteria.maxSDCM = 3;
  }

  return criteria;
}

/**
 * Einfache String-basierte SDCM-Suche
 * 
 * @param userMessage - Benutzer-Nachricht  
 * @param limit - Maximale Anzahl Ergebnisse
 * @returns Gefilterte Produkte
 */
export async function searchBySDCM(
  userMessage: string,
  limit: number = 50
): Promise<{ products: Product[]; filters: string[]; totalCount: number }> {
  const filters: string[] = [];
  
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('availability', true)
      .not('sdcm', 'is', null);

    const message = userMessage.toLowerCase();
    
    // Einfache String-Pattern für SDCM
    if (message.includes('sdcm') || message.includes('farbkonsistenz')) {
      // "unter 6" oder "mindestens 6" Pattern erkennen
      const sdcmMatch = message.match(/(?:sdcm|farbkonsistenz).*?(?:<|unter|max|höchstens|mindestens|min)?\s*(\d+)/);
      if (sdcmMatch) {
        const targetValue = parseInt(sdcmMatch[1]);
        
        // Für "unter 6" oder "SDCM 6" -> suche "<2", "<3", "<4", "<5", "<6"
        if (message.includes('unter') || message.includes('max') || message.includes('<') || 
            (!message.includes('mindestens') && !message.includes('min'))) {
          const sdcmValues = [];
          for (let i = 2; i <= targetValue; i++) {
            sdcmValues.push(`<${i}`);
          }
          
          if (sdcmValues.length > 0) {
            query = query.in('sdcm', sdcmValues);
            filters.push(`SDCM ≤ ${targetValue} (${sdcmValues.join(', ')})`);
          }
        }
        // Für "mindestens 6" -> suche "6", "7", "8", "<7", "<8", etc.
        else if (message.includes('mindestens') || message.includes('min') || message.includes('>')) {
          const sdcmValues = [];
          // Exakte Werte ab dem Zielwert
          for (let i = targetValue; i <= 10; i++) {
            sdcmValues.push(i.toString());
          }
          // "<X" Werte die größer als Zielwert sind
          for (let i = targetValue + 1; i <= 12; i++) {
            sdcmValues.push(`<${i}`);
          }
          
          if (sdcmValues.length > 0) {
            query = query.in('sdcm', sdcmValues);
            filters.push(`SDCM ≥ ${targetValue} (${sdcmValues.join(', ')})`);
          }
        }
      }
      // Keine Zahl gefunden - zeige alle SDCM-Produkte
      else {
        filters.push('All products with SDCM information');
      }
    }

    query = query.order('gross_price', { ascending: true }).limit(limit);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Fehler bei der SDCM-Suche: ${error.message}`);
    }

    const products = data || [];

    return {
      products,
      filters,
      totalCount: products.length
    };

  } catch (error) {
    console.error('Fehler bei der SDCM-Suche:', error);
    throw error;
  }
}

/**
 * Formatiert SDCM-Wert für Anzeige
 * 
 * @param sdcm - SDCM-Wert
 * @returns Formatierter SDCM-String mit Kategorie
 */
export function formatSDCM(sdcm: number | null | undefined): string {
  if (sdcm === null || sdcm === undefined) return 'SDCM nicht verfügbar';

  const category = getSDCMCategory(sdcm);
  const categoryNames = {
    premium: 'Premium',
    hoch: 'Hoch',
    gut: 'Gut',
    standard: 'Standard'
  };

  return `SDCM ${sdcm} (${categoryNames[category]} Farbkonsistenz)`;
}

/**
 * Prüft ob eine Nachricht nach SDCM/Farbkonsistenz sucht
 * 
 * @param userMessage - Benutzer-Nachricht
 * @returns true wenn nach SDCM gesucht wird
 */
export function isSDCMRequest(userMessage: string): boolean {
  const sdcmKeywords = [
    'sdcm', 'farbkonsistenz', 'color consistency', 'farbabweichung',
    'color matching', 'farbgleichmäßigkeit'
  ];
  
  const message = userMessage.toLowerCase();
  return sdcmKeywords.some(keyword => message.includes(keyword));
}

/**
 * Berechnet SDCM-Statistiken für Produktliste
 * 
 * @param products - Produktliste
 * @returns SDCM-Statistiken
 */
export function calculateSDCMStats(products: Product[]): {
  categories: Record<SDCMCategory, number>;
  averageSDCM: number | null;
  highConsistency: number; // SDCM ≤ 4
  total: number;
} {
  const stats = {
    categories: { premium: 0, hoch: 0, gut: 0, standard: 0 } as Record<SDCMCategory, number>,
    averageSDCM: null as number | null,
    highConsistency: 0,
    total: products.length
  };

  const sdcmValues: number[] = [];

  products.forEach(product => {
    if (product.sdcm !== null && product.sdcm !== undefined) {
      const category = getSDCMCategory(product.sdcm);
      stats.categories[category]++;
      sdcmValues.push(product.sdcm);

      if (product.sdcm <= 4) {
        stats.highConsistency++;
      }
    }
  });

  // Durchschnittlicher SDCM-Wert
  if (sdcmValues.length > 0) {
    stats.averageSDCM = sdcmValues.reduce((sum, val) => sum + val, 0) / sdcmValues.length;
  }

  return stats;
}