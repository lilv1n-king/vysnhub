/**
 * Dimensionen-Utility Module
 * 
 * Dieses Modul bietet Funktionen für die größenbasierte Produktsuche
 * basierend auf den Abmessungen der Produkte.
 * 
 * Größenklassifizierung nach Ihren Vorgaben:
 * - Groß: eine Seitenlänge > 500mm
 * - Mittelgroß: alle Seiten 250-500mm
 * - Klein: alle Seiten < 250mm
 * 
 * Verfügbare Dimensionen: length_mm, width_mm, height_mm, diameter_mm
 */

import { supabase, Product } from '../config/database';

export type SizeCategory = 'klein' | 'mittelgroß' | 'groß';

export interface DimensionCriteria {
  sizeCategory?: SizeCategory;
  maxLength?: number;
  maxWidth?: number;
  maxHeight?: number;
  maxDiameter?: number;
  minLength?: number;
  minWidth?: number;
  minHeight?: number;
  minDiameter?: number;
  compact?: boolean; // Für besonders kompakte Produkte
}

/**
 * Größenkategorien-Schwellenwerte
 */
export const SIZE_THRESHOLDS = {
  klein: { max: 250 },
  mittelgroß: { min: 250, max: 500 },
  groß: { min: 500 }
} as const;

/**
 * Bestimmt Größenkategorie eines Produkts
 * 
 * @param product - Produkt
 * @returns Größenkategorie
 */
export function getSizeCategory(product: Product): SizeCategory {
  const dimensions = [
    product.length_mm,
    product.width_mm, 
    product.height_mm,
    product.diameter_mm
  ].filter((dim): dim is number => dim !== null && dim !== undefined);

  if (dimensions.length === 0) {
    return 'mittelgroß'; // Default für unbekannte Größe
  }

  const maxDimension = Math.max(...dimensions);

  if (maxDimension > SIZE_THRESHOLDS.groß.min) {
    return 'groß';
  }
  
  if (maxDimension >= SIZE_THRESHOLDS.mittelgroß.min) {
    return 'mittelgroß';
  }
  
  return 'klein';
}

/**
 * Berechnet das Volumen eines Produkts (falls möglich)
 * 
 * @param product - Produkt
 * @returns Volumen in mm³ oder null
 */
export function calculateVolume(product: Product): number | null {
  const { length_mm, width_mm, height_mm, diameter_mm } = product;

  // Zylindrisch (mit Durchmesser)
  if (diameter_mm && height_mm) {
    const radius = diameter_mm / 2;
    return Math.PI * radius * radius * height_mm;
  }

  // Quaderförmig
  if (length_mm && width_mm && height_mm) {
    return length_mm * width_mm * height_mm;
  }

  return null;
}

/**
 * Prüft ob ein Produkt kompakt ist (alle Dimensionen < 100mm)
 * 
 * @param product - Produkt
 * @returns true wenn kompakt
 */
export function isCompact(product: Product): boolean {
  const dimensions = [
    product.length_mm,
    product.width_mm,
    product.height_mm,
    product.diameter_mm
  ].filter((dim): dim is number => dim !== null && dim !== undefined);

  if (dimensions.length === 0) return false;
  
  return dimensions.every(dim => dim < 100);
}

/**
 * Extrahiert Größenanforderungen aus Benutzer-Nachrichten
 * 
 * @param userMessage - Benutzer-Nachricht
 * @returns Erkannte Dimensions-Kriterien
 * 
 * @example
 * extractDimensionsFromMessage("kleine LED-Spots") // { sizeCategory: "klein" }
 * extractDimensionsFromMessage("max 300mm breit") // { maxWidth: 300 }
 * extractDimensionsFromMessage("kompakte Leuchte") // { compact: true }
 */
