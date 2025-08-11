import { VysnProduct } from './product';

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
  badge_type?: 'new_release' | 'new_product' | 'featured' | 'catalog' | 'event';
  image_url?: string;
  button_text?: string;
  
  // Navigation/Action configuration
  action_type?: 'product' | 'external_link' | 'internal_link' | 'download' | 'none';
  action_params?: {
    // For product navigation
    product_id?: number;
    item_number?: string;
    
    // For external links
    url?: string;
    
    // For internal navigation
    screen?: string;
    params?: any;
    
    // For downloads
    filename?: string;
  };
  
  // Legacy field for backward compatibility
  product_id?: number;
  sort_order: number;
  created_at: string;
  product?: VysnProduct;
}

export interface HomeContentResponse {
  events: HomeEvent[];
  highlights: HomeHighlight[];
  totalEvents: number;
  totalHighlights: number;
}

export interface HomeEventsResponse {
  events: HomeEvent[];
  count: number;
}

export interface HomeHighlightsResponse {
  highlights: HomeHighlight[];
  count: number;
}