import { supabase, Product } from '../config/database';

/**
 * Produktfrage Utils - für spezifische Fragen zu konkreten Produkten
 */

/**
 * Erkennt ob es sich um eine Produktfrage handelt
 * (Frage nach spezifischem Produkt + Eigenschaft)
 */
export function isProductQuestion(message: string): { 
  isQuestion: boolean; 
  productName?: string; 
  questionType?: string;
} {
  const msg = message.toLowerCase();
  
  // Frage-Patterns - NUR für spezifische Produktfragen
  const questionPatterns = [
    // "ist [PRODUKTNAME] dimmbar?" - Präzise Frage nach Eigenschaft
    /^ist\s+([a-zA-Z0-9\s\-_]+?)\s+(dimmbar|wasserdicht|verfügbar|lieferbar)\??$/,
    
    // "hat [PRODUKTNAME] [ZAHL] lumen?" - Präzise Frage nach Wert  
    /^hat\s+([a-zA-Z0-9\s\-_]+?)\s+(wieviel|wie\s*viel)\s*(lumen|watt|kelvin)\??$/,
    /^wieviel\s+(lumen|watt|kelvin|euro)\s+hat\s+([a-zA-Z0-9\s\-_]+?)\??$/,
    
    // "wie [EIGENSCHAFT] ist [PRODUKTNAME]?" - Präzise Frage
    /^wie\s+(hell|warm|kalt|groß|teuer)\s+ist\s+([a-zA-Z0-9\s\-_]+?)\??$/,
    
    // "welche [EIGENSCHAFT] hat [PRODUKTNAME]?" - Präzise Frage
    /^welche\s+(farbe|größe|ip|schutzklasse)\s+hat\s+([a-zA-Z0-9\s\-_]+?)\??$/
  ];
  
  // Ausschluss-Patterns - das sind KEINE Produktfragen
  const exclusionPatterns = [
    /^ich\s+(suche|brauche|möchte)/,
    /^gibt\s+es/,
    /^haben\s+sie/,
    /^habt\s+ihr/,
    /^zeig/,
    /^empfehl/,
    /^welche.*gibt\s+es/
  ];
  
  // Prüfe Ausschluss-Patterns zuerst
  for (const exclusion of exclusionPatterns) {
    if (exclusion.test(msg)) {
      return { isQuestion: false };
    }
  }
  
  for (const pattern of questionPatterns) {
    const match = msg.match(pattern);
    if (match) {
      // Produktname ist normalerweise in der ersten Capture-Gruppe
      let productName = match[1] || match[2];
      
      // Weitere Validierung: Produktname sollte nicht zu generisch sein
      if (productName && productName.length > 2 && !productName.includes('eine') && !productName.includes('ein') && !productName.includes('strip')) {
        
        // Bestimme Frage-Typ
        let questionType = 'general';
        if (msg.includes('dimmbar')) questionType = 'dimmable';
        else if (msg.includes('lumen')) questionType = 'brightness';
        else if (msg.includes('watt')) questionType = 'power';
        else if (msg.includes('kelvin') || msg.includes('cct')) questionType = 'cct';
        else if (msg.includes('ip') || msg.includes('wasserdicht')) questionType = 'ip_protection';
        else if (msg.includes('preis') || msg.includes('euro') || msg.includes('kosten')) questionType = 'price';
        
        return {
          isQuestion: true,
          productName: productName.trim(),
          questionType
        };
      }
    }
  }
  
  return { isQuestion: false };
}

/**
 * Sucht nach einem spezifischen Produkt ohne zusätzliche Filter
 */
export async function findSpecificProduct(productName: string): Promise<{
  products: Product[];
  found: boolean;
  searchTerm: string;
}> {
  try {
    // Bereinige Produktname
    const cleanName = productName
      .replace(/['"]/g, '') // Entferne Anführungszeichen
      .replace(/\s+/g, ' ') // Normalisiere Leerzeichen
      .trim();
    
    console.log(`Suche spezifisches Produkt: "${cleanName}"`);
    
    // Suche in verschiedenen Feldern
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('availability', true)
      .or(`vysn_name.ilike.%${cleanName}%,short_description.ilike.%${cleanName}%,item_number_vysn.ilike.%${cleanName}%`)
      .limit(10);
    
    if (error) {
      throw new Error(`Produktsuche Fehler: ${error.message}`);
    }
    
    const products = data || [];
    
    return {
      products,
      found: products.length > 0,
      searchTerm: cleanName
    };
    
  } catch (error) {
    console.error('Fehler bei Produktsuche:', error);
    return {
      products: [],
      found: false,
      searchTerm: productName
    };
  }
}

/**
 * Beantwortet eine spezifische Produktfrage
 */
export function answerProductQuestion(
  product: Product, 
  questionType: string, 
  originalQuestion: string
): string {
  const productName = product.vysn_name || product.short_description || 'Produkt';
  
  switch (questionType) {
    case 'dimmable':
      const isDimmable = 
        product.operating_mode?.toLowerCase().includes('dimmbar') ||
        product.power_switch_value?.toLowerCase().includes('dimmbar') ||
        product.vysn_name?.toLowerCase().includes('dimmbar') ||
        product.short_description?.toLowerCase().includes('dimmbar');
      
      return isDimmable 
        ? `Ja, ${productName} ist dimmbar.${product.operating_mode ? ` Steuerung: ${product.operating_mode}` : ''}`
        : `Nein, ${productName} ist nicht dimmbar.`;
    
    case 'brightness':
      if (product.lumen) {
        return `${productName} hat ${product.lumen} Lumen.`;
      }
      return `Die Lumenangabe für ${productName} ist nicht verfügbar.`;
    
    case 'power':
      if (product.wattage) {
        return `${productName} hat ${product.wattage} Watt.`;
      }
      return `Die Wattage für ${productName} ist nicht verfügbar.`;
    
    case 'cct':
      let cctInfo = '';
      if (product.cct) {
        cctInfo = `${product.cct}K`;
      }
      if (product.cct_switch_value) {
        cctInfo = cctInfo ? `${cctInfo} oder CCT-Switch (${product.cct_switch_value})` : `CCT-Switch: ${product.cct_switch_value}`;
      }
      
      return cctInfo 
        ? `${productName} hat eine Farbtemperatur von ${cctInfo}.`
        : `Die Farbtemperatur für ${productName} ist nicht angegeben.`;
    
    case 'ip_protection':
      if (product.ingress_protection) {
        return `${productName} hat Schutzklasse ${product.ingress_protection}.`;
      }
      return `Die IP-Schutzklasse für ${productName} ist nicht angegeben.`;
    
    case 'price':
      if (product.gross_price) {
        return `${productName} kostet ${product.gross_price}€.`;
      }
      return `Der Preis für ${productName} ist auf Anfrage.`;
    
    default:
      // Allgemeine Produktinformation
      let info = `${productName}:\n`;
      if (product.short_description) info += `${product.short_description}\n`;
      if (product.gross_price) info += `Preis: ${product.gross_price}€\n`;
      if (product.lumen) info += `Helligkeit: ${product.lumen} Lumen\n`;
      if (product.wattage) info += `Leistung: ${product.wattage} Watt\n`;
      
      return info;
  }
}