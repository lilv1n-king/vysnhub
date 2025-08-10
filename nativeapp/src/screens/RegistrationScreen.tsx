import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { useAuth } from '../../lib/contexts/AuthContext';
import { API_BASE_URL } from '../../lib/config/api';
import { Eye, EyeOff, User, Mail, Lock, Key, CheckCircle, ArrowLeft, Check } from 'lucide-react-native';
import { Linking } from 'react-native';

type Props = NativeStackScreenProps<AuthStackParamList, 'Registration'>;

const RegistrationScreen: React.FC<Props> = ({ navigation }) => {
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  
  // Consent states
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Privacy Policy öffnen
  const openPrivacyPolicy = () => {
    Linking.openURL('https://vysn.de/datenschutz');
  };

  // UI state
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Refs for form navigation
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email || !formData.email.includes('@')) {
      newErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Vorname ist erforderlich';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Passwort muss mindestens 6 Zeichen lang sein';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle registration
  const handleRegistration = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Direkt an Backend schicken ohne Auto-Login
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          marketing_consent: marketingConsent,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Direkt zur EmailVerification navigieren ohne Alert
        navigation.navigate('EmailVerification', { 
          email: formData.email,
          password: formData.password 
        });
      } else {
        Alert.alert('❌ Fehler', result.error || 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      }
    } catch (error) {
      Alert.alert('Fehler', 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/logo.png')} 
                style={styles.logo}
              />
            </View>



            <View style={styles.form}>


              {/* Email */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>E-Mail-Adresse *</Text>
                <TextInput
                  ref={emailRef}
                  style={[
                    styles.textInput,
                    focusedField === 'email' && styles.textInputFocused,
                    errors.email && { borderColor: '#ef4444' }
                  ]}
                  value={formData.email}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, email: text }));
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  onSubmitEditing={() => firstNameRef.current?.focus()}
                  autoFocus={true}
                  placeholder="ihre.email@example.com"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* First Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Vorname *</Text>
                <TextInput
                  ref={firstNameRef}
                  style={[
                    styles.textInput,
                    focusedField === 'firstName' && styles.textInputFocused,
                    errors.firstName && { borderColor: '#ef4444' }
                  ]}
                  value={formData.firstName}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, firstName: text }));
                    if (errors.firstName) setErrors(prev => ({ ...prev, firstName: '' }));
                  }}
                  onFocus={() => setFocusedField('firstName')}
                  onBlur={() => setFocusedField(null)}
                  onSubmitEditing={() => lastNameRef.current?.focus()}
                  placeholder="Ihr Vorname"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                  autoComplete="given-name"
                  autoCorrect={false}
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
                {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
              </View>

              {/* Last Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nachname (optional)</Text>
                <TextInput
                  ref={lastNameRef}
                  style={[
                    styles.textInput,
                    focusedField === 'lastName' && styles.textInputFocused
                  ]}
                  value={formData.lastName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                  onFocus={() => setFocusedField('lastName')}
                  onBlur={() => setFocusedField(null)}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  placeholder="Ihr Nachname"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                  autoComplete="family-name"
                  autoCorrect={false}
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Passwort *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    ref={passwordRef}
                    style={[
                      styles.textInput,
                      { paddingRight: 56 },
                      focusedField === 'password' && styles.textInputFocused,
                      errors.password && { borderColor: '#ef4444' }
                    ]}
                    value={formData.password}
                    onChangeText={(text) => {
                      setFormData(prev => ({ ...prev, password: text }));
                      if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                    }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                    placeholder="Mindestens 6 Zeichen"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#6b7280" />
                    ) : (
                      <Eye size={20} color="#6b7280" />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Passwort bestätigen *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    ref={confirmPasswordRef}
                    style={[
                      styles.textInput,
                      { paddingRight: 56 },
                      focusedField === 'confirmPassword' && styles.textInputFocused,
                      errors.confirmPassword && { borderColor: '#ef4444' }
                    ]}
                    value={formData.confirmPassword}
                    onChangeText={(text) => {
                      setFormData(prev => ({ ...prev, confirmPassword: text }));
                      if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={handleRegistration}
                    placeholder="Passwort wiederholen"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showConfirmPassword}
                    autoComplete="new-password"
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyType="done"
                    blurOnSubmit={true}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#6b7280" />
                    ) : (
                      <Eye size={20} color="#6b7280" />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>

              {/* Datenschutz & Marketing */}
              <View style={styles.consentSection}>
                {/* Datenschutzerklärung (erforderlich) */}
                <View style={styles.privacyNotice}>
                  <Text style={styles.privacyText}>
                    Mit der Registrierung akzeptieren Sie unsere{' '}
                    <Text style={styles.privacyLink} onPress={() => openPrivacyPolicy()}>
                      Datenschutzerklärung
                    </Text>
                    . Wir verarbeiten Ihre Daten zur Bereitstellung unserer Dienste und anonyme Nutzungsanalyse zur Verbesserung der App.
                  </Text>
                </View>

                {/* Marketing Consent (optional) */}
                <TouchableOpacity 
                  style={styles.consentOption}
                  onPress={() => setMarketingConsent(!marketingConsent)}
                >
                  <View style={[styles.checkbox, marketingConsent && styles.checkboxChecked]}>
                    {marketingConsent && <Check size={16} color="#ffffff" />}
                  </View>
                  <View style={styles.consentText}>
                    <Text style={styles.consentTitle}>Newsletter & Marketing</Text>
                    <Text style={styles.consentDescription}>
                      Produktneuheiten, Angebote und hilfreiche Beleuchtungs-Tipps per E-Mail erhalten (optional)
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                style={[styles.registerButton, loading && { opacity: 0.7 }]}
                onPress={handleRegistration}
                disabled={loading}
              >
                                 {loading ? (
                   <ActivityIndicator size="small" color="#ffffff" />
                 ) : (
                   <Text style={styles.registerButtonText}>Account erstellen</Text>
                 )}
              </TouchableOpacity>
            </View>

            {/* Back to Login */}
            <View style={styles.loginSection}>
              <Text style={styles.loginText}>
                Bereits ein Konto?
              </Text>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate('Login')}
              >
                <ArrowLeft size={20} color="#374151" />
                <Text style={styles.loginButtonText}>Zurück zum Login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 0,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },

  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  textInputFocused: {
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 12,
    padding: 4,
  },
  registerButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loginSection: {
    marginTop: 40,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  // Datenschutz & Marketing Consent Styles
  consentSection: {
    marginTop: 16,
    gap: 12,
  },
  privacyNotice: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  privacyText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  privacyLink: {
    color: '#000000',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  consentOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
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
  consentText: {
    flex: 1,
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  consentDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});

export default RegistrationScreen;
