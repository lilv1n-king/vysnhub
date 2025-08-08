# 📦 VYSN Hub Order Management System

## Überblick

Das Order Management System speichert alle Bestellungen automatisch in der Datenbank und versendet professionelle E-Mails mit Bestellnummern.

## 🎯 Features

- ✅ **Automatische Order-Speicherung** beim Email-Versand
- ✅ **Eindeutige Bestellnummern** (Format: VY24120X-XXXX)
- ✅ **Order + OrderItems Tabellen** mit vollständiger Produkthistorie
- ✅ **Status-Management** (pending, confirmed, processing, shipped, delivered, cancelled, refunded)
- ✅ **Email-Integration** mit Order-Nummer im Betreff
- ✅ **DSGVO-konforme Speicherung** mit RLS (Row Level Security)
- ✅ **API-Endpoints** für Order-Management
- ✅ **Fehlerbehandlung** bei Email-Problemen

## 📊 Datenbank-Schema

### Orders Tabelle
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    project_id UUID REFERENCES user_projects(id),
    
    -- Order Information
    order_number TEXT UNIQUE NOT NULL,        -- VY24120X-XXXX
    order_status TEXT DEFAULT 'pending',      -- Status-Tracking
    order_type TEXT DEFAULT 'standard',       -- Bestelltyp
    
    -- Financial
    subtotal NUMERIC(12,2) NOT NULL,
    discount_amount NUMERIC(12,2),
    tax_amount NUMERIC(12,2),
    shipping_cost NUMERIC(12,2),
    total_amount NUMERIC(12,2) NOT NULL,
    
    -- Customer/Internal Notes
    customer_notes TEXT,
    internal_notes TEXT,
    
    -- Timestamps
    order_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Order Items Tabelle
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    
    -- Item Details
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    discount_percentage NUMERIC(5,2),
    line_total NUMERIC(12,2) NOT NULL,
    
    -- Product Snapshot (Historical Data)
    product_name TEXT NOT NULL,
    product_sku TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 Order Flow

### 1. Bestellung über App
```
User klickt "Bestellen" Button 
    → POST /api/email/order
    → Order wird in DB gespeichert
    → Bestellnummer generiert (VY24120X-XXXX)
    → E-Mail mit Order-Details versendet
    → Response mit Order-ID & Nummer
```

### 2. Order States
- **pending**: Neue Bestellung, wartet auf Bearbeitung
- **confirmed**: Bestellung bestätigt, wird bearbeitet
- **processing**: In Bearbeitung/Vorbereitung
- **shipped**: Versandt, Tracking verfügbar
- **delivered**: Zugestellt
- **cancelled**: Storniert (bei Email-Fehlern automatisch)
- **refunded**: Erstattet

## 📧 Email-Integration

### Erweiterte Email-Templates
```typescript
// Subject mit Order-Nummer
"🛒 Neue Bestellung VY24120X-0001: LED Bürobeleuchtung - Max Mustermann"

// HTML-Template enthält:
- 📋 Bestellinformationen (Nummer, ID, Status)
- 👤 Kundeninformationen  
- 📋 Projektdetails
- 📦 Produktliste mit Preisen
- 💰 Gesamtsumme
- 📝 Notizen
- ⏭️ Nächste Schritte
```

### Fehlerbehandlung
```typescript
// Bei Email-Fehler:
1. Order wird trotzdem gespeichert
2. Status wird auf 'cancelled' gesetzt  
3. Internal Notes: "Email sending failed"
4. Response enthält Order-ID für manuellen Versand
```

## 🚀 API Endpoints

### 1. Order Email senden (erweitert)
```http
POST /api/email/order
Authorization: Bearer <token>

{
  "projectId": "abc-123",
  "customerInfo": {
    "name": "Max Mustermann",
    "email": "max@example.com",
    "company": "Mustermann GmbH"
  },
  "orderNotes": "Lieferung bis Ende des Monats"
}
```

**Response (erweitert)**:
```json
{
  "success": true,
  "message": "Order created and email sent successfully",
  "data": {
    "orderId": "uuid-order-id",
    "orderNumber": "VY24120X-0001",
    "projectName": "LED Beleuchtung Büro",
    "productCount": 3,
    "orderTotal": 1250.50,
    "recipient": "levin.normann98@gmail.com"
  }
}
```

### 2. Orders abrufen
```http
GET /api/orders
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "order_number": "VY24120X-0001",
      "order_status": "pending",
      "total_amount": 1250.50,
      "order_date": "2024-12-07T10:30:00Z",
      "project_id": "project-uuid",
      "customer_notes": "Bestellung über VYSN Hub App",
      // ... weitere Felder
    }
  ]
}
```

