#!/usr/bin/env python3
"""
Script zum Aktualisieren der Lagerbestände aus Excel-Datei "Artikel (1).xlsx"
Abgleich über Artikelnummer (item_number_vysn) wie SVERWEIS
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
# Versuche verschiedene Variablennamen für den Key
SUPABASE_KEY = (os.getenv('SUPABASE_SERVICE_ROLE') or 
                os.getenv('SUPABASE_ANON_KEY') or 
                os.getenv('SUPABASE_KEY'))

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Fehler: SUPABASE_URL und SUPABASE_KEY müssen als Umgebungsvariablen gesetzt sein")
    print("Beispiel: export SUPABASE_URL='https://your-project.supabase.co'")
    print("         export SUPABASE_SERVICE_ROLE='your-service-role-key'")
    print("   oder: export SUPABASE_ANON_KEY='your-anon-key'")
    sys.exit(1)

def clean_value(value):
    """Bereinigt Werte für die Datenbank"""
    if pd.isna(value):
        return None
    if isinstance(value, str):
        return value.strip() if value.strip() else None
    return value

def main():
    try:
        print("📊 Starte Lagerbestand-Update aus Excel-Datei...")
        
        # Initialisiere Supabase-Client
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase-Verbindung hergestellt")
        
        # Lade Excel-Datei
        excel_file = "Artikel (1).xlsx"
        if not os.path.exists(excel_file):
            print(f"❌ Fehler: Excel-Datei '{excel_file}' nicht gefunden!")
            sys.exit(1)
            
        print(f"📖 Lade Excel-Datei: {excel_file}")
        df = pd.read_excel(excel_file)
        
        # Extrahiere relevante Spalten (Nr. = Artikelnummer, Lagerbestand = Stock)
        stock_data = df[['Nr.', 'Lagerbestand']].copy()
        stock_data.columns = ['artikel_nr', 'lagerbestand']
        
        # Bereinige Daten
        stock_data['artikel_nr'] = stock_data['artikel_nr'].astype(str).str.strip()
        stock_data['lagerbestand'] = pd.to_numeric(stock_data['lagerbestand'], errors='coerce').fillna(0)
        
        # Entferne leere Artikelnummern
        stock_data = stock_data[stock_data['artikel_nr'].notna() & (stock_data['artikel_nr'] != '') & (stock_data['artikel_nr'] != 'nan')]
        
        print(f"📋 Gefunden: {len(stock_data)} Artikel mit Lagerbeständen")
        print(f"📊 Lagerbestand-Statistik:")
        print(f"   - Durchschnitt: {stock_data['lagerbestand'].mean():.1f}")
        print(f"   - Maximum: {stock_data['lagerbestand'].max()}")
        print(f"   - Artikel mit Stock > 0: {len(stock_data[stock_data['lagerbestand'] > 0])}")
        
        # Hole aktuelle Produkte aus Supabase
        print("🔍 Lade aktuelle Produkte aus Supabase...")
        result = supabase.table('products').select('id, item_number_vysn, stock_quantity').execute()
        
        if not result.data:
            print("❌ Keine Produkte in der Datenbank gefunden!")
            sys.exit(1)
            
        products_df = pd.DataFrame(result.data)
        print(f"📦 Gefunden: {len(products_df)} Produkte in der Datenbank")
        
        # Führe SVERWEIS-ähnlichen Abgleich durch
        print("🔄 Führe Artikelabgleich durch (wie SVERWEIS)...")
        
        updates_count = 0
        not_found_count = 0
        no_change_count = 0
        pro_articles_count = 0
        
        for _, excel_row in stock_data.iterrows():
            artikel_nr = excel_row['artikel_nr']
            new_stock = int(excel_row['lagerbestand'])
            
            # Spezialbehandlung für PRO-Artikel: Setze auf -1 für "auf Anfrage"
            if artikel_nr.startswith('PRO-'):
                new_stock = -1  # Spezialwert für "auf Anfrage"
                pro_articles_count += 1
            
            # Suche passendes Produkt in der Datenbank
            matching_products = products_df[products_df['item_number_vysn'] == artikel_nr]
            
            if matching_products.empty:
                not_found_count += 1
                continue
            
            # Nimm das erste Match (sollte eindeutig sein wegen UNIQUE constraint)
            product = matching_products.iloc[0]
            current_stock = product.get('stock_quantity', 0) or 0
            
            # Überspringe wenn sich nichts ändert
            if current_stock == new_stock:
                no_change_count += 1
                continue
            
            # Update in Supabase
            try:
                update_result = supabase.table('products').update({
                    'stock_quantity': new_stock,
                    'updated_at': datetime.now().isoformat()
                }).eq('id', product['id']).execute()
                
                if update_result.data:
                    updates_count += 1
                    if updates_count <= 10:  # Zeige nur erste 10 Updates
                        status = "auf Anfrage" if new_stock == -1 else str(new_stock)
                        current_status = "auf Anfrage" if current_stock == -1 else str(current_stock)
                        print(f"   ✅ {artikel_nr}: {current_status} → {status}")
                        
            except Exception as e:
                print(f"   ❌ Fehler bei {artikel_nr}: {e}")
        
        # Zusammenfassung
        print(f"\n📊 Update-Zusammenfassung:")
        print(f"   ✅ Erfolgreich aktualisiert: {updates_count}")
        print(f"   ⚠️  Artikel nicht gefunden: {not_found_count}")
        print(f"   📝 Keine Änderung nötig: {no_change_count}")
        print(f"   🏭 PRO-Artikel (auf Anfrage): {pro_articles_count}")
        print(f"   📋 Gesamt verarbeitet: {len(stock_data)}")
        
        if updates_count > 0:
            print(f"\n🎉 Lagerbestände erfolgreich aktualisiert!")
            if pro_articles_count > 0:
                print(f"💼 {pro_articles_count} PRO-Artikel wurden auf 'auf Anfrage' gesetzt")
        else:
            print(f"\n⚠️  Keine Lagerbestände wurden aktualisiert.")
            
        # Zeige einige Beispiele der nicht gefundenen Artikel
        if not_found_count > 0:
            print(f"\n🔍 Beispiele nicht gefundener Artikel:")
            not_found_examples = []
            for _, excel_row in stock_data.iterrows():
                artikel_nr = excel_row['artikel_nr']
                if products_df[products_df['item_number_vysn'] == artikel_nr].empty:
                    not_found_examples.append(artikel_nr)
                    if len(not_found_examples) >= 5:
                        break
            
            for example in not_found_examples:
                print(f"   - {example}")
                
    except Exception as e:
        print(f"❌ Fehler: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
