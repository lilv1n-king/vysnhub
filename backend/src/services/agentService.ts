import OpenAI from 'openai';
import dotenv from 'dotenv';
import { Product } from '../config/database';
import { RequestType } from './gptService';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AgentResponse {
  content: string;
  suggestedFollowUps?: string[];
  metadata?: Record<string, any>;
}

export class AgentService {
  /**
   * Verarbeitet die Antwort basierend auf dem Request-Typ und den gefundenen Produkten
   */
  async processRequest(
    requestType: RequestType,
    userMessage: string,
    products: Product[],
    context?: string[]
  ): Promise<AgentResponse> {
    switch (requestType) {
      case 'produktempfehlung':
        return this.handleProductRecommendation(userMessage, products, context);
      case 'produktfrage':
        return this.handleProductQuestion(userMessage, products, context);
      case 'produktvergleich':
        return this.handleProductComparison(userMessage, products, context);
      case 'aehnliche_produktsuche':
        return this.handleSimilarProductSearch(userMessage, products, context);
      default:
        throw new Error(`Unbekannter Request-Typ: ${requestType}`);
    }
  }

  private async handleProductRecommendation(
    userMessage: string,
    products: Product[],
    context?: string[]
  ): Promise<AgentResponse> {
    const systemPrompt = `Du bist ein Beleuchtungsexperte. Analysiere die Benutzeranfrage und gehe spezifisch darauf ein.

Benutzeranfrage: "${userMessage}"

WICHTIG für CCT (Farbtemperatur):
- Prüfe BEIDE Spalten: 'cct' UND 'cct_switch_value' 
- Wenn cct_display verfügbar ist, verwende diese Information
- 3000K = warmweiß, 4000K = neutralweiß
- CCT-Switch = schaltbare Farbtemperatur

Aufgaben:
- Verstehe was der Nutzer WIRKLICH sucht (z.B. "günstigere" = Preis ist wichtig)
- Beantworte die spezifische Frage direkt
- Zeige CCT-Informationen wenn nach Farbtemperatur gefragt wird
- Maximal 2-3 Sätze pro Produkt
- Fokus auf relevante Features für die Anfrage
- Direkt zum Punkt

Antworte intelligent und passend zur Frage auf Deutsch.`;

    return this.generateResponse(systemPrompt, userMessage, products, context, [
      "Können Sie mir mehr über [Produkt] erzählen?",
      "Gibt es günstigere Alternativen?",
      "Was sind die wichtigsten Unterschiede zwischen diesen Produkten?"
    ]);
  }

  private async handleProductQuestion(
    userMessage: string,
    products: Product[],
    context?: string[]
  ): Promise<AgentResponse> {
    const systemPrompt = `Du bist ein Produktexperte. Beantworte spezifische Fragen zu Produkten basierend auf den verfügbaren Informationen.

Richtlinien:
- Gib detaillierte, sachliche Antworten
- Wenn Informationen fehlen, sage das ehrlich
- Verweise auf spezifische Produkteigenschaften
- Biete zusätzliche relevante Informationen an

Antworte präzise und informativ auf Deutsch.`;

    return this.generateResponse(systemPrompt, userMessage, products, context, [
      "Gibt es noch andere Fragen zu diesem Produkt?",
      "Möchten Sie ähnliche Produkte sehen?",
      "Soll ich Ihnen Alternativen vorschlagen?"
    ]);
  }

  private async handleProductComparison(
    userMessage: string,
    products: Product[],
    context?: string[]
  ): Promise<AgentResponse> {
    const systemPrompt = `Du bist ein Produktvergleichs-Experte. Erstelle detaillierte Vergleiche zwischen Produkten.

Richtlinien:
- Erstelle übersichtliche Vergleichstabellen
- Hebe Stärken und Schwächen hervor
- Berücksichtige verschiedene Nutzungsszenarien
- Gib klare Kaufempfehlungen basierend auf Bedürfnissen
- Verwende Markdown für bessere Lesbarkeit

Antworte strukturiert und objektiv auf Deutsch.`;

    return this.generateResponse(systemPrompt, userMessage, products, context, [
      "Welches Produkt passt besser für [spezifische Nutzung]?",
      "Gibt es weitere Produkte, die ich vergleichen sollte?",
      "Was sind die wichtigsten Entscheidungskriterien?"
    ]);
  }

