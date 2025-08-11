import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../navigation/AuthNavigator';
import { Check, X, ExternalLink } from 'lucide-react-native';
import { useAuth } from '../../lib/contexts/AuthContext';

type ConsentScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Consent'>;

export default function ConsentScreen() {
  const navigation = useNavigation<ConsentScreenNavigationProp>();
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const auth = useAuth();

  // Monitor consent status and trigger navigation when consent is no longer needed
  useEffect(() => {
    if (auth && !auth.needsConsent()) {
      console.log('🎉 ConsentScreen: Consent no longer needed, navigation should be handled by AppContent');
      // The AppContent component will automatically handle the navigation
      // This effect is just for logging/debugging
    }
  }, [auth?.user?.profile?.analytics_consent, auth]);

  const handleSaveConsent = async () => {
    if (!privacyPolicyAccepted) {
      Alert.alert('Required', 'Please accept the Privacy Policy to continue');
      return;
    }

    if (!auth?.updateProfile) {
      Alert.alert('Error', 'Authentication service not available');
      return;
    }

    setLoading(true);

    try {
      // Simple direct update with explicit values
      const updateResult = await auth.updateProfile({
        analytics_consent: true,
        marketing_consent: marketingConsent,
      });

      if (updateResult.error) {
        console.error('Update error:', updateResult.error);
        Alert.alert('Error', 'Settings could not be saved');
        return;
      }

      // Force refresh the user profile to get updated data
      await auth.refreshProfile();
      
      console.log('✅ Consent saved and profile refreshed');
      console.log('🔍 Current consent status:', !auth.needsConsent() ? 'Complete' : 'Still needed');
      
      // The AppContent component will automatically switch to RootNavigator
      // when needsConsent() returns false. No manual navigation needed here.
      
    } catch (error) {
      console.error('Error saving consent:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://app.vysnlighting.com/datenschutz');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo}
          />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Privacy Settings</Text>
          <Text style={styles.subtitle}>
            Please choose your privacy preferences. You can change these settings at any time in the app settings.
          </Text>
        </View>

        <View style={styles.consentContainer}>
          <View style={styles.consentSection}>
            <TouchableOpacity 
              style={styles.consentOption}
              onPress={() => setMarketingConsent(!marketingConsent)}
            >
              <View style={styles.consentHeader}>
                <View style={[styles.checkbox, marketingConsent && styles.checkboxChecked]}>
                  {marketingConsent && <Check size={16} color="#ffffff" />}
                </View>
                <Text style={styles.consentTitle}>Marketing & Newsletter</Text>
              </View>
              <Text style={styles.consentDescription}>
                Receive personalized content and updates:
              </Text>
              <View style={styles.bulletContainer}>
                <Text style={styles.bulletPoint}>• New products and updates</Text>
                <Text style={styles.bulletPoint}>• Exclusive offers and discounts</Text>
                <Text style={styles.bulletPoint}>• Event invitations and training</Text>
                <Text style={styles.bulletPoint}>• Industry news and trends</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.privacyPolicySection}>
          <TouchableOpacity 
            style={styles.privacyPolicyContainer}
            onPress={() => setPrivacyPolicyAccepted(!privacyPolicyAccepted)}
          >
            <View style={[styles.checkbox, privacyPolicyAccepted && styles.checkboxChecked]}>
              {privacyPolicyAccepted && <Check size={16} color="#ffffff" />}
            </View>
            <Text style={styles.privacyPolicyText}>
              I accept the{' '}
              <Text style={styles.privacyLink} onPress={openPrivacyPolicy}>
                Privacy Policy
              </Text>
              {' *'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.privacyPolicyButton} onPress={openPrivacyPolicy}>
            <ExternalLink size={16} color="#000000" />
            <Text style={styles.privacyPolicyButtonText}>Read Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSaveConsent}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Settings</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            You can change your preferences anytime in the app settings.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  consentContainer: {
    gap: 20,
    marginBottom: 32,
  },
  consentSection: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
  },
  consentOption: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  consentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  consentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  consentDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  bulletContainer: {
    paddingLeft: 8,
  },
  bulletPoint: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 18,
    marginBottom: 2,
  },
  privacyPolicySection: {
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
    gap: 16,
  },
  privacyPolicyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  privacyPolicyText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  privacyLink: {
    color: '#000000',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  privacyPolicyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    gap: 8,
  },
  privacyPolicyButtonText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  buttonContainer: {
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
  },
});