### 3. Einzelne Order abrufen
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "order_number": "VY24120X-0001",
    "order_status": "pending", 
    "total_amount": 1250.50,
    // ... Order-Felder
    "items": [
      {
        "id": "item-uuid",
        "product_id": 123,
        "quantity": 2,
        "unit_price": 125.00,
        "line_total": 250.00,
        "product_name": "LED Strip V104100T2W",
        "product_sku": "V104100T2W"
      }
    ]
  }
}
```

### 4. Order Status aktualisieren
```http
PUT /api/orders/:id/status
Authorization: Bearer <token>

{
  "status": "confirmed",
  "notes": "Bestellung bestätigt, wird bearbeitet"
}
```

## 🔧 Backend Services

### OrderService
```typescript
class OrderService {
  // Erstellt Order + Items atomisch
  async createOrder(orderData, orderItems, accessToken)
  
  // Lädt Order mit Items
  async getOrderById(orderId, accessToken)
  
  // Lädt alle User Orders
  async getUserOrders(userId, accessToken)
  
  // Status-Update mit automatischen Feldern
  async updateOrderStatus(orderId, status, accessToken, notes?)
  
  // Generiert eindeutige Bestellnummer
  private async generateOrderNumber(): Promise<string>
}
```

### EmailController (erweitert)
```typescript
class EmailController {
  async sendOrderEmail(req, res) {
    // 1. Projekt & Produkte laden
    // 2. Order in DB speichern ✅ 
    // 3. E-Mail mit Order-Nummer senden ✅
    // 4. Bei Fehler: Order auf 'cancelled' setzen ✅
  }
}
```

## 📱 Frontend Integration

### ProjectDetailScreen (erweitert)
```typescript
// Response enthält jetzt Order-Informationen
const response = await apiService.post('/api/email/order', { ... });

if (response.success) {
  Alert.alert(
    'Bestellung gesendet',
    `Bestellnummer: ${response.data.orderNumber}\n\nIhre Bestellung wurde erfolgreich an VYSN gesendet.`
  );
}
```

### Zukünftige Order-Übersicht Screen
```typescript
// Orders des Users anzeigen
const orders = await apiService.get('/api/orders');

// Order-Details anzeigen  
const orderDetails = await apiService.get(`/api/orders/${orderId}`);
```

## 🔒 Sicherheit & DSGVO

### Row Level Security
```sql
-- Orders: Users können nur ihre eigenen Orders sehen
CREATE POLICY "Users can view own orders" ON orders
FOR SELECT USING (auth.uid() = user_id);

-- Order Items: Users können nur Items ihrer eigenen Orders sehen  
CREATE POLICY "Users can view own order items" ON order_items
FOR SELECT USING (auth.uid() = (SELECT user_id FROM orders WHERE orders.id = order_items.order_id));
```

### Datenschutz
- **Zweckbindung**: Daten nur für Bestellabwicklung
- **Datenminimierung**: Nur notwendige Produktdaten gespeichert
- **Speicherfristen**: Automatische Archivierung nach 3 Jahren
- **Auskunftsrecht**: Vollständige Order-Historie über API verfügbar

## 🛠️ Konfiguration

### Environment Variables
```bash
# Bereits existierende SMTP-Konfiguration wird verwendet
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
ORDER_RECIPIENT_EMAIL=levin.normann98@gmail.com

# Supabase (bereits konfiguriert)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### Database Setup
```sql
-- Orders & Order Items Tabellen existieren bereits in:
-- database/supabase_auth_schema_fixed.sql

-- RLS Policies sind bereits konfiguriert
-- Indexes sind bereits optimiert
-- Triggers für updated_at sind bereits vorhanden
```

## 📈 Monitoring & Logs

### Backend Logs
```bash
💾 Saving order to database...
✅ Order saved with ID: uuid (VY24120X-0001)  
📧 Sending order email for project: LED Beleuchtung Büro
✅ Order email sent successfully
```

### Error Handling
```bash
❌ Order creation failed: [Detailed error]
⚠️ Email sending failed - Order cancelled: VY24120X-0001
🔄 Order status updated: VY24120X-0001 → cancelled
```

## 🚀 Next Steps

### Phase 1: ✅ Implementiert
- [x] Order-Speicherung bei Email-Versand
- [x] Bestellnummern-Generierung  
- [x] Email-Templates mit Order-Info
- [x] Order-Management APIs
- [x] Fehlerbehandlung

### Phase 2: Geplant
- [ ] Frontend Order-Übersicht Screen
- [ ] Order-Status Tracking für Kunden
- [ ] Push Notifications bei Status-Änderungen
- [ ] Order-Export für Buchhaltung
- [ ] Lieferadress-Management

### Phase 3: Erweiterungen
- [ ] Recurring Orders (Wiederholbestellungen)
- [ ] Order-Templates für häufige Bestellungen
- [ ] Bulk-Order für mehrere Projekte
- [ ] Integration mit Logistik-Partnern
- [ ] Automatische Rechnung-Generierung

---

**Das Order-System ist vollständig implementiert und ready für Production!** 🎉

Jede Bestellung wird automatisch in der Datenbank gespeichert, erhält eine eindeutige Nummer, und löst eine professionelle E-Mail mit allen Details aus.