export function extractDimensionsFromMessage(userMessage: string): DimensionCriteria {
  const message = userMessage.toLowerCase();
  const criteria: DimensionCriteria = {};

  // Größenkategorien
  if (message.includes('klein') || message.includes('small')) {
    criteria.sizeCategory = 'klein';
  } else if (message.includes('groß') || message.includes('large') || message.includes('big')) {
    criteria.sizeCategory = 'groß';
  } else if (message.includes('mittel') || message.includes('medium')) {
    criteria.sizeCategory = 'mittelgroß';
  }

  // Kompakt
  if (message.includes('kompakt') || message.includes('compact') || message.includes('platzsparend')) {
    criteria.compact = true;
  }

  // Spezifische Dimensionen extrahieren
  const lengthMatch = message.match(/(?:länge|length|lang)\s*(?:max|maximum|bis|unter)?\s*(\d+)\s*mm/i);
  if (lengthMatch) {
    criteria.maxLength = parseInt(lengthMatch[1]);
  }

  const widthMatch = message.match(/(?:breite|width|breit)\s*(?:max|maximum|bis|unter)?\s*(\d+)\s*mm/i);
  if (widthMatch) {
    criteria.maxWidth = parseInt(widthMatch[1]);
  }

  const heightMatch = message.match(/(?:höhe|height|hoch)\s*(?:max|maximum|bis|unter)?\s*(\d+)\s*mm/i);
  if (heightMatch) {
    criteria.maxHeight = parseInt(heightMatch[1]);
  }

  const diameterMatch = message.match(/(?:durchmesser|diameter|durchm)\s*(?:max|maximum|bis|unter)?\s*(\d+)\s*mm/i);
  if (diameterMatch) {
    criteria.maxDiameter = parseInt(diameterMatch[1]);
  }

  // Min-Werte
  const minLengthMatch = message.match(/(?:länge|length|lang)\s*(?:min|minimum|ab|über)\s*(\d+)\s*mm/i);
  if (minLengthMatch) {
    criteria.minLength = parseInt(minLengthMatch[1]);
  }

  return criteria;
}

/**
 * Sucht Produkte nach Dimensions-Kriterien
 * 
 * @param criteria - Dimensions-Kriterien
 * @param limit - Maximale Anzahl Ergebnisse
 * @returns Gefilterte Produkte
 * 
 * @example
 * const smallProducts = await searchByDimensions({ sizeCategory: "klein" });
 * const compactProducts = await searchByDimensions({ compact: true });
 */
export async function searchByDimensions(
  criteria: DimensionCriteria,
  limit: number = 50
): Promise<{ products: Product[]; filters: string[]; totalCount: number }> {
  const filters: string[] = [];
  
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('availability', true);

    // Spezifische Dimensionsfilter
    if (criteria.maxLength !== undefined) {
      query = query.lte('length_mm', criteria.maxLength);
      filters.push(`max length: ${criteria.maxLength}mm`);
    }

    if (criteria.minLength !== undefined) {
      query = query.gte('length_mm', criteria.minLength);
      filters.push(`min length: ${criteria.minLength}mm`);
    }

    if (criteria.maxWidth !== undefined) {
      query = query.lte('width_mm', criteria.maxWidth);
      filters.push(`max width: ${criteria.maxWidth}mm`);
    }

    if (criteria.minWidth !== undefined) {
      query = query.gte('width_mm', criteria.minWidth);
      filters.push(`min width: ${criteria.minWidth}mm`);
    }

    if (criteria.maxHeight !== undefined) {
      query = query.lte('height_mm', criteria.maxHeight);
      filters.push(`max height: ${criteria.maxHeight}mm`);
    }

    if (criteria.minHeight !== undefined) {
      query = query.gte('height_mm', criteria.minHeight);
      filters.push(`min height: ${criteria.minHeight}mm`);
    }

    if (criteria.maxDiameter !== undefined) {
      query = query.lte('diameter_mm', criteria.maxDiameter);
      filters.push(`max diameter: ${criteria.maxDiameter}mm`);
    }

    if (criteria.minDiameter !== undefined) {
      query = query.gte('diameter_mm', criteria.minDiameter);
      filters.push(`min diameter: ${criteria.minDiameter}mm`);
    }

    query = query.order('gross_price', { ascending: true }).limit(limit * 2); // Mehr laden für Filterung

    const { data, error } = await query;

    if (error) {
      throw new Error(`Fehler bei der Dimensionssuche: ${error.message}`);
    }

    let products = data || [];

    // Nachträgliche Filterung für Kategorien und Kompaktheit
    if (criteria.sizeCategory) {
      products = products.filter(product => getSizeCategory(product) === criteria.sizeCategory);
      filters.push(`size category: ${criteria.sizeCategory}`);
    }

    if (criteria.compact) {
      products = products.filter(product => isCompact(product));
      filters.push('compact products only');
    }

    // Limitieren nach Filterung
    products = products.slice(0, limit);

    return {
      products,
      filters,
      totalCount: products.length
    };

  } catch (error) {
    console.error('Fehler bei der Dimensionssuche:', error);
    throw error;
  }
}

