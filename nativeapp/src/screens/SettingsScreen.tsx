import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { 
  User, 
  LogOut, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Globe,
  Edit,
  Save,
  X,
  ArrowLeft,
  Shield,
  FileText,
  ChevronRight,
  Check,
  ShoppingBag
} from 'lucide-react-native';
import { useAuth } from '../../lib/contexts/AuthContext';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { privacyService } from '../../lib/services/privacyService';
import { useTranslation } from 'react-i18next';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  profileCard: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280',
  },
  discountBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  discountText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
  },
  // Field styles matching ProjectDetailScreen
  fieldContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 46,
    justifyContent: 'space-between',
  },
  fieldIcon: {
    marginRight: 12,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  editInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#ffffff',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  editButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  saveButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 6,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cancelButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6b7280',
    borderRadius: 6,
    marginLeft: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  languageToggle: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
    alignItems: 'center',
  },
  languageOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  languageOptionActive: {
    backgroundColor: '#000000',
  },
  languageOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  languageOptionTextActive: {
    color: '#ffffff',
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 32,
    marginBottom: 60,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default function SettingsScreen() {
  const navigation = useNavigation();
  const auth = useAuth();
  const { t, i18n } = useTranslation();
  
  // Safety check - if auth context is not available, show error
  if (!auth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, color: '#ef4444', textAlign: 'center' }}>
          Authentication service not available
        </Text>
      </View>
    );
  }

  const { user, signOut, updateProfile } = auth;
  const [editing, setEditing] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<Record<string, string>>({});

  const [privacyStatus, setPrivacyStatus] = useState<string>('Checking...');

  const profile = user?.profile;
  const currentLanguage = i18n.language;

  // Privacy status laden
  useEffect(() => {
    const loadPrivacyStatus = async () => {
      try {
        const status = await privacyService.getConsentStatus();
        if (status?.hasValidConsent) {
          setPrivacyStatus('Consent given');
        } else {
          setPrivacyStatus('Consent required');
        }
      } catch (error) {
        setPrivacyStatus('Unable to check');
      }
    };

    if (user) {
      loadPrivacyStatus();
    }
  }, [user]);

  const handlePrivacyView = () => {
    Linking.openURL('https://vysn.de/datenschutz');
  };

  const handlePrivacyWithdraw = () => {
    Alert.alert(
      'Withdraw Privacy Consent',
      'Are you sure you want to withdraw your privacy consent? This will log you out of the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            try {
              await privacyService.withdrawConsent();
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to withdraw consent');
            }
          },
        },
      ]
    );
  };

  const handleViewOrders = () => {
    navigation.navigate('OrderHistory');
  };



  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  const handleEdit = (field: string, currentValue: string) => {
    setEditing(field);
    setTempValues({ [field]: currentValue || '' });
  };

  const handleSave = async (field: string) => {
    try {
      const { error } = await updateProfile({ [field]: tempValues[field] });
      
      if (error) {
        Alert.alert('Error', `Failed to update ${field}: ${error.message}`);
      } else {
        setEditing(null);
        setTempValues({});
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setTempValues({});
  };

  const handleLogout = () => {
    Alert.alert(
      t('settings.signOutConfirmTitle'),
      t('settings.signOutConfirmMessage'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        {
          text: t('settings.signOut'),
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert(t('common.error'), t('settings.signOutError'));
            }
          },
        },
      ]
    );
  };

  const getInitials = () => {
    if (!profile?.first_name && !profile?.last_name) return 'U';
    return (profile?.first_name?.[0] || '') + (profile?.last_name?.[0] || '');
  };

  const getFullName = () => {
    if (!profile?.first_name && !profile?.last_name) return 'User';
    return `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
  };

  const renderEditableField = (
    field: string,
    label: string,
    value: string,
    icon: React.ReactNode,
    placeholder?: string
  ) => {
    const isEditing = editing === field;
    
    return (
      <View style={styles.fieldContainer}>
        <View style={styles.fieldRow}>
          <View style={styles.fieldIcon}>{icon}</View>
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>{label}</Text>
            {isEditing ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.editInput}
                  value={tempValues[field] || ''}
                  onChangeText={(text) => setTempValues(prev => ({ ...prev, [field]: text }))}
                  placeholder={placeholder}
                  autoFocus
                />
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => handleSave(field)}
                >
                  <Save size={16} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                >
                  <X size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.fieldValue}>{value || t('settings.notSet')}</Text>
            )}
          </View>
          {!isEditing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEdit(field, value)}
            >
              <Edit size={16} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Header onSettingsPress={() => navigation.goBack()} />
        
        <View style={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={20} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.pageTitle}>{t('settings.title')}</Text>
            </View>
          </View>
          
          <Text style={styles.loadingText}>{t('settings.pleaseSignIn')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header onSettingsPress={() => navigation.goBack()} />
      
      <ScrollView style={styles.scrollContent}>
        {/* Header with back button and title */}
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={20} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.pageTitle}>{t('settings.title')}</Text>
          </View>
        </View>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.profile')}</Text>
          <Card style={styles.profileCard}>
            <CardContent style={{ padding: 0 }}>
              <View style={styles.profileHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials()}</Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.userName}>{getFullName()}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  {profile && profile.discount_percentage > 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>
                        {t('settings.discount', { percentage: profile.discount_percentage })}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.contactInformation')}</Text>
          
          {renderEditableField(
            'first_name',
            t('settings.firstName'),
            profile?.first_name || '',
            <User size={20} color="#6b7280" />,
            'Max'
          )}
          
          {renderEditableField(
            'last_name',
            t('settings.lastName'),
            profile?.last_name || '',
            <User size={20} color="#6b7280" />,
            'Mustermann'
          )}
          
          {renderEditableField(
            'phone',
            t('settings.phoneNumber'),
            profile?.phone || '',
            <Phone size={20} color="#6b7280" />,
            '+49 123 456 7890'
          )}
          
          {renderEditableField(
            'company_name',
            t('settings.company'),
            profile?.company_name || '',
            <Building size={20} color="#6b7280" />,
            'Ihr Unternehmen GmbH'
          )}
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.address')}</Text>
          
          {renderEditableField(
            'address_line_1',
            t('settings.streetAddress'),
            profile?.address_line_1 || '',
            <MapPin size={20} color="#6b7280" />,
            'Musterstraße 123'
          )}
          
          {renderEditableField(
            'city',
            t('settings.city'),
            profile?.city || '',
            <MapPin size={20} color="#6b7280" />,
            'Berlin'
          )}
          
          {renderEditableField(
            'postal_code',
            t('settings.postalCode'),
            profile?.postal_code || '',
            <MapPin size={20} color="#6b7280" />,
            '10115'
          )}
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.appSettings')}</Text>
          
          <View style={styles.fieldContainer}>
            <View style={styles.fieldRow}>
              <View style={styles.fieldIcon}>
                <Globe size={20} color="#6b7280" />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>{t('settings.language')}</Text>
                <View style={styles.languageToggle}>
                  <TouchableOpacity
                    style={[
                      styles.languageOption,
                      currentLanguage === 'de' && styles.languageOptionActive
                    ]}
                    onPress={() => handleLanguageChange('de')}
                  >
                    <Text style={[
                      styles.languageOptionText,
                      currentLanguage === 'de' && styles.languageOptionTextActive
                    ]}>
                      Deutsch
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.languageOption,
                      currentLanguage === 'en' && styles.languageOptionActive
                    ]}
                    onPress={() => handleLanguageChange('en')}
                  >
                    <Text style={[
                      styles.languageOptionText,
                      currentLanguage === 'en' && styles.languageOptionTextActive
                    ]}>
                      English
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Privacy & Data Protection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.privacy')}</Text>
          
          <TouchableOpacity style={styles.fieldContainer} onPress={handlePrivacyView}>
            <View style={styles.fieldRow}>
              <View style={styles.fieldIcon}>
                <FileText size={20} color="#6b7280" />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>{t('settings.privacyPolicy')}</Text>
                <Text style={styles.fieldValue}>{t('settings.privacyPolicyDescription')}</Text>
              </View>
              <ChevronRight size={20} color="#6b7280" />
            </View>
          </TouchableOpacity>

          <View style={styles.fieldContainer}>
            <View style={styles.fieldRow}>
              <View style={styles.fieldIcon}>
                <Shield size={20} color="#6b7280" />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>{t('settings.consentStatus')}</Text>
                <Text style={[
                  styles.fieldValue, 
                  privacyStatus === 'Consent given' ? { color: '#10b981' } : 
                  privacyStatus === 'Consent required' ? { color: '#f59e0b' } : 
                  { color: '#6b7280' }
                ]}>
                  {privacyStatus === 'Consent given' ? t('settings.consentGiven') :
                   privacyStatus === 'Consent required' ? t('settings.consentRequired') :
                   t('settings.consentChecking')}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.fieldContainer} onPress={handlePrivacyWithdraw}>
            <View style={styles.fieldRow}>
              <View style={styles.fieldIcon}>
                <X size={20} color="#ef4444" />
              </View>
              <View style={styles.fieldContent}>
                <Text style={[styles.fieldLabel, { color: '#ef4444' }]}>{t('settings.withdrawConsent')}</Text>
                <Text style={styles.fieldValue}>{t('settings.withdrawConsentDescription')}</Text>
              </View>
              <ChevronRight size={20} color="#ef4444" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Account & Orders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
          
          <TouchableOpacity style={styles.fieldContainer} onPress={handleViewOrders}>
            <View style={styles.fieldRow}>
              <View style={styles.fieldIcon}>
                <ShoppingBag size={20} color="#6b7280" />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>{t('settings.orderHistory')}</Text>
                <Text style={styles.fieldValue}>{t('settings.orderHistoryDescription')}</Text>
              </View>
              <ChevronRight size={20} color="#6b7280" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>{t('settings.signOut')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}