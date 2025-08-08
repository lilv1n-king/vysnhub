import { v4 as uuidv4 } from 'uuid';
import { supabase, ChatMessage } from '../config/database';

export class ChatService {
  /**
   * Erstellt eine neue Chat-Session
   */
  async createSession(): Promise<string> {
    const sessionId = uuidv4();
    
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .insert({
          id: sessionId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Fehler beim Erstellen der Session:', error);
        throw new Error('Session konnte nicht erstellt werden');
      }

      return sessionId;
    } catch (error) {
      console.error('Fehler beim Erstellen der Chat-Session:', error);
      throw error;
    }
  }

  /**
   * Speichert eine Chat-Nachricht
   */
  async saveMessage(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
    const messageWithId: ChatMessage = {
      ...message,
      id: uuidv4()
    };

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messageWithId)
        .select()
        .single();

      if (error) {
        console.error('Fehler beim Speichern der Nachricht:', error);
        throw new Error('Nachricht konnte nicht gespeichert werden');
      }

      return data;
    } catch (error) {
      console.error('Fehler beim Speichern der Chat-Nachricht:', error);
      throw error;
    }
  }

  /**
   * Lädt den Chat-Verlauf für eine Session
   */
  async getChatHistory(sessionId: string, limit: number = 10): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Fehler beim Laden des Chat-Verlaufs:', error);
        throw new Error('Chat-Verlauf konnte nicht geladen werden');
      }

      return data || [];
    } catch (error) {
      console.error('Fehler beim Laden des Chat-Verlaufs:', error);
      throw error;
    }
  }

  /**
   * Extrahiert den Kontext aus den letzten Nachrichten
   */
  extractContext(messages: ChatMessage[]): string[] {
    return messages
      .filter(msg => msg.role === 'user')
      .slice(-3) // Letzte 3 Benutzer-Nachrichten
      .map(msg => msg.content);
  }

  /**
   * Überprüft, ob eine Session existiert
   */
  async sessionExists(sessionId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('id', sessionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return false; // Session nicht gefunden
        }
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Fehler beim Überprüfen der Session:', error);
      return false;
    }
  }

  /**
   * Aktualisiert das updated_at Feld einer Session
   */
  async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) {
        console.error('Fehler beim Aktualisieren der Session-Aktivität:', error);
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Session-Aktivität:', error);
    }
  }
} 