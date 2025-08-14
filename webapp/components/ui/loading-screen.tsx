'use client';

import React from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  showLogo?: boolean;
}

export function LoadingScreen({ 
  size = 'large',
  showLogo = true 
}: LoadingScreenProps) {
  const sizeConfig = {
    small: {
      logoSize: 60,
      textSize: 'text-lg',
      containerPadding: 'p-8'
    },
    medium: {
      logoSize: 90,
      textSize: 'text-xl',
      containerPadding: 'p-12'
    },
    large: {
      logoSize: 120,
      textSize: 'text-2xl',
      containerPadding: 'p-16'
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-white ${config.containerPadding}`}>
      {showLogo && (
        <div className="mb-8 animate-bounce-subtle">
          <div className="relative animate-pulse">
            <Image
              src="/logo.png"
              alt="VYSN Logo"
              width={config.logoSize}
              height={config.logoSize}
              className="object-contain animate-spin-slow"
              priority
            />
          </div>
        </div>
      )}
      

    </div>
  );
}

// Inline loading spinner component for smaller contexts
export function LoadingSpinner({ 
  size = 20, 
  color = "text-blue-500",
  message 
}: { 
  size?: number; 
  color?: string;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 ${color}`} 
           style={{ width: size, height: size }}>
      </div>
      {message && (
        <p className="text-sm text-gray-600 animate-pulse">{message}</p>
      )}
    </div>
  );
}

// Loading overlay component for page transitions
export function LoadingOverlay({ 
  isVisible = true,
  message = "Lädt...",
  onBackgroundClick
}: {
  isVisible?: boolean;
  message?: string;
  onBackgroundClick?: () => void;
}) {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm"
      onClick={onBackgroundClick}
    >
      <div className="text-center" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4">
          <Image
            src="/logo.png"
            alt="VYSN Logo"
            width={80}
            height={80}
            className="object-contain animate-spin-slow mx-auto"
            priority
          />
        </div>
        <p className="text-lg font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
}