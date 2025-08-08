/**
 * Leuchten-Filter Utility Module
 * 
 * Dieses Modul bietet wiederverwendbare Funktionen zur Unterscheidung zwischen
 * echten Leuchten und Komponenten/Zubehör in der VYSN Produktdatenbank.
 */

import { Product } from '../config/database';

/**
 * Kategorien die definitiv keine Leuchten sind
 */
export const NON_LUMINAIRE_CATEGORIES_1 = [
  'Components',
  'Spare parts'
];

/**
 * Category 2 Werte die Komponenten/Zubehör sind
 */
export const COMPONENT_CATEGORIES_2 = [
  'Electrical components',
  'Mechanical components', 
  'Control devices',
  'Transformers',
  'Aluminum profiles',
  'LED strips single Colour',
  'LED strips multi color',
  'LED modules',
  '1 circuit track system components',
  '3 circuit track system components',
  'Rope system components'
];

/**
 * Category 2 Werte die definitiv Leuchten sind
 */
export const LUMINAIRE_CATEGORIES_2 = [
  'Recessed ceiling luminaires',
  'Surface ceiling luminares',  // Note: "luminares" ist ein Typo in den Daten
  'Surface wall luminaires',
  '1 circuit track system luminaires',
  '3 circuit track system luminaires',
  'Surface wall and ceiling luminaires',
  'Rope system luminaires',
  'Inground fittings',
  'Pendant lamps',
  'Recessed wall luminaires',
  'Floor lamps',
  'Table lamps',
  'Spike lights'
];

/**
 * Category 1 Werte die allgemeine Leuchten-Kategorien sind
 */
export const GENERAL_LUMINAIRE_CATEGORIES_1 = [
  'Indoor',
  'Outdoor',
  'LED bulb'
];

/**
 * Prüft ob ein Produkt eine echte Leuchte ist (keine Komponente/Zubehör)
 * 
 * @param product - Das zu prüfende Produkt
 * @param verbose - Ob Debug-Ausgaben gemacht werden sollen
 * @returns true wenn es sich um eine echte Leuchte handelt
 * 
 * @example
 * isRealLuminaire(product) // true/false
 * isRealLuminaire(product, true) // true/false mit Debug-Ausgaben
 */
export function isRealLuminaire(product: Product, verbose: boolean = false): boolean {
  const cat1 = product.category_1;
  const cat2 = product.category_2;
  
  if (verbose) {
    console.log(`Checking luminaire: ${product.vysn_name} | Cat1: ${cat1} | Cat2: ${cat2}`);
  }

  // Filtere Components und Spare parts in Category 1 raus
  if (cat1 && NON_LUMINAIRE_CATEGORIES_1.includes(cat1)) {
    if (verbose) {
      console.log(`  -> REJECTED: Category 1 is ${cat1}`);
    }
    return false;
  }

  // Filtere Komponenten in Category 2 raus
  if (cat2 && COMPONENT_CATEGORIES_2.includes(cat2)) {
    if (verbose) {
      console.log(`  -> REJECTED: Category 2 is component: ${cat2}`);
    }
    return false;
  }

  // Positive Liste: Category 2 Werte die definitiv Leuchten sind
  if (cat2 && LUMINAIRE_CATEGORIES_2.includes(cat2)) {
    if (verbose) {
      console.log(`  -> ACCEPTED: Category 2 is luminaire: ${cat2}`);
    }
    return true;
  }

  // Wenn Category 1 Indoor/Outdoor/LED bulb ist, auch eine Leuchte
  if (cat1 && GENERAL_LUMINAIRE_CATEGORIES_1.includes(cat1)) {
    if (verbose) {
      console.log(`  -> ACCEPTED: Category 1 is ${cat1} (general luminaire category)`);
    }
    return true;
  }

  if (verbose) {
    console.log(`  -> REJECTED: No matching criteria`);
  }
  return false;
}

/**
 * Filtert eine Liste von Produkten nach echten Leuchten
 * 
 * @param products - Liste von Produkten
 * @param verbose - Ob Debug-Ausgaben gemacht werden sollen
 * @returns Gefilterte Liste nur mit echten Leuchten
 * 
 * @example
 * const luminaires = filterLuminaires(allProducts);
 * const luminairesVerbose = filterLuminaires(allProducts, true);
 */
