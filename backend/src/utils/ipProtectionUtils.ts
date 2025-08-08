/**
 * IP-Schutzklassen Utility Module
 * 
 * Dieses Modul bietet wiederverwendbare Funktionen für die Arbeit mit IP-Schutzklassen
 * in der VYSN Produktdatenbank.
 */

export interface IPHierarchyLevel {
  level: number;
  foreign: number;
  water: number;
}

export const IP_HIERARCHY: Record<string, IPHierarchyLevel> = {
  'IP20': { foreign: 2, water: 0, level: 1 },
  'IP23': { foreign: 2, water: 3, level: 2 },
  'IP44': { foreign: 4, water: 4, level: 3 },
  'IP54': { foreign: 5, water: 4, level: 4 },
  'IP65': { foreign: 6, water: 5, level: 5 },
  'IP67': { foreign: 6, water: 7, level: 6 },
  'IP68': { foreign: 6, water: 8, level: 7 }
};

/**
 * Alle in der Datenbank vorkommenden IP-Schutzklassen
 * (inkl. kombinierte Werte wie "IP20/IP54")
 */
export const ALL_IP_CLASSES = [
  'IP20', 'IP23', 'IP44', 'IP54', 'IP65', 'IP67', 'IP68',
  'IP20/IP54', 'IP65/IP44'
];

/**
 * Extrahiert IP-Klassen aus einem String
 * 
 * @param ipString - String der IP-Klassen enthält (z.B. "IP65/IP44" oder "IP20")
 * @returns Array von IP-Klassen (z.B. ["IP65", "IP44"])
 * 
 * @example
 * extractIPClasses("IP65/IP44") // ["IP65", "IP44"]
 * extractIPClasses("IP20") // ["IP20"]
 * extractIPClasses("Some IP54 rating") // ["IP54"]
 */
export function extractIPClasses(ipString: string): string[] {
  const ipRegex = /IP\d{2}/gi;
  const matches = ipString.match(ipRegex) || [];
  return matches.map(ip => ip.toUpperCase());
}

/**
 * Prüft ob eine IP-Schutzklasse ausreichend ist
 * 
 * @param productIP - IP-Schutzklasse des Produkts (kann kombiniert sein wie "IP65/IP44")
 * @param minRequiredIP - Mindestens erforderliche IP-Schutzklasse (z.B. "IP44")
 * @returns true wenn die Produkt-IP-Klasse ausreichend ist
 * 
 * @example
 * isIPClassSufficient("IP65", "IP44") // true
 * isIPClassSufficient("IP20", "IP44") // false
 * isIPClassSufficient("IP65/IP44", "IP44") // true
 */
export function isIPClassSufficient(productIP: string, minRequiredIP: string): boolean {
  const productIPClasses = extractIPClasses(productIP);
  const minRequired = IP_HIERARCHY[minRequiredIP.toUpperCase()];
  
  if (!minRequired) {
    console.warn(`Unknown IP class: ${minRequiredIP}`);
    return false;
  }

  // Prüfe ob eine der Produkt-IP-Klassen ausreichend ist
  for (const ipClass of productIPClasses) {
    const productIPLevel = IP_HIERARCHY[ipClass];
    if (productIPLevel && productIPLevel.level >= minRequired.level) {
      return true;
    }
  }

  return false;
}

/**
 * Gibt alle IP-Klassen zurück, die >= der angeforderten Klasse sind
 * 
 * @param minIPClass - Mindestens erforderliche IP-Schutzklasse (z.B. "IP44")
 * @returns Array von IP-Klassen die ausreichend sind
 * 
 * @example
 * getSufficientIPClasses("IP44") // ["IP44", "IP54", "IP65", "IP67", "IP68", "IP20/IP54", "IP65/IP44"]
 * getSufficientIPClasses("IP65") // ["IP65", "IP67", "IP68", "IP65/IP44"]
 */
export function getSufficientIPClasses(minIPClass: string): string[] {
  const minLevel = IP_HIERARCHY[minIPClass.toUpperCase()]?.level || 3;
  
  return ALL_IP_CLASSES.filter(ipClass => {
    // Für kombinierte IP-Klassen (z.B. "IP65/IP44"), prüfe die höchste
    const extractedClasses = extractIPClasses(ipClass);
    return extractedClasses.some(extractedClass => {
      const classLevel = IP_HIERARCHY[extractedClass]?.level || 0;
      return classLevel >= minLevel;
    });
  });
}

/**
 * Konvertiert IP-Schutzklasse zu lesbarem Text
 * 
 * @param ipClass - IP-Schutzklasse (z.B. "IP44")
 * @returns Beschreibung der IP-Schutzklasse
 * 
 * @example
 * getIPClassDescription("IP20") // "Innenbereich, Schutz vor großen Fremdkörpern"
 * getIPClassDescription("IP65") // "Außenbereich, vollständiger Staubschutz und Strahlwasserschutz"
 */
export function getIPClassDescription(ipClass: string): string {
  const descriptions: Record<string, string> = {
    'IP20': 'Innenbereich, Schutz vor großen Fremdkörpern',
    'IP23': 'Innenbereich, Schutz vor Tropfwasser',
    'IP44': 'Feuchträume, Schutz vor Spritzwasser',
    'IP54': 'Außenbereich, Schutz vor Staub und Spritzwasser',
    'IP65': 'Außenbereich, vollständiger Staubschutz und Strahlwasserschutz',
    'IP67': 'Außenbereich, wasserdicht bei zeitweiligem Untertauchen',
    'IP68': 'Außenbereich, wasserdicht bei dauerndem Untertauchen'
  };

  return descriptions[ipClass.toUpperCase()] || `Unbekannte IP-Schutzklasse: ${ipClass}`;
}

/**
 * Empfiehlt passende IP-Schutzklassen für verschiedene Anwendungsgebiete
 * 
 * @param application - Anwendungsgebiet
 * @returns Empfohlene IP-Schutzklassen
 * 
 * @example
 * getRecommendedIPClasses("bathroom") // ["IP44", "IP54", "IP65"]
 * getRecommendedIPClasses("outdoor") // ["IP65", "IP67", "IP68"]
 */
export function getRecommendedIPClasses(application: string): string[] {
  const recommendations: Record<string, string[]> = {
    'indoor': ['IP20', 'IP23'],
    'bathroom': ['IP44', 'IP54', 'IP65'],
    'kitchen': ['IP44', 'IP54'],
    'outdoor': ['IP65', 'IP67', 'IP68'],
    'garden': ['IP65', 'IP67', 'IP68'],
    'pool': ['IP67', 'IP68'],
    'underground': ['IP68']
  };

  return recommendations[application.toLowerCase()] || ['IP44'];
}