/**
 * Material & Socket-Utility Module
 * 
 * Dieses Modul bietet Funktionen für material- und sockel-basierte Produktsuche.
 * 
 * Material-Werte aus DB-Analyse:
 * - Aluminum (häufigste)
 * - Polycarbonate, Glass, Steel, Iron
 * - Kombinationen: 'Aluminum, Glass', 'Iron, stainless steel', etc.
 * 
 * Base Socket: 'excluded', 'included'
 * Lightsource: 'LED integrated', 'Retrofit Socket'
 * Replaceable Light Source: true, false
 */

import { supabase, Product } from '../config/database';

export type MaterialCategory = 'aluminum' | 'steel' | 'glass' | 'plastic' | 'ceramic' | 'composite';
export type SocketType = 'gu10' | 'e27' | 'e14' | 'g9' | 'integrated' | 'retrofit';
export type LightSourceType = 'integrated' | 'retrofit';

export interface MaterialCriteria {
  material?: string;
  materialCategory?: MaterialCategory;
  weatherResistant?: boolean; // Wetterfest (Edelstahl, Aluminum)
  premium?: boolean; // Hochwertige Materialien
  specificMaterial?: string;
}

export interface SocketCriteria {
  socketType?: SocketType;
  baseSocketIncluded?: boolean;
  lightSourceType?: LightSourceType;
  replaceableLightSource?: boolean;
  retrofitCompatible?: boolean;
}

/**
 * Material-Kategorien für Gruppierung
 */
export const MATERIAL_CATEGORIES = {
  aluminum: ['Aluminum', 'aluminum'],
  steel: ['Steel', 'stainless steel', '316 stainless steel', '304 stainless steel'],
  glass: ['Glass', 'glass'],
  plastic: ['Plastic', 'Polycarbonate', 'ABS', 'PA66', 'Polypropylen'],
  ceramic: ['Ceramic'],
  composite: ['Iron', 'copper', 'Messing']
} as const;

/**
 * Wetterfeste Materialien für Außenanwendungen
 */
export const WEATHER_RESISTANT_MATERIALS = [
  'Aluminum', 'stainless steel', '316 stainless steel', '304 stainless steel',
  'Polycarbonate', 'Glass'
];

/**
 * Premium-Materialien
 */
export const PREMIUM_MATERIALS = [
  'stainless steel', '316 stainless steel', '304 stainless steel',
  'Glass', 'Ceramic', 'Messing'
];

/**
 * Bestimmt Material-Kategorie aus Material-String
 * 
 * @param material - Material-String aus DB
 * @returns Material-Kategorie
 */
export function getMaterialCategory(material: string): MaterialCategory | null {
  const lowerMaterial = material.toLowerCase();
  
  for (const [category, materials] of Object.entries(MATERIAL_CATEGORIES)) {
    if (materials.some(mat => lowerMaterial.includes(mat.toLowerCase()))) {
      return category as MaterialCategory;
    }
  }
  
  return null;
}

/**
 * Prüft ob Material wetterfest ist
 * 
 * @param material - Material-String
 * @returns true wenn wetterfest
 */
export function isWeatherResistant(material: string): boolean {
  return WEATHER_RESISTANT_MATERIALS.some(mat => 
    material.toLowerCase().includes(mat.toLowerCase())
  );
}

/**
 * Prüft ob Material als premium eingestuft wird
 * 
 * @param material - Material-String
 * @returns true wenn premium
 */
export function isPremiumMaterial(material: string): boolean {
  return PREMIUM_MATERIALS.some(mat => 
    material.toLowerCase().includes(mat.toLowerCase())
  );
}

/**
 * Extrahiert Material-Anforderungen aus Benutzer-Nachrichten
 * 
 * @param userMessage - Benutzer-Nachricht
 * @returns Erkannte Material-Kriterien
 * 
 * @example
 * extractMaterialFromMessage("aus Aluminium") // { materialCategory: "aluminum" }
 * extractMaterialFromMessage("wetterfest") // { weatherResistant: true }
 * extractMaterialFromMessage("hochwertige materialien") // { premium: true }
 */