export function filterLuminaires(products: Product[], verbose: boolean = false): Product[] {
  if (verbose) {
    console.log(`Filtering ${products.length} products for luminaires...`);
    console.log('Sample products before filter:');
    products.slice(0, 3).forEach(p => {
      console.log(`  - ${p.vysn_name} | Cat1: ${p.category_1} | Cat2: ${p.category_2} | IsLuminaire: ${isRealLuminaire(p)}`);
    });
  }

  const filtered = products.filter(product => isRealLuminaire(product, verbose));
  
  if (verbose) {
    console.log(`After luminaires filter: ${filtered.length} products`);
  }
  
  return filtered;
}

/**
 * Kategorisiert Leuchten nach Typ
 * 
 * @param product - Das Leuchten-Produkt
 * @returns Typ der Leuchte
 * 
 * @example
 * getLuminaireType(product) // "ceiling", "wall", "floor", "pendant", "outdoor", "track", "unknown"
 */
export function getLuminaireType(product: Product): string {
  const cat2 = product.category_2?.toLowerCase() || '';
  
  if (cat2.includes('ceiling')) return 'ceiling';
  if (cat2.includes('wall')) return 'wall';
  if (cat2.includes('floor')) return 'floor';
  if (cat2.includes('pendant')) return 'pendant';
  if (cat2.includes('track')) return 'track';
  if (cat2.includes('rope')) return 'rope';
  if (cat2.includes('inground') || cat2.includes('spike')) return 'outdoor';
  if (cat2.includes('table')) return 'table';
  
  // Fallback auf Category 1
  const cat1 = product.category_1?.toLowerCase() || '';
  if (cat1.includes('outdoor')) return 'outdoor';
  if (cat1.includes('indoor')) return 'indoor';
  
  return 'unknown';
}

/**
 * Prüft ob eine Leuchte für den Außenbereich geeignet ist
 * 
 * @param product - Das Leuchten-Produkt
 * @returns true wenn für Außenbereich geeignet
 * 
 * @example
 * isOutdoorSuitable(product) // true/false
 */
export function isOutdoorSuitable(product: Product): boolean {
  // Category 1 Outdoor
  if (product.category_1 === 'Outdoor') return true;
  
  // IP-Schutzklasse >= IP65
  if (product.ingress_protection) {
    const ipRegex = /IP(\d{2})/;
    const match = product.ingress_protection.match(ipRegex);
    if (match) {
      const ipLevel = parseInt(match[1]);
      return ipLevel >= 65;
    }
  }
  
  return false;
}

/**
 * Zählt Leuchten nach Kategorien
 * 
 * @param products - Liste von Leuchten-Produkten
 * @returns Objekt mit Anzahl pro Kategorie
 * 
 * @example
 * const counts = countLuminairesByCategory(luminaires);
 * // { ceiling: 15, wall: 8, floor: 3, ... }
 */
export function countLuminairesByCategory(products: Product[]): Record<string, number> {
  const counts: Record<string, number> = {};
  
  products.forEach(product => {
    const type = getLuminaireType(product);
    counts[type] = (counts[type] || 0) + 1;
  });
  
  return counts;
}

/**
 * Sucht Leuchten nach Installationstyp
 * 
 * @param products - Liste von Produkten
 * @param installationType - Art der Installation ("recessed", "surface", "pendant", "floor", "wall", "track")
 * @returns Gefilterte Liste
 * 
 * @example
 * const ceilingLights = filterByInstallationType(products, "recessed");
 * const wallLights = filterByInstallationType(products, "wall");
 */
export function filterByInstallationType(products: Product[], installationType: string): Product[] {
  return products.filter(product => {
    const cat2 = product.category_2?.toLowerCase() || '';
    
    switch (installationType.toLowerCase()) {
      case 'recessed':
        return cat2.includes('recessed');
      case 'surface':
        return cat2.includes('surface');
      case 'pendant':
        return cat2.includes('pendant');
      case 'floor':
        return cat2.includes('floor');
      case 'wall':
        return cat2.includes('wall');
      case 'track':
        return cat2.includes('track');
      case 'inground':
        return cat2.includes('inground');
      case 'spike':
        return cat2.includes('spike');
      default:
        return false;
    }
  });
}