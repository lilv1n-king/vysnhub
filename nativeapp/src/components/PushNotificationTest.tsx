import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { usePushNotifications } from '../../lib/hooks/usePushNotifications';
import { Bell, Send, TestTube } from 'lucide-react-native';

export default function PushNotificationTest() {
  const {
    expoPushToken,
    notification,
    isRegistered,
    isLoading,
    subscribeToPush,
    sendTestNotification,
    sendLocalNotification,
  } = usePushNotifications();

  const handleSubscribe = async () => {
    const success = await subscribeToPush();
    if (success) {
      Alert.alert('✅ Erfolgreich', 'Push Notifications wurden aktiviert!');
    } else {
      Alert.alert('❌ Fehler', 'Push Notifications konnten nicht aktiviert werden.');
    }
  };

  const handleTestLocal = async () => {
    await sendLocalNotification();
    Alert.alert('📱 Lokaler Test', 'Lokale Notification wird in 2 Sekunden angezeigt.');
  };

  const handleTestRemote = async () => {
    await sendTestNotification();
    Alert.alert('🌐 Remote Test', 'Remote Notification wurde gesendet (falls Backend konfiguriert).');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Bell size={32} color="#3B82F6" />
        <Text style={styles.title}>Push Notifications</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Status:</Text>
        <Text style={[styles.status, { color: isRegistered ? '#10B981' : '#EF4444' }]}>
          {isRegistered ? '✅ Aktiviert' : '❌ Nicht aktiviert'}
        </Text>
      </View>

      {expoPushToken && (
        <View style={styles.tokenContainer}>
          <Text style={styles.label}>Push Token:</Text>
          <Text style={styles.token} numberOfLines={3}>
            {expoPushToken}
          </Text>
        </View>
      )}

      {notification && (
        <View style={styles.notificationContainer}>
          <Text style={styles.label}>Letzte Notification:</Text>
          <Text style={styles.notificationTitle}>{notification.request.content.title}</Text>
          <Text style={styles.notificationBody}>{notification.request.content.body}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleSubscribe}
          disabled={isLoading || isRegistered}
        >
          <Bell size={20} color="white" />
          <Text style={styles.buttonText}>
            {isLoading ? 'Registriere...' : isRegistered ? 'Bereits registriert' : 'Push aktivieren'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleTestLocal}
        >
          <TestTube size={20} color="#3B82F6" />
          <Text style={styles.secondaryButtonText}>Lokaler Test</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleTestRemote}
          disabled={!isRegistered}
        >
          <Send size={20} color={isRegistered ? "#3B82F6" : "#9CA3AF"} />
          <Text style={[styles.secondaryButtonText, { color: isRegistered ? "#3B82F6" : "#9CA3AF" }]}>
            Remote Test
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💡 Information</Text>
        <Text style={styles.infoText}>
          • Push Notifications funktionieren nur auf echten Geräten{'\n'}
          • iOS: Apple Push Notification Service (APNs){'\n'}
          • Android: Firebase Cloud Messaging (FCM){'\n'}
          • Remote Tests benötigen Backend-Konfiguration
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
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#1F2937',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tokenContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  token: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontFamily: 'monospace',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 6,
  },
  notificationContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginTop: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#3730A3',
    marginTop: 4,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoBox: {
    padding: 16,
    backgroundColor: '#FFFBEB',
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