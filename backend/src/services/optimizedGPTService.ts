/**
 * Optimierte GPT Service Implementation
 * 
 * Optimierungen:
 * 1. Kürzere, fokussierte Prompts
 * 2. Niedrigere Temperature für schnellere Responses
 * 3. Weniger max_tokens für kürzere Antworten
 * 4. Caching für häufige Pattern
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type RequestType = 'produktempfehlung' | 'produktfrage' | 'produktvergleich' | 'aehnliche_produktsuche';

interface ClassificationResult {
  type: RequestType;
  confidence: number;
  reasoning: string;
}

interface SQLGenerationResult {
  query: string;
  parameters: Record<string, any>;
  explanation: string;
}

export class OptimizedGPTService {
  private classificationCache = new Map<string, ClassificationResult>();
  private sqlCache = new Map<string, SQLGenerationResult>();

  /**
   * Optimierte Klassifizierung mit kürzerem Prompt
   */
  async classifyRequest(userMessage: string, context?: string[]): Promise<ClassificationResult> {
    // Cache check
    const cacheKey = userMessage.slice(0, 100).toLowerCase();
    const cached = this.classificationCache.get(cacheKey);
    if (cached) return cached;

    // Stark verkürzter Prompt
    const systemPrompt = `Klassifiziere Beleuchtungsanfragen:
1. "produktempfehlung" - Sucht Produktvorschläge
2. "produktfrage" - Fragen zu spezifischen Produkten  
3. "produktvergleich" - Vergleicht Produkte
4. "aehnliche_produktsuche" - Sucht ähnliche Produkte

Beispiele:
"LED Spots für Wohnzimmer" → produktempfehlung
"Wie viel Lumen hat XYZ?" → produktfrage
"Unterschied zwischen A und B?" → produktvergleich
"Ähnlich wie LED-Strip XYZ?" → aehnliche_produktsuche

JSON: {"type":"kategorie","confidence":0.9,"reasoning":"kurz"}`;

    const userPrompt = `"${userMessage}"${context ? ` (Kontext: ${context.slice(-1)[0]})` : ''}`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Schnelleres, günstigeres Modell
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1, // Niedrigere Temperature = schneller
        max_tokens: 150,  // Begrenzt auf kurze Antworten
      });

      const result = JSON.parse(response.choices[0].message.content || '{}') as ClassificationResult;
      
      // Cache result
      this.classificationCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Fehler bei der Klassifizierung:', error);
      // Fallback
      return {
        type: 'produktempfehlung',
        confidence: 0.5,
        reasoning: 'Fallback nach Fehler'
      };
    }
  }

  /**
   * Optimierte SQL-Generierung mit Templates
   */
  async generateSQLQuery(userMessage: string, requestType: RequestType, context?: string[]): Promise<SQLGenerationResult> {
    // Cache check
    const cacheKey = `${userMessage.slice(0, 50)}-${requestType}`;
    const cached = this.sqlCache.get(cacheKey);
    if (cached) return cached;

    // Template-basierte SQL-Generierung für häufige Pattern
    const templateResult = this.tryTemplateSQL(userMessage, requestType);
    if (templateResult) {
      this.sqlCache.set(cacheKey, templateResult);
      return templateResult;
    }

    // Stark verkürzter SQL-Prompt
    const systemPrompt = `Generiere PostgreSQL für VYSN Beleuchtung.

Tabelle "products":
- id, vysn_name, gross_price, category_1, category_2
- lumen, wattage, cct, ingress_protection
- availability (boolean)

IP-Filter: Für "mindestens IP44" → ingress_protection IN ('IP44','IP54','IP65','IP67','IP68')

Leuchtentyp-Filter:
- deckenleuchte: category_2 IN ('Recessed ceiling luminaires','Surface ceiling luminares')
- wandleuchte: category_2 LIKE '%wall%'
- außenleuchte: category_1='Outdoor'

Bei Leuchten-Anfragen: category_1 NOT IN ('Components','Spare parts') AND category_2 NOT IN ('Electrical components','LED modules','Transformers')
Nur verfügbar: availability=true
Sortiert: ORDER BY gross_price ASC
Limit: LIMIT 20

JSON: {"query":"SELECT...","parameters":{},"explanation":"kurz"}`;

    const userPrompt = `${requestType}: "${userMessage}"`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.05, // Sehr niedrig für konsistente SQL
        max_tokens: 300,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}') as SQLGenerationResult;
      
      // Cache result
      this.sqlCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Fehler bei SQL-Generierung:', error);
      // Fallback
      return {
        query: "SELECT * FROM products WHERE availability=true ORDER BY gross_price ASC LIMIT 20",
        parameters: {},
        explanation: "Fallback-Query nach Fehler"
      };
    }
  }

  /**
   * Template-basierte SQL für häufige Pattern (ohne GPT)
   */
  private tryTemplateSQL(userMessage: string, requestType: RequestType): SQLGenerationResult | null {
    const msg = userMessage.toLowerCase();
    
    // Pattern: "deckenleuchte ip44"
    if (msg.includes('deckenleuchte') && msg.includes('ip')) {
      const ipMatch = msg.match(/ip\s*(\d{2})/);
      const ipClass = ipMatch ? `IP${ipMatch[1]}` : 'IP44';
      
      return {
        query: `SELECT * FROM products 
                WHERE category_2 IN ('Recessed ceiling luminaires', 'Surface ceiling luminares')
                AND category_1 NOT IN ('Components', 'Spare parts')
                AND category_2 NOT IN ('LED modules', 'Electrical components')
                AND ingress_protection IN ('${this.getIPList(ipClass).join("','")}')
                AND availability=true 
                ORDER BY gross_price ASC LIMIT 20`,
        parameters: {},
        explanation: `Template: Deckenleuchten (ohne Module) mit mindestens ${ipClass}`
      };
    }
    
    // Pattern: "wandleuchte ip65"
    if (msg.includes('wandleuchte') && msg.includes('ip')) {
      const ipMatch = msg.match(/ip\s*(\d{2})/);
      const ipClass = ipMatch ? `IP${ipMatch[1]}` : 'IP65';
      
      return {
        query: `SELECT * FROM products 
                WHERE category_2 LIKE '%wall%'
                AND category_1 NOT IN ('Components', 'Spare parts')
                AND category_2 NOT IN ('LED modules', 'Electrical components')
                AND ingress_protection IN ('${this.getIPList(ipClass).join("','")}')
                AND availability=true 
                ORDER BY gross_price ASC LIMIT 20`,
        parameters: {},
        explanation: `Template: Wandleuchten (ohne Module) mit mindestens ${ipClass}`
      };
    }
    
    // Pattern: nur IP-Klasse mit Leuchten
    if ((msg.includes('leuchte') || msg.includes('licht')) && msg.includes('ip')) {
      const ipMatch = msg.match(/ip\s*(\d{2})/);
      const ipClass = ipMatch ? `IP${ipMatch[1]}` : 'IP44';
      
      return {
        query: `SELECT * FROM products 
                WHERE category_1 NOT IN ('Components', 'Spare parts')
                AND category_2 NOT IN ('Electrical components', 'LED modules', 'Transformers', 'Control devices')
                AND ingress_protection IN ('${this.getIPList(ipClass).join("','")}')
                AND availability=true 
                ORDER BY gross_price ASC LIMIT 20`,
        parameters: {},
        explanation: `Template: Leuchten (ohne Module) mit mindestens ${ipClass}`
      };
    }
    
    return null;
  }

  /**
   * Hilfsfunktion für IP-Listen
   */
  private getIPList(minIP: string): string[] {
    const allIPs = ['IP20', 'IP23', 'IP44', 'IP54', 'IP65', 'IP67', 'IP68'];
    const minLevel = this.getIPLevel(minIP);
    
    return allIPs.filter(ip => this.getIPLevel(ip) >= minLevel);
  }

  private getIPLevel(ip: string): number {
    const levels = { 'IP20': 1, 'IP23': 2, 'IP44': 3, 'IP54': 4, 'IP65': 5, 'IP67': 6, 'IP68': 7 };
    return levels[ip as keyof typeof levels] || 3;
  }

  /**
   * Cache-Cleanup
   */
  public clearCache(): void {
    this.classificationCache.clear();
    this.sqlCache.clear();
  }

  public getCacheStats(): { classification: number; sql: number } {
    return {
      classification: this.classificationCache.size,
      sql: this.sqlCache.size
    };
  }
}