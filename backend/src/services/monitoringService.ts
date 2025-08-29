/**
 * 🚨 VYSN Hub System Monitoring Service
 * 
 * Überwacht Frontend & Backend Gesundheit und sendet Alerts an levin.normann98@gmail.com
 */

import { logger } from '../utils/logger';
import { envConfig } from '../config/env';
import nodemailer from 'nodemailer';
import fetch from 'node-fetch';

interface HealthCheckResult {
  service: 'frontend' | 'backend' | 'database' | 'openai';
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  error?: string;
  timestamp: Date;
  details?: any;
}

interface AlertState {
  lastAlertSent: Date | null;
  consecutiveFailures: number;
  isCurrentlyDown: boolean;
}

class MonitoringService {
  private static instance: MonitoringService;
  private alertStates: Map<string, AlertState> = new Map();
  private emailTransporter: nodemailer.Transporter | null = null;
  
  // Alert Configuration
  private readonly ALERT_EMAIL = 'levin.normann98@gmail.com';
  private readonly MAX_CONSECUTIVE_FAILURES = 3; // 3 failures before alert
  private readonly ALERT_COOLDOWN_MINUTES = 30; // Wait 30min before next alert for same issue
  private readonly HEALTH_CHECK_INTERVAL_MINUTES = 5; // Check every 5 minutes
  
  // Service URLs
  private readonly BACKEND_HEALTH_URL = envConfig.isDevelopment 
    ? 'http://localhost:3001/api/health'
    : 'https://api.vysnlighting.com/api/health';
    
  private readonly FRONTEND_HEALTH_URL = envConfig.isDevelopment
    ? 'http://localhost:3000/api/health'
    : 'https://vysnhub.com/api/health';

