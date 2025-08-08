import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react-native';
import cartApiService from '../../lib/services/cartApiService';
import { API_BASE_URL } from '../../lib/config/api';

export default function ConnectionTest() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const connected = await cartApiService.testConnection();
      setIsConnected(connected);
      
      if (connected) {
        Alert.alert('✅ Verbindung OK', 'Backend ist erreichbar!');
      } else {
        Alert.alert('❌ Verbindung fehlgeschlagen', 
          `Backend nicht erreichbar.\n\nURL: ${API_BASE_URL}\n\nPrüfe:\n• Backend läuft?\n• IP-Adresse korrekt?\n• Firewall/Router?`);
      }
    } catch (error) {
      setIsConnected(false);
      Alert.alert('❌ Fehler', 'Verbindungstest fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusColor = () => {
    if (isConnected === null) return '#9CA3AF';
    return isConnected ? '#10B981' : '#EF4444';
  };

  const getStatusText = () => {
    if (isLoading) return 'Teste Verbindung...';
    if (isConnected === null) return 'Unbekannt';
    return isConnected ? 'Verbunden' : 'Getrennt';
  };

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw size={20} color={getStatusColor()} />;
    if (isConnected === null) return <Wifi size={20} color={getStatusColor()} />;
    return isConnected ? 
      <Wifi size={20} color={getStatusColor()} /> : 
      <WifiOff size={20} color={getStatusColor()} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Backend-Verbindung</Text>
      </View>

      <View style={styles.statusContainer}>
        <View style={styles.statusRow}>
          {getStatusIcon()}
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
        
        <Text style={styles.urlText}>
          {API_BASE_URL}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.testButton, isLoading && styles.testButtonDisabled]}
        onPress={testConnection}
        disabled={isLoading}
      >
        <RefreshCw size={16} color="white" />
        <Text style={styles.testButtonText}>
          {isLoading ? 'Teste...' : 'Verbindung testen'}
        </Text>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>💡 Troubleshooting</Text>
        <Text style={styles.infoText}>
          • Backend läuft auf dem Server?{'\n'}
          • IP-Adresse in config/api.ts korrekt?{'\n'}
          • Firewall blockiert Port 3001?{'\n'}
          • Handy im gleichen Netzwerk?
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  urlText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 6,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  testButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
});