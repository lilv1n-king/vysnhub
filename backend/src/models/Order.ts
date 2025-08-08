export interface Order {
  id: string;
  user_id: string;
  project_id?: string;
  
  // Order Information
  order_number: string;
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  order_type: 'standard' | 'reorder' | 'replacement' | 'emergency';
  
  // Financial
  subtotal: number;
  discount_amount?: number;
  tax_amount?: number;
  shipping_cost?: number;
  total_amount: number;
  
  // Shipping
  shipping_address_line_1?: string;
  shipping_address_line_2?: string;
  shipping_city?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  shipping_method?: string;
  tracking_number?: string;
  
  // Dates
  order_date: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  
  // Notes
  customer_notes?: string;
  internal_notes?: string;
  
  // System Fields
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: number;
  
  // Item Details
  quantity: number;
  unit_price: number;
  discount_percentage?: number;
  line_total: number;
  
  // Product snapshot (for historical data)
  product_name: string;
  product_sku?: string;
  
  // System Fields
  created_at: string;
}

export interface CreateOrderData {
  user_id: string;
  project_id?: string;
  
  // Order Information
  order_status?: Order['order_status'];
  order_type?: Order['order_type'];
  
  // Financial
  subtotal: number;
  discount_amount?: number;
  tax_amount?: number;
  shipping_cost?: number;
  total_amount: number;
  
  // Shipping (optional for digital/quote orders)
  shipping_address_line_1?: string;
  shipping_address_line_2?: string;
  shipping_city?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  shipping_method?: string;
  
  // Dates
  estimated_delivery_date?: string;
  
  // Notes
  customer_notes?: string;
  internal_notes?: string;
}

export interface CreateOrderItemData {
  product_id: number;
  quantity: number;
  unit_price: number;
  discount_percentage?: number;
  line_total: number;
  product_name: string;
  product_sku?: string;
}