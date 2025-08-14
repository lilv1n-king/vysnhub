import { createClient } from '@supabase/supabase-js';
import { Product } from '../config/database';

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase environment variables are required');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface HomeEvent {
  id: string;
  event_name: string;
  event_description: string;
  event_type: string;
  event_location?: string;
  city?: string;
  start_datetime: string;
  end_datetime: string;
  is_virtual: boolean;
  meeting_link?: string;
  max_participants?: number;
  current_participants: number;
  event_status: string;
}

export interface HomeHighlight {
  id: string;
  title: string;
  description: string;
  badge_text?: string;
  badge_type?: string;
  image_url?: string;
  button_text?: string;
  // Navigation/Action fields
  action_type?: string;
  action_params?: any;
  // Legacy field
  product_id?: number;
  sort_order: number;
  created_at: string;
  product?: Product;
}

export class HomeContentService {
  
  /**
   * Get active events for home screen
   */
  async getActiveEvents(): Promise<HomeEvent[]> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          event_name,
          event_description,
          event_type,
          event_location,
          city,
          start_datetime,
          end_datetime,
          is_virtual,
          meeting_link,
          max_participants,
          current_participants,
          event_status
        `)
        .eq('event_status', 'upcoming')
        .gte('start_datetime', now)
        .order('start_datetime', { ascending: true })
        .limit(5);

      if (error) {
        console.error('Supabase error loading events:', error);
        throw new Error(`Failed to load events: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error loading events:', error);
      throw error;
    }
  }

  /**
   * Get active highlights for home screen
   * @param language - Language code ('de' or 'en'), defaults to 'de'
   */
  async getActiveHighlights(language: string = 'de'): Promise<HomeHighlight[]> {
    try {
      // Try using the database function first for multilingual support
      const { data: functionData, error: functionError } = await supabase
        .rpc('get_home_highlights', { lang: language });

      if (!functionError && functionData) {
        console.log(`✅ Loaded ${functionData.length} highlights using multilingual function`);
        
        // For highlights with product references, load product data
        const enrichedData = await Promise.all(
          functionData.map(async (highlight: any) => {
            if (highlight.product_id) {
              const { data: productData } = await supabase
                .from('products')
                .select(`
                  id,
                  vysn_name,
                  item_number_vysn,
                  short_description,
                  product_picture_1,
                  gross_price,
                  stock_quantity
                `)
                .eq('id', highlight.product_id)
                .single();
              
              return {
                ...highlight,
                product: productData
              };
            }
            return highlight;
          })
        );

        return enrichedData;
      }

      // Fallback to old schema if function doesn't exist
      console.log('⚠️ Multilingual function not available, using legacy schema');
      const { data, error } = await supabase
        .from('home_highlights')
        .select(`
          id,
          title,
          description,
          badge_text,
          badge_type,
          image_url,
          button_text,
          action_type,
          action_params,
          product_id,
          sort_order,
          created_at,
          products:product_id (
            id,
            vysn_name,
            item_number_vysn,
            short_description,
            product_picture_1,
            gross_price,
            stock_quantity
          )
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Supabase error loading highlights:', error);
        throw new Error(`Failed to load highlights: ${error.message}`);
      }

      // Transform the data to include product information
      const transformedData = (data || []).map(highlight => ({
        ...highlight,
        product: highlight.products ? highlight.products[0] : undefined
      }));

      return transformedData;
    } catch (error) {
      console.error('Error loading highlights:', error);
      throw error;
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: string): Promise<HomeEvent | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          event_name,
          event_description,
          event_type,
          event_location,
          city,
          start_datetime,
          end_datetime,
          is_virtual,
          meeting_link,
          max_participants,
          current_participants,
          event_status
        `)
        .eq('id', eventId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to load event: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error loading event by ID:', error);
      throw error;
    }
  }

  /**
   * Get highlight by ID
   */
  async getHighlightById(highlightId: string): Promise<HomeHighlight | null> {
    try {
      const { data, error } = await supabase
        .from('home_highlights')
        .select(`
          id,
          title,
          description,
          badge_text,
          badge_type,
          image_url,
          button_text,
          product_id,
          sort_order,
          created_at,
          products:product_id (
            id,
            vysn_name,
            item_number_vysn,
            short_description,
            product_picture_1,
            gross_price
          )
        `)
        .eq('id', highlightId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to load highlight: ${error.message}`);
      }

      return {
        ...data,
        product: data.products ? data.products[0] : undefined
      };
    } catch (error) {
      console.error('Error loading highlight by ID:', error);
      throw error;
    }
  }

  // ====== ADMIN METHODS ======

  /**
   * Get all highlights (including inactive) for admin management
   */
  async getAllHighlights(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('home_highlights')
        .select(`
          id,
          title_de,
          title_en,
          description_de,
          description_en,
          badge_text_de,
          badge_text_en,
          badge_type,
          button_text_de,
          button_text_en,
          image_url,
          action_type,
          action_params,
          product_id,
          is_active,
          sort_order,
          created_at,
          updated_at
        `)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error loading all highlights:', error);
        throw new Error(`Failed to load highlights: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error loading all highlights:', error);
      throw error;
    }
  }

  /**
   * Create new highlight
   */
  async createHighlight(highlightData: any): Promise<any> {
    try {
      // Get the next sort order
      const { data: maxSort, error: sortError } = await supabase
        .from('home_highlights')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single();

      const nextSortOrder = maxSort?.sort_order ? maxSort.sort_order + 1 : 1;

      const { data, error } = await supabase
        .from('home_highlights')
        .insert({
          ...highlightData,
          sort_order: nextSortOrder,
          is_active: highlightData.is_active ?? true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating highlight:', error);
        throw new Error(`Failed to create highlight: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating highlight:', error);
      throw error;
    }
  }

  /**
   * Update existing highlight
   */
  async updateHighlight(id: string, updateData: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('home_highlights')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating highlight:', error);
        throw new Error(`Failed to update highlight: ${error.message}`);
      }

      if (!data) {
        throw new Error('Highlight not found');
      }

      return data;
    } catch (error) {
      console.error('Error updating highlight:', error);
      throw error;
    }
  }

  /**
   * Delete highlight
   */
  async deleteHighlight(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('home_highlights')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting highlight:', error);
        throw new Error(`Failed to delete highlight: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting highlight:', error);
      throw error;
    }
  }

  /**
   * Toggle highlight active status
   */
  async toggleHighlightStatus(id: string): Promise<any> {
    try {
      // First get current status
      const { data: current, error: fetchError } = await supabase
        .from('home_highlights')
        .select('is_active')
        .eq('id', id)
        .single();

      if (fetchError || !current) {
        throw new Error('Highlight not found');
      }

      // Toggle the status
      const { data, error } = await supabase
        .from('home_highlights')
        .update({
          is_active: !current.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling highlight status:', error);
        throw new Error(`Failed to toggle highlight status: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error toggling highlight status:', error);
      throw error;
    }
  }

  /**
   * Reorder highlights
   */
  async reorderHighlights(highlights: Array<{id: string, sort_order: number}>): Promise<void> {
    try {
      // Update all highlights in a transaction-like manner
      const updates = highlights.map(highlight => 
        supabase
          .from('home_highlights')
          .update({ 
            sort_order: highlight.sort_order,
            updated_at: new Date().toISOString()
          })
          .eq('id', highlight.id)
      );

      const results = await Promise.all(updates);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Error reordering highlights:', errors[0].error);
        throw new Error(`Failed to reorder highlights: ${errors[0].error?.message || 'Unknown error'}`);
      }

    } catch (error) {
      console.error('Error reordering highlights:', error);
      throw error;
    }
  }
}