/**
 * 🔒 SICHERHEITS-UPDATE: Sichere Environment Variable Verwaltung
 * 
 * Zentrale Validierung und sichere Handhabung von Umgebungsvariablen
 */

import dotenv from 'dotenv';
import { logger } from '../utils/logger';

// Load environment variables
dotenv.config();

interface RequiredEnvVars {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  SUPABASE_SERVICE_ROLE: string;
  OPENAI_API_KEY: string;
  ADMIN_EMAILS: string;
}

interface OptionalEnvVars {
  NODE_ENV?: string;
  PORT?: string;
  FRONTEND_URL?: string;
  EMAIL_HOST?: string;
  EMAIL_PORT?: string;
  EMAIL_USER?: string;
  EMAIL_PASS?: string;
}

class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  private envVars: RequiredEnvVars & OptionalEnvVars;

  private constructor() {
    this.validateAndLoadEnvVars();
  }

  public static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  private validateAndLoadEnvVars(): void {
    const required: (keyof RequiredEnvVars)[] = [
      'SUPABASE_URL',
      'SUPABASE_KEY', 
      'SUPABASE_SERVICE_ROLE',
      'OPENAI_API_KEY',
      'ADMIN_EMAILS'
    ];

    const missing: string[] = [];
    
    // Check required variables
    required.forEach(key => {
      if (!process.env[key]) {
        missing.push(key);
      }
    });

    if (missing.length > 0) {
      logger.error('Missing required environment variables', { missing });
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Validate specific formats
    this.validateEnvFormat('SUPABASE_URL', process.env.SUPABASE_URL!, /^https:\/\/.+\.supabase\.co$/);
    this.validateEnvFormat('ADMIN_EMAILS', process.env.ADMIN_EMAILS!, /.+@.+\..+/);

    this.envVars = {
      SUPABASE_URL: process.env.SUPABASE_URL!,
      SUPABASE_KEY: process.env.SUPABASE_KEY!,
      SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE!,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
      ADMIN_EMAILS: process.env.ADMIN_EMAILS!,
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: process.env.PORT || '3001',
      FRONTEND_URL: process.env.FRONTEND_URL,
      EMAIL_HOST: process.env.EMAIL_HOST,
      EMAIL_PORT: process.env.EMAIL_PORT,
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASS: process.env.EMAIL_PASS
    };

    logger.info('Environment configuration loaded successfully', {
      nodeEnv: this.envVars.NODE_ENV,
      port: this.envVars.PORT,
      adminEmailsConfigured: this.envVars.ADMIN_EMAILS ? 'YES' : 'NO'
    });
  }

  private validateEnvFormat(name: string, value: string, pattern: RegExp): void {
    if (!pattern.test(value)) {
      throw new Error(`Invalid format for environment variable ${name}`);
    }
  }

  // Sichere Getter-Methoden
  get supabaseUrl(): string { return this.envVars.SUPABASE_URL; }
  get supabaseKey(): string { return this.envVars.SUPABASE_KEY; }
  get supabaseServiceRole(): string { return this.envVars.SUPABASE_SERVICE_ROLE; }
  get openaiApiKey(): string { return this.envVars.OPENAI_API_KEY; }
  get adminEmails(): string[] { 
    return this.envVars.ADMIN_EMAILS.split(',').map(email => email.trim());
  }
  
  get nodeEnv(): string { return this.envVars.NODE_ENV || 'development'; }
  get port(): number { return parseInt(this.envVars.PORT || '3001', 10); }
  get frontendUrl(): string | undefined { return this.envVars.FRONTEND_URL; }
  get isProduction(): boolean { return this.nodeEnv === 'production'; }
  get isDevelopment(): boolean { return this.nodeEnv === 'development'; }

  // Email configuration getters
  get emailConfig() {
    return {
      host: this.envVars.EMAIL_HOST,
      port: parseInt(this.envVars.EMAIL_PORT || '587', 10),
      user: this.envVars.EMAIL_USER,
      pass: this.envVars.EMAIL_PASS
    };
  }

  // Security: Mask sensitive values for logging
  public getSafeConfigForLogging() {
    return {
      NODE_ENV: this.nodeEnv,
      PORT: this.port,
      SUPABASE_URL: this.supabaseUrl,
      ADMIN_EMAILS_COUNT: this.adminEmails.length,
      FRONTEND_URL: this.frontendUrl,
      EMAIL_CONFIGURED: !!(this.envVars.EMAIL_HOST && this.envVars.EMAIL_USER),
      // Sensitive values are intentionally excluded
    };
  }
}

// Export singleton instance
export const envConfig = EnvironmentConfig.getInstance();

// Legacy exports for backward compatibility (deprecated)
export const getEnvVar = (key: string, defaultValue?: string): string => {
  logger.warn('Deprecated getEnvVar usage detected', { key });
  return process.env[key] || defaultValue || '';
};