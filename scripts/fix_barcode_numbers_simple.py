#!/usr/bin/env python3
"""
Script zur Bereinigung der Barcode-Nummern in der Supabase-Datenbank
Entfernt .0 am Ende von Barcode-Nummern (z.B. 4255805303931.0 -> 4255805303931)
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv
import sys

# Lade .env Datei
load_dotenv()

# Supabase-Konfiguration aus Umgebungsvariablen
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY') or os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Fehler: SUPABASE_URL und SUPABASE_KEY müssen als Umgebungsvariablen gesetzt sein")
    sys.exit(1)

def main():
    try:
        print("🚀 Starte Barcode-Bereinigung...")
        
        # Supabase-Client erstellen
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase-Verbindung hergestellt")
        
        # Alle Produkte laden
        print("📖 Lade alle Produkte...")
        response = supabase.table('products').select('id, item_number_vysn, barcode_number').execute()
        
        if not response.data:
            print("❌ Keine Produkte gefunden")
            return
        
        products = response.data
        print(f"✅ {len(products)} Produkte gefunden")
        
        # Finde Produkte mit .0 am Ende der Barcode-Nummer
        products_to_fix = []
        for product in products:
            barcode = product.get('barcode_number')
            if barcode and str(barcode).endswith('.0'):
                new_barcode = str(barcode)[:-2]  # Entferne .0
                products_to_fix.append({
                    'id': product['id'],
                    'item_number': product.get('item_number_vysn', 'N/A'),
                    'old_barcode': barcode,
                    'new_barcode': new_barcode
                })
        
        if not products_to_fix:
            print("✅ Keine Barcode-Nummern mit .0 gefunden - alles ist bereits korrekt!")
            return
        
        print(f"🔧 {len(products_to_fix)} Barcode-Nummern müssen bereinigt werden:")
        
        # Zeige Vorschau
        for i, product in enumerate(products_to_fix[:5]):  # Zeige nur die ersten 5
            print(f"  - {product['item_number']}: {product['old_barcode']} → {product['new_barcode']}")
        
        if len(products_to_fix) > 5:
            print(f"  ... und {len(products_to_fix) - 5} weitere")
        
        # Bestätigung abfragen
        response_input = input(f"\n❓ Möchten Sie {len(products_to_fix)} Barcode-Nummern bereinigen? (j/N): ")
        if response_input.lower() not in ['j', 'ja', 'y', 'yes']:
            print("❌ Abgebrochen")
            return
        
        # Updates durchführen
        print("\n🔄 Bereinige Barcode-Nummern...")
        updated_count = 0
        error_count = 0
        
        for product in products_to_fix:
            try:
                # Update einzelnes Produkt
                update_response = supabase.table('products').update({
                    'barcode_number': product['new_barcode']
                }).eq('id', product['id']).execute()
                
                if update_response.data:
                    print(f"✅ {product['item_number']}: {product['old_barcode']} → {product['new_barcode']}")
                    updated_count += 1
                else:
                    print(f"❌ Fehler bei {product['item_number']}")
                    error_count += 1
                    
            except Exception as e:
                print(f"❌ Fehler bei {product['item_number']}: {e}")
                error_count += 1
        
        print(f"\n🎉 Bereinigung abgeschlossen!")
        print(f"✅ Erfolgreich: {updated_count}")
        if error_count > 0:
            print(f"❌ Fehler: {error_count}")
        
        print("\n✅ Alle Barcode-Nummern sind jetzt bereinigt!")
        
    except Exception as e:
        print(f"❌ Fehler: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()