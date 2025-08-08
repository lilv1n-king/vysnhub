/**
 * Installation & Lightsource-Utility Module
 * 
 * Dieses Modul bietet Funktionen für installations- und lichtquellen-basierte Produktsuche.
 * 
 * Installation aus DB-Analyse: 'Recessed', 'Surface'
 * Lightsource: 'LED integrated', 'Retrofit Socket'
 * Replaceable Light Source: true, false
 */

import { supabase, Product } from '../config/database';

export type InstallationType = 'recessed' | 'surface';
export type LightSourceType = 'integrated' | 'retrofit';

export interface InstallationCriteria {
  installationType?: InstallationType;
  recessed?: boolean; // Einbau
  surface?: boolean; // Aufbau
  easyInstall?: boolean; // Einfache Installation
}

export interface LightSourceCriteria {
  lightSourceType?: LightSourceType;
  integrated?: boolean; // LED fest verbaut
  retrofit?: boolean; // Retrofit-kompatibel
  replaceable?: boolean; // Austauschbare Lichtquelle
  professionalReplacement?: boolean; // Nur von Fachkraft austauschbar
}

/**
 * Installation-Mappings
 */
export const INSTALLATION_MAPPING = {
  recessed: 'Recessed',
  surface: 'Surface'
} as const;

/**
 * Lightsource-Mappings
 */
export const LIGHTSOURCE_MAPPING = {
  integrated: 'LED integrated',
  retrofit: 'Retrofit Socket'
} as const;

/**
 * Extrahiert Installation-Anforderungen aus Benutzer-Nachrichten
 * 
 * @param userMessage - Benutzer-Nachricht
 * @returns Erkannte Installation-Kriterien
 * 
 * @example
 * extractInstallationFromMessage("Einbauleuchte") // { installationType: "recessed" }
 * extractInstallationFromMessage("Aufbauleuchte") // { installationType: "surface" }
 * extractInstallationFromMessage("einfach zu installieren") // { easyInstall: true }
 */
export function extractInstallationFromMessage(userMessage: string): InstallationCriteria {
  const message = userMessage.toLowerCase();
  const criteria: InstallationCriteria = {};

  // Installation-Typen
  if (message.includes('einbau') || message.includes('recessed') || 
      message.includes('eingelassen') || message.includes('versenkt')) {
    criteria.installationType = 'recessed';
    criteria.recessed = true;
  } else if (message.includes('aufbau') || message.includes('surface') || 
             message.includes('aufgesetzt') || message.includes('angebaut')) {
    criteria.installationType = 'surface';
    criteria.surface = true;
  }

  // Installation-Eigenschaften
  if (message.includes('einfach zu installieren') || message.includes('easy install') || 
      message.includes('montage') || message.includes('installation')) {
    criteria.easyInstall = true;
  }

  return criteria;
}

/**
 * Extrahiert Lightsource-Anforderungen aus Benutzer-Nachrichten
 * 
 * @param userMessage - Benutzer-Nachricht
 * @returns Erkannte Lightsource-Kriterien
 * 
 * @example
 * extractLightSourceFromMessage("LED fest verbaut") // { lightSourceType: "integrated" }
 * extractLightSourceFromMessage("austauschbare LED") // { replaceable: true }
 * extractLightSourceFromMessage("retrofit kompatibel") // { lightSourceType: "retrofit" }
 */
export function extractLightSourceFromMessage(userMessage: string): LightSourceCriteria {
  const message = userMessage.toLowerCase();
  const criteria: LightSourceCriteria = {};

  // Light Source Typen
  if (message.includes('fest verbaut') || message.includes('integriert') || 
      message.includes('integrated') || message.includes('eingebaut')) {
    criteria.lightSourceType = 'integrated';
    criteria.integrated = true;
  } else if (message.includes('retrofit') || message.includes('austauschbar') || 
             message.includes('wechselbar') || message.includes('ersetzbar')) {
    criteria.lightSourceType = 'retrofit';
    criteria.retrofit = true;
    criteria.replaceable = true;
  }

  // Austauschbarkeit
  if (message.includes('nur fachkraft') || message.includes('professional only') || 
      message.includes('by professional')) {
    criteria.professionalReplacement = true;
  }

  // Explizite Austauschbarkeit
  if (message.includes('austauschbar') || message.includes('replaceable') || 
      message.includes('wechselbar')) {
    criteria.replaceable = true;
  }

  return criteria;
}

