import { supabase, Product } from '../config/database';
import { 
  searchByIPProtection, 
  simpleTextSearch, 
  advancedProductSearch,
  searchSimilarProducts,
  searchByLuminaireType,
  extractIPFromMessage,
  extractLuminaireType,
  isLuminaireRequest,
  type SearchCriteria
} from '../utils/productSearchUtils';

export class ProductService {
  /**
   * Alle Produkte abrufen (mit Paginierung)
   */
  async getAllProducts(limit: number = 1000, offset: number = 0): Promise<Product[]> {
    try {
      console.log(`🔍 Getting ${limit} products (offset: ${offset})`);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('availability', true)
        .order('vysn_name')
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      if (!data) {
        console.log('⚠️ No products found');
        return [];
      }

      console.log(`✅ Found ${data.length} products`);
      return data as Product[];
    } catch (error) {
      console.error('❌ Error in getAllProducts:', error);
      throw error;
    }
  }

  /**
   * Führt eine SQL-Query aus und gibt Produkte zurück
   */
  async searchProducts(query: string, parameters: Record<string, any>, originalUserMessage?: string): Promise<Product[]> {
    try {
      console.log('Original query:', query);
      console.log('Parameters:', parameters);
      console.log('User message:', originalUserMessage);

      // Prüfe ob nach spezifischem Leuchtentyp UND IP-Schutz gesucht wird
      const luminaireType = extractLuminaireType(originalUserMessage || '');
      const ipClass = extractIPFromMessage(originalUserMessage || '');
      
      if (luminaireType && query.includes('ingress_protection')) {
        console.log('Searching for luminaire type:', luminaireType, 'with IP class:', ipClass);
        const result = await searchByLuminaireType(luminaireType, ipClass || undefined);
        return result.products;
      }

      // Für allgemeine IP-Schutzklassen-Suche
      if (query.includes('ingress_protection')) {
        const isLuminaireSearch = isLuminaireRequest(originalUserMessage || '');
        
        console.log('Is luminaire search:', isLuminaireSearch);
        console.log('Searching for IP class:', ipClass);
        
        if (ipClass) {
          const result = await searchByIPProtection(ipClass, isLuminaireSearch);
          return result.products;
        }
        // Fallback zu leerer Liste wenn keine IP-Klasse gefunden
        return [];
      }
      
      // Für andere Queries, nutze einfache Textsuche als Fallback
      const searchTerms = Object.values(parameters).join(' ');
      const result = await simpleTextSearch(searchTerms, 20);
      return result.products;
      
    } catch (error) {
      console.error('Fehler bei der Produktsuche:', error);
      throw error;
    }
  }


  /**
   * Holt alle verfügbaren Kategorien (Category 1)
   */
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category_1')
        .not('category_1', 'is', null);

      if (error) {
        throw new Error(`Fehler beim Laden der Kategorien: ${error.message}`);
      }

