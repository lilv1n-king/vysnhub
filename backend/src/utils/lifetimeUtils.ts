/**
 * Lebensdauer & Protection-Utility Module
 * 
 * Dieses Modul bietet Funktionen für lebensdauer- und schutzklassen-basierte Produktsuche.
 * 
 * LED Chip Lifetime aus DB-Analyse: '50000.0', '25000.0' (in Stunden)
 * Protection Class: 'I', 'II', 'III'
 * UGR: Keine Werte in aktueller DB, aber Spalte vorhanden
 * 
 * Lebensdauer-Kategorien:
 * - Standard: 25.000 Stunden
 * - Lang: 50.000+ Stunden
 * - Sehr lang: 75.000+ Stunden
 */

import { supabase, Product } from '../config/database';

export type LifetimeCategory = 'standard' | 'lang' | 'sehr_lang';
export type ProtectionClass = 'I' | 'II' | 'III';

export interface LifetimeCriteria {
  minLifetime?: number; // in Stunden
  maxLifetime?: number; // in Stunden
  lifetimeCategory?: LifetimeCategory;
  longLife?: boolean; // Besonders langlebige Produkte
}

export interface ProtectionCriteria {
  protectionClass?: ProtectionClass;
  withEarthing?: boolean; // Schutzklasse I (mit Erdung)
  doubleInsulated?: boolean; // Schutzklasse II (doppelt isoliert)
  lowVoltage?: boolean; // Schutzklasse III (Schutzkleinspannung)
  maxUGR?: number; // Blendwert
  minUGR?: number;
}

/**
 * Lebensdauer-Kategorien in Stunden
 */
export const LIFETIME_CATEGORIES = {
  standard: { min: 20000, max: 40000 },
  lang: { min: 40000, max: 75000 },
  sehr_lang: { min: 75000, max: Infinity }
} as const;

/**
 * Schutzklassen-Beschreibungen
 */
export const PROTECTION_CLASS_DESCRIPTIONS = {
  'I': 'Schutzklasse I (mit Erdung)',
  'II': 'Schutzklasse II (doppelt isoliert)', 
  'III': 'Schutzklasse III (Schutzkleinspannung)'
} as const;

/**
 * Parst Lebensdauer-String aus der Datenbank
 * 
 * @param lifetimeString - LED Chip Lifetime String (z.B. "50000.0")
 * @returns Lebensdauer in Stunden oder null
 */
export function parseLifetime(lifetimeString: string | null | undefined): number | null {
  if (!lifetimeString) return null;
  
  // Entferne Dezimalstellen und parse zu Integer
  const parsed = parseFloat(lifetimeString);
  return isNaN(parsed) ? null : Math.round(parsed);
}

/**
 * Bestimmt Lebensdauer-Kategorie
 * 
 * @param lifetimeHours - Lebensdauer in Stunden
 * @returns Lebensdauer-Kategorie
 */
export function getLifetimeCategory(lifetimeHours: number): LifetimeCategory {
  if (lifetimeHours >= LIFETIME_CATEGORIES.sehr_lang.min) return 'sehr_lang';
  if (lifetimeHours >= LIFETIME_CATEGORIES.lang.min) return 'lang';
  return 'standard';
}

/**
 * Extrahiert Lebensdauer-Anforderungen aus Benutzer-Nachrichten
 * 
 * @param userMessage - Benutzer-Nachricht
 * @returns Erkannte Lebensdauer-Kriterien
 * 
 * @example
 * extractLifetimeFromMessage("50000 Stunden") // { minLifetime: 50000 }
 * extractLifetimeFromMessage("langlebig") // { longLife: true }
 * extractLifetimeFromMessage("mindestens 40000h") // { minLifetime: 40000 }
 */
export function extractLifetimeFromMessage(userMessage: string): LifetimeCriteria {
  const message = userMessage.toLowerCase();
  const criteria: LifetimeCriteria = {};

  // Spezifische Stunden-Werte
  const hoursMatch = message.match(/(\d+)(?:\s*(?:stunden|hours|h))/i);
  if (hoursMatch) {
    const hours = parseInt(hoursMatch[1]);
    if (message.includes('mindestens') || message.includes('min') || message.includes('über')) {
      criteria.minLifetime = hours;
    } else if (message.includes('maximal') || message.includes('max') || message.includes('unter')) {
      criteria.maxLifetime = hours;
    } else {
      criteria.minLifetime = hours; // Default: mindestens
    }
  }

  // Lebensdauer-Kategorien
  if (message.includes('langlebig') || message.includes('lange lebensdauer') || 
      message.includes('long life') || message.includes('haltbar')) {
    criteria.longLife = true;
  }

  if (message.includes('sehr langlebig') || message.includes('extra long')) {
    criteria.lifetimeCategory = 'sehr_lang';
  } else if (message.includes('lang') && message.includes('leben')) {
    criteria.lifetimeCategory = 'lang';
  }

  return criteria;
}

