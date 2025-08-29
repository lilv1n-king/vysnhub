#!/bin/bash

# 🚨 VYSN Hub Monitoring Deployment Script
# Richtet das System-Monitoring für Production ein

set -e

echo "🚀 Deploying VYSN Hub Monitoring System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}This script should not be run as root${NC}"
   exit 1
fi

# Check environment
if [ "$NODE_ENV" != "production" ]; then
    echo -e "${YELLOW}Warning: Not running in production environment${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Verify email configuration
echo "📧 Checking email configuration..."
if [ -z "$EMAIL_HOST" ] || [ -z "$EMAIL_USER" ] || [ -z "$EMAIL_PASS" ]; then
    echo -e "${RED}Error: Email configuration incomplete. Please set EMAIL_HOST, EMAIL_USER, EMAIL_PASS${NC}"
    echo "Example:"
    echo "EMAIL_HOST=smtp.gmail.com"
    echo "EMAIL_PORT=587"
    echo "EMAIL_USER=your-app@gmail.com"
    echo "EMAIL_PASS=your-app-password"
    exit 1
fi

# Test email configuration
echo "🧪 Testing email configuration..."
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: '$EMAIL_HOST',
  port: $EMAIL_PORT,
  auth: { user: '$EMAIL_USER', pass: '$EMAIL_PASS' }
});
transporter.verify()
  .then(() => console.log('✅ Email configuration valid'))
  .catch(err => { console.error('❌ Email test failed:', err.message); process.exit(1); });
"

# Start the monitoring
echo "🔄 Starting monitoring service..."
npm run start &
BACKEND_PID=$!

# Wait a moment for startup
sleep 5

# Test health endpoints
echo "🩺 Testing health endpoints..."
curl -f http://localhost:3001/api/health/simple || {
    echo -e "${RED}❌ Backend health check failed${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
}

echo -e "${GREEN}✅ VYSN Hub Monitoring System deployed successfully!${NC}"
echo
echo "📊 Monitoring Dashboard:"
echo "  Backend Health: http://localhost:3001/api/health"
echo "  Metrics: http://localhost:3001/api/health/metrics"
echo "  Simple Check: http://localhost:3001/api/health/simple"
echo
echo "🚨 Alert Configuration:"
echo "  Alert Email: levin.normann98@gmail.com"
echo "  Check Interval: Every 5 minutes"
echo "  Failure Threshold: 3 consecutive failures"
echo "  Alert Cooldown: 30 minutes"
echo
echo "📝 Logs: tail -f logs/monitoring.log"

# Create monitoring log directory
mkdir -p logs

echo -e "${GREEN}🎉 Monitoring system is now active!${NC}"
echo "You will receive email alerts if any services go down."