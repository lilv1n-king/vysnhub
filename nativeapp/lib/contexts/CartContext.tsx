import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VysnProduct } from '../types/product';
import { useAuth } from './AuthContext';
import { Alert } from 'react-native';
import cartApiService from '../services/cartApiService';

export interface CartItem {
  id?: string; // Backend cart item ID
  product: VysnProduct;
  quantity: number;
  addedAt: Date;
  unitPrice?: number;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (product: VysnProduct, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemQuantity: (productId: number) => number;
  syncWithBackend: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const user = auth?.user || null;
  const accessToken = auth?.accessToken || null;
  
  const CART_STORAGE_KEY = 'vysn_cart_items';

  // Lade Cart beim Start
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  // Sync mit Backend wenn User eingeloggt ist
  useEffect(() => {
    if (user) {
      syncWithBackend();
    }
  }, [user]);

  // Speichere Cart lokal bei Änderungen
  useEffect(() => {
    saveCartToStorage();
  }, [items]);

  const loadCartFromStorage = async () => {
    try {
      const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        // Convert addedAt strings back to Date objects
        const cartWithDates = parsedCart.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
        setItems(cartWithDates);
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    }
  };

  const saveCartToStorage = async () => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  };

  const getSessionId = () => {
    return accessToken || 'anonymous_' + Date.now();
  };

  const syncWithBackend = async () => {
    if (!user || !accessToken) return;

    setLoading(true);
    try {
      // 1. Migriere Session-Cart zu User-Cart (nur bei gültigem Token)
      const sessionId = getSessionId();
      if (accessToken && sessionId !== accessToken) {
        // Nur migrieren wenn sessionId anders als aktueller Token
        const migrationResult = await cartApiService.migrateCart(
          sessionId,
          accessToken
        );

        if (!migrationResult.success) {
          console.warn('Cart migration failed:', migrationResult.error);
          // Migration-Fehler nicht als schwerwiegend behandeln
        }
      }

      // 2. Lade aktuellen Warenkorb vom Backend
      const cartResult = await cartApiService.getCart(
        accessToken,
        sessionId
      );

      if (cartResult.success && cartResult.cart && cartResult.cart.items) {
        // Konvertiere Backend-Format zu Frontend-Format
        const backendItems = cartResult.cart.items.map((item: any) => ({
          id: item.id,
          product: {
            id: item.product_id,
            vysnName: item.product?.name || item.product?.vysn_name || 'Unknown Product',
            itemNumberVysn: item.product?.item_number || item.product?.item_number_vysn || '',
            grossPrice: item.unit_price || item.product?.gross_price || 0,
            product_picture_1: item.product?.images?.[0] || item.product?.product_picture_1 || '',
            shortDescription: item.product?.short_description || '',
            longDescription: item.product?.long_description || '',
            // Füge alle benötigten VysnProduct Properties hinzu
            weightKg: item.product?.weight_kg,
            material: item.product?.material,
            category1: item.product?.category_1,
            category2: item.product?.category_2,
            lumen: item.product?.lumen,
            wattage: item.product?.wattage,
            cct: item.product?.cct,
            cri: item.product?.cri,
            availability: item.product?.availability
          } as VysnProduct,
          quantity: item.quantity,
          addedAt: new Date(item.added_at),
          unitPrice: item.unit_price,
        }));

        setItems(backendItems);
      } else if (!cartResult.success) {
        console.error('Failed to load cart:', cartResult.error);
        Alert.alert('Hinweis', 'Warenkorb konnte nicht vom Server geladen werden. Lokaler Warenkorb wird verwendet.');
      }
    } catch (error) {
      console.error('Error syncing with backend:', error);
      Alert.alert('Hinweis', 'Warenkorb-Synchronisierung fehlgeschlagen. Offline-Modus aktiv.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: VysnProduct, quantity: number) => {
    setLoading(true);
    
    try {
      // Lokale Aktualisierung zuerst (für bessere UX)
      setItems(currentItems => {
        const existingItem = currentItems.find(item => item.product.id === product.id);
        
        if (existingItem) {
          return currentItems.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          return [...currentItems, { 
            product, 
            quantity, 
            addedAt: new Date(),
            unitPrice: product.grossPrice 
          }];
        }
      });

      // Backend Sync wenn möglich  
      if (user || accessToken) {
        const result = await cartApiService.addToCart(
          product.id,
          quantity,
          product.grossPrice || 0,
          accessToken,
          getSessionId()
        );

        if (!result.success) {
          console.warn('Backend sync failed:', result.error);
          // Fehler nicht an User weiterleiten - lokaler Cart funktioniert trotzdem
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Fehler', 'Produkt konnte nicht zum Warenkorb hinzugefügt werden');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: number) => {
    setLoading(true);
    
    try {
      const itemToRemove = items.find(item => item.product.id === productId);
      
      // Lokale Aktualisierung
      setItems(currentItems => currentItems.filter(item => item.product.id !== productId));

      // Backend Sync
      if (user && accessToken && itemToRemove?.id) {
        const result = await cartApiService.removeFromCart(
          itemToRemove.id,
          accessToken
        );

        if (!result.success) {
          console.warn('Backend sync failed:', result.error);
        }
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      Alert.alert('Fehler', 'Produkt konnte nicht entfernt werden');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    setLoading(true);
    
    try {
      const itemToUpdate = items.find(item => item.product.id === productId);
      
      // Lokale Aktualisierung
      setItems(currentItems =>
        currentItems.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      );

      // Backend Sync
      if (user && accessToken && itemToUpdate?.id) {
        const result = await cartApiService.updateQuantity(
          itemToUpdate.id,
          quantity,
          accessToken
        );

        if (!result.success) {
          console.warn('Backend sync failed:', result.error);
        }
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Fehler', 'Menge konnte nicht aktualisiert werden');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    
    try {
      // Lokale Aktualisierung
      setItems([]);

      // Backend Sync
      if (user && accessToken) {
        const result = await cartApiService.clearCart(
          accessToken,
          getSessionId()
        );

        if (!result.success) {
          console.warn('Backend sync failed:', result.error);
        }
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      Alert.alert('Fehler', 'Warenkorb konnte nicht geleert werden');
    } finally {
      setLoading(false);
    }
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = item.product.grossPrice || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getItemQuantity = (productId: number) => {
    const item = items.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const value: CartContextType = {
    items,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getItemQuantity,
    syncWithBackend,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};