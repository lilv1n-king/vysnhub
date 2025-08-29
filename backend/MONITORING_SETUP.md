# 🚨 VYSN Hub System Monitoring Setup

## Übersicht

Das VYSN Hub System verfügt über ein umfassendes Monitoring-System, das **automatisch E-Mail-Alerts** an `levin.normann98@gmail.com` sendet, wenn Frontend oder Backend nicht mehr funktionieren.

## ⚡ Quick Setup

### 1. Email Konfiguration in .env
```bash
# Email Configuration für Monitoring Alerts
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-system-email@gmail.com
EMAIL_PASS=your-app-password  # Gmail App-Password verwenden!

# Admin Emails (für erste Admin-Berechtigung)
ADMIN_EMAILS=levin.normann98@gmail.com
```

### 2. Monitoring starten
```bash
# Development
npm run dev

# Production
npm run start
# oder
./scripts/deploy-monitoring.sh
```

Das Monitoring startet **automatisch** mit dem Backend-Server!

---

## 🔧 Monitoring Features

### ✅ **Überwachte Services**
- **Backend API** (Express.js)
- **Frontend** (Next.js)
- **Database** (Supabase)
- **OpenAI API**
- **Email Service**

### 📊 **Health Check Endpoints**

#### Backend Health Checks:
- `GET /api/health` - Vollständiger Health Status
- `GET /api/health/simple` - Einfacher Status für Load Balancer
- `GET /api/health/database` - Nur Database Status
- `GET /api/health/metrics` - Detaillierte System-Metriken

#### Frontend Health Check:
- `GET /api/health` (Next.js Route) - Frontend Status

### 🚨 **Alert System**

**Alert Email:** `levin.normann98@gmail.com` (fest konfiguriert)

**Alert Trigger:**
- 3 aufeinanderfolgende Fehlschläge
- Check-Interval: **Alle 5 Minuten**
- Alert-Cooldown: **30 Minuten** (verhindert Spam)

**Alert-Typen:**
1. **🚨 Service Down Alert** - Wenn Service nicht erreichbar
2. **✅ Recovery Alert** - Wenn Service wieder online
3. **⚠️ Degraded Performance** - Wenn Service langsam antwortet

---

## 📧 Email Alert Beispiel

### 🚨 Service Down Alert
```
Subject: 🚨 VYSN Hub Alert: BACKEND Service Down

Service Down: BACKEND
Status: unhealthy
Time: 29.08.2025, 14:30:15
Response Time: 5000ms
Error: Connection timeout

🔧 Immediate Actions Required:
- Check server logs and system resources  
- Verify network connectivity
- Restart backend service if necessary
- Monitor for recovery within next 10-15 minutes
```

### ✅ Recovery Alert
```
Subject: ✅ VYSN Hub Recovery: BACKEND Service Restored

Service Restored: BACKEND
Status: healthy
Recovery Time: 29.08.2025, 14:45:22
Current Response Time: 250ms

The backend service is now responding normally.
```

---

## 🛠️ Konfiguration

### Monitoring Parameter (in `monitoringService.ts`):
```typescript
ALERT_EMAIL = 'levin.normann98@gmail.com'  // Fest konfiguriert
MAX_CONSECUTIVE_FAILURES = 3               // 3 Fehler → Alert
ALERT_COOLDOWN_MINUTES = 30               // 30min Pause
HEALTH_CHECK_INTERVAL_MINUTES = 5         // Check alle 5min
```

### Service URLs:
- **Development Backend:** `http://localhost:3001/api/health`
- **Production Backend:** `https://api.vysnlighting.com/api/health`
- **Development Frontend:** `http://localhost:3000/api/health`
- **Production Frontend:** `https://vysnhub.com/api/health`

---

## 🔍 Monitoring Dashboard

### Live System Status:
```bash
# Aktueller Backend Status
curl http://localhost:3001/api/health

# System Metriken  
curl http://localhost:3001/api/health/metrics

# Frontend Status
curl http://localhost:3000/api/health
```

### Log Monitoring:
```bash
# Backend Logs (mit Monitoring Events)
tail -f logs/app.log

# PM2 Logs (falls verwendet)
pm2 logs vysn-backend
```

---

## 🚀 Production Deployment

### Automatisches Deployment:
```bash
./scripts/deploy-monitoring.sh
```

### Manuelle Konfiguration:
1. Email-Konfiguration in `.env` setzen
2. Backend starten: `npm run start`
3. Monitoring läuft automatisch im Hintergrund
4. Logs prüfen: `tail -f logs/monitoring.log`

### Systemd Service (Optional):
```bash
# Systemd Service erstellen für automatischen Start
sudo systemctl enable vysn-monitoring
sudo systemctl start vysn-monitoring
```

---

## 🔧 Troubleshooting

### Email Alerts kommen nicht an:
1. **Gmail App-Password verwenden** (nicht normales Passwort)
2. 2FA muss aktiviert sein für App-Passwords
3. Email-Config in `.env` prüfen
4. Test: `node -e "require('./src/services/monitoringService').monitoringService.performHealthChecks()"`

### False Positive Alerts:
- Check-Interval erhöhen: `HEALTH_CHECK_INTERVAL_MINUTES = 10`
- Failure-Threshold erhöhen: `MAX_CONSECUTIVE_FAILURES = 5`
- Timeout-Werte anpassen in Health-Checks

### Service Recovery nicht erkannt:
- Cooldown-Zeit reduzieren: `ALERT_COOLDOWN_MINUTES = 15`
- Health-Check-Timeouts prüfen
- Network-Latenz berücksichtigen

---

## 📈 Erweiterte Features

### Custom Health Checks hinzufügen:
```typescript
// In monitoringService.ts
private async checkCustomService(): Promise<HealthCheckResult> {
  // Ihre Custom Health Logic hier
}
```

### Monitoring Metriken sammeln:
- Response Times werden automatisch gemessen
- System-Metriken (Memory, CPU) verfügbar
- Custom Metrics können hinzugefügt werden

### Slack/Teams Integration:
- Code erweitern um zusätzliche Notification-Channels
- Webhook-URLs in Environment-Variablen

---

## ✅ **System ist jetzt Live!**

Das Monitoring-System läuft automatisch und sendet Alerts an **levin.normann98@gmail.com** wenn:
- ❌ Backend nicht erreichbar (>3 failures)
- ❌ Frontend nicht erreichbar (>3 failures)  
- ❌ Database Connection Probleme
- ❌ OpenAI API nicht verfügbar
- ✅ Services kommen wieder online (Recovery Alerts)

**Next Steps:**
1. Backend starten → Monitoring läuft automatisch
2. Email-Konfiguration in Production testen
3. Ersten Alert-Test durchführen (Service temporär stoppen)

🎉 **Sie werden jetzt automatisch benachrichtigt bei Systemausfällen!**