  private async handleSimilarProductSearch(
    userMessage: string,
    products: Product[],
    context?: string[]
  ): Promise<AgentResponse> {
    const systemPrompt = `Du bist ein Experte für die Suche ähnlicher Produkte. Präsentiere ähnliche Produkte mit Fokus auf Gemeinsamkeiten und Unterschiede.

Richtlinien:
- Erkläre, warum die Produkte ähnlich sind
- Hebe einzigartige Features hervor
- Sortiere nach Ähnlichkeit
- Erwähne Preis- und Qualitätsunterschiede
- Berücksichtige verschiedene Budgets

Antworte hilfreich und vergleichend auf Deutsch.`;

    return this.generateResponse(systemPrompt, userMessage, products, context, [
      "Zeigen Sie mir mehr Details zu [Produkt]",
      "Gibt es auch günstigere ähnliche Optionen?",
      "Was sind die Hauptunterschiede zwischen diesen ähnlichen Produkten?"
    ]);
  }

  private async generateResponse(
    systemPrompt: string,
    userMessage: string,
    products: Product[],
    context?: string[],
    suggestedFollowUps?: string[]
  ): Promise<AgentResponse> {
    // Stelle sicher, dass products ein Array ist und debugge was übergeben wird
    console.log('AgentService.generateResponse - products type:', typeof products, 'isArray:', Array.isArray(products));
    console.log('AgentService.generateResponse - products length:', products?.length || 'no length property');
    
    const productArray = Array.isArray(products) ? products : (products ? [products] : []);
    console.log('AgentService.generateResponse - productArray length:', productArray.length);
    
            const productInfo = productArray.map(p => {
            // CCT-Information aus beiden Spalten sammeln
            let cctInfo = '';
            if (p.cct) {
                cctInfo = `${p.cct}K (fest)`;
            }
            if (p.cct_switch_value) {
                const switchInfo = `CCT-Switch: ${p.cct_switch_value}`;
                cctInfo = cctInfo ? `${cctInfo} + ${switchInfo}` : switchInfo;
            }
            
            return {
                name: p.vysn_name || p.short_description,
                description: p.long_description || p.short_description,
                category: p.category_1,
                category_2: p.category_2,
                group_name: p.group_name,
                price: p.gross_price,
                availability: p.availability,
                // Beleuchtungs-spezifische Eigenschaften
                lumen: p.lumen,
                wattage: p.wattage,
                cct: p.cct,
                cct_switch_value: p.cct_switch_value,
                cct_complete: cctInfo || 'CCT nicht verfügbar', // Kombinierte CCT-Info
                cri: p.cri,
                beam_angle: p.beam_angle,
                energy_class: p.energy_class,
                ingress_protection: p.ingress_protection,
                housing_color: p.housing_color,
                material: p.material
            };
        });

    const userPrompt = `Benutzeranfrage: "${userMessage}"

Verfügbare Produkte:
${JSON.stringify(productInfo, null, 2)}

${context ? `Vorheriger Kontext: ${context.join('\n')}` : ''}`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return {
        content: response.choices[0].message.content || 'Entschuldigung, ich konnte keine Antwort generieren.',
        suggestedFollowUps,
        metadata: {
          productCount: products.length,
          processingTime: Date.now()
        }
      };
    } catch (error) {
      console.error('Fehler bei der Agent-Antwort-Generierung:', error);
      throw new Error('Antwort-Generierung fehlgeschlagen');
    }
  }
} 