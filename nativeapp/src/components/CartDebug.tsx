import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../lib/contexts/AuthContext';
import { useCart } from '../../lib/contexts/CartContext';
import cartApiService from '../../lib/services/cartApiService';
import { Bug, User, ShoppingCart, RefreshCw } from 'lucide-react-native';

export default function CartDebug() {
  const auth = useAuth();
  const { items, loading, syncWithBackend } = useCart();

  const showDebugInfo = () => {
    const debugInfo = {
      'User Status': auth?.user ? 'Eingeloggt' : 'Nicht eingeloggt',
      'User ID': auth?.user?.id || 'Keine',
      'Access Token': auth?.accessToken ? 'Vorhanden' : 'Nicht vorhanden',
      'Token Length': auth?.accessToken?.length || 0,
      'Token Preview': auth?.accessToken ? auth.accessToken.substring(0, 20) + '...' : 'Keine',
      'Cart Items': items.length,
      'Loading': loading ? 'Ja' : 'Nein',
      'Auth Loading': auth?.loading ? 'Ja' : 'Nein',
      'Auth Initialized': auth?.initialized ? 'Ja' : 'Nein',
    };

    const debugText = Object.entries(debugInfo)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    Alert.alert('🐛 Cart Debug Info', debugText);
  };

  const testCartApiDirectly = async () => {
    try {
      const result = await cartApiService.getCart(
        auth?.accessToken || undefined,
        'test-session-' + Date.now()
      );

      Alert.alert(
        result.success ? '✅ API Test OK' : '❌ API Test Failed',
        JSON.stringify(result, null, 2)
      );
    } catch (error) {
      Alert.alert('❌ API Test Error', String(error));
    }
  };

  const manualSync = async () => {
    try {
      await syncWithBackend();
      Alert.alert('✅ Sync Complete', 'Warenkorb wurde synchronisiert');
    } catch (error) {
      Alert.alert('❌ Sync Failed', String(error));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Bug size={24} color="#3B82F6" />
        <Text style={styles.title}>Cart Debug</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <User size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            User: {auth?.user ? '✅ Eingeloggt' : '❌ Nicht eingeloggt'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <ShoppingCart size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            Cart: {items.length} Items {loading ? '(Lädt...)' : ''}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <RefreshCw size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            Token: {auth?.accessToken ? '✅ Vorhanden' : '❌ Fehlt'}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={showDebugInfo}>
          <Text style={styles.buttonText}>Debug Info anzeigen</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testCartApiDirectly}>
          <Text style={styles.buttonText}>API direkt testen</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={manualSync}>
          <Text style={styles.buttonText}>Manueller Sync</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.problemContainer}>
        <Text style={styles.problemTitle}>🚨 Bekannte Probleme:</Text>
        <Text style={styles.problemText}>
          • 401 Auth Error: Token ungültig/abgelaufen{'\n'}
          • Cart Migration schlägt fehl aber normaler Cart funktioniert{'\n'}
          • Lösung: Lokaler Cart wird verwendet, Backend-Sync optional
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#1F2937',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  problemContainer: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  problemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  problemText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
});