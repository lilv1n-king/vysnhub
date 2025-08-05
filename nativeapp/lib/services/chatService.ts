import { apiService } from './apiService';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  supportContact?: boolean;
  error?: boolean;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  response: string;
  sessionId: string;
  requestType: string;
  suggestedFollowUps?: string[];
  supportContact?: boolean;
  metadata?: {
    confidence?: number;
    productCount?: number;
    reasoning?: string;
    error?: boolean;
    timestamp?: string;
  };
}

export interface ChatHistoryResponse {
  history: Array<{
    id: string;
    session_id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    request_type?: string;
    metadata?: any;
  }>;
}

export class ChatService {
  private currentSessionId: string | null = null;

  /**
   * Send a message to the backend chat API
   */
  async sendMessage(message: string, sessionId?: string): Promise<{
    response: ChatResponse;
    messages: ChatMessage[];
  }> {
    try {
      if (!message.trim()) {
        throw new Error('Message cannot be empty');
      }

      const requestData: ChatRequest = {
        message: message.trim(),
        sessionId: sessionId || this.currentSessionId || undefined
      };

      // Use direct fetch since backend returns data directly (not wrapped in ApiResponse)
      const url = `${API_BASE_URL}${API_ENDPOINTS.CHAT}/message`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add auth token if available
      const authToken = apiService.getAuthToken();
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
      }

      const data: ChatResponse = await response.json();

      if (!data) {
        throw new Error('No response data received');
      }

      // Update current session ID
      this.currentSessionId = data.sessionId;

      // Convert backend response to our message format
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: message,
        sender: 'user',
        timestamp: new Date()
      };

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'ai',
        timestamp: new Date(),
        supportContact: data.supportContact,
        error: data.metadata?.error || false
      };

      return {
        response: data,
        messages: [userMessage, aiMessage]
      };
    } catch (error) {
      console.error('Chat service error:', error);
      throw new Error(
        error instanceof Error 
          ? `Chat request failed: ${error.message}`
          : 'Failed to send message'
      );
    }
  }

  /**
   * Create a new chat session
   */
  async createSession(): Promise<string> {
    try {
      // Use direct fetch since backend returns data directly (not wrapped in ApiResponse)
      const url = `${API_BASE_URL}${API_ENDPOINTS.CHAT}/session`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add auth token if available
      const authToken = apiService.getAuthToken();
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      console.log('Creating chat session at:', url);
      console.log('Headers:', headers);

      const response = await fetch(url, {
        method: 'POST',
        headers
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Session creation failed:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      console.log('Session response data:', data);

      if (!data?.sessionId) {
        console.error('Unexpected response format:', data);
        throw new Error('No session ID received');
      }

      this.currentSessionId = data.sessionId;
      console.log('Chat session created successfully:', data.sessionId);
      return data.sessionId;
    } catch (error) {
      console.error('Failed to create chat session:', error);
      throw new Error('Failed to create chat session');
    }
  }

  /**
   * Load chat history for a session
   */
  async getChatHistory(sessionId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      // Use direct fetch since backend returns data directly (not wrapped in ApiResponse)
      const url = `${API_BASE_URL}${API_ENDPOINTS.CHAT}/history/${sessionId}?limit=${limit}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add auth token if available
      const authToken = apiService.getAuthToken();
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to load chat history:', errorData);
        return [];
      }

      const data: ChatHistoryResponse = await response.json();

      if (!data?.history) {
        return [];
      }

      // Convert backend format to our message format
      return data.history.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.role === 'assistant' ? 'ai' : 'user',
        timestamp: new Date(msg.timestamp)
      }));
    } catch (error) {
      console.error('Failed to load chat history:', error);
      return [];
    }
  }

  /**
   * Get current session ID
   */
  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  /**
   * Set current session ID
   */
  setCurrentSessionId(sessionId: string | null): void {
    this.currentSessionId = sessionId;
  }

  /**
   * Clear current session
   */
  clearSession(): void {
    this.currentSessionId = null;
  }

  /**
   * Check if backend is available
   */
  async checkBackendHealth(): Promise<boolean> {
    try {
      return await apiService.checkHealth();
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const chatService = new ChatService();