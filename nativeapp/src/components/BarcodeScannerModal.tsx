import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, X, Keyboard, Search, Check } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Header from './Header';
import { Card, CardContent } from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import { searchProducts, getProductByBarcode } from '../../lib/services/productService';
import { scanTrackingService } from '../../lib/services/scanTrackingService';
import { VysnProduct } from '../../lib/types/product';
import { useTranslation } from 'react-i18next';

interface BarcodeScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onProductFound: (product: VysnProduct) => void;
  onNavigateToProduct: (itemNumber: string) => void;
}

const { width, height } = Dimensions.get('window');

export default function BarcodeScannerModal({ 
  visible, 
  onClose, 
  onProductFound, 
  onNavigateToProduct 
}: BarcodeScannerModalProps) {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [searchResults, setSearchResults] = useState<VysnProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const scanSessionRef = useRef<string>('');
  const hasScannedRef = useRef<boolean>(false);

  useEffect(() => {
    if (visible) {
      // Generate unique session ID for this scan session
      scanSessionRef.current = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      hasScannedRef.current = false;
    } else {
      // Reset state when modal closes
      setScanned(false);
      setShowManualInput(false); 
      setManualInput('');
      setSearchResults([]);
      setError('');
      hasScannedRef.current = false;
    }
  }, [visible]);

  const trackScan = async (scannedCode: string, scanType: 'barcode' | 'qr_code' | 'manual_input', productFound: boolean = false, searchResultsCount: number = 0) => {
    try {
      await scanTrackingService.trackScan({
        scannedCode,
        scanType,
        scanSource: 'native_app',
        sessionId: scanSessionRef.current,
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version
        },
        productFound,
        searchResultsCount
      });
    } catch (error) {
      console.error('Error tracking scan:', error);
    }
  };

  const processScannedCode = async (code: string, scanType: 'barcode' | 'qr_code' | 'manual_input') => {
    setIsLoading(true);
    setError('');
    
    try {
      // First, try exact barcode match
      const barcodeMatch = await getProductByBarcode(code);
      if (barcodeMatch) {
        await trackScan(code, scanType, true, 1);
        onProductFound(barcodeMatch);
        onNavigateToProduct(barcodeMatch.itemNumberVysn);
        onClose();
        return;
      }

      // Then try searching for products
      const products = await searchProducts(code);
      
      // Check for exact item number match
      const exactItemMatch = products.find(p => 
        p.itemNumberVysn?.toLowerCase() === code.toLowerCase()
      );

      if (exactItemMatch) {
        await trackScan(code, scanType, true, 1);
        onProductFound(exactItemMatch);
        onNavigateToProduct(exactItemMatch.itemNumberVysn);
        onClose();
        return;
      }

      // If multiple results, show them
      if (products.length > 0) {
        await trackScan(code, scanType, true, products.length);
        setSearchResults(products.slice(0, 5));
        
        // If only one result, navigate directly
        if (products.length === 1) {
          onProductFound(products[0]);
          onNavigateToProduct(products[0].itemNumberVysn);
          onClose();
          return;
        }
      } else {
        await trackScan(code, scanType, false, 0);
        setError(`${t('scanner.noProductFound', { code })}`);
      }
    } catch (error) {
      console.error('Error processing scanned code:', error);
              setError(t('scanner.errorSearchingProduct'));
      await trackScan(code, scanType, false, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (hasScannedRef.current) return;
    
    hasScannedRef.current = true;
    setScanned(true);
    
    // Determine scan type
    const scanType = /^\d+$/.test(data) ? 'barcode' : 'qr_code';
    processScannedCode(data, scanType);
  };

  const handleManualSearch = async () => {
    if (!manualInput.trim()) return;
    
    const code = manualInput.trim();
    await processScannedCode(code, 'manual_input');
  };

  const selectProduct = (product: VysnProduct) => {
    onProductFound(product);
    onNavigateToProduct(product.itemNumberVysn);
    onClose();
  };

  const toggleMode = () => {
    setShowManualInput(!showManualInput);
    setScanned(false);
    setError('');
    setSearchResults([]);
    setManualInput('');
  };

  const startNewScan = () => {
    hasScannedRef.current = false;
    setScanned(false);
    setError('');
    setSearchResults([]);
    setManualInput('');
  };

  // Camera permission states
  if (!permission) {
    return (
      <Modal visible={visible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.container}>
          <Header 
            onSettingsPress={onClose}
            showLogout={false}
          />
          <View style={styles.toolbar}>
            <Text style={styles.title}>Scanner</Text>
            <TouchableOpacity onPress={onClose} style={styles.toolbarButton}>
              <X size={20} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>Kamera wird vorbereitet...</Text>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.container}>
          <Header 
            onSettingsPress={onClose}
            showLogout={false}
          />
          <View style={styles.toolbar}>
            <Text style={styles.title}>Kamera-Berechtigung</Text>
            <TouchableOpacity onPress={onClose} style={styles.toolbarButton}>
              <X size={20} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={styles.permissionContainer}>
            <Camera size={64} color="#000" style={styles.permissionIcon} />
            <Text style={styles.permissionTitle}>Kamera-Zugriff erforderlich</Text>
            <Text style={styles.permissionText}>
              Wir benötigen Zugriff auf Ihre Kamera, um Barcodes und QR-Codes zu scannen.
            </Text>
            <Button onPress={requestPermission} style={styles.permissionButton}>
              Berechtigung erteilen
            </Button>
            <Button 
              variant="outline" 
              onPress={() => setShowManualInput(true)}
              style={styles.manualPermissionButton}
            >
              Manuelle Eingabe verwenden
            </Button>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  // Main scanner interface
  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <Header 
          onSettingsPress={onClose}
          showLogout={false}
        />
        
        {showManualInput ? (
          <View style={styles.toolbar}>
            <Text style={styles.title}>Manuelle Suche</Text>
            <View style={styles.toolbarActions}>
              <TouchableOpacity onPress={toggleMode} style={styles.toolbarButton}>
                <Camera size={20} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.toolbarButton}>
                <X size={20} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {showManualInput ? (
          <View style={styles.manualContainer}>
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Search size={20} color="#6b7280" style={styles.searchIcon} />
                <Input
                  value={manualInput}
                  onChangeText={setManualInput}
                  placeholder="Barcode oder Artikelnummer eingeben"
                  returnKeyType="search"
                  onSubmitEditing={handleManualSearch}
                  style={styles.searchInput}
                />
              </View>
              <Button 
                onPress={handleManualSearch}
                style={styles.searchButton}
              >
{t('scanner.search')}
              </Button>
            </View>

            <Text style={styles.helpText}>
{t('scanner.enterBarcodeHelp')}
            </Text>

            {isLoading && (
              <Text style={styles.loadingText}>{t('scanner.searchRunning')}</Text>
            )}

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            {searchResults.length > 0 && (
              <ScrollView style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>Suchergebnisse:</Text>
                {searchResults.map((product) => (
                  <Card key={product.itemNumberVysn} style={styles.productCard}>
                    <CardContent style={styles.productContent}>
                      <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={2}>
                          {product.vysnName}
                        </Text>
                        <Text style={styles.productNumber}>#{product.itemNumberVysn}</Text>
                        {product.barcodeNumber && (
                          <Text style={styles.productBarcode}>
                            {t('scanner.barcode')}: {product.barcodeNumber}
                          </Text>
                        )}
                      </View>
                      <Button
                        onPress={() => selectProduct(product)}
                        style={styles.selectButton}
                      >
{t('scanner.selectProduct')}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </ScrollView>
            )}

            {manualInput && searchResults.length === 0 && !isLoading && (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>
{t('scanner.noProductsFoundFor')} "{manualInput}"
                </Text>
                <Text style={styles.noResultsSubtext}>
{t('scanner.tryDifferentCode')}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'code93', 'codabar', 'itf14']
            }}
            onBarcodeScanned={hasScannedRef.current ? undefined : handleBarCodeScanned}
          >
            {/* Top Controls - Close and Manual Input */}
            <View style={styles.topControls}>
              <TouchableOpacity 
                onPress={() => setShowManualInput(true)} 
                style={styles.topControlButton}
              >
                <Keyboard size={24} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={onClose} 
                style={styles.topControlButton}
              >
                <X size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Camera overlay with scan area */}
            <View style={styles.cameraOverlay}>
              {/* Scan Area */}
              <View style={styles.scanArea}>
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
                {/* Scanning line */}
                <View style={styles.scanLine} />
              </View>
              
              {/* Instruction Text */}
              <Text style={styles.instructionText}>
{scanned ? t('scanner.processing') : isLoading ? t('scanner.searchRunning') : t('scanner.holdInFrame')}
              </Text>
              
              {/* Bottom Controls */}
              <View style={styles.controls}>
                {(scanned || error) && (
                  <Button
                    onPress={startNewScan}
                    variant="outline"
                    style={styles.scanAgainButton}
                  >
                    Erneut scannen
                  </Button>
                )}
              </View>

              {error && (
                <Card style={styles.errorCard}>
                  <CardContent style={styles.errorContent}>
                    <Text style={styles.errorText}>{error}</Text>
                  </CardContent>
                </Card>
              )}

              {searchResults.length > 0 && (
                <Card style={styles.resultsCard}>
                  <CardContent style={styles.resultsContent}>
                    <Text style={styles.resultsTitle}>Suchergebnisse:</Text>
                    <ScrollView style={styles.resultsScroll}>
                      {searchResults.map((product) => (
                        <TouchableOpacity
                          key={product.itemNumberVysn}
                          style={styles.resultItem}
                          onPress={() => selectProduct(product)}
                        >
                          <View style={styles.resultInfo}>
                            <Text style={styles.resultName} numberOfLines={1}>
                              {product.vysnName}
                            </Text>
                            <Text style={styles.resultNumber}>#{product.itemNumberVysn}</Text>
                          </View>
                          <Check size={16} color="#000" />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </CardContent>
                </Card>
              )}
            </View>
          </CameraView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Base container
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  // Toolbar
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  toolbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolbarButton: {
    padding: 8,
    borderRadius: 6,
  },
  
  // Full screen camera
  camera: {
    flex: 1,
  },
  
  // Top controls overlay on camera
  topControls: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  topControlButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Scan area overlay - matching app style
  scanArea: {
    width: 300,
    height: 200,
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 16,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
  },
  cornerTopLeft: {
    top: -3,
    left: -3,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderColor: '#ffffff',
    borderRadius: 8,
  },
  cornerTopRight: {
    top: -3,
    right: -3,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderColor: '#ffffff',
    borderRadius: 8,
  },
  cornerBottomLeft: {
    bottom: -3,
    left: -3,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderColor: '#ffffff',
    borderRadius: 8,
  },
  cornerBottomRight: {
    bottom: -3,
    right: -3,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderColor: '#ffffff',
    borderRadius: 8,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: '#ff0000',
    opacity: 0.8,
  },
  
  // Camera controls
  instructionText: {
    position: 'absolute',
    bottom: 140,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  controls: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  scanAgainButton: {
    backgroundColor: '#ffffff',
    borderColor: '#000000',
  },
  
  // Manual search container
  manualContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  searchInput: {
    paddingLeft: 40,
  },
  searchButton: {
    minWidth: 80,
  },
  
  helpText: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingText: {
    color: '#000000',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  
  // Camera overlays
  errorCard: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
  },
  errorContent: {
    padding: 12,
    backgroundColor: '#ef4444',
  },
  resultsCard: {
    position: 'absolute',
    bottom: 180,
    left: 16,
    right: 16,
    maxHeight: 200,
  },
  resultsContent: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  resultsScroll: {
    maxHeight: 120,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  resultInfo: {
    flex: 1,
    marginRight: 12,
  },
  resultName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  resultNumber: {
    fontSize: 12,
    color: '#6b7280',
  },
  
  // Results list
  resultsContainer: {
    flex: 1,
    marginTop: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000000',
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    borderColor: '#f1f5f9',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  productContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#000000',
  },
  productNumber: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  productBarcode: {
    fontSize: 12,
    color: '#9ca3af',
  },
  selectButton: {
    minWidth: 80,
  },
  
  // No results
  noResultsContainer: {
    padding: 32,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  
  // Permission screens
  permissionContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionIcon: {
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    width: '100%',
    marginBottom: 12,
  },
  manualPermissionButton: {
    width: '100%',
  },
});