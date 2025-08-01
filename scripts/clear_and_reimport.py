#!/usr/bin/env python3
"""
Script zum Löschen aller Produktdaten und Neuimport der Excel-Daten
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

def main():
    try:
        print("🧹 Lösche alle Produktdaten und starte Neuimport...")
        
        # Supabase-Client erstellen
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase-Verbindung hergestellt")
        
        # 1. Alle Produktdaten löschen
        print("🗑️ Lösche alle vorhandenen Produktdaten...")
        try:
            result = supabase.table('products').delete().neq('id', 0).execute()
            print("✅ Alle Produktdaten gelöscht")
        except Exception as e:
            print(f"⚠️ Warnung beim Löschen: {e}")
        
        # 2. Zähle verbleibende Einträge
        result = supabase.table('products').select('count', count='exact').execute()
        remaining_count = result.count if result.count else 0
        print(f"📊 Verbleibende Produkte in DB: {remaining_count}")
        
        if remaining_count > 0:
            print("⚠️ Es sind noch Produkte in der Datenbank. Versuche nochmals zu löschen...")
            try:
                # Erzwinge Löschung mit SQL
                supabase.rpc('execute_custom_query', {'query_text': 'DELETE FROM products'}).execute()
                print("✅ Alle Produkte mit SQL gelöscht")
            except Exception as e:
                print(f"❌ Konnte nicht alle Produkte löschen: {e}")
        
        print("\n🎯 Datenbank ist bereit für Neuimport!")
        print("Führe jetzt aus: python3 import_excel_to_supabase.py")
        
    except Exception as e:
        print(f"❌ Unerwarteter Fehler: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 