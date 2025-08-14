import Constants from 'expo-constants';

// Backend API Configuration
// ⚠️ SICHERHEITSWARNUNG: Development URL sollte nicht hardcoded sein!
const API_BASE_URL_DEV = 'http://192.168.2.188:3001'; // Development URL (Local Server)
const API_BASE_URL_PROD = 'https://api.vysnlighting.com'; // Production URL

// Versuche Umgebungsvariablen zu laden, fallback auf Development-Werte
export const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 
                           process.env.EXPO_PUBLIC_API_BASE_URL || 
                           API_BASE_URL_DEV;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH_INFO: '/api/auth',
  AUTH_VALIDATE: '/api/auth/validate',
  AUTH_PROFILE: '/api/auth/profile',
  AUTH_RESET_PASSWORD: '/api/auth/reset-password',
  
  // User Projects
  USER_PROJECTS: '/api/user-projects',
  USER_PROJECTS_STATS: '/api/user-projects/stats',
  
  // Products (existing - bleibt unverändert)
  PRODUCTS: '/api/products',
  
  // Chat (existing - bleibt unverändert)
  CHAT: '/api/chat',
  CHAT_FAST: '/api/chat-fast',
  
  // Cart (Warenkorb)
  CART: '/api/cart',
  CART_ADD: '/api/cart/add',
  CART_UPDATE: '/api/cart/update',
  CART_REMOVE: '/api/cart/remove',
  CART_CLEAR: '/api/cart/clear',
  CART_MIGRATE: '/api/cart/migrate',
  
  // Orders (Bestellungen)
  ORDERS: '/api/orders',
  ORDER_BY_ID: '/api/orders', // + /:id
  ORDER_STATUS: '/api/orders', // + /:id/status
} as const;

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Error Types
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Network timeout configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds (erhöht für Auth-Requests)
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;