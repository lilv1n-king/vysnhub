'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Keyboard, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getProductByBarcode, searchProducts } from '@/lib/utils/product-data';

export default function BarcodeScanner() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [scanResult, setScanResult] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<any>(null);

  // Funktion zum Weiterleiten zur Produktseite
  const navigateToProduct = useCallback(async (barcodeOrItemNumber: string) => {
    try {
      // Erst versuchen, Produkt per Barcode zu finden
      const productByBarcode = await getProductByBarcode(barcodeOrItemNumber);
      if (productByBarcode) {
        router.push(`/products/${productByBarcode.itemNumberVysn}`);
        return;
      }

      // Dann versuchen, nach Item Number zu suchen
      const searchResults = await searchProducts(barcodeOrItemNumber);
      const exactMatch = searchResults.find(p => 
        p.itemNumberVysn?.toLowerCase() === barcodeOrItemNumber.toLowerCase()
      );
      
      if (exactMatch) {
        router.push(`/products/${exactMatch.itemNumberVysn}`);
        return;
      }

      // Wenn nur ein Suchergebnis, direkt dorthin
      if (searchResults.length === 1) {
        router.push(`/products/${searchResults[0].itemNumberVysn}`);
        return;
      }

      // Sonst Suchergebnisse anzeigen
      setSearchResults(searchResults.slice(0, 5));
      setScanResult(barcodeOrItemNumber);
    } catch (error) {
      console.error('Error searching for product:', error);
      setError('Fehler beim Suchen des Produkts');
    }
  }, [router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const startBarcodeScanner = async () => {
      if (showManualInput || scanResult) return;
      
      try {
        // Check camera support
        if (!('mediaDevices' in navigator) || !('getUserMedia' in navigator.mediaDevices)) {
          setError('Kamera wird in diesem Browser nicht unterstützt');
          setShowManualInput(true);
          return;
        }

        // Dynamically import ZXing for barcode scanning
        const { BrowserMultiFormatReader } = await import('@zxing/library');
        
        if (!videoRef.current) return;
        
        const reader = new BrowserMultiFormatReader();
        scannerRef.current = reader;
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        setError('');

        // Start scanning
        reader.decodeFromVideoDevice(null, videoRef.current, async (result) => {
          if (result) {
            const barcodeText = result.getText();
            console.log('Barcode gefunden:', barcodeText);
            
            // Stop scanning
            if (scannerRef.current) {
              scannerRef.current.reset();
            }
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
            }
            
            setIsScanning(false);
            
            // Navigate to product
            await navigateToProduct(barcodeText);
          }
        });
        
      } catch (err) {
        console.error('Barcode Scanner error:', err);
        setError('Kamera-Zugriff nicht möglich. Bitte Berechtigungen überprüfen.');
        setShowManualInput(true);
      }
    };

    // Start scanner immediately when component mounts
    startBarcodeScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.reset();
      }
      // Stop video stream
      const currentVideo = videoRef.current;
      if (currentVideo?.srcObject) {
        const stream = currentVideo.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [navigateToProduct, showManualInput, scanResult]);

  const handleManualSubmit = async () => {
    if (!manualInput.trim()) return;
    await navigateToProduct(manualInput.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualSubmit();
    }
  };

  const selectProduct = (product: any) => {
    router.push(`/products/${product.itemNumberVysn}`);
  };

  const resetScanner = () => {
    setScanResult('');
    setError('');
    setShowManualInput(false);
    setManualInput('');
    setSearchResults([]);
    // Restart scanner
    window.location.reload();
  };


  return (
    <div className="h-full w-full bg-black relative">
      {/* Top Navigation */}
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-center items-center">
        <div className="text-white text-lg font-medium">
          Barcode Scanner
        </div>
      </div>

      {searchResults.length > 0 ? (
        // Show search results - Fullscreen
        <div className="h-full flex flex-col justify-center items-center p-6 text-white overflow-y-auto">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center">
              <Search className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Suchergebnisse</h2>
              <p className="text-gray-300">Für Barcode: {scanResult}</p>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {searchResults.map((product) => (
                <div 
                  key={product.itemNumberVysn}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 cursor-pointer hover:bg-white/20 transition-colors"
                  onClick={() => selectProduct(product)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-white">{product.vysnName}</p>
                      <p className="text-xs text-gray-300">#{product.itemNumberVysn}</p>
                      {product.barcodeNumber && (
                        <p className="text-xs text-gray-400">Barcode: {product.barcodeNumber}</p>
                      )}
                    </div>
                    <Button size="sm" variant="outline" className="text-black">Auswählen</Button>
                  </div>
                </div>
              ))}
            </div>
            
            <Button onClick={resetScanner} className="w-full bg-white text-black hover:bg-gray-100">
              Neuer Scan
            </Button>
          </div>
        </div>
      ) : showManualInput ? (
        // Manual input mode - Fullscreen
        <div className="h-full flex flex-col justify-center items-center p-6 text-white">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center">
              <Keyboard className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Manuelle Eingabe</h2>
              <p className="text-gray-300">Barcode oder Artikelnummer eingeben</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <Input
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="z.B. 4255805301036 oder V104100T2W"
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Button onClick={handleManualSubmit} disabled={!manualInput.trim()} className="bg-white text-black hover:bg-gray-100">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Für Tests: V204300A7B (Artikelnummer)
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
          
          {/* Scanning overlay for barcode */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border-4 border-white w-80 h-48 md:w-96 md:h-56 rounded-2xl shadow-lg">
              <div className="w-full h-full relative">
                {/* Scanning line animation */}
                <div className="absolute inset-2 overflow-hidden">
                  <div className="w-full h-1 bg-red-500 animate-pulse absolute top-1/2 -translate-y-1/2"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom instruction */}
          <div className="absolute bottom-20 md:bottom-8 left-4 right-4 text-center">
            <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 mx-auto max-w-md">
              <p className="text-white font-medium">
                {isScanning ? 'Barcode in den Rahmen halten' : 'Kamera startet...'}
              </p>
              <p className="text-gray-300 text-sm mt-1">
                EAN/UPC Barcodes werden unterstützt
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 