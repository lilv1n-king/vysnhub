/**
 * Utility-Funktionen für Lagerbestand-Anzeige
 */

export interface StockStatus {
  text: string;
  color: string;
  available: boolean;
  onRequest: boolean;
}

/**
 * Formatiert die Lagerbestand-Anzeige basierend auf stock_quantity
 * @param stockQuantity - Die Anzahl auf Lager
 * @param itemNumber - Artikelnummer für spezielle Behandlung
 * @param t - Translation function
 * @returns StockStatus Objekt mit Text, Farbe und Status
 */
export function formatStockDisplay(stockQuantity?: number | null, itemNumber?: string, t?: any): StockStatus {
  // Fallback für fehlende Übersetzungen
  const getTranslation = (key: string, params?: any) => {
    if (t && typeof t === 'function') {
      return t(key, params);
    }
    // Fallback auf Deutsch wenn keine Übersetzung verfügbar
    const fallbacks: Record<string, string> = {
      'products.stock.onRequest': 'Auf Anfrage',
      'products.stock.notAvailable': 'Nicht auf Lager - auf Anfrage',
      'products.stock.available': `${params?.count || 0} verfügbar`,
      'products.stock.tenPlus': '10+ verfügbar',
      'products.stock.twentyPlus': '20+ verfügbar',
      'products.stock.thirtyPlus': '30+ verfügbar',
      'products.stock.fortyPlus': '40+ verfügbar',
      'products.stock.fiftyPlus': '50+ verfügbar',
      'products.stock.hundredPlus': '100+ verfügbar',
      'products.stock.twoHundredPlus': '200+ verfügbar',
      'products.stock.threeHundredPlus': '300+ verfügbar',
      'products.stock.fourHundredPlus': '400+ verfügbar',
      'products.stock.fiveHundredPlus': '500+ verfügbar',
      'products.stock.thousandPlus': '1000+ verfügbar'
    };
    return fallbacks[key] || key;
  };

  // Null oder undefined behandeln
  if (stockQuantity === null || stockQuantity === undefined) {
    return {
      text: getTranslation('products.stock.onRequest'),
      color: '#1f2937', // Dunkelgrau (Design-konform)
      available: false,
      onRequest: true
    };
  }

  // PRO-Artikel (Spezialwert -1) oder explizit auf Anfrage
  if (stockQuantity === -1 || (itemNumber && itemNumber.startsWith('PRO-'))) {
    return {
      text: getTranslation('products.stock.onRequest'),
      color: '#1f2937', // Dunkelgrau (Design-konform)
      available: false,
      onRequest: true
    };
  }

  // Nicht auf Lager, aber auf Anfrage verfügbar
  if (stockQuantity === 0) {
    return {
      text: getTranslation('products.stock.notAvailable'),
      color: '#6b7280', // Grau (Design-konform)
      available: false,
      onRequest: true
    };
  }

  // Kategorisierte Anzeige für verfügbare Artikel
  if (stockQuantity >= 1000) {
    return {
      text: getTranslation('products.stock.thousandPlus'),
      color: '#000000', // Schwarz (sehr gut verfügbar)
      available: true,
      onRequest: false
    };
  }

  if (stockQuantity >= 500) {
    return {
      text: getTranslation('products.stock.fiveHundredPlus'),
      color: '#000000', // Schwarz (sehr gut verfügbar)
      available: true,
      onRequest: false
    };
  }

  if (stockQuantity >= 400) {
    return {
      text: getTranslation('products.stock.fourHundredPlus'),
      color: '#1f2937', // Dunkelgrau (gut verfügbar)
      available: true,
      onRequest: false
    };
  }

  if (stockQuantity >= 300) {
    return {
      text: getTranslation('products.stock.threeHundredPlus'),
      color: '#1f2937', // Dunkelgrau (gut verfügbar)
      available: true,
      onRequest: false
    };
  }

  if (stockQuantity >= 200) {
    return {
      text: getTranslation('products.stock.twoHundredPlus'),
      color: '#374151', // Mittelgrau (gut verfügbar)
      available: true,
      onRequest: false
    };
  }

  if (stockQuantity >= 100) {
    return {
      text: getTranslation('products.stock.hundredPlus'),
      color: '#374151', // Mittelgrau (gut verfügbar)
      available: true,
      onRequest: false
    };
  }

  if (stockQuantity >= 50) {
    return {
      text: getTranslation('products.stock.fiftyPlus'),
      color: '#4b5563', // Mittelgrau (verfügbar)
      available: true,
      onRequest: false
    };
  }

  if (stockQuantity >= 40) {
    return {
      text: getTranslation('products.stock.fortyPlus'),
      color: '#4b5563', // Mittelgrau (verfügbar)
      available: true,
      onRequest: false
    };
  }

  if (stockQuantity >= 30) {
    return {
      text: getTranslation('products.stock.thirtyPlus'),
      color: '#6b7280', // Grau (mäßig verfügbar)
      available: true,
      onRequest: false
    };
  }

  if (stockQuantity >= 20) {
    return {
      text: getTranslation('products.stock.twentyPlus'),
      color: '#6b7280', // Grau (mäßig verfügbar)
      available: true,
      onRequest: false
    };
  }

  if (stockQuantity >= 10) {
    return {
      text: getTranslation('products.stock.tenPlus'),
      color: '#9ca3af', // Hellgrau (wenig verfügbar)
      available: true,
      onRequest: false
    };
  }

  // Wenige verfügbar (1-9) - zeige exakte Anzahl
  return {
    text: getTranslation('products.stock.available', { count: stockQuantity }),
    color: '#d1d5db', // Sehr hellgrau (sehr wenig verfügbar)
    available: true,
    onRequest: false
  };
}

/**
 * Gibt die Priorität für die Sortierung zurück (niedrigere Werte = höhere Priorität)
 */
export function getStockSortPriority(stockStatus: StockStatus): number {
  if (stockStatus.available && !stockStatus.onRequest) {
    return 1; // Verfügbare Artikel zuerst
  }
  if (stockStatus.onRequest) {
    return 2; // Auf Anfrage-Artikel als zweites
  }
  return 3; // Nicht verfügbare Artikel zuletzt
}

/**
 * Hilfsfunktion für Backend-Integration: Stock Quantity für Anzeige
 */
export function getDisplayStockQuantity(product: any): number | null {
  return product.stock_quantity ?? product.stockQuantity ?? null;
}

