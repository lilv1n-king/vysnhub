import { supabase } from '../config/database';

/**
 * Prüft ob eine Nachricht eine LED Strip Anfrage ist
 */
export function isLEDStripRequest(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Sehr spezifische LED Strip Patterns
  const ledStripPatterns = [
    'led strip',
    'led-strip', 
    'ledstrip',
    'led streifen',
    'led-streifen',
    'ledstreifen',
    'led band',
    'led-band',
    'led stripe', // nur mit "led" davor
    'lichtband',
    'licht-band'
  ];
  
  // Ausschluss: Wenn es ein spezifischer Produktname ist, ist es keine LED Strip Anfrage
  if (isSpecificProductName(lowerMessage)) {
    return false;
  }
  
  return ledStripPatterns.some(pattern => lowerMessage.includes(pattern));
}

/**
 * Prüft ob die Nachricht nach einem spezifischen Produktnamen fragt
 */
function isSpecificProductName(message: string): boolean {
  // Pattern: "ist [produktname] gut/dimmbar/..."
  const productQuestionPatterns = [
    /ist\s+([a-z0-9\s]+)\s+(gut|dimmbar|hell|geeignet)/,
    /wie\s+(ist|sind)\s+([a-z0-9\s]+)/,
    /was\s+(ist|sind)\s+([a-z0-9\s]+)/
  ];
  
  return productQuestionPatterns.some(pattern => pattern.test(message));
}

/**
 * Extrahiert Parameter für LED Strip Suche
 */
export function extractLEDStripParams(message: string) {
  const lowerMessage = message.toLowerCase();
  
  // CCT extrahieren
  let cct: number | undefined;
  const cctMatch = message.match(/(\d{4})k/i);
  if (cctMatch) {
    cct = parseInt(cctMatch[1]);
  }
  
  // Dim to Warm
  const dimToWarm = lowerMessage.includes('dim to warm') || 
                   lowerMessage.includes('dimtowarm') ||
                   lowerMessage.includes('dim2warm');
  
  // Dimmbar
  const dimmable = lowerMessage.includes('dimmbar') || 
                  lowerMessage.includes('dimmer') ||
                  lowerMessage.includes('dimmable');
  
  // Suchbegriff für weitere Filterung
  let searchTerm = message;
  
  return {
    searchTerm,
    cct,
    dimToWarm,
    dimmable
  };
}

/**
 * Sucht nach LED Strips in der Datenbank
 */
export async function searchLEDStrips(
  searchTerm?: string,
  dimToWarm?: boolean,
  dimmable?: boolean,
  cct?: number,
  limit: number = 20
): Promise<{ products: any[]; total: number }> {
  try {
    let query = supabase
      .from('products')
      .select('*');
    
    // LED Strip Filter - nur echte LED Strips, keine Zubehörteile
    query = query.or(`category_2.ilike.%LED strips%,group_name.ilike.%LED Strip%`);
    
    // Ausschluss von Zubehör und Komponenten bei LED Strip Suche
    const excludeConnectors = !isConnectorRequest(searchTerm || '');
    if (excludeConnectors) {
      // Schließe Connectors, Verbinder und Zubehör aus
      query = query.not('vysn_name', 'ilike', '%connector%')
                   .not('vysn_name', 'ilike', '%verbinder%')
                   .not('vysn_name', 'ilike', '%feedin%')
                   .not('vysn_name', 'ilike', '%strip2strip%')
                   .not('vysn_name', 'ilike', '%flex connector%')
                   .not('category_2', 'eq', 'Electrical components')
                   .not('category_2', 'eq', 'Mechanical components');
    }
    
    // CCT Filter
    if (cct) {
      query = query.or(`cct.eq.${cct},cct_switch_value.ilike.%${cct}%`);
    }
    
    // Dim to Warm Filter
    if (dimToWarm) {
      query = query.or('dim_to_warm.eq.true,vysn_name.ilike.%dim to warm%,short_description.ilike.%dim to warm%');
    }
    
    // Dimmbar Filter
    if (dimmable) {
      query = query.or('dimmable.eq.true,vysn_name.ilike.%dimm%,short_description.ilike.%dimm%');
    }
    
    // Sortierung nach Preis
    query = query.order('gross_price', { ascending: true });
    
    // Limit
    query = query.limit(limit);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Datenbankfehler bei LED Strip Suche:', error);
      return { products: [], total: 0 };
    }
    
    console.log(`LED Strip Suche: ${data?.length || 0} Produkte gefunden`);
    
    return {
      products: data || [],
      total: data?.length || 0
    };
    
  } catch (error) {
    console.error('Fehler bei LED Strip Suche:', error);
    return { products: [], total: 0 };
  }
}

/**
 * Prüft ob explizit nach Connectors/Zubehör gesucht wird
 */
function isConnectorRequest(message: string): boolean {
  const connectorKeywords = [
    'connector', 'verbinder', 'verbindung',
    'zubehör', 'ersatzteile', 'feedin',
    'strip2strip', 'flex connector',
    'verbindungsstück', 'anschluss'
  ];
  
  const lowerMessage = message.toLowerCase();
  return connectorKeywords.some(keyword => lowerMessage.includes(keyword));
}