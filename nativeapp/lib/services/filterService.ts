// Filter-Interfaces (passend zur Backend-API)
export interface ProductFilters {
  searchQuery?: string;
  category1?: string;
  category2?: string;
  groupName?: string;
  ingressProtection?: string;
  material?: string;
  housingColor?: string;
  energyClass?: string;
  ledType?: string;
  installation?: string;
  minPrice?: number;
  maxPrice?: number;
  minWattage?: number;
  maxWattage?: number;
  minLumen?: number;
  maxLumen?: number;
  minCct?: number;
  maxCct?: number;
  minCri?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface FilterOptions {
  categories: {
    category1: string[];
    category2: string[];
    groups: string[];
  };
  technical: {
    ipClasses: string[];
    materials: string[];
    colors: string[];
    energyClasses: string[];
    ledTypes: string[];
    installationTypes: string[];
  };
  ranges: {
    priceRange: { min: number; max: number };
    wattageRange: { min: number; max: number };
    lumenRange: { min: number; max: number };
    cctRange: { min: number; max: number };
  };
}

export interface FilteredProductsResponse {
  products: any[];
  total: number;
  count: number;
  filters: ProductFilters;
}

class FilterService {
  private baseURL: string;

  constructor() {
    // Use environment variable or fallback to localhost for development
    this.baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
  }

  /**
   * Führt eine gefilterte Produktsuche durch
   */
  async searchProductsWithFilters(filters: ProductFilters): Promise<FilteredProductsResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/products/search/filtered`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Filter search failed');
      }

      return result.data;
    } catch (error) {
      console.error('Fehler bei der gefilterten Produktsuche:', error);
      throw error;
    }
  }

  /**
   * Lädt alle verfügbaren Filter-Optionen
   */
  async getFilterOptions(): Promise<FilterOptions> {
    try {
      const response = await fetch(`${this.baseURL}/api/products/meta/all`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Fehler beim Laden der Filter-Optionen:', error);
      throw error;
    }
  }

  /**
   * Lädt spezifische Kategorien
   */
  async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/products/meta/categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.categories;
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien:', error);
      throw error;
    }
  }

  /**
   * Lädt Kategorien 2
   */
  async getCategories2(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/products/meta/categories2`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.categories;
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien 2:', error);
      throw error;
    }
  }

  /**
   * Lädt Gruppennamen
   */
  async getGroups(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/products/meta/groups`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.groups;
    } catch (error) {
      console.error('Fehler beim Laden der Gruppen:', error);
      throw error;
    }
  }

  /**
   * Lädt IP-Schutzklassen
   */
  async getIPProtectionClasses(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/products/meta/ip-protection`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.ipClasses;
    } catch (error) {
      console.error('Fehler beim Laden der IP-Schutzklassen:', error);
      throw error;
    }
  }

  /**
   * Lädt Materialien
   */
  async getMaterials(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/products/meta/materials`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.materials;
    } catch (error) {
      console.error('Fehler beim Laden der Materialien:', error);
      throw error;
    }
  }

  /**
   * Lädt Gehäusefarben
   */
  async getColors(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/products/meta/colors`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.colors;
    } catch (error) {
      console.error('Fehler beim Laden der Farben:', error);
      throw error;
    }
  }

  /**
   * Lädt Energieklassen
   */
  async getEnergyClasses(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/products/meta/energy-classes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.energyClasses;
    } catch (error) {
      console.error('Fehler beim Laden der Energieklassen:', error);
      throw error;
    }
  }

  /**
   * Lädt LED-Typen
   */
  async getLedTypes(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/products/meta/led-types`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.ledTypes;
    } catch (error) {
      console.error('Fehler beim Laden der LED-Typen:', error);
      throw error;
    }
  }

  /**
   * Lädt Installationsarten
   */
  async getInstallationTypes(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/products/meta/installation-types`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.installationTypes;
    } catch (error) {
      console.error('Fehler beim Laden der Installationsarten:', error);
      throw error;
    }
  }

  /**
   * Lädt Produkt-Bereiche (Preise, Wattage, etc.)
   */
  async getProductRanges(): Promise<{
    priceRange: { min: number; max: number };
    wattageRange: { min: number; max: number };
    lumenRange: { min: number; max: number };
    cctRange: { min: number; max: number };
  }> {
    try {
      const response = await fetch(`${this.baseURL}/api/products/meta/ranges`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.ranges;
    } catch (error) {
      console.error('Fehler beim Laden der Produktbereiche:', error);
      throw error;
    }
  }
}

export const filterService = new FilterService();
