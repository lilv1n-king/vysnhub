/**
 * Produktsuche Utility Module
 * 
 * Dieses Modul bietet wiederverwendbare Funktionen für die Produktsuche
 * in der VYSN Datenbank mit verschiedenen Suchkriterien.
 */

import { supabase, Product } from '../config/database';
import { getSufficientIPClasses } from './ipProtectionUtils';
import { filterLuminaires } from './luminaireUtils';
import { searchByCCT } from './cctUtils';

export interface SearchCriteria {
  minLumen?: number;
  maxLumen?: number;
  minWattage?: number;
  maxWattage?: number;
  minPrice?: number;
  maxPrice?: number;
  cct?: number;
  minCri?: number;
  energyClass?: string;
  ingressProtection?: string;
  housingColor?: string;
  category?: string;
  beamAngle?: number;
  onlyLuminaires?: boolean;
  limit?: number;
}

export interface SearchResult {
  products: Product[];
  totalCount: number;
  searchInfo: {
    criteria: SearchCriteria;
    executionTime: number;
    filters: string[];
  };
  metadata?: any; // Temporarily allow metadata for compatibility
}

/**
 * Führt eine einfache Textsuche in Produktnamen und Beschreibungen durch
 * 
 * @param searchTerm - Suchbegriff
 * @param limit - Maximale Anzahl Ergebnisse
 * @param onlyLuminaires - Nur echte Leuchten zurückgeben
 * @returns Suchergebnisse
 * 
 * @example
 * const results = await simpleTextSearch("LED Spot", 20);
 * const luminaires = await simpleTextSearch("LED", 50, true);
 */
export async function simpleTextSearch(
  searchTerm: string, 
  limit: number = 100, 
  onlyLuminaires: boolean = false
): Promise<SearchResult> {
  const startTime = Date.now();
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`vysn_name.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%,long_description.ilike.%${searchTerm}%,item_number_vysn.ilike.%${searchTerm}%,category_1.ilike.%${searchTerm}%,category_2.ilike.%${searchTerm}%,group_name.ilike.%${searchTerm}%`)
      .eq('availability', true)
      .limit(limit); // Dynamisches Limit verwenden

    if (error) {
      throw new Error(`Fehler bei der Textsuche: ${error.message}`);
    }

    let products = data || [];
    const filters = [`text search: "${searchTerm}"`];

    if (onlyLuminaires) {
      products = filterLuminaires(products);
      filters.push('luminaires only');
    }

    return {
      products,
      totalCount: products.length,
      searchInfo: {
        criteria: { limit, onlyLuminaires },
        executionTime: Date.now() - startTime,
        filters
      }
    };
  } catch (error) {
    console.error('Fehler bei der einfachen Textsuche:', error);
    throw error;
  }
}

/**
 * Führt eine erweiterte Produktsuche mit mehreren Kriterien durch
 * 
 * @param criteria - Suchkriterien
 * @returns Suchergebnisse
 * 
 * @example
 * const results = await advancedProductSearch({
 *   minLumen: 1000,
 *   maxWattage: 20,
 *   ingressProtection: "IP44",
 *   onlyLuminaires: true
 * });
 */