export function extractMaterialFromMessage(userMessage: string): MaterialCriteria {
  const message = userMessage.toLowerCase();
  const criteria: MaterialCriteria = {};

  // Spezifische Materialien
  if (message.includes('aluminium') || message.includes('aluminum')) {
    criteria.materialCategory = 'aluminum';
  } else if (message.includes('edelstahl') || message.includes('stainless')) {
    criteria.materialCategory = 'steel';
  } else if (message.includes('glas') || message.includes('glass')) {
    criteria.materialCategory = 'glass';
  } else if (message.includes('kunststoff') || message.includes('plastic') || 
             message.includes('polycarbonat')) {
    criteria.materialCategory = 'plastic';
  } else if (message.includes('keramik') || message.includes('ceramic')) {
    criteria.materialCategory = 'ceramic';
  }

  // Eigenschaften
  if (message.includes('wetterfest') || message.includes('outdoor') || 
      message.includes('außen') || message.includes('weather resistant')) {
    criteria.weatherResistant = true;
  }

  if (message.includes('hochwertig') || message.includes('premium') || 
      message.includes('qualität') || message.includes('edel')) {
    criteria.premium = true;
  }

  return criteria;
}

/**
 * Extrahiert Socket-Anforderungen aus Benutzer-Nachrichten
 * 
 * @param userMessage - Benutzer-Nachricht
 * @returns Erkannte Socket-Kriterien
 * 
 * @example
 * extractSocketFromMessage("GU10 Fassung") // { socketType: "gu10" }
 * extractSocketFromMessage("LED fest verbaut") // { lightSourceType: "integrated" }
 * extractSocketFromMessage("austauschbare LED") // { replaceableLightSource: true }
 */
export function extractSocketFromMessage(userMessage: string): SocketCriteria {
  const message = userMessage.toLowerCase();
  const criteria: SocketCriteria = {};

  // Socket-Typen
  if (message.includes('gu10')) {
    criteria.socketType = 'gu10';
  } else if (message.includes('e27')) {
    criteria.socketType = 'e27';
  } else if (message.includes('e14')) {
    criteria.socketType = 'e14';
  } else if (message.includes('g9')) {
    criteria.socketType = 'g9';
  }

  // Light Source Type
  if (message.includes('fest verbaut') || message.includes('integriert') || 
      message.includes('integrated')) {
    criteria.lightSourceType = 'integrated';
  } else if (message.includes('retrofit') || message.includes('austauschbar') || 
             message.includes('wechselbar')) {
    criteria.lightSourceType = 'retrofit';
    criteria.replaceableLightSource = true;
  }

  // Socket included
  if (message.includes('fassung inklusive') || message.includes('socket included')) {
    criteria.baseSocketIncluded = true;
  } else if (message.includes('ohne fassung') || message.includes('socket excluded')) {
    criteria.baseSocketIncluded = false;
  }

  return criteria;
}

/**
 * Sucht Produkte nach Material-Kriterien
 * 
 * @param criteria - Material-Kriterien
 * @param limit - Maximale Anzahl Ergebnisse
 * @returns Gefilterte Produkte
 */
