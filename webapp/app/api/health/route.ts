/**
 * 🩺 VYSN Hub Frontend Health Check Endpoint
 * 
 * Next.js API Route für Frontend Monitoring
 */

import { NextRequest, NextResponse } from 'next/server';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    backend: ServiceHealth;
    build: ServiceHealth;
  };
  system: {
    memory: MemoryInfo;
  };
}

interface ServiceHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  error?: string;
}

interface MemoryInfo {
  used: number;
  percentage: number;
}

/**
 * GET /api/health
 * Main health check endpoint for Next.js frontend
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const healthStatus: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        backend: await checkBackendHealth(),
        build: checkBuildHealth()
      },
      system: {
        memory: getMemoryInfo()
      }
    };

    // Determine overall status
    const serviceStatuses = Object.values(healthStatus.services).map(s => s.status);
    if (serviceStatuses.includes('unhealthy')) {
      healthStatus.status = 'unhealthy';
    } else if (serviceStatuses.includes('degraded')) {
      healthStatus.status = 'degraded';
    }

    const responseTime = Date.now() - startTime;
    
    // Return appropriate HTTP status
    const httpStatus = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'degraded' ? 200 : 503;

    return NextResponse.json({
      ...healthStatus,
      responseTime
    }, { status: httpStatus });

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    }, { status: 503 });
  }
}

/**
 * Backend Health Check
 */
async function checkBackendHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
                      process.env.API_BASE_URL || 
                      'http://localhost:3001';
    
    const response = await fetch(`${backendUrl}/api/health/simple`, {
      method: 'GET',
      headers: { 'User-Agent': 'VYSN-Frontend-HealthCheck/1.0' },
      cache: 'no-store' // Disable caching for health checks
    });

    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return {
        status: responseTime > 5000 ? 'degraded' : 'healthy',
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
      error: error instanceof Error ? error.message : 'Backend unreachable'
    };
  }
}

/**
 * Build Health Check
 * Verifies that the application was built correctly
 */
function checkBuildHealth(): ServiceHealth {
  try {
    // Check if we're in a properly built environment
    const buildId = process.env.BUILD_ID || process.env.VERCEL_GIT_COMMIT_SHA;
    const hasStaticAssets = process.env.NODE_ENV === 'production';
    
    if (process.env.NODE_ENV === 'production' && !buildId) {
      return {
        status: 'degraded',
        error: 'Build ID missing in production'
      };
    }

    return {
      status: 'healthy'
    };

  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Build check failed'
    };
  }
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
    percentage: Math.round((usedMem / totalMem) * 100)
  };
}

/**
 * POST method not allowed
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}