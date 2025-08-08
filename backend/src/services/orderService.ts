import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Order, OrderItem, CreateOrderData, CreateOrderItemData } from '../models/Order';

export class OrderService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // Set user authentication token for Supabase client
  private async setUserAuth(accessToken: string): Promise<SupabaseClient> {
    try {
      // Create a new Supabase client with the user's session for this request
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing');
      }

      const userSupabase = createClient(supabaseUrl, supabaseKey);
      
      // Set the session with the access token
      await userSupabase.auth.setSession({
        access_token: accessToken,
        refresh_token: 'dummy_refresh_token'
      });
      
      return userSupabase;
    } catch (error) {
      console.error('Failed to set user auth:', error);
      throw new Error('Authentication failed');
    }
  }

  /**
   * Erstellt eine neue Bestellung mit Items
   */
  async createOrder(
    orderData: CreateOrderData,
    orderItems: CreateOrderItemData[],
    accessToken: string
  ): Promise<{ order: Order; items: OrderItem[] }> {
    try {
      console.log('📦 Creating new order for user:', orderData.user_id);
      
      const userSupabase = await this.setUserAuth(accessToken);
      
      // Erstelle Order mit Retry-Logic für eindeutige Order-Numbers
      let order: Order;
      let orderNumber: string;
      
      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          // Generiere neue Order Number für jeden Versuch
          orderNumber = await this.generateOrderNumber();
          
          // Versuche Order zu erstellen
          const { data: orderResult, error: orderError } = await userSupabase
            .from('orders')
            .insert({
              ...orderData,
              order_number: orderNumber
            })
            .select()
            .single();

          if (orderError) {
            // Wenn es ein Duplicate Key Fehler ist, versuche es nochmal
            if (orderError.code === '23505' && attempt < 5) {
              console.log(`⚠️ Order number ${orderNumber} already exists, retrying... (attempt ${attempt})`);
              await new Promise(resolve => setTimeout(resolve, 200 * attempt));
              continue;
            }
            throw new Error(`Failed to create order: ${orderError.message}`);
          }

          order = orderResult as Order;
          break; // Erfolg!
          
        } catch (error) {
          if (attempt === 5) {
            console.error('Order creation failed after 5 attempts:', error);
            throw error;
          }
        }
      }

      console.log('✅ Order created:', order!.id, order!.order_number);

      // Erstelle Order Items
      const orderItemsWithOrderId = orderItems.map(item => ({
        ...item,
        order_id: order!.id
      }));

      const { data: itemsResult, error: itemsError } = await userSupabase
        .from('order_items')
        .insert(orderItemsWithOrderId)
        .select();

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        // Rollback: Delete the order if items creation fails
        await userSupabase.from('orders').delete().eq('id', order!.id);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }

      const items = itemsResult as OrderItem[];
      console.log(`✅ Created ${items.length} order items`);

      return { order: order!, items };

    } catch (error) {
      console.error('OrderService.createOrder error:', error);
      throw error;
    }
  }

  /**
   * Lädt eine Bestellung mit Items
   */
  async getOrderById(orderId: string, accessToken: string): Promise<Order & { items: OrderItem[] } | null> {
    try {
      const userSupabase = await this.setUserAuth(accessToken);

      // Lade Order
      const { data: orderData, error: orderError } = await userSupabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        console.log('Order not found:', orderId);
        return null;
      }

      // Lade Order Items
      const { data: itemsData, error: itemsError } = await userSupabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) {
        console.error('Error loading order items:', itemsError);
        throw new Error(`Failed to load order items: ${itemsError.message}`);
      }

      return {
        ...orderData as Order,
        items: itemsData as OrderItem[]
      };

    } catch (error) {
      console.error('OrderService.getOrderById error:', error);
      throw error;
    }
  }

  /**
   * Lädt alle Bestellungen eines Users mit optionalen Filtern
   */
  async getUserOrders(
    userId: string, 
    accessToken: string, 
    projectId?: string, 
    statusFilter?: string[]
  ): Promise<{ orders: Order[] }> {
    try {
      const userSupabase = await this.setUserAuth(accessToken);

      let query = userSupabase
        .from('orders')
        .select('*')
        .eq('user_id', userId);

      // Filter nach Projekt-ID
      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      // Filter nach Status
      if (statusFilter && statusFilter.length > 0) {
        query = query.in('order_status', statusFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading user orders:', error);
        throw new Error(`Failed to load orders: ${error.message}`);
      }

      return { orders: data as Order[] };

    } catch (error) {
      console.error('OrderService.getUserOrders error:', error);
      throw error;
    }
  }

  /**
   * Aktualisiert Order Status
   */
  async updateOrderStatus(
    orderId: string,
    status: Order['order_status'],
    accessToken: string,
    notes?: string
  ): Promise<Order> {
    try {
      const userSupabase = await this.setUserAuth(accessToken);

      const updateData: any = {
        order_status: status,
        updated_at: new Date().toISOString()
      };

      if (notes) {
        updateData.internal_notes = notes;
      }

      if (status === 'delivered') {
        updateData.actual_delivery_date = new Date().toISOString().split('T')[0];
      }

      const { data, error } = await userSupabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Error updating order status:', error);
        throw new Error(`Failed to update order: ${error.message}`);
      }

      console.log(`✅ Order ${orderId} status updated to: ${status}`);
      return data as Order;

    } catch (error) {
      console.error('OrderService.updateOrderStatus error:', error);
      throw error;
    }
  }

  /**
   * Generiert eine eindeutige Bestellnummer mit besserer Eindeutigkeit
   */
  private async generateOrderNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    
    // Format: VY24120X-XXXX (VY + Jahr + Monat + Tag + 4-stellige Nummer)
    const datePrefix = `VY${year}${month}${day}`;
    
    // Verwende Millisekunden + Zufallszahl für bessere Eindeutigkeit
    const timestamp = Date.now().toString().slice(-6); // Letzte 6 Stellen der Millisekunden
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const orderNumber = `${datePrefix}-${timestamp.slice(-3)}${random.slice(-1)}`;
    console.log(`📋 Generated order number: ${orderNumber}`);
    
    return orderNumber;
  }

  /**
   * Prüft ob ein Projekt bereits bestellt wurde
   */
  async isProjectAlreadyOrdered(projectId: string, accessToken: string): Promise<boolean> {
    try {
      this.setUserAuth(accessToken);
      
      const { data, error } = await this.supabase
        .from('orders')
        .select('id')
        .eq('project_id', projectId)
        .in('order_status', ['pending', 'confirmed', 'processing', 'shipped'])
        .limit(1);

      if (error) {
        console.error('Error checking if project is ordered:', error);
        return false; // Bei Fehler erlauben wir die Bestellung
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('isProjectAlreadyOrdered error:', error);
      return false;
    }
  }
}