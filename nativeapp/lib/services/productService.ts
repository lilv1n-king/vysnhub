import { apiService } from './apiService';
import { VysnProduct } from '../types/product';

export interface ProductSearchResponse {
  products: VysnProduct[];
  count: number;
  searchTerm?: string;
}

export class ProductService {
  
  /**
   * Produkt nach Barcode suchen
   */
  async getProductByBarcode(barcodeNumber: string | number): Promise<VysnProduct | null> {
    try {
      const response = await apiService.get<{ product: VysnProduct }>(`/api/products/barcode/${barcodeNumber}`);
      
      if (response.success && response.data?.product) {
        return response.data.product;
      }
      
      return null;
    } catch (error) {
      // Silent error
      return null;
    }
  }

  /**
   * Produkt nach Artikelnummer suchen
   */
  async getProductByItemNumber(itemNumber: string): Promise<VysnProduct | null> {
    try {
      const response = await apiService.get<{ product: VysnProduct }>(`/api/products/item/${itemNumber}`);
      
      if (response.success && response.data?.product) {
        return response.data.product;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting product by item number:', error);
      return null;
    }
  }

  /**
   * Produkte suchen
   */
  async searchProducts(query: string, limit: number = 20): Promise<VysnProduct[]> {
    try {
      const response = await apiService.get<ProductSearchResponse>('/api/products/search', {
        q: query,
        limit
      });
      
      if (response.success && response.data?.products) {
        return response.data.products;
      }
      
      return [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  /**
   * Alle Produkte abrufen (mit Paginierung)
   */
  async getAllProducts(limit: number = 50, offset: number = 0): Promise<VysnProduct[]> {
    try {
      const response = await apiService.get<ProductSearchResponse>('/products', {
        limit,
        offset
      });
      
      if (response.success && response.data?.products) {
        return response.data.products;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting all products:', error);
      return [];
    }
  }

  /**
   * Produkt nach ID abrufen
   */
  async getProductById(id: number): Promise<VysnProduct | null> {
    try {
      const response = await apiService.get<{ product: VysnProduct }>(`/products/${id}`);
      
      if (response.success && response.data?.product) {
        return response.data.product;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting product by ID:', error);
      return null;
    }
  }

  /**
   * Ähnliche Produkte finden
   */
  async getSimilarProducts(productId: number, limit: number = 10): Promise<VysnProduct[]> {
    try {
      const response = await apiService.get<{ similarProducts: VysnProduct[] }>(`/products/${productId}/similar`, {
        limit
      });
      
      if (response.success && response.data?.similarProducts) {
        return response.data.similarProducts;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting similar products:', error);
      return [];
    }
  }

  /**
   * Kategorien abrufen
   */
  async getCategories(): Promise<string[]> {
    try {
      const response = await apiService.get<{ categories: string[] }>('/products/meta/categories');
      
      if (response.success && response.data?.categories) {
        return response.data.categories;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  /**
   * Gruppennamen abrufen
   */
  async getGroupNames(): Promise<string[]> {
    try {
      const response = await apiService.get<{ groups: string[] }>('/products/meta/groups');
      
      if (response.success && response.data?.groups) {
        return response.data.groups;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting group names:', error);
      return [];
    }
  }
}

// Singleton instance
export const productService = new ProductService();

import * as productData from '../utils/product-data';

// Convenience functions with API fallback to Supabase
export async function getProductByBarcode(barcodeNumber: string | number): Promise<VysnProduct | null> {
  try {
    // Try API first
    const result = await productService.getProductByBarcode(barcodeNumber);
    if (result) {
      console.log(`✅ Produkt über API gefunden für Barcode: ${barcodeNumber}`);
      return result;
    }
  } catch (error) {
    console.log(`⚠️ API nicht verfügbar, verwende Supabase-Fallback für Barcode: ${barcodeNumber}`);
  }
  
  // Fallback to direct Supabase
  try {
    const fallbackResult = await productData.getProductByBarcode(barcodeNumber);
    if (fallbackResult) {
      console.log(`✅ Produkt über Supabase gefunden für Barcode: ${barcodeNumber} - ${fallbackResult.vysnName}`);
    } else {
      console.log(`❌ Kein Produkt gefunden für Barcode: ${barcodeNumber}`);
    }
    return fallbackResult;
  } catch (error) {
    console.error(`❌ Supabase-Fehler für Barcode ${barcodeNumber}:`, error);
    return null;
  }
}

export async function getProductByItemNumber(itemNumber: string): Promise<VysnProduct | null> {
  try {
    // Try API first
    const result = await productService.getProductByItemNumber(itemNumber);
    if (result) return result;
  } catch (error) {
    console.log('API unavailable, falling back to Supabase');
  }
  
  // Fallback to direct Supabase
  return productData.getProductByItemNumber(itemNumber);
}

export async function searchProducts(query: string, limit?: number): Promise<VysnProduct[]> {
  try {
    // Try API first
    const result = await productService.searchProducts(query, limit);
    if (result.length > 0) {
      console.log(`✅ ${result.length} Produkte über API gefunden für: ${query}`);
      return result;
    }
  } catch (error) {
    console.log(`⚠️ API nicht verfügbar, verwende Supabase-Fallback für Suche: ${query}`);
  }
  
  // Fallback to direct Supabase
  try {
    const fallbackResult = await productData.searchProducts(query);
    if (fallbackResult.length > 0) {
      console.log(`✅ ${fallbackResult.length} Produkte über Supabase gefunden für: ${query}`);
    } else {
      console.log(`❌ Keine Produkte gefunden für: ${query}`);
    }
    return fallbackResult;
  } catch (error) {
    console.error(`❌ Supabase-Suchfehler für "${query}":`, error);
    return [];
  }
}