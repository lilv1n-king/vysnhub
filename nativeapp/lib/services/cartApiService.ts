import { API_BASE_URL, API_ENDPOINTS, API_CONFIG } from '../config/api';

export interface CartApiResponse<T = any> {
  success: boolean;
  message?: string;
  cart?: T;
  cartItem?: T;
  error?: string;
}

class CartApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<CartApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const sessionHeader = options.headers?.['X-Session-ID'];
      const authHeader = options.headers?.['Authorization'];
      
      console.log('🌐 Cart API Request:', {
        url,
        sessionId: sessionHeader ? sessionHeader.substring(0, 20) + '...' : 'none',
        hasAuth: !!authHeader,
        method: options.method || 'GET'
      });

      const response = await fetch(url, {
        timeout: API_CONFIG.TIMEOUT,
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ Cart API Error:', response.status, data);
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      console.log('✅ Cart API Success:', data);
      return data;
    } catch (error) {
      console.error('🚨 Cart API Network Error:', error);
      
      // Spezifische Fehlerbehandlung
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        return {
          success: false,
          error: 'Keine Verbindung zum Server. Bitte überprüfe deine Internetverbindung.',
        };
      }
      
      return {
        success: false,
        error: 'Netzwerkfehler aufgetreten',
      };
    }
  }

  /**
   * Holt aktuellen Warenkorb
   */
  async getCart(authToken?: string, sessionId?: string): Promise<CartApiResponse> {
    const headers: Record<string, string> = {};
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }

    return this.makeRequest(API_ENDPOINTS.CART, {
      method: 'GET',
      headers,
    });
  }

  /**
   * Fügt Produkt zum Warenkorb hinzu
   */
  async addToCart(
    productId: number,
    quantity: number,
    unitPrice: number,
    authToken?: string,
    sessionId?: string
  ): Promise<CartApiResponse> {
    const headers: Record<string, string> = {};
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }

    return this.makeRequest(API_ENDPOINTS.CART_ADD, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        productId,
        quantity,
        unitPrice,
      }),
    });
  }

  /**
   * Aktualisiert Menge eines Cart Items
   */
  async updateQuantity(
    itemId: string,
    quantity: number,
    authToken?: string
  ): Promise<CartApiResponse> {
    const headers: Record<string, string> = {};
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    return this.makeRequest(`${API_ENDPOINTS.CART_UPDATE}/${itemId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ quantity }),
    });
  }

  /**
   * Entfernt Item aus Warenkorb
   */
  async removeFromCart(
    itemId: string,
    authToken?: string
  ): Promise<CartApiResponse> {
    const headers: Record<string, string> = {};
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    return this.makeRequest(`${API_ENDPOINTS.CART_REMOVE}/${itemId}`, {
      method: 'DELETE',
      headers,
    });
  }

  /**
   * Leert kompletten Warenkorb
   */
  async clearCart(
    authToken?: string,
    sessionId?: string
  ): Promise<CartApiResponse> {
    const headers: Record<string, string> = {};
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }

    return this.makeRequest(API_ENDPOINTS.CART_CLEAR, {
      method: 'DELETE',
      headers,
    });
  }

  /**
   * Migriert Session-Cart zu User-Cart
   */
  async migrateCart(
    sessionId: string,
    authToken: string
  ): Promise<CartApiResponse> {
    return this.makeRequest(API_ENDPOINTS.CART_MIGRATE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ sessionId }),
    });
  }

  /**
   * Testet Backend-Verbindung
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        timeout: 5000,
      });
      return response.ok;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }
}

export default new CartApiService();