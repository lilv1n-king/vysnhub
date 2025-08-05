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
    print("Beispiel:")
    print("export SUPABASE_URL='https://cajkiixyxznfuieeuqqh.supabase.co'")
    print("export SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'")
    sys.exit(1)

def clean_barcode(barcode_value):
    """Entfernt .0 am Ende von Barcode-Nummern"""
    if not barcode_value:
        return None
    
    str_value = str(barcode_value).strip()
    
    # Entferne .0 am Ende
    if str_value.endswith('.0'):
        return str_value[:-2]
    
    return str_value

def main():
    try:
        print("🚀 Starte Barcode-Bereinigung...")
        
        # Supabase-Client erstellen
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase-Verbindung hergestellt")
        
        # Alle Produkte mit Barcode-Nummern laden
        print("📖 Lade alle Produkte mit Barcode-Nummern...")
        response = supabase.table('products').select('id, item_number_vysn, barcode_number').not_('barcode_number', 'is', None).execute()
        
        if not response.data:
            print("❌ Keine Produkte mit Barcode-Nummern gefunden")
            return
        
        products = response.data
        print(f"✅ {len(products)} Produkte mit Barcode-Nummern gefunden")
        
        # Finde Produkte mit .0 am Ende
        products_to_fix = []
        for product in products:
            barcode = product.get('barcode_number')
            if barcode and str(barcode).endswith('.0'):
                cleaned_barcode = clean_barcode(barcode)
                products_to_fix.append({
                    'id': product['id'],
                    'item_number': product['item_number_vysn'],
                    'old_barcode': barcode,
                    'new_barcode': cleaned_barcode
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
        response = input(f"\n❓ Möchten Sie {len(products_to_fix)} Barcode-Nummern bereinigen? (j/N): ")
        if response.lower() not in ['j', 'ja', 'y', 'yes']:
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
        
        # Verifikation
        print("\n🔍 Verifikation...")
        verification_response = supabase.table('products').select('barcode_number').like('barcode_number', '%.0').execute()
        
        remaining_with_dot_zero = len(verification_response.data) if verification_response.data else 0
        
        if remaining_with_dot_zero == 0:
            print("✅ Alle Barcode-Nummern sind jetzt korrekt!")
        else:
            print(f"⚠️ {remaining_with_dot_zero} Barcode-Nummern haben noch .0 am Ende")
        
    except Exception as e:
        print(f"❌ Fehler: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()