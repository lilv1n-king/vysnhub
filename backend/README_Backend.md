# VYSN Chatbot Backend

## Übersicht

Das VYSN Chatbot Backend implementiert eine filterlogik-basierte Produktsuche speziell für **VYSN Beleuchtungsprodukte** anstelle von Embeddings. Das System klassifiziert Benutzeranfragen automatisch und generiert entsprechende SQL-Queries für die Produktsuche basierend auf 67 spezifischen Produkteigenschaften.

## Produktdaten

Das System arbeitet mit **383 VYSN Beleuchtungsprodukten** aus der Excel-Datei `Data_English_17.07.2025_s.xlsx` mit folgenden Kategorien:
- LED-Spots und Einbauleuchten
- LED-Streifen und -Module
- Außenbeleuchtung
- Professionelle Beleuchtungslösungen

### Wichtige Produkteigenschaften:
- **Lichtleistung**: Lumen, Wattage, Lumen/Watt
- **Farbparameter**: CCT (Farbtemperatur), CRI (Farbwiedergabe)
- **Technische Daten**: Abstrahlwinkel, IP-Schutzklasse, Energieeffizienz
- **Physische Eigenschaften**: Abmessungen, Gewicht, Gehäusefarbe
- **Installation**: Installationsart, Sockel, Verkabelung

## Architektur

### Workflow
1. **Anfrageklassifizierung**: GPT analysiert die Benutzeranfrage und kategorisiert sie
2. **SQL-Generierung**: GPT erstellt beleuchtungsspezifische SQL-Queries
3. **Produktsuche**: Query wird in Supabase ausgeführt
4. **Agent-Verarbeitung**: Spezialisierte Agents für Beleuchtungsberatung
5. **Kontext-Management**: Chat-Verlauf wird für Follow-up-Nachrichten gespeichert

### Anfragetypen
- **produktempfehlung**: "Ich brauche LED-Spots für mein Wohnzimmer"
- **produktfrage**: "Wie viel Lumen hat die VYSN LED-123?"
- **produktvergleich**: "Was ist der Unterschied zwischen warmweiß und kaltweiß?"
- **aehnliche_produktsuche**: "Gibt es ähnliche Produkte wie die LED-Streifen XYZ?"

## Setup

### 1. Abhängigkeiten installieren
```bash
npm install
```

### 2. Umgebungsvariablen konfigurieren
Erstelle eine `.env` Datei:
```env
PORT=3001
NODE_ENV=development
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Datenbank Setup
```bash
# Führe das korrekte Schema in Supabase aus
cat supabase_schema_products_real.sql
```

### 4. Produktdaten importieren
```bash
# Installiere Python-Dependencies
pip3 install pandas openpyxl supabase

# Setze Umgebungsvariablen
export SUPABASE_URL="your_supabase_url"
export SUPABASE_ANON_KEY="your_supabase_key"

# Importiere Excel-Daten
python3 import_excel_to_supabase.py
```

### 5. Server starten
```bash
# Entwicklung
npm run dev

# Produktion
npm run build
npm start
```

## API Endpoints

### Chat Endpoints

#### POST `/api/chat/message`
Hauptendpoint für beleuchtungsspezifische Chat-Anfragen.

**Request:**
```json
{
  "message": "Ich suche warmweiße LED-Spots für die Küche mit mindestens 500 Lumen",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "response": "Hier sind passende warmweiße LED-Spots für Ihre Küche...",
  "sessionId": "uuid-session-id",
  "requestType": "produktempfehlung",
  "suggestedFollowUps": [
    "Welche IP-Schutzklasse brauche ich für die Küche?",
    "Sind diese Spots dimmbar?"
  ],
  "metadata": {
    "confidence": 0.95,
    "productCount": 5,
    "reasoning": "Nutzer sucht spezifische Beleuchtung mit Lumen- und Farbtemperatur-Anforderungen"
  }
}
```

### Product Endpoints

#### GET `/api/products/search?q=LED&limit=20`
Textsuche in Produktnamen und Beschreibungen.

#### GET `/api/products/:id`
Einzelnes Produkt nach ID.

#### GET `/api/products/item/:itemNumber`
Produkt nach VYSN Artikelnummer.

#### POST `/api/products/search/lighting`
Erweiterte Beleuchtungssuche mit Filtern:
```json
{
  "minLumen": 500,
  "maxLumen": 2000,
  "cct": 3000,
  "minCri": 80,
  "energyClass": "A+",
  "ingressProtection": "IP44",
  "housingColor": "white",
  "category": "Spotlights"
}
```

#### GET `/api/products/meta/categories`
Verfügbare Hauptkategorien.

#### GET `/api/products/meta/colors`
Verfügbare Gehäusefarben.

#### GET `/api/products/meta/energy-classes`
Verfügbare Energieeffizienzklassen.

## Verwendungsbeispiele

### Beispiel 1: Produktempfehlung
```bash
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Ich brauche energiesparende LED-Spots für das Badezimmer"}'
```

### Beispiel 2: Technische Anfrage  
```bash
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Was bedeutet CCT 4000K und welche Produkte haben das?"}'
```

### Beispiel 3: Erweiterte Suche
```bash
curl -X POST http://localhost:3001/api/products/search/lighting \
  -H "Content-Type: application/json" \
  -d '{
    "minLumen": 800,
    "cct": 3000,
    "ingressProtection": "IP65",
    "maxPrice": 50
  }'