      const categories = [...new Set(data.map(item => item.category_1))];
      return categories;
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien:', error);
      throw error;
    }
  }

  /**
   * Holt alle verfügbaren Kategorien 2
   */
  async getCategories2(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category_2')
        .not('category_2', 'is', null);

      if (error) {
        throw new Error(`Fehler beim Laden der Kategorien 2: ${error.message}`);
      }

      const categories = [...new Set(data.map(item => item.category_2))];
      return categories;
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien 2:', error);
      throw error;
    }
  }

  /**
   * Holt alle verfügbaren Gruppennamen
   */
  async getGroupNames(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('group_name')
        .not('group_name', 'is', null);

      if (error) {
        throw new Error(`Fehler beim Laden der Gruppennamen: ${error.message}`);
      }

      const groups = [...new Set(data.map(item => item.group_name))];
      return groups;
    } catch (error) {
      console.error('Fehler beim Laden der Gruppennamen:', error);
      throw error;
    }
  }

  /**
   * Holt alle verfügbaren Gehäusefarben
   */
  async getHousingColors(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('housing_color')
        .not('housing_color', 'is', null);

      if (error) {
        throw new Error(`Fehler beim Laden der Gehäusefarben: ${error.message}`);
      }

      const colors = [...new Set(data.map(item => item.housing_color))];
      return colors;
    } catch (error) {
      console.error('Fehler beim Laden der Gehäusefarben:', error);
      throw error;
    }
  }

  /**
   * Holt alle verfügbaren Energieklassen
   */
  async getEnergyClasses(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('energy_class')
        .not('energy_class', 'is', null);

      if (error) {
        throw new Error(`Fehler beim Laden der Energieklassen: ${error.message}`);
      }

      const classes = [...new Set(data.map(item => item.energy_class))];
      return classes;
    } catch (error) {
      console.error('Fehler beim Laden der Energieklassen:', error);
      throw error;
    }
  }

  /**
   * Holt ein Produkt nach ID
   */
  async getProductById(id: number): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Produkt nicht gefunden
        }
        throw new Error(`Fehler beim Laden des Produkts: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Fehler beim Laden des Produkts:', error);
      throw error;
    }
  }

  /**
   * Holt ein Produkt nach Artikelnummer
   */
  async getProductByItemNumber(itemNumber: string): Promise<Product | null> {
    try {
      console.log(`🔍 Searching for product with item_number_vysn: ${itemNumber}`);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('item_number_vysn', itemNumber)
        .single();

      console.log(`📊 Product search result:`, { data: data ? 'Found' : 'Not found', error });

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`❌ Product with item number ${itemNumber} not found in database`);
          return null; // Produkt nicht gefunden
        }
        console.error(`❌ Database error searching for ${itemNumber}:`, error);
        throw new Error(`Fehler beim Laden des Produkts: ${error.message}`);
      }

      console.log(`✅ Found product: ${data.vysn_name} (${data.item_number_vysn})`);
      return data;
    } catch (error) {
      console.error('Fehler beim Laden des Produkts:', error);
      throw error;
    }
  }

  /**
   * Holt ein Produkt nach Barcode-Nummer
   */
  async getProductByBarcode(barcodeNumber: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('barcode_number', barcodeNumber)
        .eq('availability', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Produkt nicht gefunden
        }
        throw new Error(`Fehler beim Laden des Produkts: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Fehler beim Laden des Produkts:', error);
      throw error;
    }
  }

  /**
   * Einfache Produktsuche nach Name oder Beschreibung
   */
  async simpleSearch(searchTerm: string, limit: number = 100): Promise<Product[]> {
    const result = await simpleTextSearch(searchTerm, limit);
    return result.products;
  }

  /**
   * Suche nach Beleuchtungsprodukten mit spezifischen Filtern
   */
  async searchByLightingCriteria(criteria: SearchCriteria, limit: number = 50): Promise<Product[]> {
    const searchCriteria: SearchCriteria = { ...criteria, limit };
    const result = await advancedProductSearch(searchCriteria);
    return result.products;
  }

  /**
   * Suche ähnliche Produkte basierend auf einem Referenzprodukt
   */
  async findSimilarProducts(referenceProduct: Product, limit: number = 10): Promise<Product[]> {
    const result = await searchSimilarProducts(referenceProduct, limit);
    return result.products;
  }

  /**
   * Erweiterte Produktsuche mit Filtern
   */
  async searchWithFilters(filters: ProductFilters): Promise<{ products: Product[]; total: number }> {
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('availability', true);

      // Text-Suche
      if (filters.searchQuery && filters.searchQuery.trim() !== '') {
        query = query.or(`vysn_name.ilike.%${filters.searchQuery}%,short_description.ilike.%${filters.searchQuery}%,long_description.ilike.%${filters.searchQuery}%,item_number_vysn.ilike.%${filters.searchQuery}%`);
      }

      // Kategorie-Filter
      if (filters.category1) {
        query = query.eq('category_1', filters.category1);
      }
      if (filters.category2) {
        query = query.eq('category_2', filters.category2);
      }
      if (filters.groupName) {
        query = query.eq('group_name', filters.groupName);
      }

      // IP-Schutz Filter
      if (filters.ingressProtection) {
        query = query.eq('ingress_protection', filters.ingressProtection);
      }

      // Material Filter
      if (filters.material) {
        query = query.eq('material', filters.material);
      }

      // Gehäusefarbe Filter
      if (filters.housingColor) {
        query = query.eq('housing_color', filters.housingColor);
      }

      // Energieklasse Filter
      if (filters.energyClass) {
        query = query.eq('energy_class', filters.energyClass);
      }

      // LED-Typ Filter
      if (filters.ledType) {
        query = query.eq('led_type', filters.ledType);
      }

      // Preis-Bereich
      if (filters.minPrice !== undefined) {
        query = query.gte('gross_price', filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        query = query.lte('gross_price', filters.maxPrice);
      }

      // Leistungs-Bereich
      if (filters.minWattage !== undefined) {
        query = query.gte('wattage', filters.minWattage);
      }
      if (filters.maxWattage !== undefined) {
        query = query.lte('wattage', filters.maxWattage);
      }

      // Lichtstrom-Bereich
      if (filters.minLumen !== undefined) {
        query = query.gte('lumen', filters.minLumen);
      }
      if (filters.maxLumen !== undefined) {
        query = query.lte('lumen', filters.maxLumen);
      }

      // Farbtemperatur-Bereich
      if (filters.minCct !== undefined) {
        query = query.gte('cct', filters.minCct);
      }
      if (filters.maxCct !== undefined) {
        query = query.lte('cct', filters.maxCct);
      }

      // CRI-Filter
      if (filters.minCri !== undefined) {
        query = query.gte('cri', filters.minCri);
      }

      // Sortierung
      if (filters.sortBy) {
        const sortDirection = filters.sortDirection || 'asc';
        query = query.order(filters.sortBy, { ascending: sortDirection === 'asc' });
      } else {
        // Standard-Sortierung nach Name
        query = query.order('vysn_name', { ascending: true });
      }

      // Paginierung
      const limit = filters.limit || 20;
      const offset = filters.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Fehler bei der gefilterten Produktsuche: ${error.message}`);
      }

      return {
        products: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Fehler bei der gefilterten Produktsuche:', error);
      throw error;
    }
  }

  /**
   * Gibt alle verfügbaren IP-Schutzklassen zurück
   */
  async getIngressProtectionClasses(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('ingress_protection')
        .not('ingress_protection', 'is', null)
        .eq('availability', true);

      if (error) {
        throw new Error(`Fehler beim Laden der IP-Schutzklassen: ${error.message}`);
      }

      const uniqueClasses = [...new Set(data.map(item => item.ingress_protection).filter(Boolean))];
      return uniqueClasses.sort();
    } catch (error) {
      console.error('Fehler beim Laden der IP-Schutzklassen:', error);
      throw error;
    }
  }

  /**
   * Gibt alle verfügbaren Materialien zurück
   */
  async getMaterials(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('material')
        .not('material', 'is', null)
        .eq('availability', true);

      if (error) {
        throw new Error(`Fehler beim Laden der Materialien: ${error.message}`);
      }

      const uniqueMaterials = [...new Set(data.map(item => item.material).filter(Boolean))];
      return uniqueMaterials.sort();
    } catch (error) {
      console.error('Fehler beim Laden der Materialien:', error);
      throw error;
    }
  }

  /**
   * Gibt alle verfügbaren LED-Typen zurück
   */
  async getLedTypes(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('led_type')
        .not('led_type', 'is', null)
        .eq('availability', true);

      if (error) {
        throw new Error(`Fehler beim Laden der LED-Typen: ${error.message}`);
      }

      const uniqueTypes = [...new Set(data.map(item => item.led_type).filter(Boolean))];
      return uniqueTypes.sort();
    } catch (error) {
      console.error('Fehler beim Laden der LED-Typen:', error);
      throw error;
    }
  }

  /**
   * Gibt alle verfügbaren Installationsarten zurück
   */
  async getInstallationTypes(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('installation')
        .not('installation', 'is', null)
        .eq('availability', true);

      if (error) {
        throw new Error(`Fehler beim Laden der Installationsarten: ${error.message}`);
      }

      const uniqueTypes = [...new Set(data.map(item => item.installation).filter(Boolean))];
      return uniqueTypes.sort();
    } catch (error) {
      console.error('Fehler beim Laden der Installationsarten:', error);
      throw error;
    }
  }

  /**
   * Gibt Preis-, Leistungs- und Lichtstrom-Bereiche zurück
   */
  async getProductRanges(): Promise<{
    priceRange: { min: number; max: number };
    wattageRange: { min: number; max: number };
    lumenRange: { min: number; max: number };
    cctRange: { min: number; max: number };
  }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('gross_price, wattage, lumen, cct')
        .eq('availability', true)
        .not('gross_price', 'is', null)
        .not('wattage', 'is', null)
        .not('lumen', 'is', null)
        .not('cct', 'is', null);

      if (error) {
        throw new Error(`Fehler beim Laden der Produktbereiche: ${error.message}`);
      }

      const prices = data.map(item => item.gross_price).filter(Boolean);
      const wattages = data.map(item => item.wattage).filter(Boolean);
      const lumens = data.map(item => item.lumen).filter(Boolean);
      const ccts = data.map(item => item.cct).filter(Boolean);

      return {
        priceRange: { min: Math.min(...prices), max: Math.max(...prices) },
        wattageRange: { min: Math.min(...wattages), max: Math.max(...wattages) },
        lumenRange: { min: Math.min(...lumens), max: Math.max(...lumens) },
        cctRange: { min: Math.min(...ccts), max: Math.max(...ccts) }
      };
    } catch (error) {
      console.error('Fehler beim Laden der Produktbereiche:', error);
      throw error;
    }
  }
}

// Interface für Filter-Parameter
export interface ProductFilters {
  // Text-Suche
  searchQuery?: string;
  
  // Kategorien
  category1?: string;
  category2?: string;
  groupName?: string;
  
  // Technische Eigenschaften
  ingressProtection?: string;
  material?: string;
  housingColor?: string;
  energyClass?: string;
  ledType?: string;
  installation?: string;
  
  // Preis-Bereich
  minPrice?: number;
  maxPrice?: number;
  
  // Leistungs-Bereich
  minWattage?: number;
  maxWattage?: number;
  
  // Lichtstrom-Bereich
  minLumen?: number;
  maxLumen?: number;
  
  // Farbtemperatur-Bereich
  minCct?: number;
  maxCct?: number;
  
  // CRI
  minCri?: number;
  
  // Sortierung
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  
  // Paginierung
  limit?: number;
  offset?: number;
} 