import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Platform, TextInput, ScrollView } from 'react-native';
import { QrCode, Zap, Camera as CameraIcon, X, Keyboard, Search, Check } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import { VysnProduct } from '../../lib/types/product';
import { searchProducts, getProductByBarcode } from '../../lib/services/productService';
import { scanTrackingService } from '../../lib/services/scanTrackingService';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanIcon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  features: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginTop: 16,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  featureItem: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    lineHeight: 24,
  },
  // Camera styles
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
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
  topControls: {
    position: 'absolute',
    top: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
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
  controlButton: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#fff',
  },
  scanAgainButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000000',
  },
  scanAgainText: {
    color: '#000',
    fontWeight: '500',
  },
  errorContainer: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    padding: 12,
    borderRadius: 8,
  },
  cameraResultsContainer: {
    position: 'absolute',
    bottom: 150,
    left: 16,
    right: 16,
    maxHeight: 200,
  },
  cameraResults: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 8,
    padding: 12,
  },
  // Manual input styles
  manualContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentWithPadding: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  manualInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    width: '100%',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  searchButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#000000',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  resultsContainer: {
    flex: 1,
    marginTop: 16,
    width: '100%',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#000',
  },
  productNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  productBarcode: {
    fontSize: 12,
    color: '#999',
  },
  selectButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default function ScannerScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [showManualInput, setShowManualInput] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [flashlight, setFlashlight] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [searchResults, setSearchResults] = useState<VysnProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [permission, requestPermission] = useCameraPermissions();
  
  const scanSessionRef = useRef<string>('');
  const hasScannedRef = useRef<boolean>(false);

  useEffect(() => {
    // Generate unique session ID for this scan session
    scanSessionRef.current = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

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
      // Tracking error - fail silently
      // Don't fail the scan if tracking fails
    }
  };

  const processScannedCode = async (code: string, scanType: 'barcode' | 'qr_code' | 'manual_input') => {
    setIsLoading(true);
    setError('');
    setSearchResults([]);
    
    try {
      // First, try exact barcode match
      const barcodeMatch = await getProductByBarcode(code);
      if (barcodeMatch) {
        await trackScan(code, scanType, true, 1);
        handleProductFound(barcodeMatch);
        handleNavigateToProduct(barcodeMatch.itemNumberVysn || barcodeMatch.item_number_vysn);
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
        handleProductFound(exactItemMatch);
        handleNavigateToProduct(exactItemMatch.itemNumberVysn || exactItemMatch.item_number_vysn);
        return;
      }

      // If multiple results, show them
      if (products.length > 0) {
        await trackScan(code, scanType, true, products.length);
        setSearchResults(products.slice(0, 5));
        
        // If only one result, navigate directly
        if (products.length === 1) {
          handleProductFound(products[0]);
          handleNavigateToProduct(products[0].itemNumberVysn || products[0].item_number_vysn);
          return;
        }
      } else {
        await trackScan(code, scanType, false, 0);
        setError(t('scanner.noProductFound', { code }));
      }
    } catch (error: any) {
      // Silent error handling
      
      // Specific error messages based on error type
      let errorMessage = t('scanner.searchError');
      
      if (error?.status === 404) {
        errorMessage = t('scanner.noProductFound', { code });
      } else if (error?.status === 500) {
        errorMessage = t('scanner.serverError');
      } else if (error?.status === 0 || error?.message?.includes('Network request failed')) {
        errorMessage = t('scanner.connectionError');
      } else if (error?.status === 408 || error?.message?.includes('timeout')) {
        errorMessage = t('scanner.timeoutError');
      } else if (error?.message) {
        errorMessage = `${t('common.error')}: ${error.message}`;
      }
      
      setError(errorMessage);
      await trackScan(code, scanType, false, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    // Prevent double scanning
    if (hasScannedRef.current) return;
    hasScannedRef.current = true;
    setScanned(true);
    
    // Code scanned silently
    
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
    handleProductFound(product);
    handleNavigateToProduct(product.itemNumberVysn || product.item_number_vysn);
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



  const handleProductFound = (product: VysnProduct) => {
    // Product found - navigate silently without alert
  };

  const handleNavigateToProduct = (itemNumber: string) => {
    // Navigate to product detail screen
    navigation.navigate('ProductDetail' as any, { id: itemNumber });
  };

  return (
    <View style={styles.container}>
      {/* Always show header like other tabs */}
              <Header onSettingsPress={() => navigation.navigate('Settings' as any)} />
      
      {/* Camera view takes remaining space */}
      {!showManualInput && permission && permission.granted ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{ 
              barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'code93', 'codabar', 'itf14'] 
            }}
            onBarcodeScanned={hasScannedRef.current ? undefined : handleBarCodeScanned}
          />
          
          {/* Top controls - absolute positioned */}
          <View style={styles.topControls}>
            <TouchableOpacity onPress={toggleMode} style={styles.topControlButton}>
              <Keyboard size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          {/* Camera overlay with scan area - absolute positioned */}
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
              {scanned ? t('scanner.processing') : isLoading ? t('scanner.searching') : t('scanner.holdInFrame')}
            </Text>
            
            {/* Bottom Controls */}
            <View style={styles.controls}>
              {(scanned || error) && (
                <TouchableOpacity
                  onPress={startNewScan}
                  style={styles.scanAgainButton}
                >
                  <Text style={styles.scanAgainText}>{t('scanner.scanAgain')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Error overlay - absolute positioned */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Results overlay - absolute positioned */}
          {searchResults.length > 0 && (
            <View style={styles.cameraResultsContainer}>
              <ScrollView style={styles.cameraResults}>
                <Text style={styles.resultsTitle}>{t('scanner.searchResults')}</Text>
                {searchResults.map((product) => (
                  <TouchableOpacity
                    key={product.itemNumberVysn}
                    style={styles.productItem}
                    onPress={() => selectProduct(product)}
                  >
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={1}>
                        {product.vysnName}
                      </Text>
                      <Text style={styles.productNumber}>#{product.itemNumberVysn}</Text>
                    </View>
                    <TouchableOpacity style={styles.selectButton}>
                      <Check size={16} color="#fff" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      ) : (
        // Non-camera modes
        <View style={styles.mainContainer}>
            {showManualInput ? (
              // Manual input mode
              <View style={styles.manualContainer}>
                <View style={styles.contentWithPadding}>
                  <Search size={64} color="#000000" style={styles.scanIcon} />
                  <Text style={styles.title}>{t('scanner.manualInput')}</Text>
                  <Text style={styles.description}>
                    {t('scanner.scanToFindProduct')}
                  </Text>
                  
                  <View style={styles.buttonContainer}>
                    <View style={styles.manualInputContainer}>
                      <TextInput
                        style={styles.textInput}
                        value={manualInput}
                        onChangeText={setManualInput}
                        placeholder={t('scanner.enterCode')}
                        placeholderTextColor="#999"
                        onSubmitEditing={handleManualSearch}
                      />
                      <TouchableOpacity 
                        style={styles.searchButton} 
                        onPress={handleManualSearch}
                        disabled={isLoading}
                      >
                        <Search size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.secondaryButton} 
                      onPress={toggleMode}
                    >
                      <CameraIcon size={20} color="#000000" />
                      <Text style={styles.secondaryButtonText}>{t('scanner.useCamera')}</Text>
                    </TouchableOpacity>
                  </View>

                  {isLoading && (
                    <Text style={styles.loadingText}>{t('scanner.searching')}</Text>
                  )}

                  {error && (
                    <Text style={styles.errorText}>{error}</Text>
                  )}

                  {searchResults.length > 0 && (
                    <ScrollView style={styles.resultsContainer}>
                      <Text style={styles.featuresTitle}>{t('scanner.searchResults')}</Text>
                      {searchResults.map((product) => (
                        <TouchableOpacity
                          key={product.itemNumberVysn}
                          style={styles.productItem}
                          onPress={() => selectProduct(product)}
                        >
                          <View style={styles.productInfo}>
                            <Text style={styles.productName} numberOfLines={2}>
                              {product.vysnName}
                            </Text>
                            <Text style={styles.productNumber}>#{product.itemNumberVysn}</Text>
                            {product.barcodeNumber && (
                              <Text style={styles.productBarcode}>
                                Barcode: {product.barcodeNumber}
                              </Text>
                            )}
                          </View>
                          <TouchableOpacity style={styles.selectButton}>
                            <Text style={styles.selectButtonText}>{t('common.select')}</Text>
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>
            ) : !permission ? (
              // Loading permission
              <View style={styles.content}>
                <CameraIcon size={120} color="#000000" style={styles.scanIcon} />
                <Text style={styles.title}>{t('common.loading')}</Text>
                <Text style={styles.description}>
                  {t('scanner.cameraPermission')}
                </Text>
              </View>
            ) : !permission.granted ? (
              // Permission denied
              <View style={styles.content}>
                <CameraIcon size={120} color="#ff3b30" style={styles.scanIcon} />
                <Text style={styles.title}>{t('scanner.permissionRequired')}</Text>
                <Text style={styles.description}>
                  {t('scanner.needCameraAccess')}
                </Text>
                
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
                    <CameraIcon size={24} color="#fff" />
                    <Text style={styles.primaryButtonText}>{t('scanner.grantPermission')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.secondaryButton} 
                    onPress={() => setShowManualInput(true)}
                  >
                    <Keyboard size={20} color="#000000" />
                    <Text style={styles.secondaryButtonText}>{t('scanner.manualInput')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
        </View>
      )}
    </View>
  );
}