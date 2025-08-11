import { API_BASE_URL, API_ENDPOINTS, API_CONFIG } from '../config/api';
import { apiService } from './apiService';

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

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface OrdersResponse {
  orders: Order[];
}

class OrderService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Lädt alle Bestellungen des aktuellen Users
   */
  async getUserOrders(projectId?: string, statusFilter?: string[]): Promise<Order[]> {
    try {
      let endpoint = API_ENDPOINTS.ORDERS;
      const params = new URLSearchParams();
      
      if (projectId) {
        params.append('project_id', projectId);
      }
      
      if (statusFilter && statusFilter.length > 0) {
        params.append('status', statusFilter.join(','));
      }
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      console.log('📋 Fetching user orders...');
      const response = await apiService.get<{ orders: Order[] }>(endpoint);
      
      if (response.success && response.data) {
        console.log(`✅ Loaded ${response.data.orders.length} orders`);
        return response.data.orders;
      } else {
        console.error('❌ Failed to load orders:', response.error);
        return [];
      }
    } catch (error) {
      console.error('❌ Error in getUserOrders:', error);
      return [];
    }
  }

  /**
   * Lädt eine spezifische Bestellung mit Items
   */
  async getOrderById(orderId: string, accessToken: string): Promise<OrderWithItems> {
    try {
      const url = `${this.baseURL}${API_ENDPOINTS.ORDER_BY_ID}/${orderId}`;
      console.log('🔄 Loading order by ID:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        timeout: API_CONFIG.TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to load order');
      }

      return result.data;
    } catch (error) {
      console.error('Error loading order by ID:', error);
      throw error;
    }
  }

  /**
   * Aktualisiert den Status einer Bestellung
   */
  async updateOrderStatus(
    orderId: string, 
    status: Order['order_status'], 
    accessToken: string, 
    notes?: string
  ): Promise<Order> {
    try {
      const url = `${this.baseURL}${API_ENDPOINTS.ORDER_STATUS}/${orderId}/status`;
      console.log('🔄 Updating order status:', url, status);
      
      const response = await fetch(url, {
        method: 'PUT',
        timeout: API_CONFIG.TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          status,
          notes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update order status');
      }

      return result.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Formatiert ein Order-Datum für die Anzeige
   */
  formatOrderDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formatiert einen Preis für die Anzeige
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  /**
   * Konvertiert Backend Order Status zu Frontend Display Status
   */
  getStatusDisplayInfo(status: Order['order_status']): { text: string; color: string } {
    switch (status) {
      case 'delivered':
        return { text: 'Zugestellt', color: '#10b981' };
      case 'shipped':
        return { text: 'Versandt', color: '#3b82f6' };
      case 'processing':
        return { text: 'In Bearbeitung', color: '#f59e0b' };
      case 'confirmed':
        return { text: 'Bestätigt', color: '#8b5cf6' };
      case 'pending':
        return { text: 'Ausstehend', color: '#6b7280' };
      case 'cancelled':
        return { text: 'Storniert', color: '#ef4444' };
      case 'refunded':
        return { text: 'Erstattet', color: '#f97316' };
      default:
        return { text: status, color: '#6b7280' };
    }
  }
}

export const orderService = new OrderService();
