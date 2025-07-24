import { VysnProduct } from '../types/product';
import productsData from '../../data/vysn-products.json';

export const products: VysnProduct[] = productsData as VysnProduct[];

/**
 * Get all products
 */
export function getAllProducts(): VysnProduct[] {
  return products;
}

/**
 * Get product by item number
 */
export function getProductByItemNumber(itemNumber: string): VysnProduct | undefined {
  return products.find(product => product.itemNumberVysn === itemNumber);
}

/**
 * Get products by category
 */
export function getProductsByCategory(category1?: string, category2?: string): VysnProduct[] {
  return products.filter(product => {
    if (category1 && category2) {
      return product.category1 === category1 && product.category2 === category2;
    } else if (category1) {
      return product.category1 === category1;
    } else if (category2) {
      return product.category2 === category2;
    }
    return true;
  });
}

/**
 * Get products by group name
 */
export function getProductsByGroup(groupName: string): VysnProduct[] {
  return products.filter(product => product.groupName === groupName);
}

/**
 * Search products by name, description, barcode, or item number
 */
export function searchProducts(query: string): VysnProduct[] {
  const searchTerm = query.toLowerCase().trim();
  return products.filter(product => 
    product.vysnName.toLowerCase().includes(searchTerm) ||
    product.shortDescription.toLowerCase().includes(searchTerm) ||
    product.longDescription.toLowerCase().includes(searchTerm) ||
    product.itemNumberVysn.toLowerCase().includes(searchTerm) ||
    product.barcodeNumber?.toString().includes(searchTerm)
  );
}

/**
 * Get unique categories
 */
export function getCategories(): { category1: string[]; category2: string[] } {
  const category1Set = new Set<string>();
  const category2Set = new Set<string>();
  
  products.forEach(product => {
    if (product.category1) category1Set.add(product.category1);
    if (product.category2) category2Set.add(product.category2);
  });
  
  return {
    category1: Array.from(category1Set).sort(),
    category2: Array.from(category2Set).sort()
  };
}

/**
 * Get unique group names
 */
export function getGroupNames(): string[] {
  const groupSet = new Set<string>();
  products.forEach(product => {
    if (product.groupName) groupSet.add(product.groupName);
  });
  return Array.from(groupSet).sort();
}

/**
 * Search product by exact barcode number
 */
export function getProductByBarcode(barcodeNumber: string | number): VysnProduct | undefined {
  const barcode = barcodeNumber.toString();
  return products.find(product => 
    product.barcodeNumber?.toString() === barcode
  );
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