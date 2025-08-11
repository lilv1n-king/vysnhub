import { createClient } from '@supabase/supabase-js';
import { VysnProductDB } from '../types/product';

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
  product_id?: number;
  sort_order: number;
  created_at: string;
  product?: VysnProductDB;
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
   */
  async getActiveHighlights(): Promise<HomeHighlight[]> {
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
}