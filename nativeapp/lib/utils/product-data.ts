import { VysnProduct, VysnProductDB, convertDbToClientProduct } from '../types/product';
import { supabase } from './supabase';

/**
 * Get all products from Supabase (alias for getAllProducts for Expo compatibility)
 */
export async function getProducts(): Promise<VysnProduct[]> {
  return getAllProducts();
}

/**
 * Get all products from Supabase
 */
export async function getAllProducts(): Promise<VysnProduct[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('availability', true)
      .order('vysn_name');

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return (data as VysnProductDB[]).map(convertDbToClientProduct);
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    return [];
  }
}

/**
 * Get product by item number from Supabase
 */
export async function getProductByItemNumber(itemNumber: string): Promise<VysnProduct | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('item_number_vysn', itemNumber)
      .eq('availability', true)
      .single();

    if (error) {
      console.error('Error fetching product by item number:', error);
      return null;
    }

    return convertDbToClientProduct(data as VysnProductDB);
  } catch (error) {
    console.error('Error in getProductByItemNumber:', error);
    return null;
  }
}

/**
 * Get products by category from Supabase
 */
export async function getProductsByCategory(category1?: string, category2?: string): Promise<VysnProduct[]> {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('availability', true);

    if (category1 && category2) {
      query = query.eq('category_1', category1).eq('category_2', category2);
    } else if (category1) {
      query = query.eq('category_1', category1);
    } else if (category2) {
      query = query.eq('category_2', category2);
    }

    const { data, error } = await query.order('vysn_name');

    if (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }

    return (data as VysnProductDB[]).map(convertDbToClientProduct);
  } catch (error) {
    console.error('Error in getProductsByCategory:', error);
    return [];
  }
}

/**
 * Get products by group name from Supabase
 */
export async function getProductsByGroup(groupName: string): Promise<VysnProduct[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('group_name', groupName)
      .eq('availability', true)
      .order('vysn_name');

    if (error) {
      console.error('Error fetching products by group:', error);
      return [];
    }

    return (data as VysnProductDB[]).map(convertDbToClientProduct);
  } catch (error) {
    console.error('Error in getProductsByGroup:', error);
    return [];
  }
}

/**
 * Search products by name, description, barcode, or item number using Supabase
 */
export async function searchProducts(query: string): Promise<VysnProduct[]> {
  try {
    const searchTerm = query.toLowerCase().trim();
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`vysn_name.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%,long_description.ilike.%${searchTerm}%,item_number_vysn.ilike.%${searchTerm}%,barcode_number.ilike.%${searchTerm}%`)
      .eq('availability', true)
      .order('vysn_name')
      .limit(50);

    if (error) {
      console.error('Error searching products:', error);
      return [];
    }

    return (data as VysnProductDB[]).map(convertDbToClientProduct);
  } catch (error) {
    console.error('Error in searchProducts:', error);
    return [];
  }
}

/**
 * Get unique categories from Supabase
 */
export async function getCategories(): Promise<{ category1: string[]; category2: string[] }> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category_1, category_2')
      .eq('availability', true);

    if (error) {
      console.error('Error fetching categories:', error);
      return { category1: [], category2: [] };
    }

    const category1Set = new Set<string>();
    const category2Set = new Set<string>();
    
    data.forEach((product: any) => {
      if (product.category_1) category1Set.add(product.category_1);
      if (product.category_2) category2Set.add(product.category_2);
    });
    
    return {
      category1: Array.from(category1Set).sort(),
      category2: Array.from(category2Set).sort()
    };
  } catch (error) {
    console.error('Error in getCategories:', error);
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
 * Search product by exact barcode number from Supabase
 */
export async function getProductByBarcode(barcodeNumber: string | number): Promise<VysnProduct | null> {
  try {
    const barcode = barcodeNumber.toString();
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('barcode_number', barcode)
      .eq('availability', true)
      .single();

    if (error) {
      console.error('Error fetching product by barcode:', error);
      return null;
    }

    return convertDbToClientProduct(data as VysnProductDB);
  } catch (error) {
    console.error('Error in getProductByBarcode:', error);
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