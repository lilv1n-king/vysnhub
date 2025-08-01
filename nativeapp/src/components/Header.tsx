import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, LogOut } from 'lucide-react-native';
import { useAuth } from '../../lib/contexts/AuthContext';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 48,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -16,
  },
  logo: {
    width: 190,
    height: 56,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 6,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 6,
  },
});

interface HeaderProps {
  onSettingsPress?: () => void;
  showLogout?: boolean;
}

export default function Header({ onSettingsPress, showLogout = true }: HeaderProps) {
  const auth = useAuth();

  const handleLogout = () => {
    if (!auth) return;

    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your VYSN account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const { error } = await auth.signOut();
            if (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.headerActions}>
          {showLogout && (
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <LogOut size={20} color="#ef4444" />
            </TouchableOpacity>
          )}
          
          {onSettingsPress && (
            <TouchableOpacity
              onPress={onSettingsPress}
              style={styles.settingsButton}
            >
              <Settings size={24} color="#000" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}