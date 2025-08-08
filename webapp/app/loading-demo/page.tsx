'use client';

import React, { useState } from 'react';
import { LoadingScreen, LoadingSpinner, LoadingOverlay } from '@/components/ui/loading-screen';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoadingDemo() {
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  const simulateLoading = (setter: (value: boolean) => void, duration = 3000) => {
    setter(true);
    setTimeout(() => setter(false), duration);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">VYSN Loading Screens Demo</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Screen Loading */}
          <Card>
            <CardHeader>
              <CardTitle>Full Screen Loading</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Zeigt einen Vollbild-Loading Screen mit VYSN Logo und Animationen.
              </p>
              <Button 
                onClick={() => simulateLoading(setShowFullScreen, 5000)}
                className="w-full"
              >
                Full Screen Loading zeigen (5s)
              </Button>
            </CardContent>
          </Card>

          {/* Loading Overlay */}
          <Card>
            <CardHeader>
              <CardTitle>Loading Overlay</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Transparentes Overlay für Seitentransitionen.
              </p>
              <Button 
                onClick={() => simulateLoading(setShowOverlay)}
                className="w-full"
                variant="outline"
              >
                Overlay zeigen (3s)
              </Button>
            </CardContent>
          </Card>

          {/* Loading Spinner */}
          <Card>
            <CardHeader>
              <CardTitle>Loading Spinner</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Kleiner Spinner für Inline-Loading.
              </p>
              <Button 
                onClick={() => simulateLoading(setShowSpinner)}
                className="w-full"
                variant="secondary"
                disabled={showSpinner}
              >
                {showSpinner ? <LoadingSpinner size={16} message="" /> : 'Spinner zeigen (3s)'}
              </Button>
            </CardContent>
          </Card>

          {/* Different Sizes */}
          <Card>
            <CardHeader>
              <CardTitle>Verschiedene Größen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Small Size</p>
                <div className="h-32 flex items-center justify-center bg-gray-100 rounded">
                  <LoadingSpinner size={24} message="Klein" />
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Medium Spinner</p>
                <div className="h-32 flex items-center justify-center bg-gray-100 rounded">
                  <LoadingSpinner size={40} message="Medium" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Verwendungsbeispiele</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold">Full Screen Loading:</h4>
                <code className="bg-gray-100 p-2 rounded block mt-1">
                  {`<LoadingScreen message="Lade Produkte..." size="large" />`}
                </code>
              </div>
              
              <div>
                <h4 className="font-semibold">Loading Overlay:</h4>
                <code className="bg-gray-100 p-2 rounded block mt-1">
                  {`<LoadingOverlay isVisible={loading} message="Speichere..." />`}
                </code>
              </div>
              
              <div>
                <h4 className="font-semibold">Inline Spinner:</h4>
                <code className="bg-gray-100 p-2 rounded block mt-1">
                  {`<LoadingSpinner size={20} message="Lädt..." />`}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conditional Loading Screens */}
      {showFullScreen && (
        <LoadingScreen 
          message="Demo Loading Screen - Zeigt 5 Sekunden lang das VYSN Logo mit Animationen"
          size="large"
        />
      )}

      <LoadingOverlay 
        isVisible={showOverlay}
        message="Loading Overlay aktiv..."
        onBackgroundClick={() => setShowOverlay(false)}
      />
    </div>
  );
}