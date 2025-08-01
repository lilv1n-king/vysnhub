#!/usr/bin/env python3
"""
Script zur Migration der Excel-Daten in die Supabase-Datenbank
Liest die Data_English_17.07.2025_s.xlsx und importiert alle Produkte in die products-Tabelle
"""

import pandas as pd
import os
from supabase import create_client, Client
from datetime import datetime
import numpy as np
import sys
from dotenv import load_dotenv

# Lade .env Datei
load_dotenv()

# Supabase-Konfiguration aus Umgebungsvariablen
SUPABASE_URL = os.getenv('SUPABASE_URL')
# Versuche beide mögliche Variablennamen
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY') or os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Fehler: SUPABASE_URL und SUPABASE_KEY müssen als Umgebungsvariablen gesetzt sein")
    print("Beispiel: export SUPABASE_URL='https://your-project.supabase.co'")
    print("         export SUPABASE_KEY='your-supabase-key'")
    print("   oder: export SUPABASE_ANON_KEY='your-anon-key'")
    sys.exit(1)

def clean_value(value):
    """Bereinigt Werte für die Datenbank"""
    if pd.isna(value) or value == '' or value == 'nan':
        return None
    if isinstance(value, str):
        return value.strip()
    return value

def convert_to_numeric(value):
    """Konvertiert Werte zu numerischen Typen"""
    if pd.isna(value) or value == '' or value == 'nan':
        return None
    try:
        # Entferne Kommas und konvertiere zu float
        if isinstance(value, str):
            value = value.replace(',', '.')
        
        # Konvertiere zu float und dann zu int wenn es eine ganze Zahl ist
        float_val = float(value)
        
        # Wenn es eine ganze Zahl ist, gib sie als int zurück
        if float_val.is_integer():
            return int(float_val)
        else:
            return float_val
    except (ValueError, TypeError):
        return None

def convert_to_boolean(value):
    """Konvertiert Werte zu Boolean"""
    if pd.isna(value) or value == '' or value == 'nan':
        return None
    if isinstance(value, str):
        value = value.lower().strip()
        return value in ['true', 'yes', 'ja', '1', 'x']
    return bool(value)

