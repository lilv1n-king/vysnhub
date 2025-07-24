'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Camera, AlertCircle, Search, Keyboard } from 'lucide-react';
import { searchProducts, getProductByBarcode } from '@/lib/utils/product-data';

interface BarcodeScannerProps {
  onResult: (result: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onResult, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState<string>('');
  const [isSupported, setIsSupported] = useState(true);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (!('mediaDevices' in navigator) || !('getUserMedia' in navigator.mediaDevices)) {
      setIsSupported(false);
      setError('Camera access is not supported in this browser');
      setShowManualInput(true);
      return;
    }

    const startScanner = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment' 
          } 
        });
        
        const video = document.getElementById('barcode-video') as HTMLVideoElement;
        if (video) {
          video.srcObject = stream;
        }
      } catch {
        setError('Unable to access camera. Please check permissions.');
        setShowManualInput(true);
      }
    };

    if (!showManualInput) {
      startScanner();
    }

    return () => {
      const video = document.getElementById('barcode-video') as HTMLVideoElement;
      if (video?.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [showManualInput]);

  const handleManualSearch = () => {
    if (!manualInput.trim()) return;
    
    const searchTerm = manualInput.trim();
    
    // First, try exact barcode match
    const barcodeMatch = getProductByBarcode(searchTerm);
    if (barcodeMatch) {
      onResult(barcodeMatch.itemNumberVysn);
      return;
    }
    
    // Then try exact item number match
    const products = searchProducts(searchTerm);
    const exactItemMatch = products.find(p => 
      p.itemNumberVysn?.toLowerCase() === searchTerm.toLowerCase()
    );
    
    if (exactItemMatch) {
      onResult(exactItemMatch.itemNumberVysn);
      return;
    }
    
    // If no exact match, show search results
    setSearchResults(products.slice(0, 5));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualSearch();
    }
  };

  const selectProduct = (product: any) => {
    onResult(product.itemNumberVysn);
  };

  const toggleMode = () => {
    setShowManualInput(!showManualInput);
    setError('');
    setSearchResults([]);
    setManualInput('');
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          {showManualInput ? <Keyboard className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
          {showManualInput ? 'Manual Search' : 'Barcode Scanner'}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleMode}>
            {showManualInput ? <Camera className="h-4 w-4" /> : <Keyboard className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showManualInput ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Enter Barcode or Item Number:
              </label>
              <div className="flex gap-2">
                <Input
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., 4255805301036 or V104100T2W"
                  className="flex-1"
                />
                <Button onClick={handleManualSearch} className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Enter a barcode number or item number to find the product
              </p>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Search Results:</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {searchResults.map((product) => (
                    <div 
                      key={product.itemNumberVysn}
                      className="border rounded-md p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => selectProduct(product)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{product.vysnName}</p>
                          <p className="text-xs text-gray-600">#{product.itemNumberVysn}</p>
                          {product.barcodeNumber && (
                            <p className="text-xs text-gray-500">Barcode: {product.barcodeNumber}</p>
                          )}
                        </div>
                        <Button size="sm" variant="outline">Select</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {manualInput && searchResults.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No products found for &quot;{manualInput}&quot;</p>
                <p className="text-xs mt-1">Try searching with a different barcode or item number</p>
              </div>
            )}
          </div>
        ) : !isSupported ? (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">
              Camera scanning is not supported in this browser
            </p>
            <Button onClick={() => setShowManualInput(true)} variant="outline">
              Use Manual Input Instead
            </Button>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={() => setShowManualInput(true)} variant="outline" className="w-full">
                Use Manual Input Instead
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                Try Camera Again
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
              <video
                id="barcode-video"
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-white w-48 h-32 rounded-lg"></div>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Position the barcode within the frame to scan
              </p>
              <p className="text-xs text-gray-500">
                Camera scanning is a demo feature. Use manual input for now.
              </p>
              <Button onClick={() => setShowManualInput(true)} variant="outline" size="sm">
                Use Manual Input Instead
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}