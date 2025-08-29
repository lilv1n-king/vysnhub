/**
 * 🩺 VYSN Hub Health Check Endpoints
 * 
 * Provides comprehensive health status for monitoring systems
 */

import { Router, Request, Response } from 'express';
import { envConfig } from '../config/env';
import { logger } from '../utils/logger';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: ServiceHealth;
    openai: ServiceHealth;
    email: ServiceHealth;
  };
  system: {
    memory: MemoryInfo;
    cpu: number;
  };
}

interface ServiceHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  error?: string;
}

interface MemoryInfo {
  used: number;
  total: number;
  percentage: number;
}

/**
 * GET /api/health
 * Main health check endpoint
 */
router.get('/', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const healthStatus: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: envConfig.nodeEnv,
      services: {
        database: await checkDatabaseHealth(),
        openai: await checkOpenAIHealth(),
        email: checkEmailHealth()
      },
      system: {
        memory: getMemoryInfo(),
        cpu: process.cpuUsage().user / 1000000 // Convert to seconds
      }
    };

    // Determine overall status based on services
    const serviceStatuses = Object.values(healthStatus.services).map(s => s.status);
    if (serviceStatuses.includes('unhealthy')) {
      healthStatus.status = 'unhealthy';
    } else if (serviceStatuses.includes('degraded')) {
      healthStatus.status = 'degraded';
    }

    const responseTime = Date.now() - startTime;
    
    // Log slow responses
    if (responseTime > 2000) {
      logger.warn('Slow health check response', { responseTime });
    }

    // Return appropriate HTTP status
    const httpStatus = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'degraded' ? 200 : 503;

    res.status(httpStatus).json({
      ...healthStatus,
      responseTime
    });

  } catch (error) {
    logger.error('Health check failed', { error });
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    });
  }
});

/**
 * GET /api/health/simple
 * Simple health check for load balancers
 */
router.get('/simple', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * GET /api/health/database
 * Database-specific health check
 */
router.get('/database', async (req: Request, res: Response) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    const httpStatus = dbHealth.status === 'healthy' ? 200 : 503;
    
    res.status(httpStatus).json(dbHealth);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Database check failed'
    });
  }
});

/**
 * Database Health Check
 */
async function checkDatabaseHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(envConfig.supabaseUrl, envConfig.supabaseKey);
    
    // Simple query to test connection
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        status: 'unhealthy',
        responseTime,
        error: error.message
      };
    }

    return {
      status: responseTime > 2000 ? 'degraded' : 'healthy',
      responseTime
    };

  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Connection failed'
    };
  }
}

/**
 * OpenAI API Health Check
 */
async function checkOpenAIHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${envConfig.openaiApiKey}`,
        'User-Agent': 'VYSN-HealthCheck/1.0'
      },
      timeout: 5000
    });

    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return {
        status: responseTime > 3000 ? 'degraded' : 'healthy',
        responseTime
      };
    } else {
      return {
        status: 'unhealthy',
        responseTime,
        error: `HTTP ${response.status}`
      };
    }

  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'OpenAI API unreachable'
    };
  }
}

/**
 * Email Service Health Check
 */
function checkEmailHealth(): ServiceHealth {
  const emailConfig = envConfig.emailConfig;
  
  if (!emailConfig.host || !emailConfig.user || !emailConfig.pass) {
    return {
      status: 'degraded',
      error: 'Email configuration incomplete'
    };
  }
  
  return {
    status: 'healthy'
  };
}

/**
 * System Memory Information
 */
function getMemoryInfo(): MemoryInfo {
  const memUsage = process.memoryUsage();
  const totalMem = memUsage.heapTotal;
  const usedMem = memUsage.heapUsed;
  
  return {
    used: Math.round(usedMem / 1024 / 1024), // MB
    total: Math.round(totalMem / 1024 / 1024), // MB
    percentage: Math.round((usedMem / totalMem) * 100)
  };
}

/**
 * GET /api/health/metrics
 * Detailed system metrics for monitoring
 */
router.get('/metrics', (req: Request, res: Response) => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  res.json({
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    },
    cpu: {
      user: cpuUsage.user / 1000000, // Convert to seconds
      system: cpuUsage.system / 1000000
    },
    process: {
      pid: process.pid,
      version: process.version,
      platform: process.platform,
      arch: process.arch
    },
    environment: envConfig.nodeEnv
  });
});

export default router;