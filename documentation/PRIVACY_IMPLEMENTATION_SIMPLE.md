# Vereinfachte Privacy-Implementation

Die Datenschutz-Zustimmung wird direkt in der `profiles` Tabelle gespeichert, anstatt in einer separaten `privacy_consents` Tabelle.

## Vorteile dieser Lösung:

✅ **Einfacher**: Weniger Tabellen, weniger Joins  
✅ **Performanter**: Direkter Zugriff über User-Profile  
✅ **Logischer**: Privacy-Status gehört zu den Benutzerdaten  
✅ **Wartungsfreundlicher**: Weniger Code, weniger Komplexität  

## Datenbankstruktur

### Neue Felder in `profiles` Tabelle:

```sql
-- Privacy Consent Felder
privacy_consent_given BOOLEAN DEFAULT NULL,
privacy_consent_version VARCHAR(20) DEFAULT NULL,
privacy_consent_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
privacy_consent_ip INET DEFAULT NULL,
privacy_consent_user_agent TEXT DEFAULT NULL,
privacy_withdrawn_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
```

### Zustände:

| privacy_consent_given | privacy_withdrawn_date | Status |
|----------------------|------------------------|---------|
| `NULL` | `NULL` | Nie gefragt |
| `true` | `NULL` | Zugestimmt |
| `false` | `NULL` | Abgelehnt |
| `true`/`false` | `<date>` | Widerrufen |

## API-Endpunkte

Bleiben unverändert, aber die Implementation ist vereinfacht:

- `GET /api/privacy/policy` - Datenschutzerklärung
- `GET /api/privacy/consent` - Consent-Status
- `POST /api/privacy/consent` - Zustimmung speichern
- `DELETE /api/privacy/consent` - Zustimmung widerrufen
- `GET /api/privacy/consent/history` - Vereinfachte Historie

## Migration

Das Script `add_privacy_to_profiles.sql` fügt die neuen Felder hinzu und migriert eventuelle Daten aus der alten `privacy_consents` Tabelle.

```bash
# Migration ausführen
psql -f database/add_privacy_to_profiles.sql

# Alte Tabelle entfernen (optional)
DROP TABLE IF EXISTS privacy_consents;
```

## Frontend-Integration

Die Frontend-Implementation bleibt unverändert, da die API-Endpunkte gleich bleiben.

## DSGVO-Konformität

Alle DSGVO-Anforderungen bleiben erfüllt:
- ✅ Explizite Einwilligung
- ✅ Widerruf möglich  
- ✅ Transparenz über Datenverarbeitung
- ✅ Protokollierung von Consent-Änderungen
- ✅ Benutzerrechte implementiert

## Code-Vereinfachung

- Weniger Interfaces
- Einfachere Queries  
- Direkter Zugriff auf Privacy-Status
- Weniger Fehlerquellen
- Bessere Performance

Diese Lösung ist wartungsfreundlicher und erfüllt alle Anforderungen bei deutlich reduzierter Komplexität.
