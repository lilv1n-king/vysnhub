import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ⚠️ SICHERHEITS-KONFIGURATION
  
  // Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // 1. Content Security Policy (CSP)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://www.google.com https://cdn.jsdelivr.net https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
              "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
              "img-src 'self' data: https: blob:",
              "media-src 'self' https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "connect-src 'self' https://cajkiixyxznfuieeuqqh.supabase.co wss://cajkiixyxznfuieeuqqh.supabase.co https://api.openai.com",
              process.env.NODE_ENV === 'production' ? "upgrade-insecure-requests" : ""
            ].filter(Boolean).join('; ')
          },
          
          // 2. X-Content-Type-Options
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          
          // 3. X-Frame-Options
          {
            key: 'X-Frame-Options', 
            value: 'DENY'
          },
          
          // 4. X-XSS-Protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          
          // 5. Referrer-Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          
          // 6. Permissions-Policy
          {
            key: 'Permissions-Policy',
            value: [
              'camera=(self)',
              'microphone=()',
              'geolocation=(self)', 
              'payment=()',
              'usb=()',
              'magnetometer=()',
              'gyroscope=()',
              'fullscreen=(self)'
            ].join(', ')
          },
          
          // 7. HSTS (nur in Produktion)
          ...(process.env.NODE_ENV === 'production' ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }] : []),
          
          // 8. Cross-Origin Policies
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Embedder-Policy', 
            value: 'require-corp'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          }
        ]
      }
    ]
  },
  
  // Weitere Sicherheitsoptionen
  experimental: {
    // Server Components verwenden (sicherer)
    serverComponents: true
  },
  
  // Image-Optimization Sicherheit
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  
  // Webpack-Konfiguration für Sicherheit
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Produktions-Optimierungen
      config.optimization = {
        ...config.optimization,
        minimize: true,
        // Source Maps nur in Development
        ...(dev ? {} : { devtool: false })
      }
    }
    
    return config
  },
  
  // Environment Variables Validierung
  env: {
    NODE_ENV: process.env.NODE_ENV,
  },
  
  // Build-Zeit Validierungen
  generateBuildId: () => {
    // Custom Build ID für Cache-Busting
    return `build-${Date.now()}`
  }
}

export default nextConfig