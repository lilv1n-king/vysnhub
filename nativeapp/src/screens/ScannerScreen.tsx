import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Platform } from 'react-native';
import { QrCode, Zap } from 'lucide-react-native';
import Header from '../components/Header';
import Button from '../components/ui/Button';

// Import barcode scanner conditionally
let BarCodeScanner: any = null;
let Camera: any = null;

try {
  const barcodeScannerModule = require('expo-barcode-scanner');
  const cameraModule = require('expo-camera');
  BarCodeScanner = barcodeScannerModule.BarCodeScanner;
  Camera = cameraModule.Camera;
} catch (error) {
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  simulatorContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanArea: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 250,
    height: 250,
    marginLeft: -125,
    marginTop: -125,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderColor: '#ffffff',
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderColor: '#ffffff',
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderColor: '#ffffff',
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderColor: '#ffffff',
  },
  instructionText: {
    position: 'absolute',
    bottom: 200,
    left: 0,
    right: 0,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  controlButton: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanAgainButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderRadius: 25,
  },
  scanAgainText: {
    color: '#000000',
    fontWeight: '500',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionIcon: {
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  simulatorContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  simulatorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  simulatorText: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  testButtons: {
    gap: 12,
    width: '100%',
  },
});

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flashlight, setFlashlight] = useState(false);

  // Check if we're running in a simulator or if camera modules are available
  const isSimulator = Platform.OS === 'ios' && !BarCodeScanner;
  const isCameraAvailable = BarCodeScanner && Camera;

  useEffect(() => {
    if (isCameraAvailable) {
      const getBarCodeScannerPermissions = async () => {
        try {
          const { status } = await BarCodeScanner.requestPermissionsAsync();
          setHasPermission(status === 'granted');
        } catch (error) {
          setHasPermission(false);
        }
      };

      getBarCodeScannerPermissions();
    }
  }, [isCameraAvailable]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    
    // Check if it's a product barcode (numeric)
    if (/^\d+$/.test(data)) {
      Alert.alert(
        'Product Barcode Scanned', 
        `Barcode: ${data}\n\nThis would normally search for the product in your catalog.`,
        [
          { text: 'Search Products', onPress: () => setScanned(false) },
          { text: 'Scan Again', onPress: () => setScanned(false) }
        ]
      );
    } else {
      Alert.alert(
        'QR Code Scanned', 
        `Data: ${data}`,
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const requestPermission = async () => {
    if (isCameraAvailable) {
      try {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (error) {
        Alert.alert('Error', 'Failed to request camera permissions');
      }
    }
  };

  // Simulator test functions
  const simulateProductScan = () => {
    handleBarCodeScanned({ type: 'code128', data: '1234567890123' });
  };

  const simulateQRScan = () => {
    handleBarCodeScanned({ type: 'qr', data: 'https://vysn.com/product/V109001B2B' });
  };

  // If camera modules are not available (simulator/web)
  if (!isCameraAvailable) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Header onSettingsPress={handleSettingsPress} />
        </View>
        
        <View style={styles.simulatorContainer}>
          <View style={styles.simulatorContent}>
            <QrCode size={64} color="#ffffff" style={styles.permissionIcon} />
            <Text style={styles.simulatorTitle}>Scanner Simulator</Text>
            <Text style={styles.simulatorText}>
              Camera scanning is not available in the simulator. Use the buttons below to test scanner functionality.
            </Text>
            
            <View style={styles.testButtons}>
              <Button onPress={simulateProductScan}>
                Test Product Barcode Scan
              </Button>
              <Button variant="outline" onPress={simulateQRScan}>
                Test QR Code Scan
              </Button>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Header onSettingsPress={handleSettingsPress} />
        </View>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Header onSettingsPress={handleSettingsPress} />
        </View>
        <View style={styles.permissionContainer}>
          <QrCode size={64} color="#d1d5db" style={styles.permissionIcon} />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need access to your camera to scan QR codes and barcodes for product identification and information retrieval.
          </Text>
          <Button onPress={requestPermission}>Grant Permission</Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header onSettingsPress={handleSettingsPress} />
      </View>
      
      <View style={styles.cameraContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.camera}
          flashMode={flashlight ? Camera.Constants.FlashMode.torch : Camera.Constants.FlashMode.off}
        >
          {/* Overlay */}
          <View style={styles.overlay} />
          
          {/* Scan Area */}
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>
          
          {/* Instruction Text */}
          <Text style={styles.instructionText}>
            {scanned ? 'Tap to scan again' : 'Point camera at QR code or barcode'}
          </Text>
          
          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              onPress={() => setFlashlight(!flashlight)}
              style={styles.controlButton}
            >
              <Zap size={24} color={flashlight ? '#fff' : '#ccc'} />
            </TouchableOpacity>
            
            {scanned && (
              <TouchableOpacity
                onPress={() => setScanned(false)}
                style={styles.scanAgainButton}
              >
                <Text style={styles.scanAgainText}>Scan Again</Text>
              </TouchableOpacity>
            )}
          </View>
        </BarCodeScanner>
      </View>
    </View>
  );
}