/**
 * Preis-Utility Module
 * 
 * Dieses Modul bietet Funktionen für die preisbasierte Produktsuche
 * basierend auf der Analyse der VYSN Datenbank.
 * 
 * Preis-Analyse:
 * - Min: 0.69€, Max: 1980€, Median: 49€
 * - Günstig: < 50€ (219 Produkte)
 * - Mittel: 50-200€ (146 Produkte) 
 * - Teuer: > 200€ (18 Produkte)
 */

import { supabase, Product } from '../config/database';

export type PriceCategory = 'günstig' | 'mittel' | 'teuer';

export interface PriceRange {
  min?: number;
  max?: number;
}

export interface PriceCriteria {
  range?: PriceRange;
  category?: PriceCategory;
  maxPrice?: number;
  minPrice?: number;
}

/**
 * Definiert Preiskategorien basierend auf der Datenbank-Analyse
 */
export const PRICE_CATEGORIES = {
  günstig: { min: 0, max: 50 },
  mittel: { min: 50, max: 200 },
  teuer: { min: 200, max: Infinity }
} as const;

/**
 * Extrahiert Preisangaben aus Benutzer-Nachrichten
 * 
 * @param userMessage - Benutzer-Nachricht
 * @returns Erkannte Preiskriterien
 * 
 * @example
 * extractPriceFromMessage("unter 100 Euro") // { maxPrice: 100 }
 * extractPriceFromMessage("zwischen 50 und 150€") // { minPrice: 50, maxPrice: 150 }
 * extractPriceFromMessage("günstig") // { category: "günstig" }
 */
export function extractPriceFromMessage(userMessage: string): PriceCriteria {
  const message = userMessage.toLowerCase();
  const criteria: PriceCriteria = {};

  // Preiskategorien erkennen
  if (message.includes('günstig') || message.includes('billig') || message.includes('preiswert')) {
    criteria.category = 'günstig';
  } else if (message.includes('teuer') || message.includes('hochwertig') || message.includes('premium')) {
    criteria.category = 'teuer';
  } else if (message.includes('mittel')) {
    criteria.category = 'mittel';
  }

  // Spezifische Preise extrahieren
  const maxPriceMatch = message.match(/(?:unter|bis|max|maximum|höchstens)\s*(\d+(?:[.,]\d+)?)\s*(?:€|euro)/i);
  if (maxPriceMatch) {
    criteria.maxPrice = parseFloat(maxPriceMatch[1].replace(',', '.'));
  }

  const minPriceMatch = message.match(/(?:über|ab|min|minimum|mindestens|von)\s*(\d+(?:[.,]\d+)?)\s*(?:€|euro)/i);
  if (minPriceMatch) {
    criteria.minPrice = parseFloat(minPriceMatch[1].replace(',', '.'));
  }

  // Preisbereich "zwischen X und Y"
  const rangeMatch = message.match(/zwischen\s*(\d+(?:[.,]\d+)?)\s*(?:€|euro)?\s*(?:und|bis)\s*(\d+(?:[.,]\d+)?)\s*(?:€|euro)/i);
  if (rangeMatch) {
    criteria.minPrice = parseFloat(rangeMatch[1].replace(',', '.'));
    criteria.maxPrice = parseFloat(rangeMatch[2].replace(',', '.'));
  }

  return criteria;
}

/**
 * Konvertiert Preiskategorie zu Preisbereich
 * 
 * @param category - Preiskategorie
 * @returns Preisbereich
 */
export function categoryToPriceRange(category: PriceCategory): PriceRange {
  return PRICE_CATEGORIES[category];
}

/**
 * Sucht Produkte nach Preiskriterien
 * 
 * @param criteria - Preiskriterien
 * @param limit - Maximale Anzahl Ergebnisse
 * @returns Gefilterte Produkte
 * 
 * @example
 * const cheapProducts = await searchByPrice({ category: "günstig" });
 * const rangeProducts = await searchByPrice({ minPrice: 50, maxPrice: 150 });
 */
export async function searchByPrice(
  criteria: PriceCriteria, 
  limit: number = 50
): Promise<{ products: Product[]; filters: string[]; totalCount: number }> {
  const filters: string[] = [];
  
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('availability', true)
      .not('gross_price', 'is', null);

    // Kategorie-basierte Filter
    if (criteria.category) {
      const range = categoryToPriceRange(criteria.category);
      if (range.max !== Infinity) {
        query = query.gte('gross_price', range.min).lte('gross_price', range.max);
      } else {
        query = query.gte('gross_price', range.min);
      }
      filters.push(`price category: ${criteria.category}`);
    }

    // Spezifische Preisfilter
    if (criteria.minPrice !== undefined) {
      query = query.gte('gross_price', criteria.minPrice);
      filters.push(`min price: €${criteria.minPrice}`);
    }

    if (criteria.maxPrice !== undefined) {
      query = query.lte('gross_price', criteria.maxPrice);
      filters.push(`max price: €${criteria.maxPrice}`);
    }

    query = query.order('gross_price', { ascending: true }).limit(limit);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Fehler bei der Preissuche: ${error.message}`);
    }

    const products = data || [];

    return {
      products,
      filters,
      totalCount: products.length
    };

  } catch (error) {
    console.error('Fehler bei der Preissuche:', error);
    throw error;
  }
}

/**
 * Bestimmt Preiskategorie für ein Produkt
 * 
 * @param price - Preis des Produkts
 * @returns Preiskategorie
 */
export function getPriceCategory(price: number): PriceCategory {
  if (price < PRICE_CATEGORIES.günstig.max) return 'günstig';
  if (price < PRICE_CATEGORIES.mittel.max) return 'mittel';
  return 'teuer';
}

/**
 * Formatiert Preis für Anzeige
 * 
 * @param price - Preis
 * @returns Formatierter Preis-String
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
}

/**
 * Prüft ob eine Nachricht nach Preis sucht
 * 
 * @param userMessage - Benutzer-Nachricht
 * @returns true wenn nach Preis gesucht wird
 */
export function isPriceRequest(userMessage: string): boolean {
  const priceKeywords = [
    'preis', 'kosten', 'euro', '€', 'günstig', 'teuer', 'billig',
    'unter', 'über', 'zwischen', 'bis', 'ab', 'max', 'min',
    'budget', 'sparen', 'preislich'
  ];
  
  const message = userMessage.toLowerCase();
  return priceKeywords.some(keyword => message.includes(keyword));
}

/**
 * Berechnet Preisstatistiken für Produktliste
 * 
 * @param products - Produktliste
 * @returns Preisstatistiken
 */
export function calculatePriceStats(products: Product[]): {
  min: number;
  max: number;
  average: number;
  median: number;
  count: number;
} {
  const prices = products
    .map(p => p.gross_price)
    .filter((price): price is number => price !== undefined && price !== null)
    .sort((a, b) => a - b);

  if (prices.length === 0) {
    return { min: 0, max: 0, average: 0, median: 0, count: 0 };
  }

  const min = prices[0];
  const max = prices[prices.length - 1];
  const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const median = prices[Math.floor(prices.length / 2)];

  return { min, max, average, median, count: prices.length };
}