  private constructor() {
    this.initializeEmailTransporter();
    this.initializeAlertStates();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  private initializeEmailTransporter(): void {
    try {
      const emailConfig = envConfig.emailConfig;
      
      if (!emailConfig.host || !emailConfig.user || !emailConfig.pass) {
        logger.warn('Email configuration incomplete - monitoring alerts will be logged only');
        return;
      }

      this.emailTransporter = nodemailer.createTransporter({
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.port === 465,
        auth: {
          user: emailConfig.user,
          pass: emailConfig.pass
        }
      });

      logger.info('Email transporter initialized for monitoring alerts');
    } catch (error) {
      logger.error('Failed to initialize email transporter', { error });
    }
  }

  private initializeAlertStates(): void {
    const services = ['frontend', 'backend', 'database', 'openai'];
    services.forEach(service => {
      this.alertStates.set(service, {
        lastAlertSent: null,
        consecutiveFailures: 0,
        isCurrentlyDown: false
      });
    });
  }

  /**
   * Führt Health Check für alle Services durch
   */
  public async performHealthChecks(): Promise<HealthCheckResult[]> {
    logger.info('Starting system health checks');
    
    const results: HealthCheckResult[] = [];

    // Backend Health Check
    results.push(await this.checkBackendHealth());
    
    // Frontend Health Check  
    results.push(await this.checkFrontendHealth());
    
    // Database Health Check
    results.push(await this.checkDatabaseHealth());
    
    // OpenAI API Health Check
    results.push(await this.checkOpenAIHealth());

    // Process results and send alerts if needed
    await this.processHealthCheckResults(results);

    return results;
  }

  private async checkBackendHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(this.BACKEND_HEALTH_URL, {
        method: 'GET',
        timeout: 10000, // 10 second timeout
        headers: { 'User-Agent': 'VYSN-Monitor/1.0' }
      });

      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        return {
          service: 'backend',
          status: responseTime > 5000 ? 'degraded' : 'healthy',
          responseTime,
          timestamp: new Date(),
          details: data
        };
      } else {
        return {
          service: 'backend',
          status: 'unhealthy',
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date()
        };
      }
    } catch (error) {
      return {
        service: 'backend',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date()
      };
    }
  }

  private async checkFrontendHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(this.FRONTEND_HEALTH_URL, {
        method: 'GET',
        timeout: 15000, // 15 second timeout for frontend
        headers: { 'User-Agent': 'VYSN-Monitor/1.0' }
      });

      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return {
          service: 'frontend',
          status: responseTime > 8000 ? 'degraded' : 'healthy',
          responseTime,
          timestamp: new Date()
        };
      } else {
        return {
          service: 'frontend',
          status: 'unhealthy',
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date()
        };
      }
    } catch (error) {
      return {
        service: 'frontend',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date()
      };
    }
  }

  private async checkDatabaseHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Simple Supabase connection test
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(envConfig.supabaseUrl, envConfig.supabaseKey);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      const responseTime = Date.now() - startTime;

      if (error) {
        return {
          service: 'database',
          status: 'unhealthy',
          responseTime,
          error: error.message,
          timestamp: new Date()
        };
      }

      return {
        service: 'database',
        status: responseTime > 3000 ? 'degraded' : 'healthy',
        responseTime,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date()
      };
    }
  }

  private async checkOpenAIHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${envConfig.openaiApiKey}`,
          'User-Agent': 'VYSN-Monitor/1.0'
        }
      });

      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return {
          service: 'openai',
          status: responseTime > 5000 ? 'degraded' : 'healthy',
          responseTime,
          timestamp: new Date()
        };
      } else {
        return {
          service: 'openai',
          status: 'unhealthy',
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date()
        };
      }
    } catch (error) {
      return {
        service: 'openai',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date()
      };
    }
  }

  private async processHealthCheckResults(results: HealthCheckResult[]): Promise<void> {
    for (const result of results) {
      const alertState = this.alertStates.get(result.service);
      if (!alertState) continue;

      if (result.status === 'unhealthy') {
        alertState.consecutiveFailures++;
        
        // Send alert if threshold reached and cooldown period passed
        if (alertState.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES) {
          const shouldSendAlert = !alertState.lastAlertSent || 
            (Date.now() - alertState.lastAlertSent.getTime()) > (this.ALERT_COOLDOWN_MINUTES * 60 * 1000);
          
          if (shouldSendAlert) {
            await this.sendAlert(result);
            alertState.lastAlertSent = new Date();
            alertState.isCurrentlyDown = true;
          }
        }
      } else {
        // Service is healthy - reset failure counter and send recovery alert if was down
        if (alertState.isCurrentlyDown && alertState.consecutiveFailures > 0) {
          await this.sendRecoveryAlert(result);
        }
        
        alertState.consecutiveFailures = 0;
        alertState.isCurrentlyDown = false;
      }
    }
  }

  private async sendAlert(result: HealthCheckResult): Promise<void> {
    const subject = `🚨 VYSN Hub Alert: ${result.service.toUpperCase()} Service Down`;
    const message = this.generateAlertMessage(result);

    logger.error(`System Alert: ${result.service} service is down`, { result });

    if (this.emailTransporter) {
      try {
        await this.emailTransporter.sendMail({
          from: envConfig.emailConfig.user,
          to: this.ALERT_EMAIL,
          subject,
          html: message,
          priority: 'high'
        });
        
        logger.info(`Alert email sent to ${this.ALERT_EMAIL}`, { service: result.service });
      } catch (error) {
        logger.error('Failed to send alert email', { error, service: result.service });
      }
    }
  }

  private async sendRecoveryAlert(result: HealthCheckResult): Promise<void> {
    const subject = `✅ VYSN Hub Recovery: ${result.service.toUpperCase()} Service Restored`;
    const message = this.generateRecoveryMessage(result);

    logger.info(`System Recovery: ${result.service} service is back online`, { result });

    if (this.emailTransporter) {
      try {
        await this.emailTransporter.sendMail({
          from: envConfig.emailConfig.user,
          to: this.ALERT_EMAIL,
          subject,
          html: message
        });
      } catch (error) {
        logger.error('Failed to send recovery email', { error, service: result.service });
      }
    }
  }

  private generateAlertMessage(result: HealthCheckResult): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc3545; color: white; padding: 20px; text-align: center;">
            <h1>🚨 VYSN Hub System Alert</h1>
          </div>
          
          <div style="padding: 20px; background: #f8f9fa;">
            <h2>Service Down: ${result.service.toUpperCase()}</h2>
            
            <div style="background: white; padding: 15px; border-left: 4px solid #dc3545; margin: 15px 0;">
              <strong>Status:</strong> ${result.status}<br>
              <strong>Time:</strong> ${result.timestamp.toLocaleString('de-DE')}<br>
              <strong>Response Time:</strong> ${result.responseTime}ms<br>
              ${result.error ? `<strong>Error:</strong> ${result.error}<br>` : ''}
            </div>
            
            <h3>🔧 Immediate Actions Required:</h3>
            <ul>
              <li>Check server logs and system resources</li>
              <li>Verify network connectivity and DNS resolution</li>
              <li>Restart ${result.service} service if necessary</li>
              <li>Monitor for recovery within next 10-15 minutes</li>
            </ul>
            
            <div style="background: #fff3cd; padding: 10px; border-radius: 4px; margin: 15px 0;">
              <strong>Note:</strong> This alert was triggered after ${this.MAX_CONSECUTIVE_FAILURES} consecutive failures.
            </div>
          </div>
          
          <div style="background: #6c757d; color: white; padding: 10px; text-align: center; font-size: 12px;">
            VYSN Hub Monitoring System - ${new Date().toISOString()}
          </div>
        </body>
      </html>
    `;
  }

  private generateRecoveryMessage(result: HealthCheckResult): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #28a745; color: white; padding: 20px; text-align: center;">
            <h1>✅ VYSN Hub Service Recovered</h1>
          </div>
          
          <div style="padding: 20px; background: #f8f9fa;">
            <h2>Service Restored: ${result.service.toUpperCase()}</h2>
            
            <div style="background: white; padding: 15px; border-left: 4px solid #28a745; margin: 15px 0;">
              <strong>Status:</strong> ${result.status}<br>
              <strong>Recovery Time:</strong> ${result.timestamp.toLocaleString('de-DE')}<br>
              <strong>Current Response Time:</strong> ${result.responseTime}ms
            </div>
            
            <p>The ${result.service} service is now responding normally. The system has automatically recovered.</p>
          </div>
          
          <div style="background: #6c757d; color: white; padding: 10px; text-align: center; font-size: 12px;">
            VYSN Hub Monitoring System - ${new Date().toISOString()}
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Startet das kontinuierliche Monitoring
   */
  public startMonitoring(): void {
    logger.info('Starting VYSN Hub system monitoring', {
      interval: this.HEALTH_CHECK_INTERVAL_MINUTES,
      alertEmail: this.ALERT_EMAIL
    });

    // Initial health check
    this.performHealthChecks();

    // Schedule regular health checks
    setInterval(() => {
      this.performHealthChecks().catch(error => {
        logger.error('Health check failed', { error });
      });
    }, this.HEALTH_CHECK_INTERVAL_MINUTES * 60 * 1000);
  }

  /**
   * Stoppt das Monitoring (für Shutdown)
   */
  public stopMonitoring(): void {
    logger.info('Stopping VYSN Hub system monitoring');
  }
}

export const monitoringService = MonitoringService.getInstance();