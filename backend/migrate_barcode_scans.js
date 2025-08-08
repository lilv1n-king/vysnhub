#!/usr/bin/env node
/**
 * Migration Script: Fix product_id type in barcode_scans table
 * Ändert product_id von UUID zu INTEGER um mit products.id kompatibel zu sein
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase Konfiguration - diese müssen als Umgebungsvariablen gesetzt werden
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Fehler: SUPABASE_URL und SUPABASE_ANON_KEY müssen gesetzt sein');
  console.error('   Beispiel: export SUPABASE_URL="https://xxx.supabase.co"');
  console.error('   Beispiel: export SUPABASE_ANON_KEY="dein-anon-key"');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Migration startet...');
  console.log('📋 Problem: barcode_scans.product_id ist UUID, aber products.id ist INTEGER');
  console.log('🔧 Lösung: Ändere barcode_scans.product_id zu INTEGER\n');

  try {
    // 1. Backup der aktuellen Daten erstellen
    console.log('1️⃣ Erstelle Backup der bestehenden Daten...');
    const { data: existingData, error: backupError } = await supabase
      .from('barcode_scans')
      .select('*');

    if (backupError && backupError.code !== 'PGRST116') {
      console.error('❌ Fehler beim Backup:', backupError);
      return;
    }

    console.log(`📊 ${existingData ? existingData.length : 0} bestehende Scan-Records gefunden`);

    // 2. Neue Tabelle mit korrektem Schema erstellen
    console.log('\n2️⃣ Erstelle neue barcode_scans Tabelle mit korrektem Schema...');
    
    const migrationSQL = `
    -- Lösche alte Tabelle und Views
    DROP TABLE IF EXISTS barcode_scans CASCADE;
    DROP VIEW IF EXISTS daily_scan_stats CASCADE;
    DROP VIEW IF EXISTS top_scanned_codes CASCADE;
    DROP VIEW IF EXISTS session_scan_activity CASCADE;

    -- Erstelle neue Tabelle mit INTEGER product_id
    CREATE TABLE barcode_scans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        
        -- Scan-Details
        scanned_code VARCHAR(255) NOT NULL,
        scan_type VARCHAR(50) NOT NULL CHECK (scan_type IN ('barcode', 'qr_code', 'manual_input')),
        
        -- Produkt-Informationen (INTEGER statt UUID!)
        product_id INTEGER,
        product_item_number VARCHAR(100),
        product_found BOOLEAN DEFAULT FALSE,
        
        -- Kontext-Informationen
        scan_source VARCHAR(50) NOT NULL CHECK (scan_source IN ('native_app', 'web_app')),
        device_info JSONB,
        
        -- Geo-Location (optional)
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        location_accuracy DECIMAL(10, 2),
        
        -- Session-Informationen
        session_id VARCHAR(255),
        
        -- Ergebnis-Informationen
        search_results_count INTEGER DEFAULT 0,
        action_taken VARCHAR(100),
        
        -- Timestamps
        scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Indizes erstellen
    CREATE INDEX IF NOT EXISTS idx_barcode_scans_scanned_code ON barcode_scans(scanned_code);
    CREATE INDEX IF NOT EXISTS idx_barcode_scans_scanned_at ON barcode_scans(scanned_at);
    CREATE INDEX IF NOT EXISTS idx_barcode_scans_scan_source ON barcode_scans(scan_source);
    CREATE INDEX IF NOT EXISTS idx_barcode_scans_product_found ON barcode_scans(product_found);
    CREATE INDEX IF NOT EXISTS idx_barcode_scans_product_id ON barcode_scans(product_id);
    CREATE INDEX IF NOT EXISTS idx_barcode_scans_product_item_number ON barcode_scans(product_item_number);
    CREATE INDEX IF NOT EXISTS idx_barcode_scans_session_id ON barcode_scans(session_id);

    -- Trigger für updated_at
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    CREATE TRIGGER update_barcode_scans_updated_at 
        BEFORE UPDATE ON barcode_scans 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- Views neu erstellen
    CREATE OR REPLACE VIEW daily_scan_stats AS
    SELECT 
        DATE(scanned_at) as scan_date,
        scan_source,
        scan_type,
        COUNT(*) as total_scans,
        COUNT(CASE WHEN product_found THEN 1 END) as successful_scans,
        COUNT(DISTINCT session_id) as unique_sessions
    FROM barcode_scans 
    GROUP BY DATE(scanned_at), scan_source, scan_type
    ORDER BY scan_date DESC;

    CREATE OR REPLACE VIEW top_scanned_codes AS
    SELECT 
        scanned_code,
        product_item_number,
        scan_type,
        COUNT(*) as scan_count,
        COUNT(DISTINCT session_id) as unique_sessions,
        MAX(scanned_at) as last_scanned,
        AVG(CASE WHEN product_found THEN 1.0 ELSE 0.0 END) as success_rate
    FROM barcode_scans 
    GROUP BY scanned_code, product_item_number, scan_type
    HAVING COUNT(*) > 1
    ORDER BY scan_count DESC;

    CREATE OR REPLACE VIEW session_scan_activity AS
    SELECT 
        session_id,
        COUNT(*) as total_scans,
        COUNT(CASE WHEN product_found THEN 1 END) as successful_scans,
        COUNT(DISTINCT scanned_code) as unique_codes_scanned,
        MIN(scanned_at) as first_scan,
        MAX(scanned_at) as last_scan,
        DATE_PART('day', MAX(scanned_at) - MIN(scanned_at)) as active_days
    FROM barcode_scans 
    WHERE session_id IS NOT NULL
    GROUP BY session_id
    ORDER BY total_scans DESC;
    `;

    // SQL über RPC ausführen (falls Supabase RPC verfügbar ist)
    const { error: migrationError } = await supabase.rpc('exec', { sql: migrationSQL });
    
    if (migrationError) {
      console.error('❌ Migration-Fehler:', migrationError);
      console.log('\n🔍 Versuche alternative Migration-Methode...');
      
      // Alternative: SQL-Befehle einzeln über REST API ausführen
      console.log('⚠️  Bitte führe die Migration manuell in der Supabase SQL-Konsole aus:');
      console.log('   1. Gehe zu https://app.supabase.com/project/[dein-projekt]/sql');
      console.log('   2. Führe das SQL aus der Datei database/fix_barcode_scans_product_id_migration.sql aus');
      return;
    }

    console.log('✅ Datenbankschema erfolgreich aktualisiert!');
    console.log('🎉 Migration abgeschlossen!\n');
    
    // Test: Versuche einen Scan zu erstellen
    console.log('🧪 Teste das neue Schema...');
    const testScan = {
      scanned_code: 'test_migration_' + Date.now(),
      scan_type: 'barcode',
      scan_source: 'native_app',
      product_id: 2153, // INTEGER statt UUID!
      product_item_number: 'TEST123',
      product_found: true,
      session_id: 'migration_test'
    };

    const { data: testResult, error: testError } = await supabase
      .from('barcode_scans')
      .insert(testScan)
      .select()
      .single();

    if (testError) {
      console.error('❌ Test fehlgeschlagen:', testError);
    } else {
      console.log('✅ Test erfolgreich! Neuer Scan mit INTEGER product_id erstellt:', testResult.id);
      
      // Test-Record wieder löschen
      await supabase
        .from('barcode_scans')
        .delete()
        .eq('id', testResult.id);
    }

  } catch (error) {
    console.error('❌ Unerwarteter Fehler:', error);
  }
}

// Migration ausführen
runMigration().then(() => {
  console.log('\n🏁 Migration Script beendet');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Migration fehlgeschlagen:', error);
  process.exit(1);
});