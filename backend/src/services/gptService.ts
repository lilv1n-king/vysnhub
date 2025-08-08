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

export class GPTService {
  /**
   * Klassifiziert die Benutzeranfrage in eine der vier Kategorien
   */
  async classifyRequest(userMessage: string, context?: string[]): Promise<ClassificationResult> {
    const systemPrompt = `Du bist ein Experte für die Klassifizierung von Produktanfragen für Beleuchtungsprodukte. Analysiere die Benutzeranfrage und klassifiziere sie in eine der folgenden Kategorien:

1. "produktempfehlung" - Nutzer möchte Produktvorschläge basierend auf Bedürfnissen/Kriterien
2. "produktfrage" - Nutzer hat spezifische Fragen zu einem konkreten Produkt (z.B. "ist XYZ dimmbar?")
3. "produktvergleich" - Nutzer möchte Produkte miteinander vergleichen
4. "aehnliche_produktsuche" - Nutzer sucht ähnliche Produkte zu einem bekannten Produkt

Beispiele für Beleuchtungsanfragen:
- "Ich brauche LED-Spots für mein Wohnzimmer" → produktempfehlung
- "Ist Salsa Lid dimmbar?" → produktfrage (spezifisches Produkt + Eigenschaft)
- "Wie viel Lumen hat die VYSN LED-123?" → produktfrage (spezifisches Produkt + Eigenschaft)
- "Was ist der Unterschied zwischen warmweiß und kaltweiß?" → produktvergleich
- "Gibt es ähnliche Produkte wie die LED-Streifen XYZ?" → aehnliche_produktsuche

WICHTIG: Bei Produktfragen immer NUR nach dem Produktnamen suchen, NICHT nach den gefragten Eigenschaften filtern!

Antworte im JSON-Format:
{
  "type": "kategorie",
  "confidence": 0.8,
  "reasoning": "Erklärung der Klassifizierung"
}`;

    const userPrompt = `Benutzeranfrage: "${userMessage}"${context ? `\n\nVorheriger Kontext: ${context.join('\n')}` : ''}`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      });

      const content = response.choices[0].message.content || '{}';
      let result: ClassificationResult;
      
      try {
        // Versuche JSON zu extrahieren falls GPT zusätzlichen Text hinzugefügt hat
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : content;
        result = JSON.parse(jsonString) as ClassificationResult;
      } catch (parseError) {
        console.warn('JSON parsing failed, using fallback:', content);
        // Fallback: Versuche type aus Text zu extrahieren
        const typeMatch = content.match(/produktempfehlung|produktfrage|produktvergleich|ähnliche produktsuche/i);
        result = {
          type: typeMatch ? typeMatch[0].toLowerCase() as any : 'produktempfehlung',
          confidence: 0.5,
          reasoning: 'Fallback due to JSON parsing error'
        };
      }
      return result;
    } catch (error) {
      console.error('Fehler bei der Anfrageklassifizierung:', error);
      throw new Error('Klassifizierung fehlgeschlagen');
    }
  }

  /**
   * Generiert SQL-Query basierend auf der Benutzeranfrage und dem Request-Typ
   */
  async generateSQLQuery(userMessage: string, requestType: RequestType, context?: string[]): Promise<SQLGenerationResult> {
    const systemPrompt = `Du bist ein Experte für SQL-Query-Generierung für VYSN Beleuchtungsprodukte. Basierend auf dem Request-Typ und der Benutzeranfrage, generiere eine SQL-Query für eine PostgreSQL-Datenbank.

Die Produkttabelle "products" hat folgende wichtige Spalten:
- id (integer) - Eindeutige ID
- vysn_name (text) - Produktname bei VYSN
- item_number_vysn (text) - Artikelnummer
- short_description (text) - Kurzbeschreibung
- long_description (text) - Ausführliche Beschreibung
- gross_price (numeric) - Bruttopreis in EUR
- category_1 (text) - Hauptkategorie
- category_2 (text) - Unterkategorie  
- group_name (text) - Gruppenname
- housing_color (text) - Gehäusefarbe
- material (text) - Material

Beleuchtung-spezifische Spalten:
- lumen (numeric) - Lichtstrom in Lumen
- wattage (numeric) - Leistung in Watt
- cct (numeric) - Farbtemperatur in Kelvin (z.B. 3000, 4000, 6500)
- cri (numeric) - Farbwiedergabeindex (0-100)
- beam_angle (numeric) - Abstrahlwinkel in Grad
- energy_class (text) - Energieeffizienzklasse (A++, A+, A, etc.)
- ingress_protection (text) - IP-Schutzklasse (z.B. IP65, IP67)
- led_type (text) - LED-Typ
- lumen_per_watt (numeric) - Lichtausbeute
- light_direction (text) - Lichtrichtung
- ugr (numeric) - Blendwert
- installation (text) - Installationsart
- base_socket (text) - Sockel/Fassung

Physische Eigenschaften:
- weight_kg, diameter_mm, length_mm, width_mm, height_mm
- cable_length_mm, installation_diameter

Request-Typ: ${requestType}

        WICHTIG für Filterlogik:
        - Bei PRODUKTFRAGEN: NUR nach Produktname suchen, NICHT nach den gefragten Eigenschaften filtern!
        - Beispiel: "ist Salsa Lid dimmbar?" → Suche nur "Salsa Lid", nicht nach dimmbar filtern
        - NUR IP-Filter anwenden wenn explizit nach IP-Schutz gefragt wird (z.B. "IP44", "wasserdicht", "Außenbereich")
        - KRITISCH: Wenn nach "Leuchte", "Lampe", "Luminaire" gesucht wird, IMMER Module und Komponenten ausschließen:
        - IMMER verwenden: category_1 NOT IN ('Components', 'Spare parts', 'Accessories') 
        - IMMER verwenden: category_2 NOT IN ('Electrical components', 'Mechanical components', 'LED modules', 'Transformers', 'Control devices')
        - NIEMALS verwenden: die alte Liste ('Components', 'Electrical components', 'LED strips') - das ist unvollständig!
        - Ausnahme: Bei expliziter Suche nach "Modul", "Komponente", "LED Strip" diese Filter NICHT anwenden
        
        CCT (Farbtemperatur) Suche:
- Verfügbare CCT-Werte: 2700K, 3000K, 4000K
- CCT-Switch Optionen: '1800-3000', '2700/3000', '2700/3000/4000', '3000/4000', '4000', '4000/5000'
- "warmweiß" = 2700K, "neutralweiß" = 3000K, "kaltweiß" = 4000K
- "CCT switch" oder "schaltbar" = suche in cct_switch_value Spalte
- "dim to warm" = dimmbar + CCT 1800-3000K (suche in vysn_name UND cct_switch_value)
- "dimmbar" = suche in operating_mode, power_switch_value, vysn_name

LED Strip Suche:
- Nach category_2 ILIKE '%LED strips%' ODER group_name ILIKE '%LED Strip%'
- WICHTIG: Zubehör ausschließen außer bei expliziter Suche nach "Connector", "Verbinder", "Zubehör"
- Ausschluss: vysn_name NOT ILIKE '%connector%' AND vysn_name NOT ILIKE '%feedin%' AND vysn_name NOT ILIKE '%strip2strip%'
        
        Beispiele für korrekte SQL:
        - "3000K Deckenleuchte": (cct = 3000 OR cct_switch_value ILIKE '%3000%') AND category_2 IN ('Recessed ceiling luminaires', 'Surface ceiling luminares') AND category_1 NOT IN ('Components', 'Spare parts') AND category_2 NOT IN ('LED modules', 'Electrical components')
        - "weiße Wandleuchte": housing_color = 'White' AND category_2 = 'Surface wall luminaires' AND category_1 NOT IN ('Components', 'Spare parts') AND category_2 NOT IN ('LED modules', 'Electrical components')
        - "leuchte weiß 3000k": (cct = 3000 OR cct_switch_value ILIKE '%3000%') AND housing_color = 'White' AND category_1 NOT IN ('Components', 'Spare parts') AND category_2 NOT IN ('Electrical components', 'LED modules', 'Transformers')
        
        Beleuchtungs-Terminologie:
- "warmweiß" = CCT zwischen 2700-3500K
- "neutralweiß" = CCT zwischen 3500-5000K  
- "kaltweiß" = CCT zwischen 5000-6500K
- "dimmbar" → prüfe auf operating_mode oder power_switch_value
- "hell" → hohe Lumen-Werte
- "sparsam" → niedrige Wattage, hohe Lumen/Watt
- "Außenbereich" → IP65 oder höher
- "Innenbereich" → IP20, IP44

IP-Schutzklassen (TEXT-Vergleich):
- IP-Schutzklassen sind als Text gespeichert (z.B. "IP20", "IP44", "IP65", "IP67", "IP68")
- Für "mindestens IP44": ingress_protection IN ('IP44', 'IP54', 'IP65', 'IP66', 'IP67', 'IP68')
- Für "mindestens IP65": ingress_protection IN ('IP65', 'IP66', 'IP67', 'IP68')
- Für "mindestens IP20": alle IP-Klassen sind >= IP20
- Häufige IP-Klassen: IP20, IP23, IP44, IP54, IP65, IP66, IP67, IP68

Leuchtentyp-Filter (nach category_2):
WICHTIG: Wenn nach spezifischen Leuchtentypen gesucht wird, IMMER nach category_2 filtern!

Deckenleuchten:
- "deckenleuchte", "ceiling": category_2 IN ('Recessed ceiling luminaires', 'Surface ceiling luminares')
- "einbauleuchte", "recessed": category_2 = 'Recessed ceiling luminaires'  
- "aufbauleuchte", "surface ceiling": category_2 = 'Surface ceiling luminares'

Wandleuchten:
- "wandleuchte", "wall": category_2 IN ('Surface wall luminaires', 'Recessed wall luminaires', 'Surface wall and ceiling luminaires')

Stehleuchten:
- "stehleuchte", "floor": category_2 = 'Floor lamps'

Pendelleuchten:
- "pendelleuchte", "pendant": category_2 = 'Pendant lamps'

Tischleuchten:
- "tischleuchte", "table": category_2 = 'Table lamps'

Außenleuchten:
- "außenleuchte", "outdoor", "garten": category_2 IN ('Inground fittings', 'Spike lights') OR category_1 = 'Outdoor'

Track-System:
- "schienensystem", "track": category_2 LIKE '%track system%'

Generiere eine effiziente SQL-Query und antworte im JSON-Format:
{
  "query": "SELECT * FROM products WHERE ...",
  "parameters": {"param1": "value1"},
  "explanation": "Erklärung der Query-Logik"
}

Verwende Parameter ($1, $2, etc.) für Werte und gib diese im parameters-Objekt zurück.
Limitiere Ergebnisse mit LIMIT (Standard: 20, max: 50).
Sortiere nach Relevanz (z.B. Preis, Lumen, etc.).`;

    const userPrompt = `Benutzeranfrage: "${userMessage}"${context ? `\n\nVorheriger Kontext: ${context.join('\n')}` : ''}`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
      });

      const content = response.choices[0].message.content || '{}';
      let result: SQLGenerationResult;
      
      try {
        // Versuche JSON zu extrahieren falls GPT zusätzlichen Text hinzugefügt hat
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : content;
        result = JSON.parse(jsonString) as SQLGenerationResult;
      } catch (parseError) {
        console.warn('JSON parsing failed for SQL generation:', content);
        // Fallback: Einfache Query basierend auf Request-Typ
        result = {
          query: "SELECT * FROM products WHERE availability = true ORDER BY gross_price ASC LIMIT 20",
          parameters: {},
          explanation: 'Fallback query due to JSON parsing error'
        };
      }
      return result;
    } catch (error) {
      console.error('Fehler bei der SQL-Query-Generierung:', error);
      throw new Error('SQL-Query-Generierung fehlgeschlagen');
    }
  }
} 