/**
 * Sucht Produkte nach Installation-Kriterien
 * 
 * @param criteria - Installation-Kriterien
 * @param limit - Maximale Anzahl Ergebnisse
 * @returns Gefilterte Produkte
 */
export async function searchByInstallation(
  criteria: InstallationCriteria,
  limit: number = 50
): Promise<{ products: Product[]; filters: string[]; totalCount: number }> {
  const filters: string[] = [];
  
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('availability', true);

    // Installation Type Filter
    if (criteria.installationType) {
      const installationValue = INSTALLATION_MAPPING[criteria.installationType];
      query = query.eq('installation', installationValue);
      filters.push(`installation: ${criteria.installationType}`);
    }

    query = query.order('gross_price', { ascending: true }).limit(limit);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Fehler bei der Installation-Suche: ${error.message}`);
    }

    const products = data || [];

    return {
      products,
      filters,
      totalCount: products.length
    };

  } catch (error) {
    console.error('Fehler bei der Installation-Suche:', error);
    throw error;
  }
}

/**
 * Sucht Produkte nach Lightsource-Kriterien
 * 
 * @param criteria - Lightsource-Kriterien
 * @param limit - Maximale Anzahl Ergebnisse
 * @returns Gefilterte Produkte
 */
export async function searchByLightSource(
  criteria: LightSourceCriteria,
  limit: number = 50
): Promise<{ products: Product[]; filters: string[]; totalCount: number }> {
  const filters: string[] = [];
  
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('availability', true);

    // Light Source Type Filter
    if (criteria.lightSourceType) {
      const lightSourceValue = LIGHTSOURCE_MAPPING[criteria.lightSourceType];
      query = query.eq('lightsource', lightSourceValue);
      filters.push(`light source: ${criteria.lightSourceType}`);
    }

    // Replaceable Light Source Filter
    if (criteria.replaceable !== undefined) {
      query = query.eq('replaceable_light_source', criteria.replaceable);
      filters.push(`replaceable light source: ${criteria.replaceable ? 'yes' : 'no'}`);
    }

    query = query.order('gross_price', { ascending: true }).limit(limit);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Fehler bei der Lightsource-Suche: ${error.message}`);
    }

    const products = data || [];

    return {
      products,
      filters,
      totalCount: products.length
    };

  } catch (error) {
    console.error('Fehler bei der Lightsource-Suche:', error);
    throw error;
  }
}

/**
 * Prüft ob Produkt Einbau-Installation ist
 * 
 * @param product - Produkt
 * @returns true wenn Einbau
 */
export function isRecessed(product: Product): boolean {
  return product.installation === 'Recessed';
}

/**
 * Prüft ob Produkt Aufbau-Installation ist
 * 
 * @param product - Produkt
 * @returns true wenn Aufbau
 */
export function isSurface(product: Product): boolean {
  return product.installation === 'Surface';
}

/**
 * Prüft ob Produkt integrierte LED hat
 * 
 * @param product - Produkt
 * @returns true wenn integrierte LED
 */
export function hasIntegratedLED(product: Product): boolean {
  return product.lightsource === 'LED integrated';
}

/**
 * Prüft ob Produkt Retrofit-kompatibel ist
 * 
 * @param product - Produkt
 * @returns true wenn Retrofit
 */
export function isRetrofitCompatible(product: Product): boolean {
  return product.lightsource === 'Retrofit Socket';
}

/**
 * Prüft ob Lichtquelle austauschbar ist
 * 
 * @param product - Produkt
 * @returns true wenn austauschbar
 */
export function hasReplaceableLightSource(product: Product): boolean {
  return product.replaceable_light_source === true;
}

/**
 * Formatiert Installation für Anzeige
 * 
 * @param installation - Installation-Wert
 * @returns Formatierte Anzeige
 */
export function formatInstallation(installation: string | null | undefined): string {
  const descriptions: Record<string, string> = {
    'Recessed': 'Einbau (Recessed)',
    'Surface': 'Aufbau (Surface)'
  };

  return installation && descriptions[installation] 
    ? descriptions[installation] 
    : installation || 'Installation nicht spezifiziert';
}

/**
 * Formatiert Lightsource für Anzeige
 * 
 * @param lightsource - Lightsource-Wert
 * @param replaceable - Austauschbar-Status
 * @returns Formatierte Anzeige
 */
