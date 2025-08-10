import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Shield, X, ExternalLink, Check } from 'lucide-react-native';
import Button from './ui/Button';
import { privacyService } from '../../lib/services/privacyService';
import * as Localization from 'expo-localization';

interface PrivacyConsentModalProps {
  visible: boolean;
  onConsentGiven: (granted: boolean) => void;
  onClose?: () => void;
  isFirstTime?: boolean;
}

const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({
  visible,
  onConsentGiven,
  onClose,
  isFirstTime = true,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [privacyPolicy, setPrivacyPolicy] = useState<string>('');
  const [showFullPolicy, setShowFullPolicy] = useState(false);


  useEffect(() => {
    if (visible) {
      loadPrivacyPolicy();
    }
  }, [visible]);

  const loadPrivacyPolicy = async () => {
    try {
      // Detect user's language/region for automatic language selection
      const locale = Localization.getLocales()[0];
      const language = getLanguageFromLocale(locale);
      
      const policy = await privacyService.getPrivacyPolicy(language);
      setPrivacyPolicy(policy.content);
    } catch (error) {
      console.error('Error loading privacy policy:', error);
      setPrivacyPolicy(t('privacy.policyLoadError'));
    }
  };

  // Determine language based on locale (German for DACH region, English otherwise)
  const getLanguageFromLocale = (locale: any): string => {
    const countryCode = locale?.regionCode?.toUpperCase();
    const languageCode = locale?.languageCode?.toLowerCase();
    
    // German for Germany, Austria, Switzerland
    if (countryCode === 'DE' || countryCode === 'AT' || countryCode === 'CH' || languageCode === 'de') {
      return 'de';
    }
    
    // Default to English
    return 'en';
  };

  const handleConsent = async (granted: boolean) => {
    if (!granted && isFirstTime) {
      Alert.alert(
        t('privacy.consentRequired'),
        t('privacy.consentRequiredMessage'),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
          {
            text: t('privacy.exitApp'),
            style: 'destructive',
            onPress: () => {
              // In einer realen App würde hier die App beendet
              Alert.alert(t('privacy.appWillClose'));
            },
          },
        ]
      );
      return;
    }

    setLoading(true);
    try {
      await privacyService.recordConsent(granted);
      onConsentGiven(granted);
    } catch (error) {
      console.error('Error recording consent:', error);
      Alert.alert(t('common.error'), t('privacy.consentRecordError'));
    } finally {
      setLoading(false);
    }
  };

  const openPrivacyPolicyLink = () => {
    Linking.openURL('https://vysn.de/datenschutz');
  };

  const renderPrivacyPolicyPreview = () => (
    <View style={styles.policyPreview}>
      <Text style={styles.policyTitle}>{t('privacy.policyTitle')}</Text>
      <Text style={styles.policyPreviewText} numberOfLines={8}>
        {privacyPolicy || t('privacy.policyLoading')}
      </Text>
      <TouchableOpacity
        style={styles.readMoreButton}
        onPress={() => setShowFullPolicy(true)}
      >
        <Text style={styles.readMoreText}>{t('privacy.readMore')}</Text>
        <ExternalLink size={16} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );

  const renderFullPolicy = () => (
    <Modal
      visible={showFullPolicy}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.fullPolicyContainer}>
        <View style={styles.fullPolicyHeader}>
          <Text style={styles.fullPolicyTitle}>{t('privacy.policyTitle')}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowFullPolicy(false)}
          >
            <X size={24} color="#000000" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.fullPolicyContent}>
          <Text style={styles.fullPolicyText}>{privacyPolicy}</Text>
        </ScrollView>
        <View style={styles.fullPolicyFooter}>
          <Button
            onPress={() => setShowFullPolicy(false)}
            variant="secondary"
          >
            {t('common.close')}
          </Button>
        </View>
      </SafeAreaView>
    </Modal>
  );

  if (!visible) return null;

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={onClose}
      >
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ScrollView 
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                {/* VYSN Logo Header */}
                <View style={styles.logoContainer}>
                  <Image 
                    source={require('../../assets/logo.png')} 
                    style={styles.logo}
                  />
                  {onClose && (
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                      <X size={24} color="#000000" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Main Header */}
                <View style={styles.header}>
                  <Shield size={48} color="#000000" />
                  <Text style={styles.title}>
                    {isFirstTime ? t('privacy.welcomeTitle') : t('privacy.updateTitle')}
                  </Text>
                  <Text style={styles.subtitle}>
                    {isFirstTime
                      ? t('privacy.firstTimeIntro')
                      : t('privacy.updateIntro')}
                  </Text>
                </View>

                {/* Key Points */}
                <View style={styles.highlightsSection}>
                  <Text style={styles.highlightsTitle}>{t('privacy.highlightsTitle')}</Text>
                  <View style={styles.highlight}>
                    <Check size={20} color="#000000" />
                    <Text style={styles.highlightText}>{t('privacy.highlight1')}</Text>
                  </View>
                  <View style={styles.highlight}>
                    <Check size={20} color="#000000" />
                    <Text style={styles.highlightText}>{t('privacy.highlight2')}</Text>
                  </View>
                  <View style={styles.highlight}>
                    <Check size={20} color="#000000" />
                    <Text style={styles.highlightText}>{t('privacy.highlight3')}</Text>
                  </View>
                  <View style={styles.highlight}>
                    <Check size={20} color="#000000" />
                    <Text style={styles.highlightText}>{t('privacy.highlight4')}</Text>
                  </View>
                </View>

                {/* Privacy Policy Preview */}
                {renderPrivacyPolicyPreview()}



                {/* External Link */}
                <View style={styles.externalLinkSection}>
                  <TouchableOpacity
                    style={styles.externalLink}
                    onPress={openPrivacyPolicyLink}
                  >
                    <Text style={styles.externalLinkText}>
                      {t('privacy.viewFullPolicy')}
                    </Text>
                    <ExternalLink size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonSection}>
                  <Text style={styles.footerText}>
                    {t('privacy.consentNote')}
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleConsent(true)}
                    disabled={loading}
                  >
                    <Text style={styles.acceptButtonText}>
                      {loading ? t('common.loading') : t('privacy.accept')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.declineButton}
                    onPress={() => handleConsent(false)}
                    disabled={loading}
                  >
                    <Text style={styles.declineButtonText}>
                      {t('privacy.decline')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
      {renderFullPolicy()}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
    marginTop: 20,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  highlightsSection: {
    marginBottom: 32,
  },
  highlightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  highlight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 4,
  },
  highlightText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    lineHeight: 24,
    marginLeft: 12,
  },
  policyPreview: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  policyPreviewText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 14,
    color: '#000000',
    marginRight: 4,
    fontWeight: '500',
  },
  externalLinkSection: {
    marginBottom: 32,
  },
  externalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  externalLinkText: {
    fontSize: 16,
    color: '#374151',
    marginRight: 8,
    fontWeight: '500',
  },
  buttonSection: {
    gap: 16,
  },
  // Granulare Consent-Optionen
  consentOptionsSection: {
    marginBottom: 32,
  },
  consentOptionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  consentOptionsSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  consentOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  consentOptionText: {
    flex: 1,
  },
  consentOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  consentOptionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  acceptButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  declineButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  // Full Policy Modal Styles (updated to match VYSN)
  fullPolicyContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  fullPolicyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  fullPolicyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  fullPolicyContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  fullPolicyText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  fullPolicyFooter: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
});

export default PrivacyConsentModal;