export async function advancedProductSearch(criteria: SearchCriteria): Promise<SearchResult> {
  const startTime = Date.now();
  const limit = criteria.limit || 50;
  const filters: string[] = [];

  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('availability', true);

    // Anwendung der verschiedenen Filter
    if (criteria.minLumen) {
      query = query.gte('lumen', criteria.minLumen);
      filters.push(`min lumen: ${criteria.minLumen}`);
    }
    
    if (criteria.maxLumen) {
      query = query.lte('lumen', criteria.maxLumen);
      filters.push(`max lumen: ${criteria.maxLumen}`);
    }
    
    if (criteria.minWattage) {
      query = query.gte('wattage', criteria.minWattage);
      filters.push(`min wattage: ${criteria.minWattage}W`);
    }
    
    if (criteria.maxWattage) {
      query = query.lte('wattage', criteria.maxWattage);
      filters.push(`max wattage: ${criteria.maxWattage}W`);
    }
    
    if (criteria.minPrice) {
      query = query.gte('gross_price', criteria.minPrice);
      filters.push(`min price: €${criteria.minPrice}`);
    }
    
    if (criteria.maxPrice) {
      query = query.lte('gross_price', criteria.maxPrice);
      filters.push(`max price: €${criteria.maxPrice}`);
    }
    
    if (criteria.cct) {
      query = query.eq('cct', criteria.cct);
      filters.push(`color temperature: ${criteria.cct}K`);
    }
    
    if (criteria.minCri) {
      query = query.gte('cri', criteria.minCri);
      filters.push(`min CRI: ${criteria.minCri}`);
    }
    
    if (criteria.energyClass) {
      query = query.eq('energy_class', criteria.energyClass);
      filters.push(`energy class: ${criteria.energyClass}`);
    }
    
    if (criteria.housingColor) {
      query = query.eq('housing_color', criteria.housingColor);
      filters.push(`housing color: ${criteria.housingColor}`);
    }
    
    if (criteria.beamAngle) {
      query = query.eq('beam_angle', criteria.beamAngle);
      filters.push(`beam angle: ${criteria.beamAngle}°`);
    }

    if (criteria.category) {
      query = query.or(`category_1.eq.${criteria.category},category_2.eq.${criteria.category},group_name.eq.${criteria.category}`);
      filters.push(`category: ${criteria.category}`);
    }

    // IP-Schutzklassen werden separat behandelt, da sie komplexer sind
    if (criteria.ingressProtection) {
      const sufficientIPs = getSufficientIPClasses(criteria.ingressProtection);
      query = query.in('ingress_protection', sufficientIPs);
      filters.push(`IP protection >= ${criteria.ingressProtection}`);
    }

    query = query.limit(limit); // Dynamisches Limit verwenden

    const { data, error } = await query;

    if (error) {
      throw new Error(`Fehler bei der erweiterten Suche: ${error.message}`);
    }

    let products = data || [];

    // Leuchten-Filter wird nach der DB-Abfrage angewendet
    if (criteria.onlyLuminaires) {
      products = filterLuminaires(products);
      filters.push('luminaires only');
    }

    return {
      products,
      totalCount: products.length,
      searchInfo: {
        criteria,
        executionTime: Date.now() - startTime,
        filters
      }
    };
  } catch (error) {
    console.error('Fehler bei der erweiterten Produktsuche:', error);
    throw error;
  }
}

/**
 * Sucht nach Produkten mit bestimmter IP-Schutzklasse
 * 
 * @param minIPClass - Mindestens erforderliche IP-Schutzklasse
 * @param onlyLuminaires - Nur echte Leuchten zurückgeben
 * @param limit - Maximale Anzahl Ergebnisse
 * @returns Suchergebnisse
 * 
 * @example
 * const outdoorLights = await searchByIPProtection("IP65", true);
 * const allIP44Products = await searchByIPProtection("IP44", false);
 */
export async function searchByIPProtection(
  minIPClass: string, 
  onlyLuminaires: boolean = false, 
  limit: number = 100
): Promise<SearchResult> {
  const startTime = Date.now();
  
  try {
    const sufficientIPClasses = getSufficientIPClasses(minIPClass);
    const filters = [`IP protection >= ${minIPClass}`];
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('ingress_protection', sufficientIPClasses)
      .eq('availability', true)
      .order('gross_price', { ascending: true })
      .limit(limit); // Dynamisches Limit verwenden

    if (error) {
      throw new Error(`Fehler bei IP-Schutzklassen-Suche: ${error.message}`);
    }

    let products = data || [];

    if (onlyLuminaires) {
      products = filterLuminaires(products);
      filters.push('luminaires only');
    }

    return {
      products,
      totalCount: products.length,
      searchInfo: {
        criteria: { ingressProtection: minIPClass, onlyLuminaires, limit },
        executionTime: Date.now() - startTime,
        filters
      }
    };
  } catch (error) {
    console.error('Fehler bei der IP-Schutzklassen-Suche:', error);
    throw error;
  }
}

