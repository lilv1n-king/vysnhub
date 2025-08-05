# Backend API Integration - Native App

## 🎯 Überblick

Die Native App nutzt jetzt das Backend API für alle Project-Management Funktionen, während Auth weiterhin direkt über Supabase läuft.

## 🏗️ Architektur

```
Native App → Supabase Auth (Login/Register)
           ↓ (access_token)
           → Backend API (Projects, User Profile)
           → Supabase Database
```

## 📁 Neue Dateien

### API Layer
- `lib/config/api.ts` - API Konfiguration und Endpoints
- `lib/services/apiService.ts` - HTTP Client mit Retry-Logic
- `lib/services/projectService.ts` - Project API Service
- `lib/services/chatService.ts` - Chat API Service mit Session-Management

### Erweiterte Context
- `lib/contexts/AuthContext.tsx` - Erweitert um Token-Handling

## 🔐 Authentication Flow

1. **Login/Register** → Direkt mit Supabase Auth
2. **Access Token** → Automatisch an Backend API Service weitergegeben
3. **API Calls** → Mit Bearer Token authentifiziert

## 📡 API Endpoints

### Projects
- `GET /api/user-projects` - Alle Projekte
- `GET /api/user-projects/:id` - Einzelnes Projekt
- `POST /api/user-projects` - Projekt erstellen
- `PUT /api/user-projects/:id` - Projekt bearbeiten
- `DELETE /api/user-projects/:id` - Projekt löschen
- `POST /api/user-projects/:id/duplicate` - Projekt kopieren

### Auth
- `GET /api/auth/profile` - User Profil
- `PUT /api/auth/profile` - Profil bearbeiten

### Chat
- `POST /api/chat/message` - Chat-Nachricht senden
- `POST /api/chat/session` - Neue Chat-Session erstellen
- `GET /api/chat/history/:sessionId` - Chat-Verlauf laden

## ⚙️ Konfiguration

### Environment Variablen
```bash
# Backend API
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001

# Supabase (nur für Auth)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Features

#### ✅ Funktionen
- **Auto-Token-Management** - Token wird automatisch gesetzt/entfernt
- **Error Handling** - Spezifische Fehlerbehandlung für API Errors
- **Retry Logic** - Automatische Wiederholung bei Netzwerkfehlern
- **Offline Handling** - Graceful Degradation bei Backend-Ausfall
- **Type Safety** - Vollständig typisierte API Responses

#### 🛡️ Sicherheit
- **Bearer Token** Authentication
- **Token Validation** - Automatische Erneuerung über Supabase
- **Request Timeout** - 10 Sekunden Timeout
- **Error Logging** - Sichere Error-Behandlung

## 🚀 Verwendung

### Project Service
```typescript
import { projectService } from '../services/projectService';

// Projekte laden
const projects = await projectService.getUserProjects();

// Projekt erstellen
const newProject = await projectService.createProject({
  project_name: 'My Project',
  status: 'planning'
});

// Projekt bearbeiten
await projectService.updateProject(id, updateData);
```

### Chat Service
```typescript
import { chatService } from '../services/chatService';

// Session erstellen
const sessionId = await chatService.createSession();

// Nachricht senden
const { response, messages } = await chatService.sendMessage(
  'What LED strips do you recommend for outdoor use?',
  sessionId
);

// Chat-Verlauf laden
const history = await chatService.getChatHistory(sessionId, 50);
```

### Error Handling
```typescript
try {
  const projects = await projectService.getUserProjects();
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      // Benutzer muss sich neu anmelden
    } else {
      // Anderer API Fehler
    }
  } else {
    // Netzwerk/Connection Fehler
  }
}
```

## 📱 Screen Updates

### ProjectsScreen
- ✅ API Integration für Projektliste
- ✅ Projekt erstellen über Backend
- ✅ Projekt kopieren über Backend
- ✅ Verbesserte Error Handling

### ProjectDetailScreen  
- ✅ Projekt laden über Backend
- ✅ Projekt bearbeiten über Backend
- ✅ Projekt löschen über Backend
- ✅ Vollständige CRUD-Funktionalität

### AIChatScreen
- ✅ Chat Integration mit Backend API
- ✅ Session-Management für persistente Gespräche
- ✅ Offline-Fallback mit lokalen Antworten
- ✅ Automatische Wiederverbindung bei Netzwerkfehlern
- ✅ Echtzeit Chat-Verlauf Speicherung

## 🔄 Migration

Die App funktioniert jetzt komplett über das Backend API - alle Supabase Direct-Calls für Projects wurden entfernt und durch API Calls ersetzt.