import { supabase } from '../config/database';

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  added_at: string;
  updated_at: string;
  // Joined product data
  product?: {
    id: number;
    name: string;
    vysn_name: string;
    gross_price: number;
    images: string[];
    product_picture_1: string;
    item_number: string;
    item_number_vysn: string;
    short_description?: string;
    long_description?: string;
  };
}

export interface Cart {
  id: string;
  user_id?: string;
  session_id?: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  status: 'active' | 'abandoned' | 'converted' | 'expired';
  total_items: number;
  total_price: number;
  currency: string;
  items?: CartItem[];
}

class CartService {
  /**
   * Bekommt oder erstellt einen aktiven Warenkorb für Benutzer/Session
   */
  async getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart | null> {
    try {
      // Zuerst versuchen, bestehenden aktiven Warenkorb zu finden
      let queryBuilder = supabase
        .from('carts')
        .select('*')
        .eq('status', 'active');

      if (userId) {
        queryBuilder = queryBuilder.eq('user_id', userId);
      } else if (sessionId) {
        queryBuilder = queryBuilder.eq('session_id', sessionId);
      } else {
        throw new Error('Either userId or sessionId is required');
      }

      const { data: existingCart, error: fetchError } = await queryBuilder.single();

      if (existingCart && !fetchError) {
        return existingCart;
      }

      // Erstelle neuen Warenkorb wenn keiner existiert
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({
          user_id: userId || null,
          session_id: sessionId || null,
          status: 'active',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 Tage
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating cart:', createError);
        return null;
      }

      return newCart;
    } catch (error) {
      console.error('Error in getOrCreateCart:', error);
      return null;
    }
  }

  /**
   * Lädt Warenkorb mit allen Items und Produktdaten
   */
  async getCartWithItems(cartId: string): Promise<Cart | null> {
    try {
      // Hole Cart
      const { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('*')
        .eq('id', cartId)
        .single();

      if (cartError) {
        console.error('Error fetching cart:', cartError);
        return null;
      }

      // Hole Cart Items
      const { data: cartItems, error: itemsError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartId);

      if (itemsError) {
        console.error('Error fetching cart items:', itemsError);
        return { ...cart, items: [] };
      }

      // Hole Produktdaten für jedes Item
      const itemsWithProducts: CartItem[] = [];
      for (const item of cartItems || []) {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('id, vysn_name, gross_price, product_picture_1, item_number_vysn, short_description, long_description')
          .eq('id', item.product_id)
          .single();

        const cartItem: CartItem = {
          id: item.id,
          cart_id: item.cart_id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          added_at: item.added_at,
          updated_at: item.updated_at
        };

        if (!productError && product) {
          cartItem.product = {
            id: product.id,
            name: product.vysn_name,
            vysn_name: product.vysn_name,
            gross_price: product.gross_price,
            images: product.product_picture_1 ? [product.product_picture_1] : [],
            product_picture_1: product.product_picture_1,
            item_number: product.item_number_vysn,
            item_number_vysn: product.item_number_vysn,
            short_description: product.short_description,
            long_description: product.long_description
          };
        } else {
          console.warn(`Product not found for item ${item.id}, product_id: ${item.product_id}`);
        }

        itemsWithProducts.push(cartItem);
      }

      return {
        ...cart,
        items: itemsWithProducts
      };
    } catch (error) {
      console.error('Error in getCartWithItems:', error);
      return null;
    }
  }

  /**
   * Fügt Produkt zum Warenkorb hinzu oder aktualisiert Menge
   */
  async addToCart(
    cartId: string, 
    productId: number, 
    quantity: number, 
    unitPrice: number
  ): Promise<CartItem | null> {
    try {
      // Prüfe ob Produkt bereits im Warenkorb ist
      const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartId)
        .eq('product_id', productId)
        .single();

      if (existingItem && !checkError) {
        // Update bestehende Menge
        const newQuantity = existingItem.quantity + quantity;
        const { data: updatedItem, error: updateError } = await supabase
          .from('cart_items')
          .update({
            quantity: newQuantity,
            unit_price: unitPrice // Update Preis falls sich geändert hat
          })
          .eq('id', existingItem.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating cart item:', updateError);
          return null;
        }

        return updatedItem;
      } else {
        // Neues Item hinzufügen
        const { data: newItem, error: insertError } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cartId,
            product_id: productId,
            quantity,
            unit_price: unitPrice
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error adding cart item:', insertError);
          return null;
        }

        return newItem;
      }
    } catch (error) {
      console.error('Error in addToCart:', error);
      return null;
    }
  }

