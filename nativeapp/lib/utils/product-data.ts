import { VysnProduct, VysnProductDB, convertDbToClientProduct } from '../types/product';
import { apiService } from '../services/apiService';

/**
 * Get all products via backend API (alias for getAllProducts for Expo compatibility)
 */
export async function getProducts(): Promise<VysnProduct[]> {
  return getAllProducts();
}

/**
 * Get all products via backend API
 */
export async function getAllProducts(): Promise<VysnProduct[]> {
  try {
    console.log('📦 Fetching products via backend API...');
    const response = await apiService.get<{ products: VysnProductDB[] }>('/api/products');

    if (!response.success || !response.data?.products) {
      console.error('❌ Error fetching products:', response.error);
      return [];
    }

    // Convert all products from database format to client format
    const convertedProducts = response.data.products.map(convertDbToClientProduct);
    console.log(`✅ Loaded ${convertedProducts.length} products from API`);
    return convertedProducts;
  } catch (error) {
    console.error('❌ Error in getAllProducts:', error);
    return [];
  }
}

/**
 * Get product by item number via backend API
 */
export async function getProductByItemNumber(itemNumber: string): Promise<VysnProduct | null> {
  try {
    console.log(`🔍 Fetching product by item number: ${itemNumber}`);
    const response = await apiService.get<{ product: VysnProductDB }>(`/api/products/item/${itemNumber}`);

    if (!response.success || !response.data?.product) {
      console.log(`❌ Product not found for item number: ${itemNumber}`);
      return null;
    }

    // Convert database format to client format
    const convertedProduct = convertDbToClientProduct(response.data.product);
    console.log(`✅ Found product: ${convertedProduct.vysnName} (${convertedProduct.itemNumberVysn})`);
    console.log(`💰 Price: ${convertedProduct.grossPrice || 'No price'}`);
    
    return convertedProduct;
  } catch (error) {
    console.error('❌ Error in getProductByItemNumber:', error);
    return null;
  }
}

/**
 * Get products by category - DEPRECATED: Use backend API instead
 */
export async function getProductsByCategory(category1?: string, category2?: string): Promise<VysnProduct[]> {
  console.warn('⚠️ getProductsByCategory deprecated - use searchProducts or getAllProducts');
  return getAllProducts();
}

/**
 * Get products by group name - DEPRECATED: Use backend API instead
 */
export async function getProductsByGroup(groupName: string): Promise<VysnProduct[]> {
  console.warn('⚠️ getProductsByGroup deprecated - use searchProducts instead');
  return searchProducts(groupName);
}

/**
 * Search products by name, description, barcode, or item number via backend API
 */
export async function searchProducts(query: string): Promise<VysnProduct[]> {
  try {
    const searchTerm = query.toLowerCase().trim();
    console.log(`🔍 Searching products for: ${searchTerm}`);
    
    const response = await apiService.get<{ products: VysnProductDB[] }>('/api/products/search', {
      q: searchTerm,
      limit: 100
    });

    if (!response.success || !response.data?.products) {
      console.log(`❌ No products found for: ${searchTerm}`);
      return [];
    }

    // Convert database format to client format
    const convertedProducts = response.data.products.map(convertDbToClientProduct);
    console.log(`✅ Found ${convertedProducts.length} products for: ${searchTerm}`);
    return convertedProducts;
  } catch (error) {
    console.error('❌ Error in searchProducts:', error);
    return [];
  }
}

/**
 * Get unique categories via backend API
 */
export async function getCategories(): Promise<{ category1: string[]; category2: string[] }> {
  try {
    console.log('📋 Fetching categories via backend API...');
    const response = await apiService.get<{ categories: string[] }>('/api/products/categories');

    if (!response.success || !response.data?.categories) {
      console.error('❌ Error fetching categories');
      return { category1: [], category2: [] };
    }

    // For now, return all categories as category1
    // Backend should provide separate category1/category2 if needed
    console.log(`✅ Loaded ${response.data.categories.length} categories`);
    return {
      category1: response.data.categories,
      category2: []
    };
  } catch (error) {
    console.error('❌ Error in getCategories:', error);
    return { category1: [], category2: [] };
  }
}

/**
 * Get unique group names from Supabase
 */
export async function getGroupNames(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('group_name')
      .eq('availability', true)
      .not('group_name', 'is', null);

    if (error) {
      console.error('Error fetching group names:', error);
      return [];
    }

    const groupSet = new Set<string>();
    data.forEach((product: any) => {
      if (product.group_name) groupSet.add(product.group_name);
    });
    
    return Array.from(groupSet).sort();
  } catch (error) {
    console.error('Error in getGroupNames:', error);
    return [];
  }
}

/**
 * Search product by exact barcode number via backend API
 */
export async function getProductByBarcode(barcodeNumber: string | number): Promise<VysnProduct | null> {
  try {
    const barcode = barcodeNumber.toString();
    console.log(`🔍 Fetching product by barcode: ${barcode}`);
    
    const response = await apiService.get<{ product: VysnProduct }>(`/api/products/barcode/${barcode}`);

    if (!response.success || !response.data?.product) {
      console.log(`❌ Product not found for barcode: ${barcode}`);
      return null;
    }

    console.log(`✅ Found product: ${response.data.product.vysnName}`);
    return response.data.product;
  } catch (error) {
    console.error('❌ Error in getProductByBarcode:', error);
    return null;
  }
}

/**
 * Get product images (non-empty image URLs)
 */
export function getProductImages(product: VysnProduct): string[] {
  const imageFields = [
    'product_picture_1',
    'product_picture_2', 
    'product_picture_3',
    'product_picture_4',
    'product_picture_5',
    'product_picture_6',
    'product_picture_7',
    'product_picture_8'
  ] as const;
  
  return imageFields
    .map(field => product[field])
    .filter((url): url is string => url !== undefined && url !== '');
}

/**
 * Get paginated products from Supabase
 */
export async function getProductsPaginated(
  page: number = 0, 
  limit: number = 20,
  searchQuery?: string,
  category?: string
): Promise<{ products: VysnProduct[]; hasMore: boolean; total: number }> {
  try {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('availability', true);

    // Add search filter if provided
    if (searchQuery && searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase().trim();
      query = query.or(`vysn_name.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%,long_description.ilike.%${searchTerm}%,item_number_vysn.ilike.%${searchTerm}%`);
    }

    // Add category filter if provided
    if (category && category.trim()) {
      query = query.or(`category_1.eq.${category},category_2.eq.${category}`);
    }

    const { data, error, count } = await query
      .order('vysn_name')
      .range(page * limit, (page + 1) * limit - 1);

    if (error) {
      console.error('Error fetching paginated products:', error);
      return { products: [], hasMore: false, total: 0 };
    }

    const products = (data as VysnProductDB[]).map(convertDbToClientProduct);
    const total = count || 0;
    const hasMore = (page + 1) * limit < total;

    return { products, hasMore, total };
  } catch (error) {
    console.error('Error in getProductsPaginated:', error);
    return { products: [], hasMore: false, total: 0 };
  }
}