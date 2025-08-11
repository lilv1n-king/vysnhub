# 🛒 Warenkorb Fix: Session-ID Persistierung

## Problem
Der Warenkorb leerte sich nach wenigen Minuten, weil die Session-ID bei jedem Backend-Request neu generiert wurde (`'anonymous_' + Date.now()`). Dies führte dazu, dass das Backend immer neue Warenkörbe erstellte, anstatt den bestehenden zu laden.

## Lösung

### 1. Session-ID Persistierung
- **Datei**: `nativeapp/lib/contexts/CartContext.tsx`
- Session-ID wird jetzt in AsyncStorage gespeichert: `vysn_session_id`
- Neue Session-ID wird nur bei allererster App-Installation erstellt
- Format: `anonymous_${timestamp}_${randomString}` für bessere Eindeutigkeit

### 2. Verbesserte getSessionId() Funktion
```typescript
const getSessionId = () => {
  // Für eingeloggte User: Access Token als Session-ID
  // Für Gäste: persistente Anonymous Session-ID
  return accessToken || sessionId || 'anonymous_fallback_' + Date.now();
};
```

### 3. Optimierte Backend-Synchronisation
- Lokaler Warenkorb wird vor Backend-Sync gesichert
- Bei Backend-Fehlern bleibt lokaler Warenkorb erhalten
- Bessere Logging für Debugging
- Smart-Merge zwischen lokalen und Backend-Daten

### 4. Token-Refresh Handling
- Session-ID bleibt bei Token-Refresh erhalten
- Separate useEffect für Gast-Sessions
- Verbesserte Migration zwischen Session-Cart und User-Cart

## Geänderte Dateien

1. **`nativeapp/lib/contexts/CartContext.tsx`**
   - `sessionId` State hinzugefügt
   - `loadSessionId()` Funktion für Persistierung
   - Verbesserte `syncWithBackend()` Funktion
   - Optimierte useEffect Hooks
   - Bessere Backend-Sync Bedingungen

2. **`nativeapp/lib/services/cartApiService.ts`**
   - Erweiterte Logging-Informationen
   - Bessere Session-ID Debugging-Ausgabe

## Vorteile

### ✅ Für Gäste:
- Warenkorb bleibt zwischen App-Neustarts erhalten
- Konsistente Session-ID verhindert Datenverlust
- Offline-Funktionalität weiterhin gewährleistet

### ✅ Für eingeloggte User:
- Nahtlose Migration von Gast- zu User-Account
- Synchronisierung zwischen Geräten
- Robuste Token-Refresh Behandlung

### ✅ Für Entwickler:
- Bessere Debugging-Informationen
- Robuste Fehlerbehandlung
- Klare Session-Management Logik

## Testing

### Manual Testing:
1. **Gast-Warenkorb**: Artikel hinzufügen → App schließen → App öffnen → Artikel noch da?
2. **Login-Migration**: Als Gast Artikel hinzufügen → Einloggen → Artikel übernommen?
3. **Token-Refresh**: Bei längerer App-Nutzung → Warenkorb bleibt erhalten?
4. **Offline/Online**: Offline Artikel hinzufügen → Online gehen → Synchronisierung?

### Console Logs prüfen:
- `🔄 Migrating cart from session: ... to user token`
- `📦 Adding to cart - Session ID: ... User: true/false`
- `✅ Successfully added to backend cart`

## Rollback
Falls Probleme auftreten, können die Änderungen einfach rückgängig gemacht werden:
1. `getSessionId()` auf alte Implementierung zurücksetzen
2. `sessionId` State und `loadSessionId()` entfernen
3. useEffect Hooks auf ursprünglichen Zustand zurücksetzen

Die lokale AsyncStorage wird durch die Änderungen nicht beeinträchtigt.