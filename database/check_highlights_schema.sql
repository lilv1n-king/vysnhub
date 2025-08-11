-- =============================================
-- CHECK HIGHLIGHTS SCHEMA
-- =============================================
-- Prüft ob die home_highlights Tabelle das neue Schema hat

-- Prüfe ob home_highlights Tabelle existiert
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'home_highlights') 
        THEN '✅ Tabelle home_highlights existiert'
        ELSE '❌ Tabelle home_highlights existiert NICHT'
    END as table_status;

-- Prüfe vorhandene Spalten
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'home_highlights' 
ORDER BY ordinal_position;

-- Prüfe ob multilingual Spalten existieren
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'home_highlights' 
            AND column_name IN ('title_de', 'title_en', 'action_type', 'action_params')
        ) 
        THEN '✅ MULTILINGUAL SCHEMA - Neue Spalten vorhanden'
        ELSE '⚠️ ALTES SCHEMA - Migration erforderlich'
    END as schema_status;

-- Prüfe ob Function existiert
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.routines 
            WHERE routine_name = 'get_home_highlights'
            AND routine_type = 'FUNCTION'
        ) 
        THEN '✅ Function get_home_highlights() existiert'
        ELSE '❌ Function get_home_highlights() fehlt'
    END as function_status;

-- Zeige aktuelle Highlights an
SELECT 
    COUNT(*) as total_highlights,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_highlights
FROM home_highlights
WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'home_highlights');

-- Test der Function (falls vorhanden)
SELECT 
    'DEUTSCH' as language,
    title,
    action_type,
    action_params
FROM get_home_highlights('de')
WHERE EXISTS (
    SELECT FROM information_schema.routines 
    WHERE routine_name = 'get_home_highlights'
)
LIMIT 3;

SELECT 
    'ENGLISH' as language,
    title,
    action_type,
    action_params
FROM get_home_highlights('en')
WHERE EXISTS (
    SELECT FROM information_schema.routines 
    WHERE routine_name = 'get_home_highlights'
)
LIMIT 3;