/**
 * Extrahiert Protection-Anforderungen aus Benutzer-Nachrichten
 * 
 * @param userMessage - Benutzer-Nachricht
 * @returns Erkannte Protection-Kriterien
 * 
 * @example
 * extractProtectionFromMessage("mit Erdung") // { withEarthing: true }
 * extractProtectionFromMessage("Schutzklasse II") // { protectionClass: "II" }
 * extractProtectionFromMessage("UGR unter 19") // { maxUGR: 19 }
 */
export function extractProtectionFromMessage(userMessage: string): ProtectionCriteria {
  const message = userMessage.toLowerCase();
  const criteria: ProtectionCriteria = {};

  // Schutzklassen
  const protectionClassMatch = message.match(/schutzklasse\s*(i{1,3}|[123])/i);
  if (protectionClassMatch) {
    let classValue = protectionClassMatch[1].toUpperCase();
    // Konvertiere Zahlen zu römischen Ziffern
    if (classValue === '1') classValue = 'I';
    if (classValue === '2') classValue = 'II';
    if (classValue === '3') classValue = 'III';
    criteria.protectionClass = classValue as ProtectionClass;
  }

  // Spezifische Eigenschaften
  if (message.includes('erdung') || message.includes('earthing') || 
      message.includes('mit schutzleiter')) {
    criteria.withEarthing = true;
    criteria.protectionClass = 'I';
  }

  if (message.includes('doppelt isoliert') || message.includes('double insulated')) {
    criteria.doubleInsulated = true;
    criteria.protectionClass = 'II';
  }

  if (message.includes('kleinspannung') || message.includes('low voltage') || 
      message.includes('12v') || message.includes('24v')) {
    criteria.lowVoltage = true;
    criteria.protectionClass = 'III';
  }

  // UGR-Werte
  const ugrMaxMatch = message.match(/ugr\s*(?:unter|max|maximum|<)\s*(\d+)/i);
  if (ugrMaxMatch) {
    criteria.maxUGR = parseInt(ugrMaxMatch[1]);
  }

  const ugrMinMatch = message.match(/ugr\s*(?:über|min|minimum|>)\s*(\d+)/i);
  if (ugrMinMatch) {
    criteria.minUGR = parseInt(ugrMinMatch[1]);
  }

  // Blendwert-Synonyme
  if (message.includes('blendfrei') || message.includes('low glare')) {
    criteria.maxUGR = 19; // UGR < 19 gilt als blendfrei
  }

  return criteria;
}

/**
 * Sucht Produkte nach Lebensdauer-Kriterien
 * 
 * @param criteria - Lebensdauer-Kriterien
 * @param limit - Maximale Anzahl Ergebnisse
 * @returns Gefilterte Produkte
 */
export async function searchByLifetime(
  criteria: LifetimeCriteria,
  limit: number = 50
): Promise<{ products: Product[]; filters: string[]; totalCount: number }> {
  const filters: string[] = [];
  
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('availability', true)
      .not('led_chip_lifetime', 'is', null);

    query = query.order('gross_price', { ascending: true }).limit(limit * 2);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Fehler bei der Lebensdauer-Suche: ${error.message}`);
    }

    let products = data || [];

    // Nachträgliche Filterung basierend auf geparster Lebensdauer
    products = products.filter(product => {
      const lifetime = parseLifetime(product.led_chip_lifetime);
      if (!lifetime) return false;

      if (criteria.minLifetime && lifetime < criteria.minLifetime) return false;
      if (criteria.maxLifetime && lifetime > criteria.maxLifetime) return false;
      
      if (criteria.lifetimeCategory) {
        const category = getLifetimeCategory(lifetime);
        if (category !== criteria.lifetimeCategory) return false;
      }

      if (criteria.longLife && lifetime < 40000) return false;

      return true;
    });

    // Filter-Beschreibungen hinzufügen
    if (criteria.minLifetime) {
      filters.push(`min lifetime: ${criteria.minLifetime.toLocaleString()} hours`);
    }
    if (criteria.maxLifetime) {
      filters.push(`max lifetime: ${criteria.maxLifetime.toLocaleString()} hours`);
    }
    if (criteria.lifetimeCategory) {
      filters.push(`lifetime category: ${criteria.lifetimeCategory}`);
    }
    if (criteria.longLife) {
      filters.push('long life products (40,000+ hours)');
    }

    products = products.slice(0, limit);

    return {
      products,
      filters,
      totalCount: products.length
    };

  } catch (error) {
    console.error('Fehler bei der Lebensdauer-Suche:', error);
    throw error;
  }
}

/**
 * Sucht Produkte nach Protection-Kriterien
 * 
 * @param criteria - Protection-Kriterien
 * @param limit - Maximale Anzahl Ergebnisse
 * @returns Gefilterte Produkte
 */
export async function searchByProtection(
  criteria: ProtectionCriteria,
  limit: number = 50
): Promise<{ products: Product[]; filters: string[]; totalCount: number }> {
  const filters: string[] = [];
  
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('availability', true);

    // Protection Class Filter
    if (criteria.protectionClass) {
      query = query.eq('protection_class', criteria.protectionClass);
      filters.push(`protection class: ${criteria.protectionClass}`);
    }

    // UGR Filter
    if (criteria.maxUGR !== undefined) {
      query = query.lte('ugr', criteria.maxUGR);
      filters.push(`max UGR: ${criteria.maxUGR}`);
    }

    if (criteria.minUGR !== undefined) {
      query = query.gte('ugr', criteria.minUGR);
      filters.push(`min UGR: ${criteria.minUGR}`);
    }

    query = query.order('gross_price', { ascending: true }).limit(limit);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Fehler bei der Protection-Suche: ${error.message}`);
    }

    const products = data || [];

    return {
      products,
      filters,
      totalCount: products.length
    };

  } catch (error) {
    console.error('Fehler bei der Protection-Suche:', error);
    throw error;
  }
}

