'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Keyboard, CheckCircle, Copy, Home } from 'lucide-react';
import Link from 'next/link';

export default function QRScanner() {
  const [error, setError] = useState<string>('');
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [scanResult, setScanResult] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const startScanner = async () => {
      if (showManualInput || scanResult) return;
      
      try {
        // Check camera support
        if (!('mediaDevices' in navigator) || !('getUserMedia' in navigator.mediaDevices)) {
          setError('Kamera wird in diesem Browser nicht unterstützt');
          setShowManualInput(true);
          return;
        }

        // Dynamically import QrScanner
        const QrScanner = (await import('qr-scanner')).default;
        
        if (!videoRef.current) return;
        
        scannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            setScanResult(result.data);
            setIsScanning(false);
            if (scannerRef.current) {
              scannerRef.current.stop();
            }
          },
          {
            onDecodeError: (err) => {
              // Ignore decode errors, they happen continuously until a QR code is found
            },
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 5,
          }
        );

        await scannerRef.current.start();
        setIsScanning(true);
        setError('');
        
      } catch (err) {
        console.error('QR Scanner error:', err);
        setError('Kamera-Zugriff nicht möglich. Bitte Berechtigungen überprüfen.');
        setShowManualInput(true);
      }
    };

    // Start scanner immediately when component mounts
    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
      }
    };
  }, [showManualInput, scanResult]);

  const handleManualSubmit = () => {
    if (!manualInput.trim()) return;
    setScanResult(manualInput.trim());
    setManualInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualSubmit();
    }
  };

  const copyToClipboard = async () => {
    if (scanResult) {
      try {
        await navigator.clipboard.writeText(scanResult);
        alert('QR-Code Inhalt kopiert!');
      } catch {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = scanResult;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('QR-Code Inhalt kopiert!');
      }
    }
  };

  const resetScanner = () => {
    setScanResult('');
    setError('');
    setShowManualInput(false);
    setManualInput('');
    // Restart scanner
    window.location.reload();
  };

  const toggleMode = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
    }
    setShowManualInput(!showManualInput);
    setError('');
    setScanResult('');
    setManualInput('');
  };

  return (
    <div className="h-full w-full bg-black relative">
      {/* Top Navigation */}
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <Home className="h-5 w-5" />
          </Button>
        </Link>
        
        <div className="text-white text-lg font-medium">
          QR Scanner
        </div>
        
        <Button variant="ghost" size="sm" onClick={toggleMode} className="text-white hover:bg-white/20">
          <Keyboard className="h-5 w-5" />
        </Button>
      </div>
      {scanResult ? (
        // Show scan result - Fullscreen
        <div className="h-full flex flex-col justify-center items-center p-6 text-white">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">QR-Code gescannt!</h2>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <p className="text-sm text-gray-300 mb-3">Inhalt:</p>
              <p className="font-mono text-sm break-all bg-black/50 p-4 rounded border border-white/20">
                {scanResult}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={copyToClipboard} variant="outline" className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Copy className="h-4 w-4 mr-2" />
                Kopieren
              </Button>
              <Button onClick={resetScanner} className="flex-1 bg-white text-black hover:bg-gray-100">
                Neuer Scan
              </Button>
            </div>
          </div>
        </div>
      ) : showManualInput ? (
        // Manual input mode - Fullscreen
        <div className="h-full flex flex-col justify-center items-center p-6 text-white">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center">
              <Keyboard className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Manuelle Eingabe</h2>
              <p className="text-gray-300">Geben Sie QR-Code Inhalt ein</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <Input
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="QR-Code Inhalt eingeben..."
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Button onClick={handleManualSubmit} disabled={!manualInput.trim()} className="bg-white text-black hover:bg-gray-100">
                  OK
                </Button>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Für Testzwecke: https://vysn.com/test-qr-code
              </p>
            </div>
          </div>
        </div>
      ) : error ? (
        // Camera error - Fullscreen
        <div className="h-full flex flex-col justify-center items-center p-6 text-white">
          <div className="max-w-md w-full text-center space-y-6">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-400 mb-2">Kamera-Fehler</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <Button onClick={() => setShowManualInput(true)} className="w-full bg-white text-black hover:bg-gray-100">
              Manuelle Eingabe verwenden
            </Button>
          </div>
        </div>
      ) : (
        // Camera scanning - Fullscreen
        <div className="h-full relative">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
          
          {/* Scanning overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border-4 border-white w-64 h-64 md:w-80 md:h-80 rounded-2xl shadow-lg"></div>
          </div>
          
          {/* Bottom instruction */}
          <div className="absolute bottom-20 md:bottom-8 left-4 right-4 text-center">
            <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 mx-auto max-w-md">
              <p className="text-white font-medium">
                {isScanning ? 'QR-Code in den Rahmen halten' : 'Kamera startet...'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 