```

## Beleuchtungs-Features

### Intelligente Terminologie-Erkennung
- **"warmweiß"** → CCT 2700-3500K
- **"neutralweiß"** → CCT 3500-5000K  
- **"kaltweiß"** → CCT 5000-6500K
- **"dimmbar"** → Prüfung von operating_mode
- **"Außenbereich"** → IP65 oder höher
- **"energiesparend"** → Hohe Lumen/Watt-Ratio

### Produktvergleich
```bash
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Vergleiche LED-Spots mit 10W und 15W Leistung"}'
```

### Ähnliche Produkte
```bash
curl -X GET http://localhost:3001/api/products/123/similar?limit=5
```

## Datenbank-Schema

### Haupttabellen
- **products**: 67 Spalten mit allen VYSN-Produktdaten
- **chat_sessions**: Session-Management
- **chat_messages**: Chat-Verlauf mit Kontext

### Wichtige Produktspalten
```sql
-- Identifikation
vysn_name, item_number_vysn, short_description, long_description

-- Beleuchtung
lumen, wattage, cct, cri, beam_angle, energy_class

-- Schutz & Installation  
ingress_protection, installation, base_socket

-- Preise & Verfügbarkeit
gross_price, availability, katalog_q4_24
```

## Service-Details

### GPTService
- **Beleuchtungs-Terminologie**: Versteht Fachbegriffe wie "warmweiß", "IP65"
- **SQL-Generierung**: Erstellt komplexe Queries für Lumen, CCT, IP-Klassen
- **Kontext-Bewusstsein**: Berücksichtigt vorherige Anfragen

### AgentService
- **Beleuchtungsberatung**: Spezialisiert auf LED-Technologie
- **Technische Details**: Erklärt Lumen, CCT, CRI, IP-Schutzklassen
- **Anwendungsberatung**: Empfehlungen für Innen-/Außenbereich

### ProductService
- **Erweiterte Filter**: Lumen-Bereiche, Farbtemperatur, Schutzklassen
- **Ähnlichkeitssuche**: Basierend auf Kategorie, Wattage, Lumen
- **Metadaten**: Kategorien, Farben, Energieeffizienzklassen

## Beleuchtungs-Glossar

| Begriff | Bedeutung | Beispielwerte |
|---------|-----------|---------------|
| **Lumen** | Lichtstrom | 200-5000 lm |
| **CCT** | Farbtemperatur | 2700K, 4000K, 6500K |
| **CRI** | Farbwiedergabeindex | 80, 90, 95 |
| **IP-Schutzklasse** | Schutz vor Staub/Wasser | IP20, IP44, IP65 |
| **UGR** | Blendwert | <19 (blendfrei) |
| **Abstrahlwinkel** | Beam Angle | 15°, 30°, 60° |

## Performance & Optimierung

### Datenbankindizes
- Volltext-Suche für deutsche Produktbeschreibungen
- Bereichssuchen für Lumen, Wattage, Preis
- Kategorien- und Farbfilter

### Caching-Strategien
- Metadaten (Kategorien, Farben) werden gecacht
- SQL-Query-Optimierung für Beleuchtungsfilter
- Session-basierte Kontext-Speicherung

## Troubleshooting

### Häufige Beleuchtungs-Anfragen

**"Keine Produkte gefunden für warmes Licht"**
- System konvertiert automatisch zu CCT 2700-3500K
- Fallback auf Textsuche wenn SQL fehlschlägt

**"IP-Schutzklasse wird nicht erkannt"**
- Nutze exakte Bezeichnungen: "IP44", "IP65"
- Alternativ: "wasserdicht", "spritzwassergeschützt"

**"Lumen-Bereiche zu restriktiv"**
- System verwendet ±30% Toleranz für Ähnlichkeitssuche
- Manuelle Bereichssuche über `/api/products/search/lighting`

## Deployment

### Produktionsumgebung
```bash
# Docker-Container (optional)
docker build -t vysn-chatbot .
docker run -p 3001:3001 --env-file .env vysn-chatbot

# PM2 für Node.js
npm install -g pm2
pm2 start dist/server.js --name "vysn-chatbot"
```

### Monitoring
- Logging für alle GPT-Klassifizierungen
- SQL-Query-Performance-Tracking
- Chat-Session-Statistiken

Das Backend ist nun vollständig auf VYSN Beleuchtungsprodukte ausgerichtet und bereit für den produktiven Einsatz! 🔦✨ 