export async function searchByMaterial(
  criteria: MaterialCriteria,
  limit: number = 50
): Promise<{ products: Product[]; filters: string[]; totalCount: number }> {
  const filters: string[] = [];
  
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('availability', true)
      .not('material', 'is', null);

    // Spezifisches Material
    if (criteria.specificMaterial) {
      query = query.ilike('material', `%${criteria.specificMaterial}%`);
      filters.push(`material contains: ${criteria.specificMaterial}`);
    }

    query = query.order('gross_price', { ascending: true }).limit(limit * 2);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Fehler bei der Material-Suche: ${error.message}`);
    }

    let products = data || [];

    // Nachträgliche Filterung
    if (criteria.materialCategory) {
      products = products.filter(product => 
        product.material && getMaterialCategory(product.material) === criteria.materialCategory
      );
      filters.push(`material category: ${criteria.materialCategory}`);
    }

    if (criteria.weatherResistant) {
      products = products.filter(product => 
        product.material && isWeatherResistant(product.material)
      );
      filters.push('weather resistant materials');
    }

    if (criteria.premium) {
      products = products.filter(product => 
        product.material && isPremiumMaterial(product.material)
      );
      filters.push('premium materials');
    }

    products = products.slice(0, limit);

    return {
      products,
      filters,
      totalCount: products.length
    };

  } catch (error) {
    console.error('Fehler bei der Material-Suche:', error);
    throw error;
  }
}

/**
 * Sucht Produkte nach Socket-Kriterien
 * 
 * @param criteria - Socket-Kriterien
 * @param limit - Maximale Anzahl Ergebnisse
 * @returns Gefilterte Produkte
 */
export async function searchBySocket(
  criteria: SocketCriteria,
  limit: number = 50
): Promise<{ products: Product[]; filters: string[]; totalCount: number }> {
  const filters: string[] = [];
  
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('availability', true);

    // Base Socket
    if (criteria.baseSocketIncluded !== undefined) {
      const socketValue = criteria.baseSocketIncluded ? 'included' : 'excluded';
      query = query.eq('base_socket', socketValue);
      filters.push(`base socket: ${socketValue}`);
    }

    // Light Source Type
    if (criteria.lightSourceType) {
      const lightSourceValue = criteria.lightSourceType === 'integrated' 
        ? 'LED integrated' 
        : 'Retrofit Socket';
      query = query.eq('lightsource', lightSourceValue);
      filters.push(`light source: ${criteria.lightSourceType}`);
    }

    // Replaceable Light Source
    if (criteria.replaceableLightSource !== undefined) {
      query = query.eq('replaceable_light_source', criteria.replaceableLightSource);
      filters.push(`replaceable light source: ${criteria.replaceableLightSource ? 'yes' : 'no'}`);
    }

    query = query.order('gross_price', { ascending: true }).limit(limit);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Fehler bei der Socket-Suche: ${error.message}`);
    }

    const products = data || [];

    return {
      products,
      filters,
      totalCount: products.length
    };

  } catch (error) {
    console.error('Fehler bei der Socket-Suche:', error);
    throw error;
  }
}

/**
 * Formatiert Material für Anzeige
 * 
 * @param material - Material-String
 * @returns Formatiertes Material mit Eigenschaften
 */
export function formatMaterial(material: string): string {
  const properties: string[] = [];
  
  if (isWeatherResistant(material)) {
    properties.push('wetterfest');
  }
  
  if (isPremiumMaterial(material)) {
    properties.push('premium');
  }

  const propertiesStr = properties.length > 0 ? ` (${properties.join(', ')})` : '';
  return `${material}${propertiesStr}`;
}

/**
 * Prüft ob eine Nachricht nach Material/Socket sucht
 * 
 * @param userMessage - Benutzer-Nachricht
 * @returns true wenn nach Material/Socket gesucht wird
 */
export function isMaterialSocketRequest(userMessage: string): boolean {
  const keywords = [
    'material', 'aluminum', 'steel', 'glass', 'plastic', 'ceramic',
    'wetterfest', 'outdoor', 'hochwertig', 'premium',
    'fassung', 'socket', 'gu10', 'e27', 'e14', 'g9',
    'retrofit', 'integriert', 'austauschbar', 'fest verbaut'
  ];
  
  const message = userMessage.toLowerCase();
  return keywords.some(keyword => message.includes(keyword));
}

/**
 * Berechnet Material-Statistiken für Produktliste
 * 
 * @param products - Produktliste
 * @returns Material-Statistiken
 */
export function calculateMaterialStats(products: Product[]): {
  materials: Record<string, number>;
  categories: Record<MaterialCategory, number>;
  weatherResistant: number;
  premium: number;
  total: number;
} {
  const stats = {
    materials: {} as Record<string, number>,
    categories: { 
      aluminum: 0, steel: 0, glass: 0, 
      plastic: 0, ceramic: 0, composite: 0 
    } as Record<MaterialCategory, number>,
    weatherResistant: 0,
    premium: 0,
    total: products.length
  };

  products.forEach(product => {
    if (product.material) {
      stats.materials[product.material] = 
        (stats.materials[product.material] || 0) + 1;

      const category = getMaterialCategory(product.material);
      if (category) {
        stats.categories[category]++;
      }

      if (isWeatherResistant(product.material)) {
        stats.weatherResistant++;
      }

      if (isPremiumMaterial(product.material)) {
        stats.premium++;
      }
    }
  });

  return stats;
}