  /**
   * Aktualisiert Menge eines Warenkorb-Items
   */
  async updateQuantity(cartItemId: string, quantity: number): Promise<boolean> {
    try {
      if (quantity <= 0) {
        return this.removeFromCart(cartItemId);
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId);

      if (error) {
        console.error('Error updating quantity:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateQuantity:', error);
      return false;
    }
  }

  /**
   * Entfernt Item aus Warenkorb
   */
  async removeFromCart(cartItemId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) {
        console.error('Error removing cart item:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in removeFromCart:', error);
      return false;
    }
  }

  /**
   * Leert kompletten Warenkorb
   */
  async clearCart(cartId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId);

      if (error) {
        console.error('Error clearing cart:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in clearCart:', error);
      return false;
    }
  }

  /**
   * Migriert Session-Cart zu User-Cart beim Login
   */
  async migrateSessionCartToUser(sessionId: string, userId: string): Promise<boolean> {
    try {
      // Hole Session-Cart
      const { data: sessionCart, error: sessionError } = await supabase
        .from('carts')
        .select('*')
        .eq('session_id', sessionId)
        .eq('status', 'active')
        .single();

      if (sessionError || !sessionCart) {
        return true; // Kein Session-Cart gefunden, OK
      }

      // Hole Cart Items separat
      const { data: cartItems, error: itemsError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', sessionCart.id);

      if (itemsError) {
        console.error('Error fetching cart items:', itemsError);
        return false;
      }

      // Füge Items zum Cart hinzu
      sessionCart.cart_items = cartItems || [];

      // Hole oder erstelle User-Cart
      let userCart = await this.getOrCreateCart(userId);
      if (!userCart) {
        console.error('Could not create user cart');
        return false;
      }

      // Migriere Items
      for (const item of sessionCart.cart_items || []) {
        await this.addToCart(
          userCart.id,
          item.product_id,
          item.quantity,
          item.unit_price
        );
      }

      // Lösche Session-Cart
      const { error: deleteError } = await supabase
        .from('carts')
        .delete()
        .eq('id', sessionCart.id);

      if (deleteError) {
        console.error('Error deleting session cart:', deleteError);
      }

      return true;
    } catch (error) {
      console.error('Error in migrateSessionCartToUser:', error);
      return false;
    }
  }

  /**
   * Bereinigt abgelaufene Warenkörbe
   */
  async cleanupExpiredCarts(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('cleanup_expired_carts');

      if (error) {
        console.error('Error cleaning up expired carts:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error in cleanupExpiredCarts:', error);
      return 0;
    }
  }

  /**
   * Markiert Warenkorb als konvertiert (nach Bestellung)
   */
  async markCartAsConverted(cartId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('carts')
        .update({ status: 'converted' })
        .eq('id', cartId);

      if (error) {
        console.error('Error marking cart as converted:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markCartAsConverted:', error);
      return false;
    }
  }

  /**
   * Holt Warenkorb-Statistiken für Analytics
   */
  async getCartStats(userId?: string): Promise<{
    totalCarts: number;
    activeCarts: number;
    convertedCarts: number;
    averageCartValue: number;
    averageItemsPerCart: number;
  }> {
    try {
      let query = supabase
        .from('carts')
        .select('status, total_price, total_items');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: carts, error } = await query;

      if (error) {
        console.error('Error fetching cart stats:', error);
        return {
          totalCarts: 0,
          activeCarts: 0,
          convertedCarts: 0,
          averageCartValue: 0,
          averageItemsPerCart: 0
        };
      }

      const totalCarts = carts.length;
      const activeCarts = carts.filter(c => c.status === 'active').length;
      const convertedCarts = carts.filter(c => c.status === 'converted').length;
      
      const totalValue = carts.reduce((sum, c) => sum + (c.total_price || 0), 0);
      const totalItems = carts.reduce((sum, c) => sum + (c.total_items || 0), 0);
      
      const averageCartValue = totalCarts > 0 ? totalValue / totalCarts : 0;
      const averageItemsPerCart = totalCarts > 0 ? totalItems / totalCarts : 0;

      return {
        totalCarts,
        activeCarts,
        convertedCarts,
        averageCartValue,
        averageItemsPerCart
      };
    } catch (error) {
      console.error('Error in getCartStats:', error);
      return {
        totalCarts: 0,
        activeCarts: 0,
        convertedCarts: 0,
        averageCartValue: 0,
        averageItemsPerCart: 0
      };
    }
  }
}

export default new CartService();