def map_excel_to_db_columns(df):
    """Mappt Excel-Spalten auf Datenbank-Spalten"""
    
    # Excel-Spalten zu DB-Spalten Mapping
    column_mapping = {
        'VYSN Name': 'vysn_name',
        'item number Vysn': 'item_number_vysn', 
        'Short description': 'short_description',
        'Long description': 'long_description',
        'Weight (kg)': 'weight_kg',
        'Packaging Weight (kg)': 'packaging_weight_kg',
        'Gross weight (kg)': 'gross_weight_kg',
        'Installation diameter': 'installation_diameter',
        'Cable length mm': 'cable_length_mm',
        'Diameter mm': 'diameter_mm',
        'Length  mm': 'length_mm',
        'width mm': 'width_mm',
        'Height mm': 'height_mm',
        'Packaging Width mm': 'packaging_width_mm',
        'Packaging Length mm': 'packaging_length_mm',
        'Packaging height mm': 'packaging_height_mm',
        'Housing Color': 'housing_color',
        'Material': 'material',
        'Gross price': 'gross_price',
        'Katalog Q4/24': 'katalog_q4_24',
        'Category 1': 'category_1',
        'Category 2': 'category_2',
        'Group name': 'group_name',
        'Light Direction': 'light_direction',
        'Lumen': 'lumen',
        'Driver info': 'driver_info',
        'Beam Angle': 'beam_angle',
        'Beam Angle Range': 'beam_angle_range',
        'Lightsource': 'lightsource',
        'Luminosity decrease': 'luminosity_decrease',
        'Steering': 'steering',
        'LED chip Lifetime': 'led_chip_lifetime',
        'Energy Class': 'energy_class',
        'CCT': 'cct',
        'CRI': 'cri',
        'Wattage': 'wattage',
        'LED-Type': 'led_type',
        'SDCM': 'sdcm',
        'Operating mode': 'operating_mode',
        'Lumen per Watt': 'lumen_per_watt',
        'CCT-switch Value': 'cct_switch_value',
        'Power switch Value': 'power_switch_value',
        'Ingress Protection': 'ingress_protection',
        'Protection Class': 'protection_class',
        'Impact Resistance': 'impact_resistance',
        'UGR': 'ugr',
        'Installation': 'installation',
        'Base / Socket': 'base_socket',
        'Number of Sockets': 'number_of_sockets',
        'Socket information for retrofit products': 'socket_information_retrofit',
        'Replaceable Light Source': 'replaceable_light_source',
        'Coverable?': 'coverable',
        'Manual-Link': 'manual_link',
        'Barcode Number': 'barcode_number',
        'HS-code': 'hs_code',
        'Packaging units (default is 1)': 'packaging_units',
        'Country of Origin': 'country_of_origin',
        'EPREL Link': 'eprel_link',
        'Eprel-Picture-Link': 'eprel_picture_link',
        'Product_picture_1': 'product_picture_1',
        'Product_picture_2': 'product_picture_2',
        'Product_picture_3': 'product_picture_3',
        'Product_picture_4': 'product_picture_4',
        'Product_picture_5': 'product_picture_5',
        'Product_picture_6': 'product_picture_6',
        'Product_picture_7': 'product_picture_7',
        'Product_picture_8': 'product_picture_8',
    }
    
    # Numerische Spalten
    numeric_columns = [
        'weight_kg', 'packaging_weight_kg', 'gross_weight_kg',
        'installation_diameter', 'cable_length_mm', 'diameter_mm',
        'length_mm', 'width_mm', 'height_mm', 'packaging_width_mm',
        'packaging_length_mm', 'packaging_height_mm', 'gross_price',
        'lumen', 'beam_angle', 'cct', 'cri', 'wattage', 'sdcm',
        'lumen_per_watt', 'ugr', 'number_of_sockets', 'packaging_units'
    ]
    
    # Boolean-Spalten
    boolean_columns = [
        'katalog_q4_24', 'replaceable_light_source', 'coverable'
    ]
    
    products = []
    
    for index, row in df.iterrows():
        product = {
            'availability': True,  # Standardwert
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        # Mapping der Spalten
        for excel_col, db_col in column_mapping.items():
            if excel_col in df.columns:
                value = row[excel_col]
                
                if db_col in numeric_columns:
                    product[db_col] = convert_to_numeric(value)
                elif db_col in boolean_columns:
                    product[db_col] = convert_to_boolean(value)
                elif db_col == 'sdcm':
                    # SDCM als Text beibehalten: "<6", "<4", etc.
                    if pd.isna(value) or value == '' or str(value).lower() in ['n/a', 'na', '-']:
                        product[db_col] = None
                    else:
                        product[db_col] = str(value).strip()
                else:
                    product[db_col] = clean_value(value)
        
        products.append(product)
    
    return products

def main():
    try:
        print("🚀 Starte Excel-Import nach Supabase...")
        
        # Supabase-Client erstellen
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase-Verbindung hergestellt")
        
        # Excel-Datei lesen
        print("📖 Lese Excel-Datei...")
        df = pd.read_excel('Data_English_17.07.2025_s.xlsx')
        print(f"✅ {len(df)} Zeilen aus Excel-Datei gelesen")
        
        # Daten transformieren
        print("🔄 Transformiere Daten...")
        products = map_excel_to_db_columns(df)
        print(f"✅ {len(products)} Produkte vorbereitet")
        
        # Alte Daten löschen (optional)
        print("🗑️ Lösche alte Produktdaten...")
        try:
            result = supabase.table('products').delete().neq('id', 0).execute()
            print("✅ Alte Daten gelöscht")
        except Exception as e:
            print(f"⚠️ Warnung beim Löschen alter Daten: {e}")
        
        # Daten in Chargen hochladen (Supabase hat Limits)
        batch_size = 50
        total_batches = len(products) // batch_size + (1 if len(products) % batch_size > 0 else 0)
        
        print(f"📤 Lade Daten in {total_batches} Chargen hoch...")
        
        for i in range(0, len(products), batch_size):
            batch = products[i:i + batch_size]
            batch_num = (i // batch_size) + 1
            
            try:
                result = supabase.table('products').insert(batch).execute()
                print(f"✅ Charge {batch_num}/{total_batches} erfolgreich hochgeladen ({len(batch)} Produkte)")
            except Exception as e:
                print(f"❌ Fehler bei Charge {batch_num}: {e}")
                # Einzeln versuchen bei Fehlern
                for j, product in enumerate(batch):
                    try:
                        supabase.table('products').insert(product).execute()
                        print(f"  ✅ Produkt {i+j+1} einzeln hochgeladen")
                    except Exception as e2:
                        print(f"  ❌ Fehler bei Produkt {i+j+1}: {e2}")
                        print(f"     Item: {product.get('item_number_vysn', 'N/A')}")
        
        # Statistiken abrufen
        print("\n📊 Import-Statistiken:")
        result = supabase.table('products').select('count', count='exact').execute()
        total_count = result.count if result.count else 0
        print(f"   Gesamtanzahl Produkte in DB: {total_count}")
        
        # Kategorien-Statistiken
        result = supabase.table('products').select('category_1').execute()
        if result.data:
            categories = set(p['category_1'] for p in result.data if p['category_1'])
            print(f"   Anzahl Kategorien: {len(categories)}")
        
        print("\n🎉 Import erfolgreich abgeschlossen!")
        print("\nNächste Schritte:")
        print("1. Führe das SQL-Schema aus: supabase_schema_products_real.sql")
        print("2. Starte das Backend: npm run dev")
        print("3. Teste die API: curl http://localhost:3001/api/products/search?q=LED")
        
    except FileNotFoundError:
        print("❌ Fehler: Data_English_17.07.2025_s.xlsx nicht gefunden")
        print("Stelle sicher, dass die Excel-Datei im aktuellen Verzeichnis liegt.")
    except Exception as e:
        print(f"❌ Unerwarteter Fehler: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 