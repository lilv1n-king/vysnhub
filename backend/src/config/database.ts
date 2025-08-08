import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceRole) {
  throw new Error('SUPABASE_URL und SUPABASE_SERVICE_ROLE müssen in den Umgebungsvariablen gesetzt sein');
}

// Use Service Role Key for database operations (full access)
export const supabase = createClient(supabaseUrl, supabaseServiceRole);

// Interface für VYSN Beleuchtungsprodukte basierend auf Excel-Daten
export interface Product {
  // Identifikation
  id?: number;
  vysn_name?: string;
  item_number_vysn?: string;
  short_description?: string;
  long_description?: string;
  
  // Physische Eigenschaften
  weight_kg?: number;
  packaging_weight_kg?: number;
  gross_weight_kg?: number;
  
  // Abmessungen
  installation_diameter?: number;
  cable_length_mm?: number;
  diameter_mm?: number;
  length_mm?: number;
  width_mm?: number;
  height_mm?: number;
  packaging_width_mm?: number;
  packaging_length_mm?: number;
  packaging_height_mm?: number;
  
  // Farbe und Design
  housing_color?: string;
  material?: string;
  
  // Preis und Katalog
  gross_price?: number;
  katalog_q4_24?: boolean;
  
  // Kategorisierung
  category_1?: string;
  category_2?: string;
  group_name?: string;
  
  // Licht-spezifische Eigenschaften
  light_direction?: string;
  lumen?: number;
  driver_info?: string;
  beam_angle?: number;
  beam_angle_range?: string;
  lightsource?: string;
  luminosity_decrease?: string;
  steering?: string;
  led_chip_lifetime?: string;
  
  // Energieeffizienz
  energy_class?: string;
  cct?: number; // Farbtemperatur
  cri?: number; // Farbwiedergabeindex
  wattage?: number;
  led_type?: string;
  sdcm?: number;
  operating_mode?: string;
  lumen_per_watt?: number;
  cct_switch_value?: string;
  power_switch_value?: string;
  
  // Sicherheit und Standards
  ingress_protection?: string;  // Spalte: "Ingress Protection" // IP-Schutzklasse
  protection_class?: string;
  impact_resistance?: string;
  ugr?: number; // Blendwert
  
  // Installation
  installation?: string;
  base_socket?: string;
  number_of_sockets?: number;
  socket_information_retrofit?: string;
  replaceable_light_source?: boolean;
  coverable?: boolean;
  
  // Zusätzliche Informationen
  manual_link?: string;
  barcode_number?: string;
  hs_code?: string;
  packaging_units?: number;
  country_of_origin?: string;
  eprel_link?: string;
  eprel_picture_link?: string;
  
  // Produktbilder
  product_picture_1?: string;
  product_picture_2?: string;
  product_picture_3?: string;
  product_picture_4?: string;
  product_picture_5?: string;
  product_picture_6?: string;
  product_picture_7?: string;
  product_picture_8?: string;
  
  // System-Felder
  availability?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Interface für Chat-Nachrichten (bleibt gleich)
export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  request_type?: 'produktempfehlung' | 'produktfrage' | 'produktvergleich' | 'aehnliche_produktsuche';
  sql_query?: string;
  metadata?: Record<string, any>;
}

// Hilfsfunktionen für Produktsuche
export const getProductDisplayName = (product: Product): string => {
  return product.vysn_name || product.short_description || `Artikel ${product.item_number_vysn}` || 'Unbekanntes Produkt';
};

export const getProductPrice = (product: Product): string => {
  if (product.gross_price) {
    return `${product.gross_price.toFixed(2)} EUR`;
  }
  return 'Preis auf Anfrage';
};

export const getProductImages = (product: Product): string[] => {
  const images: string[] = [];
  for (let i = 1; i <= 8; i++) {
    const imageKey = `product_picture_${i}` as keyof Product;
    const imageUrl = product[imageKey] as string;
    if (imageUrl && imageUrl.trim()) {
      images.push(imageUrl);
    }
  }
  return images;
};

export const getProductCategories = (product: Product): string[] => {
  const categories: string[] = [];
  if (product.category_1) categories.push(product.category_1);
  if (product.category_2) categories.push(product.category_2);
  if (product.group_name) categories.push(product.group_name);
  return categories;
}; 