/**
 * Formatiert Dimensionen für Anzeige
 * 
 * @param product - Produkt
 * @returns Formatierte Dimensions-String
 */
export function formatDimensions(product: Product): string {
  const parts: string[] = [];

  if (product.length_mm) parts.push(`L: ${product.length_mm}mm`);
  if (product.width_mm) parts.push(`B: ${product.width_mm}mm`);
  if (product.height_mm) parts.push(`H: ${product.height_mm}mm`);
  if (product.diameter_mm) parts.push(`⌀: ${product.diameter_mm}mm`);

  return parts.length > 0 ? parts.join(', ') : 'Abmessungen nicht verfügbar';
}

/**
 * Prüft ob eine Nachricht nach Größe/Dimensionen sucht
 * 
 * @param userMessage - Benutzer-Nachricht
 * @returns true wenn nach Dimensionen gesucht wird
 */
export function isDimensionRequest(userMessage: string): boolean {
  const dimensionKeywords = [
    'klein', 'groß', 'mittel', 'kompakt', 'platzsparend',
    'small', 'large', 'medium', 'compact',
    'abmessungen', 'größe', 'dimensions', 'size',
    'länge', 'breite', 'höhe', 'durchmesser',
    'length', 'width', 'height', 'diameter',
    'mm', 'millimeter', 'cm', 'zentimeter'
  ];
  
  const message = userMessage.toLowerCase();
  return dimensionKeywords.some(keyword => message.includes(keyword));
}

/**
 * Berechnet Dimensionsstatistiken für Produktliste
 * 
 * @param products - Produktliste
 * @returns Dimensionsstatistiken
 */
export function calculateDimensionStats(products: Product[]): {
  sizeCategories: Record<SizeCategory, number>;
  compact: number;
  averageVolume: number | null;
  total: number;
} {
  const stats = {
    sizeCategories: { klein: 0, mittelgroß: 0, groß: 0 } as Record<SizeCategory, number>,
    compact: 0,
    averageVolume: null as number | null,
    total: products.length
  };

  const volumes: number[] = [];

  products.forEach(product => {
    const category = getSizeCategory(product);
    stats.sizeCategories[category]++;

    if (isCompact(product)) {
      stats.compact++;
    }

    const volume = calculateVolume(product);
    if (volume !== null) {
      volumes.push(volume);
    }
  });

  if (volumes.length > 0) {
    stats.averageVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
  }

  return stats;
}

/**
 * Vergleicht zwei Produkte nach Größe
 * 
 * @param productA - Erstes Produkt
 * @param productB - Zweites Produkt
 * @returns Vergleichsergebnis (-1: A kleiner, 0: gleich, 1: A größer)
 */
export function compareBySize(productA: Product, productB: Product): number {
  const volumeA = calculateVolume(productA);
  const volumeB = calculateVolume(productB);

  if (volumeA === null && volumeB === null) return 0;
  if (volumeA === null) return 1; // Unbekannte Größe als größer behandeln
  if (volumeB === null) return -1;

  return volumeA - volumeB;
}