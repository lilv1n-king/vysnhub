import { apiService } from './apiService';
import { API_BASE_URL } from '../config/api';
import { 
  HomeEvent, 
  HomeHighlight, 
  HomeContentResponse, 
  HomeEventsResponse, 
  HomeHighlightsResponse 
} from '../types/homeContent';

export class HomeContentService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get all home screen content (events + highlights)
   * @param language - Language code ('de' or 'en'), defaults to 'de'
   */
  async getHomeContent(language: string = 'de'): Promise<HomeContentResponse> {
    try {
      const response = await apiService.get<HomeContentResponse>(`/api/home-content?lang=${language}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to load home content');
    } catch (error) {
      console.error('Error loading home content:', error);
      throw error;
    }
  }

  /**
   * Get active events for home screen
   */
  async getEvents(): Promise<HomeEvent[]> {
    try {
      const response = await apiService.get<HomeEventsResponse>('/api/home-content/events');
      
      if (response.success && response.data) {
        return response.data.events;
      }
      
      throw new Error(response.message || 'Failed to load events');
    } catch (error) {
      console.error('Error loading events:', error);
      throw error;
    }
  }

  /**
   * Get active highlights for home screen
   * @param language - Language code ('de' or 'en'), defaults to 'de'
   */
  async getHighlights(language: string = 'de'): Promise<HomeHighlight[]> {
    try {
      const response = await apiService.get<HomeHighlightsResponse>(`/api/home-content/highlights?lang=${language}`);
      
      if (response.success && response.data) {
        return response.data.highlights;
      }
      
      throw new Error(response.message || 'Failed to load highlights');
    } catch (error) {
      console.error('Error loading highlights:', error);
      throw error;
    }
  }

  /**
   * Format event date for display
   */
  formatEventDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }

  /**
   * Get event type display text
   */
  getEventTypeText(eventType: string): string {
    const eventTypeMap: Record<string, string> = {
      'networking': 'Networking Event',
      'training': 'Schulung',
      'product_launch': 'Produktvorstellung',
      'conference': 'Konferenz',
      'webinar': 'Webinar'
    };

    return eventTypeMap[eventType] || eventType;
  }

  /**
   * Get badge style based on badge type
   */
  getBadgeStyle(badgeType?: string) {
    switch (badgeType) {
      case 'new_release':
        return {
          backgroundColor: '#f3f4f6',
          color: '#000000'
        };
      case 'new_product':
        return {
          backgroundColor: '#dcfce7',
          color: '#16a34a'
        };
      default:
        return {
          backgroundColor: '#f3f4f6',
          color: '#000000'
        };
    }
  }

  /**
   * Check if event is upcoming
   */
  isEventUpcoming(startDateTime: string): boolean {
    const eventDate = new Date(startDateTime);
    const now = new Date();
    return eventDate > now;
  }

  /**
   * Get time until event starts
   */
  getTimeUntilEvent(startDateTime: string): string {
    const eventDate = new Date(startDateTime);
    const now = new Date();
    const diffMs = eventDate.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return 'Event läuft bereits';
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `In ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
    } else if (diffHours > 0) {
      return `In ${diffHours} Stunde${diffHours > 1 ? 'n' : ''}`;
    } else {
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `In ${diffMinutes} Minute${diffMinutes > 1 ? 'n' : ''}`;
    }
  }
}

// Export singleton instance
export const homeContentService = new HomeContentService();