export function formatLightSource(
  lightsource: string | null | undefined, 
  replaceable?: boolean | null
): string {
  const descriptions: Record<string, string> = {
    'LED integrated': 'LED fest verbaut',
    'Retrofit Socket': 'Retrofit-Fassung'
  };

  let result = lightsource && descriptions[lightsource] 
    ? descriptions[lightsource] 
    : lightsource || 'Lichtquelle nicht spezifiziert';

  if (replaceable !== undefined && replaceable !== null) {
    result += replaceable ? ' (austauschbar)' : ' (nicht austauschbar)';
  }

  return result;
}

/**
 * Prüft ob eine Nachricht nach Installation/Lightsource sucht
 * 
 * @param userMessage - Benutzer-Nachricht
 * @returns true wenn nach Installation/Lightsource gesucht wird
 */
export function isInstallationLightSourceRequest(userMessage: string): boolean {
  const keywords = [
    'einbau', 'aufbau', 'recessed', 'surface', 'installation', 'montage',
    'fest verbaut', 'integriert', 'integrated', 'retrofit', 
    'austauschbar', 'wechselbar', 'replaceable', 'lichtquelle', 'lightsource'
  ];
  
  const message = userMessage.toLowerCase();
  return keywords.some(keyword => message.includes(keyword));
}

/**
 * Berechnet Installation- und Lightsource-Statistiken
 * 
 * @param products - Produktliste
 * @returns Statistiken
 */
export function calculateInstallationLightSourceStats(products: Product[]): {
  installations: Record<string, number>;
  lightSources: Record<string, number>;
  replaceable: number;
  nonReplaceable: number;
  total: number;
} {
  const stats = {
    installations: {} as Record<string, number>,
    lightSources: {} as Record<string, number>,
    replaceable: 0,
    nonReplaceable: 0,
    total: products.length
  };

  products.forEach(product => {
    // Installation-Typen zählen
    if (product.installation) {
      stats.installations[product.installation] = 
        (stats.installations[product.installation] || 0) + 1;
    }

    // Light Source Typen zählen
    if (product.lightsource) {
      stats.lightSources[product.lightsource] = 
        (stats.lightSources[product.lightsource] || 0) + 1;
    }

    // Austauschbarkeit zählen
    if (product.replaceable_light_source === true) {
      stats.replaceable++;
    } else if (product.replaceable_light_source === false) {
      stats.nonReplaceable++;
    }
  });

  return stats;
}

/**
 * Kombinierte Suche nach Installation UND Lightsource
 * 
 * @param installationCriteria - Installation-Kriterien
 * @param lightSourceCriteria - Lightsource-Kriterien
 * @param limit - Maximale Anzahl Ergebnisse
 * @returns Gefilterte Produkte
 */
export async function searchByInstallationAndLightSource(
  installationCriteria: InstallationCriteria,
  lightSourceCriteria: LightSourceCriteria,
  limit: number = 50
): Promise<{ products: Product[]; filters: string[]; totalCount: number }> {
  const filters: string[] = [];
  
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('availability', true);

    // Installation Filter
    if (installationCriteria.installationType) {
      const installationValue = INSTALLATION_MAPPING[installationCriteria.installationType];
      query = query.eq('installation', installationValue);
      filters.push(`installation: ${installationCriteria.installationType}`);
    }

    // Lightsource Filter
    if (lightSourceCriteria.lightSourceType) {
      const lightSourceValue = LIGHTSOURCE_MAPPING[lightSourceCriteria.lightSourceType];
      query = query.eq('lightsource', lightSourceValue);
      filters.push(`light source: ${lightSourceCriteria.lightSourceType}`);
    }

    // Replaceable Filter
    if (lightSourceCriteria.replaceable !== undefined) {
      query = query.eq('replaceable_light_source', lightSourceCriteria.replaceable);
      filters.push(`replaceable: ${lightSourceCriteria.replaceable ? 'yes' : 'no'}`);
    }

    query = query.order('gross_price', { ascending: true }).limit(limit);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Fehler bei der kombinierten Suche: ${error.message}`);
    }

    const products = data || [];

    return {
      products,
      filters,
      totalCount: products.length
    };

  } catch (error) {
    console.error('Fehler bei der kombinierten Installation/Lightsource-Suche:', error);
    throw error;
  }
}