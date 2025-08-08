/**
 * Energy-Efficiency-Utility Module
 * 
 * Dieses Modul bietet Funktionen für energieeffizienz-basierte Produktsuche.
 * 
 * Energy Class aus DB-Analyse: 'C', 'D', 'E', 'F', 'G'
 * Lumen per Watt Bereich: 3 - 153 lm/W (134 Produkte mit Werten)
 * 
 * Energieeffizienz-Kategorien:
 * - Hocheffizient: > 100 lm/W
 * - Effizient: 80-100 lm/W  
 * - Standard: 60-80 lm/W
 * - Niedrig: < 60 lm/W
 */

import { supabase, Product } from '../config/database';

export type EnergyClass = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
export type EfficiencyCategory = 'hocheffizient' | 'effizient' | 'standard' | 'niedrig';

export interface EnergyCriteria {
  minEnergyClass?: EnergyClass;
  energyClass?: EnergyClass;
  minEfficiency?: number; // lumen/watt
  maxEfficiency?: number; // lumen/watt
  efficiencyCategory?: EfficiencyCategory;
  energySaving?: boolean; // Besonders sparsame Produkte
}

/**
 * Energy Class Hierarchie (A ist beste, G ist schlechteste)
 */
export const ENERGY_CLASS_ORDER: EnergyClass[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

/**
 * Effizienz-Kategorien basierend auf lumen/watt
 */
export const EFFICIENCY_CATEGORIES = {
  hocheffizient: { min: 100, max: Infinity },
  effizient: { min: 80, max: 100 },
  standard: { min: 60, max: 80 },
  niedrig: { min: 0, max: 60 }
} as const;

/**
 * Bestimmt alle Energy Classes die mindestens so gut sind wie die angegebene
 * 
 * @param minClass - Mindest Energy Class
 * @returns Array aller ausreichenden Energy Classes
 */
export function getSufficientEnergyClasses(minClass: EnergyClass): EnergyClass[] {
  const minIndex = ENERGY_CLASS_ORDER.indexOf(minClass);
  if (minIndex === -1) return ENERGY_CLASS_ORDER;
  
  return ENERGY_CLASS_ORDER.slice(0, minIndex + 1);
}

/**
 * Bestimmt Effizienz-Kategorie basierend auf lumen/watt
 * 
 * @param lumensPerWatt - Effizienz in lm/W
 * @returns Effizienz-Kategorie
 */
export function getEfficiencyCategory(lumensPerWatt: number): EfficiencyCategory {
  if (lumensPerWatt >= EFFICIENCY_CATEGORIES.hocheffizient.min) return 'hocheffizient';
  if (lumensPerWatt >= EFFICIENCY_CATEGORIES.effizient.min) return 'effizient';
  if (lumensPerWatt >= EFFICIENCY_CATEGORIES.standard.min) return 'standard';
  return 'niedrig';
}

/**
 * Extrahiert Energie-Anforderungen aus Benutzer-Nachrichten
 * 
 * @param userMessage - Benutzer-Nachricht
 * @returns Erkannte Energie-Kriterien
 * 
 * @example
 * extractEnergyFromMessage("mindestens Energieklasse B") // { minEnergyClass: "B" }
 * extractEnergyFromMessage("sehr effizient") // { efficiencyCategory: "hocheffizient" }
 * extractEnergyFromMessage("mindestens 90 lumen pro watt") // { minEfficiency: 90 }
 */
export function extractEnergyFromMessage(userMessage: string): EnergyCriteria {
  const message = userMessage.toLowerCase();
  const criteria: EnergyCriteria = {};

  // Energy Class extrahieren
  const energyClassMatch = message.match(/energieklasse\s*([a-g])|energy\s*class\s*([a-g])/i);
  if (energyClassMatch) {
    const energyClass = (energyClassMatch[1] || energyClassMatch[2]).toUpperCase() as EnergyClass;
    criteria.energyClass = energyClass;
  }

  // Mindest Energy Class
  const minEnergyMatch = message.match(/mindestens\s*(?:energieklasse\s*)?([a-g])|min.*energy.*([a-g])/i);
  if (minEnergyMatch) {
    const minClass = (minEnergyMatch[1] || minEnergyMatch[2]).toUpperCase() as EnergyClass;
    criteria.minEnergyClass = minClass;
  }

  // Effizienz-Kategorien
  if (message.includes('hocheffizient') || message.includes('sehr effizient') || 
      message.includes('high efficiency')) {
    criteria.efficiencyCategory = 'hocheffizient';
  } else if (message.includes('effizient') || message.includes('efficient')) {
    criteria.efficiencyCategory = 'effizient';
  } else if (message.includes('sparsam') || message.includes('energy saving') || 
             message.includes('energiesparend')) {
    criteria.energySaving = true;
  }

  // Spezifische Effizienz-Werte (lumen/watt)
  const minEfficiencyMatch = message.match(/(?:mindestens|min|über|ab)\s*(\d+)(?:\s*lumen)?\s*(?:pro|per|\/)\s*watt/i);
  if (minEfficiencyMatch) {
    criteria.minEfficiency = parseInt(minEfficiencyMatch[1]);
  }

  const maxEfficiencyMatch = message.match(/(?:maximal|max|unter|bis)\s*(\d+)(?:\s*lumen)?\s*(?:pro|per|\/)\s*watt/i);
  if (maxEfficiencyMatch) {
    criteria.maxEfficiency = parseInt(maxEfficiencyMatch[1]);
  }

  // Allgemeine Effizienz-Werte ohne "mindestens"
  const efficiencyMatch = message.match(/(\d+)(?:\s*lumen)?\s*(?:pro|per|\/)\s*watt/i);
  if (efficiencyMatch && !minEfficiencyMatch && !maxEfficiencyMatch) {
    criteria.minEfficiency = parseInt(efficiencyMatch[1]);
  }

  return criteria;
}

/**
 * Sucht Produkte nach Energie-Kriterien
 * 
 * @param criteria - Energie-Kriterien
 * @param limit - Maximale Anzahl Ergebnisse
 * @returns Gefilterte Produkte
 * 
 * @example
 * const efficientProducts = await searchByEnergy({ minEnergyClass: "B" });
 * const highEffProducts = await searchByEnergy({ minEfficiency: 90 });
 */
export async function searchByEnergy(
  criteria: EnergyCriteria,
  limit: number = 50
): Promise<{ products: Product[]; filters: string[]; totalCount: number }> {
  const filters: string[] = [];
  
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('availability', true);

    // Energy Class Filter
    if (criteria.energyClass) {
      query = query.eq('energy_class', criteria.energyClass);
      filters.push(`energy class: ${criteria.energyClass}`);
    } else if (criteria.minEnergyClass) {
      const sufficientClasses = getSufficientEnergyClasses(criteria.minEnergyClass);
      query = query.in('energy_class', sufficientClasses);
      filters.push(`energy class >= ${criteria.minEnergyClass}`);
    }

    // Effizienz Filter (lumen/watt)
    if (criteria.minEfficiency !== undefined) {
      query = query.gte('lumen_per_watt', criteria.minEfficiency);
      filters.push(`min efficiency: ${criteria.minEfficiency} lm/W`);
    }

    if (criteria.maxEfficiency !== undefined) {
      query = query.lte('lumen_per_watt', criteria.maxEfficiency);
      filters.push(`max efficiency: ${criteria.maxEfficiency} lm/W`);
    }

    // Effizienz-Kategorie
    if (criteria.efficiencyCategory) {
      const category = EFFICIENCY_CATEGORIES[criteria.efficiencyCategory];
      query = query.gte('lumen_per_watt', category.min);
      if (category.max !== Infinity) {
        query = query.lt('lumen_per_watt', category.max);
      }
      filters.push(`efficiency category: ${criteria.efficiencyCategory}`);
    }

    // Energiesparend (hocheffizient + gute Energy Class)
    if (criteria.energySaving) {
      query = query.gte('lumen_per_watt', 80); // Mindestens effizient
      const goodClasses = getSufficientEnergyClasses('D'); // C oder besser
      query = query.in('energy_class', goodClasses);
      filters.push('energy saving products');
    }

    query = query.order('lumen_per_watt', { ascending: false }).limit(limit);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Fehler bei der Energieeffizienz-Suche: ${error.message}`);
    }

    const products = data || [];

    return {
      products,
      filters,
      totalCount: products.length
    };

  } catch (error) {
    console.error('Fehler bei der Energieeffizienz-Suche:', error);
    throw error;
  }
}

/**
 * Prüft ob ein Produkt energieeffizient ist (> 80 lm/W oder Energy Class C+)
 * 
 * @param product - Produkt
 * @returns true wenn energieeffizient
 */
export function isEnergyEfficient(product: Product): boolean {
  if (product.lumen_per_watt && product.lumen_per_watt >= 80) return true;
  if (product.energy_class && ['A', 'B', 'C'].includes(product.energy_class)) return true;
  return false;
}

/**
 * Formatiert Energy Class für Anzeige
 * 
 * @param energyClass - Energy Class
 * @returns Formatierte Anzeige
 */
export function formatEnergyClass(energyClass: string): string {
  const descriptions: Record<string, string> = {
    'A': 'Energieklasse A (Sehr effizient)',
    'B': 'Energieklasse B (Effizient)', 
    'C': 'Energieklasse C (Gut)',
    'D': 'Energieklasse D (Standard)',
    'E': 'Energieklasse E (Weniger effizient)',
    'F': 'Energieklasse F (Ineffizient)',
    'G': 'Energieklasse G (Sehr ineffizient)'
  };

  return descriptions[energyClass] || `Energieklasse ${energyClass}`;
}

/**
 * Formatiert Effizienz-Wert für Anzeige
 * 
 * @param lumensPerWatt - Effizienz in lm/W
 * @returns Formatierte Anzeige mit Kategorie
 */
export function formatEfficiency(lumensPerWatt: number): string {
  const category = getEfficiencyCategory(lumensPerWatt);
  const categoryNames = {
    hocheffizient: 'Hocheffizient',
    effizient: 'Effizient',
    standard: 'Standard',
    niedrig: 'Niedrig'
  };

  return `${lumensPerWatt} lm/W (${categoryNames[category]})`;
}

/**
 * Prüft ob eine Nachricht nach Energieeffizienz sucht
 * 
 * @param userMessage - Benutzer-Nachricht
 * @returns true wenn nach Energie gesucht wird
 */
export function isEnergyRequest(userMessage: string): boolean {
  const energyKeywords = [
    'energie', 'energy', 'effizient', 'efficient', 'sparsam', 'saving',
    'verbrauch', 'consumption', 'watt', 'lumen', 'lm/w',
    'energieklasse', 'energy class', 'umweltfreundlich', 'eco'
  ];
  
  const message = userMessage.toLowerCase();
  return energyKeywords.some(keyword => message.includes(keyword));
}

/**
 * Berechnet Energie-Statistiken für Produktliste
 * 
 * @param products - Produktliste
 * @returns Energie-Statistiken
 */
export function calculateEnergyStats(products: Product[]): {
  energyClasses: Record<string, number>;
  efficiencyCategories: Record<EfficiencyCategory, number>;
  averageEfficiency: number | null;
  energyEfficient: number;
  total: number;
} {
  const stats = {
    energyClasses: {} as Record<string, number>,
    efficiencyCategories: { 
      hocheffizient: 0, 
      effizient: 0, 
      standard: 0, 
      niedrig: 0 
    } as Record<EfficiencyCategory, number>,
    averageEfficiency: null as number | null,
    energyEfficient: 0,
    total: products.length
  };

  const efficiencyValues: number[] = [];

  products.forEach(product => {
    // Energy Classes zählen
    if (product.energy_class) {
      stats.energyClasses[product.energy_class] = 
        (stats.energyClasses[product.energy_class] || 0) + 1;
    }

    // Effizienz-Kategorien zählen
    if (product.lumen_per_watt) {
      const category = getEfficiencyCategory(product.lumen_per_watt);
      stats.efficiencyCategories[category]++;
      efficiencyValues.push(product.lumen_per_watt);
    }

    // Energieeffiziente Produkte zählen
    if (isEnergyEfficient(product)) {
      stats.energyEfficient++;
    }
  });

  // Durchschnittliche Effizienz berechnen
  if (efficiencyValues.length > 0) {
    stats.averageEfficiency = 
      efficiencyValues.reduce((sum, val) => sum + val, 0) / efficiencyValues.length;
  }

  return stats;
}