/**
 * Sucht ähnliche Produkte basierend auf einem Referenzprodukt
 * 
 * @param referenceProduct - Referenzprodukt
 * @param limit - Maximale Anzahl ähnlicher Produkte
 * @param tolerances - Toleranzen für Ähnlichkeitsvergleich
 * @returns Ähnliche Produkte
 * 
 * @example
 * const similar = await searchSimilarProducts(product, 10);
 * const similarStrict = await searchSimilarProducts(product, 5, { wattage: 0.1, lumen: 0.2 });
 */
export async function searchSimilarProducts(
  referenceProduct: Product, 
  limit: number = 10,
  tolerances = { wattage: 0.2, lumen: 0.3 }
): Promise<SearchResult> {
  const startTime = Date.now();
  const filters: string[] = [];

  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('availability', true)
      .neq('id', referenceProduct.id || 0);

    // Ähnlichkeit basierend auf Kategorie
    if (referenceProduct.category_1) {
      query = query.eq('category_1', referenceProduct.category_1);
      filters.push(`same category: ${referenceProduct.category_1}`);
    }

    // Wattage-Toleranz
    if (referenceProduct.wattage) {
      const tolerance = referenceProduct.wattage * tolerances.wattage;
      query = query
        .gte('wattage', referenceProduct.wattage - tolerance)
        .lte('wattage', referenceProduct.wattage + tolerance);
      filters.push(`wattage: ${referenceProduct.wattage}W ±${Math.round(tolerance)}W`);
    }

    // Lumen-Toleranz
    if (referenceProduct.lumen) {
      const tolerance = referenceProduct.lumen * tolerances.lumen;
      query = query
        .gte('lumen', referenceProduct.lumen - tolerance)
        .lte('lumen', referenceProduct.lumen + tolerance);
      filters.push(`lumen: ${referenceProduct.lumen}lm ±${Math.round(tolerance)}lm`);
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Fehler bei der Suche ähnlicher Produkte: ${error.message}`);
    }

    const products = data || [];

    return {
      products,
      totalCount: products.length,
      searchInfo: {
        criteria: { limit },
        executionTime: Date.now() - startTime,
        filters
      }
    };
  } catch (error) {
    console.error('Fehler bei der Suche ähnlicher Produkte:', error);
    throw error;
  }
}

/**
 * Extrahiert IP-Schutzklasse aus Benutzer-Nachricht
 * 
 * @param userMessage - Benutzer-Nachricht  
 * @returns Extrahierte IP-Schutzklasse oder null wenn nicht gefunden
 * 
 * @example
 * extractIPFromMessage("ich brauche ip44 leuchten") // "IP44"
 * extractIPFromMessage("mindestens ip65") // "IP65"
 * extractIPFromMessage("für draußen") // "IP44" (outdoor default)
 * extractIPFromMessage("weiße leuchte") // null
 */
export function extractIPFromMessage(userMessage: string): string | null {
  const message = userMessage.toLowerCase();
  
  // Direkte IP-Schutzklasse erwähnt
  const ipMatch = userMessage.match(/ip\s*(\d{2})/i);
  if (ipMatch) {
    return `IP${ipMatch[1]}`;
  }
  
  // Outdoor/Außenbereich - impliziert mindestens IP44
  const outdoorKeywords = [
    'draußen', 'außen', 'outdoor', 'garten', 'terrasse', 
    'balkon', 'wetterfest', 'wasserdicht', 'feuchtraum',
    'bad', 'badezimmer', 'dusche'
  ];
  
  if (outdoorKeywords.some(keyword => message.includes(keyword))) {
    return 'IP44';
  }
  
  return null;
}

/**
 * Prüft ob eine Anfrage nach Leuchten sucht
 * 
 * @param userMessage - Benutzer-Nachricht
 * @returns true wenn nach Leuchten gesucht wird
 * 
 * @example
 * isLuminaireRequest("ich suche eine leuchte") // true
 * isLuminaireRequest("led spot für wohnzimmer") // false
 * isLuminaireRequest("outdoor luminaire") // true
 */
export function isLuminaireRequest(userMessage: string): boolean {
  const luminaireKeywords = [
    'leuchte', 'leuchten', 'luminaire', 'luminaires',
    'lampe', 'lampen', 'lamp', 'lamps'
  ];
  
  // Ausschluss-Keywords für Module und Komponenten
  const componentKeywords = [
    'modul', 'module', 'komponente', 'component', 
    'led chip', 'led-chip', 'treiber', 'driver'
  ];
  
  const message = userMessage.toLowerCase();
  
  // Wenn explizit nach Modulen/Komponenten gesucht wird, ist es keine Leuchten-Anfrage
  if (componentKeywords.some(keyword => message.includes(keyword))) {
    return false;
  }
  
  return luminaireKeywords.some(keyword => message.includes(keyword));
}

/**
 * Suche nach spezifischem Leuchtentyp mit optionalen Filtern
 */
export async function searchByLuminaireType(
  luminaireType: string,
  minIPClass?: string,
  cct?: number,
  cctSwitch?: string,
  limit: number = 50
): Promise<SearchResult> {
  const startTime = Date.now();
  const filters: string[] = [`luminaire type: ${luminaireType}`];

  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('availability', true);

    // Filtere nach Leuchtentyp basierend auf category_2
    switch (luminaireType.toLowerCase()) {
      case 'ceiling':
      case 'deckenleuchte':
        query = query.in('category_2', ['Recessed ceiling luminaires', 'Surface ceiling luminares']);
        break;
      case 'wall':
      case 'wandleuchte':
        query = query.eq('category_2', 'Surface wall luminaires');
        break;
      case 'floor':
      case 'stehleuchte':
        query = query.eq('category_2', 'Floor lamps');
        break;
      case 'pendant':
      case 'pendelleuchte':
        query = query.eq('category_2', 'Pendant lamps');
        break;
      case 'table':
      case 'tischleuchte':
        query = query.eq('category_2', 'Table lamps');
        break;
      case 'track':
      case 'schienenstrahler':
        query = query.in('category_2', [
          '1 circuit track system luminaires',
          '3 circuit track system luminaires'
        ]);
        break;
      case 'inground':
      case 'bodeneinbauleuchte':
        query = query.eq('category_2', 'Inground fittings');
        break;
      default:
        // Fallback: Suche in allen Leuchten-Kategorien
        query = query.in('category_2', [
          'Recessed ceiling luminaires',
          'Surface ceiling luminares',
          'Surface wall luminaires',
          'Floor lamps',
          'Pendant lamps',
          'Table lamps',
          '1 circuit track system luminaires',
          '3 circuit track system luminaires',
          'Inground fittings'
        ]);
    }

    // CCT-Filter wird über dedizierte CCT Utils gehandhabt
    let finalProducts: Product[] = [];
    
         if (cct || cctSwitch) {
       console.log(`DEBUG: CCT search requested - cct: ${cct}, cctSwitch: ${cctSwitch}`);
       
       // Temporär: Verwende einfache direkte Suche statt CCT Utils
       let cctQuery = supabase
         .from('products')
         .select('*')
         .eq('availability', true);
         
       // Leuchtentyp-Filter ZUERST
       switch (luminaireType.toLowerCase()) {
         case 'wall':
         case 'wandleuchte':
           cctQuery = cctQuery.eq('category_2', 'Surface wall luminaires');
           break;
         case 'ceiling':
         case 'deckenleuchte':
           cctQuery = cctQuery.in('category_2', ['Recessed ceiling luminaires', 'Surface ceiling luminares']);
           break;
         // ... andere cases falls nötig
       }
       
       // Dann CCT-Filter
       if (cct) {
         // Suche in beiden Spalten: direkte CCT oder CCT-Switch enthält Wert
         cctQuery = cctQuery.or(`cct.eq.${cct},cct_switch_value.ilike.%${cct}%`);
         filters.push(`CCT: ${cct}K (direct or switch)`);
       } else if (cctSwitch) {
         cctQuery = cctQuery.not('cct_switch_value', 'is', null);
         filters.push('CCT switch capable');
       }
       
       cctQuery = cctQuery.limit(limit); // Dynamisches Limit verwenden
       
       const { data, error } = await cctQuery;
       if (error) {
         console.error('CCT query error:', error);
         throw new Error(`CCT search error: ${error.message}`);
       }
       
       finalProducts = data || [];
       console.log(`DEBUG: Found ${finalProducts.length} products after CCT filter`);
       
     } else {
      // Normale Leuchtentyp-Suche ohne CCT-Filter
      const { data, error } = await query;
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      finalProducts = data || [];
    }

    // IP-Schutzklassen-Filter (nur wenn explizit gefordert)
    if (minIPClass) {
      const sufficientClasses = getSufficientIPClasses(minIPClass);
      query = query.in('ingress_protection', sufficientClasses);
      filters.push(`IP protection: >= ${minIPClass}`);
    }

    // IP-Schutzklassen-Filter (nur wenn explizit gefordert)
    if (minIPClass && finalProducts.length > 0) {
      const sufficientClasses = getSufficientIPClasses(minIPClass);
      finalProducts = finalProducts.filter(product => 
        sufficientClasses.includes(product.ingress_protection || '')
      );
      filters.push(`IP protection: >= ${minIPClass}`);
    }

    const responseTime = Date.now() - startTime;
    const limitedProducts = finalProducts.slice(0, limit);

    return {
      products: limitedProducts,
      totalCount: limitedProducts.length,
      searchInfo: {
        criteria: { cct, ingressProtection: minIPClass },
        executionTime: responseTime,
        filters: filters
      },
      metadata: {
        luminaireType,
        cct,
        cctSwitch,
        minIPClass,
        query: 'searchByLuminaireType'
      }
    };

  } catch (error) {
    console.error('Error in searchByLuminaireType:', error);
    throw error;
  }
}

/**
 * Extrahiert Leuchtentyp aus Benutzer-Nachricht
 * 
 * @param userMessage - Benutzer-Nachricht
 * @returns Erkannter Leuchtentyp oder null
 * 
 * @example
 * extractLuminaireType("ich brauche eine deckenleuchte") // "ceiling"
 * extractLuminaireType("wandleuchte für flur") // "wall"
 */
export function extractLuminaireType(userMessage: string): string | null {
  const message = userMessage.toLowerCase();
  
  // Nur sehr spezifische Leuchtentypen für Fast Path geeignet
  if (message.includes('deckenleuchte') || message.includes('ceiling')) return 'ceiling';
  if (message.includes('wandleuchte') || message.includes('wall')) return 'wall';
  if (message.includes('stehleuchte') || message.includes('floor')) return 'floor';
  if (message.includes('pendelleuchte') || message.includes('pendant')) return 'pendant';
  if (message.includes('tischleuchte') || message.includes('table')) return 'table';
  if (message.includes('außenleuchte') || message.includes('outdoor') || message.includes('garten')) return 'outdoor';
  if (message.includes('schienensystem') || message.includes('track')) return 'track';
  
  // "leuchte" allein ist zu generisch - kein Fast Path
  // Normale GPT-basierte Suche ist hier besser
  
  return null;
}

// CCT-Funktionen wurden nach cctUtils.ts verschoben
export { 
  extractCCTFromMessage, 
  isCCTSwitchRequested, 
  isCCTRequest,
  searchByCCT,
  formatCCTInfo 
} from './cctUtils';

/**
 * Erstellt Suchstatistiken
 * 
 * @param searchResult - Suchergebnis
 * @returns Formatierte Statistiken
 * 
 * @example
 * const stats = getSearchStatistics(searchResult);
 * console.log(stats.summary); // "Found 15 products in 234ms"
 */
export function getSearchStatistics(searchResult: SearchResult): {
  summary: string;
  details: string[];
  performance: string;
} {
  const { products, searchInfo } = searchResult;
  
  return {
    summary: `Found ${products.length} products in ${searchInfo.executionTime}ms`,
    details: searchInfo.filters,
    performance: `Query executed in ${searchInfo.executionTime}ms`
  };
}