/**
 * Formatiert Lebensdauer für Anzeige
 * 
 * @param lifetimeString - LED Chip Lifetime String
 * @returns Formatierte Lebensdauer mit Kategorie
 */
export function formatLifetime(lifetimeString: string | null | undefined): string {
  const lifetime = parseLifetime(lifetimeString);
  if (!lifetime) return 'Lebensdauer nicht verfügbar';

  const category = getLifetimeCategory(lifetime);
  const categoryNames = {
    standard: 'Standard',
    lang: 'Lang',
    sehr_lang: 'Sehr lang'
  };

  return `${lifetime.toLocaleString()} Stunden (${categoryNames[category]})`;
}

/**
 * Formatiert Protection Class für Anzeige
 * 
 * @param protectionClass - Protection Class
 * @param ugr - UGR-Wert (optional)
 * @returns Formatierte Protection-Information
 */
export function formatProtection(protectionClass: string | null | undefined, ugr?: number | null): string {
  const parts: string[] = [];

  if (protectionClass && protectionClass in PROTECTION_CLASS_DESCRIPTIONS) {
    parts.push(PROTECTION_CLASS_DESCRIPTIONS[protectionClass as ProtectionClass]);
  }

  if (ugr !== null && ugr !== undefined) {
    parts.push(`UGR ${ugr}`);
  }

  return parts.length > 0 ? parts.join(', ') : 'Schutz-Information nicht verfügbar';
}

/**
 * Prüft ob eine Nachricht nach Lebensdauer/Protection sucht
 * 
 * @param userMessage - Benutzer-Nachricht
 * @returns true wenn nach Lebensdauer/Protection gesucht wird
 */
export function isLifetimeProtectionRequest(userMessage: string): boolean {
  const keywords = [
    'lebensdauer', 'lifetime', 'stunden', 'hours', 'langlebig', 'haltbar',
    'schutzklasse', 'protection class', 'erdung', 'earthing',
    'isoliert', 'insulated', 'kleinspannung', 'low voltage',
    'ugr', 'blendwert', 'glare', 'blendfrei'
  ];
  
  const message = userMessage.toLowerCase();
  return keywords.some(keyword => message.includes(keyword));
}

/**
 * Berechnet Lebensdauer- und Protection-Statistiken
 * 
 * @param products - Produktliste
 * @returns Statistiken
 */
export function calculateLifetimeProtectionStats(products: Product[]): {
  lifetimeCategories: Record<LifetimeCategory, number>;
  protectionClasses: Record<string, number>;
  averageLifetime: number | null;
  longLife: number;
  total: number;
} {
  const stats = {
    lifetimeCategories: { standard: 0, lang: 0, sehr_lang: 0 } as Record<LifetimeCategory, number>,
    protectionClasses: {} as Record<string, number>,
    averageLifetime: null as number | null,
    longLife: 0,
    total: products.length
  };

  const lifetimeValues: number[] = [];

  products.forEach(product => {
    // Lebensdauer-Kategorien
    const lifetime = parseLifetime(product.led_chip_lifetime);
    if (lifetime) {
      const category = getLifetimeCategory(lifetime);
      stats.lifetimeCategories[category]++;
      lifetimeValues.push(lifetime);

      if (lifetime >= 40000) {
        stats.longLife++;
      }
    }

    // Protection Classes
    if (product.protection_class) {
      stats.protectionClasses[product.protection_class] = 
        (stats.protectionClasses[product.protection_class] || 0) + 1;
    }
  });

  // Durchschnittliche Lebensdauer
  if (lifetimeValues.length > 0) {
    stats.averageLifetime = 
      lifetimeValues.reduce((sum, val) => sum + val, 0) / lifetimeValues.length;
  }

  return stats;
}